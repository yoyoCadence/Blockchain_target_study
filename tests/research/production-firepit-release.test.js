import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const release=history.find(s=>s.event?.id==='uni-firepit-release-20251229');
const previous=history[history.indexOf(release)-1];

test('historical Firepit receipt retains raw transfer/payment and Released evidence in the journal',()=>{
 verifySnapshot(release);
 const {propagated_nodes,...event}=release.event;
 assert.deepEqual(event,readYaml('data/research/uni-firepit-release-2025-12-29.yaml'));
 assert.deepEqual(propagated_nodes,['UNI']);assert.equal(event.type,'token_burn');assert.equal(event.status,'completed');
 assert.equal(event.effective_date,'2025-12-29');assert.equal(event.sources.length,5);assert.deepEqual(event.updates,[]);
 for(const value of ['24116850','2025-12-29T07:36:47Z','4000000000000000000000','log 338','log 345','nonce 0','16054642585','5255598537200314106','4203254992','3448554','187841167374250491'])
  assert.ok(event.reason.includes(value),value);
 assert.match(event.reason,/not deployed-bytecode equivalence/);
 for(const source of event.sources) {
  assert.equal(source.version,1);assert.equal(source.fixture,false);assert.ok(source.tier<=2);
  assert.ok(source.covered_metrics.includes('uni.firepit_release'));
  assert.ok(source.date<=event.effective_date&&source.retrieved_at<=event.research_review.reviewed_at);
  assert.deepEqual(release.sources.find(s=>s.id===source.id),source);
 }
 assert.ok(event.sources.filter(s=>s.tier===2).every(s=>s.url.includes('8604e4b9aed88bdd6be3a322e19722c40f94be2c')));
});

test('single executed release appends sources while retaining every earlier financial and evidence version',()=>{
 assert.equal(release.parent_id,previous.id);
 const comparison=compareSnapshots(previous,release);
 assert.equal(comparison.source_change,true);assert.deepEqual(comparison.changes,[]);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 for(const field of ['metrics','inputs','formulas','rules','dictionary','assets','graph','sensitivity','market_valuation','thesis','period'])
  assert.deepEqual(release[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(release.sources.find(s=>s.id===source.id),source);
 assert.equal(history[0].id,'65e5c2c8adf25d6e0f111e9ff4b63bb83eb098f95951b49376b476a0b7b5fc80');
 assert.equal(previous.id,'118771fe14a9f79bc23275390bbc95c1d85aacbcf141abe59ac5c1ad51498522');
});

test('release snapshot fully replays and repeated model period cannot add thesis evidence',()=>{
 const replayProject={...project,inputs:release.inputs,sources:release.sources,registry:{version:1,formulas:release.formulas},
  dictionary:release.dictionary,thesis:{...project.thesis,rules:release.rules},assets:release.assets,
  graph:release.graph,sensitivity:release.sensitivity};
 const replay=calculate(replayProject,{history:history.slice(0,history.indexOf(release)),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,release.metrics);assert.deepEqual(replay.thesis,release.thesis);
 assert.equal(new Set(history.slice(0,history.indexOf(release)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.ok(Object.values(release.thesis).every(t=>t.coverage==='insufficient'));
});

test('one caller-funded dead-address payment does not establish annual fees, burn or fee-origin attribution',()=>{
 assert.equal(Object.values(release.metrics).filter(m=>m.value===null).length,83);
 for(const id of ['uni.crypto_fees','uni.net_accrual','uni.fee','uni.required_share','uni.price','uni.fdv'])assert.equal(release.metrics[id].value,null,id);
 assert.match(release.event.reason,/No attribution of every released asset to protocol-generated fees/);
 assert.match(release.event.reason,/totalSupply reduction, annualized burn\/revenue, USD valuation, current threshold/);
 assert.match(release.event.reason,/separate 100M treasury transfer remains distinct/);
});
