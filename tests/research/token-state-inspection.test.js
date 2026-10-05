import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {createServer} from '../../server.js';

const project=loadProject('production'),catalog=readYaml('spec/research-catalog.yaml');
const entry=catalog.records.find(r=>r.kind==='token_state'),raw=fs.readFileSync(`data/research/${entry.file}`),archive=JSON.parse(raw);
function copyTree(from,to) {
 fs.mkdirSync(to,{recursive:true});
 for(const item of fs.readdirSync(from,{withFileTypes:true})) {
  const source=path.join(from,item.name),target=path.join(to,item.name);
  if(item.isDirectory())copyTree(source,target);else if(item.isFile())fs.writeFileSync(target,fs.readFileSync(source));
 }
}
function isolated(t,mutate,{repin=false}={}) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'token-state-inspection-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 copyTree(path.join(project.root,'spec'),path.join(root,'spec'));copyTree(path.join(project.root,'data/events'),path.join(root,'data/events'));
 fs.mkdirSync(path.join(root,'data/research'),{recursive:true});
 const dependency='uni-vesting-fixed-block-2026-10-04-v1.json';fs.writeFileSync(path.join(root,'data/research',dependency),fs.readFileSync(path.join(project.root,'data/research',dependency)));
 const saved=structuredClone(archive);mutate(saved);const bytes=Buffer.from(JSON.stringify(saved));fs.writeFileSync(path.join(root,'data/research',entry.file),bytes);
 return {project:{...project,root},catalog:{version:4,records:[{...entry,expected_id:repin?createHash('sha256').update(bytes).digest('hex'):entry.expected_id}]}};
}

test('token-state catalog preserves raw strings, original review and exact versioned derived dependencies outside financial IDs',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,project.mode)}),result=inspectResearch(project);
 const record=result.records.find(r=>r.kind==='token_state');assert.deepEqual(record.full_review,archive);
 assert.equal(record.artifact_id,entry.expected_id);assert.equal(record.event_id,entry.event_id);assert.equal(record.records.length,5);
 assert.deepEqual(record.review,result.events.find(e=>e.id===entry.event_id).event.research_review);
 for(const original of [...archive.observations,...archive.derived]) {
  const row=record.records.find(r=>r.id===original.id);for(const key of Object.keys(original))assert.deepEqual(row[key],original[key]);
  assert.ok(!project.inputs.some(input=>input.id===row.id));
 }
 const derived=record.records.find(r=>r.classification==='DERIVED');assert.equal(derived.formula_version,1);
 assert.ok(derived.dependencies.every(id=>record.records.some(r=>r.id===id&&r.classification==='OBSERVED')));
 assert.equal(record.summary.circulating_supply,null);assert.equal(record.summary.fully_diluted_supply,null);
 for(const source of record.sources)assert.deepEqual(source,project.sources.find(s=>s.id===source.id));
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,project.mode)}),before);
});

test('token-state catalog refuses normalized replacement bytes with unchanged parsed values',t=>{
 const {project:p,catalog:c}=isolated(t,()=>{});assert.throws(()=>inspectResearch(p,{catalog:c}),/fingerprint mismatch/);
});

test('token-state catalog repinning cannot bypass the shared mixed-block semantic rejection',t=>{
 const {project:p,catalog:c}=isolated(t,a=>{const q=JSON.parse(a.transport.request_json);q.find(r=>r.id===3).params[1]='latest';a.transport.request_json=JSON.stringify(q);},{repin:true});
 assert.throws(()=>inspectResearch(p,{catalog:c}),/not pinned/);
});

test('token-state catalog requires its original reviewed event and digest even for a valid reordered replacement',t=>{
 const c={version:4,records:[{...entry,event_id:'uni-vesting-fixed-block-20261004'}]};assert.throws(()=>inspectResearch(project,{catalog:c}),/does not match reviewed event/);
 const {project:p,catalog:repinned}=isolated(t,()=>{},{repin:true});assert.throws(()=>inspectResearch(p,{catalog:repinned}),/does not match reviewed event/);
 delete c.records[0].event_id;assert.throws(()=>inspectResearch(project,{catalog:c}),/Invalid research catalog/);
});

test('token-state freshness keeps point times and review cutoffs while derived comparison remains NOT_OBSERVED',()=>{
 for(const [cutoff,available] of [['2026-10-03',false],['2026-10-04',true]]) {
  const report=researchFreshness(project,{as_of_date:cutoff}).research,review=report.artifacts.find(a=>a.kind==='token_state');
  assert.equal(review.review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');
  const rows=report.records.filter(r=>r.catalog_id===entry.id);assert.equal(rows.length,5);
  const observed=rows.filter(r=>r.record.classification==='OBSERVED');assert.equal(observed.length,4);
  assert.ok(observed.every(r=>r.evidence_state===(available?'AVAILABLE':'INSUFFICIENT')));
  assert.ok(observed.every(r=>r.observation_state===(available?'WITHIN_REVIEW_WINDOW':'NOT_AVAILABLE_AT_CUTOFF')));
  assert.ok(observed.every(r=>r.record.observed_at===archive.anchor.effective_at));
  assert.ok(rows.every(r=>r.period.basis==='point'&&r.period.end==='2026-10-04'));
  const derived=rows.find(r=>r.record.classification==='DERIVED');assert.equal(derived.observation_state,'NOT_OBSERVED');assert.equal(derived.observation_age_days,null);
  assert.deepEqual(derived.record.dependencies,archive.derived[0].dependencies);assert.equal(derived.record.formula_version,1);
 }
});

test('token-state research/freshness APIs preserve full evidence, classification and read-only workspace isolation',async t=>{
 const before=fingerprint(readSnapshots(project.root,project.mode)),server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});const base=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(base+'/api/research?mode=production');assert.equal(response.status,200);const data=await response.json();
 assert.deepEqual(data.records.find(r=>r.kind==='token_state').full_review,archive);
 const report=await (await fetch(base+'/api/freshness?mode=production&as_of=2026-10-04')).json();
 assert.equal(report.research.records.filter(r=>r.catalog_id===entry.id).length,5);
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04'])assert.equal((await fetch(base+endpoint,{method:'POST'})).status,405);
 const fixture=await (await fetch(base+'/api/research?mode=fixture')).json();assert.deepEqual(fixture.records,[]);assert.deepEqual(fixture.events,[]);
 assert.equal(Object.hasOwn(await (await fetch(base+'/api/freshness?mode=fixture')).json(),'research'),false);
 assert.deepEqual(fs.readFileSync(`data/research/${entry.file}`),raw);assert.equal(fingerprint(readSnapshots(project.root,project.mode)),before);
});

test('both APIs reject altered token-state pinned bytes and leave the evidence untouched',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'token-state-api-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const folder of ['spec','data','sources'])copyTree(path.join(project.root,folder),path.join(root,folder));
 const file=path.join(root,'data/research',entry.file),altered=structuredClone(archive);altered.derived[0].value=0;fs.writeFileSync(file,JSON.stringify(altered));const before=fs.readFileSync(file);
 const server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04']) {
  const response=await fetch(base+endpoint);assert.equal(response.status,400);assert.match((await response.json()).error,/fingerprint mismatch/);
 }
 assert.deepEqual(fs.readFileSync(file),before);
});
