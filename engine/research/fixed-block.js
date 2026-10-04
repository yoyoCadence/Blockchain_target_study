import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';

const address=value=>/^0x[0-9a-f]{40}$/.test(value);
const quantity=value=>typeof value==='string'&&/^0x(0|[1-9a-f][0-9a-f]*)$/.test(value);
const same=isDeepStrictEqual;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function parseJson(value,context) {
 try {return JSON.parse(value);} catch {assert(false,`Invalid JSON in ${context}`);}
}
function batch(transport,count) {
 const requests=parseJson(transport.request_json,'RPC requests'),responses=parseJson(transport.response_json,'RPC responses');
 assert(Array.isArray(requests)&&Array.isArray(responses)&&requests.length===count&&responses.length===count,'RPC batch size mismatch');
 assert([...requests,...responses].every(r=>r&&typeof r==='object'&&!Array.isArray(r)),'Invalid RPC envelope');
 unique(requests);unique(responses);
 const byId=new Map(responses.map(r=>[r.id,r]));
 for(const request of requests) {
  assert(request.jsonrpc==='2.0'&&Number.isSafeInteger(request.id)&&request.id>0&&Array.isArray(request.params),'Invalid RPC request envelope');
  const response=byId.get(request.id);
  assert(response?.jsonrpc==='2.0'&&Object.hasOwn(response,'result')&&!Object.hasOwn(response,'error'),'RPC response ID/error mismatch');
 }
 return {requests,responses,byId};
}
export {parseJson as parseRpcJson,batch as readRpcBatch};
function decode(observation) {
 const word=observation.response_word,integer=BigInt(word);
 if(observation.abi_type==='address') {
  assert(word.slice(2,26)==='0'.repeat(24),'Nonzero ABI address padding');
  return '0x'+word.slice(-40);
 }
 const bits=Number(observation.abi_type.slice(4));
 assert(integer<(1n<<BigInt(bits)),'ABI integer exceeds declared width');
 return integer.toString();
}

// Reads bytes only. No RPC, wallet, filesystem writes, or financial ingestion.
// The caller supplies an independently reviewed SHA-256; semantic checks still
// run when a modified artifact is accompanied by its new matching digest.
export function reviewFixedBlock(project,bytes,expectedDigest) {
 assert(project.mode==='production','Fixed-block review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'Fixed-block review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','Fixed-block review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'Fixed-block archive digest mismatch');
 const artifact=parseJson(bytes.toString(),'fixed-block artifact');
 const schema=readYaml('spec/fixed-block-review-schema.yaml',project.root),method=readYaml('spec/fixed-block-review-method.yaml',project.root);
 validateSchema(schema,artifact,'fixed-block research');validateSchema(schema.definitions.method,method,'fixed-block method');
 const {getters}=method;
 assert(method.source_ids.every(id=>project.sources.some(s=>s.id===id&&!s.fixture&&s.tier<=2)),'Missing ABI method primary evidence');
 const {anchor,transport}=artifact,now=Date.now();
 const capturedAt=Date.parse(artifact.captured_at),effectiveAt=Date.parse(anchor.effective_at);
 assert(capturedAt<=now&&anchor.as_of_date<=utcDay(now),'Fixed-block evidence cannot be in the future');
 assert(utcDay(capturedAt)===anchor.as_of_date&&utcDay(effectiveAt)<=anchor.as_of_date,'Fixed-block knowledge chronology mismatch');
 assert(effectiveAt<=Date.parse(transport.probe.received_at),'Block occurs after anchor retrieval');
 for(const section of [transport.probe,transport.state]) {
  assert(Date.parse(section.started_at)<=Date.parse(section.received_at)&&Date.parse(section.received_at)<=capturedAt,'RPC transport chronology mismatch');
 }
 assert(Date.parse(transport.probe.received_at)<=Date.parse(transport.state.started_at),'State calls precede anchor capture');
 assert(capturedAt===Date.parse(transport.state.received_at),'Capture time differs from state retrieval');
 const httpDate=Date.parse(transport.state.http_date);
 assert(Number.isFinite(httpDate)&&httpDate<=now&&utcDay(httpDate)<=anchor.as_of_date,'HTTP Date knowledge chronology mismatch');
 const source=project.sources.find(s=>s.id===artifact.source_ids[0]);
 assert(source&&!source.fixture&&source.tier<=2,'Missing primary production RPC source');
 assert(source.date<=anchor.as_of_date&&Date.parse(source.retrieved_at)===capturedAt,'RPC source chronology mismatch');
 assert(transport.probe.endpoint===transport.state.endpoint&&new URL(source.url).href===new URL(transport.state.endpoint).href,'RPC endpoint/source mismatch');
 const records=[anchor,...artifact.observations,artifact.runtime_bytecode,artifact.prior_receipt_check];
 for(const record of records) {
  assert(record.as_of_date===anchor.as_of_date&&same(record.source_ids,artifact.source_ids),'RPC record source/date mismatch');
 }
 unique(artifact.observations);unique(artifact.observations,'response_id');unique(transport.labels);unique(transport.labels,'label');
 const probe=batch(transport.probe,2),state=batch(transport.state,11);
 const chainRequest=probe.requests.find(r=>r.method==='eth_chainId'),headerRequest=probe.requests.find(r=>r.method==='eth_getBlockByNumber');
 assert(chainRequest&&headerRequest&&same(chainRequest.params,[])&&same(headerRequest.params,['finalized',false]),'Invalid finalized anchor requests');
 assert(probe.byId.get(chainRequest.id).result==='0x1','RPC chain is not Ethereum mainnet');
 const header=probe.byId.get(headerRequest.id).result;
 assert(header&&quantity(header.number)&&quantity(header.timestamp),'Invalid anchor header quantities');
 assert(header.number===anchor.number_hex&&BigInt(header.number).toString()===anchor.number&&header.hash===anchor.hash&&header.timestamp===anchor.timestamp_hex,'Anchor header mismatch');
 const seconds=BigInt(header.timestamp);
 assert(seconds<=BigInt(Number.MAX_SAFE_INTEGER)&&Number.isFinite(Number(seconds)*1000),'Unsafe block timestamp');
 assert(Number(seconds)*1000===effectiveAt,'Block timestamp does not decode');
 assert(anchor.selector.blockHash===anchor.hash,'Anchor selector hash mismatch');
 const labels=new Map(transport.labels.map(l=>[l.id,l.label]));
 assert(state.requests.every(r=>labels.has(r.id)),'RPC request label mismatch');
 const observations=new Map(artifact.observations.map(o=>[o.id,o]));
 assert(getters.every(([id])=>observations.has(id)),'Missing supported UNI observation');
 const requests=new Map(state.requests.map(r=>[r.id,r]));
 const firstRequest=requests.get(observations.get('UNI').response_id),vesting=firstRequest?.params[0]?.to;
 assert(address(vesting)&&vesting===method.targets.vesting&&observations.get('UNI').value===method.targets.token,'Unsupported UNI/vesting contract identity');
 const consumed=new Set();
 for(const [id,type,selector] of getters) {
  const observation=observations.get(id),request=requests.get(observation.response_id),response=state.byId.get(observation.response_id);
  assert(observation.abi_type===type&&response?.result===observation.response_word&&decode(observation)===observation.value,'RPC observation ABI/result mismatch');
  assert(request?.method==='eth_call'&&request.params.length===2&&same(request.params[1],anchor.selector),'State query is not pinned to canonical block hash');
  const call=request.params[0],token=observations.get('UNI').value,owner=observations.get('owner').value;
  const calldata=selector||'0xdd62ed3e'+owner.slice(2).padStart(64,'0')+vesting.slice(2).padStart(64,'0');
  assert(call.to===(id==='UNI decimals'||id.startsWith('allowance(')?token:vesting)&&call.data===calldata&&Object.keys(call).length===2,'RPC selector/contract/allowance arguments mismatch');
  assert(labels.get(request.id)===id,'RPC observation label mismatch');consumed.add(request.id);
 }
 const code=artifact.runtime_bytecode,codeRequest=requests.get(code.response_id),runtime=state.byId.get(code.response_id)?.result;
 assert(codeRequest?.method==='eth_getCode'&&same(codeRequest.params,[vesting,anchor.selector])&&labels.get(codeRequest.id)==='UNIVesting runtime bytecode','Runtime query is not pinned to vesting block hash');
 assert(typeof runtime==='string'&&/^0x(?:[0-9a-f]{2})+$/.test(runtime),'Missing runtime bytecode');
 assert(hash(Buffer.from(runtime.slice(2),'hex'))===code.sha256,'Runtime SHA-256 mismatch');consumed.add(codeRequest.id);
 const recheck=requests.get(anchor.height_recheck_response_id),rechecked=state.byId.get(anchor.height_recheck_response_id)?.result;
 assert(recheck?.method==='eth_getBlockByNumber'&&same(recheck.params,[anchor.number_hex,false])&&labels.get(recheck.id)==='anchor canonical height recheck','Invalid canonical height recheck');
 assert(rechecked?.number===header.number&&rechecked.hash===header.hash&&rechecked.timestamp===header.timestamp,'Canonical height recheck mismatch');consumed.add(recheck.id);
 const receipt=artifact.prior_receipt_check,receiptRequest=requests.get(receipt.response_id);
 assert(receiptRequest?.method==='eth_getTransactionReceipt'&&same(receiptRequest.params,[receipt.transaction_hash])&&labels.get(receiptRequest.id)==='prior withdrawal receipt','Receipt request mismatch');
 assert(state.byId.get(receipt.response_id)?.result===null,'Receipt-null observation mismatch');consumed.add(receiptRequest.id);
 assert(consumed.size===11,'RPC response IDs reused across evidence');
 return {mode:'production',persisted:false,financial_inputs_updated:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[...method.source_ids]},
  summary:{label:'UNI 固定區塊資料包唯讀驗證',block_number:anchor.number,block_hash:anchor.hash,block_time:anchor.effective_at,
   retrieved_at:artifact.captured_at,source_id:source.id,observations:artifact.observations.length,
   values:getters.map(([id,type,,label])=>({id,label,abi_type:type,value:observations.get(id).value})),
   receipt_state:'RPC 無結果；原 Explorer 證據保留',deployment_source_equivalence:null,
   limitations:['驗證資料包內部一致性；未獨立驗證 provider、共識或鏈上 proof。','單點授權不代表餘額、年度實際分配、未來付款或同步估值。','部署 source 等價未驗證；不刷新原核准率的觀測日或金融數值。']},
  full_archive:structuredClone(artifact)};
}
