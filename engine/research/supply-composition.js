import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {parseRpcJson} from './fixed-block.js';
import {evmAddress,decodeAbiWord,reviewFinalizedAnchor,pinnedCall,reviewSavedDocument,reviewLineExcerpts,replayResearchFormulas} from './finalized-rpc.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
// The official address table renders "UNI Token" with a non-breaking space.
const NBSP=String.fromCharCode(0xa0),LABEL='UNI supply';

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
 const context=reviewFinalizedAnchor(project,artifact,method,LABEL),{anchor,day,point,rpcSource,state,labeled,header,seconds,fixed,height}=context;
 const compact=day.replaceAll('-','');

 unique(artifact.observations);unique(artifact.observations,'key');unique(artifact.derived);unique(artifact.formulas);
 const byKey=new Map(artifact.observations.map(o=>[o.key,o]));
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
  const calldata=selector+args.map(target=>method.targets[target].slice(2).padStart(64,'0')).join('');
  const call=pinnedCall(state,labeled,key,anchor,token,calldata,LABEL);
  onchain(key,type,unit,label,call.id,call.word,decodeAbiWord(type,call.word,LABEL));consumed.add(call.id);
 }
 assert(consumed.size===state.requests.length,'UNI supply response IDs reused or unaccounted');

 const [table,code]=artifact.documents,{address_table:tableRule,source_code:codeRule}=method.documents;
 const documentSources=[[table,tableRule],[code,codeRule]].map(([doc,rule])=>reviewSavedDocument(project,doc,rule,context,LABEL));
 const [tableSource,codeSource]=documentSources,modified=/^"dateModified":"([^"]+)"$/.exec(table.date_modified_marker)?.[1];
 assert(table.date_modified_marker===tableRule.date_modified_marker&&Number.isFinite(Date.parse(modified))&&tableSource.date===utcDay(modified)&&
  tableSource.covered_metrics.includes(tableRule.covered_metric),'UNI supply address table date/coverage mismatch');
 unique(table.excerpts,'label');
 for(const [label,key,target,chinese] of tableRule.excerpts) {
  const excerpt=table.excerpts.find(e=>e.label===label),o=byKey.get(key);assert(excerpt&&o,'Missing UNI supply address table excerpt/observation');
  assert(excerpt.end-excerpt.start===excerpt.html.length&&excerpt.html.startsWith('<tr>')&&excerpt.html.endsWith('</tr>')&&
   excerpt.html.replaceAll(NBSP,' ').includes(`>${label}</a>`),'UNI supply address table excerpt mismatch');
  assert(o.id===`research.uni.governance.docs.${key}@1-${compact}`&&o.metric_id===`research.uni.governance.${key}`&&o.label===chinese&&o.excerpt_label===label&&
   o.unit==='address'&&o.as_of_date===day&&same(o.period,{basis:'point',end:utcDay(table.received_at)})&&o.observed_at===table.received_at&&
   same(o.source_ids,[tableSource.id]),'UNI supply document record identity/date/source mismatch');
  assert(evmAddress(o.value)&&excerpt.html.includes(`<code>${o.value}</code>`)&&excerpt.html.includes(`/address/${o.value}"`)&&
   o.value.toLowerCase()===method.targets[target],'UNI supply document address mismatch');
  checked.add(o.id);values.push({id:o.id,key,label:chinese,abi_type:null,value:o.value,unit:o.unit,classification:o.classification,confidence:o.confidence,source_id:tableSource.id,observed_at:o.observed_at});
 }
 assert(checked.size===artifact.observations.length,'UNI supply observations do not cover exact fields');
 assert(code.commit===codeRule.commit&&code.url.includes(codeRule.commit),'UNI supply source commit mismatch');
 reviewLineExcerpts(code,codeRule.lines,LABEL);

 const derived=replayResearchFormulas(artifact,method,context,documentSources,LABEL);
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
