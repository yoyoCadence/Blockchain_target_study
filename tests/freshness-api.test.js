import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.js';
import {loadProject,calculate} from '../engine/index.js';
import {sourceFreshness} from '../engine/research/freshness.js';
import {researchFreshness} from '../engine/research/research-freshness.js';
import {fingerprint,readSnapshots} from '../engine/snapshots.js';

async function serve(t) {
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 return `http://127.0.0.1:${server.address().port}`;
}

test('freshness API defaults to synthetic fixture provenance and canonical engine policy/formula only',async t=>{
 const base=await serve(t),response=await fetch(`${base}/api/freshness?as_of=2026-10-03`),data=await response.json();
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.deepEqual(data,sourceFreshness(loadProject('fixture'),{as_of_date:'2026-10-03'}));
 assert.equal(data.fixture,true);assert.equal(data.persisted,false);assert.equal(Object.hasOwn(data,'research'),false);
 assert.equal(data.policy.classification,'ASSUMPTION');assert.equal(data.calculation.classification,'DERIVED');
 assert.equal(data.calculation.formula_version,1);assert.ok(data.source_checks.every(s=>s.source.fixture));
});

test('production freshness API preserves stale historical budget and separate verified research/null evidence',async t=>{
 const base=await serve(t),response=await fetch(`${base}/api/freshness?mode=production&as_of=2026-10-03`),data=await response.json();
 assert.equal(response.status,200);assert.deepEqual(data,researchFreshness(loadProject('production'),{as_of_date:'2026-10-03'}));
 assert.equal(data.fixture,false);assert.equal(data.scope,'canonical_and_cataloged_research');
 assert.equal(data.summary.input_states.UNKNOWN_DATA,56);
 assert.equal(data.inputs.find(r=>r.metric_id==='uni.price').observation_state,'NOT_AVAILABLE_AT_CUTOFF');
 assert.equal(data.inputs.find(r=>r.metric_id==='xlm.price').observation_state,'NOT_AVAILABLE_AT_CUTOFF');
 const budget=data.inputs.find(r=>r.metric_id==='uni.growth_budget');
 assert.equal(budget.observation_as_of,'2026-01-01');assert.equal(budget.observation_state,'STALE_FOR_CURRENT_USE');
 assert.ok(data.source_checks.filter(s=>s.used_by.includes('uni.growth_budget')).every(s=>s.retrieval_state==='RECENTLY_RETRIEVED'));
 assert.equal(data.research.artifacts.length,7);assert.equal(data.research.records.length,153);
 assert.ok(data.research.records.filter(r=>r.catalog_id==='secz-ttm-20260630').every(r=>r.record.value===null&&r.evidence_state==='INSUFFICIENT'));
 assert.equal(data.research.financial_inputs_updated,false);assert.equal(data.research.persisted,false);
});

test('historical API cutoff does not make later research review or retrieval available in the past',async t=>{
 const base=await serve(t),response=await fetch(`${base}/api/freshness?mode=production&as_of=2026-08-13`),data=await response.json();
 assert.equal(response.status,200);assert.equal(data.as_of_date,'2026-08-13');
 assert.ok(data.research.artifacts.every(r=>r.review_state==='NOT_AVAILABLE_AT_CUTOFF'));
 assert.ok(data.research.records.every(r=>r.evidence_state==='INSUFFICIENT'));
 assert.ok(data.research.source_checks.every(s=>s.retrieval_age_days===null));
});

for(const cutoff of ['','2026-02-30','2099-01-01'])test(`freshness API rejects explicit invalid/future cutoff ${JSON.stringify(cutoff)}`,async t=>{
 const base=await serve(t),response=await fetch(`${base}/api/freshness?mode=production&as_of=${cutoff}`);
 assert.equal(response.status,400);assert.match((await response.json()).error,/freshness as-of date|Freshness cutoff cannot be in the future/);
});

test('freshness API rejects an invalid workspace and all write methods',async t=>{
 const base=await serve(t);
 let response=await fetch(`${base}/api/freshness?mode=missing`);assert.equal(response.status,400);assert.match((await response.json()).error,/Invalid data mode/);
 for(const method of ['POST','PUT','PATCH','DELETE']) {
  response=await fetch(`${base}/api/freshness?mode=production`,{method,body:JSON.stringify({as_of:'2026-10-03'})});
  assert.equal(response.status,405);assert.equal((await response.json()).error,'Method not allowed');
 }
});

test('omitted cutoff uses the engine current UTC day',async t=>{
 const base=await serve(t),before=new Date().toISOString().slice(0,10),response=await fetch(`${base}/api/freshness`),data=await response.json(),after=new Date().toISOString().slice(0,10);
 assert.equal(response.status,200);assert.ok([before,after].includes(data.as_of_date));
});

test('freshness requests in both modes preserve financial values, thesis, policy and every journal hash',async t=>{
 const base=await serve(t),before={};
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode);before[mode]=fingerprint({inputs:p.inputs,sources:p.sources,registry:p.registry,
   result:calculate(p),history:readSnapshots(p.root,mode),freshness:sourceFreshness(p,{as_of_date:'2026-10-03'})});
 }
 for(const mode of ['production','fixture','production'])assert.equal((await fetch(`${base}/api/freshness?mode=${mode}&as_of=2026-10-03`)).status,200);
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode);assert.equal(fingerprint({inputs:p.inputs,sources:p.sources,registry:p.registry,
   result:calculate(p),history:readSnapshots(p.root,mode),freshness:sourceFreshness(p,{as_of_date:'2026-10-03'})}),before[mode]);
 }
});
