import test from 'node:test';
import assert from 'node:assert/strict';
import {project,change} from '../helpers.js';
import {calculate,validateProject} from '../../engine/index.js';
import {sensitivity,matrix} from '../../engine/sensitivity/index.js';
test('zero denominators become explicit errors, never Infinity or zero substitutes',()=>{
 const r=calculate(change(project(),'secz.fcf_margin',0));assert.equal(r.metrics['secz.required_revenue'].value,null);assert.ok(r.issues.some(x=>x.severity==='ERROR'&&x.message==='Division by zero'));
});
test('unknowns propagate without fabrication',()=>{const r=calculate(change(project(),'market.equity_aum',null));assert.equal(r.metrics['uni.net_accrual'].value,null);assert.equal(r.metrics['uni.required_share'].value,null);});
test('required share above 100% and FDV below market cap warn',()=>{
 const p=change(project(),'uni.fdv',1),r=sensitivity(p,{'uni.fee':0.00001});assert.ok(r.issues.some(x=>x.metric_id==='uni.required_share'&&x.severity==='WARNING'));assert.ok(r.issues.some(x=>x.metric_id==='uni.fdv'&&x.severity==='WARNING'));
});
test('sensitivity changes downstream metrics and retains canonical input',()=>{
 const p=project(),before=calculate(p),after=sensitivity(p,{'uni.growth_budget':10e6,'secz.fcf_margin':0.5});
 assert.equal(after.metrics['uni.growth_distribution'].value,90e6);assert.equal(after.metrics['secz.required_revenue'].value,100e6);assert.equal(after.metrics['uni.growth_budget'].classification,'SCENARIO');
 assert.deepEqual(calculate(p).metrics,before.metrics);assert.throws(()=>sensitivity(p,{'secz.fcf_margin':2}));assert.throws(()=>sensitivity(p,{'xlm.price':1}));
});
test('all ten requested sensitivity parameters produce calculated matrices',()=>{
 const p=project();assert.equal(p.sensitivity.parameters.length,10);const grid=matrix(p);assert.equal(grid.cells.length,3);assert.equal(grid.cells[1][1].value,0.422);
 for(const id of p.sensitivity.parameters){const value=calculate(p).metrics[id].value;const r=sensitivity(p,{[id]:value*0.9});assert.ok(!r.issues.some(x=>x.severity==='ERROR'));}
});
test('cycles, unknown dependencies and arbitrary expression code are rejected',()=>{
 let p=project();p.registry.formulas[0].expression='missing';assert.throws(()=>validateProject(p),/dependency/);
 p=project();p.registry.formulas[0].expression=p.registry.formulas[0].output;assert.throws(()=>validateProject(p),/cycle/);
 p=project();p.registry.formulas[0].expression={op:'eval',args:['process.exit()']};assert.throws(()=>validateProject(p),/Invalid project registries/);
});
test('quarterly/annual, shifted fiscal endpoints and wrong prior years cannot mix',()=>{
 let p=project();change(p,'secz.tokenization',20e6,{period:{basis:'quarterly',end:'2025-12-31'}});let r=calculate(p);assert.ok(r.issues.some(x=>x.message.includes('accounting bases')));
 p=project();change(p,'secz.servicing',30e6,{period:{basis:'annual',end:'2025-09-30'}});r=calculate(p);assert.ok(r.issues.some(x=>x.message.includes('Unaligned')));
 p=project();change(p,'secz.prior_revenue',80e6,{period:{basis:'annual',end:'2023-12-31'}});r=calculate(p);assert.ok(r.issues.some(x=>x.message.includes('Non-comparable')));
});
