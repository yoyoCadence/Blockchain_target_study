import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,lineage,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot} from '../../engine/snapshots.js';

const project=loadProject('production');
const history=readSnapshots(project.root,'production');
const baseline=history.find(s=>s.event?.id==='uni-growth-budget-baseline-20260101');

test('historical UNI budget records executed authorization and retains original unknown assumption',()=>{
 assert.ok(baseline);
 verifySnapshot(baseline);
 const budget=baseline.metrics['uni.growth_budget'];
 assert.equal(budget.value,20_000_000);
 assert.equal(budget.unit,'UNI/year');
 assert.equal(budget.classification,'OBSERVED');
 assert.equal(budget.fixture,false);
 assert.equal(budget.version,2);
 assert.equal(budget.as_of_date,'2026-01-01');
 assert.deepEqual(budget.period,{basis:'model',end:'2026-01-01'});
 assert.equal(budget.supersedes,'uni.growth_budget@1');
 assert.equal(baseline.inputs.find(m=>m.id===budget.supersedes).value,null);
 assert.equal(budget.source_ids.length,4);
 const receipt=baseline.sources.find(s=>s.id==='ethereum-unification-execution-20251227-v1');
 assert.equal(receipt.tier,1);
 assert.equal(receipt.date,'2025-12-27');
 assert.match(budget.rationale,/not actual annual distribution/);
 assert.match(budget.rationale,/retain this date conflict/);
 assert.match(baseline.event.research_review.reviewer,/not a human sign-off/);
 const proposal=readYaml('data/research/uni-growth-budget-2026-01-01.yaml');
 assert.deepEqual(baseline.event.updates,proposal.observations);
 assert.deepEqual(baseline.event.sources,proposal.sources);
 assert.deepEqual(baseline.event.research_review,proposal.review);
});

test('authorization alone cannot supply a valuation, realized fee capture or a healthy thesis',()=>{
 assert.equal(Object.values(baseline.metrics).filter(m=>m.value===null).length,83);
 for(const id of ['uni.price','uni.market_cap','uni.growth_distribution','uni.net_accrual','uni.required_share'])
  assert.equal(baseline.metrics[id].value,null,id);
 assert.equal(baseline.issues.filter(issue=>['ERROR','WARNING'].includes(issue.severity)).length,0);
 assert.ok(baseline.issues.some(issue=>issue.metric_id==='uni.net_accrual'&&issue.severity==='UNKNOWN'));
 assert.ok(baseline.sources.every(s=>s.fixture===false));
 assert.ok(baseline.inputs.every(m=>m.fixture===false));
 for(const thesis of Object.values(baseline.thesis)) {
  assert.equal(thesis.coverage,'insufficient');
  assert.match(thesis.interpretation,/insufficient evidence/i);
 }
});

test('production authorization snapshot replays with complete primary-source lineage',()=>{
 const index=history.indexOf(baseline);
 const replayProject={...project,inputs:baseline.inputs,sources:baseline.sources,
  registry:{version:1,formulas:baseline.formulas},dictionary:baseline.dictionary,
  thesis:{...project.thesis,rules:baseline.rules},assets:baseline.assets,graph:baseline.graph,
  sensitivity:baseline.sensitivity};
 const replay=calculate(replayProject,{history:history.slice(0,index),previousThesis:history[index-1]?.thesis||{}});
 for(const [id,metric] of Object.entries(baseline.metrics)) assert.equal(replay.metrics[id].value,metric.value,id);
 assert.deepEqual(replay.thesis,baseline.thesis);
 const budget=lineage(replayProject,replay,'uni.growth_budget');
 assert.deepEqual(budget.sources.map(s=>s.id),baseline.metrics['uni.growth_budget'].source_ids);
 assert.ok(budget.sources.every(s=>s.url&&s.date&&s.retrieved_at&&s.covered_metrics.includes('uni.growth_budget')));
});
