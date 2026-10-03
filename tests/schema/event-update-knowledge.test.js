import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,calculate} from '../../engine/index.js';
import {prepareEvent} from '../../engine/propagation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {createServer} from '../../server.js';

function workspace(t,mode='fixture') {
 const p=loadProject(mode),root=fs.mkdtempSync(path.join(os.tmpdir(),'event-update-knowledge-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of [...names.map(n=>`spec/${n}.yaml`),...(mode==='production'?['spec/assumptions.yaml','spec/scenarios.yaml']:[])]) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(p.root,file)));
 }
 const inputFile=path.join(root,mode==='fixture'?'data/fixtures/inputs.yaml':'data/observed/observations.yaml');fs.mkdirSync(path.dirname(inputFile),{recursive:true});
 fs.writeFileSync(inputFile,JSON.stringify({version:1,metrics:mode==='fixture'?p.inputs:p.inputs.filter(r=>r.classification==='OBSERVED')}));
 const sources=structuredClone(p.sources);if(mode==='fixture')for(const source of sources)source.date='2025-01-01';
 const sourceFile=path.join(root,mode==='fixture'?'data/fixtures/sources.yaml':'sources/sources.yaml');fs.mkdirSync(path.dirname(sourceFile),{recursive:true});fs.writeFileSync(sourceFile,JSON.stringify({version:1,sources}));
 const base=loadProject(mode,root),event={id:'test-only-update-knowledge',type:'governance',status:'completed',fixture:mode==='fixture',
  as_of_date:'2026-10-03',effective_date:'2025-12-31',source_ids:[mode==='fixture'?sources[0].id:'ethereum-unification-execution-20251227-v2'],affected_nodes:['UNI','XLM'],reason:'Test-only event update knowledge',updates:[]};
 const transaction={event,snapshot:prepareEvent(base,event).snapshot},file=path.join(root,'data/events',mode,`${event.id}.json`);fs.mkdirSync(path.dirname(file),{recursive:true});
 return {root,base,transaction,file,mode};
}
function update(w,metric,changes={}) {
 const old=w.base.inputs.find(r=>r.metric_id===metric&&!w.base.inputs.some(next=>next.supersedes===r.id));
 return {...structuredClone(old),id:`test-only-${metric}`,version:old.version+1,supersedes:old.id,...changes};
}
function saveEdited(w,edit) {
 edit(w.transaction.event);const snapshot=w.transaction.snapshot;
 snapshot.event={...structuredClone(w.transaction.event),propagated_nodes:snapshot.event.propagated_nodes};
 snapshot.inputs.push(...structuredClone(w.transaction.event.updates));
 for(const [key,classification] of Object.entries({observations:'OBSERVED',assumptions:'ASSUMPTION',scenarios:'SCENARIO'}))snapshot[key]=snapshot.inputs.filter(r=>r.classification===classification);
 const {id,...content}=snapshot;snapshot.id=fingerprint(content);fs.writeFileSync(w.file,JSON.stringify(w.transaction));return fs.readFileSync(w.file,'utf8');
}

for(const mode of ['fixture','production'])for(const kind of ['OBSERVED','UNKNOWN_OBSERVED','ASSUMPTION','SCENARIO'])test(`${mode} saved ${kind} update cannot postdate event knowledge`,t=>{
 const w=workspace(t,mode),classification=kind==='UNKNOWN_OBSERVED'?'OBSERVED':kind;
 const record=update(w,mode==='fixture'?'uni.price':'uni.growth_budget',{classification,as_of_date:'2026-10-03',
  ...(kind==='UNKNOWN_OBSERVED'?{value:null,confidence:'unknown'}:{}),rationale:'Test-only chronology',...(classification==='SCENARIO'?{scenario:'Test-only counterfactual'}:{})});
 const before=saveEdited(w,e=>{e.as_of_date='2026-01-01';e.updates=[record];});
 assert.throws(()=>prepareEvent(w.base,w.transaction.event),/Update after event as-of date/);
 assert.throws(()=>loadProject(mode,w.root),/Update after event as-of date/);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

test('future scenario knowledge cannot enter an earlier planned event',t=>{
 const w=workspace(t),record=update(w,'uni.price',{classification:'SCENARIO',scenario:'Test-only future plan',as_of_date:'2099-01-01'});
 saveEdited(w,e=>{e.status='planned';e.effective_date='2099-01-01';e.updates=[record];});
 assert.throws(()=>loadProject('fixture',w.root),/Update after event as-of date/);
});

for(const metric of ['xlm.dtcc_live','xlm.dtcc_material'])for(const status of ['planned','announced','cancelled'])test(`saved ${status} cannot make ${metric} live via a scenario`,t=>{
 const w=workspace(t),record=update(w,metric,{value:1,classification:'SCENARIO',scenario:'Test-only DTCC counterfactual',as_of_date:'2026-01-01'});
 saveEdited(w,e=>{e.status=status;e.effective_date='2099-01-01';e.updates=[record];});
 assert.throws(()=>prepareEvent(w.base,w.transaction.event),/Planned DTCC cannot become live\/material/);
 assert.throws(()=>loadProject('fixture',w.root),/Planned DTCC cannot become live\/material/);
});

for(const status of ['live','completed'])test(`saved ${status} retains the existing DTCC state update path`,t=>{
 const w=workspace(t),record=update(w,'xlm.dtcc_live',{value:1,classification:'SCENARIO',scenario:'Test-only existing live path',as_of_date:'2026-01-01'});
 saveEdited(w,e=>{e.status=status;e.updates=[record];});
 assert.equal(loadProject('fixture',w.root).inputs.at(-1).value,1);
});

test('planned future effective date retains an explicitly not-live DTCC scenario',t=>{
 const w=workspace(t),record=update(w,'xlm.dtcc_live',{value:0,classification:'SCENARIO',scenario:'Test-only not-live plan',as_of_date:'2026-01-01'});
 saveEdited(w,e=>{e.status='planned';e.effective_date='2099-01-01';e.updates=[record];});
 assert.equal(loadProject('fixture',w.root).inputs.at(-1).value,0);
 assert.equal(readSnapshots(w.root,'fixture')[0].event.effective_date,'2099-01-01');
});

test('same-day production observation remains valid at the event knowledge boundary',t=>{
 const w=workspace(t,'production'),record=update(w,'uni.growth_budget',{as_of_date:'2026-01-01'});
 saveEdited(w,e=>{e.as_of_date='2026-01-01';e.updates=[record];});
 assert.equal(loadProject('production',w.root).inputs.at(-1).as_of_date,'2026-01-01');
});

test('API rejects a later saved update and leaves the journal unchanged',async t=>{
 const w=workspace(t,'production'),record=update(w,'uni.growth_budget',{as_of_date:'2026-10-03'});
 const before=saveEdited(w,e=>{e.as_of_date='2026-01-01';e.updates=[record];});
 const server=createServer(w.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state?mode=production`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/Update after event as-of date/);
  assert.equal(fs.readFileSync(w.file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('committed knowledge/state evidence and financial/thesis replay preserve every history hash',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),history=readSnapshots(p.root,mode),before=fingerprint(history);
  const result=calculate(p,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(result.metrics,history.at(-1).metrics);assert.deepEqual(result.thesis,history.at(-1).thesis);
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
