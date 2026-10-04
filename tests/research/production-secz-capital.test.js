import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const review=history.find(s=>s.event?.id==='secz-parent-capital-context-20261003');
const previous=history[history.indexOf(review)-1];

test('parent capital review binds dated primary sources and explicitly limited conflicting evidence',()=>{
 verifySnapshot(review);const {propagated_nodes,...event}=review.event;
 assert.deepEqual(event,readYaml('data/research/secz-parent-capital-context-2026-10-03-v1.yaml'));
 assert.equal(event.type,'governance');assert.equal(event.status,'completed');
 assert.equal(event.effective_date,'2026-07-01');assert.equal(event.as_of_date,'2026-10-03');
 assert.deepEqual(event.updates,[]);assert.deepEqual(propagated_nodes,['SECZ','UNI']);
 assert.equal(event.sources.length,5);assert.deepEqual(event.source_ids,event.sources.map(s=>s.id));
 for(const source of event.sources) {
  assert.equal(source.fixture,false);assert.equal(source.version,1);assert.equal(source.tier,1);
  assert.ok(source.url.startsWith('https://www.sec.gov/Archives/edgar/data/2094496/'));
  assert.ok(source.date>=event.effective_date&&source.date<=event.as_of_date);
  assert.ok(source.retrieved_at<=event.research_review.reviewed_at);
  assert.deepEqual(review.sources.find(s=>s.id===source.id),source);
 }
 const opinion=event.sources.find(s=>s.url.endsWith('/exhibit51-sx1.htm'));
 assert.equal(opinion.date,'2026-07-31');assert.match(opinion.title,/July 30/);
 const excerpt=event.sources.find(s=>s.url.endsWith('/secz-20260731.htm'));
 assert.match(excerpt.title,/excerpt only/);assert.match(excerpt.title,/denominator unverified/);
 assert.match(event.reason,/not reconciled here/);assert.match(event.reason,/not a verified current or fully diluted denominator/);
});

test('issued, conditional and registered share context cannot change canonical financial inputs or double-count shares',()=>{
 assert.equal(review.parent_id,previous.id);
 assert.equal(previous.id,'325bb03d8d7b4b2d395623bd03f43da83a0311d363a08ca6e59f8f7b9255dca7');
 const comparison=compareSnapshots(previous,review);
 assert.equal(comparison.source_change,true);assert.deepEqual(comparison.changes,[]);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 for(const field of ['metrics','inputs','formulas','rules','dictionary','graph','assets','sensitivity','market_valuation','thesis','period'])
  assert.deepEqual(review[field],previous[field],field);
 assert.equal(review.sources.length,previous.sources.length+5);
 for(const source of previous.sources)assert.deepEqual(review.sources.find(s=>s.id===source.id),source);
 for(const id of ['secz.revenue','secz.ev','secz.fcf_margin','secz.required_revenue'])assert.equal(review.metrics[id].value,null,id);
 assert.equal(Object.values(review.metrics).filter(m=>m.value===null).length,83);
});

test('capital evidence appends one full snapshot while preserving replay and insufficient consecutive-period evidence',()=>{
 const before=fingerprint(history),index=history.indexOf(review);
 for(const snapshot of history)verifySnapshot(snapshot);
 const replay=calculate({...project,inputs:review.inputs,sources:review.sources,
  registry:{...project.registry,formulas:review.formulas},dictionary:review.dictionary,
  thesis:{...project.thesis,rules:review.rules}},{history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,review.metrics);assert.deepEqual(replay.thesis,review.thesis);
 assert.equal(new Set(history.slice(0,history.indexOf(review)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.ok(Object.values(review.thesis).every(t=>t.coverage==='insufficient'));
 assert.equal(history[0].id,'65e5c2c8adf25d6e0f111e9ff4b63bb83eb098f95951b49376b476a0b7b5fc80');
 assert.equal(history[1].id,'118771fe14a9f79bc23275390bbc95c1d85aacbcf141abe59ac5c1ad51498522');
 assert.equal(history[2].id,'c242eeb441c989b608a9520d13e54b9e142ee213a818a88dd76d9db15ed763c9');
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
});

test('parent capital evidence leaves subsidiary TTM comparability unknown and fixture research isolated',()=>{
 const before=fingerprint(history),research=inspectResearch(project);
 assert.equal(research.records.length,6);
 const ttm=research.records.find(r=>r.kind==='revenue_ttm');
 assert.equal(ttm.artifact_id,'6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d');
 assert.equal(ttm.comparability.checks.acquisition_treatment.value,null);
 assert.ok(ttm.records.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
 const fixture=loadProject('fixture');assert.equal(readSnapshots(fixture.root,'fixture').length,2);
 assert.ok(!fixture.sources.some(s=>s.id.startsWith('secz-parent-capital-')));
 assert.deepEqual(inspectResearch(fixture).records,[]);
});
