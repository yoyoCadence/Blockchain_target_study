import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {inspectReviewedEvents} from '../../engine/research/event-evidence.js';

const p=loadProject('production'),history=readSnapshots(p.root,'production');
const saved=history.find(s=>s.event?.id==='uni-vesting-fixed-block-20261004'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync(new URL('../../data/research/uni-vesting-fixed-block-2026-10-04-v1.json',import.meta.url));
const archive=JSON.parse(raw),probe=JSON.parse(archive.transport.probe.response_json);
const requests=JSON.parse(archive.transport.state.request_json),responses=JSON.parse(archive.transport.state.response_json);
const response=id=>responses.find(r=>r.id===id),get=id=>archive.observations.find(o=>o.id===id);

test('fixed-block UNI archive retains raw request/response and pins every state query to one canonical hash',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/uni-vesting-fixed-block-2026-10-04.yaml'));
 assert.deepEqual(propagated_nodes,['UNI']);assert.deepEqual(event.updates,[]);
 assert.equal(createHash('sha256').update(raw).digest('hex'),'cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195');
 assert.ok(event.reason.includes(createHash('sha256').update(raw).digest('hex')));
 assert.equal(probe.find(r=>r.id===1).result,'0x1');const header=probe.find(r=>r.id===2).result;
 assert.equal(BigInt(header.number).toString(),archive.anchor.number);assert.equal(archive.anchor.number,'26119713');
 assert.equal(header.hash,archive.anchor.hash);assert.equal(response(19).result.hash,header.hash);
 assert.equal(new Date(Number(BigInt(header.timestamp))*1000).toISOString(),archive.anchor.effective_at);
 assert.equal(archive.anchor.effective_at,'2026-10-04T14:53:11.000Z');
 assert.deepEqual(archive.anchor.selector,{blockHash:header.hash,requireCanonical:true});
 for(const request of requests.filter(r=>['eth_call','eth_getCode'].includes(r.method))) {
  assert.deepEqual(request.params[1],archive.anchor.selector);
  assert.equal(response(request.id).error,undefined);
 }
 for(const observation of archive.observations) {
  assert.equal(observation.response_word,response(observation.response_id).result);
  assert.equal(observation.value,observation.abi_type==='address'?'0x'+observation.response_word.slice(-40):BigInt(observation.response_word).toString());
  assert.equal(observation.classification,'OBSERVED');assert.equal(observation.as_of_date,'2026-10-04');
  assert.deepEqual(observation.source_ids,[event.sources[0].id]);
 }
 assert.equal(event.sources[0].retrieved_at,archive.transport.state.received_at);
 assert.ok(Date.parse(archive.anchor.effective_at)<Date.parse(archive.captured_at));
 assert.ok(Date.parse(archive.captured_at)<=Date.parse(event.research_review.reviewed_at));
});

test('point allowance and unverified runtime preserve their units and the independent receipt-null limitation',()=>{
 assert.equal(get('quarterlyVestingAmount').value,'5000000000000000000000000');
 assert.equal(get('quartersPassed').value,'0');assert.equal(get('lastUnlockTimestamp').value,'1790812800');
 assert.equal(get('allowance(owner,vesting)').value,'20000000000000000000000000');assert.equal(get('UNI decimals').value,'18');
 const allowance=requests.find(r=>r.id===16);
 assert.equal(allowance.params[0].to,get('UNI').value);
 assert.equal(allowance.params[0].data,'0xdd62ed3e'+get('owner').value.slice(2).padStart(64,'0')+'ca046a83edb78f74ae338bb5a291bf6fdac9e1d2'.padStart(64,'0'));
 const runtime=Buffer.from(response(18).result.slice(2),'hex');assert.equal(runtime.length,4373);
 assert.equal(createHash('sha256').update(runtime).digest('hex'),archive.runtime_bytecode.sha256);
 assert.equal(archive.runtime_bytecode.deployment_source_equivalence,null);
 assert.equal(response(20).result,null);assert.equal(archive.prior_receipt_check.result,null);
 const earlier=history.find(s=>s.event?.id==='uni-vesting-execution-20261004');
 assert.equal(earlier.event.effective_date,'2026-10-01');assert.ok(earlier.event.reason.includes('Success')||earlier.event.reason.includes('成功 receipt'));
 assert.match(saved.event.reason,/本次未能 RPC 交叉確認/);assert.match(saved.event.reason,/未驗證部署 source 等價/);
 assert.match(saved.event.reason,/不能視為新增轉帳、年度分配/);
});

test('fixed-block evidence appends one source and replays without renewing stale financial inputs or adding thesis periods',()=>{
 assert.equal(saved.parent_id,'f6580ef3404008689fffa5895f4a12ed9fb30688f5dc9de8a605593940c55f5d');
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 const byId=records=>[...records].sort((a,b)=>a.id.localeCompare(b.id));
 for(const field of ['inputs','observations'])assert.deepEqual(byId(saved[field]),byId(previous[field]),field);
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','market_valuation','sensitivity','dictionary','thesis','period'])assert.deepEqual(saved[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 assert.equal(saved.sources.length,previous.sources.length+1);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-04'}).inputs.find(m=>m.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 const before=fingerprint(history),replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 assert.equal(new Set(history.slice(0,index+1).map(s=>s.period.end)).size,2);
 const inspected=inspectReviewedEvents(p).find(e=>e.id===saved.event.id);
 assert.equal(inspected.recorded_update_count,0);assert.equal(inspected.event.effective_date,'2026-10-04');
 const fixture=loadProject('fixture');assert.deepEqual(inspectReviewedEvents(fixture),[]);
 assert.equal(calculate(fixture).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,'production')),before);
});
