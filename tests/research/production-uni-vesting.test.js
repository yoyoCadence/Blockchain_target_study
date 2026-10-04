import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {inspectReviewedEvents} from '../../engine/research/event-evidence.js';

const p=loadProject('production'),history=readSnapshots(p.root,'production');
const saved=history.find(s=>s.event?.id==='uni-vesting-execution-20261004'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync(new URL('../../data/research/uni-vesting-execution-2026-10-04-v1.json',import.meta.url));
const archive=JSON.parse(raw);

test('UNI quarterly execution retains its exact three logs and separates the later unpinned reader',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/uni-vesting-execution-2026-10-04.yaml'));
 assert.deepEqual(propagated_nodes,['UNI']);assert.deepEqual(event.updates,[]);
 assert.equal(event.as_of_date,'2026-10-04');assert.equal(event.effective_date,'2026-10-01');
 assert.equal(archive.receipt.status,'Success');assert.equal(archive.receipt.block,'26098816');
 assert.equal(archive.receipt.effective_at,'2026-10-01T16:59:35Z');
 const [approval,transfer,withdrawn]=archive.receipt.logs;
 assert.deepEqual(archive.receipt.logs.map(l=>[l.index,l.event]),[[406,'Approval'],[407,'Transfer'],[408,'Withdrawn']]);
 assert.equal(approval.amount_raw,'20000000000000000000000000');
 assert.equal(transfer.amount_raw,'5000000000000000000000000');
 assert.equal(withdrawn.amount_raw,transfer.amount_raw);assert.equal(withdrawn.recipient,transfer.to);
 assert.equal(withdrawn.quarters_paid_raw,'1');assert.equal(transfer.from,approval.owner);
 assert.notEqual(approval.emitter,withdrawn.emitter);assert.notEqual(approval.amount_raw,transfer.amount_raw);
 assert.equal(archive.live_reader.getters.quarterlyVestingAmount,transfer.amount_raw);
 for(const field of ['block_number','block_hash','response_timestamp'])assert.equal(archive.live_reader[field],null);
 assert.equal(archive.live_reader.confidence,'low');assert.equal(archive.live_reader.contract_source_status,'Similar Match');
 const hash=createHash('sha256').update(raw).digest('hex');
 assert.equal(hash,'7f651374e3553eb5625c605c6990633177fd351442b371bb0402d9eccc586cd6');assert.ok(event.reason.includes(hash));
 for(const section of [archive.receipt,archive.live_reader]) {
  assert.equal(section.classification,'OBSERVED');assert.equal(section.as_of_date,'2026-10-04');
  assert.ok(section.source_ids.every(id=>event.source_ids.includes(id)));
 }
 for(const source of event.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 assert.equal(event.sources[0].date,'2026-10-01');assert.equal(event.sources[1].date,'2026-10-04');
 assert.deepEqual(saved.sources.find(s=>s.id==='uniswap-vesting-source-9dbc671-v1'),previous.sources.find(s=>s.id==='uniswap-vesting-source-9dbc671-v1'));
});

test('executed quarterly transfer adds evidence without renewing the old rate or annualizing financial inputs',()=>{
 assert.equal(saved.parent_id,'98d14672840df6918c47b86e3099f773d406031b6b462d0df38109e9e0b96ad3');
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 // Journal loading uses filenames; compare records by ID rather than array order.
 const byId=records=>[...records].sort((a,b)=>a.id.localeCompare(b.id));
 for(const field of ['inputs','observations'])assert.deepEqual(byId(saved[field]),byId(previous[field]),field);
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph',
  'market_valuation','sensitivity','dictionary','thesis','period'])assert.deepEqual(saved[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 assert.equal(saved.sources.length,previous.sources.length+2);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
 assert.equal(saved.metrics['uni.growth_budget'].as_of_date,'2026-01-01');
 assert.equal(saved.metrics['uni.growth_distribution'].value,181112000);
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-04'}).inputs.find(m=>m.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 assert.match(saved.event.reason,/不是新增轉帳或最新 allowance/);assert.match(saved.event.reason,/不年度化/);
 assert.match(saved.event.reason,/未驗證部署 bytecode 等價/);
 for(const id of ['uni.crypto_fees','uni.net_accrual','uni.market_cap','uni.fdv'])assert.equal(saved.metrics[id].value,null,id);
});

test('vesting evidence replays and read-only inspection retains original dates while isolating fixture',()=>{
 const before=fingerprint(history),replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,
  registry:{...p.registry,formulas:saved.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 assert.equal(saved.period.end,'2026-10-04');assert.equal(new Set(history.slice(0,index+1).map(s=>s.period.end)).size,2);
 assert.ok(Object.values(saved.thesis).every(t=>t.coverage==='insufficient'&&t.triggered_rules.length===0));
 const inspected=inspectReviewedEvents(p).find(e=>e.id===saved.event.id);
 assert.equal(inspected.recorded_update_count,0);assert.equal(inspected.event.effective_date,'2026-10-01');
 assert.deepEqual(inspected.sources,saved.event.source_ids.map(id=>saved.sources.find(s=>s.id===id)));
 const fixture=loadProject('fixture');assert.deepEqual(inspectReviewedEvents(fixture),[]);
 assert.ok(saved.event.sources.every(s=>!fixture.sources.some(f=>f.id===s.id)));
 assert.equal(calculate(fixture).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,'production')),before);
});
