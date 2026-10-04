import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {prepareEvent} from '../../engine/propagation/index.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const accrued=history.find(s=>s.event?.id==='uni-v2-fee-accrual-20261004');
const previous=history[history.indexOf(accrued)-1];

test('v2 LP receipt evidence preserves exact emitter, identity, integers and source chronology',()=>{
 verifySnapshot(accrued);
 const {propagated_nodes,...event}=accrued.event;
 assert.deepEqual(event,readYaml('data/research/uni-v2-fee-accrual-2026-10-04.yaml'));
 assert.equal(event.type,'protocol_fee_accrual');assert.equal(event.status,'completed');
 assert.deepEqual(propagated_nodes,['UNI']);assert.deepEqual(event.updates,[]);
 for(const token of ['26118477','2026-10-04T10:45:47Z','log 337','6952494133386631432161',
  '26118333','2026-10-04T10:16:23Z','log 413','523766',
  '0xb37f3ab2bb227c0e8b9b5aa837ecbbbac4c3c7da','0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
  '0xf38521f130fccf29db1961597bc5d2b60f995f85','25331798199101460550857024'])
  assert.ok(event.reason.includes(token),token);
 assert.equal(event.sources.length,4);assert.equal(event.source_ids.length,6);
 for(const id of event.source_ids) {
  const source=accrued.sources.find(s=>s.id===id);assert.ok(source,id);
  assert.ok(source.tier<=2);assert.equal(source.fixture,false);
  assert.ok(source.date<=event.effective_date);
  assert.ok(Date.parse(source.retrieved_at)<=Date.parse(event.research_review.reviewed_at));
 }
 for(const source of event.sources)assert.deepEqual(accrued.sources.find(s=>s.id===source.id),source);
});

test('fee accrual appends only sources and one journal without changing historical financial state',()=>{
 assert.equal(accrued.parent_id,previous.id);
 assert.equal(previous.id,'0abb51bb8a1c41e592d8e9bd9bc55c8ee7c8a2213b07154aad5217d974dd0a4c');
 assert.equal(accrued.sources.length,previous.sources.length+4);
 const comparison=compareSnapshots(previous,accrued);
 assert.equal(comparison.source_change,true);assert.deepEqual(comparison.changes,[]);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 for(const field of ['inputs','metrics','observations','assumptions','scenarios','formulas','rules','dictionary','graph',
  'assets','market_valuation','thesis','period','sensitivity'])assert.deepEqual(accrued[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(accrued.sources.find(s=>s.id===source.id),source);
 assert.equal(history.indexOf(accrued)+1,8);
 const fixture=loadProject('fixture');
 assert.ok(accrued.event.sources.every(s=>!fixture.sources.some(f=>f.id===s.id)));
});

test('LP shares and caller redemption cannot become canonical fees, UNI burn or an additional thesis period',()=>{
 assert.equal(Object.values(accrued.metrics).filter(m=>m.value===null).length,83);
 for(const id of ['uni.crypto_fees','uni.net_accrual','uni.fee','uni.required_share','uni.price','uni.fdv'])
  assert.equal(accrued.metrics[id].value,null,id);
 assert.match(accrued.event.reason,/LP 份額，不是 UNI token/);
 assert.match(accrued.event.reason,/不是 TokenJar 已贖回收入/);
 assert.match(accrued.event.reason,/未查證 reserve-product 成長全由交易費用造成/);
 assert.match(accrued.event.reason,/未完成部署 bytecode 等價/);
 assert.equal(new Set(history.slice(0,history.indexOf(accrued)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.ok(Object.values(accrued.thesis).every(t=>t.coverage==='insufficient'));
 const replay=calculate({...project,inputs:accrued.inputs,sources:accrued.sources,
  registry:{...project.registry,formulas:accrued.formulas}},
  {history:history.slice(0,history.indexOf(accrued)),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,accrued.metrics);assert.deepEqual(replay.thesis,accrued.thesis);
});

test('manual fee-accrual events retain ordinary evidence and temporal ingestion guards',()=>{
 const base={...project,inputs:previous.inputs,sources:previous.sources,registry:{version:1,formulas:previous.formulas}};
 const event=readYaml('data/research/uni-v2-fee-accrual-2026-10-04.yaml');
 assert.deepEqual(prepareEvent(base,event,history.slice(0,history.indexOf(accrued))).result.metrics,previous.metrics);
 const missing=structuredClone(event);missing.source_ids=['missing-fee-receipt'];
 assert.throws(()=>prepareEvent(base,missing),/Unknown event source/);
 const future=structuredClone(event);future.as_of_date='2099-01-01';
 assert.throws(()=>prepareEvent(base,future),/Event as-of cannot be in the future/);
 const synthetic=structuredClone(event);synthetic.sources[0].fixture=true;
 assert.throws(()=>prepareEvent(base,synthetic),/fixture|Fixture/);
});
