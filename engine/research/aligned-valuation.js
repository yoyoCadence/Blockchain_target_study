import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {parseRpcJson} from './fixed-block.js';
import {decimalToken,decodeAbiWord,reviewFinalizedAnchor,pinnedCall,replayResearchFormulas} from './finalized-rpc.js';
import {reviewUniSupplyComposition} from './supply-composition.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),LABEL='UNI valuation';
// Compare two provider decimal tokens without floating point.
const scaled=(value,digits)=>{const [whole,fraction='']=value.split('.');return BigInt(whole+fraction.padEnd(digits,'0'));};
const lte=(a,b)=>{const digits=Math.max(...[a,b].map(v=>(v.split('.')[1]||'').length));return scaled(a,digits)<=scaled(b,digits);};

// Digest-bound local consistency review. No RPC or exchange calls, writes, verified circulating supply or canonical valuation.
export function reviewUniAlignedValuation(project,bytes,expectedDigest) {
 assert(project.mode==='production','UNI valuation review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'UNI valuation review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','UNI valuation review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'UNI valuation archive digest mismatch');
 const artifact=parseRpcJson(bytes.toString(),'UNI valuation artifact');
 const schema=readYaml('spec/uni-aligned-valuation-schema.yaml',project.root),method=readYaml('spec/uni-aligned-valuation-method.yaml',project.root);
 validateSchema(schema,artifact,'UNI valuation research');validateSchema(schema.definitions.method,method,'UNI valuation method');
 unique(method.getters.map(([id])=>({id})));unique(method.formulas);
 assert(method.version===1&&artifact.id===method.archive_id,'UNI valuation method/archive version mismatch');
 assert(same(artifact.targets,method.targets)&&same(artifact.scenario,method.scenario),'UNI valuation target/scenario identity mismatch');
 const context=reviewFinalizedAnchor(project,artifact,method,LABEL),{anchor,day,capturedAt,point,rpcSource,state,labeled,header,seconds,fixed,height}=context;

 unique(artifact.observations);unique(artifact.observations,'key');unique(artifact.derived);unique(artifact.formulas);
 const byKey=new Map(artifact.observations.map(o=>[o.key,o]));
 const consumed=new Set([fixed.id,height.id]),checked=new Set(),values=[];
 const record=(key,label,unit)=>{
  const o=byKey.get(key);assert(o,'Missing supported UNI valuation observation');
  assert(o.id===`research.uni.valuation.block${anchor.number}.${key}@1`&&o.metric_id===`research.uni.valuation.${key}`&&o.label===label&&o.unit===unit&&o.as_of_date===day,
   'UNI valuation record identity/date/unit mismatch');
  checked.add(o.id);return o;
 };
 const onchain=(key,type,unit,label,responseId,word,value)=>{
  const o=record(key,label,unit);
  assert(o.abi_type===type&&same(o.period,point)&&o.observed_at===anchor.effective_at&&same(o.source_ids,[rpcSource.id]),'UNI valuation chain record time/source mismatch');
  assert(o.response_id===responseId&&o.response_word===word&&o.value===value,'UNI valuation ABI/result mismatch');
  values.push({id:o.id,key,label,origin:type,value,unit,classification:o.classification,confidence:o.confidence,source_id:rpcSource.id,observed_at:o.observed_at});
 };
 onchain('block_timestamp','header.timestamp','unix seconds',method.header_label,fixed.id,header.timestamp,seconds.toString());
 for(const [key,type,,selector,args,unit,label] of method.getters) {
  const calldata=selector+args.map(target=>method.targets[target].slice(2).padStart(64,'0')).join('');
  const call=pinnedCall(state,labeled,key,anchor,method.targets.token,calldata,LABEL);
  onchain(key,type,unit,label,call.id,call.word,decodeAbiWord(type,call.word,LABEL));consumed.add(call.id);
 }
 assert(consumed.size===state.requests.length,'UNI valuation response IDs reused or unaccounted');

 // Price: the closed one-minute candle whose bucket contains the anchor block time.
 const capture=artifact.price_capture,rule=method.price,bucket=seconds/60n*60n,iso=value=>new Date(Number(value)*1000).toISOString();
 const expectedUrl=`https://api.exchange.coinbase.com/products/${rule.product}/candles?granularity=${rule.granularity_seconds}&start=${iso(bucket-60n)}&end=${iso(bucket+60n)}`;
 assert(capture.url===rule.url&&capture.url===expectedUrl&&capture.bucket_start===bucket.toString()&&capture.product===rule.product&&capture.venue===rule.venue&&
  capture.source_id===rule.source_id,'UNI valuation price/supply alignment or endpoint mismatch');
 const received=Date.parse(capture.received_at),started=Date.parse(capture.started_at),httpDate=Date.parse(capture.http_date);
 assert(Date.parse(artifact.transport.probe.received_at)<=started&&started<=received&&received<=capturedAt&&utcDay(received)===day&&
  Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,'UNI valuation price capture chronology mismatch');
 assert(Number(bucket+60n)*1000<=started,'UNI valuation candle was still open when requested');
 const priceSource=project.sources.find(s=>s.id===rule.source_id);
 assert(priceSource&&!priceSource.fixture&&priceSource.tier<=2&&priceSource.url===capture.url&&priceSource.covered_metrics.includes(rule.covered_metric),'Missing primary UNI valuation price source');
 assert(priceSource.date<=day&&Date.parse(priceSource.retrieved_at)===received,'UNI valuation price source chronology mismatch');
 assert(hash(capture.response_json)===capture.body_sha256,'UNI valuation price body digest mismatch');
 // Tokens are copied from the raw text; JSON.parse would round provider decimals through floating point.
 assert(/^\[(\[\d+(?:,(?:0|[1-9]\d*)(?:\.\d+)?){5}\](?:,(?=\[)|(?=\])))+\]$/.test(capture.response_json),'UNI valuation candle response format mismatch');
 const rows=[...capture.response_json.matchAll(/\[(\d+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+),([^,\]]+)\]/g)].map(match=>match.slice(1));
 unique(rows.map(([id])=>({id})));
 const row=rows.find(([time])=>time===bucket.toString());assert(row,'UNI valuation candle for the block minute is missing');
 const candleAt=iso(bucket),candle={};
 for(const [key,index,unit,label] of rule.fields) {
  const o=record(key,label,unit),token=row[index];
  assert(decimalToken(token)&&o.value===token&&o.raw_value===token&&o.candle_field_index===index,'UNI valuation candle token mismatch');
  assert(same(o.period,{basis:'point',end:utcDay(candleAt)})&&o.observed_at===candleAt&&o.response_received_at===capture.received_at&&same(o.source_ids,[priceSource.id]),
   'UNI valuation candle record time/source mismatch');
  candle[key]=token;values.push({id:o.id,key,label,origin:`K 線欄位 ${index}`,value:token,unit,classification:o.classification,confidence:o.confidence,source_id:priceSource.id,observed_at:o.observed_at});
 }
 assert([candle.candle_open,candle.candle_close].every(price=>lte(candle.candle_low,price)&&lte(price,candle.candle_high)),'UNI valuation candle range mismatch');
 assert(checked.size===artifact.observations.length,'UNI valuation observations do not cover exact fields');

 // Timelock identity and mint semantics come from the already reviewed supply-composition archive.
 const dependency=method.basis_dependency,{file,sha256,...declared}=dependency;
 assert(same(artifact.basis_dependency,{...declared,archive_sha256:sha256}),'UNI valuation basis dependency mismatch');
 const earlier=reviewUniSupplyComposition(project,fs.readFileSync(path.join(project.root,'data/research',file)),sha256);
 assert(earlier.archive_id===dependency.archive_id&&dependency.source_ids.every(id=>earlier.method.source_ids.includes(id))&&
  earlier.full_archive.token===method.targets.token&&earlier.full_archive.addresses.timelock===method.targets.timelock&&
  earlier.full_archive.addresses.dead_sink===method.targets.dead_sink,'UNI valuation basis archive identity mismatch');
 const basisSources=dependency.source_ids.map(id=>project.sources.find(s=>s.id===id));

 const derived=replayResearchFormulas(artifact,method,context,basisSources,LABEL),byFormula=new Map(derived.map(d=>[d.formula_id,d]));
 const bases=method.bases.map(([label,supply,valueFormula,boundary])=>{
  const supplyRecord=byKey.get(supply)||byFormula.get(supply),valued=byFormula.get(valueFormula);assert(supplyRecord&&valued,'UNI valuation basis definition mismatch');
  return {label,supply_raw:supplyRecord.value,classification:valued.classification,...(valued.scenario_name?{scenario_name:valued.scenario_name}:{}),value_usd:valued.value,boundary};
 });
 return {mode:'production',persisted:false,financial_inputs_updated:false,promoted:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[rpcSource.id,priceSource.id,...basisSources.map(s=>s.id)],basis_dependency:structuredClone(dependency)},
  summary:{label:'UNI 供給口徑與同分鐘價格唯讀驗證',block_number:anchor.number,block_hash:anchor.hash,block_time:anchor.effective_at,retrieved_at:artifact.captured_at,
   source_id:rpcSource.id,observations:values.length,values,derived,bases,scenario:structuredClone(method.scenario),
   price:{venue:capture.venue,product:capture.product,source_id:priceSource.id,retrieved_at:capture.received_at,body_sha256:capture.body_sha256,
    candle_start_at:candleAt,candle_end_at:iso(bucket+60n),seconds_into_candle:Number(seconds-bucket),...candle},
   unknown:structuredClone(artifact.context),
   limitations:['只驗證已保存資料包的內部一致性、價格與區塊的分鐘對齊及來源版本；沒有重新連 RPC 或交易所。',
    '三個美元值是研究口徑或情境，不是已驗證流通市值、canonical 市值／FDV 或合理價值。',...artifact.limitations]},
  full_archive:structuredClone(artifact)};
}
