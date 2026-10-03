import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject} from '../../engine/index.js';
import {prepareEvent,applyEvent} from '../../engine/propagation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';

const project=loadProject('production');
const event={id:'future-event-test',type:'protocol_fee_change',status:'completed',fixture:false,
 as_of_date:'2099-01-01',effective_date:'2099-01-01',source_ids:['ethereum-unification-execution-20251227-v2'],
 affected_nodes:['UNI'],reason:'Isolated chronology regression; not production evidence',updates:[]};

for(const status of ['completed','live','planned','announced','cancelled']) test(`${status} cannot claim a future knowledge as-of`,()=>{
 const before=fingerprint(project);
 assert.throws(()=>prepareEvent(project,{...event,status}),/Event as-of cannot be in the future/);
 assert.equal(fingerprint(project),before);
});

test('current-day planned and announced events may retain future effective dates without becoming live',()=>{
 const as_of_date=new Date().toISOString().slice(0,10);
 const before=fingerprint(readSnapshots(project.root,'production'));
 for(const status of ['planned','announced']) {
  const prepared=prepareEvent(project,{...event,status,as_of_date});
  assert.equal(prepared.snapshot.event.status,status);
  assert.equal(prepared.snapshot.event.effective_date,'2099-01-01');
  assert.deepEqual(prepared.project.inputs,project.inputs);
  assert.ok(Object.values(prepared.result.thesis).every(t=>t.coverage==='insufficient'));
 }
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
});

test('failed future completed event apply never writes a journal',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'future-event-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 assert.throws(()=>applyEvent({...project,root},event),/Event as-of cannot be in the future/);
 assert.equal(fs.existsSync(path.join(root,'data/events/production')),false);
});

for(const status of ['completed','announced']) test(`${status} source-only event rejects evidence published after its as-of`,()=>{
 const source={...project.sources.find(s=>s.id===event.source_ids[0]),id:'future-source-test',version:1,date:'2099-01-01',retrieved_at:'2099-01-02T00:00:00Z'};
 delete source.supersedes;
 const updated={...event,status,as_of_date:new Date().toISOString().slice(0,10),effective_date:'2025-12-27',sources:[source],source_ids:[source.id]};
 assert.throws(()=>prepareEvent(project,updated),/Event source published after event as-of/);
});

test('later retrieval can preserve an earlier recorded event knowledge date',()=>{
 const prepared=prepareEvent(project,{...event,as_of_date:'2026-01-01',effective_date:'2025-12-27'});
 assert.equal(prepared.snapshot.event.as_of_date,'2026-01-01');
 assert.equal(prepared.snapshot.event.status,'completed');
 assert.equal(prepared.project.sources.find(s=>s.id===event.source_ids[0]).retrieved_at,'2026-10-03T05:49:02Z');
});
