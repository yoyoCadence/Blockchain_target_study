import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenues} from '../../engine/research/revenues.js';
import {compareRevenueReviews} from '../../engine/research/revenue-comparison.js';

const project=loadProject('production');
const annualFile='data/research/revenue-reviews/secz-annual-v1.json';
const quarterlyFile='data/research/revenue-reviews/secz-q22026-v1.json';
const saved=JSON.parse(fs.readFileSync(annualFile,'utf8'));
const quarter=JSON.parse(fs.readFileSync(quarterlyFile,'utf8'));
const draft=()=>{
 const d=structuredClone(saved.dossier);d.id+='-next';d.version++;
 d.observations=d.observations.map(r=>({...r,id:r.id+'-next',version:r.version+1}));
 return d;
};
const review=d=>reviewRevenues(project,d,{formulas:saved.formulas});

test('revenue comparison verifies both reviews and leaves inputs, economics and journals unchanged',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production'),saved});
 const result=compareRevenueReviews(project,saved,saved);
 assert.equal(result.alignment_status,'MATCHED_INTERVALS');assert.equal(result.matched.length,6);
 assert.ok(result.matched.every(r=>!r.value_change&&!r.record_change&&!r.conflict&&r.lineage_status==='SAME_RECORD'));
 assert.equal(result.classification,'DERIVED');assert.equal(result.formula_version,1);
 assert.deepEqual(result.dependencies,[saved.id,saved.id]);
 assert.equal(result.source_change,false);assert.equal(result.formula_change,false);assert.equal(result.persisted,false);
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production'),saved}),before);
});

test('annual versus unaudited quarterly review reports scope differences without forced alignment',()=>{
 const result=compareRevenueReviews(project,saved,quarter);
 assert.equal(result.alignment_status,'CONTEXT_MISMATCH');assert.deepEqual(result.context_changes,['audit_status']);
 assert.equal(result.matched.length,0);assert.equal(result.unmatched_previous.length,6);assert.equal(result.unmatched_current.length,12);
 assert.equal(result.source_change,true);assert.equal(result.statement_change,true);
});

test('same context with disjoint fiscal intervals retains unmatched evidence',()=>{
 const d=draft();
 d.periods=d.periods.map(p=>({...p,id:p.id+'-earlier',fiscal_year:p.fiscal_year-2,start:p.start.replace(/^\d{4}/,String(p.fiscal_year-2)),end:p.end.replace(/^\d{4}/,String(p.fiscal_year-2))}));
 d.observations.forEach(r=>{r.period_id+='-earlier';});
 d.comparisons.forEach(c=>{c.current_period_id+='-earlier';c.prior_period_id+='-earlier';});
 const result=compareRevenueReviews(project,saved,review(d));
 assert.equal(result.alignment_status,'NO_COMMON_INTERVALS');assert.equal(result.matched.length,0);
 assert.equal(result.unmatched_current.length,6);
});

test('independent filing observations retain conflicts rather than silently replacing history',()=>{
 const d=draft();d.observations[0].value++;d.observations[2].value++;
 const result=compareRevenueReviews(project,saved,review(d));
 assert.equal(result.matched.filter(r=>r.conflict).length,2);
 assert.ok(result.matched.every(r=>r.lineage_status==='INDEPENDENT_OBSERVATIONS'));
 assert.equal(result.matched[0].previous.value,saved.dossier.observations[0].value);
 assert.equal(result.matched[0].current.value,d.observations[0].value);
});

test('declared observation replacement requires higher version and identical metric/interval',()=>{
 const d=draft();d.observations.forEach((r,i)=>{r.supersedes=saved.dossier.observations[i].id;});
 const current=review(d),result=compareRevenueReviews(project,saved,current);
 assert.ok(result.matched.every(r=>r.lineage_status==='SUPERSEDES'));
 assert.equal(compareRevenueReviews(project,current,current).matched.length,6);
 for(const edit of [r=>{r.version=1;},r=>{r.supersedes='missing';},r=>{r.supersedes=saved.dossier.observations[1].id;}]) {
  const invalid=structuredClone(d);edit(invalid.observations[0]);
  assert.throws(()=>compareRevenueReviews(project,saved,review(invalid)),/Invalid compared observation supersession/);
 }
});

test('unknown compared evidence stays insufficient and never becomes a numerical conflict',()=>{
 const d=draft();d.observations[0].value=null;d.observations[0].confidence='unknown';
 const result=compareRevenueReviews(project,saved,review(d));
 assert.equal(result.matched[0].current.value,null);assert.equal(result.matched[0].evidence_status,'INSUFFICIENT');
 assert.equal(result.matched[0].conflict,false);assert.equal(result.matched[0].value_change,true);
});

for(const [label,edit,pattern] of [
 ['observation',d=>{d.observations[0].id=saved.dossier.observations[0].id;d.observations[0].value++;d.observations[2].value++;},/Historical observation/],
 ['source',d=>{d.sources[0].title+=' altered';},/Historical source/],
 ['statement',d=>{d.statement.limitations+=' altered';},/Historical statement/],
 ['period',d=>{d.periods.forEach(p=>{p.fiscal_year--;p.start=p.start.replace(/^\d{4}/,String(p.fiscal_year));p.end=p.end.replace(/^\d{4}/,String(p.fiscal_year));});},/Historical period/]
]) test(`revenue comparison rejects rewriting historical ${label} under its existing ID`,()=>{
 const d=draft();edit(d);assert.throws(()=>compareRevenueReviews(project,saved,review(d)),pattern);
});

test('source changes remain separate and declared supersession is checked',()=>{
 const d=draft(),old=d.sources[0];
 d.sources[0]={...old,id:old.id+'-next',version:old.version+1,supersedes:old.id};
 d.statement={...d.statement,id:d.statement.id+'-next',version:d.statement.version+1,source_ids:d.statement.source_ids.map(id=>id===old.id?d.sources[0].id:id)};
 d.statement.audit.source_ids=d.statement.audit.source_ids.map(id=>id===old.id?d.sources[0].id:id);
 d.observations.forEach(r=>{r.source_ids=r.source_ids.map(id=>id===old.id?d.sources[0].id:id);});
 const result=compareRevenueReviews(project,saved,review(d));
 assert.equal(result.source_change,true);assert.equal(result.formula_change,false);
 assert.ok(result.matched.every(r=>!r.value_change));assert.equal(result.sources.previous[0].id,old.id);
 d.sources[0].version=old.version;
 assert.throws(()=>compareRevenueReviews(project,saved,review(d)),/Invalid compared source supersession/);
});

test('changed formulas require a new version; embedded formulas replay independently',()=>{
 const formulas=structuredClone(saved.formulas);formulas[1].expression.args[1]=0;
 assert.throws(()=>compareRevenueReviews(project,saved,reviewRevenues(project,saved.dossier,{formulas})),/without version increment/);
 formulas[1].version++;
 const changed=reviewRevenues(project,saved.dossier,{formulas});
 assert.equal(compareRevenueReviews(project,saved,changed).formula_change,true);
 assert.throws(()=>compareRevenueReviews(project,changed,saved),/version regressed/);
});

test('a rehashed but forged derived result still fails semantic replay',()=>{
 const forged=structuredClone(saved);forged.comparisons[0].value++;
 const {id,...content}=forged;forged.id=fingerprint(content);
 assert.throws(()=>compareRevenueReviews(project,saved,forged),/does not replay/);
 const damaged=structuredClone(saved);damaged.dossier.purpose+=' altered';
 assert.throws(()=>compareRevenueReviews(project,damaged,saved),/integrity failure/);
});

test('a current review cannot predate the previous knowledge cutoff',()=>{
 const d=draft();d.as_of_date='2026-10-02';
 assert.throws(()=>compareRevenueReviews(project,saved,review(d)),/predates previous/);
});

test('revenue-compare CLI requires two production reviews and never writes the financial journal',()=>{
 const before=fingerprint(readSnapshots(project.root,'production'));
 const run=(...args)=>spawnSync(process.execPath,['cli.js','revenue-compare',...args],{cwd:project.root,encoding:'utf8'});
 const wrong=run(annualFile,annualFile);assert.equal(wrong.status,1);assert.match(wrong.stderr,/require --production/);
 const missing=run(annualFile,'--production');assert.equal(missing.status,1);assert.match(missing.stderr,/previous-review/);
 const result=run(annualFile,quarterlyFile,'--production');assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(result.stdout).alignment_status,'CONTEXT_MISMATCH');
 assert.equal(fingerprint(readSnapshots(project.root,'production')),before);
});
