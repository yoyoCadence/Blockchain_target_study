import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='uni-firepit-state-20261006'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync('data/research/uni-firepit-state-2026-10-06-v1.json'),a=JSON.parse(raw);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),pad=address=>address.slice(2).padStart(64,'0');
const record=key=>a.observations.find(o=>o.key===key);

test('Firepit state preserves exact bytes, finalized anchor and canonical-pinned raw RPC responses',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/uni-firepit-state-2026-10-06.yaml'));
 assert.equal(hash(raw),'41c8fcb16267e1b068aea59f8675bcd27a913d1a52c3d5ed2602034e71a0e6f9');assert.ok(event.reason.includes(hash(raw)));
 assert.equal(a.fixture,false);assert.equal(a.version,1);assert.equal(saved.parent_id,previous.id);
 const {probe,state,labels}=a.transport,probeBody=JSON.parse(probe.response_json),stateBody=JSON.parse(state.response_json);
 assert.equal(probeBody.find(r=>r.id===1).result,'0x1');assert.deepEqual(JSON.parse(probe.request_json).find(r=>r.id===2).params,['finalized',false]);
 const finalized=probeBody.find(r=>r.id===2).result,header=stateBody.find(r=>r.id===10).result,height=stateBody.find(r=>r.id===20).result;
 for(const block of [finalized,header,height])assert.equal(block.hash,a.anchor.hash);
 assert.equal(a.anchor.number,'26133926');assert.equal(BigInt(header.number).toString(),a.anchor.number);assert.equal(header.timestamp,a.anchor.timestamp_hex);
 assert.equal(new Date(Number(BigInt(header.timestamp))*1000).toISOString(),a.anchor.effective_at);assert.equal(a.anchor.effective_at,'2026-10-06T14:27:35.000Z');
 assert.ok(Date.parse(a.anchor.effective_at)<=Date.parse(probe.started_at));assert.ok(Date.parse(probe.received_at)<=Date.parse(state.started_at));
 assert.equal(a.captured_at,state.received_at);assert.ok(Date.parse(state.received_at)<=Date.parse(event.research_review.reviewed_at));
 const requests=JSON.parse(state.request_json),calls=requests.filter(r=>r.method==='eth_call');
 assert.equal(calls.length,9);assert.equal(new Set(requests.map(r=>r.id)).size,requests.length);
 assert.deepEqual(new Set(labels.map(l=>l.id)),new Set([1,2,...requests.map(r=>r.id)]));
 assert.ok(calls.every(r=>JSON.stringify(r.params[1])===JSON.stringify({blockHash:a.anchor.hash,requireCanonical:true})));
 assert.deepEqual(requests.find(r=>r.id===20).params,[a.anchor.number_hex,false]);
 // Selectors computed with keccak-256 during capture; pinned here as literals.
 const calldata={nonce:['firepit','0xaffed0e0'],threshold:['firepit','0x42cde4e8'],threshold_setter:['firepit','0xf2380828'],owner:['firepit','0x8da5cb5b'],
  resource:['firepit','0x2b3ed84e'],resource_recipient:['firepit','0xec0fa86d'],token_jar:['firepit','0xe0ef2b4b'],max_release_length:['firepit','0xa71c3fa6'],
  dead_sink_balance:['token','0x70a08231'+pad(a.targets.dead_sink)]};
 for(const [key,[target,data]] of Object.entries(calldata)) {
  const o=record(key),request=requests.find(r=>r.id===o.response_id),response=stateBody.find(r=>r.id===o.response_id);
  assert.deepEqual(request.params[0],{to:a.targets[target],data});assert.equal(labels.find(l=>l.id===o.response_id).label,key);
  assert.equal(response.result,o.response_word);assert.match(o.response_word,/^0x[0-9a-f]{64}$/);
  assert.equal(o.value,o.abi_type==='address'?'0x'+o.response_word.slice(26):BigInt(o.response_word).toString());
  assert.equal(o.observed_at,a.anchor.effective_at);assert.deepEqual(o.period,{basis:'point',end:'2026-10-06'});assert.deepEqual(o.source_ids,a.anchor.source_ids);
 }
 assert.equal(record('nonce').value,'1395');assert.equal(record('threshold').value,'4000000000000000000000');
 assert.equal(record('resource').value,a.targets.token);assert.equal(record('resource_recipient').value,a.targets.dead_sink);assert.equal(record('token_jar').value,a.targets.token_jar);
 assert.equal(record('owner').value,'0x1a9c8182c09f50c8318d769245bea52c32be35bc');assert.equal(record('threshold_setter').value,record('owner').value);
 assert.equal(record('max_release_length').value,'20');assert.equal(record('dead_sink_balance').value,'112633581211219518941995199');
 assert.equal(record('block_timestamp').response_word,header.timestamp);
 assert.equal(a.observations.length,12);assert.equal(new Set(a.observations.map(o=>o.id)).size,12);
 assert.ok(a.observations.every(o=>o.classification==='OBSERVED'&&o.fixture===false&&o.confidence==='medium'&&o.as_of_date===a.as_of_date&&typeof o.value==='string'));
});

test('pinned README deployment rows and source lines support Firepit identity, nonce and threshold semantics',()=>{
 const doc=key=>a.documents.find(d=>d.key===key),line=(key,n)=>doc(key).line_excerpts.find(l=>l.line===n).text;
 assert.deepEqual(a.documents.map(d=>d.key),['readme','firepit','exchange_releaser','nonce','resource_manager']);
 for(const d of a.documents) {
  assert.equal(d.commit,'8604e4b9aed88bdd6be3a322e19722c40f94be2c');assert.ok(d.url.startsWith(`https://raw.githubusercontent.com/Uniswap/protocol-fees/${d.commit}/`));
  assert.equal(d.http_status,200);assert.match(d.body_sha256,/^[0-9a-f]{64}$/);assert.equal(d.body_replayable,false);
  assert.ok(Date.parse(d.started_at)<=Date.parse(d.received_at)&&Date.parse(d.received_at)<=Date.parse(a.captured_at));
 }
 for(const [key,n,label,target] of [['token_jar_address',222,'| TokenJar |','token_jar'],['firepit_address',223,'| Releaser (Firepit) |','firepit']]) {
  const o=record(key),text=line('readme',n);assert.ok(text.startsWith(label));assert.ok(text.includes(`[\`${o.value}\`]`));assert.ok(text.includes(`/address/${o.value})`));
  assert.equal(o.value.toLowerCase(),a.targets[target]);assert.equal(o.excerpt_line,n);assert.equal(o.document_key,'readme');
  assert.deepEqual(o.source_ids,[doc('readme').source_id]);assert.equal(o.observed_at,doc('readme').received_at);
 }
 assert.match(line('firepit',10),/address\(0xdead\)/);assert.match(line('exchange_releaser',47),/handleNonce\(_nonce\)/);
 assert.match(line('exchange_releaser',50),/RESOURCE\.safeTransferFrom\(msg\.sender, RESOURCE_RECIPIENT, threshold\);/);
 assert.match(line('exchange_releaser',28),/MAX_RELEASE_LENGTH = 20;/);assert.match(line('nonce',22),/_nonce == nonce/);assert.match(line('nonce',24),/\+\+nonce;/);
 assert.match(line('resource_manager',45),/function setThreshold\(uint256 _threshold\) external onlyThresholdSetter/);assert.match(line('resource_manager',46),/threshold = _threshold;/);
 for(const field of ['threshold_history','cumulative_firepit_payment','dead_sink_balance_attribution','l2_bridged_burns','released_asset_values_usd',
  'fee_origin_attribution','annualized_burn','synchronized_price','deployment_source_equivalence'])assert.equal(a.context[field],null);
});

test('four research products and comparisons replay with BigInt and exact dependencies without annualizing',()=>{
 const byId=new Map(a.observations.map(o=>[o.id,o])),value=id=>BigInt(byId.get(id).value);
 const replay={mul_raw_uint256:([x,y])=>(value(x)*value(y)).toString(),sub_mul_raw_uint256:([x,y,z])=>(value(x)-value(y)*value(z)).toString(),
  casefold_evm_address_eq:([x,y])=>byId.get(x).value.toLowerCase()===byId.get(y).value.toLowerCase()?1:0};
 assert.equal(a.formulas.length,4);assert.equal(a.derived.length,4);
 a.formulas.forEach((f,i)=>{
  const d=a.derived[i];assert.equal(f.version,1);assert.ok(f.rationale);assert.ok(f.method_source_ids.length>0&&f.method_source_ids.every(id=>a.documents.some(doc=>doc.source_id===id)));
  assert.equal(d.formula_id,f.id);assert.equal(d.formula_version,1);assert.equal(d.classification,'DERIVED');assert.deepEqual(d.dependencies,f.expression.args);
  assert.ok(d.dependencies.every(id=>byId.has(id)));assert.equal(d.value,replay[f.expression.op](f.expression.args));assert.equal(d.unit,f.unit);
 });
 assert.deepEqual(a.derived.map(d=>d.value),['5580000000000000000000000','107053581211219518941995199',1,1]);
 assert.ok(a.limitations.some(l=>l.includes('門檻歷史未查證')));assert.ok(a.limitations.some(l=>l.includes('不年化')));
});

test('Firepit state is a source-only append that keeps finance, thesis, history, catalog and Fixture unchanged',()=>{
 const event=saved.event;assert.deepEqual(event.updates,[]);assert.equal(event.type,'token_burn');assert.equal(event.status,'completed');
 assert.deepEqual(event.source_ids,event.sources.map(s=>s.id));assert.equal(saved.sources.length,previous.sources.length+6);
 for(const s of previous.sources)assert.deepEqual(saved.sources.find(next=>next.id===s.id),s);
 const retrieval={[a.anchor.source_ids[0]]:[a.captured_at,a.transport.state.endpoint],...Object.fromEntries(a.documents.map(d=>[d.source_id,[d.received_at,d.url]]))};
 for(const s of event.sources){assert.deepEqual([s.retrieved_at,s.url],retrieval[s.id]);assert.equal(s.fixture,false);assert.ok(s.tier<=2);assert.ok(s.date<=a.as_of_date);}
 assert.equal(event.sources.filter(s=>s.tier===1).length,1);assert.ok(event.sources.filter(s=>s.tier===2).every(s=>s.date==='2025-12-18'));
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])
  assert.deepEqual(saved[field],previous[field]);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);assert.equal(saved.period.end,'2026-10-04');
 for(const id of ['uni.crypto_fees','uni.gross_accrual','uni.net_accrual','uni.net_burn_yield','uni.market_cap'])assert.equal(saved.metrics[id].value,null);
 const before=fingerprint(history);
 const replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},{history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 for(const snapshot of history)verifySnapshot(snapshot);
 const inspected=inspectResearch(p),entry=inspected.events.find(e=>e.id===event.id);
 assert.equal(entry.recorded_update_count,0);assert.deepEqual(entry.sources,event.sources);
 assert.equal(inspected.records.find(r=>r.kind==='uni_firepit_state').artifact_id,hash(raw));
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
