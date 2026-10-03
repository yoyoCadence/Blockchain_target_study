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
 const p=loadProject(mode),root=fs.mkdtempSync(path.join(os.tmpdir(),'saved-event-evidence-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of [...names.map(n=>`spec/${n}.yaml`),...(mode==='production'?['spec/assumptions.yaml','spec/scenarios.yaml']:[])]) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(p.root,file)));
 }
 const inputFile=path.join(root,mode==='fixture'?'data/fixtures/inputs.yaml':'data/observed/observations.yaml');
 fs.mkdirSync(path.dirname(inputFile),{recursive:true});
 fs.writeFileSync(inputFile,JSON.stringify({version:1,metrics:mode==='fixture'?p.inputs:p.inputs.filter(r=>r.classification==='OBSERVED')}));
 const sourceFile=path.join(root,mode==='fixture'?'data/fixtures/sources.yaml':'sources/sources.yaml');
 fs.mkdirSync(path.dirname(sourceFile),{recursive:true});fs.writeFileSync(sourceFile,JSON.stringify({version:1,sources:p.sources}));
 const e={id:'test-only-saved-evidence',type:'protocol_fee_change',status:'completed',fixture:mode==='fixture',
  as_of_date:'2026-10-03',effective_date:'2025-12-31',source_ids:[p.sources[0].id],
  affected_nodes:['UNI'],reason:'Test-only saved event evidence',updates:[]};
 const prepared=prepareEvent(p,e),transaction={event:e,snapshot:prepared.snapshot};
 const file=path.join(root,'data/events',mode,`${e.id}.json`);fs.mkdirSync(path.dirname(file),{recursive:true});
 return {p,root,file,transaction};
}
function saveEdited({file,transaction},edit) {
 edit(transaction.event);const propagated_nodes=transaction.snapshot.event.propagated_nodes;
 transaction.snapshot.event={...structuredClone(transaction.event),propagated_nodes};
 const {id,...content}=transaction.snapshot;transaction.snapshot.id=fingerprint(content);
 fs.writeFileSync(file,JSON.stringify(transaction));return fs.readFileSync(file,'utf8');
}

for(const mode of ['fixture','production'])test(`${mode} saved completed event rejects future knowledge even with matching hashes`,t=>{
 const w=workspace(t,mode),before=saveEdited(w,e=>{e.as_of_date='2099-01-01';e.effective_date='2099-01-01';});
 assert.throws(()=>loadProject(mode,w.root),/Event as-of cannot be in the future/);
 assert.equal(fs.readFileSync(w.file,'utf8'),before);
});

for(const effective of [null,'2026-10-04'])test(`saved completed event requires a past effective date: ${effective}`,t=>{
 const w=workspace(t);saveEdited(w,e=>{if(effective===null)delete e.effective_date;else e.effective_date=effective;});
 assert.throws(()=>loadProject('fixture',w.root),/Live\/completed event needs a past effective date/);
});

test('saved source-only event cannot use evidence published after its knowledge date',t=>{
 const w=workspace(t);saveEdited(w,e=>{e.as_of_date='2024-01-01';e.effective_date='2023-12-31';});
 assert.throws(()=>loadProject('fixture',w.root),/Event source published after event as-of/);
});

test('saved source-only event cannot name an unknown source',t=>{
 const w=workspace(t);saveEdited(w,e=>{e.source_ids=['test-only-nonexistent-source'];});
 assert.throws(()=>loadProject('fixture',w.root),/Unknown event source/);
});

test('saved event provenance cannot disagree with the workspace',t=>{
 const w=workspace(t);saveEdited(w,e=>{e.fixture=false;});
 assert.throws(()=>loadProject('fixture',w.root),/Event data mode mismatch/);
});

for(const status of ['planned','announced','cancelled'])test(`saved ${status} status cannot append an OBSERVED update`,t=>{
 const w=workspace(t),old=w.p.inputs.find(r=>r.metric_id==='uni.price');
 const update={...old,id:'test-only-observed-plan',version:old.version+1,supersedes:old.id};
 saveEdited(w,e=>{e.status=status;e.updates=[update];});
 assert.throws(()=>loadProject('fixture',w.root),/Planned\/announced event cannot create live observations/);
});

test('saved production completed event requires primary or credible declared evidence',t=>{
 const w=workspace(t,'production');saveEdited(w,e=>{e.source_ids=[];});
 assert.throws(()=>loadProject('production',w.root),/primary or credible evidence/);
});

test('saved planned effective date may remain in the future with explicit scenario updates',t=>{
 const w=workspace(t),old=w.p.inputs.find(r=>r.metric_id==='uni.price');
 const update={...old,id:'test-only-saved-scenario',version:old.version+1,supersedes:old.id,classification:'SCENARIO',scenario:'Test-only announced counterfactual'};
 saveEdited(w,e=>{e.status='planned';e.effective_date='2099-01-01';e.updates=[update];});
 const loaded=loadProject('fixture',w.root);assert.equal(loaded.inputs.at(-1).classification,'SCENARIO');
 assert.equal(readSnapshots(w.root,'fixture')[0].event.effective_date,'2099-01-01');
});

test('saved retrospective event may retain a historical as-of before later source retrieval',t=>{
 const w=workspace(t,'production');saveEdited(w,e=>{e.as_of_date='2026-01-01';e.effective_date='2025-12-27';e.source_ids=['ethereum-unification-execution-20251227-v2'];});
 const loaded=loadProject('production',w.root);assert.equal(loaded.mode,'production');
 assert.equal(readSnapshots(w.root,'production')[0].event.as_of_date,'2026-01-01');
});

test('API refuses a future completed journal and leaves its bytes unchanged',async t=>{
 const w=workspace(t),before=saveEdited(w,e=>{e.as_of_date='2099-01-01';e.effective_date='2099-01-01';});
 const server=createServer(w.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/Event as-of cannot be in the future/);
  assert.equal(fs.readFileSync(w.file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('all saved fixture/production evidence loads and financial/thesis replay retains original history',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),history=readSnapshots(p.root,mode),latest=history.at(-1),before=fingerprint(history);
  const replay=calculate(p,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(replay.metrics,latest.metrics);assert.deepEqual(replay.thesis,latest.thesis);
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
