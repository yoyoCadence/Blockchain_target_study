import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate,selectInputs} from '../../engine/index.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';

const production=loadProject('production'),policy=readYaml('spec/source-freshness.yaml');
function example(asOf='2026-09-30',retrieved='2026-10-01T10:00:00Z') {
 const project=loadProject('fixture');
 const record=selectInputs(project.inputs)['uni.price'];
 record.as_of_date=asOf;
 for(const id of record.source_ids) {
  const source=project.sources.find(s=>s.id===id);source.date='2026-01-01';source.retrieved_at=retrieved;
 }
 return project;
}
const price=report=>report.inputs.find(row=>row.metric_id==='uni.price');

test('recent retrieval does not renew an old observed price',()=>{
 const report=sourceFreshness(example(),{as_of_date:'2026-10-03'}),row=price(report);
 assert.equal(row.observation_age_days,3);assert.equal(row.observation_state,'STALE_FOR_CURRENT_USE');
 assert.equal(row.evidence_state,'AVAILABLE');
 assert.ok(report.source_checks.filter(s=>row.source_ids.includes(s.source.id)).every(s=>s.retrieval_state==='RECENTLY_RETRIEVED'));
 assert.equal(report.policy.classification,'ASSUMPTION');assert.equal(report.calculation.classification,'DERIVED');
 assert.equal(report.calculation.formula_version,1);
});
test('review window boundary is inclusive; old publication alone does not invalidate evidence',()=>{
 const row=price(sourceFreshness(example('2026-10-02'),{as_of_date:'2026-10-03'}));
 assert.equal(row.observation_age_days,1);assert.equal(row.observation_state,'WITHIN_REVIEW_WINDOW');assert.equal(row.evidence_state,'AVAILABLE');
});
test('old source retrieval is independently due for recheck',()=>{
 const report=sourceFreshness(example('2026-10-03','2026-08-01T12:00:00Z'),{as_of_date:'2026-10-03'});
 assert.equal(price(report).observation_state,'WITHIN_REVIEW_WINDOW');assert.equal(price(report).evidence_state,'RECHECK_DUE');
});
test('future observations and source retrieval cannot supply evidence at a historical cutoff',()=>{
 let report=sourceFreshness(example('2026-10-03'),{as_of_date:'2026-09-30'});
 assert.equal(price(report).observation_state,'NOT_AVAILABLE_AT_CUTOFF');assert.equal(price(report).observation_age_days,null);
 assert.equal(price(report).evidence_state,'INSUFFICIENT');
 report=sourceFreshness(example('2026-09-30'),{as_of_date:'2026-09-30'});
 assert.equal(price(report).observation_state,'WITHIN_REVIEW_WINDOW');assert.equal(price(report).evidence_state,'INSUFFICIENT');
});
test('UTC calendar days handle leap dates and timestamp offsets consistently',()=>{
 let project=example('2024-02-29','2024-02-29T10:00:00Z');
 for(const id of selectInputs(project.inputs)['uni.price'].source_ids) project.sources.find(s=>s.id===id).date='2024-02-01';
 assert.equal(price(sourceFreshness(project,{as_of_date:'2024-03-01'})).observation_age_days,1);
 project=example('2026-10-02','2026-10-03T00:15:00+14:00');
 const report=sourceFreshness(project,{as_of_date:'2026-10-03'});
 assert.ok(report.source_checks.filter(s=>price(report).source_ids.includes(s.source.id)).every(s=>s.retrieval_age_days===1));
});
test('unknown, assumptions and scenarios cannot masquerade as fresh observations',()=>{
 const project=example();
 let record=selectInputs(project.inputs)['uni.price'];record.value=null;
 assert.equal(price(sourceFreshness(project,{as_of_date:'2026-10-03'})).observation_state,'UNKNOWN_DATA');
 for(const classification of ['ASSUMPTION','SCENARIO']) {
  record.value=9;record.classification=classification;
  const row=price(sourceFreshness(project,{as_of_date:'2026-10-03'}));
  assert.equal(row.observation_state,'NOT_OBSERVED');assert.equal(row.observation_age_days,null);assert.equal(row.evidence_state,'INSUFFICIENT');
 }
});
test('missing evidence remains insufficient and superseded sources remain inspectable but inactive',()=>{
 const project=example(),record=selectInputs(project.inputs)['uni.price'];
 project.sources=project.sources.filter(s=>!record.source_ids.includes(s.id));
 assert.equal(price(sourceFreshness(project,{as_of_date:'2026-10-03'})).evidence_state,'INSUFFICIENT');
 const source=production.sources[0],next=structuredClone(production);
 next.sources.push({...source,id:'inactive-test-source',version:2,supersedes:source.id});
 const report=sourceFreshness(next,{as_of_date:'2026-10-03'});
 assert.equal(report.source_checks.find(row=>row.source.id==='inactive-test-source').active,false);
 assert.ok(report.source_checks.some(row=>row.source.id===source.id));
});
test('freshness inspection preserves economics, thesis, project records and immutable history',()=>{
 const before=fingerprint(production),history=readSnapshots(production.root,'production');
 const economics=calculate(production,{history,previousThesis:history.at(-1)?.thesis||{}});
 const report=sourceFreshness(production,{as_of_date:'2026-10-03'});
 assert.equal(report.persisted,false);assert.equal(report.fixture,false);
 assert.equal(report.inputs.find(row=>row.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 assert.equal(fingerprint(production),before);assert.equal(fingerprint(readSnapshots(production.root,'production')),fingerprint(history));
 assert.deepEqual(calculate(production,{history,previousThesis:history.at(-1)?.thesis||{}}),economics);
});
for(const [name,edit,pattern] of [
 ['negative window',p=>{p.observation_max_age_days=-1;},/Invalid freshness policy/],
 ['fractional days',p=>{p.retrieval_max_age_days=1.5;},/Invalid freshness policy/],
 ['observed threshold',p=>{p.classification='OBSERVED';},/Invalid freshness policy/],
 ['unknown metric',p=>{p.observation_overrides['unknown.metric']=7;},/Unknown freshness policy input/],
 ['blank rationale',p=>{p.rationale=' ';},/requires a rationale/]
]) test(`freshness policy rejects ${name}`,()=>{
 const modified=structuredClone(policy);edit(modified);
 assert.throws(()=>sourceFreshness(production,{as_of_date:'2026-10-03',policy:modified}),pattern);
});
test('freshness rejects invalid, future and missing CLI dates',()=>{
 assert.throws(()=>sourceFreshness(production,{as_of_date:'2026-02-30'}),/Invalid freshness as-of/);
 assert.throws(()=>sourceFreshness(production,{as_of_date:'2099-01-01'}),/cannot be in the future/);
 const run=(...args)=>spawnSync(process.execPath,['cli.js','freshness','--production',...args],{cwd:production.root,encoding:'utf8'});
 const missing=run('--as-of');assert.equal(missing.status,1);assert.match(missing.stderr,/Use --as-of/);
 const report=run('--as-of','2026-10-03');assert.equal(report.status,0,report.stderr);
 assert.equal(JSON.parse(report.stdout).as_of_date,'2026-10-03');assert.equal(JSON.parse(report.stdout).persisted,false);
});
