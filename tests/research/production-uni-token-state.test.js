import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {inspectReviewedEvents} from '../../engine/research/event-evidence.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode),saved=history.find(s=>s.event?.id==='uni-token-state-20261004'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync(new URL('../../data/research/uni-token-state-2026-10-04-v1.json',import.meta.url)),a=JSON.parse(raw);
const requests=JSON.parse(a.transport.request_json),replies=JSON.parse(a.transport.response_json),get=id=>replies.find(r=>r.id===id).result;

test('UNI owner balance and totalSupply preserve exact same-block ABI evidence and the original anchor dependency',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;assert.deepEqual(event,readYaml('data/research/uni-token-state-2026-10-04.yaml'));
 const hash=createHash('sha256').update(raw).digest('hex');assert.equal(hash,'848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d');assert.ok(event.reason.includes(hash));
 assert.equal(get(1),'0x1');assert.equal(get(2).hash,a.anchor.hash);assert.equal(get(2).number,a.anchor.number_hex);
 assert.equal(get(2).timestamp,a.anchor.timestamp_hex);assert.equal(a.anchor.number,'26119713');
 assert.equal(a.anchor.selected_tag,'previously_observed_finalized');
 for(const request of requests.filter(r=>r.method==='eth_call')) {
  assert.deepEqual(request.params[1],{blockHash:a.anchor.hash,requireCanonical:true});assert.equal(request.params[0].to,a.token);
 }
 assert.equal(requests.find(r=>r.id===3).params[0].data,'0x70a08231'+a.owner.slice(2).padStart(64,'0'));
 assert.equal(requests.find(r=>r.id===4).params[0].data,'0x18160ddd');assert.equal(requests.find(r=>r.id===5).params[0].data,'0x313ce567');
 assert.equal(requests.find(r=>r.id===6).params[0].data,'0xdd62ed3e'+a.owner.slice(2).padStart(64,'0')+a.vesting.slice(2).padStart(64,'0'));
 for(const o of a.observations) {assert.equal(o.response_word,get(o.response_id));assert.equal(o.value,BigInt(o.response_word).toString());assert.equal(o.classification,'OBSERVED');assert.equal(o.fixture,false);assert.equal(o.period.basis,'point');assert.equal(o.observed_at,a.anchor.effective_at);assert.equal(o.as_of_date,'2026-10-04');assert.ok(o.source_ids.every(id=>event.source_ids.includes(id)));}
 assert.deepEqual(a.observations.map(o=>o.value),['262247996305835021033106178','1000000000000000000000000000','18','20000000000000000000000000']);
 const old=JSON.parse(fs.readFileSync('data/research/uni-vesting-fixed-block-2026-10-04-v1.json'));
 assert.equal(a.owner,old.observations.find(o=>o.response_id===12).value);assert.equal(a.owner_identity_dependency.block_hash,old.anchor.hash);
 assert.equal(a.owner_identity_dependency.archive_id,old.id);assert.equal(a.owner_identity_dependency.archive_sha256,'cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195');
 assert.equal(event.sources[0].retrieved_at,a.captured_at);assert.ok(Date.parse(a.captured_at)<=Date.parse(event.research_review.reviewed_at));
});

test('point balance coverage replays its versioned BigInt comparison and cannot become a financial supply denominator',()=>{
 const [formula]=a.formulas,[derived]=a.derived;
 assert.equal(formula.version,1);assert.equal(formula.expression.op,'gte_raw_uint256');
 assert.equal(derived.classification,'DERIVED');assert.equal(derived.formula_id,formula.id);assert.equal(derived.formula_version,1);
 assert.deepEqual(derived.dependencies,formula.expression.args);
 const [balance,allowance]=derived.dependencies.map(id=>a.observations.find(o=>o.id===id));
 assert.equal(balance.unit,allowance.unit);assert.equal(derived.value,BigInt(balance.value)>=BigInt(allowance.value)?1:0);
 assert.equal(derived.value,1);assert.equal(derived.period.basis,'point');assert.equal(derived.fixture,false);
 assert.match(saved.event.reason,/不是健康論點或付款保證/);assert.match(saved.event.reason,/不是流通／自由流通供給/);
 for(const id of ['uni.market_cap','uni.fdv','uni.net_accrual','uni.crypto_fees'])assert.equal(saved.metrics[id].value,null);
});

test('token-state source appends without financial changes, history periods or renewed budget evidence',()=>{
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 const byId=records=>[...records].sort((x,y)=>x.id.localeCompare(y.id));
 for(const field of ['inputs','observations'])assert.deepEqual(byId(saved[field]),byId(previous[field]));
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])assert.deepEqual(saved[field],previous[field]);
 for(const source of previous.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 assert.equal(saved.sources.length,previous.sources.length+1);assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-04'}).inputs.find(m=>m.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 const before=fingerprint(history),replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 assert.equal(new Set(history.slice(0,index+1).map(s=>s.period.end)).size,2);
 assert.equal(inspectReviewedEvents(p).find(e=>e.id===saved.event.id).recorded_update_count,0);
 assert.deepEqual(inspectReviewedEvents(loadProject('fixture')),[]);assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
