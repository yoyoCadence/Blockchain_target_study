import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,calculate,selectInputs} from '../../engine/index.js';
import {prepareEvent,applyEvent,affectedNodes} from '../../engine/propagation/index.js';
import {fingerprint,readSnapshots,verifySnapshot} from '../../engine/snapshots.js';
import {createServer} from '../../server.js';

function workspace(t,mode='fixture',affected=['UNI']) {
 const p=loadProject(mode),root=fs.mkdtempSync(path.join(os.tmpdir(),'event-scope-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of [...names.map(n=>`spec/${n}.yaml`),...(mode==='production'?['spec/assumptions.yaml','spec/scenarios.yaml']:[])]) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(p.root,file)));
 }
 const inputFile=path.join(root,mode==='fixture'?'data/fixtures/inputs.yaml':'data/observed/observations.yaml');
 fs.mkdirSync(path.dirname(inputFile),{recursive:true});fs.writeFileSync(inputFile,JSON.stringify({version:1,metrics:mode==='fixture'?p.inputs:p.inputs.filter(r=>r.classification==='OBSERVED')}));
 const sourceFile=path.join(root,mode==='fixture'?'data/fixtures/sources.yaml':'sources/sources.yaml');
 fs.mkdirSync(path.dirname(sourceFile),{recursive:true});fs.writeFileSync(sourceFile,JSON.stringify({version:1,sources:p.sources}));
 const base=loadProject(mode,root),event={id:'test-only-scope',type:'governance',status:'completed',fixture:mode==='fixture',
  as_of_date:'2026-10-03',effective_date:'2025-12-31',source_ids:[p.sources[0].id],affected_nodes:affected,reason:'Test-only scope evidence',updates:[]};
 const transaction={event,snapshot:prepareEvent(base,event).snapshot},file=path.join(root,'data/events',mode,`${event.id}.json`);
 fs.mkdirSync(path.dirname(file),{recursive:true});return {root,base,transaction,file,mode};
}
function update(w,{value=1}={}) {
 const metric=w.mode==='fixture'?'uni.price':'uni.growth_budget',old=selectInputs(w.base.inputs)[metric];
 return {...structuredClone(old),id:'test-only-scope-update',version:old.version+1,supersedes:old.id,value};
}
function save(w,edit=()=>{}) {
 edit(w.transaction);const snapshot=w.transaction.snapshot;
 snapshot.event={...structuredClone(w.transaction.event),propagated_nodes:snapshot.event.propagated_nodes};
 snapshot.inputs.push(...structuredClone(w.transaction.event.updates));
 for(const [key,classification] of Object.entries({observations:'OBSERVED',assumptions:'ASSUMPTION',scenarios:'SCENARIO'}))snapshot[key]=snapshot.inputs.filter(r=>r.classification===classification);
 const {id,...content}=snapshot;snapshot.id=fingerprint(content);verifySnapshot(snapshot);
 fs.writeFileSync(w.file,JSON.stringify(w.transaction));return fs.readFileSync(w.file,'utf8');
}

for(const mode of ['fixture','production'])test(`${mode} new and saved events reject unknown affected nodes even with matching hashes`,t=>{
 const w=workspace(t,mode),before=save(w,tx=>{tx.event.affected_nodes=['UNKNOWN_NODE'];tx.snapshot.event.propagated_nodes=['UNKNOWN_NODE'];});
 assert.throws(()=>prepareEvent(w.base,w.transaction.event),/Unknown affected node/);
 assert.throws(()=>loadProject(mode,w.root),/Unknown affected node/);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

for(const mode of ['fixture','production'])for(const value of [1,null])test(`${mode} saved update ${value} cannot target an unrelated asset`,t=>{
 const w=workspace(t,mode,['XLM']),record=update(w,{value}),before=save(w,tx=>{tx.event.updates=[record];});
 assert.throws(()=>prepareEvent(w.base,w.transaction.event),/outside affected nodes/);
 assert.throws(()=>loadProject(mode,w.root),/outside affected nodes/);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

for(const [name,nodes] of [['missing',undefined],['not an array','UNI'],['omitted',[]],['extra',['UNI','XLM']],['unknown',['UNI','UNKNOWN_NODE']],['duplicate',['UNI','UNI']]])test(`saved propagation cannot be ${name}`,t=>{
 const w=workspace(t),before=save(w,tx=>{tx.snapshot.event.propagated_nodes=nodes;});
 assert.throws(()=>loadProject('fixture',w.root),/propagated nodes do not match/);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

test('saved source-only and dependent updates retain graph reachability without inferring financial transmission',t=>{
 const w=workspace(t,'fixture',['SECZ']),record=update(w);save(w,tx=>{tx.event.updates=[record];});
 assert.equal(loadProject('fixture',w.root).inputs.at(-1).asset,'UNI');
 assert.deepEqual(w.transaction.snapshot.event.propagated_nodes,['SECZ','UNI']);
 assert.deepEqual(w.transaction.snapshot.graph,w.base.graph);
 assert.doesNotThrow(()=>prepareEvent(w.base,w.transaction.event));
});

test('propagation is a set and supports multiple registered roots',t=>{
 const w=workspace(t,'production',['UNI','XLM']);save(w,tx=>{tx.snapshot.event.propagated_nodes.reverse();});
 assert.equal(loadProject('production',w.root).mode,'production');
 assert.deepEqual(new Set(affectedNodes(w.base.graph,['UNI','XLM'])),new Set(['UNI','XLM']));
});

test('historical scope uses saved registries after the current graph changes',t=>{
 const w=workspace(t);save(w);const current=structuredClone(w.base.graph);current.version++;
 current.edges.push({id:'test-only-later-edge',from:'UNI',to:'XLM',type:'enables',economic:false,transmission:'indirect',status:'assumed',source_ids:[],rationale:'Test-only later dependency; no economic evidence'});
 fs.writeFileSync(path.join(w.root,'spec/dependency-graph.yaml'),JSON.stringify(current));
 const loaded=loadProject('fixture',w.root);
 assert.deepEqual(prepareEvent(loaded,w.transaction.event).snapshot.event.propagated_nodes,['UNI','XLM']);
 assert.deepEqual(readSnapshots(w.root,'fixture')[0].event.propagated_nodes,['UNI']);
});

for(const kind of ['schema','endpoint','duplicate'])test(`saved scope registry rejects invalid ${kind}`,t=>{
 const w=workspace(t,'fixture',['SECZ']);save(w,tx=>{
  if(kind==='schema')tx.snapshot.graph.edges[0].economic='true';
  else if(kind==='endpoint')tx.snapshot.graph.edges[0].to='UNKNOWN_NODE';
  else tx.snapshot.assets.assets.push(structuredClone(tx.snapshot.assets.assets[0]));
 });
 assert.throws(()=>loadProject('fixture',w.root),kind==='schema'?/Invalid saved event scope registries/:kind==='endpoint'?/Invalid event scope graph endpoint/:/Duplicate id/);
});

test('failed preparation/apply cannot append an out-of-scope update',t=>{
 const w=workspace(t,'production',['XLM']),record=update(w);w.transaction.event.updates=[record];
 assert.throws(()=>applyEvent(w.base,w.transaction.event),/outside affected nodes/);
 assert.equal(fs.existsSync(w.file),false);assert.deepEqual(loadProject('production',w.root).inputs,w.base.inputs);
});

test('API rejects invalid saved propagation without rewriting its journal',async t=>{
 const w=workspace(t,'production'),before=save(w,tx=>{tx.snapshot.event.propagated_nodes=['UNI','XLM'];});
 const server=createServer(w.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state?mode=production`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/propagated nodes do not match/);
  assert.equal(fs.readFileSync(w.file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('committed scopes and all financial/thesis history remain unchanged',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),history=readSnapshots(p.root,mode),before=fingerprint(history);
  const replay=calculate(p,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis??{}});
  assert.deepEqual(replay.metrics,history.at(-1).metrics);assert.deepEqual(replay.thesis,history.at(-1).thesis);
  for(const snapshot of history)verifySnapshot(snapshot);
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
