import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {fingerprint} from '../snapshots.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {reviewIdentities} from './identities.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=(text,context)=>{try{return JSON.parse(text);}catch{assert(false,`Invalid JSON in ${context}`);}};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);

// Digest-bound local consistency review. No API calls, writes or access clearance.
export function reviewPublicVenue(project,bytes,expectedDigest) {
 assert(project.mode==='production','Public-venue review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'Public-venue review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','Public-venue review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'Public-venue archive digest mismatch');
 const artifact=parse(bytes.toString(),'public-venue artifact');
 const schema=readYaml('spec/public-venue-review-schema.yaml',project.root);
 validateSchema(schema,artifact,'public-venue research');
 const method=readYaml('spec/public-venue-review-method.yaml',project.root);
 validateSchema(schema.definitions.method,method,'public-venue method');
 unique(method.captures,'url');unique(method.captures,'source_id');
 assert(method.id==='public-venue-review'&&method.version===1&&artifact.id===method.archive_id,'Public-venue method/archive version mismatch');
 const dependency=artifact.identity_dependency,{file,dossier_id,dossier_fingerprint}=dependency;
 assert(same({file,dossier_id,dossier_fingerprint},method.identity_dependency),'Public-venue identity dependency mismatch');
 const identity=readYaml(`data/research/${file}`,project.root);
 assert(identity.id===dossier_id&&fingerprint(identity)===dossier_fingerprint,'Public-venue identity fingerprint mismatch');
 reviewIdentities(project,identity);
 const originals=identity.identities.filter(r=>['UNI','XLM'].includes(r.asset));
 const originalSources=identity.sources.filter(s=>originals.some(r=>r.source_ids.includes(s.id)));
 const byId=rows=>[...rows].sort((a,b)=>a.id.localeCompare(b.id));
 assert(same(byId(dependency.records),byId(originals))&&same(byId(dependency.sources),byId(originalSources)),'Public-venue embedded identity/source mismatch');
 for(const source of originalSources)assert(same(project.sources.find(s=>s.id===source.id),source),'Public-venue canonical identity source conflict');
 const {captures,observations,as_of_date:day}=artifact;
 assert(day<=utcDay(Date.now())&&identity.as_of_date<=day,'Public-venue knowledge cannot be future or precede identity');
 unique(captures,'url');unique(captures,'source_id');unique(observations);
 const transport=Buffer.from(JSON.stringify(captures.map(({source_id,...capture})=>capture),null,2)+'\n');
 assert(hash(transport)===artifact.transport_archive_sha256,'Public-venue transport archive digest mismatch');
 const values=[],sourceIds=[],consumed=new Set();
 for(const expected of method.captures) {
  const capture=captures.find(c=>c.url===expected.url);
  assert(capture&&capture.source_id===expected.source_id,'Public-venue endpoint/source mismatch');
  const received=Date.parse(capture.received_at),httpDate=Date.parse(capture.http_date);
  assert(Date.parse(capture.started_at)<=received&&received<=Date.now()&&utcDay(received)===day,'Public-venue transport chronology mismatch');
  assert(Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,'Public-venue HTTP Date chronology mismatch');
  const source=project.sources.find(s=>s.id===capture.source_id);
  assert(source&&!source.fixture&&source.tier<=2&&source.url===capture.url&&source.version===expected.source_version&&
   source.supersedes===expected.supersedes&&source.covered_metrics.includes(`${expected.asset.toLowerCase()}.venue_evidence`),'Missing matching primary public-venue source/version');
  assert(source.date<=day&&Date.parse(source.retrieved_at)===received,'Public-venue source chronology mismatch');
  sourceIds.push(source.id);
  const body=parse(capture.response_json,'public-venue response');assert(object(body),'Invalid public-venue response object');
  let network;
  if(expected.kind==='currency') {
   assert(body.id===expected.asset&&body.default_network===expected.network&&Array.isArray(body.supported_networks)&&
    body.supported_networks.every(object),'Public-venue currency/network identity mismatch');
   unique(body.supported_networks);network=body.supported_networks.find(n=>n.id===body.default_network);
   assert(network,'Public-venue default network is missing');
  } else assert(body.id===`${expected.asset}-USD`&&body.base_currency===expected.asset&&body.quote_currency==='USD','Public-venue product identity mismatch');
  for(const [field,unit,label] of method.fields[expected.kind]) {
   const raw=field.startsWith('network.')?network[field.slice(8)]:body[field];
   assert(unit==='flag'?typeof raw==='boolean':typeof raw==='string'&&(unit==='address'||raw.trim().length>0),'Public-venue raw field type mismatch');
   const value=raw===''?null:raw,confidence=value===null?'unknown':'medium';
   if(unit==='address'&&expected.asset==='UNI'&&value!==null)assert(/^0x[0-9a-fA-F]{40}$/.test(value),'Public-venue invalid EVM address');
   const id=`research.${expected.asset.toLowerCase()}.coinbase.${expected.kind}.${field}@1-${day.replaceAll('-','')}`;
   const record=observations.find(o=>o.id===id);assert(record,'Missing supported public-venue observation');
   assert(record.asset===expected.asset&&record.field===field&&record.unit===unit&&same(record.source_ids,[source.id])&&
    record.as_of_date===day&&same(record.period,{basis:'point',end:day})&&record.response_received_at===capture.received_at,
    'Public-venue observation identity/source/date/unit mismatch');
   assert(same(record.raw_value,raw)&&same(record.value,value)&&record.confidence===confidence,'Public-venue raw/value/confidence mismatch');
   consumed.add(id);values.push({id,asset:expected.asset,kind:expected.kind,field,label,value,raw_value:raw,unit,confidence,
    classification:record.classification,source_id:source.id,received_at:capture.received_at,provider_state_timestamp:null});
  }
 }
 assert(consumed.size===26,'Public-venue observations do not cover exact fields');
 const [formula]=artifact.formulas,[derived]=artifact.derived;
 assert(same(formula,method.formula),'Public-venue formula version/definition mismatch');
 const deps=formula.expression.args.map(arg=>arg.record_id);
 const reported=observations.find(o=>o.id===deps[0]).value,official=originals.find(o=>o.id===deps[1]).identifier.contract_address;
 assert(/^0x[0-9a-fA-F]{40}$/.test(official),'Public-venue invalid official EVM address');
 const result=reported===null?null:reported.toLowerCase()===official.toLowerCase()?1:0;
 assert(derived.id===method.output_id&&derived.formula_id===formula.id&&derived.formula_version===formula.version&&same(derived.dependencies,deps)&&
  derived.value===result&&derived.confidence===(result===null?'unknown':'medium')&&derived.as_of_date===day&&same(derived.period,{basis:'point',end:day}),
  'Public-venue derived comparison/lineage mismatch');
 return {mode:'production',persisted:false,financial_inputs_updated:false,promoted:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[...sourceIds,...originalSources.map(s=>s.id)]},
  summary:{label:'UNI／XLM 公開市場資料包唯讀驗證',observations:26,values,address_match:structuredClone(derived),
   identity_dependencies:structuredClone(originals),access_review:structuredClone(artifact.access_review),
   limitations:['只驗證保存的公開表示及依賴一致性；沒有重新取得 API 或獨立查核平台內部狀態。',...artifact.limitations]},
  full_archive:structuredClone(artifact)};
}
