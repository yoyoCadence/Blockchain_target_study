import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {sourceFreshness} from '../../engine/research/freshness.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='uni-supply-composition-20261006'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync('data/research/uni-supply-composition-2026-10-06-v1.json'),a=JSON.parse(raw);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const pad=address=>address.slice(2).toLowerCase().padStart(64,'0');
const record=key=>a.observations.find(o=>o.key===key);

test('UNI supply composition preserves exact bytes, finalized anchor and canonical-pinned raw RPC responses',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/uni-supply-composition-2026-10-06.yaml'));
 assert.equal(hash(raw),'de66eac4f1d0beda86dc04ee0e129162b4b7ecd29072b666682733da482f2de1');assert.ok(event.reason.includes(hash(raw)));
 assert.equal(a.fixture,false);assert.equal(a.version,1);assert.equal(saved.parent_id,previous.id);
 const {probe,state,labels}=a.transport,probeBody=JSON.parse(probe.response_json),stateBody=JSON.parse(state.response_json);
 assert.equal(probeBody.find(r=>r.id===1).result,'0x1');
 const finalized=probeBody.find(r=>r.id===2).result,header=stateBody.find(r=>r.id===10).result,height=stateBody.find(r=>r.id===21).result;
 assert.deepEqual(JSON.parse(probe.request_json).find(r=>r.id===2).params,['finalized',false]);
 for(const block of [finalized,header,height])assert.equal(block.hash,a.anchor.hash);
 assert.equal(header.number,a.anchor.number_hex);assert.equal(BigInt(header.number).toString(),a.anchor.number);assert.equal(header.timestamp,a.anchor.timestamp_hex);
 assert.equal(new Date(Number(BigInt(header.timestamp))*1000).toISOString(),a.anchor.effective_at);
 assert.ok(Date.parse(a.anchor.effective_at)<=Date.parse(probe.started_at));
 for(const t of [probe,state])assert.ok(Date.parse(t.started_at)<=Date.parse(t.received_at));
 assert.ok(Date.parse(probe.received_at)<=Date.parse(state.started_at));assert.equal(a.captured_at,state.received_at);
 assert.ok(Date.parse(state.received_at)<=Date.parse(event.research_review.reviewed_at));
 const requests=JSON.parse(state.request_json),calls=requests.filter(r=>r.method==='eth_call');
 assert.equal(calls.length,10);assert.equal(new Set(requests.map(r=>r.id)).size,requests.length);
 assert.deepEqual(new Set(labels.map(l=>l.id)),new Set([1,2,...requests.map(r=>r.id)]));
 assert.ok(calls.every(r=>r.params[0].to===a.token&&JSON.stringify(r.params[1])===JSON.stringify({blockHash:a.anchor.hash,requireCanonical:true})));
 assert.deepEqual(requests.find(r=>r.id===21).params,[a.anchor.number_hex,false]);
 const calldata={total_supply:'0x18160ddd',decimals:'0x313ce567',dead_sink_balance:'0x70a08231'+pad(a.addresses.dead_sink),
  timelock_balance:'0x70a08231'+pad(a.addresses.timelock),vesting_balance:'0x70a08231'+pad(a.addresses.vesting),
  vesting_allowance:'0xdd62ed3e'+pad(a.addresses.timelock)+pad(a.addresses.vesting),minter:'0x07546172',
  minting_allowed_after:'0x30b36cef',mint_cap:'0x76c71ca1',minimum_time_between_mints:'0x5c11d62f'};
 for(const [key,data] of Object.entries(calldata)) {
  const o=record(key),request=requests.find(r=>r.id===o.response_id),response=stateBody.find(r=>r.id===o.response_id);
  assert.equal(request.params[0].data,data);assert.equal(labels.find(l=>l.id===o.response_id).label,key);
  assert.equal(response.result,o.response_word);assert.match(o.response_word,/^0x[0-9a-f]{64}$/);
  assert.equal(o.value,o.abi_type==='address'?'0x'+o.response_word.slice(26):BigInt(o.response_word).toString());
  assert.equal(o.observed_at,a.anchor.effective_at);assert.deepEqual(o.period,{basis:'point',end:a.anchor.effective_at.slice(0,10)});
  assert.deepEqual(o.source_ids,[a.anchor.source_ids[0]]);
 }
 assert.equal(record('block_timestamp').response_word,header.timestamp);assert.equal(record('block_timestamp').response_id,10);
 assert.equal(record('total_supply').value,'1000000000000000000000000000');assert.equal(record('decimals').value,'18');
 assert.equal(record('dead_sink_balance').value,'112633581211219518941995199');assert.equal(record('timelock_balance').value,'262247996305835021033106178');
 assert.equal(record('vesting_balance').value,'0');assert.equal(record('vesting_allowance').value,'20000000000000000000000000');
 assert.equal(record('minter').value,a.addresses.timelock);assert.equal(record('minting_allowed_after').value,'1704067200');
 assert.equal(record('mint_cap').value,'2');assert.equal(record('minimum_time_between_mints').value,'31536000');
 assert.equal(a.observations.length,13);assert.equal(new Set(a.observations.map(o=>o.id)).size,13);
 assert.ok(a.observations.every(o=>o.classification==='OBSERVED'&&o.fixture===false&&o.confidence==='medium'&&o.as_of_date===a.as_of_date&&typeof o.value==='string'));
});

test('official address table and pinned Uni.sol lines support Timelock identity and mint semantics without full-body replay',()=>{
 const [docs,source]=a.documents;
 assert.equal(docs.url,'https://developers.uniswap.org/docs/ecosystem/governance/technical-reference');
 assert.equal(docs.date_modified_marker,'"dateModified":"2026-04-09T14:56:21.000Z"');assert.equal(docs.body_replayable,false);
 for(const [label,key] of [['UNI Token','uni_token_address'],['Timelock','timelock_address']]) {
  const excerpt=docs.excerpts.find(e=>e.label===label),o=record(key);
  assert.equal(excerpt.end-excerpt.start,excerpt.html.length);assert.ok(excerpt.html.startsWith('<tr>')&&excerpt.html.endsWith('</tr>'));
  // The page renders "UNI Token" with U+00A0; the saved excerpt keeps that exact character.
  assert.ok(excerpt.html.includes(`>${label.replace(' ','\u00a0')}</a>`));assert.ok(excerpt.html.includes(`<code>${o.value}</code>`));
  assert.equal(o.excerpt_label,label);assert.deepEqual(o.source_ids,[docs.source_id]);assert.equal(o.observed_at,docs.received_at);
 }
 assert.equal(record('uni_token_address').value.toLowerCase(),a.token);assert.equal(record('timelock_address').value.toLowerCase(),a.addresses.timelock);
 assert.equal(source.commit,'ab22c084bacb2636a1aebf9759890063eb6e4946');assert.ok(source.url.includes(source.commit));assert.equal(source.body_replayable,false);
 const line=n=>source.line_excerpts.find(l=>l.line===n).text;
 assert.match(line(17),/totalSupply = 1_000_000_000e18/);assert.match(line(26),/minimumTimeBetweenMints = 1 days \* 365/);
 assert.match(line(29),/mintCap = 2/);assert.match(line(112),/block\.timestamp >= mintingAllowedAfter/);
 assert.match(line(120),/SafeMath\.mul\(totalSupply, mintCap\), 100/);assert.match(line(329),/dst != address\(0\)/);
 for(const d of a.documents){assert.equal(d.http_status,200);assert.match(d.body_sha256,/^[0-9a-f]{64}$/);assert.ok(Date.parse(d.started_at)<=Date.parse(d.received_at));}
 for(const field of ['circulating_supply','circulating_supply_definition','dead_sink_balance_attribution','timelock_committed_or_spendable',
  'future_mint_decision','synchronized_price','market_cap','fdv','deployment_source_equivalence'])assert.equal(a.context[field],null);
});

test('five research residual, mint and identity checks replay with BigInt and exact dependencies',()=>{
 const byId=new Map(a.observations.map(o=>[o.id,o])),value=id=>BigInt(byId.get(id).value);
 const replay={sub_raw_uint256:args=>args.slice(1).reduce((sum,id)=>sum-value(id),value(args[0])).toString(),
  gte_uint:([x,y])=>value(x)>=value(y)?1:0,mul_div_floor_uint256:([x,y],f)=>(value(x)*value(y)/BigInt(f.expression.divisor)).toString(),
  casefold_evm_address_eq:([x,y])=>byId.get(x).value.toLowerCase()===byId.get(y).value.toLowerCase()?1:0};
 assert.equal(a.formulas.length,5);assert.equal(a.derived.length,5);
 a.formulas.forEach((f,i)=>{
  const d=a.derived[i];assert.equal(f.version,1);assert.ok(f.rationale);assert.ok(f.method_source_ids.every(id=>a.documents.some(doc=>doc.source_id===id)));
  assert.equal(d.formula_id,f.id);assert.equal(d.formula_version,1);assert.equal(d.classification,'DERIVED');assert.deepEqual(d.dependencies,f.expression.args);
  assert.ok(d.dependencies.every(id=>byId.has(id)));assert.equal(d.value,replay[f.expression.op](f.expression.args,f));assert.equal(d.unit,f.unit);
 });
 assert.deepEqual(a.derived.map(d=>d.value),['887366418788780481058004801','625118422482945460024898623',1,'20000000000000000000000000',1]);
 assert.ok(a.limitations.some(l=>l.includes('不是流通或自由流通供給')));assert.ok(a.limitations.some(l=>l.includes('是否鑄造由治理決定')));
});

test('UNI supply composition is a source-only append that keeps finance, thesis, history, catalog and Fixture unchanged',()=>{
 const event=saved.event;assert.deepEqual(event.updates,[]);assert.equal(event.type,'dilution');assert.equal(event.status,'completed');
 assert.deepEqual(event.source_ids,event.sources.map(s=>s.id));assert.equal(saved.sources.length,previous.sources.length+3);
 for(const s of previous.sources)assert.deepEqual(saved.sources.find(next=>next.id===s.id),s);
 const retrieval={[a.anchor.source_ids[0]]:a.captured_at,...Object.fromEntries(a.documents.map(d=>[d.source_id,d.received_at]))};
 for(const s of event.sources){assert.equal(s.retrieved_at,retrieval[s.id]);assert.equal(s.fixture,false);assert.ok(s.tier<=2);assert.ok(s.date<=a.as_of_date);}
 assert.equal(event.sources.find(s=>s.tier===1).url,a.transport.state.endpoint);
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])
  assert.deepEqual(saved[field],previous[field]);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);assert.equal(saved.period.end,'2026-10-04');
 for(const id of ['uni.market_cap','uni.fdv','uni.required_share'])assert.equal(saved.metrics[id].value,null);
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-06'}).inputs.find(r=>r.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 const before=fingerprint(history);
 const replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},{history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 for(const snapshot of history)verifySnapshot(snapshot);
 const inspected=inspectResearch(p),entry=inspected.events.find(e=>e.id===event.id);
 assert.equal(entry.recorded_update_count,0);assert.deepEqual(entry.sources,event.sources);assert.equal(inspected.records.length,13);
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
