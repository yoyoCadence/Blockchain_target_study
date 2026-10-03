import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenues,verifyRevenueReview} from '../../engine/research/revenues.js';
import {compareRevenueReviews} from '../../engine/research/revenue-comparison.js';

const project=loadProject('production');
const file='data/research/secz-prospectus-revenue-2026-10-03-v1.yaml';
const dossier=readYaml(file);
const load=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const annual=load('data/research/revenue-reviews/secz-annual-v1.json');
const prospectus=load('data/research/revenue-reviews/secz-prospectus-v1.json');
const comparison=load('data/research/revenue-comparisons/secz-s1-to-prospectus-v1.json');

test('prospectus independently preserves dated full-year subsidiary revenue without replacing prior filing',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')});
 const reviewed=reviewRevenues(project,dossier);verifyRevenueReview(reviewed);
 assert.deepEqual(reviewed,prospectus);
 assert.equal(dossier.statement.filing.form,'424B3');assert.equal(dossier.statement.filing.filing_date,'2026-08-07');
 assert.equal(dossier.statement.filing.period_of_report,null);assert.equal(dossier.statement.audit.report_date,'2026-04-10');
 assert.equal(dossier.statement.scope,'operating_subsidiary_consolidated');
 assert.deepEqual(dossier.observations.map(r=>r.value),[37411171,24740969,62152140,10103109,8533061,18636170]);
 assert.ok(dossier.observations.every(r=>r.classification==='OBSERVED'&&r.as_of_date==='2026-08-07'&&r.unit==='USD'&&!r.supersedes));
 assert.ok(dossier.observations.every(r=>!annual.dossier.observations.some(old=>old.id===r.id)));
 assert.ok(dossier.sources.every(s=>s.tier===1&&s.date==='2026-08-07'&&!s.supersedes));
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')}),before);
});

test('six same-period cells match while distinct source and statement changes remain visible',()=>{
 const replay=compareRevenueReviews(project,annual,prospectus);assert.deepEqual(replay,comparison);
 const {id,...content}=comparison;assert.equal(id,fingerprint(content));
 assert.equal(comparison.alignment_status,'MATCHED_INTERVALS');assert.equal(comparison.matched.length,6);
 assert.ok(comparison.matched.every(r=>r.lineage_status==='INDEPENDENT_OBSERVATIONS'&&!r.value_change&&!r.conflict&&r.record_change));
 assert.equal(comparison.source_change,true);assert.equal(comparison.statement_change,true);assert.equal(comparison.formula_change,false);
 assert.deepEqual(comparison.context_changes,[]);assert.equal(comparison.unmatched_previous.length,0);
 assert.equal(comparison.unmatched_current.length,0);
 assert.deepEqual(comparison.dependencies,[annual.id,prospectus.id]);
});

test('prior annual and quarterly artifacts replay unchanged; repeated filings do not add financial thesis periods',()=>{
 assert.equal(annual.id,'6711631d1d64d7f7837cdc4b1180eade966b456a71c959abd1f4140b764b54d1');
 const quarter=load('data/research/revenue-reviews/secz-q22026-v1.json');
 for(const artifact of [annual,quarter]) {
  verifyRevenueReview(artifact);assert.deepEqual(reviewRevenues(project,artifact.dossier,{formulas:artifact.formulas}),artifact);
 }
 assert.equal(quarter.id,'f98e20052dd8d05552e8a054d9a43a3e4ede417bccba875ea1a895b064e49173');
 const snapshots=readSnapshots(project.root,'production');assert.equal(snapshots.length,2);
 assert.equal(new Set(snapshots.map(s=>JSON.stringify(s.period))).size,1);
 assert.equal(calculate(project,{history:snapshots}).thesis.SECZ.coverage,'insufficient');
});

test('prospectus cannot cite an observation from before its publication',()=>{
 const d=structuredClone(dossier);d.observations[0].as_of_date='2026-08-06';
 assert.throws(()=>reviewRevenues(project,d),/published after observation/);
});

test('prospectus CLI produces reviewed and compared research without canonical revenue ingestion',()=>{
 const history=fingerprint(readSnapshots(project.root,'production'));
 const reviewed=spawnSync(process.execPath,['cli.js','revenue-review',file,'--production'],{cwd:project.root,encoding:'utf8'});
 assert.equal(reviewed.status,0,reviewed.stderr);assert.equal(JSON.parse(reviewed.stdout).id,prospectus.id);
 const compared=spawnSync(process.execPath,['cli.js','revenue-compare','data/research/revenue-reviews/secz-annual-v1.json','data/research/revenue-reviews/secz-prospectus-v1.json','--production'],{cwd:project.root,encoding:'utf8'});
 assert.equal(compared.status,0,compared.stderr);assert.equal(JSON.parse(compared.stdout).id,comparison.id);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
});
