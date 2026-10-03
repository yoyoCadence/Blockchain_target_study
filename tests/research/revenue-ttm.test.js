import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenues} from '../../engine/research/revenues.js';
import {reviewRevenueTtm,verifyRevenueTtm} from '../../engine/research/revenue-ttm.js';

const project=loadProject('production');
const file='data/research/secz-ttm-20260630-review-v1.yaml';
const request=readYaml(file);
const load=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const saved=load('data/research/revenue-ttm-reviews/secz-20260630-v1.json');
const {annual,interim}=saved.input_reviews;
// This test-only assumption exercises arithmetic; committed research keeps the
// unresolved acquisition check null and never publishes these conditional sums.
const confirmed=()=>{
 const r=structuredClone(request);
 r.comparability.checks.acquisition_treatment.value=true;
 r.comparability.checks.acquisition_treatment.rationale='Test-only assumed equivalence, not production evidence or a verified legal-entity identity.';
 return r;
};
const run=r=>reviewRevenueTtm(project,r,annual,interim);

test('TTM production review preserves the acquisition conflict, null values and financial state',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')});
 const result=run(request);verifyRevenueTtm(result);assert.deepEqual(result,saved);
 assert.deepEqual(result.unconfirmed_checks,['acquisition_treatment']);
 assert.ok(result.results.every(r=>r.value===null&&r.confidence==='unknown'&&r.status==='COMPARABILITY_UNVERIFIED'));
 assert.equal(result.request.comparability.classification,'ASSUMPTION');
 assert.match(result.request.comparability.checks.acquisition_treatment.rationale,/Inc.*LLC/);
 assert.equal(result.persisted,false);assert.equal(result.financial_inputs_updated,false);
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')}),before);
});

test('conditionally confirmed TTM uses full-year minus prior YTD plus current YTD with complete lineage',()=>{
 const result=run(confirmed());
 assert.deepEqual(result.results.map(r=>r.value),[36249459,30520797,66770256]);
 assert.ok(result.results.every(r=>r.classification==='DERIVED'&&r.unit==='USD'&&r.confidence==='medium'&&r.status==='AVAILABLE'));
 assert.deepEqual(result.results[0].period,{basis:'TTM',start:'2025-07-01',end:'2026-06-30',duration_months:12});
 assert.deepEqual(result.results[0].dependencies,[annual.dossier.observations[0].id,'secz-2025-h1.tokenization@1','secz-2026-h1.tokenization@1']);
 assert.deepEqual(result.results[0].assumption_dependencies,[request.comparability.id]);
 assert.ok(result.results.every(r=>r.context_dependencies.includes(annual.dossier.statement.id)&&r.context_dependencies.includes(interim.dossier.statement.id)));
 assert.ok(result.results[0].source_ids.includes('secz-424b3-20260807-annual-statements-v1'));
 assert.ok(result.results[0].source_ids.includes('secz-q22026-financial-exhibit-v1'));
 assert.equal(result.formula.version,1);assert.equal(result.results[0].formula_id,'research.revenue_ttm_bridge');
});

for(const name of Object.keys(request.comparability.checks)) for(const value of [false,null]) {
 test(`TTM ${name}=${value} remains unverified rather than producing a flow`,()=>{
  const r=confirmed();r.comparability.checks[name].value=value;
  assert.deepEqual(run(r).unconfirmed_checks,[name]);assert.ok(run(r).results.every(r=>r.value===null));
 });
}

for(const [name,edit,pattern] of [
 ['fixture request',r=>{r.fixture=true;},/Invalid revenue TTM request/],
 ['judgment promoted to observed',r=>{r.comparability.classification='OBSERVED';},/Invalid revenue TTM request/],
 ['missing check',r=>{delete r.comparability.checks.acquisition_treatment;},/Invalid revenue TTM request/],
 ['unknown review binding',r=>{r.annual_review_id='0'.repeat(64);},/different review IDs/],
 ['unknown period',r=>{r.annual_period_id='missing';},/Unknown revenue TTM period/],
 ['quarter mistaken for YTD',r=>{r.current_ytd_period_id='secz-2026-q2';},/requires annual and YTD/],
 ['prior quarter mistaken for YTD',r=>{r.prior_ytd_period_id='secz-2025-q2';},/requires annual and YTD/],
 ['reversed current and prior',r=>{[r.current_ytd_period_id,r.prior_ytd_period_id]=[r.prior_ytd_period_id,r.current_ytd_period_id];},/one year apart/],
 ['wrong annual year',r=>{r.annual_period_id='secz-2024-fy';},/one year apart/],
 ['future review',r=>{r.review.reviewed_at='2099-01-01T00:00:00Z';},/future or premature/],
 ['future as-of',r=>{r.as_of_date='2099-01-01';},/future or premature/],
 ['review before input',r=>{r.review.reviewed_at='2026-10-03T07:00:00Z';},/predates input review/],
 ['evidence unavailable at cutoff',r=>{r.as_of_date='2026-08-12';},/unavailable at review cutoff/],
 ['blank rationale',r=>{r.comparability.checks.audit_difference.rationale=' ';},/needs rationale/],
 ['blank reviewer',r=>{r.review.reviewer=' ';},/needs rationale/],
 ['absent source',r=>{r.comparability.checks.revenue_definitions.source_ids=['missing'];},/Missing revenue TTM comparability source/],
 ['one-sided source evidence',r=>{r.comparability.checks.continuing_operations.source_ids=['secz-q22026-financial-exhibit-v1'];},/both filings/],
 ['confirmed with unknown confidence',r=>{r.comparability.confidence='unknown';},/stated confidence/]
]) test(`TTM rejects ${name}`,()=>{
 const r=confirmed();edit(r);assert.throws(()=>run(r),pattern);
});

test('a missing revenue input propagates only through dependent TTM flows',()=>{
 const dossier=structuredClone(interim.dossier),row=dossier.observations.find(r=>r.id==='secz-2026-h1.tokenization@1');
 row.value=null;row.confidence='unknown';
 const changed=reviewRevenues(project,dossier),r=confirmed();r.interim_review_id=changed.id;
 const result=reviewRevenueTtm(project,r,annual,changed);
 assert.equal(result.results[0].value,null);assert.equal(result.results[0].status,'UNKNOWN_INPUT');
 assert.equal(result.results[1].status,'AVAILABLE');assert.equal(result.results[2].status,'AVAILABLE');
});

test('TTM separately rejects a selected observation dated after the cutoff even with available sources',()=>{
 const dossier=structuredClone(interim.dossier);
 dossier.observations.find(r=>r.id==='secz-2026-h1.tokenization@1').as_of_date='2026-08-14';
 const changed=reviewRevenues(project,dossier),r=confirmed();r.interim_review_id=changed.id;r.as_of_date='2026-08-13';
 assert.throws(()=>reviewRevenueTtm(project,r,annual,changed),/input unavailable at cutoff/);
});

test('TTM rejects an impossible prior YTD amount even when other arithmetic would conceal it',()=>{
 const dossier=structuredClone(interim.dossier);
 dossier.observations.find(r=>r.id==='secz-2025-h1.tokenization@1').value=40000000;
 dossier.observations.find(r=>r.id==='secz-2025-h1.total@1').value=49160139;
 const changed=reviewRevenues(project,dossier),r=confirmed();r.interim_review_id=changed.id;
 assert.throws(()=>reviewRevenueTtm(project,r,annual,changed),/exceeds full-year/);
});

test('TTM rejects changing statement scope and rehashed input result forgery',()=>{
 const dossier=structuredClone(interim.dossier);dossier.statement.entity_name+=' OTHER';
 const changed=reviewRevenues(project,dossier),r=confirmed();r.interim_review_id=changed.id;
 assert.throws(()=>reviewRevenueTtm(project,r,annual,changed),/scope\/accounting context/);
 const forged=structuredClone(annual);forged.comparisons[0].value++;
 const {id,...content}=forged;forged.id=fingerprint(content);r.annual_review_id=forged.id;
 assert.throws(()=>reviewRevenueTtm(project,r,forged,interim),/does not replay/);
});

test('TTM retains formula snapshots, rejects unsafe AST and detects artifact tampering',()=>{
 assert.deepEqual(reviewRevenueTtm(project,saved.request,saved.input_reviews.annual,saved.input_reviews.interim,{formula:saved.formula}),saved);
 const formula=structuredClone(saved.formula);formula.expression={op:'eval',args:['annual','prior_ytd','current_ytd']};
 assert.throws(()=>reviewRevenueTtm(project,request,annual,interim,{formula}),/Unknown formula operation/);
 const changed=structuredClone(saved);changed.results[0].value=123;
 assert.throws(()=>verifyRevenueTtm(changed),/integrity failure/);
 assert.throws(()=>reviewRevenueTtm(loadProject('fixture'),request,annual,interim),/requires production/);
});

test('TTM CLI requires explicit files and production mode, preserving the financial journal',()=>{
 const history=fingerprint(readSnapshots(project.root,'production'));
 const args=['cli.js','revenue-ttm',file,'data/research/revenue-reviews/secz-prospectus-v1.json','data/research/revenue-reviews/secz-q22026-v1.json'];
 const invoke=a=>spawnSync(process.execPath,a,{cwd:project.root,encoding:'utf8'});
 const wrong=invoke(args);assert.equal(wrong.status,1);assert.match(wrong.stderr,/require --production/);
 const missing=invoke(['cli.js','revenue-ttm',file,'--production']);assert.equal(missing.status,1);assert.match(missing.stderr,/ANNUAL_REVIEW INTERIM_REVIEW/);
 const result=invoke([...args,'--production']);assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(result.stdout).id,saved.id);assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
});
