import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ROOT,loadProject,calculate} from '../../engine/index.js';
import {prepareEvent} from '../../engine/propagation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {createServer} from '../../server.js';

function workspace(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'saved-primary-evidence-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity','assumptions','scenarios'];
 for(const file of [...names.map(n=>`spec/${n}.yaml`),'sources/sources.yaml','data/observed/observations.yaml']) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(ROOT,file)));
 }
 const base=loadProject('production',root);
 const transaction=JSON.parse(fs.readFileSync(path.join(ROOT,'data/events/production/uni-growth-budget-baseline-20260101.json'),'utf8'));
 const updateIds=new Set(transaction.event.updates.map(r=>r.id));
 const file=path.join(root,'data/events/production',`${transaction.event.id}.json`);fs.mkdirSync(path.dirname(file),{recursive:true});
 return {root,base,file,transaction,updateIds};
}
function saveEdited(w,edit) {
 const {transaction,updateIds}=w;edit(transaction.event);
 transaction.snapshot.event={...structuredClone(transaction.event),propagated_nodes:transaction.snapshot.event.propagated_nodes};
 transaction.snapshot.sources=structuredClone(transaction.event.sources);
 transaction.snapshot.inputs=[...transaction.snapshot.inputs.filter(r=>!updateIds.has(r.id)),...structuredClone(transaction.event.updates)];
 for(const [key,classification] of Object.entries({observations:'OBSERVED',assumptions:'ASSUMPTION',scenarios:'SCENARIO'}))transaction.snapshot[key]=transaction.snapshot.inputs.filter(r=>r.classification===classification);
 const {id,...content}=transaction.snapshot;transaction.snapshot.id=fingerprint(content);
 fs.writeFileSync(w.file,JSON.stringify(transaction));return fs.readFileSync(w.file,'utf8');
}

for(const [name,edit,pattern] of [
 ['tier 3 only',e=>{for(const s of e.sources)s.tier=3;},/tier 1 or 2 primary source/],
 ['tier 4 only',e=>{for(const s of e.sources)s.tier=4;},/tier 1 or 2 primary source/],
 ['unknown observation without primary',e=>{e.updates[0].value=null;for(const s of e.sources)s.tier=3;},/tier 1 or 2 primary source/],
 ['assumption posing as research',e=>{e.updates[0].classification='ASSUMPTION';},/only accepts observations/],
 ['scenario posing as research',e=>{e.updates[0].classification='SCENARIO';e.updates[0].scenario='Test-only counterfactual';},/only accepts observations/],
 ['empty observations',e=>{e.updates=[];},/only accepts observations/],
 ['undeclared observation evidence',e=>{e.source_ids=e.source_ids.slice(1);},/must be declared in event sources/]
])test(`saved research rejects ${name} despite matching hashes`,t=>{
 const w=workspace(t),before=saveEdited(w,edit);
 assert.throws(()=>prepareEvent(w.base,w.transaction.event),pattern);
 assert.throws(()=>loadProject('production',w.root),pattern);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

for(const tier of [1,2])test(`saved research accepts declared tier ${tier} metadata without changing its provenance`,t=>{
 const w=workspace(t);saveEdited(w,e=>{for(const s of e.sources)s.tier=tier;});
 const p=loadProject('production',w.root);assert.ok(p.sources.every(s=>s.tier===tier&&!s.fixture));
 assert.equal(p.inputs.at(-1).classification,'OBSERVED');assert.equal(p.inputs.at(-1).value,20e6);
});

test('one declared primary among additional lower-tier sources remains sufficient for research',t=>{
 const w=workspace(t);saveEdited(w,e=>{for(const s of e.sources)s.tier=3;e.sources[0].tier=2;});
 const p=loadProject('production',w.root);assert.equal(p.sources.filter(s=>s.tier<=2).length,1);
});

test('a primary-backed null observation remains unknown rather than a manufactured fact',t=>{
 const w=workspace(t);saveEdited(w,e=>{e.updates[0].value=null;e.updates[0].confidence='unknown';});
 const p=loadProject('production',w.root);assert.equal(calculate(p).metrics['uni.growth_budget'].value,null);
 assert.equal(p.inputs.at(-1).confidence,'unknown');
});

test('generic completed events retain their distinct credible-source rule',t=>{
 const w=workspace(t);saveEdited(w,e=>{e.type='governance';for(const s of e.sources)s.tier=3;});
 assert.equal(loadProject('production',w.root).sources[0].tier,3);
 assert.doesNotThrow(()=>prepareEvent(w.base,w.transaction.event));
});

test('API rejects saved non-primary research and leaves its journal bytes unchanged',async t=>{
 const w=workspace(t),before=saveEdited(w,e=>{for(const s of e.sources)s.tier=3;});
 const server=createServer(w.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state?mode=production`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/tier 1 or 2 primary source/);
  assert.equal(fs.readFileSync(w.file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('committed research and generic source events retain financial/thesis replay and immutable hashes',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),history=readSnapshots(p.root,mode),before=fingerprint(history);
  const replay=calculate(p,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(replay.metrics,history.at(-1).metrics);assert.deepEqual(replay.thesis,history.at(-1).thesis);
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
