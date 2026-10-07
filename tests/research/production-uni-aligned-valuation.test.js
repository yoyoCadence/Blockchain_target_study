import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {reviewUniSupplyComposition} from '../../engine/research/supply-composition.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='uni-aligned-valuation-20261007'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync('data/research/uni-aligned-valuation-2026-10-07-v1.json'),a=JSON.parse(raw);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),pad=address=>address.slice(2).padStart(64,'0');
const record=key=>a.observations.find(o=>o.key===key),derived=name=>a.derived.find(d=>d.metric_id===`research.uni.valuation.${name}`);

test('aligned valuation preserves exact bytes, finalized anchor and canonical-pinned supply readings',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/uni-aligned-valuation-2026-10-07.yaml'));
 assert.equal(hash(raw),'227008fc44076ba5a09a159e6531158a5605979484a0c21e4f155b5fca4d2356');assert.ok(event.reason.includes(hash(raw)));
 assert.equal(a.fixture,false);assert.equal(a.version,1);assert.equal(saved.parent_id,previous.id);
 const {probe,state,labels}=a.transport,probeBody=JSON.parse(probe.response_json),stateBody=JSON.parse(state.response_json);
 assert.equal(probeBody.find(r=>r.id===1).result,'0x1');assert.deepEqual(JSON.parse(probe.request_json).find(r=>r.id===2).params,['finalized',false]);
 const finalized=probeBody.find(r=>r.id===2).result,header=stateBody.find(r=>r.id===10).result,height=stateBody.find(r=>r.id===16).result;
 for(const block of [finalized,header,height])assert.equal(block.hash,a.anchor.hash);
 assert.equal(a.anchor.number,'26140081');assert.equal(a.anchor.effective_at,'2026-10-07T11:02:47.000Z');
 assert.equal(new Date(Number(BigInt(header.timestamp))*1000).toISOString(),a.anchor.effective_at);
 const requests=JSON.parse(state.request_json),calls=requests.filter(r=>r.method==='eth_call');assert.equal(calls.length,5);
 assert.deepEqual(new Set(labels.map(l=>l.id)),new Set([1,2,...requests.map(r=>r.id)]));
 assert.ok(calls.every(r=>r.params[0].to===a.targets.token&&JSON.stringify(r.params[1])===JSON.stringify({blockHash:a.anchor.hash,requireCanonical:true})));
 const calldata={total_supply:'0x18160ddd',dead_sink_balance:'0x70a08231'+pad(a.targets.dead_sink),timelock_balance:'0x70a08231'+pad(a.targets.timelock),mint_cap:'0x76c71ca1',minting_allowed_after:'0x30b36cef'};
 for(const [key,data] of Object.entries(calldata)) {
  const o=record(key),request=requests.find(r=>r.id===o.response_id),response=stateBody.find(r=>r.id===o.response_id);
  assert.deepEqual(request.params[0],{to:a.targets.token,data});assert.equal(labels.find(l=>l.id===o.response_id).label,key);
  assert.equal(response.result,o.response_word);assert.equal(o.value,BigInt(o.response_word).toString());
  assert.equal(o.observed_at,a.anchor.effective_at);assert.deepEqual(o.source_ids,a.anchor.source_ids);
 }
 assert.equal(record('total_supply').value,'1000000000000000000000000000');assert.equal(record('dead_sink_balance').value,'112675581211219518941995199');
 assert.equal(record('timelock_balance').value,'262247996305835021033106178');assert.equal(record('mint_cap').value,'2');assert.equal(record('minting_allowed_after').value,'1704067200');
 assert.equal(a.observations.length,12);assert.ok(a.observations.every(o=>o.classification==='OBSERVED'&&o.confidence==='medium'&&typeof o.value==='string'));
});

test('price is the one-minute candle containing the block time, copied token-for-token from the saved response',()=>{
 const c=a.price_capture,block=Number(record('block_timestamp').value),bucket=Math.floor(block/60)*60;
 assert.equal(c.url,`https://api.exchange.coinbase.com/products/UNI-USD/candles?granularity=60&start=${new Date((bucket-60)*1000).toISOString()}&end=${new Date((bucket+60)*1000).toISOString()}`);
 assert.equal(c.http_status,200);assert.equal(hash(c.response_json),c.body_sha256);assert.equal(c.granularity_seconds,60);assert.equal(c.bucket_start,String(bucket));
 assert.equal(c.product,'UNI-USD');assert.equal(c.venue,'Coinbase Exchange');
 const rows=[...c.response_json.matchAll(/\[(\d+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+)\]/g)].map(m=>m.slice(1)),row=rows.find(r=>r[0]===String(bucket));
 assert.deepEqual(row,['1791370920','7.9914','7.9946','7.9946','7.9914','97.581852']);
 assert.ok(bucket<=block&&block<bucket+60);assert.equal(block-bucket,47);
 for(const [key,position,unit] of [['candle_start',0,'unix seconds'],['candle_low',1,'USD/UNI'],['candle_high',2,'USD/UNI'],['candle_open',3,'USD/UNI'],['candle_close',4,'USD/UNI'],['candle_volume',5,'UNI']]) {
  const o=record(key);assert.equal(o.value,row[position]);assert.equal(o.raw_value,row[position]);assert.equal(o.candle_field_index,position);assert.equal(o.unit,unit);
  assert.deepEqual(o.source_ids,[c.source_id]);assert.equal(o.observed_at,new Date(bucket*1000).toISOString());assert.equal(o.response_received_at,c.received_at);
 }
 // Anchor first, then the already-closed candle, then the pinned state batch.
 assert.ok(Date.parse(a.transport.probe.received_at)<=Date.parse(c.started_at)&&Date.parse(c.received_at)<=Date.parse(a.transport.state.received_at));
 assert.ok((bucket+60)*1000<=Date.parse(c.started_at));
 assert.ok(Number(record('candle_low').value)<=Number(record('candle_close').value)&&Number(record('candle_close').value)<=Number(record('candle_high').value));
});

test('research bases, scenario and USD values replay with BigInt and state what they are not',()=>{
 const value=key=>BigInt(record(key).value),total=value('total_supply'),dead=value('dead_sink_balance'),timelock=value('timelock_balance');
 const usd=supply=>{const [whole,fraction='']=record('candle_close').value.split('.'),cents=BigInt(whole+fraction)*supply*100n/10n**BigInt(18+fraction.length);
  return `${cents/100n}.${(cents%100n).toString().padStart(2,'0')}`;};
 assert.equal(derived('supply_excluding_dead_sink').value,(total-dead).toString());assert.equal(derived('supply_excluding_dead_sink').value,'887324418788780481058004801');
 assert.equal(derived('supply_excluding_dead_sink_and_timelock').value,(total-dead-timelock).toString());
 assert.equal(derived('mint_time_permitted_at_block').value,1);
 assert.equal(derived('total_supply_value_usd').value,usd(total));assert.equal(derived('total_supply_value_usd').value,'7991400000.00');
 assert.equal(derived('excluding_dead_sink_value_usd').value,usd(total-dead));assert.equal(derived('excluding_dead_sink_value_usd').value,'7090964360.30');
 assert.equal(derived('excluding_dead_sink_and_timelock_value_usd').value,usd(total-dead-timelock));assert.equal(derived('excluding_dead_sink_and_timelock_value_usd').value,'4995235722.63');
 const scenarios=a.derived.filter(d=>d.classification==='SCENARIO');
 assert.deepEqual(scenarios.map(d=>d.metric_id.split('.').pop()),['supply_excluding_dead_sink_and_timelock','excluding_dead_sink_and_timelock_value_usd']);
 assert.ok(scenarios.every(d=>d.scenario_name==='timelock_excluded'));assert.equal(a.scenario.name,'timelock_excluded');assert.ok(a.scenario.rationale);
 assert.ok(a.derived.filter(d=>d.classification==='DERIVED').every(d=>!Object.hasOwn(d,'scenario_name')));assert.equal(a.derived.length,6);
 const ids=new Set(a.observations.map(o=>o.id));
 a.formulas.forEach((f,i)=>{const d=a.derived[i];assert.equal(d.formula_id,f.id);assert.equal(d.formula_version,1);assert.deepEqual(d.dependencies,f.expression.args);
  assert.ok(d.dependencies.every(id=>ids.has(id)));assert.ok(f.rationale);assert.ok(f.method_source_ids.every(id=>a.basis_dependency.source_ids.includes(id)));});
 const text=id=>a.formulas.find(f=>f.id===`research.uni.valuation.${id}`).rationale;
 assert.match(text('supply_excluding_dead_sink'),/不是已驗證的流通量/);assert.match(text('total_supply_value_usd'),/未涵蓋未來增發/);assert.match(text('total_supply_value_usd'),/不是 canonical FDV/);
 assert.match(text('excluding_dead_sink_value_usd'),/不是 canonical 市值/);assert.match(text('supply_excluding_dead_sink_and_timelock'),/情境 timelock_excluded/);
 for(const field of ['verified_circulating_supply','canonical_market_cap','canonical_fdv','other_non_circulating_holdings','timelock_committed_or_spendable',
  'future_mint_decision','volume_weighted_price','cross_venue_price','deployment_source_equivalence'])assert.equal(a.context[field],null);
});

test('basis dependency points at the reviewed supply-composition archive for Timelock identity and mint semantics',()=>{
 const file='data/research/uni-supply-composition-2026-10-06-v1.json',bytes=fs.readFileSync(file);
 assert.equal(a.basis_dependency.archive_sha256,hash(bytes));
 const reviewed=reviewUniSupplyComposition(p,bytes,a.basis_dependency.archive_sha256);
 assert.equal(reviewed.archive_id,a.basis_dependency.archive_id);assert.deepEqual(a.basis_dependency.source_ids,reviewed.method.source_ids.slice(1).reverse());
 const earlier=reviewed.full_archive;assert.equal(earlier.token,a.targets.token);assert.equal(earlier.addresses.timelock,a.targets.timelock);assert.equal(earlier.addresses.dead_sink,a.targets.dead_sink);
 // Different blocks: an unchanged Timelock balance and a larger dead balance are separate point observations.
 const before=key=>BigInt(earlier.observations.find(o=>o.key===key).value);
 assert.equal(BigInt(record('timelock_balance').value),before('timelock_balance'));assert.equal(BigInt(record('dead_sink_balance').value)-before('dead_sink_balance'),42000n*10n**18n);
 assert.notEqual(a.anchor.number,earlier.anchor.number);
});

test('aligned valuation is a source-only append; canonical price, market cap, FDV and thesis stay unchanged',()=>{
 const event=saved.event;assert.deepEqual(event.updates,[]);assert.equal(event.type,'market_data_review');assert.equal(event.status,'completed');
 assert.equal(saved.sources.length,previous.sources.length+2);for(const s of previous.sources)assert.deepEqual(saved.sources.find(next=>next.id===s.id),s);
 assert.deepEqual(event.sources.map(s=>s.id),[a.anchor.source_ids[0],a.price_capture.source_id]);
 assert.deepEqual(event.source_ids,[...event.sources.map(s=>s.id),...a.basis_dependency.source_ids]);
 assert.deepEqual(event.sources.map(s=>[s.url,s.retrieved_at,s.tier,s.date]),[[a.transport.state.endpoint,a.captured_at,1,'2026-10-07'],[a.price_capture.url,a.price_capture.received_at,1,'2026-10-07']]);
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])assert.deepEqual(saved[field],previous[field]);
 assert.equal(saved.metrics['uni.price'].value,9.0556);assert.equal(saved.metrics['uni.price'].as_of_date,'2026-10-04');
 for(const id of ['uni.market_cap','uni.fdv','uni.required_accrual','uni.required_share','uni.net_burn_yield'])assert.equal(saved.metrics[id].value,null,id);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);assert.equal(saved.period.end,'2026-10-04');
 const before=fingerprint(history);
 const replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},{history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);for(const snapshot of history)verifySnapshot(snapshot);
 const inspected=inspectResearch(p),entry=inspected.events.find(e=>e.id===event.id);
 assert.equal(entry.recorded_update_count,0);assert.equal(entry.sources.length,4);assert.ok(!inspected.records.some(r=>r.full_review?.id===a.id));
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
