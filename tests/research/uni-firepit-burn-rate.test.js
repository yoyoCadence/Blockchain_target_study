import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {reviewUniFirepitState} from '../../engine/research/firepit-state.js';
import {firepitBurnRateScenario} from '../../engine/research/firepit-burn-rate.js';

const p=loadProject('production'),METHOD='spec/uni-firepit-state-method-20261013.yaml';
const ep=(file,methodFile)=>{const bytes=fs.readFileSync(file);return {bytes,digest:createHash('sha256').update(bytes).digest('hex'),methodFile};};
const start=ep('data/research/uni-firepit-state-2026-10-06-v1.json'),end=ep('data/research/uni-firepit-state-2026-10-13-v1.json',METHOD);
const saved=JSON.parse(fs.readFileSync('data/research/uni-firepit-burn-rate-2026-10-13-v1.json'));

test('the saved recent-rate SCENARIO replays exactly from the two digest-reviewed captures',()=>{
 const s=firepitBurnRateScenario(p,start,end);
 assert.deepEqual({version:1,id:'uni-firepit-burn-rate-20261013-v1',fixture:false,as_of_date:'2026-10-13',...s},saved);
 assert.deepEqual([s.classification,s.scenario,s.decision,s.short_window,s.unit],['SCENARIO','firepit_recent_rate','D-20261012-02',true,'UNI/year']);
 assert.deepEqual([s.releases,s.window_seconds,s.burned_uni,s.annualized_uni],['20','595200','80000','4241612.903225806451612903']);
 assert.equal(BigInt(s.annualized_raw),BigInt(s.burned_raw)*31_557_600n/595_200n);
 assert.equal(s.context.not_from_mainnet_firepit_uni,'140000.002071909718123708');
 assert.equal(end.digest,'273e3eecb14ed1067e44f9acbfa5cca669056fe6df35f4d15b6927465eeb32b7');
});

test('endpoints must move forward and later methods must equal v1 apart from bindings',()=>{
 assert.throws(()=>firepitBurnRateScenario(p,end,start),/move forward/);
 assert.throws(()=>firepitBurnRateScenario(p,start,start),/move forward/);
 assert.equal(reviewUniFirepitState(p,start.bytes,start.digest).summary.block_number,'26133926');
 assert.throws(()=>reviewUniFirepitState(p,end.bytes,end.digest),/method\/archive version mismatch/);
 const method=fs.readFileSync(METHOD,'utf8'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'firepit-method-'));
 for(const [from,to] of [['max_release_length','max_release_lengthX'],['commit: 8604e4b9','commit: 0604e4b9']]) {
  assert.ok(method.includes(from),from);const file=path.join(dir,`${to.length}.yaml`);fs.writeFileSync(file,method.replace(from,to));
  assert.throws(()=>reviewUniFirepitState(p,end.bytes,end.digest,file),/must equal v1/);
 }
 fs.rmSync(dir,{recursive:true,force:true});
});

test('the 10/13 capture is a source-only event with v2 document sources and no financial change',()=>{
 const history=readSnapshots(p.root,p.mode),snap=history.find(s=>s.event?.id==='uni-firepit-state-20261013'),prev=history[history.indexOf(snap)-1];
 verifySnapshot(snap);assert.equal(snap.id,'2e9da6b1cce366c0deb362b8cac5415e2ed25504cfacfbe2af902e143971c6a1');assert.equal(prev.id,'f096f2c3eb12ac7c72ef7c6ff338d513eb483ef14aa5597797d2205f063bcfe8');
 const event=readYaml('data/research/uni-firepit-state-2026-10-13.yaml');assert.ok(event.reason.includes(end.digest));assert.deepEqual(snap.event.updates,[]);
 for(const s of event.sources.filter(s=>s.version===2)){const old=prev.sources.find(x=>x.id===s.supersedes);assert.deepEqual([s.url,s.date,s.tier],[old.url,old.date,old.tier]);}
 assert.equal(event.sources.filter(s=>s.version===2).length,5);
 const diff=compareSnapshots(prev,snap);assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change],[true,false,false,false]);
 assert.deepEqual(snap.metrics,prev.metrics);assert.equal(Object.values(calculate(p).metrics).filter(m=>m.value===null).length,72);
});
