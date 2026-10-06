import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {validateSchema} from '../../engine/validation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewUniFirepitState} from '../../engine/research/firepit-state.js';

const file='data/research/uni-firepit-state-2026-10-06-v1.json',bytes=fs.readFileSync(file),a=JSON.parse(bytes),p=loadProject('production');
const schema=readYaml('spec/uni-firepit-state-schema.yaml'),method=readYaml('spec/uni-firepit-state-method.yaml');
const digest=b=>createHash('sha256').update(b).digest('hex'),inspect=(b,project=p)=>reviewUniFirepitState(project,b,digest(b));
const changed=fn=>{const copy=structuredClone(a);fn(copy);return Buffer.from(JSON.stringify(copy));};
// Edit one saved RPC batch as parsed requests/responses and write the exact strings back.
const rpc=(a,section,fn)=>{const t=a.transport[section],requests=JSON.parse(t.request_json),responses=JSON.parse(t.response_json);
 fn(id=>requests.find(r=>r.id===id),id=>responses.find(r=>r.id===id),requests,responses);t.request_json=JSON.stringify(requests);t.response_json=JSON.stringify(responses);};
const record=(a,key)=>a.observations.find(o=>o.key===key),word=n=>'0x'+BigInt(n).toString(16).padStart(64,'0');
// Change one on-chain reading consistently in the response, the saved word and the decoded value.
const setValue=(a,key,value)=>{const o=record(a,key),w=o.abi_type==='address'?'0x'+'0'.repeat(24)+value.slice(2):word(value);
 rpc(a,'state',(req,res)=>res(o.response_id).result=w);o.response_word=w;o.value=String(value);};
const derived=(a,name)=>a.derived.find(d=>d.formula_id.endsWith(name)),doc=(a,key)=>a.documents.find(d=>d.key===key);
const ids=Object.fromEntries(a.transport.labels.map(l=>[l.label,l.id])),DEAD=BigInt(record(a,'dead_sink_balance').value),pad=address=>address.slice(2).padStart(64,'0');
const baseline=['5580000000000000000000000','107053581211219518941995199',1,1];

test('schema and method v1 accept the saved archive and reproduce every saved call, label and line',()=>{
 validateSchema(schema,a,'UNI Firepit state research');validateSchema(schema.definitions.method,method,'UNI Firepit state method');
 assert.equal(method.archive_id,a.id);assert.deepEqual(method.targets,a.targets);assert.deepEqual(method.formulas,a.formulas);
 assert.deepEqual(Object.keys(method.derived_labels).sort(),a.formulas.map(f=>f.id).sort());
 const requests=JSON.parse(a.transport.state.request_json);
 for(const [key,type,signature,selector,target,args,unit,label] of method.getters) {
  const o=record(a,key),request=requests.find(r=>r.id===o.response_id);
  assert.deepEqual(request.params[0],{to:method.targets[target],data:selector+args.map(name=>pad(method.targets[name])).join('')},key);
  assert.equal(o.abi_type,type);assert.equal(o.unit,unit);assert.equal(o.label,label);assert.match(signature,/^[A-Za-z_]+\((address)?\)$/);
 }
 for(const rule of method.documents) {
  const d=doc(a,rule.key);assert.equal(d.url,rule.url);assert.equal(d.source_id,rule.source_id);assert.equal(d.commit,method.commit);
  assert.deepEqual(d.line_excerpts.map(l=>l.line),rule.lines.map(([line])=>line));
  for(const [line,fragment] of rule.lines)assert.ok(d.line_excerpts.find(l=>l.line===line).text.includes(fragment),`${rule.key} ${line}`);
 }
});

test('Firepit reader replays exact raw readings, document identity and derived checks without changing files or economics',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),r=inspect(bytes);
 assert.equal(r.sha256,'41c8fcb16267e1b068aea59f8675bcd27a913d1a52c3d5ed2602034e71a0e6f9');
 assert.equal(r.persisted,false);assert.equal(r.financial_inputs_updated,false);assert.equal(r.promoted,false);
 assert.equal(r.method.id,'uni-firepit-state-review');assert.equal(r.method.version,1);assert.equal(r.method.source_ids.length,6);
 assert.deepEqual(r.full_archive,a);assert.equal(r.summary.observations,12);assert.equal(r.summary.block_number,'26133926');
 assert.equal(r.summary.block_time,'2026-10-06T14:27:35.000Z');assert.equal(r.summary.retrieved_at,'2026-10-06T14:43:40.447Z');
 const value=key=>r.summary.values.find(v=>v.key===key).value;
 assert.equal(value('nonce'),'1395');assert.equal(value('threshold'),'4000000000000000000000');assert.equal(value('dead_sink_balance'),'112633581211219518941995199');
 assert.equal(value('resource_recipient'),'0x000000000000000000000000000000000000dead');assert.equal(value('firepit_address'),'0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721');
 assert.ok(r.summary.values.every(v=>typeof v.value==='string'&&v.classification==='OBSERVED'&&v.confidence==='medium'));
 assert.deepEqual(r.summary.derived.map(d=>d.value),baseline);assert.deepEqual(r.summary.derived.map(d=>d.dependencies),a.derived.map(d=>d.dependencies));
 assert.ok(r.summary.derived.every(d=>d.classification==='DERIVED'&&d.formula_version===1&&/[一-鿿]/u.test(d.label)));
 assert.deepEqual(r.summary.documents.map(d=>d.key),['readme','firepit','exchange_releaser','nonce','resource_manager']);
 assert.ok(r.summary.documents.every(d=>d.body_replayable===false&&d.commit===r.summary.commit));assert.equal(r.summary.commit_date,'2025-12-18');
 assert.equal(Object.keys(r.summary.unknown).length,9);assert.ok(Object.values(r.summary.unknown).every(v=>v===null));
 assert.ok(r.summary.limitations.some(l=>l.includes('不年化')));
 r.full_archive.observations[0].value='mutated';assert.deepEqual(fs.readFileSync(file),bytes);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

test('a different release count or threshold replays a new product and residual without annualizing',()=>{
 const count=changed(a=>{setValue(a,'nonce','1396');derived(a,'nonce_times_threshold').value='5584000000000000000000000';
  derived(a,'dead_balance_minus_product').value=(DEAD-5584000000000000000000000n).toString();});
 assert.deepEqual(inspect(count).summary.derived.slice(0,2).map(d=>d.value),['5584000000000000000000000',(DEAD-5584000000000000000000000n).toString()]);
 const threshold=changed(a=>{setValue(a,'threshold','1');derived(a,'nonce_times_threshold').value='1395';derived(a,'dead_balance_minus_product').value=(DEAD-1395n).toString();});
 const r=inspect(threshold);assert.equal(r.summary.derived[0].value,'1395');assert.equal(r.summary.unknown.annualized_burn,null);assert.equal(r.summary.unknown.threshold_history,null);
});

test('a different TokenJar or threshold setter stays an observed zero flag, not an error or conclusion',()=>{
 const jar=changed(a=>{setValue(a,'token_jar','0x'+'1'.repeat(40));derived(a,'token_jar_matches_docs').value=0;});
 assert.equal(inspect(jar).summary.derived[2].value,0);
 const setter=changed(a=>{setValue(a,'threshold_setter','0x'+'2'.repeat(40));derived(a,'threshold_setter_matches_owner').value=0;});
 assert.equal(inspect(setter).summary.derived[3].value,0);
});

test('record, formula, label, response and document order may change while IDs and meaning remain fixed',()=>{
 const r=inspect(changed(a=>{a.observations.reverse();a.derived.reverse();a.formulas.reverse();a.transport.labels.reverse();a.documents.reverse();
  for(const d of a.documents)d.line_excerpts.reverse();rpc(a,'state',(req,res,requests,responses)=>{requests.reverse();responses.reverse();});}));
 assert.deepEqual(r.summary.derived.map(d=>d.value),baseline);
});

const otherHash='0x'+'ab'.repeat(32),call=key=>ids[key],line=(a,key,n)=>doc(a,key).line_excerpts.find(l=>l.line===n);
const invalid=[
 ['archive identity changed',a=>a.id='uni-firepit-state-evidence-20261006-v2',/method\/archive version/],
 ['Firepit target changed',a=>a.targets.firepit='0x'+'1'.repeat(40),/target identity/],
 ['future knowledge day',a=>a.as_of_date='2099-01-01',/cannot be in the future/],
 ['block after anchor retrieval',a=>a.anchor.effective_at='2026-10-06T14:50:00.000Z',/knowledge\/anchor chronology/],
 ['capture time differs from state receipt',a=>a.captured_at='2026-10-06T14:43:41.000Z',/state capture order/],
 ['state calls precede anchor capture',a=>a.transport.probe.received_at=a.transport.state.received_at,/state capture order/],
 ['request begins after receipt',a=>a.transport.probe.started_at='2026-10-06T14:43:40.400Z',/RPC transport chronology/],
 ['state endpoint changed',a=>a.transport.state.endpoint='https://example.com/rpc',/RPC endpoint/],
 ['invalid HTTP date',a=>a.transport.state.http_date='invalid',/HTTP Date/],
 ['wrong chain',a=>rpc(a,'probe',(req,res)=>res(1).result='0x82'),/chain mismatch/],
 ['latest instead of finalized request',a=>rpc(a,'probe',req=>req(2).params=['latest',false]),/finalized anchor requests/],
 ['anchor hash rewritten',a=>{a.anchor.hash=otherHash;a.anchor.selector.blockHash=otherHash;},/anchor header mismatch/],
 ['block time does not decode',a=>a.anchor.effective_at='2026-10-06T14:27:36.000Z',/does not decode/],
 ['fixed header hash differs',a=>rpc(a,'state',(req,res)=>res(10).result.hash=otherHash),/fixed header recheck/],
 ['height recheck hash differs',a=>rpc(a,'state',(req,res)=>res(20).result.hash=otherHash),/canonical height recheck/],
 ['call pinned to latest',a=>rpc(a,'state',req=>req(call('nonce')).params[1]='latest'),/not pinned to canonical/],
 ['canonical requirement dropped',a=>rpc(a,'state',req=>req(call('threshold')).params[1]={blockHash:a.anchor.hash}),/not pinned to canonical/],
 ['nonce read from another contract',a=>rpc(a,'state',req=>req(call('nonce')).params[0].to=a.targets.token_jar),/selector\/contract\/arguments/],
 ['balance read from Firepit instead of UNI',a=>rpc(a,'state',req=>req(call('dead_sink_balance')).params[0].to=a.targets.firepit),/selector\/contract\/arguments/],
 ['wrong selector',a=>rpc(a,'state',req=>req(call('threshold')).params[0].data='0xaffed0e0'),/selector\/contract\/arguments/],
 ['balance holder substituted',a=>rpc(a,'state',req=>req(call('dead_sink_balance')).params[0].data='0x70a08231'+pad(a.targets.token_jar)),/selector\/contract\/arguments/],
 ['nonce and threshold labels swapped',a=>{const l=a.transport.labels,x=l.find(r=>r.label==='nonce'),y=l.find(r=>r.label==='threshold');[x.id,y.id]=[y.id,x.id];},/selector\/contract\/arguments/],
 ['RPC error response',a=>rpc(a,'state',(req,res)=>{const r=res(call('nonce'));delete r.result;r.error={code:-32000,message:'x'};}),/RPC response ID\/error/],
 ['call removed',a=>rpc(a,'state',(req,res,requests,responses)=>{requests.pop();responses.pop();}),/RPC batch size/],
 ['short ABI word',a=>{rpc(a,'state',(req,res)=>res(call('nonce')).result='0x0573');record(a,'nonce').response_word='0x0573';},/ABI response word/],
 ['nonzero address padding',a=>{const w='0x1'+'0'.repeat(23)+a.targets.token_jar.slice(2);rpc(a,'state',(req,res)=>res(call('token_jar')).result=w);record(a,'token_jar').response_word=w;},/address padding/],
 ['value differs from response word',a=>record(a,'nonce').value='1396',/ABI\/result/],
 ['observation points at another response',a=>record(a,'nonce').response_id=call('max_release_length'),/ABI\/result/],
 ['observation key renamed',a=>record(a,'threshold').key='burn_per_release',/Missing supported UNI Firepit observation/],
 ['count relabelled as UNI amount',a=>record(a,'nonce').unit='UNI raw base units',/identity\/date\/source\/unit/],
 ['observation label changed',a=>record(a,'nonce').label='年度銷毀次數',/identity\/date\/source\/unit/],
 ['observed time replaced by retrieval',a=>record(a,'nonce').observed_at=a.captured_at,/identity\/date\/source\/unit/],
 ['metric ID rewritten',a=>record(a,'threshold').metric_id='uni.annual_burn',/identity\/date\/source\/unit/],
 ['duplicate observation ID',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['resource is not UNI',a=>setValue(a,'resource','0x'+'3'.repeat(40)),/immutable identity/],
 ['recipient is not the dead sink',a=>setValue(a,'resource_recipient',a.targets.token_jar),/immutable identity/],
 ['document key duplicated',a=>doc(a,'nonce').key='firepit',/Duplicate/],
 ['document URL changed',a=>doc(a,'readme').url='https://example.com/README.md',/document endpoint\/source/],
 ['document retrieved after state capture',a=>doc(a,'nonce').received_at='2026-10-06T14:44:00.000Z',/document chronology/],
 ['document commit changed',a=>doc(a,'firepit').commit='0'.repeat(40),/source commit\/date\/coverage/],
 ['recipient line rewritten',a=>line(a,'firepit',10).text='    ExchangeReleaser(_resource, _threshold, _tokenJar, _recipient)',/source line excerpt/],
 ['payment line rewritten',a=>line(a,'exchange_releaser',50).text='    RESOURCE.safeTransferFrom(msg.sender, RESOURCE_RECIPIENT, 0);',/source line excerpt/],
 ['nonce increment line removed',a=>doc(a,'nonce').line_excerpts.pop(),/source line excerpt/],
 ['duplicate source line',a=>{const l=doc(a,'resource_manager').line_excerpts;l[1].line=l[0].line;},/Duplicate/],
 ['README address differs from row',a=>record(a,'firepit_address').value='0x'+'1'.repeat(40),/document address/],
 ['README record points at the other row',a=>record(a,'firepit_address').excerpt_line=222,/document record identity/],
 ['README record time replaced by block time',a=>record(a,'token_jar_address').observed_at=a.anchor.effective_at,/document record identity/],
 ['README row consistently replaced',a=>{const o=record(a,'firepit_address'),next='0x'+'4'.repeat(40),l=line(a,'readme',223);l.text=l.text.replaceAll(o.value,next);o.value=next;},/source line excerpt/],
 ['formula operator rewritten',a=>a.formulas[0].expression.op='eval',/formula version\/definition/],
 ['formula arguments reordered',a=>a.formulas[1].expression.args.reverse(),/formula version\/definition/],
 ['formula rationale reused',a=>a.formulas[0].rationale='年度 burn',/formula version\/definition/],
 ['formula method source dropped',a=>a.formulas[0].method_source_ids.pop(),/formula version\/definition/],
 ['product fabricated',a=>a.derived[0].value='112633581211219518941995199',/derived value\/lineage/],
 ['residual set to zero',a=>a.derived[1].value='0',/derived value\/lineage/],
 ['flag flipped',a=>a.derived[2].value=0,/derived value\/lineage/],
 ['derived dependency reordered',a=>a.derived[0].dependencies.reverse(),/derived value\/lineage/],
 ['derived ID rewritten',a=>a.derived[0].id='research.uni.annual_burn@1',/derived value\/lineage/],
 ['product exceeds dead balance',a=>{setValue(a,'nonce','100000000');derived(a,'nonce_times_threshold').value='400000000000000000000000000000';},/subtraction is negative/],
 ['threshold history filled',a=>a.context.threshold_history=[],/Invalid UNI Firepit state research/],
 ['annualized burn filled',a=>a.context.annualized_burn='7250000',/Invalid UNI Firepit state research/],
 ['cumulative payment claimed',a=>a.context.cumulative_firepit_payment='5580000000000000000000000',/Invalid UNI Firepit state research/],
 ['RPC record also claims a README line',a=>record(a,'nonce').excerpt_line=222,/Invalid UNI Firepit state research/],
 ['fractional derived value',a=>a.derived[0].value='5580000.5',/Invalid UNI Firepit state research/],
 ['fixture promoted',a=>a.fixture=true,/Invalid UNI Firepit state research/]
];
for(const [label,fn,pattern] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(fn)),pattern));

const RPC=a.anchor.source_ids[0],README=doc(a,'readme').source_id,NONCE=doc(a,'nonce').source_id;
for(const [label,id,fn,pattern] of [
 ['RPC source tier',RPC,s=>s.tier=5,/Missing primary production UNI Firepit RPC source/],
 ['RPC source retrieval time',RPC,s=>s.retrieved_at='2026-10-06T14:43:41.000Z',/RPC source chronology\/endpoint/],
 ['RPC source endpoint',RPC,s=>s.url='https://example.com/rpc',/RPC source chronology\/endpoint/],
 ['README source tier',README,s=>s.tier=3,/Missing primary UNI Firepit document source/],
 ['README source retrieval time',README,s=>s.retrieved_at='2026-10-06T14:43:39.000Z',/document source chronology/],
 ['README source date',README,s=>s.date='2025-12-19',/source commit\/date\/coverage/],
 ['README source coverage',README,s=>s.covered_metrics=['UNI.identity'],/source commit\/date\/coverage/],
 ['Nonce source URL',NONCE,s=>s.url=s.url.replace('8604e4b9aed88bdd6be3a322e19722c40f94be2c','main'),/Missing primary UNI Firepit document source/]])
 test(`Firepit reader rejects changed saved ${label}`,()=>{
  const project=structuredClone(p);fn(project.sources.find(s=>s.id===id));assert.throws(()=>inspect(bytes,project),pattern);
 });

test('Firepit reader rejects missing saved sources',()=>{
 for(const [id,pattern] of [[RPC,/Missing primary production UNI Firepit RPC source/],[NONCE,/Missing primary UNI Firepit document source/]]) {
  const project=structuredClone(p);project.sources=project.sources.filter(s=>s.id!==id);assert.throws(()=>inspect(bytes,project),pattern);
 }
});

for(const [label,fn] of [['wrong method id',m=>m.id='uni-firepit-review'],['short selector',m=>m.getters[0][3]='0xaffed0'],['unknown contract target',m=>m.getters[0][4]='token_jar'],
 ['getter removed',m=>m.getters.pop()],['identity rule dropped',m=>m.required_identities.pop()],['short commit',m=>m.commit='8604e4b'],['extra method field',m=>m.annualization='365/281']])
 test(`method schema rejects ${label}`,()=>{
  const copy=structuredClone(method);fn(copy);assert.throws(()=>validateSchema(schema.definitions.method,copy,'UNI Firepit state method'),/Invalid UNI Firepit state method/);
 });

test('manual CLI requires production and digest; failures have no stdout or file/history writes',()=>{
 const before=fingerprint(readSnapshots(p.root,p.mode)),run=(...args)=>spawnSync(process.execPath,['cli.js','uni-firepit-state-review',...args],{encoding:'utf8'});
 const good=run(file,'--production','--digest',digest(bytes));assert.equal(good.status,0,good.stderr);
 const out=JSON.parse(good.stdout);assert.equal(out.summary.observations,12);assert.equal(out.summary.derived[0].value,'5580000000000000000000000');
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)],['--production','--digest',digest(bytes)]]){
  const r=run(...args);assert.equal(r.status,1);assert.equal(r.stdout,'');
 }
 assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});

test('reader rejects fixture and object inputs before issuing research conclusions',()=>{
 assert.throws(()=>reviewUniFirepitState(loadProject('fixture'),bytes,digest(bytes)),/requires production/);
 assert.throws(()=>reviewUniFirepitState(p,a,digest(bytes)),/raw JSON bytes/);
 assert.throws(()=>reviewUniFirepitState(p,bytes,'41c8fcb1'),/reviewed SHA-256/);
});
