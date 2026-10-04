import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewTokenState} from '../../engine/research/token-state.js';

const file='data/research/uni-token-state-2026-10-04-v1.json',raw=fs.readFileSync(file),artifact=JSON.parse(raw),p=loadProject('production');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex'),inspect=bytes=>reviewTokenState(p,bytes,digest(bytes));
const changed=fn=>{const copy=structuredClone(artifact);fn(copy);return Buffer.from(JSON.stringify(copy));};
const rpc=(a,fn)=>{const q=JSON.parse(a.transport.request_json),r=JSON.parse(a.transport.response_json);fn(q,r);a.transport.request_json=JSON.stringify(q);a.transport.response_json=JSON.stringify(r);};
const obs=(a,key)=>a.observations.find(o=>o.id.endsWith('.'+key+'@1'));
const amount=(a,key,value)=>{const o=obs(a,key);o.value=value.toString();o.response_word='0x'+value.toString(16).padStart(64,'0');rpc(a,(q,r)=>r.find(r=>r.id===o.response_id).result=o.response_word);};

test('token-state reader preserves exact raw observations, original dependency and embedded comparison without writes',()=>{
 const before=fingerprint({project:p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),result=inspect(raw);
 assert.equal(result.sha256,'848a20c9897b408960887d8c6dce13d062310d0794a87a7ae8d673e2209a631d');
 assert.equal(result.persisted,false);assert.equal(result.financial_inputs_updated,false);assert.equal(result.method.version,1);
 assert.deepEqual(result.full_archive,artifact);assert.equal(result.summary.observations,4);
 assert.equal(result.summary.values.find(v=>v.key==='owner_balance').value,'262247996305835021033106178');
 assert.equal(result.summary.values.find(v=>v.key==='total_supply').value,'1000000000000000000000000000');
 assert.ok(result.summary.values.every(v=>typeof v.value==='string'&&/[一-鿿]/u.test(v.label)));
 assert.equal(result.summary.balance_cover.value,1);assert.equal(result.summary.balance_cover.classification,'DERIVED');
 assert.deepEqual(result.summary.balance_cover.dependencies,artifact.derived[0].dependencies);
 assert.equal(result.summary.circulating_supply,null);assert.equal(result.summary.fully_diluted_supply,null);
 result.full_archive.observations[0].value='changed';assert.equal(artifact.observations[0].value,'262247996305835021033106178');
 assert.equal(fingerprint({project:p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);assert.deepEqual(fs.readFileSync(file),raw);
});

test('token-state response/observation order and selector object key order do not change RPC meaning',()=>{
 const bytes=changed(a=>{a.observations.reverse();a.transport.labels.reverse();rpc(a,(q,r)=>{q.reverse();r.reverse();for(const request of q.filter(r=>r.method==='eth_call'))request.params[1]={requireCanonical:true,blockHash:a.anchor.hash};});});
 assert.equal(inspect(bytes).summary.balance_cover.value,1);
});

const allowance=20000000000000000000000000n;
for(const [label,value,expected] of [['zero',0n,0],['one raw unit below allowance',allowance-1n,0],['equal allowance',allowance,1],['one raw unit above allowance',allowance+1n,1],['uint256 maximum',(1n<<256n)-1n,1]])
 test(`BigInt comparison replays ${label} without floating point rounding`,()=>{
  const bytes=changed(a=>{amount(a,'owner_balance',value);a.derived[0].value=expected;});assert.equal(inspect(bytes).summary.balance_cover.value,expected);
 });

const invalid=[
 ['mixed block selector',a=>rpc(a,q=>q.find(r=>r.id===3).params[1].blockHash='0x'+'1'.repeat(64)),/not pinned/],
 ['latest fallback',a=>rpc(a,q=>q.find(r=>r.id===3).params[1]='latest'),/not pinned/],
 ['missing canonical flag',a=>rpc(a,q=>delete q.find(r=>r.id===3).params[1].requireCanonical),/not pinned/],
 ['wrong balance owner padding',a=>rpc(a,q=>q.find(r=>r.id===3).params[0].data='0x70a08231'+'1'.repeat(64)),/arguments mismatch/],
 ['wrong allowance spender',a=>rpc(a,q=>q.find(r=>r.id===6).params[0].data='0xdd62ed3e'+a.owner.slice(2).padStart(64,'0')+'1'.repeat(64)),/arguments mismatch/],
 ['wrong token target',a=>rpc(a,q=>q.find(r=>r.id===4).params[0].to='0x'+'1'.repeat(40)),/arguments mismatch/],
 ['substituted owner',a=>a.owner='0x'+'1'.repeat(40),/identity mismatch/],
 ['owner dependency digest rewrite',a=>a.owner_identity_dependency.archive_sha256='0'.repeat(64),/dependency mismatch/],
 ['owner dependency response rewrite',a=>a.owner_identity_dependency.response_id=11,/dependency mismatch/],
 ['wrong header request',a=>rpc(a,q=>q.find(r=>r.id===2).params[0]='latest'),/header request/],
 ['different header response',a=>rpc(a,(q,r)=>r.find(r=>r.id===2).result.hash='0x'+'1'.repeat(64)),/header mismatch/],
 ['different chain',a=>rpc(a,(q,r)=>r.find(r=>r.id===1).result='0x2'),/chain request\/result/],
 ['duplicate RPC ID',a=>rpc(a,(q,r)=>r[1].id=r[0].id),/Duplicate/],
 ['RPC error',a=>rpc(a,(q,r)=>{delete r.find(r=>r.id===3).result;r.find(r=>r.id===3).error={code:-32000,message:'Unavailable'};}),/ID\/error/],
 ['null result interpreted as zero',a=>rpc(a,(q,r)=>r.find(r=>r.id===3).result=null),/ABI\/result/],
 ['invalid raw JSON',a=>a.transport.response_json='<html>Error</html>',/Invalid JSON/],
 ['duplicate observation',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['incorrect raw decode',a=>obs(a,'total_supply').value='1',/ABI\/result/],
 ['unsafe numeric value',a=>obs(a,'owner_balance').value=Number(obs(a,'owner_balance').value),/Invalid token-state/],
 ['negative raw integer',a=>obs(a,'owner_balance').value='-1',/Invalid token-state/],
 ['uint8 overflow with consistent word',a=>amount(a,'decimals',256n),/declared width/],
 ['same-block allowance conflict',a=>amount(a,'vesting_allowance',allowance-1n),/prior allowance\/decimals conflict/],
 ['wrong token units',a=>obs(a,'owner_balance').unit='USD',/date\/source\/unit/],
 ['annualized observation',a=>obs(a,'owner_balance').period.basis='annual',/Invalid token-state/],
 ['different observation instant',a=>obs(a,'owner_balance').observed_at='2026-10-04T14:53:12Z',/date\/source\/unit/],
 ['different source',a=>obs(a,'owner_balance').source_ids=['missing'],/date\/source\/unit/],
 ['promoted classification',a=>obs(a,'owner_balance').classification='DERIVED',/Invalid token-state/],
 ['fixture mixed in',a=>obs(a,'owner_balance').fixture=true,/Invalid token-state/],
 ['arbitrary formula operation',a=>a.formulas[0].expression.op='eval',/Invalid token-state/],
 ['formula version rewrite',a=>a.formulas[0].version=2,/Invalid token-state/],
 ['reversed formula dependencies',a=>a.formulas[0].expression.args.reverse(),/formula version\/expression/],
 ['derived lineage mismatch',a=>a.derived[0].dependencies.reverse(),/comparison\/lineage/],
 ['derived value not replaying',a=>a.derived[0].value=0,/comparison\/lineage/],
 ['future capture',a=>a.captured_at='2999-01-01T00:00:00Z',/future/],
 ['capture preceding owner evidence',a=>a.transport.started_at='2026-10-04T14:00:00Z',/knowledge\/anchor chronology/],
 ['HTTP Date after retrieval',a=>a.transport.http_date='Sun, 04 Oct 2026 16:06:28 GMT',/HTTP Date/]
];
for(const [label,mutate,error] of invalid)test(`matching token-state digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(mutate)),error));

test('reader independently requires production, reviewed digest and primary captured source',()=>{
 assert.throws(()=>reviewTokenState(loadProject('fixture'),raw,digest(raw)),/requires production/);
 assert.throws(()=>reviewTokenState(p,raw,null),/reviewed SHA-256/);
 assert.throws(()=>reviewTokenState(p,raw,'0'.repeat(64)),/digest mismatch/);
 assert.throws(()=>reviewTokenState({...p,sources:p.sources.filter(s=>s.id!=='ethereum-uni-token-state-20261004-v1')},raw,digest(raw)),/Missing primary/);
 const altered={...p,sources:p.sources.map(s=>s.id==='ethereum-uni-token-state-20261004-v1'?{...s,retrieved_at:'2026-10-04T16:06:28Z'}:s)};
 assert.throws(()=>reviewTokenState(altered,raw,digest(raw)),/source chronology/);
});

test('token-state CLI returns the shared Chinese review and rejects incomplete commands without writing archive/history',()=>{
 const files=[file,'data/research/uni-vesting-fixed-block-2026-10-04-v1.json','spec/source-registry.yaml','data/events/production/uni-token-state-20261004.json'];
 const before=files.map(f=>fs.readFileSync(f)),call=args=>spawnSync(process.execPath,['cli.js','token-state-review',...args],{cwd:p.root,encoding:'utf8'});
 const result=call([file,'--production','--digest',digest(raw)]);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),inspect(raw));
 for(const args of [[file],[file,'--production'],[file,'--production','--digest'],[file,'--production','--digest','0'.repeat(64)],['--production']]) {
  const failed=call(args);assert.equal(failed.status,1);assert.equal(failed.stdout,'');assert.ok(failed.stderr.trim());
 }
 files.forEach((f,i)=>assert.deepEqual(fs.readFileSync(f),before[i]));
});
