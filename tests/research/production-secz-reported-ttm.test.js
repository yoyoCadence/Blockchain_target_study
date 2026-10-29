import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,readYaml,calculate,lineage} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewRevenueTtm} from '../../engine/research/revenue-ttm.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode),proposal=readYaml('data/research/secz-reported-ttm-baseline-2026-10-29.yaml');
const saved=history.find(s=>s.event?.id===proposal.id),model=history[history.indexOf(saved)-1],before=history[history.indexOf(model)-1];
const research=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v2.json');

test('six canonical inputs retain exact original observation values, periods, references and statement context',()=>{
 assert.equal(reviewRevenueTtm(p,research.request,research.input_reviews.annual,research.input_reviews.interim,{formula:research.formula}).id,research.id);
 assert.equal(proposal.observations.length,6);
 for(const o of proposal.observations) {
  const originalReview=Object.values(research.input_reviews).find(r=>r.id===o.research_reference.artifact_id);
  const original=originalReview.dossier.observations.find(r=>r.id===o.research_reference.record_id),period=originalReview.dossier.periods.find(r=>r.id===original.period_id);
  assert.equal(o.classification,'OBSERVED');assert.equal(o.value,original.value);assert.equal(o.unit,original.unit);assert.equal(o.as_of_date,original.as_of_date);assert.equal(o.confidence,original.confidence);
  for(const k of ['basis','start','end','duration_months'])assert.equal(o.period[k],period[k]);
  for(const [k,v] of Object.entries(o.statement_context))assert.equal(v,originalReview.dossier.statement[k]);
  assert.deepEqual(p.inputs.find(r=>r.id===o.id),o);assert.deepEqual(saved.inputs.find(r=>r.id===o.id),o);
 }
});

test('sources are appended with original versions intact; coverage additions do not refresh publication or retrieval',()=>{
 for(const source of proposal.sources) {
  const original=Object.values(research.input_reviews).flatMap(r=>r.dossier.sources).find(s=>s.id===(source.supersedes||source.id));
  assert.ok(original);
  if(!source.supersedes)assert.deepEqual(source,original);
  else {
   for(const field of ['url','publisher','title','date','retrieved_at','tier','fixture'])assert.equal(source[field],original[field]);
   assert.equal(source.version,original.version+1);
   assert.deepEqual(source.covered_metrics.filter(m=>!m.startsWith('secz.reported_')),original.covered_metrics.filter(m=>!m.startsWith('secz.reported_')));
   assert.ok(source.covered_metrics.length>original.covered_metrics.length);
   assert.deepEqual(p.sources.find(s=>s.id===source.supersedes),original);
  }
 }
});

test('model and data changes have separate immutable snapshots with unchanged original metrics and thesis period',()=>{
 for(const s of [model,saved])verifySnapshot(s);
 assert.equal(model.id,'bb6079b8bf692f99b220004faec74b85f1891103145bd96fbd8a8ea15c8f2063');
 assert.equal(saved.id,'8c21601434dcbae551cbe8a70944aada869d654de2795426f012825648ee15c3');
 assert.equal(saved.parent_id,model.id);assert.equal(model.parent_id,before.id);
 assert.equal(saved.event.research_digest,'925f12935a5ac92cc070b2c3a2fe89e6cd534652f15bbf6f1f726ba9157c4799');
 const a=compareSnapshots(before,model),b=compareSnapshots(model,saved);
 assert.deepEqual([a.formula_change,a.assumption_change,a.scenario_change],[true,true,false]);
 assert.deepEqual([b.source_change,b.formula_change,b.assumption_change,b.scenario_change],[true,false,false,false]);
 for(const [id,m] of Object.entries(before.metrics))assert.deepEqual(saved.metrics[id],m,id);
 assert.deepEqual(saved.period,before.period);assert.deepEqual(saved.thesis,before.thesis);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,72);
 assert.equal(Object.values(model.metrics).filter(m=>m.value===null).length,81);
 const gate=saved.assumptions.find(m=>m.metric_id==='secz.reported_ttm_comparability');
 assert.equal(gate.confidence,'low');assert.match(gate.rationale,/名稱衝突原樣保留/);
 assert.deepEqual(gate.research_reference,{artifact_id:research.id,record_id:research.request.comparability.id});
});

test('the full append-only histories replay using each immutable formula and dictionary version',()=>{
 const hash=fingerprint(history);
 for(const mode of ['fixture','production']) {
  const project=loadProject(mode),snapshots=readSnapshots(project.root,mode);
  for(const [index,s] of snapshots.entries()) {
   const r=calculate({...project,inputs:s.inputs,sources:s.sources,registry:{formulas:s.formulas},dictionary:s.dictionary,sensitivity:s.sensitivity},
    {history:snapshots.slice(0,index),previousThesis:snapshots[index-1]?.thesis||{}});
   assert.deepEqual(r.metrics,s.metrics,s.id);assert.deepEqual(r.thesis,s.thesis,s.id);
  }
 }
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),hash);
 const r=calculate(p),tree=lineage(p,r,'secz.reported_revenue_ttm');assert.equal(tree.inputs.length,2);
});
