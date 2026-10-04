import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject as loadCanonical,validateProject,calculate} from '../../engine/index.js';
import {prepareEvent,applyEvent} from '../../engine/propagation/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';

// Synthetic evidence exists only in memory and temporary directories.
// Isolate these older date probes from the later real UNI quote; never change files.
function loadProject(mode) {
 const p=loadCanonical(mode);if(mode==='production')p.inputs=p.inputs.filter(m=>m.metric_id!=='uni.price');return p;
}
const source={id:'source-date-test@1',version:1,url:'https://example.invalid/date-test',
 publisher:'Isolated test evidence',title:'Synthetic chronology probe; not production evidence',
 date:'2026-08-01',retrieved_at:'2026-10-01T00:00:00Z',tier:1,covered_metrics:['uni.price'],fixture:false};
const observation={id:'source-date-price@1',metric_id:'uni.price',asset:'UNI',value:10,unit:'USD',
 classification:'OBSERVED',confidence:'medium',version:1,fixture:false,source_ids:[source.id],
 as_of_date:'2026-07-01',period:{basis:'point',end:'2026-07-01'}};
const event={id:'source-date-event',type:'protocol_fee_change',status:'completed',as_of_date:'2026-10-02',
 effective_date:'2026-08-01',source_ids:[source.id],affected_nodes:['UNI'],fixture:false,
 reason:'Isolated test chronology event',sources:[source],updates:[observation]};

for(const value of [10,null]) test(`canonical observed value ${value} rejects evidence unavailable at its as-of`,()=>{
 const project=loadProject('production');
 assert.throws(()=>validateProject({...project,sources:[...project.sources,source],
  inputs:[...project.inputs,{...observation,value}]}),/Source published after observation as-of/);
});

for(const as_of_date of ['2026-08-01','2026-08-02']) test(`publication on/before ${as_of_date} permits later retrospective retrieval`,()=>{
 const project=loadProject('production');
 const updated={...project,sources:[...project.sources,source],inputs:[...project.inputs,{...observation,as_of_date}]};
 validateProject(updated);
 const result=calculate(updated);
 assert.equal(result.metrics['uni.price'].value,10);
 assert.equal(result.metrics['uni.price'].period.end,'2026-07-01');
 assert.equal(result.metrics['uni.price'].as_of_date,as_of_date);
});

test('all referenced sources must precede observation as-of, including conflicting late evidence',()=>{
 const project=loadProject('production');
 const early={...source,id:'early-source',date:'2026-06-30'};
 assert.throws(()=>validateProject({...project,sources:[...project.sources,early,source],
  inputs:[...project.inputs,{...observation,source_ids:[early.id,source.id]}]}),/published after observation as-of/);
});

test('generic completed event cannot bypass the shared observation source-date validation',()=>{
 const project=loadProject('production'),before=fingerprint(project),history=readSnapshots(project.root,'production');
 assert.throws(()=>prepareEvent(project,event,history),/published after observation as-of/);
 assert.equal(fingerprint(project),before);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),fingerprint(history));
});

test('failed generic apply leaves even a temporary journal directory absent',t=>{
 const project=loadProject('production');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'source-date-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 assert.throws(()=>applyEvent({...project,root},event),/published after observation as-of/);
 assert.equal(fs.existsSync(path.join(root,'data/events/production')),false);
});

test('fixture observations obey the same chronology without mutating saved synthetic history',()=>{
 const project=loadProject('fixture');
 const fixtureSource={...source,fixture:true},fixtureObservation={...observation,fixture:true};
 assert.throws(()=>validateProject({...project,sources:[...project.sources,fixtureSource],
  inputs:[...project.inputs,fixtureObservation]}),/published after observation as-of/);
 assert.doesNotThrow(()=>loadProject('fixture'));
});

for(const classification of ['ASSUMPTION','SCENARIO']) test(`${classification} remains explicit rather than claiming observed knowledge`,()=>{
 const project=loadProject('production');
 const input={...observation,classification,rationale:'Isolated analyst assumption; not evidence',scenario:'Isolated scenario'};
 assert.doesNotThrow(()=>validateProject({...project,sources:[...project.sources,source],inputs:[...project.inputs,input]}));
});
