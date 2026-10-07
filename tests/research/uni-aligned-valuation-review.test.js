import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {validateSchema} from '../../engine/validation/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewUniAlignedValuation} from '../../engine/research/aligned-valuation.js';

const file='data/research/uni-aligned-valuation-2026-10-07-v1.json',bytes=fs.readFileSync(file),a=JSON.parse(bytes),p=loadProject('production');
const schema=readYaml('spec/uni-aligned-valuation-schema.yaml'),method=readYaml('spec/uni-aligned-valuation-method.yaml');
const digest=b=>createHash('sha256').update(b).digest('hex'),inspect=(b,project=p)=>reviewUniAlignedValuation(project,b,digest(b));
const changed=fn=>{const copy=structuredClone(a);fn(copy);return Buffer.from(JSON.stringify(copy));};
// Edit one saved RPC batch as parsed requests/responses and write the exact strings back.
const rpc=(a,section,fn)=>{const t=a.transport[section],requests=JSON.parse(t.request_json),responses=JSON.parse(t.response_json);
 fn(id=>requests.find(r=>r.id===id),id=>responses.find(r=>r.id===id),requests,responses);t.request_json=JSON.stringify(requests);t.response_json=JSON.stringify(responses);};
const record=(a,key)=>a.observations.find(o=>o.key===key),word=n=>'0x'+BigInt(n).toString(16).padStart(64,'0');
const setValue=(a,key,value)=>{const o=record(a,key),w=word(value);rpc(a,'state',(req,res)=>res(o.response_id).result=w);o.response_word=w;o.value=String(value);};
// Replace the saved candle response consistently (body hash included); callers adjust records as needed.
const setCandles=(a,text)=>{a.price_capture.response_json=text;a.price_capture.body_sha256=digest(text);};
const setToken=(a,key,token)=>{const o=record(a,key),bucket=a.price_capture.bucket_start;
 const rows=[...a.price_capture.response_json.matchAll(/\[(\d+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+)\]/g)].map(m=>m.slice(1));
 rows.find(r=>r[0]===bucket)[o.candle_field_index]=token;setCandles(a,'['+rows.map(r=>'['+r.join(',')+']').join(',')+']');o.value=o.raw_value=token;};
const derived=(a,name)=>a.derived.find(d=>d.formula_id===`research.uni.valuation.${name}`);
const ids=Object.fromEntries(a.transport.labels.map(l=>[l.label,l.id])),big=key=>BigInt(record(a,key).value);
const usd=(price,supply)=>{const [whole,fraction='']=price.split('.'),cents=BigInt(whole+fraction)*supply*100n/10n**BigInt(18+fraction.length);return `${cents/100n}.${(cents%100n).toString().padStart(2,'0')}`;};
const TOTAL=big('total_supply'),DEAD=big('dead_sink_balance'),LOCK=big('timelock_balance'),pad=address=>address.slice(2).padStart(64,'0');
const baseline=['887324418788780481058004801','625076422482945460024898623',1,'7991400000.00','7090964360.30','4995235722.63'];
// Re-price all three USD values for a consistent alternate close.
const reprice=(a,close)=>{setToken(a,'candle_close',close);derived(a,'total_supply_value_usd').value=usd(close,TOTAL);
 derived(a,'excluding_dead_sink_value_usd').value=usd(close,TOTAL-DEAD);derived(a,'excluding_dead_sink_and_timelock_value_usd').value=usd(close,TOTAL-DEAD-LOCK);};

test('schema and method v1 accept the saved archive and reproduce every saved call and candle field',()=>{
 validateSchema(schema,a,'UNI valuation research');validateSchema(schema.definitions.method,method,'UNI valuation method');
 assert.equal(method.archive_id,a.id);assert.deepEqual(method.targets,a.targets);assert.deepEqual(method.formulas,a.formulas);assert.deepEqual(method.scenario,a.scenario);
 assert.equal(method.price.url,a.price_capture.url);assert.deepEqual(Object.keys(method.derived_labels).sort(),a.formulas.map(f=>f.id).sort());
 assert.deepEqual(method.scenario_formula_ids,a.derived.filter(d=>d.classification==='SCENARIO').map(d=>d.formula_id));
 const requests=JSON.parse(a.transport.state.request_json);
 for(const [key,type,,selector,args,unit,label] of method.getters) {
  const o=record(a,key);assert.deepEqual(requests.find(r=>r.id===o.response_id).params[0],{to:method.targets.token,data:selector+args.map(name=>pad(method.targets[name])).join('')},key);
  assert.equal(o.abi_type,type);assert.equal(o.unit,unit);assert.equal(o.label,label);
 }
 for(const [key,index,unit,label] of method.price.fields){const o=record(a,key);assert.equal(o.candle_field_index,index);assert.equal(o.unit,unit);assert.equal(o.label,label);}
});

test('valuation reader replays aligned price, three bases and the scenario without changing files or economics',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),r=inspect(bytes);
 assert.equal(r.sha256,'227008fc44076ba5a09a159e6531158a5605979484a0c21e4f155b5fca4d2356');
 assert.equal(r.persisted,false);assert.equal(r.financial_inputs_updated,false);assert.equal(r.promoted,false);
 assert.deepEqual(r.method.source_ids,['ethereum-uni-valuation-supply-20261007-v1','coinbase-uni-usd-candle-20261007-v1','uniswap-governance-uni-sol-ab22c08-v1','uniswap-governance-technical-reference-20260409-v1']);
 assert.equal(r.method.basis_dependency.sha256,'de66eac4f1d0beda86dc04ee0e129162b4b7ecd29072b666682733da482f2de1');
 assert.deepEqual(r.full_archive,a);assert.equal(r.summary.observations,12);assert.equal(r.summary.block_number,'26140081');
 assert.deepEqual(r.summary.derived.map(d=>d.value),baseline);
 assert.deepEqual(r.summary.derived.map(d=>[d.classification,d.scenario_name??null]),[['DERIVED',null],['SCENARIO','timelock_excluded'],['DERIVED',null],['DERIVED',null],['DERIVED',null],['SCENARIO','timelock_excluded']]);
 assert.deepEqual(r.summary.bases.map(b=>[b.label,b.supply_raw,b.classification,b.value_usd]),[['現行 totalSupply','1000000000000000000000000000','DERIVED','7991400000.00'],
  ['扣除 dead address','887324418788780481058004801','DERIVED','7090964360.30'],['再扣除 Timelock','625076422482945460024898623','SCENARIO','4995235722.63']]);
 assert.equal(r.summary.bases[2].scenario_name,'timelock_excluded');assert.match(r.summary.bases[0].boundary,/未涵蓋未來增發/);assert.match(r.summary.bases[1].boundary,/不是已驗證流通量/);
 const price=r.summary.price;assert.equal(price.candle_close,'7.9914');assert.equal(price.candle_start_at,'2026-10-07T11:02:00.000Z');assert.equal(price.candle_end_at,'2026-10-07T11:03:00.000Z');
 assert.equal(price.seconds_into_candle,47);assert.equal(price.venue,'Coinbase Exchange');assert.equal(price.product,'UNI-USD');
 assert.ok(r.summary.values.every(v=>typeof v.value==='string'&&v.classification==='OBSERVED'));
 assert.equal(Object.keys(r.summary.unknown).length,9);assert.ok(Object.values(r.summary.unknown).every(v=>v===null));
 r.full_archive.observations[0].value='mutated';assert.deepEqual(fs.readFileSync(file),bytes);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

test('a consistent different close reprices every basis exactly and still floors to cents',()=>{
 const r=inspect(changed(a=>reprice(a,'7.99455')));
 assert.deepEqual(r.summary.bases.map(b=>b.value_usd),[usd('7.99455',TOTAL),usd('7.99455',TOTAL-DEAD),usd('7.99455',TOTAL-DEAD-LOCK)]);
 assert.equal(r.summary.bases[0].value_usd,'7994550000.00');assert.equal(r.summary.unknown.canonical_market_cap,null);
});

test('consistent different balances replay new research supplies; an unmet mint time stays an observed zero',()=>{
 const balances=changed(a=>{setValue(a,'dead_sink_balance','1');derived(a,'supply_excluding_dead_sink').value=(TOTAL-1n).toString();
  derived(a,'supply_excluding_dead_sink_and_timelock').value=(TOTAL-1n-LOCK).toString();derived(a,'excluding_dead_sink_value_usd').value=usd('7.9914',TOTAL-1n);
  derived(a,'excluding_dead_sink_and_timelock_value_usd').value=usd('7.9914',TOTAL-1n-LOCK);});
 assert.equal(inspect(balances).summary.bases[1].supply_raw,(TOTAL-1n).toString());
 const later=changed(a=>{setValue(a,'minting_allowed_after','1791370968');derived(a,'mint_time_permitted_at_block').value=0;});
 assert.equal(inspect(later).summary.derived[2].value,0);
});

test('record, formula, label, response and candle-row order may change while IDs and meaning remain fixed',()=>{
 const r=inspect(changed(a=>{a.observations.reverse();a.derived.reverse();a.formulas.reverse();a.transport.labels.reverse();
  rpc(a,'state',(req,res,requests,responses)=>{requests.reverse();responses.reverse();});
  const rows=a.price_capture.response_json.slice(2,-2).split('],[').reverse();setCandles(a,'[['+rows.join('],[')+']]');}));
 assert.deepEqual(r.summary.derived.map(d=>d.value),baseline);
});

const otherHash='0x'+'ab'.repeat(32),call=key=>ids[key],bucket=Number(a.price_capture.bucket_start);
const candleUrl=(start,end)=>`https://api.exchange.coinbase.com/products/UNI-USD/candles?granularity=60&start=${new Date(start*1000).toISOString()}&end=${new Date(end*1000).toISOString()}`;
const invalid=[
 ['archive identity changed',a=>a.id='uni-aligned-valuation-evidence-20261007-v2',/method\/archive version/],
 ['Timelock target changed',a=>a.targets.timelock='0x'+'1'.repeat(40),/target\/scenario identity/],
 ['scenario renamed',a=>a.scenario.name='circulating_supply',/target\/scenario identity/],
 ['scenario rationale rewritten',a=>a.scenario.rationale='已驗證不流通',/target\/scenario identity/],
 ['future knowledge day',a=>a.as_of_date='2099-01-01',/cannot be in the future/],
 ['capture time differs from state receipt',a=>a.captured_at='2026-10-07T11:16:27.000Z',/state capture order/],
 ['wrong chain',a=>rpc(a,'probe',(req,res)=>res(1).result='0x82'),/chain mismatch/],
 ['latest instead of finalized request',a=>rpc(a,'probe',req=>req(2).params=['latest',false]),/finalized anchor requests/],
 ['anchor hash rewritten',a=>{a.anchor.hash=otherHash;a.anchor.selector.blockHash=otherHash;},/anchor header mismatch/],
 ['fixed header hash differs',a=>rpc(a,'state',(req,res)=>res(10).result.hash=otherHash),/fixed header recheck/],
 ['height recheck hash differs',a=>rpc(a,'state',(req,res)=>res(16).result.hash=otherHash),/canonical height recheck/],
 ['call pinned to latest',a=>rpc(a,'state',req=>req(call('total_supply')).params[1]='latest'),/not pinned to canonical/],
 ['balance holder substituted',a=>rpc(a,'state',req=>req(call('dead_sink_balance')).params[0].data='0x70a08231'+pad(a.targets.timelock)),/selector\/contract\/arguments/],
 ['wrong contract target',a=>rpc(a,'state',req=>req(call('total_supply')).params[0].to=a.targets.timelock),/selector\/contract\/arguments/],
 ['uint8 overflow',a=>setValue(a,'mint_cap','256'),/exceeds declared width/],
 ['value differs from response word',a=>record(a,'total_supply').value='1',/ABI\/result/],
 ['chain reading relabelled as circulating supply',a=>record(a,'total_supply').label='流通供給',/record identity\/date\/unit/],
 ['chain reading time replaced by retrieval',a=>record(a,'total_supply').observed_at=a.captured_at,/chain record time\/source/],
 ['chain reading cites the exchange',a=>record(a,'dead_sink_balance').source_ids=[a.price_capture.source_id],/chain record time\/source/],
 ['price from another product',a=>a.price_capture.url=a.price_capture.url.replace('UNI-USD','UNI-EUR'),/price\/supply alignment or endpoint/],
 ['price window moved one minute later',a=>{a.price_capture.url=candleUrl(bucket,bucket+120);a.price_capture.bucket_start=String(bucket+60);},/price\/supply alignment or endpoint/],
 ['bucket label moved without the URL',a=>a.price_capture.bucket_start=String(bucket+60),/price\/supply alignment or endpoint/],
 ['venue relabelled',a=>a.price_capture.venue='Composite',/price\/supply alignment or endpoint/],
 ['price fetched before the anchor',a=>a.price_capture.started_at='2026-10-07T11:16:25.000Z',/price capture chronology/],
 ['price received after the state batch',a=>a.price_capture.received_at='2026-10-07T11:16:27.000Z',/price capture chronology/],
 ['price HTTP date invalid',a=>a.price_capture.http_date='invalid',/price capture chronology/],
 ['candle body edited without digest',a=>a.price_capture.response_json=a.price_capture.response_json.replace('7.9914,97.581852','7.9915,97.581852'),/price body digest/],
 ['candle body digest rewritten',a=>a.price_capture.body_sha256='0'.repeat(64),/price body digest/],
 ['candle response not an array of rows',a=>setCandles(a,'{"message":"NotFound"}'),/candle response format/],
 ['exponent price in response',a=>setCandles(a,a.price_capture.response_json.replace('7.9914,97.581852','7.9914e0,97.581852')),/candle response format/],
 ['negative price in response',a=>setCandles(a,a.price_capture.response_json.replace(',7.9914,7.9946,7.9946,',',-7.9914,7.9946,7.9946,')),/candle response format/],
 ['block minute missing from response',a=>setCandles(a,'[[1791370980,7.9902,7.9956,7.994,7.9953,94.526345],[1791370860,7.9853,7.995,7.9853,7.9948,5039.959793]]'),/candle for the block minute is missing/],
 ['duplicate candle minute',a=>setCandles(a,a.price_capture.response_json.replace('[1791370860,','[1791370920,')),/Duplicate/],
 ['close taken from the neighbouring minute',a=>{const o=record(a,'candle_close');o.value=o.raw_value='7.9953';},/candle token mismatch/],
 ['price rounded in the record',a=>record(a,'candle_close').value='7.99',/candle token mismatch/],
 ['raw value differs from value',a=>record(a,'candle_close').raw_value='7.9915',/candle token mismatch/],
 ['candle field index swapped',a=>record(a,'candle_close').candle_field_index=3,/candle token mismatch/],
 ['candle time replaced by block time',a=>record(a,'candle_close').observed_at=a.anchor.effective_at,/candle record time\/source/],
 ['candle cites the RPC source',a=>record(a,'candle_close').source_ids=a.anchor.source_ids,/candle record time\/source/],
 ['price unit changed',a=>record(a,'candle_close').unit='USD',/Invalid UNI valuation research|record identity\/date\/unit/],
 ['close above the minute high',a=>setToken(a,'candle_high','7.99'),/candle range mismatch/],
 ['close below the minute low',a=>setToken(a,'candle_low','7.9920'),/candle range mismatch/],
 ['basis archive digest changed',a=>a.basis_dependency.archive_sha256='0'.repeat(64),/basis dependency mismatch/],
 ['basis source dropped',a=>a.basis_dependency.source_ids.pop(),/basis dependency mismatch/],
 ['formula operator rewritten',a=>a.formulas[3].expression.op='eval',/formula version\/definition/],
 ['dead sink dropped from the research-basis formula',a=>derived(a,'excluding_dead_sink_value_usd')&&a.formulas[4].expression.args.pop(),/formula version\/definition/],
 ['formula rationale reused',a=>a.formulas[4].rationale='已驗證流通市值',/formula version\/definition/],
 ['USD value fabricated',a=>derived(a,'total_supply_value_usd').value='8000000000.00',/derived value\/lineage/],
 ['USD value rounded up instead of floored',a=>derived(a,'excluding_dead_sink_value_usd').value='7090964360.31',/derived value\/lineage/],
 ['research basis reuses the FDV value',a=>derived(a,'excluding_dead_sink_value_usd').value='7991400000.00',/derived value\/lineage/],
 ['derived dependency reordered',a=>derived(a,'total_supply_value_usd').dependencies.reverse(),/derived value\/lineage/],
 ['scenario value presented as derived',a=>{const d=derived(a,'excluding_dead_sink_and_timelock_value_usd');d.classification='DERIVED';delete d.scenario_name;},/classification\/scenario/],
 ['scenario supply presented as derived',a=>{const d=derived(a,'supply_excluding_dead_sink_and_timelock');d.classification='DERIVED';delete d.scenario_name;},/classification\/scenario/],
 ['research basis promoted to a scenario',a=>{const d=derived(a,'excluding_dead_sink_value_usd');d.classification='SCENARIO';d.scenario_name='timelock_excluded';},/classification\/scenario/],
 ['scenario record renamed',a=>derived(a,'excluding_dead_sink_and_timelock_value_usd').scenario_name='free_float',/classification\/scenario/],
 ['scenario without a name',a=>delete derived(a,'excluding_dead_sink_and_timelock_value_usd').scenario_name,/Invalid UNI valuation research/],
 ['burn sink exceeds supply',a=>setValue(a,'dead_sink_balance','2000000000000000000000000000'),/subtraction is negative/],
 ['verified circulating supply filled',a=>a.context.verified_circulating_supply='887324418788780481058004801',/Invalid UNI valuation research/],
 ['canonical market cap filled',a=>a.context.canonical_market_cap='7090964360.30',/Invalid UNI valuation research/],
 ['canonical FDV filled',a=>a.context.canonical_fdv='7991400000.00',/Invalid UNI valuation research/],
 ['three-decimal USD value',a=>derived(a,'total_supply_value_usd').value='7991400000.000',/Invalid UNI valuation research/],
 ['price record also claims an RPC word',a=>record(a,'candle_close').response_word='0x01',/Invalid UNI valuation research/],
 ['fixture promoted',a=>a.fixture=true,/Invalid UNI valuation research/]
];
for(const [label,fn,pattern] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(fn)),pattern));

const RPC=a.anchor.source_ids[0],PRICE=a.price_capture.source_id,SOL='uniswap-governance-uni-sol-ab22c08-v1';
for(const [label,id,fn,pattern] of [
 ['RPC source tier',RPC,s=>s.tier=5,/Missing primary production UNI valuation RPC source/],
 ['RPC source retrieval time',RPC,s=>s.retrieved_at='2026-10-07T11:16:27.000Z',/RPC source chronology\/endpoint/],
 ['price source tier',PRICE,s=>s.tier=4,/Missing primary UNI valuation price source/],
 ['price source URL',PRICE,s=>s.url='https://api.exchange.coinbase.com/products/UNI-USD/ticker',/Missing primary UNI valuation price source/],
 ['price source coverage',PRICE,s=>s.covered_metrics=['uni.valuation_basis_evidence'],/Missing primary UNI valuation price source/],
 ['price source retrieval time',PRICE,s=>s.retrieved_at='2026-10-07T11:16:26.000Z',/price source chronology/],
 ['price source published after knowledge',PRICE,s=>s.date='2026-10-08',/price source chronology/],
 ['basis source code URL',SOL,s=>s.url=s.url.replace('ab22c084bacb2636a1aebf9759890063eb6e4946','master'),/Missing primary UNI supply document source/]])
 test(`valuation reader rejects changed saved ${label}`,()=>{
  const project=structuredClone(p);fn(project.sources.find(s=>s.id===id));assert.throws(()=>inspect(bytes,project),pattern);
 });

test('a candle requested before its minute closed is rejected even when every saved time is consistent',()=>{
 // Block at second 47; anchor, price and state all fetched inside the same still-open minute.
 const times={probe:['2026-10-07T11:02:50.000Z','2026-10-07T11:02:50.500Z'],price:['2026-10-07T11:02:51.000Z','2026-10-07T11:02:52.000Z'],state:['2026-10-07T11:02:53.000Z','2026-10-07T11:02:54.000Z']};
 const early=changed(a=>{for(const [name,target] of [['probe',a.transport.probe],['price',a.price_capture],['state',a.transport.state]]){[target.started_at,target.received_at]=times[name];target.http_date='Wed, 07 Oct 2026 11:02:50 GMT';}
  a.captured_at=times.state[1];});
 const project=structuredClone(p);project.sources.find(s=>s.id===RPC).retrieved_at=times.state[1];project.sources.find(s=>s.id===PRICE).retrieved_at=times.price[1];
 assert.throws(()=>inspect(early,project),/still open when requested/);
});

test('valuation reader rejects missing saved sources',()=>{
 for(const [id,pattern] of [[RPC,/Missing primary production UNI valuation RPC source/],[PRICE,/Missing primary UNI valuation price source/],[SOL,/Missing primary UNI supply document source/]]) {
  const project=structuredClone(p);project.sources=project.sources.filter(s=>s.id!==id);assert.throws(()=>inspect(bytes,project),pattern);
 }
});

for(const [label,fn] of [['wrong method id',m=>m.id='uni-valuation-review'],['price URL for another product',m=>m.price.url=m.price.url.replace('UNI-USD','ETH-USD')],['five-minute candles',m=>m.price.granularity_seconds=300],
 ['candle field order changed',m=>m.price.fields.reverse()],['scenario without rationale',m=>delete m.scenario.rationale],['no scenario formulas',m=>m.scenario_formula_ids=[]],['basis removed',m=>m.bases.pop()],
 ['basis archive path traversal',m=>m.basis_dependency.file='../uni-supply-composition-2026-10-06-v1.json'],['extra method field',m=>m.canonical_market_cap_basis='ex_dead']])
 test(`method schema rejects ${label}`,()=>{
  const copy=structuredClone(method);fn(copy);assert.throws(()=>validateSchema(schema.definitions.method,copy,'UNI valuation method'),/Invalid UNI valuation method/);
 });

test('manual CLI requires production and digest; failures have no stdout or file/history writes',()=>{
 const before=fingerprint(readSnapshots(p.root,p.mode)),run=(...args)=>spawnSync(process.execPath,['cli.js','uni-aligned-valuation-review',...args],{encoding:'utf8'});
 const good=run(file,'--production','--digest',digest(bytes));assert.equal(good.status,0,good.stderr);
 const out=JSON.parse(good.stdout);assert.equal(out.summary.observations,12);assert.equal(out.summary.bases[1].value_usd,'7090964360.30');
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)],['--production','--digest',digest(bytes)]]){
  const r=run(...args);assert.equal(r.status,1);assert.equal(r.stdout,'');
 }
 assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});

test('reader rejects fixture and object inputs before issuing research conclusions',()=>{
 assert.throws(()=>reviewUniAlignedValuation(loadProject('fixture'),bytes,digest(bytes)),/requires production/);
 assert.throws(()=>reviewUniAlignedValuation(p,a,digest(bytes)),/raw JSON bytes/);
 assert.throws(()=>reviewUniAlignedValuation(p,bytes,'227008fc'),/reviewed SHA-256/);
});
