import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewRevenueTtm} from '../../engine/research/revenue-ttm.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';

const production=loadProject('production');
const original=readYaml('data/research/revenue-ttm-reviews/secz-20260630-v1.json');
const revise=edit=>{
 const request=structuredClone(original.request);edit(request);
 return reviewRevenueTtm(production,request,original.input_reviews.annual,original.input_reviews.interim,{formula:original.formula});
};
function isolated(t,artifacts) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-assumption-versions-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.join(root,'data/research'),{recursive:true});
 for(const file of ['research-catalog-schema.yaml','revenue-review-schema.yaml','revenue-ttm-schema.yaml','source-freshness.yaml','source-freshness-schema.yaml'])
  fs.writeFileSync(path.join(root,'spec',file),fs.readFileSync(path.join(production.root,'spec',file)));
 const catalog={version:2,records:artifacts.map((artifact,index)=>{
  const file=`ttm-${index}.json`;fs.writeFileSync(path.join(root,'data/research',file),JSON.stringify(artifact));
  return {id:`ttm-${index}`,label:'Test comparability assumption version',kind:'revenue_ttm',file,expected_id:artifact.id};
 })};
 return {project:{...production,root},catalog};
}

for(const [name,edit] of [
 ['rationale',r=>r.comparability.rationale+=' Test-only unversioned change.'],
 ['confidence',r=>r.comparability.confidence='low'],
 ['comparability judgment',r=>r.comparability.checks.acquisition_treatment.value=false]
])for(const surface of ['inspection','freshness'])test(`${surface} rejects same-version ${name} changes even when TTM replay and null results match`,t=>{
 const current=revise(edit);assert.notEqual(current.id,original.id);assert.deepEqual(current.results,original.results);
 const {project,catalog}=isolated(t,[original,current]);
 assert.throws(()=>surface==='inspection'?inspectResearch(project,{catalog}):researchFreshness(project,{catalog,as_of_date:'2026-10-04'}),/assumption version conflict/);
});

for(const reverse of [false,true])test(`explicitly versioned comparability assumptions retain both histories in ${reverse?'reverse':'forward'} order`,t=>{
 const current=revise(r=>{r.id+='-v2';r.version++;r.comparability.version++;r.comparability.rationale+=' Test-only versioned wording.';});
 const artifacts=[original,current];if(reverse)artifacts.reverse();
 const {project,catalog}=isolated(t,artifacts),before=fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')});
 const result=inspectResearch(project,{catalog});assert.equal(result.records.length,2);
 assert.deepEqual(result.records.map(r=>r.comparability.version),reverse?[2,1]:[1,2]);
 assert.ok(result.records.every(r=>r.comparability.classification==='ASSUMPTION'&&r.comparability.checks.acquisition_treatment.value===null));
 assert.ok(result.records.flatMap(r=>r.records).every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));
 assert.equal(fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')}),before);
});

test('research comparability cannot redefine a canonical assumption under its ID/version',t=>{
 const existing=production.inputs.find(r=>r.classification==='ASSUMPTION');
 const current=revise(r=>{r.comparability.id=existing.id;r.comparability.version=existing.version;});
 const {project,catalog}=isolated(t,[current]);
 assert.throws(()=>inspectResearch(project,{catalog}),/assumption version conflict/);
});

test('real research retains the original comparability version and nulls without entering fixtures',()=>{
 const result=inspectResearch(production),ttm=result.records.find(r=>r.kind==='revenue_ttm');
 assert.equal(ttm.artifact_id,original.id);assert.deepEqual(ttm.comparability,original.request.comparability);
 assert.ok(ttm.records.every(r=>r.value===null));assert.deepEqual(inspectResearch(loadProject('fixture')).records,[]);
});
