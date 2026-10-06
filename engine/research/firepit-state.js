import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {parseRpcJson} from './fixed-block.js';
import {evmAddress,decodeAbiWord,reviewFinalizedAnchor,pinnedCall,reviewSavedDocument,reviewLineExcerpts,replayResearchFormulas} from './finalized-rpc.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),LABEL='UNI Firepit';

// Digest-bound local consistency review. No RPC, document fetch, writes, threshold history, attribution, annualization or valuation.
export function reviewUniFirepitState(project,bytes,expectedDigest) {
 assert(project.mode==='production','UNI Firepit state review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'UNI Firepit state review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','UNI Firepit state review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'UNI Firepit state archive digest mismatch');
 const artifact=parseRpcJson(bytes.toString(),'UNI Firepit state artifact');
 const schema=readYaml('spec/uni-firepit-state-schema.yaml',project.root),method=readYaml('spec/uni-firepit-state-method.yaml',project.root);
 validateSchema(schema,artifact,'UNI Firepit state research');validateSchema(schema.definitions.method,method,'UNI Firepit state method');
 unique(method.getters.map(([id])=>({id})));unique(method.formulas);unique(method.documents,'key');
 assert(method.version===1&&artifact.id===method.archive_id,'UNI Firepit method/archive version mismatch');
 assert(same(artifact.targets,method.targets),'UNI Firepit target identity mismatch');
 const context=reviewFinalizedAnchor(project,artifact,method,LABEL),{anchor,day,point,rpcSource,state,labeled,header,seconds,fixed,height}=context;
 const compact=day.replaceAll('-','');

 unique(artifact.observations);unique(artifact.observations,'key');unique(artifact.derived);unique(artifact.formulas);unique(artifact.documents,'key');
 const byKey=new Map(artifact.observations.map(o=>[o.key,o]));
 const consumed=new Set([fixed.id,height.id]),checked=new Set(),values=[];
 const onchain=(key,type,unit,label,responseId,word,value)=>{
  const o=byKey.get(key);assert(o,'Missing supported UNI Firepit observation');
  assert(o.id===`research.uni.firepit.block${anchor.number}.${key}@1`&&o.metric_id===`research.uni.firepit.${key}`&&o.label===label&&o.abi_type===type&&
   o.unit===unit&&o.as_of_date===day&&same(o.period,point)&&o.observed_at===anchor.effective_at&&same(o.source_ids,[rpcSource.id]),'UNI Firepit record identity/date/source/unit mismatch');
  assert(o.response_id===responseId&&o.response_word===word&&o.value===value,'UNI Firepit ABI/result mismatch');
  checked.add(o.id);values.push({id:o.id,key,label,abi_type:type,value,unit,classification:o.classification,confidence:o.confidence,source_id:rpcSource.id,observed_at:o.observed_at});
 };
 onchain('block_timestamp','header.timestamp','unix seconds',method.header_label,fixed.id,header.timestamp,seconds.toString());
 for(const [key,type,,selector,target,args,unit,label] of method.getters) {
  const calldata=selector+args.map(name=>method.targets[name].slice(2).padStart(64,'0')).join('');
  const call=pinnedCall(state,labeled,key,anchor,method.targets[target],calldata,LABEL);
  onchain(key,type,unit,label,call.id,call.word,decodeAbiWord(type,call.word,LABEL));consumed.add(call.id);
 }
 assert(consumed.size===state.requests.length,'UNI Firepit response IDs reused or unaccounted');
 // The product and residual only make sense for a UNI-denominated releaser paying the dead sink.
 for(const [key,target] of method.required_identities)assert(byKey.get(key).value===method.targets[target],'UNI Firepit immutable identity mismatch');

 const documents=[],documentSources=[];
 for(const rule of method.documents) {
  const doc=artifact.documents.find(d=>d.key===rule.key);assert(doc,'Missing UNI Firepit document');
  const source=reviewSavedDocument(project,doc,rule,context,LABEL);
  assert(doc.commit===method.commit&&doc.url.includes(method.commit)&&source.date===method.commit_date&&source.covered_metrics.includes(rule.covered_metric),'UNI Firepit source commit/date/coverage mismatch');
  reviewLineExcerpts(doc,rule.lines,LABEL);documentSources.push(source);
  documents.push({key:doc.key,source_id:source.id,url:doc.url,commit:doc.commit,retrieved_at:doc.received_at,body_sha256:doc.body_sha256,body_replayable:false,lines:structuredClone(doc.line_excerpts)});
 }
 for(const [key,documentKey,line,target,label] of method.document_observations) {
  const doc=artifact.documents.find(d=>d.key===documentKey),source=documentSources[method.documents.findIndex(d=>d.key===documentKey)],o=byKey.get(key);
  const text=doc.line_excerpts.find(l=>l.line===line)?.text;assert(o&&typeof text==='string','Missing UNI Firepit document line/observation');
  assert(o.id===`research.uni.firepit.docs.${key}@1-${compact}`&&o.metric_id===`research.uni.firepit.docs_${key}`&&o.label===label&&o.document_key===documentKey&&o.excerpt_line===line&&
   o.unit==='address'&&o.as_of_date===day&&same(o.period,{basis:'point',end:utcDay(doc.received_at)})&&o.observed_at===doc.received_at&&
   same(o.source_ids,[source.id]),'UNI Firepit document record identity/date/source mismatch');
  assert(evmAddress(o.value)&&text.includes(`[\`${o.value}\`]`)&&text.includes(`/address/${o.value})`)&&o.value.toLowerCase()===method.targets[target],'UNI Firepit document address mismatch');
  checked.add(o.id);values.push({id:o.id,key,label,abi_type:null,value:o.value,unit:o.unit,classification:o.classification,confidence:o.confidence,source_id:source.id,observed_at:o.observed_at});
 }
 assert(checked.size===artifact.observations.length,'UNI Firepit observations do not cover exact fields');

 const derived=replayResearchFormulas(artifact,method,context,documentSources,LABEL);
 return {mode:'production',persisted:false,financial_inputs_updated:false,promoted:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[rpcSource.id,...documentSources.map(s=>s.id)]},
  summary:{label:'UNI 主網 Firepit 狀態唯讀驗證',block_number:anchor.number,block_hash:anchor.hash,block_time:anchor.effective_at,
   retrieved_at:artifact.captured_at,source_id:rpcSource.id,observations:values.length,values,derived,commit:method.commit,commit_date:method.commit_date,documents,
   unknown:structuredClone(artifact.context),
   limitations:['只驗證已保存資料包的內部一致性與來源版本；沒有重新連 RPC、取得原始碼或獨立驗證共識 proof。',
    '次數乘以現行門檻與扣除後差額只是同區塊機械推導；不推門檻歷史、不歸因 dead 餘額、不年化，也不計估值。',...artifact.limitations]},
  full_archive:structuredClone(artifact)};
}
