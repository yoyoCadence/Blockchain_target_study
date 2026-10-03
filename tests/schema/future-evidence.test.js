import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,validateProject,selectInputs} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {applyEvent} from '../../engine/propagation/index.js';
import {createServer} from '../../server.js';

for(const mode of ['fixture','production']) {
 for(const value of [10,null]) test(`${mode} rejects future OBSERVED as-of even when value is ${value}`,()=>{
  const project=loadProject(mode),history=fingerprint(readSnapshots(project.root,mode));
  const record=project.inputs.find(r=>r.classification==='OBSERVED');
  Object.assign(record,{as_of_date:'2099-01-01',value});
  assert.throws(()=>validateProject(project),/Observation as-of cannot be in the future/);
  assert.equal(fingerprint(readSnapshots(project.root,mode)),history);
 });
 test(`${mode} rejects future source retrieval, including unused evidence`,()=>{
  const project=loadProject(mode);
  project.sources.push({...project.sources[0],id:'test-only-future-retrieval',retrieved_at:'2099-01-01T00:00:00Z'});
  delete project.sources.at(-1).supersedes;
  assert.throws(()=>validateProject(project),/Source retrieval cannot be in the future/);
 });
}

for(const classification of ['ASSUMPTION','SCENARIO']) test(`future ${classification} remains an explicit analyst input`,()=>{
 const project=loadProject('fixture'),record=selectInputs(project.inputs)['uni.price'];
 Object.assign(record,{as_of_date:'2099-01-01',period:{basis:'model',end:'2099-01-01'},classification,
  rationale:'Isolated future analyst input; not an observed fact',scenario:'Test-only future scenario'});
 assert.doesNotThrow(()=>validateProject(project));
 assert.equal(record.classification,classification);
});

test('observation boundary uses current UTC day and does not depend on local wall dates',t=>{
 const project=loadProject('production'),record=project.inputs.find(r=>r.classification==='OBSERVED');
 t.mock.method(Date,'now',()=>Date.parse('2026-10-03T12:00:00Z'));
 record.as_of_date='2026-10-03';assert.doesNotThrow(()=>validateProject(project));
 record.as_of_date='2026-10-04';assert.throws(()=>validateProject(project),/Observation as-of cannot be in the future/);
});

test('retrieval compares exact UTC instants while preserving original offset text',t=>{
 const project=loadProject('production'),source=project.sources[0];
 t.mock.method(Date,'now',()=>Date.parse('2026-10-03T12:00:00Z'));
 source.retrieved_at='2026-10-03T00:30:00-13:00'; // 13:30 UTC: future despite earlier local clock.
 assert.throws(()=>validateProject(project),/Source retrieval cannot be in the future/);
 source.retrieved_at='2026-10-03T23:30:00+14:00'; // 09:30 UTC: already retrieved.
 assert.doesNotThrow(()=>validateProject(project));
 assert.equal(source.retrieved_at,'2026-10-03T23:30:00+14:00');
 source.retrieved_at='2026-10-03T12:00:00Z';assert.doesNotThrow(()=>validateProject(project));
});

function temporaryFixture(t) {
 const project=loadProject('fixture'),root=fs.mkdtempSync(path.join(os.tmpdir(),'future-evidence-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const specFiles=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of [...specFiles.map(name=>`spec/${name}.yaml`),'data/fixtures/inputs.yaml','data/fixtures/sources.yaml']) {
  const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,fs.readFileSync(path.join(project.root,file)));
 }
 return {project,root};
}

for(const kind of ['observation','retrieval']) test(`direct canonical load and API reject future ${kind} stored outside the event workflow`,async t=>{
 const {project,root}=temporaryFixture(t);
 if(kind==='observation') project.inputs.find(r=>r.classification==='OBSERVED').as_of_date='2099-01-01';
 else project.sources[0].retrieved_at='2099-01-01T00:00:00Z';
 fs.writeFileSync(path.join(root,'data/fixtures/inputs.yaml'),JSON.stringify({version:1,metrics:project.inputs}));
 fs.writeFileSync(path.join(root,'data/fixtures/sources.yaml'),JSON.stringify({version:1,sources:project.sources}));
 assert.throws(()=>loadProject('fixture',root),/cannot be in the future/);
 const before=fingerprint({inputs:project.inputs,sources:project.sources});
 const server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/cannot be in the future/);
  assert.equal(fingerprint({inputs:project.inputs,sources:project.sources}),before);
  assert.equal(fs.existsSync(path.join(root,'data/events')),false);
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('source-only generic event cannot persist future retrieval and leaves no journal',t=>{
 const project=loadProject('production'),root=fs.mkdtempSync(path.join(os.tmpdir(),'future-source-event-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const source={...project.sources[0],id:'test-only-future-event-source',retrieved_at:'2099-01-01T00:00:00Z'};
 delete source.supersedes;
 const event={id:'future-retrieval-test',type:'protocol_fee_change',status:'completed',fixture:false,
  as_of_date:new Date().toISOString().slice(0,10),effective_date:'2025-12-27',source_ids:[source.id],sources:[source],
  affected_nodes:['UNI'],reason:'Test-only future evidence rejection',updates:[]};
 assert.throws(()=>applyEvent({...project,root},event),/Source retrieval cannot be in the future/);
 assert.equal(fs.existsSync(path.join(root,'data/events')),false);
});
