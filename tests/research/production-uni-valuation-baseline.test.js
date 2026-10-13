import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml,lineage} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {sensitivity} from '../../engine/sensitivity/index.js';
import {reviewUniAlignedValuation} from '../../engine/research/aligned-valuation.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='uni-valuation-baseline-20261007'),index=history.indexOf(saved),previous=history[index-1];
const proposal=readYaml('data/research/uni-valuation-baseline-2026-10-07.yaml');
const archiveFile='data/research/uni-aligned-valuation-2026-10-07-v1.json',bytes=fs.readFileSync(archiveFile),a=JSON.parse(bytes);
const digest=createHash('sha256').update(bytes).digest('hex'),research=reviewUniAlignedValuation(p,bytes,digest);
const update=metric=>saved.event.updates.find(u=>u.metric_id===metric),o=key=>a.observations.find(x=>x.key===key);

test('the reviewed refresh journal binds the digest-reviewed proposal and appends one immutable snapshot after the model upgrade',()=>{
 verifySnapshot(saved);assert.equal(saved.event.type,'research_refresh');assert.equal(saved.event.status,'completed');
 assert.deepEqual(saved.event.updates,proposal.observations);assert.deepEqual(saved.event.sources,proposal.sources);
 assert.deepEqual(saved.event.research_review,proposal.review);assert.match(saved.event.research_digest,/^[a-f0-9]{64}$/);
 assert.equal(previous.id,'c85cf219fd3820276cc0719700c794d17a1fd50781493c2a7ba735c2318379ae');assert.equal(saved.parent_id,previous.id);
 assert.equal(saved.id,'ca4e19d9b64103d887b551f8c0ccde58e5c29c75133694f67cbb4d8182a2f67a');assert.equal(history[index+1].event.id,'secz-mgstover-naming-20261013');
 assert.ok(proposal.reason.includes(digest));assert.equal(proposal.as_of_date,'2026-10-07');
 assert.ok(Date.parse(proposal.review.reviewed_at)>=Date.parse(a.captured_at));
});

test('supply observations carry exact block time and decimal-converted raw readings from the reviewed archive',()=>{
 for(const [metric,key] of [['uni.total_supply','total_supply'],['uni.dead_balance','dead_sink_balance'],['uni.timelock_balance','timelock_balance']]) {
  const u=update(metric),rawValue=BigInt(o(key).value),whole=rawValue/10n**18n,fraction=(rawValue%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');
  const exact=fraction?`${whole}.${fraction}`:`${whole}`;
  assert.deepEqual([u.classification,u.unit,u.version,u.fixture,u.confidence],['OBSERVED','UNI',1,false,'medium']);
  assert.equal(u.value,Number(exact));assert.equal(u.observed_at,a.anchor.effective_at);assert.equal(u.observed_at,'2026-10-07T11:02:47.000Z');
  assert.deepEqual(u.period,{basis:'point',end:'2026-10-07'});assert.equal(u.as_of_date,'2026-10-07');
  assert.ok(u.rationale.includes(`raw=${o(key).value}`)&&u.rationale.includes(`${exact} UNI`)&&u.rationale.includes(digest));
  assert.deepEqual(u.source_ids,['ethereum-uni-valuation-supply-20261007-v2']);
 }
 assert.equal(update('uni.total_supply').value,1e9);assert.equal(update('uni.dead_balance').value,112675581.21121952);
});

test('the v2 price is the closed same-minute candle and explicitly supersedes the 10/04 trade, which stays in history',()=>{
 const u=update('uni.price'),old=p.inputs.find(r=>r.id==='uni.price@1-coinbase-20261004');
 assert.deepEqual([u.id,u.version,u.supersedes,u.value,u.unit],['uni.price@2-coinbase-candle-20261007',2,'uni.price@1-coinbase-20261004',7.9914,'USD']);
 assert.equal(String(u.value),o('candle_close').value);assert.equal(u.value,Number(research.summary.price.candle_close));
 assert.deepEqual(u.price_window,{basis:'one_minute_close',start:'2026-10-07T11:02:00.000Z',end:'2026-10-07T11:03:00.000Z'});
 assert.equal(u.price_window.start,research.summary.price.candle_start_at);assert.equal(u.price_window.end,research.summary.price.candle_end_at);
 const block=Date.parse(update('uni.total_supply').observed_at);assert.ok(Date.parse(u.price_window.start)<=block&&block<Date.parse(u.price_window.end));
 assert.match(u.rationale,/同分鐘收盤價/);assert.match(u.rationale,/不保證與區塊同一瞬間/);assert.deepEqual(u.source_ids,['coinbase-uni-usd-candle-20261007-v2']);
 assert.ok(old&&old.value===9.0556&&old.as_of_date==='2026-10-04');assert.deepEqual(previous.inputs.find(r=>r.id===old.id),old);
});

test('v2 sources supersede the research-layer v1 sources and only add canonical coverage',()=>{
 for(const [v2,v1,added] of [['ethereum-uni-valuation-supply-20261007-v2','ethereum-uni-valuation-supply-20261007-v1',['uni.total_supply','uni.dead_balance','uni.timelock_balance']],
  ['coinbase-uni-usd-candle-20261007-v2','coinbase-uni-usd-candle-20261007-v1',['uni.price']]]) {
  const next=saved.sources.find(s=>s.id===v2),old=saved.sources.find(s=>s.id===v1);
  assert.deepEqual([next.version,next.supersedes,next.url,next.date,next.retrieved_at,next.tier,next.fixture],[2,v1,old.url,old.date,old.retrieved_at,old.tier,false]);
  assert.deepEqual(next.covered_metrics,[...old.covered_metrics,...added]);assert.deepEqual(previous.sources.find(s=>s.id===v1),old);
 }
 assert.equal(saved.sources.length,previous.sources.length+2);
});

test('canonical model valuation matches the reviewed research values and re-prices the distribution burden',()=>{
 const m=id=>saved.metrics[id],cents=value=>Math.floor(value*100)/100;
 assert.equal(m('uni.model_supply').value,1e9-112675581.21121952);assert.equal(m('uni.model_supply').observed_at,'2026-10-07T11:02:47.000Z');
 assert.equal(m('uni.model_market_cap').value,7.9914*(1e9-112675581.21121952));
 assert.equal(cents(m('uni.model_market_cap').value).toFixed(2),research.summary.bases[1].value_usd);
 assert.equal(cents(m('uni.fdv_current_supply').value).toFixed(2),research.summary.bases[0].value_usd);
 assert.deepEqual(m('uni.model_market_cap').period,{basis:'point',end:'2026-10-07'});assert.equal(m('uni.model_market_cap').classification,'DERIVED');
 assert.equal(m('uni.growth_distribution').value,20_000_000*7.9914);assert.equal(m('uni.growth_distribution').valuation_date,'2026-10-07');
 assert.equal(previous.metrics['uni.growth_distribution'].value,181112000);
 for(const id of ['uni.required_accrual','uni.required_share','uni.required_share_net','uni.net_accrual','uni.net_burn_yield','uni.market_cap','uni.fdv','uni.required_yield'])
  assert.equal(m(id).value,null,id);
 assert.equal(Object.values(saved.metrics).filter(x=>x.value===null).length,80);assert.equal(saved.period.end,'2026-10-07');
 assert.equal(saved.issues.filter(i=>i.severity==='ERROR'||i.severity==='WARNING').length,0);
 const ids=new Set();const walk=t=>{ids.add(t.metric.id);for(const c of t.inputs||[])walk(c);};walk(lineage(p,calculate(p),'uni.model_market_cap'));
 for(const id of ['uni.price@2-coinbase-candle-20261007','uni.total_supply@1-block26140081','uni.dead_balance@1-block26140081','uni.supply_basis_excludes_dead@1','uni.timelock_exclusion@1'])assert.ok(ids.has(id),id);
});

test('the named timelock scenario on production data matches the research scenario value',()=>{
 const r=sensitivity(p,{'uni.timelock_exclusion':1}),cap=r.metrics['uni.model_market_cap'].value;
 assert.equal(r.metrics['uni.timelock_exclusion'].scenario,'timelock_excluded');
 assert.equal((Math.floor(cap*100)/100).toFixed(2),research.summary.bases[2].value_usd);
 // D-20261012-01 later supplied the remaining inputs; the scenario re-prices required-share too.
 assert.equal(r.metrics['uni.required_share'].value,(0.05*cap+20_000_000*7.9914)/(4e12*2*0.000125));
});

test('only sources and observations changed; formulas, assumptions, scenarios, earlier history and Fixture stay intact',()=>{
 const diff=compareSnapshots(previous,saved);
 assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change,diff.rule_change],[true,false,false,false,false]);
 for(const field of ['formulas','rules','assets','graph','dictionary','sensitivity'])assert.deepEqual(saved[field],previous[field],field);
 for(const r of previous.inputs)assert.deepEqual(saved.inputs.find(x=>x.id===r.id),r,r.id);
 const before=fingerprint(history);
 const replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas},dictionary:saved.dictionary,sensitivity:saved.sensitivity},
  {history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 for(const snapshot of history)verifySnapshot(snapshot);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
 assert.ok(Object.values(saved.thesis).every(t=>t.coverage==='insufficient'));
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(readSnapshots(p.root,'fixture').length,4);
});
