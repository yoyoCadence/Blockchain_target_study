import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {reviewRevenues} from '../../engine/research/revenues.js';

const production=loadProject('production'),cutoff='2026-10-03';
const policy=()=>readYaml('spec/source-freshness.yaml');
const identity=()=>readYaml('data/research/core-identifiers-2026-10-03.yaml');
const report=options=>researchFreshness(production,{as_of_date:cutoff,...options});

function temporaryCatalog(t,saved,{kind='identity'}={}) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-freshness-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.join(root,'data/research'),{recursive:true});
 for(const file of ['source-freshness.yaml','source-freshness-schema.yaml','research-catalog-schema.yaml','identity-review-schema.yaml','revenue-review-schema.yaml'])
  fs.writeFileSync(path.join(root,'spec',file),fs.readFileSync(path.join(production.root,'spec',file)));
 const catalog={version:1,records:saved.map((value,index)=>{
  value=structuredClone(value);if(kind==='identity')value.id+=`-test-${index}`;
  const file=`test-${index}.json`;fs.writeFileSync(path.join(root,'data/research',file),JSON.stringify(value));
  return {id:`test-${index}`,label:'Isolated test review',kind,file,expected_id:kind==='identity'?fingerprint(value):value.id};
 })};
 return {project:{...production,root},catalog};
}

test('research freshness replays six reviews separately from unchanged canonical economics and history',()=>{
 const before=fingerprint({production,economics:calculate(production),history:readSnapshots(production.root,'production')});
 const combined=report(),research=combined.research;
 const {scope,research:ignored,...canonical}=combined;
 assert.deepEqual(canonical,sourceFreshness(production,{as_of_date:cutoff}));
 assert.equal(scope,'canonical_and_cataloged_research');assert.equal(research.persisted,false);assert.equal(research.financial_inputs_updated,false);
 assert.equal(research.artifacts.length,6);assert.equal(research.records.length,145);assert.equal(research.source_checks.length,20);
 assert.deepEqual(research.summary.observation_states,{NOT_OBSERVED:10,UNKNOWN_DATA:9,WITHIN_REVIEW_WINDOW:126});
 assert.equal(research.calculation.classification,'DERIVED');assert.equal(research.calculation.formula_version,1);
 assert.deepEqual(research.calculation.dependencies.artifact_ids,research.artifacts.map(a=>a.artifact_id));
 assert.ok(research.records.filter(r=>r.catalog_id==='secz-ttm-20260630').every(r=>r.record.value===null&&r.record.status==='COMPARABILITY_UNVERIFIED'&&r.evidence_state==='INSUFFICIENT'));
 assert.ok(research.records.filter(r=>r.record.identifier).every(r=>r.record.investability.status==='unverified'));
 assert.equal(fingerprint({production,economics:calculate(production),history:readSnapshots(production.root,'production')}),before);
});

test('historical cutoff separates original observations from not-yet-reviewed or retrieved research',()=>{
 const research=report({as_of_date:'2026-08-13'}).research;
 assert.ok(research.artifacts.every(a=>a.review_state==='NOT_AVAILABLE_AT_CUTOFF'&&a.review_age_days===null));
 const quarter=research.records.filter(r=>r.catalog_id==='secz-quarter-half-2026');
 assert.ok(quarter.every(r=>r.observation_age_days===0&&r.observation_state==='WITHIN_REVIEW_WINDOW'&&r.evidence_state==='INSUFFICIENT'));
 assert.ok(research.records.filter(r=>r.record.identifier).every(r=>r.observation_state==='NOT_AVAILABLE_AT_CUTOFF'));
 assert.ok(research.source_checks.every(s=>s.retrieval_age_days===null));
});

test('review availability uses UTC calendar days and retains timestamp offsets',t=>{
 const d=identity();d.review.reviewed_at='2026-10-02T23:00:00-08:00';
 const {project,catalog}=temporaryCatalog(t,[d]);
 let research=researchFreshness(project,{catalog,as_of_date:'2026-10-02'}).research;
 assert.equal(research.artifacts[0].review_state,'NOT_AVAILABLE_AT_CUTOFF');
 research=researchFreshness(project,{catalog,as_of_date:cutoff}).research;
 assert.equal(research.artifacts[0].review_state,'AVAILABLE_AT_CUTOFF');assert.equal(research.artifacts[0].review_age_days,0);
 assert.equal(research.artifacts[0].review.reviewed_at,d.review.reviewed_at);
});

for(const [days,state] of [[51,'WITHIN_REVIEW_WINDOW'],[50,'STALE_FOR_CURRENT_USE']]) test(`raw revenue age respects inclusive ${days}-day analyst window`,()=>{
 const p=policy();p.observation_max_age_days=days;
 const research=report({policy:p}).research;
 assert.ok(research.records.filter(r=>r.catalog_id==='secz-quarter-half-2026').every(r=>r.observation_age_days===51&&r.observation_state===state));
 assert.equal(research.calculation.dependencies.policy_version,1);
});

test('old retrieval independently requires recheck without renewing identity observation',t=>{
 const d=identity();d.sources[0].retrieved_at='2026-08-01T12:00:00Z';
 const {project,catalog}=temporaryCatalog(t,[d]),research=researchFreshness(project,{catalog,as_of_date:cutoff}).research;
 const row=research.records.find(r=>r.metric_id==='UNI.identity');
 assert.equal(row.observation_age_days,0);assert.equal(row.observation_state,'WITHIN_REVIEW_WINDOW');assert.equal(row.evidence_state,'RECHECK_DUE');
 assert.equal(row.record.as_of_date,cutoff);
 assert.equal(research.source_checks.find(r=>r.source.id===d.sources[0].id).publication_age_days>1000,true);
});

for(const [date,pattern] of [['2026-02-30',/Invalid freshness as-of/],['2099-01-01',/cannot be in the future/]])
 test(`research freshness rejects invalid cutoff ${date}`,()=>assert.throws(()=>report({as_of_date:date}),pattern));

test('research review windows cannot be reclassified as observed facts',()=>{
 const p=policy();p.classification='OBSERVED';
 assert.throws(()=>report({policy:p}),/Invalid freshness policy/);
});

test('research freshness refuses fixture mode',()=>assert.throws(()=>researchFreshness(loadProject('fixture')),/requires production/));

test('research freshness rejects a wrong catalog pin before issuing freshness conclusions',()=>{
 const catalog=readYaml('spec/research-catalog.yaml');catalog.records[0].expected_id='0'.repeat(64);
 assert.throws(()=>report({catalog}),/fingerprint mismatch/);
});

test('conflicting source content under one ID across research artifacts is rejected',t=>{
 const old=identity(),next=identity();next.sources[0].title+=' changed under reused ID';
 const {project,catalog}=temporaryCatalog(t,[old,next]);
 assert.throws(()=>researchFreshness(project,{catalog,as_of_date:cutoff}),/source ID conflict/);
});

test('research source IDs cannot silently conflict with canonical source history',t=>{
 const d=identity(),oldId=d.sources[0].id;d.sources[0].id=production.sources[0].id;
 for(const record of d.identities)record.source_ids=record.source_ids.map(id=>id===oldId?d.sources[0].id:id);
 const {project,catalog}=temporaryCatalog(t,[d]);
 assert.throws(()=>researchFreshness(project,{catalog,as_of_date:cutoff}),/source ID conflict/);
});

test('explicit new source versions and independent same-period observations remain inspectable',t=>{
 const old=identity(),next=identity(),source=next.sources[0],oldId=source.id;
 Object.assign(source,{id:oldId+'-v2',version:2,supersedes:oldId,title:'Isolated revised source version'});
 for(const record of next.identities) {
  record.id+='-independent-review';record.version=2;
  record.source_ids=record.source_ids.map(id=>id===oldId?source.id:id);
 }
 const {project,catalog}=temporaryCatalog(t,[old,next]),research=researchFreshness(project,{catalog,as_of_date:cutoff}).research;
 assert.equal(research.records.length,6);assert.equal(research.source_checks.length,6);
 assert.ok(research.source_checks.some(r=>r.source.id===oldId));assert.ok(research.source_checks.some(r=>r.source.id===source.id));
 assert.equal(new Set(research.records.map(r=>r.artifact_id)).size,2);
});

test('changed identity content cannot reuse a historical observation ID across reviews',t=>{
 const old=identity(),next=identity();next.identities[0].identifier.network='Changed test-only network claim';
 const {project,catalog}=temporaryCatalog(t,[old,next]);
 assert.throws(()=>researchFreshness(project,{catalog,as_of_date:cutoff}),/record ID conflict/);
});

test('unknown observed revenue preserves original metadata and never acquires sufficient evidence',t=>{
 const saved=readYaml('data/research/revenue-reviews/secz-q22026-v1.json');
 Object.assign(saved.dossier.observations[0],{value:null,confidence:'unknown'});
 const revised=reviewRevenues(production,saved.dossier,{formulas:saved.formulas});
 const {project,catalog}=temporaryCatalog(t,[revised],{kind:'revenue'});
 const row=researchFreshness(project,{catalog,as_of_date:cutoff}).research.records[0];
 assert.equal(row.observation_state,'UNKNOWN_DATA');assert.equal(row.evidence_state,'INSUFFICIENT');assert.equal(row.record.value,null);
 assert.equal(row.record.classification,'OBSERVED');assert.equal(row.record.as_of_date,'2026-08-13');assert.ok(row.record.period_id);
 assert.equal(row.period.basis,'quarterly');assert.equal(row.period.end,'2026-06-30');
});

test('manual research-freshness CLI requires production/cutoff syntax and never writes journals',()=>{
 const before=fingerprint(readSnapshots(production.root,'production'));
 const run=(...args)=>spawnSync(process.execPath,['cli.js','research-freshness',...args],{cwd:production.root,encoding:'utf8'});
 const valid=run('--production','--as-of',cutoff);assert.equal(valid.status,0,valid.stderr);
 assert.equal(JSON.parse(valid.stdout).research.artifacts.length,6);assert.equal(JSON.parse(valid.stdout).persisted,false);
 const fixture=run();assert.equal(fixture.status,1);assert.match(fixture.stderr,/requires --production/);
 const missing=run('--production','--as-of');assert.equal(missing.status,1);assert.match(missing.stderr,/Use --as-of/);
 assert.equal(fingerprint(readSnapshots(production.root,'production')),before);
});
