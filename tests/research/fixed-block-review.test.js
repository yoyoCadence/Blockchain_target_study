import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewFixedBlock} from '../../engine/research/fixed-block.js';

const file='data/research/uni-vesting-fixed-block-2026-10-04-v1.json',raw=fs.readFileSync(file),artifact=JSON.parse(raw);
const p=loadProject('production'),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const changed=fn=>{const copy=structuredClone(artifact);fn(copy);return Buffer.from(JSON.stringify(copy));};
const inspect=bytes=>reviewFixedBlock(p,bytes,digest(bytes));
const state=(a,fn)=>{const q=JSON.parse(a.transport.state.request_json),r=JSON.parse(a.transport.state.response_json);fn(q,r);a.transport.state.request_json=JSON.stringify(q);a.transport.state.response_json=JSON.stringify(r);};
const probe=(a,fn)=>{const q=JSON.parse(a.transport.probe.request_json),r=JSON.parse(a.transport.probe.response_json);fn(q,r);a.transport.probe.request_json=JSON.stringify(q);a.transport.probe.response_json=JSON.stringify(r);};
const obs=(a,id)=>a.observations.find(o=>o.id===id);

test('manual fixed-block inspection retains exact integers and evidence while leaving project, files and history unchanged',()=>{
 const before=fingerprint({project:p,economics:calculate(p),history:readSnapshots(p.root,p.mode)});
 const result=inspect(raw);assert.equal(result.persisted,false);assert.equal(result.financial_inputs_updated,false);
 assert.equal(result.sha256,'cad4aaf3fa49cf688bd8dfb54434ab1416c40510150ac03f71b6932bc1571195');
 assert.deepEqual(result.full_archive,artifact);assert.equal(result.method.version,1);
 assert.equal(result.summary.block_number,'26119713');assert.equal(result.summary.observations,8);
 assert.equal(result.summary.values.find(v=>v.id==='allowance(owner,vesting)').value,'20000000000000000000000000');
 assert.ok(result.summary.values.every(v=>typeof v.value==='string'&&/[一-鿿]/u.test(v.label)));
 assert.equal(result.summary.deployment_source_equivalence,null);assert.match(result.summary.receipt_state,/原 Explorer 證據保留/);
 result.full_archive.observations[0].value='mutated';assert.notEqual(result.full_archive.observations[0].value,artifact.observations[0].value);
 assert.equal(fingerprint({project:p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
 assert.deepEqual(fs.readFileSync(file),raw);
});

test('out-of-order RPC responses and selector object property order still resolve by ID and meaning',()=>{
 const bytes=changed(a=>state(a,(q,r)=>{r.reverse();for(const request of q.filter(r=>['eth_call','eth_getCode'].includes(r.method)))request.params[1]={requireCanonical:true,blockHash:a.anchor.hash};}));
 assert.equal(inspect(bytes).summary.block_number,'26119713');
});

const invalid=[
 ['latest state fallback',a=>state(a,q=>q[0].params[1]='latest'),/not pinned/],
 ['mixed block hash',a=>state(a,q=>q[0].params[1].blockHash='0x'+'1'.repeat(64)),/not pinned/],
 ['canonical flag removed',a=>state(a,q=>delete q[0].params[1].requireCanonical),/not pinned/],
 ['runtime unpinned',a=>state(a,q=>q.find(r=>r.id===18).params[1]='latest'),/Runtime query/],
 ['wrong getter selector',a=>state(a,q=>q[0].params[0].data='0x00000000'),/selector\/contract/],
 ['wrong allowance owner',a=>state(a,q=>q.find(r=>r.id===16).params[0].data='0xdd62ed3e'+'0'.repeat(64)+'ca046a83edb78f74ae338bb5a291bf6fdac9e1d2'.padStart(64,'0')),/selector\/contract/],
 ['token call directed elsewhere',a=>state(a,q=>q.find(r=>r.id===17).params[0].to='0x'+'1'.repeat(40)),/selector\/contract/],
 ['all vesting calls replaced consistently',a=>state(a,q=>{for(const r of q.filter(r=>r.method==='eth_getCode'||(r.method==='eth_call'&&r.id<16))) {if(r.method==='eth_call')r.params[0].to='0x'+'1'.repeat(40);else r.params[0]='0x'+'1'.repeat(40);}}),/contract identity/],
 ['wrong ABI amount',a=>obs(a,'quarterlyVestingAmount').value='5000000000000000000000001',/ABI\/result/],
 ['response/result mismatch',a=>state(a,(q,r)=>r.find(r=>r.id===13).result='0x'+'0'.repeat(64)),/ABI\/result/],
 ['address with nonzero leading padding',a=>{const o=obs(a,'owner');o.response_word='0x1'+o.response_word.slice(3);state(a,(q,r)=>r.find(r=>r.id===o.response_id).result=o.response_word);},/address padding/],
 ['uint48 overflow with matching value',a=>{const o=obs(a,'quartersPassed');o.response_word='0x'+(1n<<48n).toString(16).padStart(64,'0');o.value=(1n<<48n).toString();state(a,(q,r)=>r.find(r=>r.id===o.response_id).result=o.response_word);},/declared width/],
 ['duplicate response ID',a=>state(a,(q,r)=>r[1].id=r[0].id),/Duplicate/],
 ['duplicate observation ID',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['wrong response ID',a=>state(a,(q,r)=>r[0].id=999),/ID\/error/],
 ['RPC error mapped to an observation',a=>state(a,(q,r)=>{delete r[0].result;r[0].error={code:-32000,message:'Unavailable'};}),/ID\/error/],
 ['null word silently treated as zero',a=>state(a,(q,r)=>r[0].result=null),/ABI\/result/],
 ['non-JSON raw response',a=>a.transport.state.response_json='<html>unavailable</html>',/Invalid JSON/],
 ['wrong chain',a=>probe(a,(q,r)=>r.find(r=>r.id===1).result='0x2'),/not Ethereum/],
 ['latest anchor',a=>probe(a,q=>q.find(r=>r.id===2).params[0]='latest'),/finalized anchor/],
 ['header hash mismatch',a=>probe(a,(q,r)=>r.find(r=>r.id===2).result.hash='0x'+'1'.repeat(64)),/header mismatch/],
 ['height recheck mismatch',a=>state(a,(q,r)=>r.find(r=>r.id===19).result.hash='0x'+'1'.repeat(64)),/height recheck mismatch/],
 ['runtime bytes modified',a=>state(a,(q,r)=>r.find(r=>r.id===18).result='0x00'),/SHA-256 mismatch/],
 ['receipt result promoted',a=>state(a,(q,r)=>r.find(r=>r.id===20).result={status:'0x1'}),/Receipt-null/],
 ['wrong receipt transaction',a=>state(a,q=>q.find(r=>r.id===20).params[0]='0x'+'1'.repeat(64)),/Receipt request/],
 ['block time after capture',a=>a.anchor.effective_at='2026-10-04T15:20:00Z',/after anchor retrieval/],
 ['state calls before anchor',a=>a.transport.state.started_at='2026-10-04T14:00:00Z',/precede anchor capture/],
 ['source IDs not retained',a=>obs(a,'owner').source_ids=['missing'],/source\/date/],
 ['observation classification changed',a=>obs(a,'owner').classification='ASSUMPTION',/Invalid fixed-block/],
 ['fixture provenance',a=>a.fixture=true,/Invalid fixed-block/],
 ['deployment source equivalence fabricated',a=>a.runtime_bytecode.deployment_source_equivalence=true,/Invalid fixed-block/]
];
for(const [label,mutate,error] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(mutate)),error));

test('future evidence and missing primary source are rejected independently of the archive digest',()=>{
 const future=changed(a=>a.captured_at='2999-01-01T00:00:00Z');assert.throws(()=>inspect(future),/future/);
 const missing={...p,sources:p.sources.filter(s=>s.id!==artifact.source_ids[0])};
 assert.throws(()=>reviewFixedBlock(missing,raw,digest(raw)),/Missing primary/);
 assert.throws(()=>reviewFixedBlock(loadProject('fixture'),raw,digest(raw)),/requires production/);
 assert.throws(()=>reviewFixedBlock(p,raw,'0'.repeat(64)),/digest mismatch/);
 assert.throws(()=>reviewFixedBlock(p,raw,null),/reviewed SHA-256/);
});

test('CLI requires explicit production and reviewed digest, returns Chinese evidence and never changes financial/history bytes',()=>{
 const tracked=[file,'spec/source-registry.yaml','data/events/production/uni-vesting-fixed-block-20261004.json'];
 const before=tracked.map(f=>fs.readFileSync(f));
 const call=args=>spawnSync(process.execPath,['cli.js','fixed-block-review',...args],{cwd:p.root,encoding:'utf8'});
 const success=call([file,'--production','--digest',digest(raw)]);assert.equal(success.status,0,success.stderr);
 assert.deepEqual(JSON.parse(success.stdout),inspect(raw));
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)],['--production']]) {
  const rejected=call(args);assert.equal(rejected.status,1);assert.equal(rejected.stdout,'');assert.ok(rejected.stderr.trim());
 }
 tracked.forEach((f,i)=>assert.deepEqual(fs.readFileSync(f),before[i]));
});
