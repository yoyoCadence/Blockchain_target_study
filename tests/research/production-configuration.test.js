import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,lineage,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';

const project=loadProject('production');
const history=readSnapshots(project.root,'production');
const configuration=history.find(s=>s.event?.id==='uni-v2-fee-configuration-20251227');
const previous=history[history.indexOf(configuration)-1];

test('historical v2 configuration retains reviewed execution evidence without numerical updates',()=>{
 assert.ok(configuration);
 verifySnapshot(configuration);
 assert.equal(configuration.parent_id,previous.id);
 const proposal=readYaml('data/research/uni-v2-fee-configuration-2025-12-27.yaml');
 const {propagated_nodes,...event}=configuration.event;
 assert.deepEqual(event,proposal);
 assert.deepEqual(propagated_nodes,['UNI']);
 assert.equal(event.status,'completed');
 assert.equal(event.effective_date,'2025-12-27');
 assert.deepEqual(event.updates,[]);
 assert.match(event.reason,/F46901ED000000000000000000000000F38521F130FCCF29DB1961597BC5D2B60F995F85/);
 assert.match(event.reason,/not deployed-bytecode equivalence verification/);
 assert.match(event.reason,/Retain the Agora\/receipt timestamp conflict/);
 for(const id of event.source_ids) {
  const source=configuration.sources.find(s=>s.id===id);
  assert.ok(source.url&&source.date&&source.retrieved_at);
  assert.ok(source.tier<=2);
  assert.equal(source.fixture,false);
  assert.ok(source.covered_metrics.includes('uni.v2_fee_configuration'));
 }
});

test('source-only configuration preserves economics, old source versions and observation lineage',()=>{
 const comparison=compareSnapshots(previous,configuration);
 assert.equal(comparison.source_change,true);
 for(const field of ['assumption_change','scenario_change','formula_change','rule_change'])
  assert.equal(comparison[field],false,field);
 assert.deepEqual(comparison.changes,[]);
 assert.deepEqual(configuration.metrics,previous.metrics);
 assert.deepEqual(configuration.inputs,previous.inputs);
 assert.deepEqual(configuration.graph,previous.graph);
 assert.deepEqual(configuration.thesis,previous.thesis);
 for(const source of previous.sources)
  assert.deepEqual(configuration.sources.find(s=>s.id===source.id),source);
 for(const source of configuration.event.sources.filter(s=>s.supersedes)) {
  const old=configuration.sources.find(s=>s.id===source.supersedes);
  assert.ok(old);
  assert.equal(source.version,old.version+1);
 }
 const budget=lineage(project,calculate(project),'uni.growth_budget');
 assert.deepEqual(budget.sources.map(s=>s.id),previous.metrics['uni.growth_budget'].source_ids);
 assert.ok(budget.sources.every(s=>s.version===1));
 assert.equal(Object.values(configuration.metrics).filter(m=>m.value===null).length,83);
 for(const id of ['uni.crypto_fees','uni.net_accrual','uni.fee','uni.required_share'])
  assert.equal(configuration.metrics[id].value,null,id);
});

test('historical configuration snapshot replays and cannot manufacture a second thesis period',()=>{
 const index=history.indexOf(configuration);
 const replayProject={...project,inputs:configuration.inputs,sources:configuration.sources,
  registry:{version:1,formulas:configuration.formulas},dictionary:configuration.dictionary,
  thesis:{...project.thesis,rules:configuration.rules},assets:configuration.assets,graph:configuration.graph,
  sensitivity:configuration.sensitivity};
 const replay=calculate(replayProject,{history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,configuration.metrics);
 assert.deepEqual(replay.thesis,configuration.thesis);
 assert.deepEqual(configuration.period,previous.period);
 for(const thesis of Object.values(configuration.thesis)) {
  assert.equal(thesis.coverage,'insufficient');
  assert.match(thesis.interpretation,/insufficient evidence/i);
 }
});
