import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenues} from '../../engine/research/revenues.js';
import {reviewRevenueTtm} from '../../engine/research/revenue-ttm.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';

const production=loadProject('production');
const revenue=readYaml('data/research/revenue-reviews/secz-q22026-v1.json');
const ttm=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v1.json');
const revise=(artifact,edit)=>{
 const formulas=structuredClone(artifact.formulas);edit(formulas);
 return reviewRevenues(production,artifact.dossier,{formulas});
};

function isolated(t,entries) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-formula-versions-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.join(root,'data/research'),{recursive:true});
 for(const file of ['research-catalog-schema.yaml','revenue-review-schema.yaml','revenue-ttm-schema.yaml','source-freshness.yaml','source-freshness-schema.yaml'])
  fs.writeFileSync(path.join(root,'spec',file),fs.readFileSync(path.join(production.root,'spec',file)));
 const catalog={version:2,records:entries.map(({artifact,kind='revenue'},index)=>{
  const file=`review-${index}.json`;fs.writeFileSync(path.join(root,'data/research',file),JSON.stringify(artifact));
  return {id:`review-${index}`,label:'Test formula version review',kind,file,expected_id:artifact.id};
 })};
 return {project:{...production,root},catalog};
}

for(const [name,edit] of [
 ['formula expression',formulas=>formulas[1].expression={op:'div',args:['current','prior']}],
 ['null policy',formulas=>formulas[1].null_policy+=' Test-only unversioned change.']
])for(const surface of ['inspection','freshness'])test(`${surface} rejects ${name} changed under one formula ID/version despite valid artifact replay`,t=>{
 const current=revise(revenue,edit);
 assert.notEqual(current.id,revenue.id);
 if(name==='formula expression')assert.notEqual(current.comparisons[0].value,revenue.comparisons[0].value);
 const {project,catalog}=isolated(t,[{artifact:revenue},{artifact:current}]);
 assert.throws(()=>surface==='inspection'?inspectResearch(project,{catalog}):researchFreshness(project,{catalog,as_of_date:'2026-10-04'}),/formula version conflict/);
});

test('an embedded TTM input cannot hide a same-version formula change behind a valid TTM review hash',t=>{
 const revised=revise(ttm.input_reviews.interim,formulas=>formulas[1].null_policy+=' Embedded test-only change.');
 const request=structuredClone(ttm.request);request.interim_review_id=revised.id;
 const current=reviewRevenueTtm(production,request,ttm.input_reviews.annual,revised,{formula:ttm.formula});
 assert.ok(current.results.every(r=>r.value===null));
 const {project,catalog}=isolated(t,[{artifact:current,kind:'revenue_ttm'}]);
 assert.throws(()=>inspectResearch(project,{catalog}),/formula version conflict/);
});

for(const reverse of [false,true])test(`explicitly incremented formula versions remain inspectable in ${reverse?'reverse':'forward'} catalog order`,t=>{
 const current=revise(revenue,formulas=>{formulas[1].version++;formulas[1].null_policy+=' Test-only versioned wording.';});
 const entries=[{artifact:revenue},{artifact:current}];if(reverse)entries.reverse();
 const {project,catalog}=isolated(t,entries);
 const before=fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')});
 const result=inspectResearch(project,{catalog});assert.equal(result.records.length,2);
 assert.deepEqual(result.records.map(r=>r.full_review.formulas[1].version),reverse?[2,1]:[1,2]);
 assert.deepEqual(result.records.map(r=>r.full_review.comparisons.map(c=>c.value)),[revenue,current].map(r=>r.comparisons.map(c=>c.value)));
 assert.equal(fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')}),before);
});

test('the real catalog reuses identical formula definitions across revenue/TTM reviews and retains financial history',()=>{
 const result=inspectResearch(production);assert.equal(result.records.length,10);
 assert.equal(result.records.find(r=>r.kind==='capital').full_review.formulas.length,7);
 assert.ok(result.records.find(r=>r.kind==='revenue_ttm').records.every(r=>r.value===null));
 assert.equal(readSnapshots(production.root,'production')[6].id,'0abb51bb8a1c41e592d8e9bd9bc55c8ee7c8a2213b07154aad5217d974dd0a4c');
});
