import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {createServer} from '../../server.js';

const project=loadProject('production'),catalog=readYaml('spec/research-catalog.yaml');
const entry=catalog.records.find(r=>r.kind==='capital'),saved=readYaml(`data/research/${entry.file}`);

function isolated(t,mutate,{repin=false}={}) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'capital-inspection-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.dirname(path.join(root,'data/research',entry.file)),{recursive:true});
 for(const file of ['research-catalog-schema.yaml','capital-review-schema.yaml'])
  fs.writeFileSync(path.join(root,'spec',file),fs.readFileSync(path.join(project.root,'spec',file)));
 const artifact=structuredClone(saved);mutate(artifact);
 if(repin){const {id,...content}=artifact;artifact.id=fingerprint(content);}
 fs.writeFileSync(path.join(root,'data/research',entry.file),JSON.stringify(artifact));
 return {project:{...project,root},catalog:{version:2,records:[{...entry,expected_id:repin?artifact.id:entry.expected_id}]}};
}

test('capital catalog replays the pinned artifact with complete observations, formulas, context and source versions',()=>{
 const before=fingerprint({project,financial:calculate(project),history:readSnapshots(project.root,'production')});
 const capital=inspectResearch(project).records.find(r=>r.kind==='capital');
 assert.equal(capital.artifact_id,entry.expected_id);assert.deepEqual(capital.full_review,saved);
 assert.deepEqual(capital.records,[...saved.observations,...saved.derived]);
 assert.deepEqual(capital.sources,saved.sources);assert.deepEqual(capital.context,saved.context);
 assert.equal(capital.summary.unknown_observations,9);assert.equal(capital.summary.checks.length,7);
 assert.deepEqual(capital.periods.map(p=>p.end).sort(),['2026-07-01','2026-07-30','2026-07-31']);
 assert.equal(fingerprint({project,financial:calculate(project),history:readSnapshots(project.root,'production')}),before);
});

test('capital catalog pin prevents a replacement artifact even if its content digest is valid',t=>{
 const {project:p,catalog:c}=isolated(t,a=>a.context.interpretation+=' test replacement',{repin:true});
 c.records[0].expected_id=entry.expected_id;
 assert.throws(()=>inspectResearch(p,{catalog:c}),/fingerprint mismatch/);
});

test('repinning an incorrect capital result still requires semantic replay',t=>{
 const {project:p,catalog:c}=isolated(t,a=>a.derived[0].value++,{repin:true});
 assert.throws(()=>inspectResearch(p,{catalog:c}),/does not replay/);
});

test('unchanged capital pin cannot hide corrupt evidence stored under its original digest',t=>{
 const {project:p,catalog:c}=isolated(t,a=>a.observations[0].value++);
 assert.throws(()=>inspectResearch(p,{catalog:c}),/integrity failure/);
});

test('capital freshness separates original point and knowledge dates from review availability',()=>{
 for(const [cutoff,available] of [['2026-10-03',false],['2026-10-04',true]]) {
  const report=researchFreshness(project,{as_of_date:cutoff}).research;
  const artifact=report.artifacts.find(a=>a.kind==='capital');
  assert.equal(artifact.review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');
  assert.deepEqual(artifact.context,saved.context);
  const records=report.records.filter(r=>r.catalog_id===entry.id);
  assert.equal(records.length,115);
  const common=records.find(r=>r.record_id===saved.rows[0].common_observation_id);
  assert.deepEqual(common.record,saved.observations[0]);assert.equal(common.period.end,'2026-07-01');
  assert.equal(common.record.as_of_date,'2026-07-31');assert.equal(common.observation_age_days,available?65:64);
  assert.equal(common.evidence_state,available?'AVAILABLE':'INSUFFICIENT');
  assert.equal(records.filter(r=>r.observation_state==='UNKNOWN_DATA'&&r.record.value===null&&r.evidence_state==='INSUFFICIENT').length,9);
  const derived=records.filter(r=>r.record.classification==='DERIVED');
  assert.equal(derived.length,7);assert.ok(derived.every(r=>r.observation_state==='NOT_OBSERVED'&&r.evidence_state==='INSUFFICIENT'));
  assert.deepEqual(derived.map(r=>r.record.dependencies),saved.derived.map(r=>r.dependencies));
 }
});

test('research and freshness APIs preserve capital evidence and reject writes while fixtures stay isolated',async t=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04']) {
  const response=await fetch(base+endpoint);assert.equal(response.status,200);
  const data=await response.json();
  if(endpoint.includes('/research'))assert.deepEqual(data.records.find(r=>r.kind==='capital').full_review,saved);
  else assert.equal(data.research.records.filter(r=>r.catalog_id===entry.id).length,115);
  assert.equal((await fetch(base+endpoint,{method:'POST',body:'{}'})).status,405);
 }
 const fixture=await (await fetch(base+'/api/research?mode=fixture')).json();assert.deepEqual(fixture.records,[]);
 const freshness=await (await fetch(base+'/api/freshness?mode=fixture&as_of=2026-10-04')).json();
 assert.equal(Object.hasOwn(freshness,'research'),false);
});
