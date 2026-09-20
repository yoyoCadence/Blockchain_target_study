import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {project,change} from '../helpers.js';
import {calculate,lineage} from '../../engine/index.js';
import {makeSnapshot,saveSnapshot,verifySnapshot,readSnapshots,compareSnapshots} from '../../engine/snapshots.js';
import {prepareEvent} from '../../engine/propagation/index.js';
test('every derived lineage resolves to formula versions and explicit input evidence',()=>{
 const p=project(),r=calculate(p);function visit(tree){const m=tree.metric;if(m.classification==='DERIVED'){assert.ok(tree.formula);assert.equal(tree.formula.version,m.formula_version);assert.ok(tree.inputs.length);tree.inputs.forEach(visit);}else if(m.classification==='OBSERVED'){assert.ok(tree.sources.length);assert.ok(tree.sources.every(s=>s.id&&s.url));}else assert.ok(m.rationale||m.scenario);}
 Object.keys(r.metrics).forEach(id=>visit(lineage(p,r,id)));
});
test('snapshot preserves full economics and rejects overwrite and tampering',()=>{
 const p=project(),s=makeSnapshot(p,calculate(p),{reason:'Test initial'}),dir=fs.mkdtempSync(path.join(os.tmpdir(),'underwriting-'));
 try{saveSnapshot(dir,s);assert.throws(()=>saveSnapshot(dir,s),/EEXIST/);assert.equal(readSnapshots(dir,'fixture')[0].id,s.id);assert.equal(s.formulas.length,25);assert.ok(s.market_valuation['uni.market_cap']);assert.ok(s.observations.length);const tampered=structuredClone(s);tampered.metrics['uni.price'].value=1;assert.throws(()=>verifySnapshot(tampered),/integrity/);}finally{fs.rmSync(dir,{recursive:true});}
});
test('historical observations and unchanged formula versions cannot be rewritten',()=>{
 const p=project(),previous=makeSnapshot(p,calculate(p),{reason:'Initial'});
 change(p,'uni.price',10);assert.throws(()=>makeSnapshot(p,calculate(p),{previous,reason:'Illegal mutation'}),/Historical input/);
 const p2=project();p2.registry.formulas[0].description='Edited';assert.throws(()=>makeSnapshot(p2,calculate(p2),{previous,reason:'No version increment'}),/Formula changed/);
 p2.registry.formulas[0].version++;assert.doesNotThrow(()=>makeSnapshot(p2,calculate(p2),{previous,reason:'Documented formula revision'}));
});
test('planned events cannot create observed/live data; completed events need effective evidence',()=>{
 const p=project(),m=structuredClone(p.inputs.find(x=>x.metric_id==='uni.price'));
 const e={id:'test',type:'partnership',status:'planned',as_of_date:'2025-12-31',source_ids:[],affected_nodes:['UNI'],reason:'Test',fixture:true,updates:[m]};
 assert.throws(()=>prepareEvent(p,e),/cannot create live/);e.status='completed';assert.throws(()=>prepareEvent(p,e),/effective date/);
});
test('event propagates changes and comparison attributes assumption change',()=>{
 const p=project(),previous=makeSnapshot(p,calculate(p),{reason:'Initial'}),old=p.inputs.filter(x=>x.metric_id==='uni.growth_budget').at(-1);
 const e={id:'growth-budget-test',type:'dilution',status:'planned',as_of_date:'2025-12-31',source_ids:[],affected_nodes:['UNI'],reason:'Analyst growth budget sensitivity promoted to versioned assumption',fixture:true,updates:[{...old,id:'uni.growth_budget@2',version:2,value:10e6,supersedes:old.id}]};
 const {snapshot,result}=prepareEvent(p,e,[previous]);assert.equal(result.metrics['uni.growth_distribution'].value,90e6);assert.equal(previous.metrics['uni.growth_distribution'].value,180e6);const diff=compareSnapshots(previous,snapshot);assert.equal(diff.assumption_change,true);assert.equal(diff.source_change,false);assert.equal(diff.formula_change,false);assert.ok(diff.changes.some(c=>c.metric_id==='uni.net_accrual'));
});
test('persisted baseline and current snapshots replay without formula drift',()=>{
 const p=project(),history=readSnapshots(p.root,'fixture');assert.equal(history.length,2);
 history.forEach((snapshot,index)=>{
  const replayProject={...p,inputs:snapshot.inputs,sources:snapshot.sources,registry:{version:1,formulas:snapshot.formulas},dictionary:snapshot.dictionary,thesis:{...p.thesis,rules:snapshot.rules}};
  const replay=calculate(replayProject,{history:history.slice(0,index),previousThesis:history[index-1]?.thesis||{}});
  for(const [id,metric] of Object.entries(snapshot.metrics))assert.equal(replay.metrics[id].value,metric.value,`${snapshot.id}: ${id}`);
  assert.deepEqual(replay.thesis,snapshot.thesis);
 });
});
