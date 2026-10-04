import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {validateSchema,utcDay} from '../../engine/validation/index.js';
import {evaluate,references,orderFormulas} from '../../engine/formulas/index.js';
import {readSnapshots,fingerprint,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const artifact=JSON.parse(fs.readFileSync('data/research/capital-reviews/secz-resale-20261004-v1.json','utf8'));
const project=loadProject('production');
const history=readSnapshots(project.root,'production');
const review=history.find(s=>s.event?.id==='secz-resale-capital-review-20261004');
const previous=history[history.indexOf(review)-1];
const observations=Object.fromEntries(artifact.observations.map(o=>[o.id,o]));

test('resale artifact binds all 50 table rows to primary observations and preserves the nine original dashes',()=>{
 const {id,...content}=artifact;assert.equal(id,fingerprint(content));
 assert.equal(artifact.version,1);assert.equal(artifact.fixture,false);assert.equal(artifact.mode,'production');
 assert.equal(artifact.rows.length,50);assert.equal(artifact.observations.length,108);
 assert.equal(new Set(artifact.observations.map(o=>o.id)).size,108);
 assert.equal(new Set(artifact.observations.map(o=>o.metric_id)).size,108);
 const sources=Object.fromEntries(artifact.sources.map(s=>[s.id,s]));
 for(const source of artifact.sources) {
  validateSchema(project.sourceSchema,source,'capital source');
  assert.equal(source.fixture,false);assert.equal(source.tier,1);
  assert.ok(source.date<=utcDay(source.retrieved_at));
  assert.ok(Date.parse(source.retrieved_at)<=Date.parse(artifact.review.reviewed_at));
  if(source.supersedes)assert.ok(source.version>sources[source.supersedes].version);
 }
 for(const observation of artifact.observations) {
  validateSchema(project.schema,observation,'capital observation');
  assert.equal(observation.classification,'OBSERVED');assert.equal(observation.fixture,false);
  assert.equal(observation.unit,'count');assert.equal(observation.period.basis,'point');
  assert.ok(observation.period.end<=observation.as_of_date);
  assert.ok(observation.as_of_date<=artifact.as_of_date);
  for(const sourceId of observation.source_ids) {
   assert.ok(sources[sourceId]);assert.ok(sources[sourceId].date<=observation.as_of_date);
   assert.ok(sources[sourceId].covered_metrics.includes(observation.metric_id));
  }
 }
 for(const [index,row] of artifact.rows.entries()) {
  assert.equal(row.row,index+1);assert.equal(row.page,index<18?129:130);
  const common=observations[row.common_observation_id],earnout=observations[row.earnout_observation_id];
  assert.equal(common.value,Number(row.common_text.replaceAll(',','')));
  assert.equal(earnout.value,row.earnout_text==='—'?null:Number(row.earnout_text.replaceAll(',','')));
  assert.equal(earnout.confidence,row.earnout_text==='—'?'unknown':'high');
 }
 assert.equal(artifact.rows.filter(r=>r.earnout_text==='—').length,9);
 assert.equal(artifact.observations.filter(o=>o.value===null).length,9);
});

test('capital arithmetic replays immutable formula versions and retains every observation dependency',()=>{
 const values=Object.fromEntries(artifact.observations.map(o=>[o.metric_id,o]));
 assert.equal(artifact.formulas.length,7);assert.equal(artifact.derived.length,7);
 for(const formula of orderFormulas(artifact.formulas,Object.keys(values))) {
  const record=artifact.derived.find(d=>d.metric_id===formula.output);
  validateSchema(project.schema,record,'capital derived');
  assert.equal(record.classification,'DERIVED');assert.equal(record.fixture,false);
  assert.equal(record.formula_id,formula.id);assert.equal(record.formula_version,1);assert.equal(formula.version,1);
  assert.equal(record.unit,formula.unit);assert.ok(formula.rationale.trim());
  assert.deepEqual(record.dependencies,references(formula.expression).map(id=>values[id].id));
  assert.equal(record.value,evaluate(formula.expression,values));values[formula.output]=record;
 }
 const value=name=>values[`research.secz.resale.${name}`].value;
 assert.equal(value('offered-common-total'),144479908);
 assert.equal(value('disclosed-earned-rights-total'),7088616);
 assert.equal(value('combined-offered-total'),value('registered-total'));
 assert.equal(value('common-less-warrant-capacity'),value('opinion-issued-resale'));
 assert.equal(value('earnout-less-sponsor'),5288616);
 assert.equal(value('unreconciled-company-earnout-gap'),961384);
 assert.equal(value('stated-after-less-before'),value('registered-total'));
 const subset=artifact.formulas.find(f=>f.output.endsWith('.disclosed-earned-rights-total'));
 assert.equal(subset.expression.args.length,41);
 assert.ok(subset.expression.args.every(id=>values[id].value!==null));
 assert.equal(values['research.secz.resale.earnout-row07'].value,1800000);
 const walk=(record,seen=new Set())=>{
  assert.ok(!seen.has(record.id));const next=new Set([...seen,record.id]);
  if(record.classification==='OBSERVED')return record.source_ids.map(id=>artifact.sources.find(s=>s.id===id));
  return record.dependencies.flatMap(id=>walk(Object.values(values).find(r=>r.id===id),next));
 };
 assert.ok(artifact.derived.flatMap(r=>walk(r)).every(s=>s?.tier===1&&!s.fixture));
});

test('unknown selected capital observations propagate through totals instead of being treated as zero',()=>{
 const values=Object.fromEntries(artifact.observations.map(o=>[o.metric_id,structuredClone(o)]));
 values['research.secz.resale.common-row01'].value=null;
 for(const formula of orderFormulas(artifact.formulas,Object.keys(values)))values[formula.output]={value:evaluate(formula.expression,values)};
 assert.equal(values['research.secz.resale.offered-common-total'].value,null);
 assert.equal(values['research.secz.resale.combined-offered-total'].value,null);
 assert.equal(values['research.secz.resale.common-less-warrant-capacity'].value,null);
 assert.equal(values['research.secz.resale.unreconciled-company-earnout-gap'].value,961384);
 const expr=structuredClone(artifact.formulas[0].expression);expr.op='eval';
 assert.throws(()=>references(expr),/Unknown formula operation/);
});

test('source-only journal pins the capital artifact and appends source versions without revising prior evidence',()=>{
 verifySnapshot(review);const {propagated_nodes,...event}=review.event;
 assert.deepEqual(event,readYaml('data/research/secz-resale-capital-2026-10-04-v1.yaml'));
 assert.ok(event.research_review.rationale.includes(artifact.id));
 assert.deepEqual(event.updates,[]);assert.deepEqual(propagated_nodes,['SECZ','UNI']);
 assert.equal(event.as_of_date,'2026-10-04');assert.equal(event.effective_date,'2026-07-01');
 assert.equal(event.sources.length,4);assert.equal(review.sources.length,previous.sources.length+4);
 for(const old of previous.sources)assert.deepEqual(review.sources.find(s=>s.id===old.id),old);
 for(const source of artifact.sources)assert.deepEqual(review.sources.find(s=>s.id===source.id),source);
 assert.equal(event.sources.filter(s=>s.supersedes).length,2);
 assert.ok(event.source_ids.every(id=>review.sources.some(s=>s.id===id)));
});

test('capital reconciliation leaves financial results, formal TTM and all previous snapshots unchanged',()=>{
 assert.equal(review.parent_id,'ef433299247e234de2a89d0b151b5be7bb35a5a4439b74e133b65385e9dc6c23');
 const comparison=compareSnapshots(previous,review);assert.equal(comparison.source_change,true);
 assert.deepEqual(comparison.changes,[]);
 for(const flag of ['assumption_change','scenario_change','formula_change','rule_change'])assert.equal(comparison[flag],false);
 for(const field of ['inputs','metrics','observations','assumptions','scenarios','formulas','rules','dictionary','graph','assets','market_valuation','thesis','period'])
  assert.deepEqual(review[field],previous[field],field);
 const before=fingerprint(history);
 for(const [index,snapshot] of history.entries()) {
  verifySnapshot(snapshot);
  const replay=calculate({...project,inputs:snapshot.inputs,sources:snapshot.sources,
   registry:{...project.registry,formulas:snapshot.formulas},dictionary:snapshot.dictionary,
   thesis:{...project.thesis,rules:snapshot.rules}},{history:history.slice(0,index),previousThesis:history[index-1]?.thesis??{}});
  assert.deepEqual(replay.metrics,snapshot.metrics);assert.deepEqual(replay.thesis,snapshot.thesis);
 }
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
 assert.equal(history.indexOf(review)+1,7);assert.equal(new Set(history.slice(0,history.indexOf(review)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.equal(Object.values(review.metrics).filter(m=>m.value===null).length,83);
 assert.ok(Object.values(review.thesis).every(t=>t.coverage==='insufficient'));
 const ttm=inspectResearch(project).records.find(r=>r.kind==='revenue_ttm');
 assert.equal(ttm.artifact_id,'6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d');
 assert.ok(ttm.records.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));
 const fixture=loadProject('fixture');assert.equal(readSnapshots(fixture.root,'fixture').length,2);
 assert.ok(eventSourceIds().every(id=>!fixture.sources.some(s=>s.id===id)));
 assert.deepEqual(inspectResearch(fixture).records,[]);
});

function eventSourceIds(){return review.event.sources.map(s=>s.id);}
