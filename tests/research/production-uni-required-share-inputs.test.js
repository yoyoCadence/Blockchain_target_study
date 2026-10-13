import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,lineage} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {sensitivity} from '../../engine/sensitivity/index.js';

// D-20261012-01 (reports/decision-log.md): analyst-approved required-share inputs, appended as v2 records.
const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.id==='f096f2c3eb12ac7c72ef7c6ff338d513eb483ef14aa5597797d2205f063bcfe8'),previous=history[history.indexOf(saved)-1];
const record=id=>p.inputs.find(r=>r.id===id);
const share=(cap,{aum=4e12,fee=0.000125}={})=>(0.05*cap+20_000_000*7.9914)/(aum*2*1*1*fee);

test('v2 records carry the decision values, classifications, supersedes and model period basis',()=>{
 for(const [id,value,classification,old] of [['uni.required_yield@2',0.05,'ASSUMPTION','uni.required_yield@1'],['uni.turnover@2',2,'ASSUMPTION','uni.turnover@1'],['uni.fee@2',0.000125,'ASSUMPTION','uni.fee@1'],
  ['market.equity_aum@2',4e12,'SCENARIO','market.equity_aum@1'],['uni.onchain_share@2',1,'SCENARIO','uni.onchain_share@1'],['uni.amm_share@2',1,'SCENARIO','uni.amm_share@1']]) {
  const r=record(id);assert.deepEqual([r.value,r.classification,r.supersedes,r.version,r.confidence,r.fixture],[value,classification,old,2,'low',false],id);
  assert.deepEqual(r.period,{basis:'model',end:'2025-12-31'},id);assert.equal(r.as_of_date,'2026-10-12');assert.match(r.rationale,/D-20261012-01/);
  assert.equal(record(old).value,null,old);
 }
 assert.equal(record('uni.turnover@1').period.basis,'annual');
 assert.deepEqual([record('uni.onchain_share@2').scenario,record('uni.amm_share@2').scenario],['all_onchain_amm_upper_bound','all_onchain_amm_upper_bound']);
 assert.deepEqual(record('market.equity_aum@2').range,[2e12,6e12]);
});

test('required-share computes as the minimum share under the upper-bound scenario; full net economics stays null',()=>{
 const r=calculate(p),cap=r.metrics['uni.model_market_cap'].value;
 assert.equal(r.metrics['uni.required_share'].value,share(cap));assert.equal(Math.round(r.metrics['uni.required_share'].value*1000),514);
 assert.equal(r.metrics['uni.required_accrual'].value,0.05*cap);
 for(const id of ['uni.required_share_net','uni.net_accrual','uni.gross_accrual','uni.equity_revenue'])assert.equal(r.metrics[id].value,null,id);
 assert.equal(Object.values(r.metrics).filter(m=>m.value===null).length,72);
 assert.equal(r.issues.filter(i=>i.severity==='ERROR'||i.severity==='WARNING').length,0);
 // STRESS needs fee < 0.5 bp as well as share > 50%; thresholds are analyst-defined and unchanged.
 assert.equal(r.thesis.UNI.triggered_rules.length,0);assert.equal(r.thesis.UNI.coverage,'insufficient');
 const ids=new Set(),walk=t=>{ids.add(t.metric.id);for(const c of t.inputs||[])walk(c);};walk(lineage(p,r,'uni.required_share'));
 for(const id of ['uni.required_yield@2','uni.turnover@2','uni.fee@2','market.equity_aum@2','uni.onchain_share@2','uni.amm_share@2','uni.supply_basis_excludes_dead@1','uni.price@2-coinbase-candle-20261007'])assert.ok(ids.has(id),id);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
});

test('sensitivity cases match the decision log, including the >100% infeasibility warning',()=>{
 const cap=calculate(p).metrics['uni.model_market_cap'].value,run=o=>sensitivity(p,o);
 for(const [o,expected,warn] of [[{'market.equity_aum':2e12},share(cap,{aum:2e12}),true],[{'market.equity_aum':6e12},share(cap,{aum:6e12}),false],
  [{'uni.fee':0.00005},share(cap,{fee:0.00005}),true],[{'uni.fee':0.0002},share(cap,{fee:0.0002}),false]]) {
  const r=run(o);assert.equal(r.metrics['uni.required_share'].value,expected);
  assert.equal(r.issues.some(i=>i.severity==='WARNING'&&/exceeds 100%/.test(i.message)),warn,JSON.stringify(o));
 }
 const t=run({'uni.timelock_exclusion':1});assert.equal(t.metrics['uni.required_share'].value,share(t.metrics['uni.model_market_cap'].value));
 assert.deepEqual([Math.round(share(cap,{aum:2e12})*1000),Math.round(share(cap,{aum:6e12})*1000),Math.round(t.metrics['uni.required_share'].value*1000)],[1029,343,410]);
});

test('the snapshot appends assumption and scenario changes only, after the SEC source-only snapshot',()=>{
 verifySnapshot(saved);assert.equal(previous.event?.id,'secz-mgstover-naming-20261013');assert.equal(saved.parent_id,previous.id);
 const diff=compareSnapshots(previous,saved);
 assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change,diff.rule_change],[false,false,true,true,false]);
 for(const r of previous.inputs)assert.deepEqual(saved.inputs.find(x=>x.id===r.id),r,r.id);
 assert.equal(saved.inputs.length,previous.inputs.length+6);assert.equal(previous.metrics['uni.required_share'].value,null);
 assert.deepEqual(saved.metrics,calculate(p).metrics);
});
