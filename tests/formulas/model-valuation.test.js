import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,lineage,validateProject} from '../../engine/index.js';
import {checkPeriods} from '../../engine/validation/index.js';
import {sensitivity} from '../../engine/sensitivity/index.js';
import {readSnapshots,assertVersionHistory} from '../../engine/snapshots.js';

const fixture=()=>loadProject('fixture'),production=()=>loadProject('production');
const formula=(p,id)=>p.registry.formulas.find(f=>f.id===id);
// Collect every metric id reachable in a lineage tree.
const reach=(tree,out=new Set())=>{out.add(tree.metric.metric_id);for(const child of tree.inputs||[])reach(child,out);return out;};

test('model valuation metrics are new versioned formulas; legacy direct inputs stay but no formula reads them',()=>{
 const p=fixture(),d=Object.fromEntries(p.dictionary.metrics.map(m=>[m.id,m]));
 assert.equal(p.dictionary.metrics.length,92);assert.equal(p.registry.formulas.length,28);assert.equal(p.registry.version,3);
 for(const [id,kind,unit] of [['uni.total_supply','input','UNI'],['uni.dead_balance','input','UNI'],['uni.timelock_balance','input','UNI'],
  ['uni.supply_basis_excludes_dead','input','ratio'],['uni.timelock_exclusion','input','ratio'],['uni.model_supply','derived','UNI'],
  ['uni.model_market_cap','derived','USD'],['uni.fdv_current_supply','derived','USD'],['uni.market_cap','input','USD'],['uni.fdv','input','USD']])
  assert.deepEqual([d[id].kind,d[id].unit],[kind,unit],id);
 assert.deepEqual([d['uni.timelock_exclusion'].minimum,d['uni.timelock_exclusion'].maximum],[0,1]);
 assert.deepEqual([d['uni.supply_basis_excludes_dead'].minimum,d['uni.supply_basis_excludes_dead'].maximum],[0,1]);
 const versions=Object.fromEntries(p.registry.formulas.map(f=>[f.id,[f.version,f.period_policy]]));
 assert.deepEqual(versions['f.uni.model_supply'],[1,'same_block_point']);assert.deepEqual(versions['f.uni.model_market_cap'],[1,'aligned_price_valuation']);
 assert.deepEqual(versions['f.uni.fdv_current_supply'],[1,'aligned_price_valuation']);
 assert.deepEqual(versions['f.uni.required_accrual'],[2,'compatible']);assert.deepEqual(versions['f.uni.net_burn_yield'],[3,'valuation_compatible']);
 assert.deepEqual(formula(p,'f.uni.required_accrual').expression,{op:'mul',args:['uni.model_market_cap','uni.required_yield']});
 assert.deepEqual(formula(p,'f.uni.net_burn_yield').expression,{op:'div',args:['uni.net_accrual','uni.model_market_cap']});
 assert.deepEqual(formula(p,'f.uni.model_market_cap').expression,{op:'mul',args:['uni.price','uni.model_supply']});
 assert.deepEqual(formula(p,'f.uni.fdv_current_supply').expression,{op:'mul',args:['uni.price','uni.total_supply']});
 assert.match(formula(p,'f.uni.fdv_current_supply').description,/未含未來增發/);assert.match(formula(p,'f.uni.model_market_cap').description,/流通量尚未完整查證/);
 const serialized=JSON.stringify(p.registry.formulas.map(f=>f.expression));
 assert.equal(serialized.includes('"uni.market_cap"'),false);assert.equal(serialized.includes('"uni.fdv"'),false);
 for(const mode of ['fixture','production']){const q=loadProject(mode);assertVersionHistory(readSnapshots(q.root,mode).at(-1),q);}
});

test('fixture regression keeps required share 0.422 by reconstructing the legacy market cap exactly',()=>{
 const p=fixture(),r=calculate(p),v=id=>r.metrics[id].value;
 assert.equal(v('uni.model_supply'),537777777.7777778);assert.equal(v('uni.model_market_cap'),4840000000);assert.equal(v('uni.model_market_cap'),v('uni.market_cap'));
 assert.equal(v('uni.fdv_current_supply'),9000000000);assert.equal(v('uni.fdv_current_supply'),v('uni.fdv'));
 assert.equal(v('uni.required_accrual'),242000000);assert.equal(v('uni.growth_distribution'),180000000);assert.equal(v('uni.required_share'),0.422);
 assert.equal(v('uni.required_share_net'),0.337);assert.equal(v('uni.net_burn_yield'),205000000/4840000000);
 assert.deepEqual(r.metrics['uni.model_market_cap'].period,{basis:'point',end:'2025-12-31'});
 assert.equal(r.issues.filter(i=>i.severity==='ERROR').length,0);assert.equal(r.issues.filter(i=>i.severity==='UNKNOWN').length,1);
});

test('required share inherits the versioned supply-basis assumption and the Timelock flag through its lineage',()=>{
 const p=fixture(),r=calculate(p);
 for(const id of ['uni.required_share','uni.required_share_net','uni.net_burn_yield','uni.required_accrual']) {
  const ids=reach(lineage(p,r,id));
  for(const dep of ['uni.model_market_cap','uni.model_supply','uni.supply_basis_excludes_dead','uni.timelock_exclusion','uni.dead_balance','uni.price'])assert.ok(ids.has(dep),`${id} -> ${dep}`);
  assert.equal(ids.has('uni.market_cap'),false);
 }
 const prod=production(),basis=prod.inputs.find(m=>m.id==='uni.supply_basis_excludes_dead@1'),flag=prod.inputs.find(m=>m.id==='uni.timelock_exclusion@1');
 assert.deepEqual([basis.classification,basis.value,basis.version,basis.fixture],['ASSUMPTION',1,1,false]);assert.match(basis.rationale,/不是已驗證的流通量/);assert.match(basis.rationale,/繼承此依賴/);
 assert.deepEqual([flag.classification,flag.value,flag.version],['ASSUMPTION',0,1]);assert.match(flag.rationale,/具名情境 timelock_excluded/);
 assert.equal(basis.as_of_date,'2026-10-07');assert.equal(basis.period.end,'2025-12-31');
});

test('the named timelock_excluded scenario recomputes model supply, market cap and required share together',()=>{
 const p=fixture(),base=calculate(p),r=sensitivity(p,{'uni.timelock_exclusion':1}),v=id=>r.metrics[id].value;
 const flag=r.metrics['uni.timelock_exclusion'];
 assert.deepEqual([flag.classification,flag.scenario,flag.value],['SCENARIO','timelock_excluded',1]);assert.match(flag.rationale,/不是觀測事實/);
 assert.equal(flag.base_record_id,'uni.timelock_exclusion@1');
 assert.equal(v('uni.model_supply'),537777777.7777778-250000000);assert.equal(v('uni.model_market_cap'),9*(537777777.7777778-250000000));
 assert.equal(v('uni.required_accrual'),v('uni.model_market_cap')*0.05);
 assert.equal(v('uni.required_share'),(v('uni.required_accrual')+180000000)/(4e12*2*1*1*0.000125));
 assert.ok(v('uni.required_share')<base.metrics['uni.required_share'].value);assert.equal(v('uni.fdv_current_supply'),9000000000);
 const other=sensitivity(p,{'uni.timelock_exclusion':0.5}).metrics['uni.timelock_exclusion'];
 assert.equal(other.scenario,'Interactive sensitivity — unsaved');
 assert.throws(()=>sensitivity(p,{'uni.timelock_exclusion':2}),/Above maximum/);
});

const at='2026-10-07T11:02:47.000Z';
const dep=(metric_id,value,unit,extra={})=>({id:metric_id+'@t',metric_id,value,unit,period:{basis:'point',end:'2026-10-07'},as_of_date:'2026-10-07',fixture:false,classification:'OBSERVED',...extra});
const flagDep=(metric_id,value)=>({id:metric_id+'@t',metric_id,value,unit:'ratio',period:{basis:'model',end:'2025-12-31'},as_of_date:'2026-10-07',fixture:false,classification:'ASSUMPTION'});
const window={basis:'one_minute_close',start:'2026-10-07T11:02:00.000Z',end:'2026-10-07T11:03:00.000Z'};

test('same-block policy requires one block time for real supply readings and ignores model flags',()=>{
 const f=formula(fixture(),'f.uni.model_supply'),flags=[flagDep('uni.supply_basis_excludes_dead',1),flagDep('uni.timelock_exclusion',0)];
 const supply=(extra={})=>['uni.total_supply','uni.dead_balance','uni.timelock_balance'].map(id=>dep(id,1,'UNI',{observed_at:at,...extra[id]}));
 assert.deepEqual(checkPeriods(f,[...supply(),...flags]),{basis:'point',end:'2026-10-07'});
 assert.throws(()=>checkPeriods(f,[...supply({'uni.dead_balance':{observed_at:'2026-10-07T11:02:59.000Z'}}),...flags]),/one block time/);
 assert.throws(()=>checkPeriods(f,[...supply({'uni.dead_balance':{observed_at:undefined}}),...flags]),/one block time/);
 assert.throws(()=>checkPeriods(f,[...supply({'uni.dead_balance':{period:{basis:'point',end:'2026-10-06'}}}),...flags]),/Unaligned supply dates/);
 assert.throws(()=>checkPeriods(f,[...supply({'uni.total_supply':{period:{basis:'annual',end:'2026-10-07'}}}),...flags]),/Point-in-time supply/);
 // Synthetic fixture readings may align by day only; unknown readings carry no time evidence.
 const synthetic=supply().map(m=>({...m,fixture:true,observed_at:undefined}));assert.deepEqual(checkPeriods(f,[...synthetic,...flags]).basis,'point');
 assert.equal(checkPeriods(f,[...supply().map(m=>({...m,value:null})),...flags]).basis,'model');
});

test('same-minute policy needs a closed one-minute window that contains the block time for real values',()=>{
 const f=formula(fixture(),'f.uni.model_market_cap'),supply=dep('uni.model_supply',1,'UNI',{classification:'DERIVED',observed_at:at});
 const price=(extra={})=>dep('uni.price',7.9914,'USD',{price_window:window,...extra});
 assert.deepEqual(checkPeriods(f,[price(),supply]),{basis:'point',end:'2026-10-07'});
 assert.throws(()=>checkPeriods(f,[price({price_window:undefined}),supply]),/one-minute close and a block time/);
 assert.throws(()=>checkPeriods(f,[price(),{...supply,observed_at:undefined}]),/one-minute close and a block time/);
 assert.throws(()=>checkPeriods(f,[price({price_window:{...window,start:'2026-10-07T11:03:00.000Z',end:'2026-10-07T11:04:00.000Z'}}),supply]),/does not contain the supply block time/);
 assert.throws(()=>checkPeriods(f,[price({price_window:{...window,end:'2026-10-07T11:04:00.000Z'}}),supply]),/does not contain the supply block time/);
 assert.throws(()=>checkPeriods(f,[price(),{...supply,observed_at:'2026-10-07T11:03:00.000Z'}]),/does not contain the supply block time/);
 assert.throws(()=>checkPeriods(f,[price({period:{basis:'point',end:'2026-10-06'},as_of_date:'2026-10-06'}),supply]),/not aligned/);
 assert.throws(()=>checkPeriods(f,[price({period:{basis:'model',end:'2026-10-07'}}),supply]),/point price/);
 assert.throws(()=>checkPeriods(f,[price(),{...supply,valuation_date:'2026-10-07'}]),/cannot reprice/);
 // An unknown side needs no alignment evidence; the output stays unknown.
 assert.equal(checkPeriods(f,[price({price_window:undefined}),{...supply,value:null}]).basis,'model');
});

test('project validation rejects malformed aligned formulas and named scenarios',()=>{
 let p=fixture();formula(p,'f.uni.model_market_cap').expression={op:'add',args:['uni.price','uni.model_supply']};assert.throws(()=>validateProject(p),/Invalid aligned valuation expression/);
 p=fixture();delete formula(p,'f.uni.fdv_current_supply').price_input;assert.throws(()=>validateProject(p),/Invalid project registries/);
 p=fixture();p.sensitivity.named_scenarios[0].value=2;assert.throws(()=>validateProject(p),/Invalid named scenario/);
 p=fixture();p.sensitivity.named_scenarios[0].parameter='uni.total_supply';assert.throws(()=>validateProject(p),/Invalid named scenario/);
 p=fixture();p.sensitivity.named_scenarios.push(structuredClone(p.sensitivity.named_scenarios[0]));assert.throws(()=>validateProject(p),/Duplicate named scenario/);
});

test('production keeps new valuation metrics unknown until aligned supply observations exist; downstream gaps stay null',()=>{
 const p=production(),r=calculate(p),v=id=>r.metrics[id].value;
 for(const id of ['uni.total_supply','uni.dead_balance','uni.timelock_balance','uni.model_supply','uni.model_market_cap','uni.fdv_current_supply','uni.required_accrual','uni.required_share','uni.net_burn_yield','uni.market_cap','uni.fdv'])
  assert.equal(v(id),null,id);
 assert.equal(v('uni.supply_basis_excludes_dead'),1);assert.equal(v('uni.timelock_exclusion'),0);assert.equal(v('uni.growth_distribution'),181112000);
 assert.equal(r.issues.filter(i=>i.severity==='ERROR').length,0);
});
