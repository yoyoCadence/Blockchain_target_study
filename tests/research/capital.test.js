import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {evaluate,references,orderFormulas} from '../../engine/formulas/index.js';
import {replayCapitalReview} from '../../engine/research/capital.js';

const file='data/research/capital-reviews/secz-resale-20261004-v1.json';
const artifact=readYaml(file),project=loadProject('production');
const resign=record=>{const {id,...content}=record;record.id=fingerprint(content);return record;};
const changed=fn=>{const copy=structuredClone(artifact);fn(copy);return resign(copy);};
const replayResults=copy=>{
 const metrics=Object.fromEntries(copy.observations.map(o=>[o.metric_id,o]));
 for(const f of orderFormulas(copy.formulas,Object.keys(metrics))) {
  const record=copy.derived.find(d=>d.metric_id===f.output);
  record.value=evaluate(f.expression,metrics);
  if(record.value===null)record.confidence='unknown';
  record.dependencies=references(f.expression).map(metric=>metrics[metric].id);
  metrics[f.output]=record;
 }
};

test('capital inspection replays the real artifact with Chinese labels and all original evidence',()=>{
 const before=fingerprint(project),financial=calculate(project),history=readSnapshots(project.root,'production');
 const result=replayCapitalReview(project,artifact);
 assert.equal(result.artifact_id,artifact.id);assert.equal(result.persisted,false);
 assert.equal(result.financial_inputs_updated,false);assert.deepEqual(result.full_review,artifact);
 assert.deepEqual([result.summary.rows,result.summary.observations,result.summary.unknown_observations],[50,108,9]);
 assert.equal(result.summary.checks.length,7);assert.ok(result.summary.checks.every(c=>/[一-鿿]/u.test(c.label)));
 assert.deepEqual(result.summary.unresolved,artifact.context.unresolved);
 result.full_review.rows[0].label='changed returned clone';
 assert.notEqual(artifact.rows[0].label,result.full_review.rows[0].label);
 assert.equal(fingerprint(project),before);assert.deepEqual(calculate(project),financial);
 assert.deepEqual(readSnapshots(project.root,'production'),history);
});

test('a matching replacement digest cannot hide a different result or dependency chain',()=>{
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.derived[0].value++)),/does not replay/);
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.derived[2].dependencies.reverse())),/dependencies mismatch/);
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.derived[0].formula_version++)),/version mismatch/);
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.formulas[0].expression={op:'eval',args:['process.exit()']})),/Unknown formula operation/);
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.formulas[0].expression.args.pop())),/category arithmetic/);
 assert.throws(()=>replayCapitalReview(project,changed(a=>a.formulas[0].expression.args[0]=a.formulas[0].output)),/category arithmetic/);
 const corrupt=structuredClone(artifact);corrupt.rows[0].label+='!';
 assert.throws(()=>replayCapitalReview(project,corrupt),/integrity failure/);
});

for(const [name,mutate,message] of [
 ['duplicate observation IDs',a=>a.observations[1].id=a.observations[0].id,/Duplicate id/],
 ['duplicate metrics',a=>a.observations[1].metric_id=a.observations[0].metric_id,/Duplicate metric_id/],
 ['missing sources',a=>a.observations[0].source_ids=['missing'],/Missing capital source/],
 ['uncovered metrics',a=>a.sources.find(s=>s.id===a.observations[0].source_ids[0]).covered_metrics=[],/does not cover/],
 ['social evidence alone',a=>a.sources.forEach(s=>s.tier=5),/primary evidence/],
 ['fixture sources',a=>a.sources[0].fixture=true,/Fixture source/],
 ['fixture observations',a=>a.observations[0].fixture=true,/asset\/provenance/],
 ['wrong classification',a=>{a.observations[0].classification='ASSUMPTION';a.observations[0].rationale='test';},/classification/],
 ['flow unit',a=>a.observations[0].unit='count/year',/point share counts/],
 ['annual period',a=>a.observations[0].period.basis='annual',/point share counts/],
 ['future period',a=>a.observations[0].period.end='2026-10-05',/record chronology/],
 ['knowledge before source publication',a=>a.observations[0].as_of_date='2026-07-02',/published after observation/],
 ['retrieval before publication',a=>a.sources[0].retrieved_at='2026-01-01T00:00:00Z',/published after retrieval/],
 ['retrieval after review',a=>a.sources[0].retrieved_at='2099-01-01T00:00:00Z',/retrieved after review/],
 ['invalid supersession',a=>a.sources[0].supersedes='missing',/supersession/],
 ['supersession without higher version',a=>a.sources.find(s=>s.supersedes).version=1,/supersession/],
 ['future review',a=>a.review.reviewed_at='2099-01-01T00:00:00Z',/cannot be in the future/],
 ['future knowledge',a=>a.as_of_date='2099-01-01',/cannot be in the future/],
 ['review before knowledge day',a=>a.review.reviewed_at='2026-10-03T23:59:59Z',/precedes artifact/],
 ['raw zero replacing dash',a=>a.rows.find(r=>r.earnout_text==='—').earnout_text='0',/raw cell differs/],
 ['negative observation',a=>a.observations[0].value=-1,/Negative observed/],
 ['fractional shares',a=>a.observations[0].value=0.5,/safe integers/],
 ['unsafe integer',a=>a.observations[0].value=Number.MAX_SAFE_INTEGER+1,/safe integers/],
 ['known value claiming unknown confidence',a=>a.observations[0].confidence='unknown',/stated confidence/],
 ['null value claiming confidence',a=>a.observations.find(o=>o.value===null).confidence='high',/unknown confidence/],
 ['row pairing',a=>a.rows[0].common_observation_id=a.rows[1].common_observation_id,/row observation mismatch/],
 ['different row endpoints',a=>a.observations.find(o=>o.id===a.rows[0].earnout_observation_id).period.end='2026-07-02',/different dates/],
 ['missing category',a=>a.observations.pop(),/Missing capital category/],
 ['different derived classification',a=>{a.derived[0].classification='OBSERVED';a.derived[0].source_ids=[a.sources[0].id];},/classification/],
 ['derived before dependencies',a=>a.derived.find(d=>d.metric_id.endsWith('unreconciled-company-earnout-gap')).as_of_date='2026-08-01',/precedes its evidence/]
])test(`capital semantic validation rejects ${name} even with a matching digest`,()=>{
 assert.throws(()=>replayCapitalReview(project,changed(mutate)),message);
});

test('a selected unknown common cell propagates through the three totals without replacing the earnout dashes',()=>{
 const copy=changed(a=>{
  a.rows[0].common_text='—';a.observations[0].value=null;a.observations[0].confidence='unknown';replayResults(a);
 });
 const result=replayCapitalReview(project,copy);
 assert.equal(result.summary.unknown_observations,10);
 for(const metric of ['offered-common-total','combined-offered-total','common-less-warrant-capacity'])
  assert.equal(result.summary.checks.find(c=>c.metric_id.endsWith(metric)).value,null);
 assert.equal(result.full_review.rows.filter(r=>r.earnout_text==='—').length,9);
});

test('new formula versions replay from embedded definitions and a signed reconciliation gap is valid',()=>{
 const copy=changed(a=>{
  a.formulas[5].version=2;a.derived[5].formula_version=2;
  a.observations.find(o=>o.metric_id.endsWith('company-earnout-capacity')).value=0;
  replayResults(a);
 });
 const result=replayCapitalReview(project,copy);
 assert.equal(result.summary.checks.find(c=>c.metric_id.endsWith('unreconciled-company-earnout-gap')).value,-5288616);
 assert.equal(result.summary.checks[5].formula_version,2);
});

test('UTC review day supports offsets without rewriting timestamps',()=>{
 const copy=changed(a=>{
  a.review.reviewed_at='2026-10-03T20:51:08-04:00';
  a.sources.filter(s=>s.retrieved_at===artifact.review.reviewed_at).forEach(s=>s.retrieved_at=a.review.reviewed_at);
 });
 assert.equal(replayCapitalReview(project,copy).full_review.review.reviewed_at,'2026-10-03T20:51:08-04:00');
 const tooEarly=changed(a=>a.review.reviewed_at='2026-10-04T00:00:00+09:00');
 assert.throws(()=>replayCapitalReview(project,tooEarly),/precedes artifact/);
});

test('production-only capital CLI returns Chinese summary and cannot write project or journal files',()=>{
 const tracked=['task.md','reports/current-thesis.md',file,
  ...fs.readdirSync('data/events/production').map(f=>`data/events/production/${f}`)];
 const before=tracked.map(f=>fs.readFileSync(f));
 const call=args=>spawnSync(process.execPath,['cli.js','capital-review',...args],{encoding:'utf8'});
 const success=call([file,'--production']);assert.equal(success.status,0,success.stderr);
 assert.deepEqual(JSON.parse(success.stdout),replayCapitalReview(project,artifact));
 for(const args of [[file],['--production']])assert.equal(call(args).status,1);
 assert.throws(()=>replayCapitalReview(loadProject('fixture'),artifact),/requires production/);
 tracked.forEach((f,index)=>assert.deepEqual(fs.readFileSync(f),before[index]));
});
