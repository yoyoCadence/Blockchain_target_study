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

const p=loadProject('production'),catalog=readYaml('spec/research-catalog.yaml'),entry=catalog.records.find(r=>r.kind==='uni_firepit_state');
const file=`data/research/${entry.file}`,bytes=fs.readFileSync(file),a=JSON.parse(bytes);
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const item of fs.readdirSync(from,{withFileTypes:true})){
 const source=path.join(from,item.name),target=path.join(to,item.name);if(item.isDirectory())copyTree(source,target);else if(item.isFile())fs.writeFileSync(target,fs.readFileSync(source));
}}
function isolated(t,fn,{repin=false}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'uni-firepit-inspection-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const folder of ['spec','data','sources'])copyTree(path.join(p.root,folder),path.join(root,folder));
 const artifact=structuredClone(a);fn(artifact);const changed=Buffer.from(JSON.stringify(artifact));fs.writeFileSync(path.join(root,file),changed);
 return {project:{...p,root},catalog:{version:8,records:[{...entry,expected_id:repin?createHash('sha256').update(changed).digest('hex'):entry.expected_id}]}};
}

test('Firepit catalog preserves original bytes, raw strings, derived lineage, source versions and review outside finance',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),result=inspectResearch(p),r=result.records.find(r=>r.id===entry.id);
 assert.ok(catalog.version>=8);assert.equal(result.records.length,12);assert.equal(r.records.length,16);
 assert.equal(r.artifact_id,'41c8fcb16267e1b068aea59f8675bcd27a913d1a52c3d5ed2602034e71a0e6f9');assert.deepEqual(r.full_review,a);
 assert.ok(r.records.every(r=>typeof r.label==='string'&&/[一-鿿]/u.test(r.label)));
 assert.deepEqual(r.review,result.events.find(e=>e.id===entry.event_id).event.research_review);assert.equal(r.event_id,'uni-firepit-state-20261006');
 for(const original of [...a.observations,...a.derived]){const row=r.records.find(r=>r.id===original.id);for(const key of Object.keys(original))assert.deepEqual(row[key],original[key]);}
 assert.ok(r.records.filter(r=>r.classification==='OBSERVED').every(r=>typeof r.value==='string'));
 const derived=r.records.filter(r=>r.classification==='DERIVED');assert.equal(derived.length,4);
 assert.ok(derived.every(d=>d.formula_version===1&&d.dependencies.every(id=>r.records.some(o=>o.id===id&&o.classification==='OBSERVED'))));
 assert.equal(r.sources.length,6);assert.equal(r.sources[0].id,'ethereum-uni-firepit-state-20261006-v1');assert.ok(r.sources.slice(1).every(s=>s.date==='2025-12-18'&&s.tier===2));
 for(const source of r.sources)assert.deepEqual(source,p.sources.find(s=>s.id===source.id));
 assert.deepEqual(r.periods,[{basis:'point',end:'2026-10-06'}]);assert.equal(r.summary.block_number,'26133926');
 assert.ok(Object.values(r.summary.unknown).every(v=>v===null));assert.match(r.notice,/dead 餘額未歸因/);
 const allIds=result.records.flatMap(r=>r.records.map(o=>o.id));assert.equal(new Set(allIds).size,allIds.length);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);assert.deepEqual(fs.readFileSync(file),bytes);
});

test('Firepit catalog refuses replacement bytes even when parsed values are unchanged',t=>{
 const {project,catalog}=isolated(t,()=>{});assert.throws(()=>inspectResearch(project,{catalog}),/fingerprint mismatch/);
});

test('matching Firepit catalog repin cannot bypass ABI or derived checks',t=>{
 const abi=isolated(t,a=>a.observations.find(o=>o.key==='nonce').value='1396',{repin:true});
 assert.throws(()=>inspectResearch(abi.project,{catalog:abi.catalog}),/ABI\/result/);
 const residual=isolated(t,a=>a.derived[0].value='5584000000000000000000000',{repin:true});
 assert.throws(()=>inspectResearch(residual.project,{catalog:residual.catalog}),/derived value\/lineage/);
});

test('valid replacement Firepit semantics still require the original event digest and event ID',t=>{
 const {project,catalog}=isolated(t,a=>a.observations.reverse(),{repin:true});assert.throws(()=>inspectResearch(project,{catalog}),/does not match reviewed event/);
 const c={version:8,records:[{...entry,event_id:'uni-token-state-20261004'}]};assert.throws(()=>inspectResearch(p,{catalog:c}),/does not match reviewed event/);
 delete c.records[0].event_id;assert.throws(()=>inspectResearch(p,{catalog:c}),/Invalid research catalog/);
});

test('Firepit state is unavailable before its review day and derived checks never become observed facts',()=>{
 for(const [cutoff,available] of [['2026-10-05',false],['2026-10-06',true]]){
  const research=researchFreshness(p,{as_of_date:cutoff}).research,artifact=research.artifacts.find(r=>r.id===entry.id),rows=research.records.filter(r=>r.catalog_id===entry.id);
  assert.equal(research.artifacts.length,12);assert.equal(research.records.length,230);assert.equal(research.source_checks.length,39);
  assert.equal(artifact.review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');assert.equal(rows.length,16);
  const observed=rows.filter(r=>r.record.classification==='OBSERVED');assert.equal(observed.length,12);
  assert.ok(observed.every(r=>r.evidence_state===(available?'AVAILABLE':'INSUFFICIENT')));
  assert.ok(observed.every(r=>r.observation_state===(available?'WITHIN_REVIEW_WINDOW':'NOT_AVAILABLE_AT_CUTOFF')));
  const derived=rows.filter(r=>r.record.classification==='DERIVED');assert.equal(derived.length,4);
  assert.ok(derived.every(r=>r.observation_state==='NOT_OBSERVED'&&r.evidence_state==='INSUFFICIENT'));
  assert.ok(rows.every(r=>r.record.as_of_date==='2026-10-06'&&r.period.end==='2026-10-06'));
 }
});

test('Firepit APIs preserve exact strings, cutoff, write rejection and Fixture isolation',async t=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`,before=fingerprint(readSnapshots(p.root,p.mode));
 const response=await fetch(base+'/api/research?mode=production');assert.equal(response.status,200);const data=await response.json();
 const r=data.records.find(r=>r.id===entry.id);assert.deepEqual(r.full_review,a);
 assert.equal(r.summary.values.find(v=>v.key==='nonce').value,'1395');assert.equal(r.summary.derived[0].value,'5580000000000000000000000');
 const freshness=await (await fetch(base+'/api/freshness?mode=production&as_of=2026-10-05')).json();
 assert.equal(freshness.research.artifacts.find(r=>r.id===entry.id).review_state,'NOT_AVAILABLE_AT_CUTOFF');
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-06'])assert.equal((await fetch(base+endpoint,{method:'POST'})).status,405);
 const fixture=await (await fetch(base+'/api/research?mode=fixture')).json();assert.deepEqual(fixture.records,[]);assert.deepEqual(fixture.events,[]);
 assert.equal(Object.hasOwn(await (await fetch(base+'/api/freshness?mode=fixture')).json(),'research'),false);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);assert.deepEqual(fs.readFileSync(file),bytes);
});

test('both APIs reject altered Firepit pinned evidence without modifying the rejected artifact',async t=>{
 const {project}=isolated(t,a=>a.derived[2].value=0),before=fs.readFileSync(path.join(project.root,file));
 const server=createServer(project.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-06']){
  const response=await fetch(base+endpoint);assert.equal(response.status,400);assert.match((await response.json()).error,/fingerprint mismatch/);
 }
 assert.deepEqual(fs.readFileSync(path.join(project.root,file)),before);
});
