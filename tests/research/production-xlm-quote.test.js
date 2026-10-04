import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,readYaml,calculate,lineage} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint,makeSnapshot} from '../../engine/snapshots.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const baseline=history.find(s=>s.event?.id==='xlm-market-quote-baseline-20261004'),index=history.indexOf(baseline),previous=history[index-1];
const proposal=readYaml('data/research/xlm-market-quote-2026-10-04.yaml');

test('XLM quote baseline retains exact observed point evidence and the digest-bound single-asset review',()=>{
 verifySnapshot(baseline);assert.equal(baseline.parent_id,previous.id);
 assert.equal(previous.id,'0e4062bd93a2a4d94ca01b2af1bbdc2d38978c89b5169d49bbea6d2a1a99fb14');
 assert.equal(baseline.event.type,'research_refresh');assert.deepEqual(baseline.event.propagated_nodes,['XLM']);
 assert.deepEqual(baseline.event.updates,proposal.observations);assert.deepEqual(baseline.event.sources,[]);
 assert.deepEqual(baseline.event.research_review,proposal.review);assert.match(baseline.event.research_digest,/^[a-f0-9]{64}$/);
 assert.equal(baseline.event.research_digest,'fef75169e063a5c47e6d209fb0fab53ae6b7b7a1e1b5e1e59688efde0be989fb');
 const quote=baseline.metrics['xlm.price'];assert.equal(quote.value,0.216265);assert.equal(quote.unit,'USD');
 assert.equal(quote.classification,'OBSERVED');assert.equal(quote.fixture,false);assert.equal(quote.version,1);
 assert.deepEqual(quote.period,{basis:'point',end:'2026-10-04'});assert.equal(quote.as_of_date,'2026-10-04');
 assert.match(quote.rationale,/2026-10-04T11:33:54\.575362751Z/);
 assert.deepEqual(quote.source_ids,['coinbase-xlm-quote-20261004-v1','coinbase-xlm-product-20261004-v1']);
 for(const source of lineage(project,baseline,'xlm.price').sources) {
  assert.equal(source.tier,1);assert.deepEqual(source,previous.sources.find(s=>s.id===source.id));
 }
});

test('only XLM price becomes known while old values, evidence, formulas and assumptions remain intact',()=>{
 for(const [id,metric]of Object.entries(previous.metrics))if(id!=='xlm.price')assert.equal(baseline.metrics[id].value,metric.value,id);
 assert.deepEqual(baseline.inputs.slice(0,-1),previous.inputs);assert.equal(baseline.inputs.length,previous.inputs.length+1);
 for(const field of ['sources','formulas','rules','dictionary','graph','assets','sensitivity','assumptions','scenarios'])assert.deepEqual(baseline[field],previous[field],field);
 assert.equal(baseline.period.end,'2026-10-04');assert.equal(Object.values(baseline.metrics).filter(m=>m.value===null).length,82);
 for(const id of ['uni.price','uni.net_accrual','uni.fdv','secz.ev','xlm.network_fees','xlm.native_demand','xlm.capture_ratio'])assert.equal(baseline.metrics[id].value,null,id);
 const comparison=compareSnapshots(previous,baseline);
 assert.equal(comparison.source_change,true);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 assert.deepEqual(comparison.changes.filter(c=>c.previous!==c.current).map(c=>c.metric_id),['xlm.price']);
 assert.ok(Object.values(baseline.thesis).every(t=>t.coverage==='insufficient'&&t.triggered_rules.length===0));
 assert.equal(new Set(history.slice(0,index).map(s=>JSON.stringify(s.period))).size,1);
});

test('known XLM point quote is unavailable at the earlier cutoff and never replaces fixture or TTM evidence',()=>{
 const old=sourceFreshness(project,{as_of_date:'2026-10-03'}).inputs.find(r=>r.metric_id==='xlm.price');
 assert.equal(old.observation_state,'NOT_AVAILABLE_AT_CUTOFF');assert.equal(old.evidence_state,'INSUFFICIENT');
 const current=sourceFreshness(project,{as_of_date:'2026-10-04'}).inputs.find(r=>r.metric_id==='xlm.price');
 assert.equal(current.observation_state,'WITHIN_REVIEW_WINDOW');assert.equal(current.evidence_state,'AVAILABLE');
 const fixture=calculate(loadProject('fixture'));assert.equal(fixture.metrics['xlm.price'].fixture,true);
 assert.equal(fixture.metrics['uni.required_share'].value,0.422);
 const research=inspectResearch(project);assert.ok(research.records.find(r=>r.kind==='revenue_ttm').records.every(r=>r.value===null));
 assert.equal(research.events.find(e=>e.id===baseline.event.id).recorded_update_count,1);
});

test('historical XLM snapshot replays and its v1 formulas retain three UNI blockers without writes',()=>{
 const before=fingerprint({project,history,result:calculate(project)});
 const replay=calculate({...project,inputs:baseline.inputs,sources:baseline.sources,registry:{...project.registry,formulas:baseline.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,baseline.metrics);assert.deepEqual(replay.thesis,baseline.thesis);
 const pending=readYaml('data/research/uni-market-quote-pending-2026-10-04.yaml');
 const historic={...project,inputs:[...baseline.inputs,...pending.observations],sources:baseline.sources,registry:{version:1,formulas:baseline.formulas}};
 assert.throws(()=>makeSnapshot(historic,calculate(historic),{previous:baseline,reason:'Read-only historical v1 rejection'}),error=>error.message==='Cannot snapshot calculation errors'&&
  fingerprint(error.details.map(d=>d.metric_id))===fingerprint(['uni.net_accrual','uni.required_share','uni.required_share_net']));
 assert.equal(fingerprint({project,history:readSnapshots(project.root,'production'),result:calculate(project)}),before);
});
