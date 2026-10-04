import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,lineage,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {prepareResearchRefresh} from '../../engine/research/index.js';
import {sourceFreshness} from '../../engine/research/freshness.js';

const p=loadProject('production'),history=readSnapshots(p.root,'production');
const baseline=history.find(s=>s.event?.id==='uni-market-quote-baseline-20261004'),index=history.indexOf(baseline),previous=history[index-1];
const proposal=readYaml('data/research/uni-market-quote-2026-10-04.yaml');

test('saved UNI quote retains the exact earlier observation, two source versions and reviewed digest',()=>{
 verifySnapshot(baseline);assert.equal(baseline.parent_id,previous.id);
 assert.equal(previous.id,'497cec4e68daf9f87d530145d87044af1383bb9eb3691cbc7559b70deb497a18');
 assert.deepEqual(baseline.event.updates,proposal.observations);assert.deepEqual(baseline.event.sources,[]);
 assert.deepEqual(proposal.observations,readYaml('data/research/uni-market-quote-pending-2026-10-04.yaml').observations);
 assert.equal(baseline.event.research_digest,'193492a5dd22b0a75cb9c35d1ba5bcf57d11ad3738fc1ac581602b366c868483');
 assert.deepEqual(baseline.event.research_review,proposal.review);
 const quote=baseline.metrics['uni.price'];assert.equal(quote.value,9.0556);assert.equal(quote.classification,'OBSERVED');
 assert.deepEqual(quote.period,{basis:'point',end:'2026-10-04'});assert.equal(quote.fixture,false);
 assert.match(quote.rationale,/2026-10-04T11:33:36\.662371063Z/);assert.match(quote.rationale,/78869651/);
 assert.deepEqual(lineage(p,baseline,'uni.price').sources,quote.source_ids.map(id=>previous.sources.find(s=>s.id===id)));
 assert.throws(()=>prepareResearchRefresh(p,proposal),/supersede current input|Duplicate/);
});

test('only UNI price and explicit modeled annual burden become known; formula and source changes remain separate',()=>{
 assert.deepEqual(Object.keys(previous.metrics).filter(id=>previous.metrics[id].value!==baseline.metrics[id].value),['uni.price','uni.growth_distribution']);
 assert.equal(Object.values(baseline.metrics).filter(m=>m.value===null).length,80);
 const cost=baseline.metrics['uni.growth_distribution'];assert.equal(cost.value,181112000);assert.equal(cost.classification,'DERIVED');
 assert.deepEqual(cost.period,{basis:'model',end:'2026-10-04'});assert.equal(cost.valuation_date,'2026-10-04');
 assert.match(cost.rationale,/不代表當日額度仍有效/);assert.equal(cost.formula_version,2);
 assert.deepEqual(baseline.inputs.slice(0,-1),previous.inputs);
 for(const field of ['sources','assumptions','scenarios','rules','graph','assets','dictionary','sensitivity'])assert.deepEqual(baseline[field],previous[field],field);
 const changed=baseline.formulas.filter(f=>fingerprint(f)!==fingerprint(previous.formulas.find(old=>old.id===f.id)));
 assert.equal(changed.length,5);
 for(const f of changed){const old=previous.formulas.find(old=>old.id===f.id);assert.equal(old.version,1);assert.equal(f.version,2);assert.deepEqual(f.expression,old.expression);}
 const comparison=compareSnapshots(previous,baseline);assert.equal(comparison.source_change,true);assert.equal(comparison.formula_change,true);
 for(const flag of ['assumption_change','scenario_change','rule_change'])assert.equal(comparison[flag],false);
 for(const id of ['uni.market_cap','uni.fdv','uni.crypto_fees','uni.net_accrual','uni.net_burn_yield','uni.required_share','uni.required_share_net'])assert.equal(baseline.metrics[id].value,null,id);
 assert.ok(Object.values(baseline.thesis).every(t=>t.coverage==='insufficient'&&t.triggered_rules.length===0));
 const cutoff=sourceFreshness(p,{as_of_date:'2026-10-03'});assert.equal(cutoff.inputs.find(m=>m.metric_id==='uni.price').observation_state,'NOT_AVAILABLE_AT_CUTOFF');
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-04'}).inputs.find(m=>m.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
});

test('every production snapshot replays its own formula version and keeps its hash and original periods',()=>{
 const before=fingerprint(history);
 for(const [i,snapshot]of history.entries()) {
  const replay=calculate({...p,inputs:snapshot.inputs,sources:snapshot.sources,registry:{version:1,formulas:snapshot.formulas},
   dictionary:snapshot.dictionary,thesis:{...p.thesis,rules:snapshot.rules}},
   {history:history.slice(0,i),previousThesis:history[i-1]?.thesis??{}});
  assert.deepEqual(replay.metrics,snapshot.metrics);assert.deepEqual(replay.thesis,snapshot.thesis);assert.deepEqual(replay.period,snapshot.period);
 }
 assert.equal(fingerprint(readSnapshots(p.root,'production')),before);
 assert.equal(history.length,11);assert.equal(history.filter(s=>s.period.end==='2026-01-01').length,9);
});

test('fixture records remain synthetic and its separate formula snapshot retains all economic values',()=>{
 const fixture=loadProject('fixture'),snapshots=readSnapshots(fixture.root,'fixture'),latest=snapshots.at(-1),old=snapshots.at(-2);
 verifySnapshot(latest);assert.equal(latest.parent_id,old.id);assert.equal(snapshots.length,3);
 for(const [id,m]of Object.entries(old.metrics))assert.equal(latest.metrics[id].value,m.value,id);
 for(const field of ['inputs','sources','observations','assumptions','scenarios'])assert.deepEqual(latest[field],old[field]);
 const changes=compareSnapshots(old,latest);assert.equal(changes.formula_change,true);assert.equal(changes.source_change,false);
 assert.equal(calculate(fixture).metrics['uni.required_share'].value,0.422);
 assert.equal(calculate(fixture).metrics['uni.price'].value,9);assert.ok(latest.inputs.every(m=>m.fixture));
});
