import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,validateProject,readYaml,lineage} from '../../engine/index.js';
import {checkPeriods} from '../../engine/validation/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {prepareResearchRefresh} from '../../engine/research/index.js';
import {project,change} from '../helpers.js';

// Opt in only in memory. Production formula adoption is a separate reviewed update.
function optIn(p) {
 for(const f of p.registry.formulas) {
  if(f.id==='f.uni.growth_distribution') {
   f.version++;f.period_policy='annual_rate_valuation';f.rate_input='uni.growth_budget';f.price_input='uni.price';
   f.description='歷史核准名目年率按單筆價格折算的模型負擔，不代表現行授權、實際支出或年度收入。';
  } else if(['f.uni.net_accrual','f.uni.net_burn_yield','f.uni.required_share','f.uni.required_share_net'].includes(f.id)) {
   f.version++;f.period_policy='valuation_compatible';
  }
 }
 return p;
}

test('explicit annual-rate valuation previews the real UNI quote without changing its historical inputs or files',()=>{
 const p=optIn(loadProject('production')),proposal=readYaml('data/research/uni-market-quote-pending-2026-10-04.yaml');
 const history=readSnapshots(p.root,'production'),before=fingerprint({p,history});
 validateProject(p);const prepared=prepareResearchRefresh(p,proposal),cost=prepared.result.metrics['uni.growth_distribution'];
 assert.equal(cost.value,181112000);assert.equal(cost.classification,'DERIVED');assert.equal(cost.unit,'USD/year');
 assert.deepEqual(cost.period,{basis:'model',end:'2026-10-04'});assert.equal(cost.valuation_date,'2026-10-04');
 assert.match(cost.rationale,/不代表現行授權/);assert.equal(prepared.preview.persisted,false);
 assert.equal(prepared.result.metrics['uni.growth_budget'].as_of_date,'2026-01-01');
 assert.deepEqual(prepared.result.metrics['uni.price'].period,{basis:'point',end:'2026-10-04'});
 for(const id of ['uni.net_accrual','uni.net_burn_yield','uni.required_share','uni.required_share_net']) {
  assert.equal(prepared.result.metrics[id].value,null);assert.equal(prepared.result.metrics[id].valuation_date,'2026-10-04');
  assert.deepEqual(prepared.result.metrics[id].period,cost.period);
 }
 assert.ok(!prepared.result.issues.some(i=>i.severity==='ERROR'));
 assert.ok(Object.values(prepared.result.thesis).every(t=>t.coverage==='insufficient'));
 assert.deepEqual(lineage(p,prepared.result,'uni.growth_distribution').inputs.map(n=>n.metric.id),['uni.growth_budget@2-verified-20260101','uni.price@1-coinbase-20261004']);
 assert.equal(fingerprint({p,history:readSnapshots(p.root,'production')}),before);
});

test('explicit valuation preserves every fixture economic value including 0.422',()=>{
 const p=project(),before=calculate(p),after=calculate(optIn(p));
 for(const [id,m]of Object.entries(before.metrics))assert.equal(after.metrics[id].value,m.value,id);
 assert.equal(after.metrics['uni.required_share'].value,0.422);
 assert.equal(after.metrics['uni.required_share'].valuation_date,'2025-12-31');
 assert.ok(!after.issues.some(i=>i.severity==='ERROR'));
});

test('a recent point quote cannot silently mix with known older annual economics',()=>{
 const p=optIn(project());change(p,'uni.growth_budget',20e6,{period:{basis:'model',end:'2025-12-31'}});
 change(p,'uni.price',9.0556,{as_of_date:'2026-10-04',period:{basis:'point',end:'2026-10-04'}});
 const result=calculate(p);
 assert.equal(result.metrics['uni.growth_distribution'].value,181112000);
 for(const id of ['uni.net_accrual','uni.required_share','uni.required_share_net'])
  assert.ok(result.issues.some(i=>i.metric_id===id&&/Unaligned accounting periods/.test(i.message)));
});

test('missing price or budget propagates null instead of fabricating an annual amount',()=>{
 for(const id of ['uni.price','uni.growth_budget']) {
  const p=optIn(project());change(p,id,null);const result=calculate(p);
  assert.equal(result.metrics['uni.growth_distribution'].value,null);
  assert.equal(result.metrics['uni.net_accrual'].value,null);assert.ok(!result.issues.some(i=>i.severity==='ERROR'));
 }
});

for(const [name,edit,pattern] of [
 ['future nominal rate',p=>change(p,'uni.growth_budget',20e6,{as_of_date:'2026-01-01',period:{basis:'model',end:'2026-01-01'}}),/later rate/],
 ['old accounting flow',p=>change(p,'uni.price',9,{as_of_date:'2026-10-04',period:{basis:'point',end:'2026-10-04'}}),/Historical accounting flows/],
 ['non-point price',p=>change(p,'uni.price',9,{period:{basis:'model',end:'2025-12-31'}}),/point quote/]
])test(`annual-rate valuation rejects ${name}`,()=>{
 const p=optIn(project());edit(p);assert.ok(calculate(p).issues.some(i=>i.metric_id==='uni.growth_distribution'&&pattern.test(i.message)));
});

test('valuation date survives null downstreams and rejects contradictory valuation dates or quarterly flows',()=>{
 const metric=(end,basis='model',value=null)=>({value,valuation_date:end,period:{basis,end}});
 const formula={id:'test-only-valuation',period_policy:'valuation_compatible'};
 assert.deepEqual(checkPeriods(formula,[metric('2026-10-04'),{value:null,period:{basis:'annual',end:'2025-12-31'}}]),{basis:'model',end:'2026-10-04'});
 assert.throws(()=>checkPeriods(formula,[metric('2026-10-04'),metric('2026-10-03')]),/Unaligned valuation dates/);
 assert.throws(()=>checkPeriods(formula,[metric('2026-10-04'),{value:1,period:{basis:'quarterly',end:'2026-10-04'}}]),/accounting bases/);
 assert.throws(()=>checkPeriods({id:'test-only-legacy',period_policy:'compatible'},[metric('2026-10-04')]),/Explicit valuation period policy/);
});

test('declared rate/price roles and multiplication are validated without arbitrary expression evaluation',()=>{
 for(const edit of [f=>delete f.price_input,f=>f.price_input=f.rate_input,f=>f.expression.op='add',f=>f.expression.args.push('uni.other_dilution')]) {
  const p=optIn(project());edit(p.registry.formulas.find(f=>f.id==='f.uni.growth_distribution'));
  assert.throws(()=>validateProject(p),/Invalid .*valuation|Invalid project registries/);
 }
 const p=project();p.inputs[0].valuation_date='2025-12-31';assert.throws(()=>validateProject(p),/Invalid metric/);
});
