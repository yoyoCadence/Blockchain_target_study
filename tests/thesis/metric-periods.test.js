import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,validateProject} from '../../engine/index.js';
import {evaluateTheses} from '../../engine/thesis/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {frame} from '../helpers.js';

const yieldMetric='uni.net_burn_yield';
const watch=()=>loadProject('fixture').thesis.rules.find(r=>r.id==='uni.watch');
const yieldFrame=(end,basis='annual')=>frame(end,{[yieldMetric]:0.01},basis);

test('carried-forward annual value cannot become a second period by changing the snapshot label',()=>{
 const old=yieldFrame('2024-12-31'),current=yieldFrame('2025-12-31');
 current.metrics[yieldMetric]=structuredClone(old.metrics[yieldMetric]);
 const before=fingerprint([old,current]),thesis=evaluateTheses([watch()],current,[old]).UNI;
 assert.equal(thesis.state,'HEALTHY');assert.equal(thesis.coverage,'insufficient');assert.deepEqual(thesis.triggered_rules,[]);
 assert.match(thesis.interpretation,/Not an affirmative healthy thesis/);
 const condition=thesis.rule_evaluations[0].evidence.at(-1).conditions[0];
 assert.equal(condition.actual,0.01);assert.equal(condition.record_id,old.metrics[yieldMetric].id);
 assert.deepEqual(condition.metric_period,old.period);assert.equal(condition.period_aligned,false);
 assert.equal(fingerprint([old,current]),before);
});

for(const [frameBasis,metricBasis] of [['annual','quarterly'],['quarterly','annual'],['annual','TTM']])
 test(`${metricBasis} evidence cannot complete a ${frameBasis} period even with the same end date`,()=>{
  const rule={...watch(),periods:1},current=yieldFrame('2025-12-31',frameBasis);
  current.metrics[yieldMetric].period.basis=metricBasis;
  const thesis=evaluateTheses([rule],current).UNI;
  assert.equal(thesis.coverage,'insufficient');assert.deepEqual(thesis.triggered_rules,[]);
  assert.deepEqual(thesis.rule_evaluations[0].evidence[0].conditions[0].metric_period,{basis:metricBasis,end:'2025-12-31'});
 });

for(const basis of ['annual','quarterly','point','model'])
 test(`aligned ${basis} evidence retains an independently supported trigger`,()=>{
  const frameBasis=basis==='quarterly'?'quarterly':'annual',current=yieldFrame('2025-12-31',frameBasis);
  current.metrics[yieldMetric].period.basis=basis;
  const thesis=evaluateTheses([{...watch(),periods:1}],current).UNI;
  assert.equal(thesis.state,'WATCH');assert.equal(thesis.coverage,'complete');
  assert.equal(thesis.triggered_rules.length,1);
  assert.equal(Object.hasOwn(thesis.rule_evaluations[0].evidence[0].conditions[0],'period_aligned'),false);
 });

for(const basis of ['point','model'])
 test(`old ${basis} evidence is not silently renewed by a new annual frame`,()=>{
  const current=yieldFrame('2025-12-31');current.metrics[yieldMetric].period={basis,end:'2024-12-31'};
  const thesis=evaluateTheses([{...watch(),periods:1}],current).UNI;
  assert.equal(thesis.coverage,'insufficient');assert.equal(thesis.triggered_rules.length,0);
  assert.deepEqual(thesis.rule_evaluations[0].evidence[0].conditions[0].metric_period,{basis,end:'2024-12-31'});
 });

test('missing metric period remains explicit insufficient evidence instead of inheriting a frame label',()=>{
 const current=yieldFrame('2025-12-31');delete current.metrics[yieldMetric].period;
 const thesis=evaluateTheses([{...watch(),periods:1}],current).UNI;
 assert.equal(thesis.coverage,'insufficient');assert.equal(thesis.triggered_rules.length,0);
 assert.equal(thesis.rule_evaluations[0].evidence[0].conditions[0].metric_period,null);
});

test('a four-period break with stale conditions cannot hide supported current-period stress',()=>{
 const current=frame('2025-12-31',{'uni.fee':0.00001,'uni.required_share':0.9,'uni.activity_growth':0.2,'uni.supply_growth':0.1});
 const rules=loadProject('fixture').thesis.rules.filter(r=>['uni.stress','uni.break'].includes(r.id));
 const history=['2022-12-31','2023-12-31','2024-12-31'].map(end=>frame(end,{'uni.activity_growth':0.2,'uni.supply_growth':0.1}));
 current.metrics['uni.supply_growth'].period.end='2024-12-31';
 const thesis=evaluateTheses(rules,current,history).UNI;
 assert.equal(thesis.state,'STRESS');assert.equal(thesis.coverage,'insufficient');
 assert.deepEqual(thesis.triggered_rules.map(r=>r.id),['uni.stress']);assert.equal(thesis.rule_evaluations.length,2);
 assert.equal(thesis.rule_evaluations.find(r=>r.id==='uni.break').evidence.at(-1).conditions[1].actual,0.1);
});

test('advancing an unrelated model reference cannot renew old canonical financial conditions',()=>{
 const project=loadProject('fixture'),before=calculate(project);
 assert.equal(before.thesis.XLM.state,'WATCH');
 const assumption=project.inputs.find(r=>r.metric_id==='uni.onchain_share');
 Object.assign(assumption,{classification:'SCENARIO',scenario:'Test-only later reference',period:{basis:'model',end:'2026-12-31'}});
 validateProject(project);const after=calculate(project);
 assert.equal(after.period.end,'2026-12-31');assert.equal(after.thesis.XLM.state,'HEALTHY');
 assert.equal(after.thesis.XLM.coverage,'insufficient');assert.equal(after.thesis.XLM.triggered_rules.length,0);
 assert.equal(after.metrics['xlm.rwa_growth'].value,before.metrics['xlm.rwa_growth'].value);
 assert.deepEqual(after.metrics['xlm.rwa_growth'].period,before.metrics['xlm.rwa_growth'].period);
 const condition=after.thesis.XLM.rule_evaluations.find(r=>r.id==='xlm.watch').evidence[0].conditions[0];
 assert.deepEqual(condition.metric_period,{basis:'point',end:'2025-12-31'});
});

test('unknown aligned data still cannot complete or trigger a rule',()=>{
 const current=yieldFrame('2025-12-31');current.metrics[yieldMetric].value=null;
 const thesis=evaluateTheses([{...watch(),periods:1}],current).UNI;
 assert.equal(thesis.coverage,'insufficient');assert.equal(thesis.triggered_rules.length,0);
 assert.equal(thesis.rule_evaluations[0].evidence[0].conditions[0].actual,null);
});

test('committed metrics, thesis evidence, formula versions and all immutable history replay unchanged',()=>{
 for(const mode of ['fixture','production']) {
  const project=loadProject(mode),history=readSnapshots(project.root,mode),latest=history.at(-1),before=fingerprint(history);
  const replay=calculate(project,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(replay.metrics,latest.metrics);assert.deepEqual(replay.thesis,latest.thesis);
  assert.deepEqual(project.registry.formulas,latest.formulas);
  assert.equal(fingerprint(readSnapshots(project.root,mode)),before);
 }
});
