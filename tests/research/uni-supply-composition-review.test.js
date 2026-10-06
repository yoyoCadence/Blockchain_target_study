import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewUniSupplyComposition} from '../../engine/research/supply-composition.js';

const file='data/research/uni-supply-composition-2026-10-06-v1.json',bytes=fs.readFileSync(file),a=JSON.parse(bytes),p=loadProject('production');
const digest=b=>createHash('sha256').update(b).digest('hex'),inspect=(b,project=p)=>reviewUniSupplyComposition(project,b,digest(b));
const changed=fn=>{const copy=structuredClone(a);fn(copy);return Buffer.from(JSON.stringify(copy));};
// Edit one saved RPC batch as parsed requests/responses and write the exact strings back.
const rpc=(a,section,fn)=>{const t=a.transport[section],requests=JSON.parse(t.request_json),responses=JSON.parse(t.response_json);
 fn(id=>requests.find(r=>r.id===id),id=>responses.find(r=>r.id===id),requests,responses);t.request_json=JSON.stringify(requests);t.response_json=JSON.stringify(responses);};
const record=(a,key)=>a.observations.find(o=>o.key===key),word=n=>'0x'+BigInt(n).toString(16).padStart(64,'0');
// Change one on-chain reading consistently in the response, the saved word and the decoded value.
const setValue=(a,key,value)=>{const o=record(a,key),w=o.abi_type==='address'?'0x'+'0'.repeat(24)+value.slice(2):word(value);
 rpc(a,'state',(req,res)=>res(o.response_id).result=w);o.response_word=w;o.value=String(value);};
const derived=(a,name)=>a.derived.find(d=>d.formula_id.endsWith(name));
const ids=Object.fromEntries(a.transport.labels.map(l=>[l.label,l.id])),TIMELOCK=BigInt(record(a,'timelock_balance').value);
const pad=address=>address.slice(2).padStart(64,'0');

test('UNI supply reader replays exact raw readings, document identity and derived checks without changing files or economics',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),r=inspect(bytes);
 assert.equal(r.sha256,'de66eac4f1d0beda86dc04ee0e129162b4b7ecd29072b666682733da482f2de1');
 assert.equal(r.persisted,false);assert.equal(r.financial_inputs_updated,false);assert.equal(r.promoted,false);
 assert.deepEqual(r.method,{id:'uni-supply-composition-review',version:1,source_ids:['ethereum-uni-supply-composition-20261006-v1',
  'uniswap-governance-technical-reference-20260409-v1','uniswap-governance-uni-sol-ab22c08-v1']});
 assert.deepEqual(r.full_archive,a);assert.equal(r.summary.observations,13);assert.equal(r.summary.block_number,'26133577');
 assert.equal(r.summary.block_time,'2026-10-06T13:17:11.000Z');assert.equal(r.summary.retrieved_at,'2026-10-06T13:34:54.065Z');
 const value=key=>r.summary.values.find(v=>v.key===key).value;
 assert.equal(value('total_supply'),'1000000000000000000000000000');assert.equal(value('dead_sink_balance'),'112633581211219518941995199');
 assert.equal(value('timelock_balance'),'262247996305835021033106178');assert.equal(value('minter'),'0x1a9c8182c09f50c8318d769245bea52c32be35bc');
 assert.equal(value('timelock_address'),'0x1a9C8182C09F50C8318d769245beA52c32BE35BC');assert.equal(value('block_timestamp'),'1791292631');
 assert.ok(r.summary.values.every(v=>typeof v.value==='string'&&v.classification==='OBSERVED'&&v.confidence==='medium'));
 assert.deepEqual(r.summary.derived.map(d=>d.value),['887366418788780481058004801','625118422482945460024898623',1,'20000000000000000000000000',1]);
 assert.ok(r.summary.derived.every(d=>d.classification==='DERIVED'&&d.formula_version===1&&/[一-鿿]/u.test(d.label)));
 assert.deepEqual(r.summary.derived.map(d=>d.dependencies),a.derived.map(d=>d.dependencies));
 assert.equal(r.summary.documents.address_table.date_modified,'2026-04-09T14:56:21.000Z');assert.equal(r.summary.documents.address_table.body_replayable,false);
 assert.equal(r.summary.documents.source_code.commit,'ab22c084bacb2636a1aebf9759890063eb6e4946');assert.equal(r.summary.documents.source_code.lines.length,12);
 assert.equal(Object.keys(r.summary.unknown).length,9);assert.ok(Object.values(r.summary.unknown).every(v=>v===null));
 assert.ok(r.summary.limitations.some(l=>l.includes('不定義流通供給')));
 r.full_archive.observations[0].value='mutated';assert.deepEqual(fs.readFileSync(file),bytes);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

test('consistent different balances replay new mechanical residuals without judging supply',()=>{
 const r=inspect(changed(a=>{setValue(a,'dead_sink_balance','1');derived(a,'excluding_dead_sink').value=(10n**27n-1n).toString();
  derived(a,'excluding_dead_sink_and_timelock').value=(10n**27n-1n-TIMELOCK).toString();}));
 assert.deepEqual(r.summary.derived.slice(0,2).map(d=>d.value),['999999999999999999999999999',(10n**27n-1n-TIMELOCK).toString()]);
 assert.equal(r.summary.unknown.circulating_supply,null);
});

test('integer mint cap floors like the contract and never becomes a forecast',()=>{
 const total=10n**27n+51n,dead=BigInt(record(a,'dead_sink_balance').value);
 const r=inspect(changed(a=>{setValue(a,'total_supply',total.toString());derived(a,'excluding_dead_sink').value=(total-dead).toString();
  derived(a,'excluding_dead_sink_and_timelock').value=(total-dead-TIMELOCK).toString();derived(a,'cap_amount_at_block').value='20000000000000000000000001';}));
 assert.equal(r.summary.derived[3].value,'20000000000000000000000001');assert.equal(r.summary.unknown.future_mint_decision,null);
});

test('unmet time condition and a different minter remain observed zero flags, not errors or conclusions',()=>{
 const later=changed(a=>{setValue(a,'minting_allowed_after','1791292632');derived(a,'time_permitted_at_block').value=0;});
 assert.equal(inspect(later).summary.derived[2].value,0);
 const other=changed(a=>{setValue(a,'minter','0x'+'1'.repeat(40));derived(a,'minter_matches_docs_timelock').value=0;});
 const r=inspect(other);assert.equal(r.summary.derived[4].value,0);assert.equal(r.summary.values.find(v=>v.key==='minter').value,'0x'+'1'.repeat(40));
});

test('record, formula, label, response and excerpt order may change while IDs and meaning remain fixed',()=>{
 const r=inspect(changed(a=>{a.observations.reverse();a.derived.reverse();a.formulas.reverse();a.transport.labels.reverse();
  a.documents[0].excerpts.reverse();a.documents[1].line_excerpts.reverse();rpc(a,'state',(req,res,requests,responses)=>{requests.reverse();responses.reverse();});}));
 assert.deepEqual(r.summary.derived.map(d=>d.value),['887366418788780481058004801','625118422482945460024898623',1,'20000000000000000000000000',1]);
});

const otherHash='0x'+'ab'.repeat(32),call=key=>ids[key];
const invalid=[
 ['archive identity changed',a=>a.id='uni-supply-composition-evidence-20261006-v2',/method\/archive version/],
 ['token target changed',a=>a.token='0x'+'1'.repeat(40),/target identity/],
 ['dead sink target changed',a=>a.addresses.dead_sink='0x'+'0'.repeat(40),/target identity/],
 ['future knowledge day',a=>a.as_of_date='2099-01-01',/cannot be in the future/],
 ['block after anchor retrieval',a=>a.anchor.effective_at='2026-10-06T13:40:00.000Z',/knowledge\/anchor chronology/],
 ['capture time differs from state receipt',a=>a.captured_at='2026-10-06T13:34:55.000Z',/state capture order/],
 ['state calls precede anchor capture',a=>a.transport.probe.received_at=a.transport.state.received_at,/state capture order/],
 ['request begins after receipt',a=>a.transport.probe.started_at='2026-10-06T13:34:54.000Z',/RPC transport chronology/],
 ['state endpoint changed',a=>a.transport.state.endpoint='https://example.com/rpc',/RPC endpoint/],
 ['invalid HTTP date',a=>a.transport.state.http_date='invalid',/HTTP Date/],
 ['HTTP date after receipt',a=>a.transport.probe.http_date='Tue, 06 Oct 2026 13:40:00 GMT',/HTTP Date/],
 ['wrong chain',a=>rpc(a,'probe',(req,res)=>res(1).result='0x5'),/chain mismatch/],
 ['latest instead of finalized request',a=>rpc(a,'probe',req=>req(2).params=['latest',false]),/finalized anchor requests/],
 ['anchor hash rewritten',a=>{a.anchor.hash=otherHash;a.anchor.selector.blockHash=otherHash;},/anchor header mismatch/],
 ['anchor number rewritten',a=>a.anchor.number='26133578',/anchor header mismatch/],
 ['selector hash differs from anchor',a=>a.anchor.selector.blockHash=otherHash,/anchor header mismatch/],
 ['block time does not decode',a=>a.anchor.effective_at='2026-10-06T13:17:12.000Z',/does not decode/],
 ['fixed header hash differs',a=>rpc(a,'state',(req,res)=>res(10).result.hash=otherHash),/fixed header recheck/],
 ['fixed header requested by number',a=>rpc(a,'state',req=>req(10).method='eth_getBlockByNumber'),/fixed header recheck/],
 ['height recheck hash differs',a=>rpc(a,'state',(req,res)=>res(21).result.hash=otherHash),/canonical height recheck/],
 ['height recheck points at header request',a=>a.anchor.height_recheck_response_id=10,/canonical height recheck/],
 ['height recheck label reused',a=>a.transport.labels.find(l=>l.id===21).label='anchor',/canonical height recheck/],
 ['call pinned to latest',a=>rpc(a,'state',req=>req(call('total_supply')).params[1]='latest'),/not pinned to canonical/],
 ['canonical requirement dropped',a=>rpc(a,'state',req=>req(call('decimals')).params[1]={blockHash:a.anchor.hash}),/not pinned to canonical/],
 ['different block hash in one call',a=>rpc(a,'state',req=>req(call('mint_cap')).params[1].blockHash=otherHash),/not pinned to canonical/],
 ['wrong contract target',a=>rpc(a,'state',req=>req(call('dead_sink_balance')).params[0].to=a.addresses.vesting),/selector\/contract\/arguments/],
 ['wrong selector',a=>rpc(a,'state',req=>req(call('total_supply')).params[0].data='0x313ce567'),/selector\/contract\/arguments/],
 ['balance argument substituted',a=>rpc(a,'state',req=>req(call('dead_sink_balance')).params[0].data='0x70a08231'+pad(a.addresses.timelock)),/selector\/contract\/arguments/],
 ['allowance owner and spender reversed',a=>rpc(a,'state',req=>req(call('vesting_allowance')).params[0].data='0xdd62ed3e'+pad(a.addresses.vesting)+pad(a.addresses.timelock)),/selector\/contract\/arguments/],
 ['extra call field',a=>rpc(a,'state',req=>req(call('minter')).params[0].from=a.addresses.timelock),/selector\/contract\/arguments/],
 ['balance labels swapped',a=>{const l=a.transport.labels,x=l.find(r=>r.label==='dead_sink_balance'),y=l.find(r=>r.label==='timelock_balance');[x.id,y.id]=[y.id,x.id];},/selector\/contract\/arguments/],
 ['RPC error response',a=>rpc(a,'state',(req,res)=>{const r=res(call('total_supply'));delete r.result;r.error={code:-32000,message:'x'};}),/RPC response ID\/error/],
 ['duplicate response ID',a=>rpc(a,'state',(req,res)=>res(call('decimals')).id=call('total_supply')),/Duplicate/],
 ['call removed',a=>rpc(a,'state',(req,res,requests,responses)=>{requests.pop();responses.pop();}),/RPC batch size/],
 ['short ABI word',a=>{rpc(a,'state',(req,res)=>res(call('decimals')).result='0x12');record(a,'decimals').response_word='0x12';},/ABI response word/],
 ['nonzero address padding',a=>{const w='0x1'+'0'.repeat(23)+a.addresses.timelock.slice(2);rpc(a,'state',(req,res)=>res(call('minter')).result=w);record(a,'minter').response_word=w;},/address padding/],
 ['uint8 overflow',a=>setValue(a,'decimals','256'),/exceeds declared width/],
 ['uint32 overflow',a=>setValue(a,'minimum_time_between_mints','4294967296'),/exceeds declared width/],
 ['value differs from response word',a=>record(a,'total_supply').value='1',/ABI\/result/],
 ['saved word differs from response',a=>record(a,'total_supply').response_word=word(5),/ABI\/result/],
 ['observation points at another response',a=>record(a,'dead_sink_balance').response_id=call('timelock_balance'),/ABI\/result/],
 ['block time record borrows a call word',a=>record(a,'block_timestamp').response_id=call('total_supply'),/ABI\/result/],
 ['observation key renamed',a=>record(a,'mint_cap').key='mint_limit',/Missing supported UNI supply observation/],
 ['observation unit changed',a=>record(a,'mint_cap').unit='count',/identity\/date\/source\/unit/],
 ['observation label changed',a=>record(a,'timelock_balance').label='流通供給',/identity\/date\/source\/unit/],
 ['observed time replaced by retrieval',a=>record(a,'total_supply').observed_at=a.captured_at,/identity\/date\/source\/unit/],
 ['point date moved',a=>record(a,'total_supply').period.end='2026-10-05',/identity\/date\/source\/unit/],
 ['document cited for a chain reading',a=>record(a,'total_supply').source_ids=[a.documents[0].source_id],/identity\/date\/source\/unit/],
 ['metric ID rewritten',a=>record(a,'timelock_balance').metric_id='uni.circulating_supply',/identity\/date\/source\/unit/],
 ['duplicate observation ID',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['document URL changed',a=>a.documents[0].url='https://example.com/technical-reference',/document endpoint\/source/],
 ['document retrieved after state capture',a=>a.documents[0].received_at='2026-10-06T13:35:00.000Z',/document chronology/],
 ['document HTTP date invalid',a=>a.documents[1].http_date='invalid',/document chronology/],
 ['date marker rewritten',a=>a.documents[0].date_modified_marker='"dateModified":"2026-10-01T00:00:00.000Z"',/address table date\/coverage/],
 ['Timelock excerpt missing',a=>a.documents[0].excerpts[1].label='Governor',/Missing UNI supply address table excerpt/],
 ['excerpt offsets inconsistent',a=>a.documents[0].excerpts[0].end+=1,/excerpt mismatch/],
 ['excerpt row relabelled',a=>{const e=a.documents[0].excerpts[1];e.html=e.html.replace('>Timelock</a>','>Governor</a>');},/excerpt mismatch/],
 ['document address differs from excerpt',a=>record(a,'timelock_address').value='0x'+'1'.repeat(40),/document address/],
 ['document address consistently replaced',a=>{const e=a.documents[0].excerpts[1],o=record(a,'timelock_address'),next='0x'+'1'.repeat(40);e.html=e.html.replaceAll(o.value,next);o.value=next;},/document address/],
 ['document record time replaced by block time',a=>record(a,'timelock_address').observed_at=a.anchor.effective_at,/document record identity/],
 ['document record excerpt swapped',a=>record(a,'timelock_address').excerpt_label='UNI Token',/document record identity/],
 ['source commit changed',a=>a.documents[1].commit='0'.repeat(40),/source commit/],
 ['source line rewritten',a=>a.documents[1].line_excerpts.find(l=>l.line===29).text='    uint8 public constant mintCap = 5;',/source line excerpt/],
 ['source line removed',a=>a.documents[1].line_excerpts.pop(),/source line excerpt/],
 ['duplicate source line',a=>a.documents[1].line_excerpts[1].line=a.documents[1].line_excerpts[0].line,/Duplicate/],
 ['formula operator rewritten',a=>a.formulas[0].expression.op='eval',/formula version\/definition/],
 ['formula inherited property operator',a=>a.formulas[0].expression.op='constructor',/formula version\/definition/],
 ['formula arguments reordered',a=>a.formulas[1].expression.args.reverse(),/formula version\/definition/],
 ['formula divisor changed',a=>a.formulas[3].expression.divisor='10',/formula version\/definition/],
 ['formula rationale reused',a=>a.formulas[0].rationale='流通供給',/formula version\/definition/],
 ['formula method source dropped',a=>a.formulas[1].method_source_ids.pop(),/formula version\/definition/],
 ['derived residual fabricated',a=>a.derived[0].value='1',/derived value\/lineage/],
 ['derived flag flipped',a=>a.derived[2].value=0,/derived value\/lineage/],
 ['derived dependency reordered',a=>a.derived[1].dependencies.reverse(),/derived value\/lineage/],
 ['derived time moved to retrieval',a=>a.derived[0].observed_at=a.captured_at,/derived value\/lineage/],
 ['derived ID rewritten',a=>a.derived[0].id='research.uni.circulating_supply@1',/derived value\/lineage/],
 ['derived formula duplicated',a=>a.derived[1].formula_id=a.derived[0].formula_id,/derived value\/lineage/],
 ['burn sink exceeds supply',a=>setValue(a,'dead_sink_balance','2000000000000000000000000000'),/subtraction is negative/],
 ['circulating supply filled',a=>a.context.circulating_supply='625118422482945460024898623',/Invalid UNI supply composition research/],
 ['market cap filled',a=>a.context.market_cap=1,/Invalid UNI supply composition research/],
 ['fixture promoted',a=>a.fixture=true,/Invalid UNI supply composition research/]
];
for(const [label,fn,pattern] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(fn)),pattern));

const [RPC,TABLE,CODE]=['ethereum-uni-supply-composition-20261006-v1','uniswap-governance-technical-reference-20260409-v1','uniswap-governance-uni-sol-ab22c08-v1'];
for(const [label,id,fn,pattern] of [
 ['RPC source tier',RPC,s=>s.tier=5,/Missing primary production UNI supply RPC source/],
 ['RPC source retrieval time',RPC,s=>s.retrieved_at='2026-10-06T13:34:55.000Z',/RPC source chronology\/endpoint/],
 ['RPC source endpoint',RPC,s=>s.url='https://example.com/rpc',/RPC source chronology\/endpoint/],
 ['RPC source published after knowledge',RPC,s=>s.date='2026-10-07',/RPC source chronology\/endpoint/],
 ['address table source tier',TABLE,s=>s.tier=3,/Missing primary UNI supply document source/],
 ['address table retrieval time',TABLE,s=>s.retrieved_at='2026-10-06T13:34:54.000Z',/document source chronology/],
 ['address table source date',TABLE,s=>s.date='2026-04-10',/address table date\/coverage/],
 ['address table coverage',TABLE,s=>s.covered_metrics=['UNI.identity'],/address table date\/coverage/],
 ['source code URL',CODE,s=>s.url='https://raw.githubusercontent.com/Uniswap/governance/master/contracts/Uni.sol',/Missing primary UNI supply document source/]])
 test(`UNI supply reader rejects changed saved ${label}`,()=>{
  const project=structuredClone(p);fn(project.sources.find(s=>s.id===id));assert.throws(()=>inspect(bytes,project),pattern);
 });

test('UNI supply reader rejects missing saved sources',()=>{
 for(const [id,pattern] of [[RPC,/Missing primary production UNI supply RPC source/],[CODE,/Missing primary UNI supply document source/]]) {
  const project=structuredClone(p);project.sources=project.sources.filter(s=>s.id!==id);assert.throws(()=>inspect(bytes,project),pattern);
 }
});

test('manual CLI requires production and digest; failures have no stdout or file/history writes',()=>{
 const before=fingerprint(readSnapshots(p.root,p.mode)),run=(...args)=>spawnSync(process.execPath,['cli.js','uni-supply-composition-review',...args],{encoding:'utf8'});
 const good=run(file,'--production','--digest',digest(bytes));assert.equal(good.status,0,good.stderr);
 const out=JSON.parse(good.stdout);assert.equal(out.summary.observations,13);assert.equal(out.summary.derived[1].value,'625118422482945460024898623');
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)],['--production','--digest',digest(bytes)]]){
  const r=run(...args);assert.equal(r.status,1);assert.equal(r.stdout,'');
 }
 assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});

test('reader rejects fixture and object inputs before issuing research conclusions',()=>{
 assert.throws(()=>reviewUniSupplyComposition(loadProject('fixture'),bytes,digest(bytes)),/requires production/);
 assert.throws(()=>reviewUniSupplyComposition(p,a,digest(bytes)),/raw JSON bytes/);
 assert.throws(()=>reviewUniSupplyComposition(p,bytes,'de66eac4'),/reviewed SHA-256/);
});
