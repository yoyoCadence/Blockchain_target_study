import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize} from '../../engine/validation/index.js';
import {loadProject,calculate} from '../../engine/index.js';

const units=['USD/year','UNI/year','XLM/year','count/year','turns/year'];
const definition=unit=>({id:'test.annual_rate',unit,minimum:0,maximum:null});
const record=(unit,basis,value=1)=>({id:'isolated-test-rate',metric_id:'test.annual_rate',asset:'TEST',value,unit,
 classification:'OBSERVED',as_of_date:'2026-06-30',period:{basis,end:'2026-06-30'},
 confidence:'medium',fixture:true,version:1,source_ids:['synthetic-test-only'],rationale:'Isolated nominal annual-rate test; not a real observation'});

for(const unit of units) for(const basis of ['quarterly','point'])
 test(`known ${unit} cannot silently use ${basis} amount basis`,()=>{
  assert.throws(()=>normalize(record(unit,basis),definition(unit)),/Annual-rate unit/);
 });
test('annual, explicit trailing-twelve-month and explained model rates retain values and units',()=>{
 for(const unit of units) for(const basis of ['annual','TTM','model']) {
  const normalized=normalize(record(unit,basis),definition(unit));
  assert.equal(normalized.value,1);assert.equal(normalized.unit,unit);assert.equal(normalized.period.basis,basis);
 }
});
test('an observed model annual rate requires explicit rationale',()=>{
 const input=record('UNI/year','model');delete input.rationale;
 assert.throws(()=>normalize(input,definition('UNI/year')),/requires rationale/);
 input.rationale=' ';assert.throws(()=>normalize(input,definition('UNI/year')),/requires rationale/);
});
test('unknown annual rates stay null without pretending to have a verified duration',()=>{
 for(const unit of units) for(const basis of ['quarterly','point','model'])
  assert.equal(normalize(record(unit,basis,null),definition(unit)).value,null);
});
test('point prices and inventories do not inherit annual-flow restrictions',()=>{
 for(const unit of ['USD','UNI','XLM','count','ratio'])
  assert.equal(normalize(record(unit,'point'),definition(unit)).value,1);
 const fixture=calculate(loadProject('fixture'));
 assert.equal(fixture.metrics['uni.required_share'].value,0.422);
 const production=calculate(loadProject('production'));
 assert.equal(production.metrics['uni.growth_budget'].value,20_000_000);
 assert.equal(production.metrics['uni.growth_distribution'].value,181112000);
 assert.deepEqual(production.metrics['uni.growth_distribution'].period,{basis:'model',end:'2026-10-04'});
});
