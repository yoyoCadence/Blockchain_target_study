import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewRevenues,verifyRevenueReview} from '../../engine/research/revenues.js';

const project=loadProject('production');
const file='data/research/secz-comparable-revenue-2026-10-03-v1.yaml';
const original=readYaml(file);

test('SECZ reported revenue review aligns quarters/half-years without changing annual economics',()=>{
 const before=fingerprint(project),history=fingerprint(readSnapshots(project.root,'production')),economics=fingerprint(calculate(project));
 const result=reviewRevenues(project,original);
 verifyRevenueReview(result);
 assert.equal(result.persisted,false);
 assert.equal(result.financial_inputs_updated,false);
 assert.equal(result.dossier.observations.length,12);
 assert.equal(result.dossier.statement.scope,'operating_subsidiary_consolidated');
 assert.equal(result.dossier.statement.filing.period_of_report,'2026-07-08');
 assert.equal(result.dossier.statement.filing.filing_date,'2026-08-13');
 assert.ok(result.reconciliations.every(c=>c.value===0&&c.classification==='DERIVED'&&c.formula_version===1));
 const quarter=result.comparisons.find(c=>c.id==='secz-q2-yoy.secz.reported_total_revenue');
 const half=result.comparisons.find(c=>c.id==='secz-h1-yoy.secz.reported_total_revenue');
 assert.ok(quarter.value<-.05&&quarter.value>-.06);
 assert.ok(half.value>.15&&half.value<.16);
 assert.deepEqual(quarter.periods.map(p=>p.duration_months),[3,3]);
 assert.deepEqual(half.periods.map(p=>p.duration_months),[6,6]);
 assert.deepEqual(quarter.dependencies,['secz-2026-q2.total@1','secz-2025-q2.total@1']);
 assert.ok(quarter.source_ids.every(id=>result.dossier.sources.some(s=>s.id===id)));
 assert.ok(quarter.context_dependencies.includes(original.statement.id));
 assert.equal(fingerprint(project),before);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
 assert.equal(fingerprint(calculate(project)),economics);
});

for(const [name,edit,pattern] of [
 ['fixture observation',d=>{d.observations[0].fixture=true;},/Invalid revenue dossier/],
 ['fixture source',d=>{d.sources[0].fixture=true;},/Fixture source/],
 ['negative revenue',d=>{d.observations[0].value=-1;},/Invalid revenue dossier/],
 ['annualized unit',d=>{d.observations[0].unit='USD\/year';},/Invalid revenue dossier/],
 ['six-stream mapping injection',d=>{d.observations[0].mapped_metric='secz.tokenization_revenue';},/Invalid revenue dossier/],
 ['non-observed input',d=>{d.observations[0].classification='ASSUMPTION';},/Invalid revenue dossier/],
 ['missing source',d=>{d.observations[0].source_ids=['absent'];},/Missing revenue source/],
 ['non-primary numeric evidence',d=>{d.sources[1].tier=5;d.sources[2].tier=5;},/primary source/],
 ['wrong source coverage',d=>{d.sources[1].covered_metrics=['SECZ.financial_statement'];},/does not cover/],
 ['future review',d=>{d.review.reviewed_at='2099-01-01T00:00:00Z';},/cannot be in the future/],
 ['retrieval after review',d=>{d.sources[0].retrieved_at='2099-01-01T00:00:00Z';},/retrieved after review/],
 ['publication after retrieval',d=>{d.sources[0].date='2099-01-01';},/published after retrieval/],
 ['source published after observation',d=>{d.observations[0].as_of_date='2026-07-01';},/published after observation/],
 ['observation after dossier',d=>{d.observations[0].as_of_date='2026-10-04';},/after dossier as-of/],
 ['filing before report',d=>{d.statement.filing.period_of_report='2026-08-14';},/Filing precedes/],
 ['financial scope promotion',d=>{d.statement.scope='listed_parent_consolidated';},/Invalid revenue dossier/],
 ['silent GAAP basis change',d=>{d.statement.accounting_basis='adjusted_EBITDA';},/Invalid revenue dossier/],
 ['invalid quarter duration',d=>{d.periods[0].duration_months=6;},/Invalid calendar fiscal interval/],
 ['invalid quarter start',d=>{d.periods[0].start='2026-01-01';},/Invalid calendar fiscal interval/],
 ['unknown observation period',d=>{d.observations[0].period_id='absent';},/Unknown reported revenue period/],
 ['duplicate record',d=>{d.observations.push(structuredClone(d.observations[0]));},/Duplicate/],
 ['duplicate category with distinct ID',d=>{d.observations.push({...d.observations[0],id:'conflicting-record'});},/Duplicate/],
 ['missing category',d=>{d.observations.splice(0,1);},/requires both revenue categories/],
 ['non-reconciling categories',d=>{d.observations[0].value++;},/do not reconcile/],
 ['quarter versus half-year',d=>{d.comparisons[0].prior_period_id='secz-2025-h1';},/Cannot compare/],
 ['reversed year comparison',d=>{[d.comparisons[0].current_period_id,d.comparisons[0].prior_period_id]=[d.comparisons[0].prior_period_id,d.comparisons[0].current_period_id];},/one year earlier/],
 ['unknown comparison period',d=>{d.comparisons[0].prior_period_id='absent';},/Unknown comparison period/],
 ['null with known confidence',d=>{d.observations[0].value=null;},/unknown confidence/]
]) test(`reported revenue review rejects ${name}`,()=>{
 const dossier=structuredClone(original);edit(dossier);
 assert.throws(()=>reviewRevenues(project,dossier),pattern);
});

test('unknown categories propagate to reconciliation and corresponding growth while other evidence remains available',()=>{
 const dossier=structuredClone(original);
 dossier.observations[0].value=null;dossier.observations[0].confidence='unknown';
 const result=reviewRevenues(project,dossier);
 assert.equal(result.reconciliations[0].value,null);
 assert.equal(result.reconciliations[0].status,'UNKNOWN_INPUT');
 assert.equal(result.comparisons[0].value,null);
 assert.equal(result.comparisons[0].confidence,'unknown');
 assert.equal(result.comparisons[0].status,'UNKNOWN_INPUT');
 assert.equal(result.comparisons[1].status,'AVAILABLE');
 assert.equal(result.comparisons[2].status,'AVAILABLE');
});

test('zero prior revenue never produces infinity or an invented growth percentage',()=>{
 const dossier=structuredClone(original);
 [dossier.observations[3].value,dossier.observations[4].value,dossier.observations[5].value]=[0,100,100];
 const result=reviewRevenues(project,dossier);
 assert.equal(result.reconciliations[1].value,0);
 assert.equal(result.comparisons[0].value,null);
 assert.equal(result.comparisons[0].status,'ZERO_BASE');
 assert.equal(result.comparisons[0].confidence,'unknown');
});

test('versioned revenue review artifact replays embedded formulas and rejects altered evidence',()=>{
 const saved=JSON.parse(fs.readFileSync('data/research/revenue-reviews/secz-q22026-v1.json','utf8'));
 verifyRevenueReview(saved);
 const replay=reviewRevenues(project,saved.dossier,{formulas:saved.formulas});
 assert.deepEqual(replay,saved);
 const altered=structuredClone(saved);altered.dossier.observations[0].value++;
 assert.throws(()=>verifyRevenueReview(altered),/integrity failure/);
 const formula=structuredClone(saved.formulas);formula[0].expression={op:'eval',args:['tokenization','asset_servicing','reported_total']};
 assert.throws(()=>reviewRevenues(project,original,{formulas:formula}),/Unknown formula operation/);
});

test('revenue-review CLI requires production and leaves the canonical financial journal unchanged',()=>{
 const history=fingerprint(readSnapshots(project.root,'production'));
 const run=(...args)=>spawnSync(process.execPath,['cli.js','revenue-review',file,...args],{cwd:project.root,encoding:'utf8'});
 const wrong=run();assert.equal(wrong.status,1);assert.match(wrong.stderr,/require --production/);
 const reviewed=run('--production');assert.equal(reviewed.status,0,reviewed.stderr);
 assert.equal(JSON.parse(reviewed.stdout).dossier.observations.length,12);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
});
