import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,readYaml,calculate,validateProject,lineage} from '../../engine/index.js';
import {makeSnapshot} from '../../engine/snapshots.js';
import {checkPeriods} from '../../engine/validation/index.js';

const base=loadProject('production'),proposal=readYaml('data/research/secz-reported-ttm-baseline-2026-10-29.yaml');
// Also exercises the proposal before it is applied; never writes a journal.
const p={...base,inputs:[...base.inputs,...proposal.observations.filter(r=>!base.inputs.some(x=>x.id===r.id))],sources:[...base.sources,...proposal.sources.filter(r=>!base.sources.some(x=>x.id===r.id))]};
const clone=()=>structuredClone(p),gate='secz.reported_ttm_comparability',out=key=>`secz.reported_${key}_ttm`;
const input=(p,key)=>p.inputs.find(r=>r.metric_id===`secz.reported_${key}`);
const result=calculate(p);

test('independent reported-category TTM exactly replays research v2 with low-confidence assumption lineage',()=>{
 validateProject(p);
 const saved=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v2.json');
 for(const [key,index] of [['tokenization',0],['servicing',1],['revenue',2]]) {
  const m=result.metrics[out(key)];
  assert.equal(m.value,saved.results[index].value);assert.equal(m.classification,'DERIVED');assert.equal(m.confidence,'low');assert.equal(m.unit,'USD/year');
  assert.deepEqual(m.period,saved.results[index].period);assert.equal(m.statement_context.audit_status,'mixed_audit_conditional');
  const nodes=[];const walk=t=>{nodes.push(t.metric);t.inputs?.forEach(walk);};walk(lineage(p,result,out(key)));
  assert.ok(nodes.some(m=>m.metric_id===gate&&m.classification==='ASSUMPTION'&&m.value===1));
  assert.equal(nodes.filter(m=>m.classification==='OBSERVED').length,key==='revenue'?6:3);
  for(const m of nodes.filter(m=>m.classification==='OBSERVED'))assert.ok(m.statement_context&&m.research_reference&&m.source_ids.length);
 }
 for(const key of ['tokenization','servicing','transaction','saas','administration','other','revenue','required_cagr'])assert.equal(result.metrics[`secz.${key}`].value,null);
 assert.equal(result.period.end,'2026-10-07');
});

for(const value of [0,null])test(`withdrawing comparability to ${value} returns unknown rather than zero revenue`,()=>{
 const q=clone();q.inputs.find(r=>r.metric_id===gate).value=value;validateProject(q);const r=calculate(q);
 for(const key of ['tokenization','servicing','revenue'])assert.equal(r.metrics[out(key)].value,null);
 assert.deepEqual(r.issues.filter(i=>i.severity==='ERROR'),[]);
});

for(const original of proposal.observations)test(`missing ${original.metric_id} propagates null while preserving the other category`,()=>{
 const q=clone();q.inputs.find(r=>r.id===original.id).value=null;validateProject(q);const r=calculate(q);
 const key=original.metric_id.includes('tokenization')?'tokenization':'servicing';
 assert.equal(r.metrics[out(key)].value,null);assert.equal(r.metrics[out('revenue')].value,null);
 assert.equal(r.metrics[out(key==='tokenization'?'servicing':'tokenization')].value,result.metrics[out(key==='tokenization'?'servicing':'tokenization')].value);
});

const invalid=[
 ['quarter mislabeled as YTD',q=>{input(q,'tokenization_current_ytd').period.basis='quarterly';},/calendar annual\/YTD/],
 ['point amount',q=>{input(q,'tokenization_current_ytd').period.basis='point';},/calendar annual\/YTD/],
 ['different YTD duration',q=>{const r=input(q,'tokenization_current_ytd');r.period.duration_months=3;r.period.end='2026-03-31';},/YTD intervals/],
 ['shifted YTD start',q=>{input(q,'tokenization_current_ytd').period.start='2026-01-02';},/calendar annual\/YTD/],
 ['shifted YTD end',q=>{input(q,'tokenization_current_ytd').period.end='2026-06-29';},/dates do not match/],
 ['missing start',q=>{delete input(q,'tokenization_fy').period.start;},/calendar annual\/YTD/],
 ['missing duration',q=>{delete input(q,'tokenization_fy').period.duration_months;},/explicit valid duration/],
 ['wrong annual year',q=>{Object.assign(input(q,'tokenization_fy').period,{start:'2024-01-01',end:'2024-12-31'});},/belong to|follow/],
 ['prior YTD exceeds FY',q=>{input(q,'tokenization_prior_ytd').value=40e6;},/not exceed/],
 ['parent entity scope',q=>{input(q,'tokenization_fy').statement_context.entity_name='Securitize Corp.';},/scope\/accounting context/],
 ['all parent scope',q=>{for(const r of q.inputs.filter(r=>r.metric_id.startsWith('secz.reported_')&&r.statement_context))r.statement_context.scope='listed_parent';},/subsidiary US GAAP/],
 ['different accounting basis',q=>{input(q,'tokenization_current_ytd').statement_context.accounting_basis='non_GAAP';},/scope\/accounting context/],
 ['missing audit context',q=>{delete input(q,'tokenization_current_ytd').statement_context;},/scope\/accounting context|statement\/audit/],
 ['assumed amount',q=>{input(q,'tokenization_fy').classification='ASSUMPTION';},/observed statement/],
 ['unaudited full year',q=>{input(q,'tokenization_fy').statement_context.audit_status='unaudited';},/distinct audit status/],
 ['upgraded prior YTD audit',q=>{input(q,'tokenization_prior_ytd').statement_context.audit_status='audited';},/distinct audit status/],
 ['upgraded current YTD audit',q=>{input(q,'tokenization_current_ytd').statement_context.audit_status='audited';},/distinct audit status/],
 ['observed gate',q=>{q.inputs.find(r=>r.metric_id===gate).classification='OBSERVED';},/explicit 0\/1\/null assumption/],
 ['fractional gate',q=>{q.inputs.find(r=>r.metric_id===gate).value=0.5;},/explicit 0\/1\/null assumption/],
];
for(const [name,mutate,error] of invalid)test(`conditional TTM rejects ${name} and cannot snapshot an invalid conversion`,()=>{
 const q=clone();mutate(q);const r=calculate(q);
 assert.equal(r.metrics[out('tokenization')].value,null);
 assert.ok(r.issues.some(i=>i.severity==='ERROR'&&error.test(i.message)),JSON.stringify(r.issues));
 assert.throws(()=>makeSnapshot(q,r,{reason:'Invalid TTM must not persist'}),/Cannot snapshot/);
});

test('sum rejects different category windows and statement scopes; property order does not change semantics',()=>{
 const f=p.registry.formulas.find(f=>f.output===out('revenue')),a=structuredClone(result.metrics[out('tokenization')]),b=structuredClone(result.metrics[out('servicing')]);
 b.period={end:b.period.end,start:b.period.start,duration_months:12,basis:'TTM'};
 b.statement_context=Object.fromEntries(Object.entries(b.statement_context).reverse());
 assert.deepEqual(checkPeriods(f,[a,b]),a.period);
 b.period.start='2025-07-02';assert.throws(()=>checkPeriods(f,[a,b]),/category periods differ/);
 b.period.start=a.period.start;b.statement_context.entity_name='Parent';assert.throws(()=>checkPeriods(f,[a,b]),/category scopes differ/);
});

test('invalid raw units, negative amounts and a changed bridge expression are rejected',()=>{
 for(const unit of ['UNI','USD/year']){const q=clone();input(q,'tokenization_fy').unit=unit;assert.throws(()=>validateProject(q),/Unit mismatch/);}
 const q=clone();input(q,'tokenization_fy').value=-1;assert.throws(()=>validateProject(q),/Below minimum/);
 const r=clone(),f=r.registry.formulas.find(f=>f.output===out('tokenization'));f.expression.args[0].op='sub';assert.throws(()=>validateProject(r),/Invalid conditional TTM expression/);
});

test('fixture reported revenues are independent synthetic evidence and preserve original regressions',()=>{
 const q=loadProject('fixture'),r=calculate(q);validateProject(q);
 assert.equal(r.metrics[out('revenue')].value,110e6);assert.equal(r.metrics[out('revenue')].fixture,true);
 assert.equal(r.metrics['secz.revenue'].value,100e6);assert.equal(r.metrics['uni.required_share'].value,0.422);
 assert.equal(r.period.end,'2025-12-31');
 assert.equal(Object.values(r.metrics).filter(m=>m.value===null).length,1);
});
