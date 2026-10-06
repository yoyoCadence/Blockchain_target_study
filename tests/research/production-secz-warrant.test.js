import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const review=history.find(s=>s.event?.id==='secz-warrant-context-20261003');
const previous=history[history.indexOf(review)-1];

test('warrant review binds its new amendment and existing dated capital evidence without revising sources',()=>{
 verifySnapshot(review);const {propagated_nodes,...event}=review.event;
 assert.deepEqual(event,readYaml('data/research/secz-warrant-context-2026-10-03-v1.yaml'));
 assert.equal(event.type,'governance');assert.equal(event.status,'completed');
 assert.equal(event.effective_date,'2026-07-01');assert.deepEqual(event.updates,[]);
 assert.deepEqual(propagated_nodes,['SECZ','UNI']);assert.equal(event.sources.length,1);
 const source=event.sources[0];assert.equal(source.id,'secz-warrant-amendment-20260731-v1');
 assert.equal(source.version,1);assert.equal(source.tier,1);assert.equal(source.fixture,false);
 assert.ok(source.url.endsWith('/000162828026051182/exhibit41-sx1.htm'));
 assert.equal(source.date,'2026-07-31');assert.ok(source.date<=event.as_of_date);
 assert.ok(source.retrieved_at<=event.research_review.reviewed_at);
 for(const id of event.source_ids)assert.ok(review.sources.some(s=>s.id===id));
 for(const old of previous.sources)assert.deepEqual(review.sources.find(s=>s.id===old.id),old);
 assert.equal(review.sources.length,previous.sources.length+1);
});

test('amended, vested and exercisable rights leave every financial, graph and valuation field unchanged',()=>{
 assert.equal(review.parent_id,previous.id);
 assert.equal(previous.id,'ba6d00d12f57a40fb017ffdf6e0b473d05b9e1e60f2abf6c23acf55b46037f49');
 const comparison=compareSnapshots(previous,review);
 assert.equal(comparison.source_change,true);assert.deepEqual(comparison.changes,[]);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 for(const field of ['metrics','inputs','observations','assumptions','scenarios','formulas','rules','dictionary','graph','assets','sensitivity','market_valuation','thesis','period'])
  assert.deepEqual(review[field],previous[field],field);
 for(const id of ['secz.revenue','secz.ev','secz.fcf_margin','secz.required_revenue'])assert.equal(review.metrics[id].value,null,id);
 assert.equal(Object.values(review.metrics).filter(m=>m.value===null).length,83);
});

test('warrant evidence preserves all historical replay and cannot add a consecutive thesis period',()=>{
 const before=fingerprint(history);
 for(const [index,snapshot] of history.entries()) {
  verifySnapshot(snapshot);
  const replay=calculate({...project,inputs:snapshot.inputs,sources:snapshot.sources,
   registry:{...project.registry,formulas:snapshot.formulas},dictionary:snapshot.dictionary,
   thesis:{...project.thesis,rules:snapshot.rules}},{history:history.slice(0,index),previousThesis:history[index-1]?.thesis??{}});
  assert.deepEqual(replay.metrics,snapshot.metrics);assert.deepEqual(replay.thesis,snapshot.thesis);
 }
 assert.equal(new Set(history.slice(0,history.indexOf(review)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.ok(Object.values(review.thesis).every(t=>t.coverage==='insufficient'));
 const capital=readYaml('data/research/secz-parent-capital-context-2026-10-03-v1.yaml');
 const {propagated_nodes,...oldEvent}=previous.event;assert.deepEqual(oldEvent,capital);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
});

test('warrant source context cannot establish subsidiary TTM or enter the fixture workspace',()=>{
 const research=inspectResearch(project);assert.equal(research.records.length,10);
 const ttm=research.records.find(r=>r.kind==='revenue_ttm');
 assert.equal(ttm.artifact_id,'6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d');
 assert.equal(ttm.comparability.checks.acquisition_treatment.value,null);
 assert.ok(ttm.records.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));
 const fixture=loadProject('fixture');assert.equal(readSnapshots(fixture.root,'fixture').length,3);
 assert.ok(!fixture.sources.some(s=>s.id===review.event.sources[0].id));
 assert.deepEqual(inspectResearch(fixture).records,[]);
});
