import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {createServer} from '../../server.js';

const p=loadProject('production'),catalog=readYaml('spec/research-catalog.yaml'),entry=catalog.records.find(r=>r.kind==='public_venue');
const file=`data/research/${entry.file}`,bytes=fs.readFileSync(file),a=JSON.parse(bytes);
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const item of fs.readdirSync(from,{withFileTypes:true})){
 const source=path.join(from,item.name),target=path.join(to,item.name);if(item.isDirectory())copyTree(source,target);else if(item.isFile())fs.writeFileSync(target,fs.readFileSync(source));
}}
function isolated(t,fn,{repin=false}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'public-venue-inspection-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const folder of ['spec','data','sources'])copyTree(path.join(p.root,folder),path.join(root,folder));
 const artifact=structuredClone(a);fn(artifact);const changed=Buffer.from(JSON.stringify(artifact));fs.writeFileSync(path.join(root,file),changed);
 return {project:{...p,root},catalog:{version:5,records:[{...entry,expected_id:repin?createHash('sha256').update(changed).digest('hex'):entry.expected_id}]}};
}

test('public-venue catalog preserves original bytes, typed records, identity lineage, source versions and review outside finance',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),result=inspectResearch(p),r=result.records.find(r=>r.id===entry.id);
 assert.equal(result.records.length,14);assert.equal(r.records.length,27);assert.equal(r.artifact_id,entry.expected_id);assert.deepEqual(r.full_review,a);
 assert.ok(r.records.every(r=>typeof r.label==='string'&&/[一-鿿]/u.test(r.label)));
 assert.deepEqual(r.review,result.events.find(e=>e.id===entry.event_id).event.research_review);assert.equal(r.event_id,entry.event_id);
 for(const original of [...a.observations,...a.derived]){const row=r.records.find(r=>r.id===original.id);for(const key of Object.keys(original))assert.deepEqual(row[key],original[key]);}
 const allRecords=result.records.flatMap(r=>r.records),derived=r.records.find(r=>r.classification==='DERIVED');
 assert.ok(derived.dependencies.every(id=>allRecords.some(r=>r.id===id&&r.classification==='OBSERVED')));assert.equal(derived.formula_version,1);
 for(const identity of r.summary.identity_dependencies)for(const key of Object.keys(identity))assert.deepEqual(allRecords.find(r=>r.id===identity.id)[key],identity[key]);
 assert.equal(r.sources.length,6);for(const source of r.sources)assert.deepEqual(source,p.sources.find(s=>s.id===source.id));
 assert.deepEqual(r.periods,[{basis:'point',end:'2026-10-05'}]);assert.equal(r.summary.access_review.withdrawal_access,null);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);assert.deepEqual(fs.readFileSync(file),bytes);
});

test('public-venue catalog refuses replacement bytes even when parsed values are unchanged',t=>{
 const {project,catalog}=isolated(t,()=>{});assert.throws(()=>inspectResearch(project,{catalog}),/fingerprint mismatch/);
});

test('matching catalog repin cannot bypass raw typed observation checks',t=>{
 const {project,catalog}=isolated(t,a=>a.observations.find(r=>r.field==='trading_disabled').value=true,{repin:true});
 assert.throws(()=>inspectResearch(project,{catalog}),/raw\/value/);
});

test('valid replacement semantics still require the original event digest and event ID',t=>{
 const {project,catalog}=isolated(t,()=>{},{repin:true});assert.throws(()=>inspectResearch(project,{catalog}),/does not match reviewed event/);
 const c={version:5,records:[{...entry,event_id:'uni-token-state-20261004'}]};assert.throws(()=>inspectResearch(p,{catalog:c}),/does not match reviewed event/);
 delete c.records[0].event_id;assert.throws(()=>inspectResearch(p,{catalog:c}),/Invalid research catalog/);
});

test('public venue is unavailable before its review day; unknown access/contract and derived flags never become observed facts',()=>{
 for(const [cutoff,available] of [['2026-10-04',false],['2026-10-05',true]]){
  const research=researchFreshness(p,{as_of_date:cutoff}).research,artifact=research.artifacts.find(r=>r.id===entry.id),rows=research.records.filter(r=>r.catalog_id===entry.id);
  assert.equal(artifact.review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');assert.equal(rows.length,27);
  const known=rows.filter(r=>r.record.classification==='OBSERVED'&&r.record.value!==null);
  assert.equal(known.length,25);assert.ok(known.every(r=>r.evidence_state===(available?'AVAILABLE':'INSUFFICIENT')));
  assert.ok(known.every(r=>r.observation_state===(available?'WITHIN_REVIEW_WINDOW':'NOT_AVAILABLE_AT_CUTOFF')));
  const unknown=rows.find(r=>r.record.asset==='XLM'&&r.record.field==='network.contract_address');assert.equal(unknown.observation_state,'UNKNOWN_DATA');assert.equal(unknown.evidence_state,'INSUFFICIENT');
  const derived=rows.find(r=>r.record.classification==='DERIVED');assert.equal(derived.observation_state,'NOT_OBSERVED');assert.equal(derived.evidence_state,'INSUFFICIENT');
  assert.ok(rows.every(r=>r.record.as_of_date==='2026-10-05'&&r.period.end==='2026-10-05'));
 }
});

test('public venue APIs preserve source/HTTP evidence, cutoff, writes rejection and Fixture isolation',async t=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`,before=fingerprint(readSnapshots(p.root,p.mode));
 const response=await fetch(base+'/api/research?mode=production');assert.equal(response.status,200);const data=await response.json();
 const r=data.records.find(r=>r.id===entry.id);assert.deepEqual(r.full_review,a);assert.equal(r.summary.values.find(r=>r.field==='trading_disabled').value,false);
 const freshness=await (await fetch(base+'/api/freshness?mode=production&as_of=2026-10-04')).json();assert.equal(freshness.research.artifacts.find(r=>r.id===entry.id).review_state,'NOT_AVAILABLE_AT_CUTOFF');
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-05'])assert.equal((await fetch(base+endpoint,{method:'POST'})).status,405);
 const fixture=await (await fetch(base+'/api/research?mode=fixture')).json();assert.deepEqual(fixture.records,[]);assert.deepEqual(fixture.events,[]);
 assert.equal(Object.hasOwn(await (await fetch(base+'/api/freshness?mode=fixture')).json(),'research'),false);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);assert.deepEqual(fs.readFileSync(file),bytes);
});

test('both APIs reject altered public-venue pinned evidence without modifying the rejected artifact',async t=>{
 const {project}=isolated(t,a=>a.derived[0].value=0),before=fs.readFileSync(path.join(project.root,file));
 const server=createServer(project.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-05']){
  const response=await fetch(base+endpoint);assert.equal(response.status,400);assert.match((await response.json()).error,/fingerprint mismatch/);
 }
 assert.deepEqual(fs.readFileSync(path.join(project.root,file)),before);
});
