import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,validateProject} from '../../engine/index.js';
import {alignedCalendarPeriods,checkPeriods} from '../../engine/validation/index.js';
import {evaluateTheses} from '../../engine/thesis/index.js';
import {makeSnapshot,readSnapshots,fingerprint} from '../../engine/snapshots.js';

const formula={id:'test-only-calendar-interval',period_policy:'prior_comparison'};
const dependencies=(previous,current,basis)=>[
 {metric_id:'secz.prior_revenue',period:{basis,end:previous}},
 {metric_id:'secz.revenue',period:{basis,end:current}}
];

for(const [previous,current,basis] of [
 ['2024-12-31','2025-12-31','annual'],
 ['2024-02-29','2025-02-28','annual'],
 ['2023-02-28','2024-02-29','annual'],
 ['2024-05-15','2025-05-15','annual'],
 ['2025-03-31','2025-06-30','quarterly'],
 ['2025-04-30','2025-07-31','quarterly'],
 ['2024-12-31','2025-03-31','quarterly'],
 ['2025-04-15','2025-07-15','quarterly']
]) test(`comparable ${basis} calendar endpoints ${previous} → ${current} remain valid`,()=>{
 assert.deepEqual(checkPeriods(formula,dependencies(previous,current,basis)),{basis,end:current});
});

for(const [previous,current,basis] of [
 ['2024-12-30','2025-12-31','annual'],
 ['2024-12-31','2025-12-30','annual'],
 ['2025-03-31','2025-06-29','quarterly'],
 ['2023-12-31','2025-12-31','annual']
]) test(`unaligned ${basis} endpoints ${previous} → ${current} cannot create comparable growth`,()=>{
 assert.throws(()=>checkPeriods(formula,dependencies(previous,current,basis)),/Non-comparable prior period/);
});

for(const previous of ['2025-02-30','2024-12-31T00:00:00Z']) test(`invalid date-only calendar endpoint ${previous} never aligns`,()=>{
 assert.equal(alignedCalendarPeriods(previous,'2025-12-31',12),false);
});

test('mismatched prior revenue day propagates an explicit calculation error and cannot be snapshotted',()=>{
 const project=loadProject('fixture');
 const record=project.inputs.find(r=>r.metric_id==='secz.prior_revenue');record.period.end='2024-12-30';
 validateProject(project);
 const history=fingerprint(readSnapshots(project.root,'fixture')),result=calculate(project);
 assert.equal(result.metrics['secz.revenue_growth'].value,null);
 assert.match(result.metrics['secz.revenue_growth'].error,/Non-comparable prior period/);
 assert.ok(result.issues.some(i=>i.metric_id==='secz.revenue_growth'&&i.severity==='ERROR'));
 assert.throws(()=>makeSnapshot(project,result,{reason:'Test-only unaligned calendar probe'}),/Cannot snapshot calculation errors/);
 assert.equal(fingerprint(readSnapshots(project.root,'fixture')),history);
});

const frame=(end,basis='annual')=>({period:{basis,end},metrics:{'uni.net_burn_yield':{id:`test-yield-${end}`,value:0.01}}});
const watch=()=>loadProject('fixture').thesis.rules.find(r=>r.id==='uni.watch');

test('one-day-shifted annual history cannot falsely complete or trigger a persistence rule',()=>{
 const rules=[watch()],current=frame('2025-12-31');
 let thesis=evaluateTheses(rules,current,[frame('2024-12-31')]).UNI;
 assert.equal(thesis.state,'WATCH');assert.equal(thesis.coverage,'complete');
 thesis=evaluateTheses(rules,current,[frame('2024-12-30')]).UNI;
 assert.equal(thesis.state,'HEALTHY');assert.equal(thesis.coverage,'insufficient');assert.deepEqual(thesis.triggered_rules,[]);
 assert.match(thesis.interpretation,/Not an affirmative healthy thesis/);
 assert.equal(thesis.rule_evaluations[0].evidence[0].period.end,'2024-12-30');
});

test('unaligned quarterly persistence blocks a break while retaining an independently triggered watch',()=>{
 const base=watch(),rules=[{...base,id:'test-quarter-break',state:'BREAK_CANDIDATE',periods:4},
  {...base,id:'test-one-period-watch',periods:1}];
 const history=['2025-03-31','2025-06-30','2025-09-30'].map(d=>frame(d,'quarterly')),current=frame('2025-12-31','quarterly');
 let thesis=evaluateTheses(rules,current,history).UNI;
 assert.equal(thesis.state,'BREAK_CANDIDATE');assert.equal(thesis.triggered_rules.length,2);
 history[2]=frame('2025-09-29','quarterly');thesis=evaluateTheses(rules,current,history).UNI;
 assert.equal(thesis.state,'WATCH');assert.equal(thesis.coverage,'insufficient');
 assert.deepEqual(thesis.triggered_rules.map(r=>r.id),['test-one-period-watch']);
 assert.equal(thesis.rule_evaluations.length,2);assert.equal(thesis.rule_evaluations[0].sufficient,false);
});

test('both committed modes and all latest financial snapshot economics/thesis replay unchanged',()=>{
 for(const mode of ['fixture','production']) {
  const project=loadProject(mode),history=readSnapshots(project.root,mode),latest=history.at(-1),before=fingerprint(history);
  const replay=calculate(project,{history:history.slice(0,-1),previousThesis:history.at(-2)?.thesis||{}});
  assert.deepEqual(replay.metrics,latest.metrics);assert.deepEqual(replay.thesis,latest.thesis);
  assert.equal(fingerprint(readSnapshots(project.root,mode)),before);
 }
});
