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
const entry=catalog.records.find(r=>r.kind==='fixed_block'),raw=fs.readFileSync(`data/research/${entry.file}`),archive=JSON.parse(raw);
function copyTree(from,to) {
 fs.mkdirSync(to,{recursive:true});
 for(const item of fs.readdirSync(from,{withFileTypes:true})) {
  const source=path.join(from,item.name),target=path.join(to,item.name);
  if(item.isDirectory())copyTree(source,target);else if(item.isFile())fs.writeFileSync(target,fs.readFileSync(source));
 }
}
function isolated(t,mutate,{repin=false}={}) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fixed-block-inspection-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 copyTree(path.join(project.root,'spec'),path.join(root,'spec'));
 fs.mkdirSync(path.join(root,'data/research'),{recursive:true});copyTree(path.join(project.root,'data/events'),path.join(root,'data/events'));
 const saved=structuredClone(archive);mutate(saved);const bytes=Buffer.from(JSON.stringify(saved));
 fs.writeFileSync(path.join(root,'data/research',entry.file),bytes);
 return {project:{...project,root},catalog:{version:3,records:[{...entry,expected_id:repin?createHash('sha256').update(bytes).digest('hex'):entry.expected_id}]}};
}

test('fixed-block catalog retains raw evidence, source versions and original reviewed-event metadata with namespaced research IDs',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,project.mode)});
 const result=inspectResearch(project),record=result.records.find(r=>r.kind==='fixed_block');
 assert.deepEqual(record.full_review,archive);assert.equal(record.artifact_id,entry.expected_id);assert.equal(record.event_id,entry.event_id);
 const event=result.events.find(e=>e.id===entry.event_id);assert.deepEqual(record.review,event.event.research_review);
 assert.equal(record.records.length,8);assert.deepEqual(record.periods,[{basis:'point',end:'2026-10-04'}]);
 for(const row of record.records) {
  const saved=archive.observations.find(o=>row.id===`${archive.id}:${o.id}`);assert.ok(saved);
  assert.equal(row.value,saved.value);assert.equal(row.response_word,saved.response_word);assert.equal(row.classification,'OBSERVED');
  assert.equal(row.observed_at,'2026-10-04T14:53:11.000Z');assert.equal(row.confidence,'medium');
  assert.ok(!project.inputs.some(input=>input.id===row.id));
 }
 for(const source of record.sources)assert.deepEqual(source,project.sources.find(s=>s.id===source.id));
 assert.equal(record.summary.deployment_source_equivalence,null);assert.match(record.summary.receipt_state,/RPC 無結果/);
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,project.mode)}),before);
});

test('fixed-block raw byte pin rejects normalized replacement JSON even when parsed values match',t=>{
 const {project:p,catalog:c}=isolated(t,()=>{});assert.throws(()=>inspectResearch(p,{catalog:c}),/fingerprint mismatch/);
});

test('repinning a mixed-block archive still requires the manual semantic checks before rendering',t=>{
 const {project:p,catalog:c}=isolated(t,a=>{const q=JSON.parse(a.transport.state.request_json);q[0].params[1]='latest';a.transport.state.request_json=JSON.stringify(q);},{repin:true});
 assert.throws(()=>inspectResearch(p,{catalog:c}),/not pinned/);
});

test('catalog entry cannot select an unrelated event or invent a new reviewed digest',t=>{
 const c=structuredClone(catalog);c.records=c.records.filter(r=>r.kind==='fixed_block');c.records[0].event_id='uni-vesting-execution-20261004';
 assert.throws(()=>inspectResearch(project,{catalog:c}),/does not match reviewed event/);
 const {project:p,catalog:changed}=isolated(t,()=>{},{repin:true});
 assert.throws(()=>inspectResearch(p,{catalog:changed}),/does not match reviewed event/);
 delete c.records[0].event_id;assert.throws(()=>inspectResearch(project,{catalog:c}),/Invalid research catalog/);
});

test('fixed-block freshness separates prior-day availability from the saved observation, block and retrieval times',()=>{
 for(const [cutoff,available] of [['2026-10-03',false],['2026-10-04',true]]) {
  const report=researchFreshness(project,{as_of_date:cutoff}).research,review=report.artifacts.find(a=>a.kind==='fixed_block');
  assert.equal(review.review_state,available?'AVAILABLE_AT_CUTOFF':'NOT_AVAILABLE_AT_CUTOFF');
  const rows=report.records.filter(r=>r.catalog_id===entry.id);assert.equal(rows.length,8);
  assert.ok(rows.every(r=>r.observation_state===(available?'WITHIN_REVIEW_WINDOW':'NOT_AVAILABLE_AT_CUTOFF')));
  assert.ok(rows.every(r=>r.evidence_state===(available?'AVAILABLE':'INSUFFICIENT')));
  assert.ok(rows.every(r=>r.record.observed_at==='2026-10-04T14:53:11.000Z'&&r.record.as_of_date==='2026-10-04'));
  assert.ok(rows.every(r=>r.period.basis==='point'&&r.period.end==='2026-10-04'));
 }
});

test('research/freshness APIs return exact RPC evidence, reject writes and keep fixtures isolated',async t=>{
 const before=fingerprint(readSnapshots(project.root,project.mode)),server=createServer();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(base+'/api/research?mode=production');assert.equal(response.status,200);
 const data=await response.json();assert.deepEqual(data.records.find(r=>r.kind==='fixed_block').full_review,archive);
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04'])assert.equal((await fetch(base+endpoint,{method:'POST'})).status,405);
 const fixture=await (await fetch(base+'/api/research?mode=fixture')).json();assert.deepEqual(fixture.records,[]);assert.deepEqual(fixture.events,[]);
 const freshness=await (await fetch(base+'/api/freshness?mode=fixture')).json();assert.equal(Object.hasOwn(freshness,'research'),false);
 assert.deepEqual(fs.readFileSync(`data/research/${entry.file}`),raw);assert.equal(fingerprint(readSnapshots(project.root,project.mode)),before);
});

test('both APIs refuse tampered pinned RPC bytes and preserve the rejected evidence file',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fixed-block-api-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const folder of ['spec','data','sources'])copyTree(path.join(project.root,folder),path.join(root,folder));
 const file=path.join(root,'data/research',entry.file),altered=structuredClone(archive);altered.observations[0].value='0x'+'1'.repeat(40);
 fs.writeFileSync(file,JSON.stringify(altered));const before=fs.readFileSync(file);
 const server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04']) {
  const response=await fetch(base+endpoint);assert.equal(response.status,400);assert.match((await response.json()).error,/fingerprint mismatch/);
 }
 assert.deepEqual(fs.readFileSync(file),before);
});
