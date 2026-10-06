import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {inspectReviewedEvents} from '../../engine/research/event-evidence.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {createServer} from '../../server.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
test('reviewed event inspection retains historical dates, source versions and raw integers without financial writes',()=>{
 const before=fingerprint({project,history,economics:calculate(project)}),records=inspectReviewedEvents(project);
 assert.equal(records.length,history.filter(s=>s.event?.research_review).length);
 for(const record of records) {
  const snapshot=history.find(s=>s.id===record.snapshot_id),{propagated_nodes,...event}=snapshot.event;
  assert.deepEqual(record.event,event);assert.deepEqual(record.propagated_nodes,propagated_nodes);
  assert.deepEqual(record.model_period,snapshot.period);assert.equal(record.parent_id,snapshot.parent_id);
  assert.equal(record.created_at,snapshot.created_at);assert.equal(record.recorded_update_count,event.updates.length);
  assert.deepEqual(record.sources.map(s=>s.id),event.source_ids);
  for(const source of record.sources)assert.deepEqual(source,snapshot.sources.find(s=>s.id===source.id));
 }
 const accrued=records.find(r=>r.id==='uni-v2-fee-accrual-20261004');
 assert.match(accrued.event.reason,/6952494133386631432161/);assert.equal(accrued.sources.length,6);
 assert.equal(accrued.event.as_of_date,'2026-10-04');assert.equal(accrued.model_period.end,'2026-01-01');
 assert.equal(records.find(r=>r.id==='uni-growth-budget-baseline-20260101').recorded_update_count,1);
 accrued.event.reason='in-memory presentation change';accrued.sources[0].title='in-memory title';
 assert.equal(fingerprint({project,history:readSnapshots(project.root,'production'),economics:calculate(project)}),before);
 assert.equal(inspectResearch(project).records.length,11);
});

test('fixture event inspection returns no production evidence and invalid mode is rejected',()=>{
 assert.deepEqual(inspectReviewedEvents(loadProject('fixture')),[]);
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.throws(()=>inspectReviewedEvents({...project,mode:'invalid'}),/Invalid event inspection mode/);
});

test('read-only research API includes every reviewed event, keeps original catalog and refuses event writes',async()=>{
 const before=fingerprint({project,history,economics:calculate(project)});
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/api/research`;
 try {
  const response=await fetch(`${url}?mode=production`),data=await response.json();
  assert.equal(response.status,200);assert.equal(data.records.length,11);assert.equal(data.events.length,history.filter(s=>s.event?.research_review).length);
  assert.equal(data.persisted,false);assert.equal(data.financial_inputs_updated,false);
  assert.equal(data.events.at(-1).snapshot_id,history.at(-1).id);
  assert.deepEqual((await (await fetch(`${url}?mode=fixture`)).json()).events,[]);
  for(const method of ['POST','PUT','DELETE'])assert.equal((await fetch(`${url}?mode=production`,{method})).status,405);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
 assert.equal(fingerprint({project,history:readSnapshots(project.root,'production'),economics:calculate(project)}),before);
});

function isolatedJournal(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'event-inspection-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry',
  'asset-registry','dependency-graph','thesis-rules','sensitivity','assumptions','scenarios'];
 const files=[...names.map(n=>`spec/${n}.yaml`),'data/observed/observations.yaml','sources/sources.yaml',
  ...fs.readdirSync(path.join(project.root,'data/events/production')).map(n=>`data/events/production/${n}`)];
 for(const file of files) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,fs.readFileSync(path.join(project.root,file)));
 }
 const file=path.join(root,'data/events/production/uni-v2-fee-accrual-20261004.json');
 return {root,file,journal:JSON.parse(fs.readFileSync(file,'utf8'))};
}
for(const [name,edit,pattern] of [
 ['journal mismatch',j=>{j.event.reason='different from saved snapshot';},/does not match immutable snapshot/],
 ['future knowledge',j=>{for(const e of [j.event,j.snapshot.event])e.as_of_date='2099-01-01';},/Event as-of cannot be in the future/],
 ['future review',j=>{for(const e of [j.event,j.snapshot.event])e.research_review.reviewed_at='2099-01-01T00:00:00Z';},/review cannot be in the future/],
 ['fixture provenance',j=>{for(const e of [j.event,j.snapshot.event])e.fixture=true;},/Event data mode mismatch/],
 ['forged propagation',j=>{j.snapshot.event.propagated_nodes.push('XLM');},/propagated nodes do not match/]
])test(`research API rejects reviewed ${name} even with a matching snapshot hash and never writes`,async t=>{
 const {root,file,journal}=isolatedJournal(t);edit(journal);
 const {id,...content}=journal.snapshot;journal.snapshot.id=fingerprint(content);
 fs.writeFileSync(file,JSON.stringify(journal));const before=fs.readFileSync(file,'utf8');
 const server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/research?mode=production`);
  assert.equal(response.status,400);assert.match((await response.json()).error,pattern);
  assert.equal(fs.readFileSync(file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
