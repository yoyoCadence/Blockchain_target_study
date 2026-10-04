import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {reviewFixedBlock,parseRpcJson,readRpcBatch} from './fixed-block.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

// Local, digest-bound consistency review. Never reconnects to RPC or writes data.
export function reviewTokenState(project,bytes,expectedDigest) {
 assert(project.mode==='production','Token-state review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'Token-state review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','Token-state review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'Token-state archive digest mismatch');
 const artifact=parseRpcJson(bytes.toString(),'token-state artifact');
 const schema=readYaml('spec/token-state-review-schema.yaml',project.root),method=readYaml('spec/token-state-review-method.yaml',project.root);
 validateSchema(schema,artifact,'token-state research');validateSchema(schema.definitions.method,method,'token-state method');
 unique(method.getters.map(([id])=>({id})));
 const dependency=method.owner_dependency,dependencyBytes=fs.readFileSync(path.join(project.root,'data/research',dependency.file));
 const previous=reviewFixedBlock(project,dependencyBytes,dependency.sha256).full_archive;
 const previousOwner=previous.observations.find(o=>o.id==='owner');
 assert(previous.id===dependency.archive_id&&previousOwner.response_id===dependency.response_id&&previous.source_ids.includes(dependency.source_id),'Owner method dependency mismatch');
 assert(same(artifact.owner_identity_dependency,{archive_id:dependency.archive_id,archive_sha256:dependency.sha256,
  source_id:dependency.source_id,response_id:dependency.response_id,block_hash:previous.anchor.hash}),'Owner archive dependency mismatch');
 const {anchor,transport}=artifact;
 for(const field of ['as_of_date','chain_id','number_hex','number','hash','timestamp_hex','effective_at','selector'])
  assert(same(anchor[field],previous.anchor[field]),'Token-state anchor differs from reviewed owner block');
 assert(same(new Set(anchor.source_ids),new Set([method.source_id,dependency.source_id])),'Token-state anchor sources mismatch');
 assert(artifact.token===method.targets.token&&artifact.vesting===method.targets.vesting&&artifact.owner===previousOwner.value&&
  artifact.token===previous.observations.find(o=>o.id==='UNI').value,'Token/vesting/owner identity mismatch');
 const now=Date.now(),capturedAt=Date.parse(artifact.captured_at),effectiveAt=Date.parse(anchor.effective_at);
 assert(capturedAt<=now&&anchor.as_of_date<=utcDay(now),'Token-state evidence cannot be in the future');
 assert(utcDay(capturedAt)===anchor.as_of_date&&effectiveAt<=Date.parse(transport.started_at)&&
  Date.parse(previous.captured_at)<=Date.parse(transport.started_at),'Token-state knowledge/anchor chronology mismatch');
 assert(Date.parse(transport.started_at)<=Date.parse(transport.received_at)&&Date.parse(transport.received_at)===capturedAt,'Token-state transport chronology mismatch');
 const httpDate=Date.parse(transport.http_date);
 assert(Number.isFinite(httpDate)&&httpDate<=capturedAt&&utcDay(httpDate)===anchor.as_of_date,'Token-state HTTP Date chronology mismatch');
 const source=project.sources.find(s=>s.id===method.source_id);
 assert(source&&!source.fixture&&source.tier<=2,'Missing primary production token-state source');
 assert(source.date<=anchor.as_of_date&&Date.parse(source.retrieved_at)===capturedAt,'Token-state source chronology mismatch');
 assert(new URL(source.url).href===new URL(transport.endpoint).href,'Token-state endpoint/source mismatch');
 const batch=readRpcBatch(transport,6),requests=new Map(batch.requests.map(r=>[r.id,r]));
 unique(transport.labels);unique(transport.labels,'label');
 const labels=new Map(transport.labels.map(l=>[l.id,l.label]));
 assert(batch.requests.every(r=>labels.has(r.id)),'Token-state request label mismatch');
 const chain=batch.requests.find(r=>r.method==='eth_chainId'),headerRequest=batch.requests.find(r=>r.method==='eth_getBlockByHash');
 assert(chain&&same(chain.params,[])&&batch.byId.get(chain.id).result==='0x1'&&labels.get(chain.id)==='chain','Token-state chain request/result mismatch');
 assert(headerRequest&&same(headerRequest.params,[anchor.hash,false])&&labels.get(headerRequest.id)==='fixed header','Invalid fixed block header request');
 const header=batch.byId.get(headerRequest.id).result;
 assert(header&&header.hash===anchor.hash&&header.number===anchor.number_hex&&header.timestamp===anchor.timestamp_hex,'Token-state header mismatch');
 unique(artifact.observations);unique(artifact.observations,'response_id');
 const records=new Map(artifact.observations.map(o=>[o.id,o])),id=key=>`research.uni.token-state.block${anchor.number}.${key}@1`;
 const consumed=new Set([chain.id,headerRequest.id]),values=[];
 for(const [key,type,selector,rpcLabel,unit,label,args] of method.getters) {
  const o=records.get(id(key));assert(o,'Missing supported token-state observation');
  assert(o.as_of_date===anchor.as_of_date&&same(o.source_ids,[source.id])&&same(o.period,{basis:'point',end:utcDay(effectiveAt)})&&
   Date.parse(o.observed_at)===effectiveAt&&o.unit===unit,'Token-state record date/source/unit mismatch');
  const request=requests.get(o.response_id),response=batch.byId.get(o.response_id);
  assert(request?.method==='eth_call'&&request.params.length===2&&same(request.params[1],anchor.selector),'Token-state query is not pinned to canonical block hash');
  const ownerWord=artifact.owner.slice(2).padStart(64,'0'),vestingWord=artifact.vesting.slice(2).padStart(64,'0');
  const calldata=selector+(args==='none'?'':ownerWord)+(args==='owner_vesting'?vestingWord:'');
  assert(same(request.params[0],{to:artifact.token,data:calldata})&&labels.get(request.id)===rpcLabel,'Token-state selector/contract/arguments mismatch');
  assert(response?.result===o.response_word&&BigInt(o.response_word).toString()===o.value,'Token-state ABI/result mismatch');
  assert(BigInt(o.value)<(1n<<BigInt(type.slice(4))),'Token-state ABI integer exceeds declared width');
  consumed.add(request.id);values.push({id:o.id,key,label,abi_type:type,value:o.value,unit});
 }
 assert(consumed.size===6,'Token-state response IDs reused across evidence');
 for(const [key,previousId] of [['decimals','UNI decimals'],['vesting_allowance','allowance(owner,vesting)']])
  assert(records.get(id(key)).value===previous.observations.find(o=>o.id===previousId).value,'Same-block prior allowance/decimals conflict');
 const [formula]=artifact.formulas,[derived]=artifact.derived,deps=method.formula.inputs.map(id);
 assert(formula.id===method.formula.id&&formula.version===method.formula.version&&formula.unit===method.formula.unit&&
  same(formula.expression,{op:method.formula.op,args:deps}),'Token-state formula version/expression mismatch');
 const expected=BigInt(records.get(deps[0]).value)>=BigInt(records.get(deps[1]).value)?1:0;
 assert(derived.id===id(method.formula.output)&&derived.formula_id===formula.id&&derived.formula_version===formula.version&&
  same(derived.dependencies,deps)&&derived.value===expected&&derived.as_of_date===anchor.as_of_date&&
  same(derived.period,{basis:'point',end:utcDay(effectiveAt)}),'Token-state derived comparison/lineage mismatch');
 return {mode:'production',persisted:false,financial_inputs_updated:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[source.id,dependency.source_id],owner_dependency:structuredClone(dependency)},
  summary:{label:'UNI 固定區塊餘額與供給唯讀驗證',block_number:anchor.number,block_hash:anchor.hash,block_time:anchor.effective_at,
   retrieved_at:artifact.captured_at,source_id:source.id,observations:4,values,
   balance_cover:{classification:'DERIVED',formula_id:formula.id,formula_version:formula.version,dependencies:[...deps],value:expected,unit:derived.unit},
   circulating_supply:null,fully_diluted_supply:null,
   limitations:['只驗證已保存資料包的內部一致性；沒有獨立驗證 provider 或共識 proof。',
    '餘額比較只限該區塊的這筆 allowance；完整可轉帳條件、競爭授權及未來付款仍待查證。',
    'totalSupply 不是流通／自由流通／未來完全稀釋分母；價格時點不同，不能推同步市值／FDV。',
    '不刷新原預算觀測日、推年度實際分配或判定投資論點健康。']},full_archive:structuredClone(artifact)};
}
