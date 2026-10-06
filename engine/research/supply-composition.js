import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {parseRpcJson,readRpcBatch} from './fixed-block.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const quantity=value=>typeof value==='string'&&/^0x(0|[1-9a-f][0-9a-f]*)$/.test(value);
const evmAddress=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
const RAW='UNI raw base units';
function decode(type,word) {
 assert(typeof word==='string'&&/^0x[0-9a-f]{64}$/.test(word),'UNI supply ABI response word mismatch');
 if(type==='address') {assert(word.slice(2,26)==='0'.repeat(24),'UNI supply nonzero ABI address padding');return '0x'+word.slice(26);}
 const integer=BigInt(word);assert(integer<(1n<<BigInt(type.slice(4))),'UNI supply ABI integer exceeds declared width');
 return integer.toString();
}
// Restricted research operators only; nothing here is evaluated from YAML text.
const operators={
 sub_raw_uint256:(f,inputs)=>{
  assert(inputs.every(r=>r.unit===RAW)&&f.unit===RAW,'UNI supply formula dependency unit mismatch');
  const value=inputs.slice(1).reduce((sum,r)=>sum-BigInt(r.value),BigInt(inputs[0].value));
  assert(value>=0n,'UNI supply subtraction is negative');return value.toString();
 },
 gte_uint:(f,inputs)=>{
  assert(inputs.length===2&&inputs.every(r=>r.unit==='unix seconds')&&f.unit==='ratio','UNI supply formula dependency unit mismatch');
  return BigInt(inputs[0].value)>=BigInt(inputs[1].value)?1:0;
 },
 mul_div_floor_uint256:(f,inputs)=>{
  assert(inputs.length===2&&inputs[0].unit===RAW&&inputs[1].unit==='percent'&&f.unit===RAW&&/^[1-9][0-9]*$/.test(f.expression.divisor),'UNI supply formula dependency unit mismatch');
  return (BigInt(inputs[0].value)*BigInt(inputs[1].value)/BigInt(f.expression.divisor)).toString();
 },
 casefold_evm_address_eq:(f,inputs)=>{
  assert(inputs.length===2&&inputs.every(r=>r.unit==='address'&&evmAddress(r.value))&&f.unit==='ratio','UNI supply formula dependency unit mismatch');
  return inputs[0].value.toLowerCase()===inputs[1].value.toLowerCase()?1:0;
 }
};

// Digest-bound local consistency review. No RPC, document fetch, writes, circulating-supply definition or valuation.
export function reviewUniSupplyComposition(project,bytes,expectedDigest) {
 assert(project.mode==='production','UNI supply composition review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'UNI supply composition review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','UNI supply composition review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'UNI supply composition archive digest mismatch');
 const artifact=parseRpcJson(bytes.toString(),'UNI supply composition artifact');
 const schema=readYaml('spec/uni-supply-composition-schema.yaml',project.root),method=readYaml('spec/uni-supply-composition-method.yaml',project.root);
 validateSchema(schema,artifact,'UNI supply composition research');validateSchema(schema.definitions.method,method,'UNI supply composition method');
 unique(method.getters.map(([id])=>({id})));unique(method.formulas);
 assert(method.version===1&&artifact.id===method.archive_id,'UNI supply method/archive version mismatch');
 const {token,...addresses}=method.targets;
 assert(artifact.token===token&&same(artifact.addresses,addresses),'UNI supply target identity mismatch');
 const {anchor,transport}=artifact,day=artifact.as_of_date,compact=day.replaceAll('-',''),now=Date.now();
 const capturedAt=Date.parse(artifact.captured_at),effectiveAt=Date.parse(anchor.effective_at),point={basis:'point',end:utcDay(effectiveAt)};
 assert(capturedAt<=now&&day<=utcDay(now),'UNI supply evidence cannot be in the future');
 assert(utcDay(capturedAt)===day&&anchor.as_of_date===day&&effectiveAt<=Date.parse(transport.probe.received_at),'UNI supply knowledge/anchor chronology mismatch');
 for(const section of [transport.probe,transport.state]) {
  const received=Date.parse(section.received_at),httpDate=Date.parse(section.http_date);
  assert(section.endpoint===method.endpoint,'UNI supply RPC endpoint mismatch');
  assert(Date.parse(section.started_at)<=received&&received<=capturedAt,'UNI supply RPC transport chronology mismatch');
  assert(Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,'UNI supply HTTP Date chronology mismatch');
 }
 assert(Date.parse(transport.probe.received_at)<=Date.parse(transport.state.started_at)&&capturedAt===Date.parse(transport.state.received_at),'UNI supply state capture order mismatch');
 const saved=id=>project.sources.find(s=>s.id===id),rpcSource=saved(method.rpc_source_id);
 assert(same(anchor.source_ids,[method.rpc_source_id])&&rpcSource&&!rpcSource.fixture&&rpcSource.tier<=2,'Missing primary production UNI supply RPC source');
 assert(rpcSource.date<=day&&Date.parse(rpcSource.retrieved_at)===capturedAt&&new URL(rpcSource.url).href===new URL(method.endpoint).href,'UNI supply RPC source chronology/endpoint mismatch');

 const probe=readRpcBatch(transport.probe,2),state=readRpcBatch(transport.state,method.getters.length+2);
 unique(transport.labels);unique(transport.labels,'label');
 const labels=new Map(transport.labels.map(l=>[l.id,l.label])),labeled=name=>r=>labels.get(r.id)===name;
 assert([...probe.requests,...state.requests].every(r=>labels.has(r.id)),'UNI supply request label mismatch');
 const chain=probe.requests.find(labeled('chain')),finalized=probe.requests.find(labeled('finalized'));
 assert(chain?.method==='eth_chainId'&&same(chain.params,[])&&finalized?.method==='eth_getBlockByNumber'&&same(finalized.params,['finalized',false]),'Invalid UNI supply finalized anchor requests');
 assert(probe.byId.get(chain.id).result==='0x'+BigInt(method.chain_id).toString(16),'UNI supply RPC chain mismatch');
 const header=probe.byId.get(finalized.id).result;
 assert(header&&quantity(header.number)&&quantity(header.timestamp),'Invalid UNI supply anchor header quantities');
 const matches=block=>block&&block.hash===anchor.hash&&block.number===anchor.number_hex&&block.timestamp===anchor.timestamp_hex;
 assert(matches(header)&&BigInt(header.number).toString()===anchor.number&&anchor.selector.blockHash===anchor.hash,'UNI supply anchor header mismatch');
 const seconds=BigInt(header.timestamp);
 assert(seconds<=BigInt(Number.MAX_SAFE_INTEGER)&&Number(seconds)*1000===effectiveAt,'UNI supply block timestamp does not decode');
 const fixed=state.requests.find(labeled('fixed header')),height=state.requests.find(r=>r.id===anchor.height_recheck_response_id);
 assert(fixed?.method==='eth_getBlockByHash'&&same(fixed.params,[anchor.hash,false])&&matches(state.byId.get(fixed.id).result),'UNI supply fixed header recheck mismatch');
 assert(height?.method==='eth_getBlockByNumber'&&same(height.params,[anchor.number_hex,false])&&labels.get(height.id)==='height recheck'&&
  matches(state.byId.get(height.id).result),'UNI supply canonical height recheck mismatch');

 unique(artifact.observations);unique(artifact.observations,'key');unique(artifact.derived);unique(artifact.formulas);
 const byKey=new Map(artifact.observations.map(o=>[o.key,o])),requests=new Map(state.requests.map(r=>[r.id,r]));
 const consumed=new Set([fixed.id,height.id]),checked=new Set(),values=[];
 const onchain=(key,type,unit,label,responseId,word,value)=>{
  const o=byKey.get(key);assert(o,'Missing supported UNI supply observation');
  assert(o.id===`research.uni.supply.block${anchor.number}.${key}@1`&&o.metric_id===`research.uni.supply.${key}`&&o.label===label&&o.abi_type===type&&
   o.unit===unit&&o.as_of_date===day&&same(o.period,point)&&o.observed_at===anchor.effective_at&&same(o.source_ids,[rpcSource.id]),'UNI supply record identity/date/source/unit mismatch');
  assert(o.response_id===responseId&&o.response_word===word&&o.value===value,'UNI supply ABI/result mismatch');
  checked.add(o.id);values.push({id:o.id,key,label,abi_type:type,value,unit,classification:o.classification,confidence:o.confidence,source_id:rpcSource.id,observed_at:o.observed_at});
 };
 onchain('block_timestamp','header.timestamp','unix seconds',method.header_label,fixed.id,header.timestamp,seconds.toString());
 for(const [key,type,,selector,args,unit,label] of method.getters) {
  const request=state.requests.find(labeled(key)),response=request&&state.byId.get(request.id);
  assert(request?.method==='eth_call'&&request.params.length===2&&same(request.params[1],anchor.selector),'UNI supply query is not pinned to canonical block hash');
  const calldata=selector+args.map(target=>method.targets[target].slice(2).padStart(64,'0')).join('');
  assert(same(request.params[0],{to:token,data:calldata}),'UNI supply selector/contract/arguments mismatch');
  onchain(key,type,unit,label,request.id,response.result,decode(type,response.result));consumed.add(request.id);
 }
 assert(consumed.size===requests.size,'UNI supply response IDs reused or unaccounted');

 const [table,code]=artifact.documents,{address_table:tableRule,source_code:codeRule}=method.documents,documentSources=[];
 for(const [doc,rule] of [[table,tableRule],[code,codeRule]]) {
  const received=Date.parse(doc.received_at),httpDate=Date.parse(doc.http_date),source=saved(rule.source_id);
  assert(doc.url===rule.url&&doc.source_id===rule.source_id,'UNI supply document endpoint/source mismatch');
  assert(Date.parse(doc.started_at)<=received&&received<=capturedAt&&utcDay(received)===day&&Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,'UNI supply document chronology mismatch');
  assert(source&&!source.fixture&&source.tier<=2&&source.url===doc.url,'Missing primary UNI supply document source');
  assert(source.date<=day&&Date.parse(source.retrieved_at)===received,'UNI supply document source chronology mismatch');
  documentSources.push(source);
 }
 const [tableSource,codeSource]=documentSources,modified=/^"dateModified":"([^"]+)"$/.exec(table.date_modified_marker)?.[1];
 assert(table.date_modified_marker===tableRule.date_modified_marker&&Number.isFinite(Date.parse(modified))&&tableSource.date===utcDay(modified)&&
  tableSource.covered_metrics.includes(tableRule.covered_metric),'UNI supply address table date/coverage mismatch');
 unique(table.excerpts,'label');
 for(const [label,key,target,chinese] of tableRule.excerpts) {
  const excerpt=table.excerpts.find(e=>e.label===label),o=byKey.get(key);assert(excerpt&&o,'Missing UNI supply address table excerpt/observation');
  assert(excerpt.end-excerpt.start===excerpt.html.length&&excerpt.html.startsWith('<tr>')&&excerpt.html.endsWith('</tr>')&&
   excerpt.html.replaceAll(' ',' ').includes(`>${label}</a>`),'UNI supply address table excerpt mismatch');
  assert(o.id===`research.uni.governance.docs.${key}@1-${compact}`&&o.metric_id===`research.uni.governance.${key}`&&o.label===chinese&&o.excerpt_label===label&&
   o.unit==='address'&&o.as_of_date===day&&same(o.period,{basis:'point',end:utcDay(table.received_at)})&&o.observed_at===table.received_at&&
   same(o.source_ids,[tableSource.id]),'UNI supply document record identity/date/source mismatch');
  assert(evmAddress(o.value)&&excerpt.html.includes(`<code>${o.value}</code>`)&&excerpt.html.includes(`/address/${o.value}"`)&&
   o.value.toLowerCase()===method.targets[target],'UNI supply document address mismatch');
  checked.add(o.id);values.push({id:o.id,key,label:chinese,abi_type:null,value:o.value,unit:o.unit,classification:o.classification,confidence:o.confidence,source_id:tableSource.id,observed_at:o.observed_at});
 }
 assert(checked.size===artifact.observations.length,'UNI supply observations do not cover exact fields');
 assert(code.commit===codeRule.commit&&code.url.includes(codeRule.commit),'UNI supply source commit mismatch');
 unique(code.line_excerpts,'line');
 assert(code.line_excerpts.length===codeRule.lines.length&&codeRule.lines.every(([line,fragment])=>code.line_excerpts.find(l=>l.line===line)?.text.includes(fragment)),'UNI supply source line excerpt mismatch');

 const records=new Map(artifact.observations.map(o=>[o.id,o])),derived=[];
 for(const expected of method.formulas) {
  const formula=artifact.formulas.find(f=>f.id===expected.id);
  assert(same(formula,expected)&&Object.hasOwn(operators,formula.expression.op),'UNI supply formula version/definition mismatch');
  assert(formula.method_source_ids.every(id=>documentSources.some(s=>s.id===id)),'UNI supply formula method source mismatch');
  const deps=formula.expression.args,inputs=deps.map(id=>records.get(id));
  assert(new Set(deps).size===deps.length&&inputs.every(Boolean),'UNI supply formula dependency mismatch');
  const value=operators[formula.expression.op](formula,inputs),d=artifact.derived.find(r=>r.formula_id===formula.id);
  assert(d&&d.id===`${formula.id}@1-block${anchor.number}`&&d.metric_id===formula.id&&d.formula_version===formula.version&&same(d.dependencies,deps)&&
   d.value===value&&d.unit===formula.unit&&d.as_of_date===day&&same(d.period,point)&&d.observed_at===anchor.effective_at,'UNI supply derived value/lineage mismatch');
  derived.push({id:d.id,label:method.derived_labels[formula.id],classification:d.classification,confidence:d.confidence,formula_id:formula.id,
   formula_version:formula.version,op:formula.expression.op,dependencies:[...deps],value,unit:formula.unit});
 }
 return {mode:'production',persisted:false,financial_inputs_updated:false,promoted:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[rpcSource.id,tableSource.id,codeSource.id]},
  summary:{label:'UNI 固定區塊供給組成唯讀驗證',block_number:anchor.number,block_hash:anchor.hash,block_time:anchor.effective_at,
   retrieved_at:artifact.captured_at,source_id:rpcSource.id,observations:values.length,values,derived,
   documents:{address_table:{source_id:tableSource.id,url:table.url,date_modified:modified,retrieved_at:table.received_at,body_sha256:table.body_sha256,body_replayable:false,
     excerpt_labels:tableRule.excerpts.map(([label])=>label)},
    source_code:{source_id:codeSource.id,url:code.url,commit:code.commit,retrieved_at:code.received_at,body_sha256:code.body_sha256,body_replayable:false,
     lines:structuredClone(code.line_excerpts)}},
   unknown:structuredClone(artifact.context),
   limitations:['只驗證已保存資料包的內部一致性與來源版本；沒有重新連 RPC、取得文件或獨立驗證共識 proof。',
    '扣除後餘額與鑄造條件只是同區塊機械推導，不定義流通供給、不預測鑄造，也不計市值／FDV。',...artifact.limitations]},
  full_archive:structuredClone(artifact)};
}
