import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenueTtm,verifyRevenueTtm} from '../../engine/research/revenue-ttm.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {createServer} from '../../server.js';

const p=loadProject('production'),catalog=readYaml('spec/research-catalog.yaml');
const v1=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v1.json'),v2=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v2.json');
const request=readYaml('data/research/secz-ttm-20260630-review-v2.yaml'),{annual,interim}=v2.input_reviews;
const run=edit=>{const r=structuredClone(request);edit(r);return reviewRevenueTtm(p,r,annual,interim,{formula:v2.formula});};
const TTM={'secz.reported_tokenization_revenue':36249459,'secz.reported_asset_servicing_revenue':30520797,'secz.reported_total_revenue':66770256};

test('SECZ TTM v2 replays the saved request into three conditional DERIVED results with exact lineage',()=>{
 verifyRevenueTtm(v2);assert.deepEqual(v2.request,request);
 assert.equal(reviewRevenueTtm(p,request,annual,interim,{formula:v2.formula}).id,v2.id);
 assert.equal(v2.id,'cd09b167530a627545fbb7dfeaed1d3f3d267d21e2e091210ec3513595f8e45c');
 assert.equal(catalog.records.find(r=>r.id==='secz-ttm-20260630-v2').expected_id,v2.id);
 assert.deepEqual(v2.unconfirmed_checks,[]);assert.equal(v2.persisted,false);assert.equal(v2.financial_inputs_updated,false);
 const observations=new Map([...annual.dossier.observations,...interim.dossier.observations].map(o=>[o.id,o]));
 for(const r of v2.results) {
  assert.equal(r.value,TTM[r.metric_id]);assert.equal(r.classification,'DERIVED');assert.equal(r.status,'AVAILABLE');assert.equal(r.confidence,'low');assert.equal(r.unit,'USD');
  assert.deepEqual(r.period,{basis:'TTM',start:'2025-07-01',end:'2026-06-30',duration_months:12});
  assert.equal(r.formula_id,'research.revenue_ttm_bridge');assert.equal(r.formula_version,1);assert.deepEqual(r.assumption_dependencies,['secz-ttm-20260630-comparability@2']);
  const [year,prior,current]=r.dependencies.map(id=>observations.get(id));
  assert.ok([year,prior,current].every(o=>o.classification==='OBSERVED'&&o.metric_id===r.metric_id&&o.unit==='USD'));
  assert.deepEqual([year.period_id,prior.period_id,current.period_id],['secz-2025-fy','secz-2025-h1','secz-2026-h1']);
  assert.equal(year.value-prior.value+current.value,r.value);
 }
 assert.equal(v2.results[0].value+v2.results[1].value,v2.results[2].value);
 assert.match(v2.limitations,/not an observed audited TTM statement/);
});

test('v2 changes only the acquisition judgment, confidence and wording while v1 and its nulls stay intact',()=>{
 verifyRevenueTtm(v1);assert.equal(v1.id,'6ff89732cd3c586c911471e36028a0227ae99b4dca136340b4ab15933d045c5d');
 assert.ok(v1.results.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));assert.equal(v1.request.comparability.checks.acquisition_treatment.value,null);
 for(const key of ['annual_review_id','interim_review_id','annual_period_id','prior_ytd_period_id','current_ytd_period_id'])assert.equal(request[key],v1.request[key]);
 assert.deepEqual(v2.input_reviews,v1.input_reviews);assert.deepEqual(v2.formula,v1.formula);
 const before=v1.request.comparability,after=request.comparability;
 for(const check of ['revenue_definitions','continuing_operations','selected_presentation','audit_difference'])assert.deepEqual(after.checks[check],before.checks[check]);
 assert.equal(request.id,'secz-ttm-20260630-review@2');assert.equal(request.version,2);
 assert.equal(after.id,'secz-ttm-20260630-comparability@2');assert.equal(after.version,2);assert.equal(after.classification,'ASSUMPTION');
 assert.equal(before.confidence,'medium');assert.equal(after.confidence,'low');
 const acquisition=after.checks.acquisition_treatment;assert.equal(acquisition.value,true);
 assert.deepEqual(acquisition.source_ids,before.checks.acquisition_treatment.source_ids);
 for(const text of ['依使用者（分析者）2026-10-07 指示','2025-04-15','21090525','不是法律主體等價的查證','MG Stover, Inc.','MG Stover LLC','衝突原樣保留','即失效','pro forma 表不採用'])
  assert.ok(acquisition.rationale.includes(text),text);
 assert.match(after.rationale,/v1 request 與其 null 結果保留不改/);assert.match(request.review.reviewer,/依使用者（分析者）指示/);
 assert.ok(Date.parse(request.review.reviewed_at)>Date.parse(v1.request.review.reviewed_at));
});

for(const [label,edit,expected] of [
 ['left unconfirmed',r=>r.comparability.checks.acquisition_treatment.value=null,['acquisition_treatment']],
 ['rejected',r=>r.comparability.checks.acquisition_treatment.value=false,['acquisition_treatment']],
 ['withdrawn together with the audit acknowledgement',r=>{r.comparability.checks.acquisition_treatment.value=null;r.comparability.checks.audit_difference.value=false;},['acquisition_treatment','audit_difference']]])
 test(`the conditional TTM returns to unknown when the acquisition assumption is ${label}`,()=>{
  const result=run(edit);assert.deepEqual(result.unconfirmed_checks,expected);
  assert.ok(result.results.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'&&r.confidence==='unknown'));
 });

test('confirmed comparability still needs stated confidence, rationale, both filings and review chronology',()=>{
 assert.throws(()=>run(r=>r.comparability.confidence='unknown'),/requires stated confidence/);
 assert.throws(()=>run(r=>r.comparability.checks.acquisition_treatment.rationale=' '),/check needs rationale/);
 assert.throws(()=>run(r=>r.comparability.checks.acquisition_treatment.source_ids=['secz-424b3-20260807-annual-statements-v1']),/evidence from both filings/);
 assert.throws(()=>run(r=>r.comparability.checks.acquisition_treatment.source_ids=['secz-acquisition-s1-note-20260731-v1']),/Missing revenue TTM comparability source/);
 assert.throws(()=>run(r=>r.review.reviewed_at='2026-10-03T06:00:00Z'),/predates input review|premature knowledge/);
 assert.throws(()=>run(r=>r.review.reviewed_at='2099-01-01T00:00:00Z'),/future or premature/);
 assert.throws(()=>run(r=>r.prior_ytd_period_id='secz-2025-q2'),/annual and YTD flows|Unknown revenue TTM period/);
});

test('catalog keeps both assumption versions; v2 results never become observations or canonical inputs',()=>{
 const history=readSnapshots(p.root,p.mode),before=fingerprint({economics:calculate(p),history});
 const result=inspectResearch(p),entries=result.records.filter(r=>r.kind==='revenue_ttm');
 assert.equal(result.records.length,13);assert.deepEqual(entries.map(r=>[r.id,r.comparability.id,r.comparability.version]),
  [['secz-ttm-20260630','secz-ttm-20260630-comparability@1',1],['secz-ttm-20260630-v2','secz-ttm-20260630-comparability@2',2]]);
 assert.ok(entries[0].records.every(r=>r.value===null));assert.deepEqual(entries[1].records.map(r=>r.value),Object.values(TTM));
 assert.deepEqual(entries[1].full_review,v2);assert.equal(entries[1].artifact_id,v2.id);
 for(const [cutoff,available] of [['2026-10-06',false],['2026-10-07',true]]) {
  const research=researchFreshness(p,{as_of_date:cutoff}).research,rows=research.records.filter(r=>r.catalog_id==='secz-ttm-20260630-v2');
  assert.equal(research.artifacts.find(r=>r.id==='secz-ttm-20260630-v2').review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');
  assert.equal(rows.length,3);assert.ok(rows.every(r=>r.observation_state==='NOT_OBSERVED'&&r.evidence_state==='INSUFFICIENT'));
 }
 const metrics=calculate(p).metrics;
 for(const id of ['secz.tokenization','secz.servicing','secz.revenue','secz.prior_revenue','secz.revenue_growth','secz.required_revenue'])assert.equal(metrics[id].value,null,id);
 assert.equal(Object.values(metrics).filter(m=>m.value===null).length,80);
 assert.ok(!p.inputs.some(r=>String(r.id).includes('secz-ttm')||String(r.metric_id).startsWith('secz.reported_')));
 assert.ok(!history.some(s=>JSON.stringify(s.event||{}).includes('secz-ttm-20260630-review@2')));
 assert.deepEqual(inspectResearch(loadProject('fixture')).records,[]);assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint({economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

test('research API serves the conditional v2 beside the null v1 and refuses writes',async t=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`,data=await (await fetch(base+'/api/research?mode=production')).json();
 const [first,second]=data.records.filter(r=>r.kind==='revenue_ttm');
 assert.ok(first.records.every(r=>r.value===null));assert.deepEqual(second.records.map(r=>[r.value,r.classification,r.confidence]),Object.values(TTM).map(v=>[v,'DERIVED','low']));
 assert.equal(second.comparability.classification,'ASSUMPTION');assert.equal(data.financial_inputs_updated,false);
 assert.equal((await fetch(base+'/api/research?mode=production',{method:'POST'})).status,405);
 const state=await (await fetch(base+'/api/state?mode=production')).json();assert.equal(state.metrics['secz.revenue'].value,null);
});

test('the saved request file is byte-stable YAML that parses to the archived request',()=>{
 const text=fs.readFileSync('data/research/secz-ttm-20260630-review-v2.yaml','utf8');
 assert.ok(text.startsWith('id: secz-ttm-20260630-review@2'));assert.ok(fs.existsSync('data/research/secz-ttm-20260630-review-v1.yaml'));
 assert.deepEqual(readYaml('data/research/secz-ttm-20260630-review-v1.yaml'),v1.request);
});
