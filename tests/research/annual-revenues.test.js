import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenues,verifyRevenueReview} from '../../engine/research/revenues.js';

const project=loadProject('production');
const original=readYaml('data/research/secz-annual-revenue-2026-10-03-v1.yaml');

test('audited annual revenue retains full-year flows, subsidiary scope and filing date conflict',()=>{
 const before=fingerprint(project),economics=fingerprint(calculate(project)),history=fingerprint(readSnapshots(project.root,'production'));
 const result=reviewRevenues(project,original);
 assert.equal(result.dossier.statement.audit.auditor,'KPMG LLP');
 assert.equal(result.dossier.statement.audit.report_date,'2026-04-10');
 assert.equal(result.dossier.statement.filing.filing_date,'2026-07-31');
 assert.equal(result.dossier.statement.filing.body_as_filed_date,'2026-07-30');
 assert.equal(result.dossier.statement.filing.period_of_report,null);
 assert.equal(result.dossier.observations.length,6);
 assert.ok(result.dossier.observations.every(o=>o.unit==='USD'&&o.as_of_date==='2026-07-31'));
 assert.ok(result.reconciliations.every(c=>c.value===0&&c.periods[0].duration_months===12));
 const total=result.comparisons.find(c=>c.id.endsWith('reported_total_revenue'));
 assert.ok(total.value>2.33&&total.value<2.34);
 assert.equal(total.formula_version,1);
 assert.equal(result.financial_inputs_updated,false);
 assert.equal(fingerprint(project),before);
 assert.equal(fingerprint(calculate(project)),economics);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
});

for(const [name,edit,pattern] of [
 ['half-year tagged annual',d=>{d.periods[0].fiscal_quarter=2;d.periods[0].end='2025-06-30';d.periods[0].duration_months=6;},/Annual interval requires fiscal year end/],
 ['full year with wrong start',d=>{d.periods[0].start='2025-04-01';},/Invalid calendar fiscal interval/],
 ['audit without report evidence',d=>{delete d.statement.audit;},/requires audit evidence/],
 ['missing audit source',d=>{d.statement.audit.source_ids=['absent'];},/Missing revenue source/],
 ['audit after issuance',d=>{d.statement.audit.report_date='2026-04-11';},/Audit report after financial issuance/],
 ['unaudited with audit claim',d=>{d.statement.audit_status='unaudited';},/cannot claim an audit report/],
 ['audited quarter mixed into annual dossier',d=>{d.periods[0].basis='quarterly';},/requires annual intervals/],
 ['body filing date after index',d=>{d.statement.filing.body_as_filed_date='2026-08-01';},/Body as-filed date/],
 ['8-K/A with unknown event date',d=>{d.statement.filing.form='8-K/A';},/requires its reported event date/]
]) test(`annual revenue rejects ${name}`,()=>{
 const dossier=structuredClone(original);edit(dossier);
 assert.throws(()=>reviewRevenues(project,dossier),pattern);
});

test('annual research snapshot replays while prior quarterly artifact remains immutable and replayable',()=>{
 for(const file of ['secz-annual-v1.json','secz-q22026-v1.json']) {
  const saved=JSON.parse(fs.readFileSync(`data/research/revenue-reviews/${file}`,'utf8'));
  verifyRevenueReview(saved);
  assert.deepEqual(reviewRevenues(project,saved.dossier,{formulas:saved.formulas}),saved);
 }
 const quarter=readYaml('data/research/secz-comparable-revenue-2026-10-03-v1.yaml');
 assert.equal(reviewRevenues(project,quarter).id,'f98e20052dd8d05552e8a054d9a43a3e4ede417bccba875ea1a895b064e49173');
});
