import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,calculate} from '../../engine/index.js';
import {prepareEvent,applyEvent} from '../../engine/propagation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {createServer} from '../../server.js';

const project=loadProject('production');
// Isolate the noon clock probes from later real research retrievals. Only this
// in-memory test input changes; committed history/replay below reloads real data.
for(const source of project.sources)if(Date.parse(source.retrieved_at)>Date.parse('2026-10-03T12:00:00Z'))
 source.retrieved_at='2026-10-03T12:00:00Z';
const event=()=>({id:'test-only-event-review',type:'acquisition',status:'completed',fixture:false,
 as_of_date:'2026-10-03',effective_date:'2025-12-27',source_ids:['ethereum-unification-execution-20251227-v2'],
 affected_nodes:['UNI'],reason:'Isolated chronology regression; no real research',updates:[],
 research_review:{reviewer:'Test analyst',reviewed_at:'2026-10-03T12:00:00Z',rationale:'Test-only retrospective evidence'}});
const fixedClock=t=>t.mock.method(Date,'now',()=>Date.parse('2026-10-03T12:00:00Z'));

for(const status of ['completed','live','planned','announced','cancelled'])
 test(`${status} generic source-only event cannot claim a future review`,t=>{
  fixedClock(t);const e=event();e.status=status;e.research_review.reviewed_at='2099-01-01T00:00:00Z';
  const before=fingerprint(project);assert.throws(()=>prepareEvent(project,e),/Research review cannot be in the future/);
  assert.equal(fingerprint(project),before);
 });

for(const field of ['reviewer','rationale'])test(`generic review requires nonblank ${field}`,t=>{
 fixedClock(t);const e=event();e.research_review[field]='   ';
 assert.throws(()=>prepareEvent(project,e),/reviewer and rationale/);
});

for(const [reviewed_at,allowed] of [['2026-10-02T23:30:00-02:00',true],['2026-10-03T00:30:00+02:00',false]])
 test(`generic review UTC knowledge day handles offset ${reviewed_at}`,t=>{
  fixedClock(t);const e=event();e.research_review.reviewed_at=reviewed_at;
  // Use dated evidence retrieved before either cutoff, without changing original sources.
  const source={...project.sources.find(s=>s.id===e.source_ids[0]),id:'test-only-offset-source',retrieved_at:'2026-10-02T12:00:00Z'};
  delete source.supersedes;e.sources=[source];e.source_ids=[source.id];
  if(!allowed)assert.throws(()=>prepareEvent(project,e),/review precedes refresh as-of date/);
  else assert.equal(prepareEvent(project,e).snapshot.event.research_review.reviewed_at,reviewed_at);
 });

test('generic review uses exact UTC current instant rather than its local date',t=>{
 fixedClock(t);const e=event();e.research_review.reviewed_at='2026-10-03T00:30:00-13:00';
 assert.throws(()=>prepareEvent(project,e),/Research review cannot be in the future/);
 e.research_review.reviewed_at='2026-10-03T23:30:00+14:00';
 assert.equal(prepareEvent(project,e).snapshot.event.research_review.reviewed_at,e.research_review.reviewed_at);
});

test('declared existing source retrieval must precede the review at exact offset-normalized instants',t=>{
 fixedClock(t);const e=event(),p=structuredClone(project),source=p.sources.find(s=>s.id===e.source_ids[0]);
 e.research_review.reviewed_at='2026-10-03T09:00:00Z';source.retrieved_at='2026-10-02T23:30:00-10:00';
 assert.throws(()=>prepareEvent(p,e),/retrieved after review/);
 source.retrieved_at='2026-10-03T23:00:00+14:00';
 const prepared=prepareEvent(p,e);assert.equal(prepared.project.sources.find(s=>s.id===source.id).retrieved_at,source.retrieved_at);
});

test('new sources cannot be saved as reviewed by omitting them from declared event evidence',t=>{
 fixedClock(t);const e=event();e.research_review.reviewed_at='2026-10-03T09:00:00Z';
 const source={...project.sources.find(s=>s.id===e.source_ids[0]),id:'test-only-unused-review-source',retrieved_at:'2026-10-03T10:00:00Z'};
 delete source.supersedes;e.sources=[source];
 assert.throws(()=>prepareEvent(project,e),/retrieved after review/);
});

test('retrospective review can follow an old event as-of and later retrieval without changing dates',t=>{
 fixedClock(t);const e=event();e.as_of_date='2026-01-01';
 const prepared=prepareEvent(project,e);
 assert.equal(prepared.snapshot.event.as_of_date,'2026-01-01');
 assert.equal(prepared.snapshot.event.effective_date,'2025-12-27');
 assert.equal(prepared.snapshot.event.research_review.reviewed_at,'2026-10-03T12:00:00Z');
 assert.deepEqual(prepared.project.inputs,project.inputs);
});

test('reviewed plan may retain a future effective date without becoming completed',t=>{
 fixedClock(t);const e=event();e.status='planned';e.effective_date='2099-01-01';
 const prepared=prepareEvent(project,e);assert.equal(prepared.snapshot.event.status,'planned');
 assert.equal(prepared.snapshot.event.effective_date,'2099-01-01');assert.deepEqual(prepared.project.inputs,project.inputs);
});

test('ordinary manual events without review metadata retain the existing path in both modes',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),e=event();delete e.research_review;e.fixture=mode==='fixture';e.source_ids=[p.sources[0].id];
  assert.doesNotThrow(()=>prepareEvent(p,e));
 }
});

test('failed reviewed-event apply creates no journal and leaves historical evidence untouched',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'event-review-failure-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const e=event();e.research_review.reviewed_at='2099-01-01T00:00:00Z';
 const before=fingerprint(readSnapshots(project.root,'production'));
 assert.throws(()=>applyEvent({...project,root},e),/Research review cannot be in the future/);
 assert.equal(fs.existsSync(path.join(root,'data/events')),false);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
});

function fixtureJournal(t,{retrievalProbe=false}={}) {
 const p=loadProject('fixture'),root=fs.mkdtempSync(path.join(os.tmpdir(),'event-review-load-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of [...names.map(n=>`spec/${n}.yaml`),'data/fixtures/inputs.yaml','data/fixtures/sources.yaml']) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(p.root,file)));
 }
 if(retrievalProbe) {
  Object.assign(p.sources[0],{date:'2024-01-01',retrieved_at:'2026-01-01T00:00:00Z'});
  fs.writeFileSync(path.join(root,'data/fixtures/sources.yaml'),JSON.stringify({version:1,sources:p.sources}));
 }
 const e=event();e.fixture=true;e.source_ids=[p.sources[0].id];
 const prepared=prepareEvent(p,e),transaction={event:e,snapshot:prepared.snapshot};
 const file=path.join(root,'data/events/fixture',`${e.id}.json`);fs.mkdirSync(path.dirname(file),{recursive:true});
 return {root,file,transaction};
}

for(const kind of ['future_review','retrieval_after_review'])test(`direct journal load and API reject ${kind} even with matching hashes`,async t=>{
 fixedClock(t);const {root,file,transaction}=fixtureJournal(t,{retrievalProbe:kind==='retrieval_after_review'});
 const reviewed_at=kind==='future_review'?'2099-01-01T00:00:00Z':'2024-01-02T00:00:00Z';
 for(const e of [transaction.event,transaction.snapshot.event]) {
  e.research_review.reviewed_at=reviewed_at;
  if(kind==='retrieval_after_review'){e.as_of_date='2024-01-01';e.effective_date='2023-12-31';}
 }
 const {id,...content}=transaction.snapshot;transaction.snapshot.id=fingerprint(content);
 fs.writeFileSync(file,JSON.stringify(transaction));const before=fs.readFileSync(file,'utf8');
 const pattern=kind==='future_review'?/review cannot be in the future/:/retrieved after review/;
 assert.throws(()=>loadProject('fixture',root),pattern);
 const server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
  assert.equal(response.status,400);assert.match((await response.json()).error,pattern);
  assert.equal(fs.readFileSync(file,'utf8'),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('all committed reviews load and latest financial snapshots replay without changing hashes or evidence',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),history=readSnapshots(p.root,mode),latest=history.at(-1),before=fingerprint(history);
  const replay=calculate(p,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(replay.metrics,latest.metrics);assert.deepEqual(replay.thesis,latest.thesis);
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
