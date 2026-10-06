import {createHash} from 'node:crypto';
import {isDeepStrictEqual as same} from 'node:util';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=(text,context)=>{try{return JSON.parse(text);}catch{assert(false,`Invalid JSON in ${context}`);}};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
// Exact non-negative provider decimals; never parsed through floating point.
const scaled=(value,decimals)=>{
 assert(typeof value==='string'&&new RegExp(`^(0|[1-9][0-9]*)(\\.[0-9]{1,${decimals}})?$`).test(value),'XLM supply reported decimal format mismatch');
 const [whole,fraction='']=value.split('.');return BigInt(whole)*10n**BigInt(decimals)+BigInt(fraction.padEnd(decimals,'0'));
};
const decimal=(value,decimals)=>{
 const negative=value<0n,abs=negative?-value:value,base=10n**BigInt(decimals);
 return `${negative?'-':''}${abs/base}.${(abs%base).toString().padStart(decimals,'0')}`;
};

// Digest-bound local consistency review. No API calls, writes, ledger proof or valuation.
export function reviewXlmSupply(project,bytes,expectedDigest) {
 assert(project.mode==='production','XLM supply review requires production');
 assert(typeof expectedDigest==='string'&&/^[0-9a-f]{64}$/.test(expectedDigest),'XLM supply review requires a reviewed SHA-256 digest');
 assert(Buffer.isBuffer(bytes)||typeof bytes==='string','XLM supply review requires raw JSON bytes');
 const digest=hash(bytes);assert(digest===expectedDigest,'XLM supply archive digest mismatch');
 const artifact=parse(bytes.toString(),'XLM supply artifact');
 const schema=readYaml('spec/xlm-supply-review-schema.yaml',project.root),method=readYaml('spec/xlm-supply-review-method.yaml',project.root);
 validateSchema(schema,artifact,'XLM supply research');validateSchema(schema.definitions.method,method,'XLM supply method');
 unique(method.fields.map(([id])=>({id})));unique(method.formulas);
 assert(method.version===1&&artifact.id===method.archive_id,'XLM supply method/archive version mismatch');
 const day=artifact.as_of_date,now=Date.now(),compact=day.replaceAll('-','');
 assert(day<=utcDay(now),'XLM supply knowledge cannot be future');
 unique(artifact.captures,'url');unique(artifact.sources);unique(artifact.observations);unique(artifact.derived);unique(artifact.formulas);
 const [report,definition]=artifact.captures;
 const sources=[];
 for(const [capture,expected] of [[report,method.report_capture],[definition,method.definition_capture]]) {
  assert(capture.url===expected.url&&capture.content_type===expected.content_type,'XLM supply endpoint/content type mismatch');
  const received=Date.parse(capture.received_at),httpDate=Date.parse(capture.http_date);
  assert(Date.parse(capture.started_at)<=received&&received<=now&&utcDay(received)===day,'XLM supply transport chronology mismatch');
  assert(Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,'XLM supply HTTP Date chronology mismatch');
  const embedded=artifact.sources.find(s=>s.id===expected.source_id),source=project.sources.find(s=>s.id===expected.source_id);
  assert(embedded&&same(embedded,source),'XLM supply embedded/saved source version mismatch');
  assert(!source.fixture&&source.tier<=2&&source.url===capture.url&&source.version===expected.source_version&&
   source.supersedes===expected.supersedes,'Missing matching primary XLM supply source/version');
  assert(source.date<=day&&Date.parse(source.retrieved_at)===received,'XLM supply source chronology mismatch');
  sources.push(source);
 }
 const [reportSource,definitionSource]=sources,previous=project.sources.find(s=>s.id===definitionSource.supersedes);
 assert(previous&&!previous.fixture&&previous.url===definitionSource.url&&previous.version<definitionSource.version&&
  previous.date===definitionSource.date,'XLM supply superseded definition source mismatch');
 assert(definitionSource.covered_metrics.includes(method.definition_capture.covered_metric)&&
  definitionSource.date===artifact.context.document_last_updated_date,'XLM supply definition source/date mismatch');
 assert(hash(report.response_json)===report.body_sha256,'XLM supply response body digest mismatch');
 const body=parse(report.response_json,'XLM supply response');assert(object(body),'Invalid XLM supply response object');
 const fields=method.fields.map(([field])=>field);
 assert(same(Object.keys(body).sort(),[...fields,...method.report_capture.unmapped_fields].sort())&&
  method.report_capture.unmapped_fields.every(key=>typeof body[key]==='string'),'XLM supply response fields mismatch');
 const updatedAt=body[method.report_capture.timestamp_field],received=Date.parse(report.received_at);
 assert(typeof updatedAt==='string'&&Number.isFinite(Date.parse(updatedAt))&&new Date(updatedAt).toISOString()===updatedAt&&
  Date.parse(updatedAt)<=received&&utcDay(updatedAt)===day,'XLM supply provider update chronology mismatch');
 assert(artifact.context.provider_updated_at===updatedAt&&artifact.context.received_at===report.received_at,'XLM supply context timestamp mismatch');
 const records=new Map(),values=[];
 for(const [field,unit,label] of method.fields) {
  const raw=body[field],metricId=`research.xlm.supply.${field}`,id=`${metricId}@1-${compact}`,record=artifact.observations.find(o=>o.id===id);
  assert(record,'Missing supported XLM supply observation');
  if(unit==='XLM')scaled(raw,method.decimals);else assert(raw===updatedAt,'XLM supply provider timestamp field mismatch');
  assert(record.metric_id===metricId&&record.field===field&&record.unit===unit&&same(record.source_ids,[reportSource.id])&&
   reportSource.covered_metrics.includes(metricId)&&record.as_of_date===day&&same(record.period,{basis:'point',end:day})&&
   record.observed_at===updatedAt&&record.response_received_at===report.received_at,'XLM supply observation identity/source/date/unit mismatch');
  assert(record.raw_value===raw&&record.value===raw,'XLM supply raw/value mismatch');
  records.set(id,record);
  values.push({id,field,label,value:raw,raw_value:raw,unit,classification:record.classification,confidence:record.confidence,
   measurement_basis:record.measurement_basis,source_id:reportSource.id,observed_at:updatedAt,received_at:report.received_at});
 }
 const residuals=[];
 for(const expected of method.formulas) {
  const formula=artifact.formulas.find(f=>f.id===expected.id);
  assert(same(formula,expected),'XLM supply formula version/definition mismatch');
  assert(same(formula.method_source_ids,[definitionSource.id]),'XLM supply formula method source mismatch');
  const deps=formula.expression.args.map(arg=>arg.record_id);unique(deps.map(id=>({id})));
  assert(deps.every(id=>records.get(id)?.unit===formula.unit),'XLM supply formula dependency unit mismatch');
  const total=formula.expression.args.reduce((sum,arg)=>sum+BigInt(arg.sign)*scaled(records.get(arg.record_id).value,formula.decimals),0n);
  const value=decimal(total,formula.decimals),derived=artifact.derived.find(d=>d.formula_id===formula.id);
  assert(derived&&derived.id===`${formula.id}@1-${compact}`&&derived.metric_id===formula.id&&derived.formula_version===formula.version&&
   same(derived.dependencies,deps)&&derived.value===value&&derived.unit===formula.unit&&derived.as_of_date===day&&
   same(derived.period,{basis:'point',end:day})&&derived.observed_at===updatedAt,'XLM supply derived residual/lineage mismatch');
  residuals.push({id:derived.id,metric_id:derived.metric_id,classification:derived.classification,formula_id:formula.id,
   formula_version:formula.version,op:formula.expression.op,decimals:formula.decimals,dependencies:deps,value,unit:formula.unit,
   confidence:derived.confidence,observed_at:updatedAt});
 }
 const unknown=Object.fromEntries(Object.entries(artifact.context).filter(([,value])=>value===null));
 return {mode:'production',persisted:false,financial_inputs_updated:false,promoted:false,archive_id:artifact.id,sha256:digest,
  method:{id:method.id,version:method.version,source_ids:[reportSource.id,definitionSource.id,previous.id]},
  summary:{label:'XLM 官方回報供給資料包唯讀驗證',observations:values.length,provider_updated_at:updatedAt,received_at:report.received_at,
   body_sha256:report.body_sha256,values,residuals,
   definition:{source_id:definitionSource.id,supersedes:previous.id,document_last_updated_date:artifact.context.document_last_updated_date,
    document_date_basis:artifact.context.document_date_basis,circulating_supply_basis:artifact.context.circulating_supply_basis,
    body_sha256:definition.body_sha256,last_updated_marker:null,body_replayable:false},
   unknown,
   limitations:['只驗證保存的供應者回報、時間、來源版本與嵌入殘差算術；沒有重新取得 API、ledger 或帳戶餘額。',
    '零或非零殘差都只描述同一回應內的算術，不證明真實供給、自由流通或投資論點健康。',...artifact.limitations]},
  full_archive:structuredClone(artifact)};
}
