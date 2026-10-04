import {assert} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';
import {inspectResearch} from './inspection.js';
import {sourceFreshness,ageAt,countBy,sourceDateCheck} from './freshness.js';

// Manual local inspection only. Review/observation/retrieval availability are independent.
export function researchFreshness(project,{as_of_date,policy,catalog}={}) {
 assert(project.mode==='production','Research freshness requires production mode');
 const canonical=sourceFreshness(project,{as_of_date,policy});
 const inspection=inspectResearch(project,{catalog});
 const cutoff=canonical.as_of_date,reviewPolicy=canonical.policy,sources=new Map(),usage=new Map();
 const knownSources=new Map(project.sources.map(source=>[source.id,source]));
 for(const artifact of inspection.records) {
  for(const source of artifact.sources) {
   assert(!knownSources.has(source.id)||fingerprint(knownSources.get(source.id))===fingerprint(source),`Research freshness source ID conflict: ${source.id}`);
   knownSources.set(source.id,source);
   sources.set(source.id,source);
  }
  for(const record of artifact.records) for(const id of record.source_ids||[]) {
   if(!usage.has(id))usage.set(id,[]);
   usage.get(id).push({artifact_id:artifact.artifact_id,record_id:record.id});
  }
 }
 const sourceChecks=[...sources.values()].map(source=>({source,active:usage.has(source.id),used_by:usage.get(source.id)||[],
  ...sourceDateCheck(source,cutoff,reviewPolicy)}));
 const sourceMap=new Map(sourceChecks.map(row=>[row.source.id,row]));
 const artifacts=inspection.records.map(artifact=>{
  const reviewAge=ageAt(cutoff,artifact.review.reviewed_at);
  return {id:artifact.id,kind:artifact.kind,artifact_id:artifact.artifact_id,as_of_date:artifact.as_of_date,
   review:artifact.review,periods:artifact.periods,statement:artifact.statement,comparability:artifact.comparability,
   ...(artifact.kind==='capital'?{context:artifact.context,notice:artifact.notice}:{}),
   review_age_days:reviewAge,review_state:reviewAge===null?'NOT_AVAILABLE_AT_CUTOFF':'AVAILABLE_AT_CUTOFF'};
 });
 const knownRecords=new Map();
 const records=inspection.records.flatMap((artifact,index)=>artifact.records.map(record=>{
  const {sources:embeddedSources,...original}=record;
  const period=record.period||artifact.periods.find(p=>p.id===record.period_id)||null;
  const recordDigest=fingerprint({record:original,period,statement:artifact.statement});
  assert(!knownRecords.has(record.id)||knownRecords.get(record.id)===recordDigest,`Research freshness record ID conflict: ${record.id}`);
  knownRecords.set(record.id,recordDigest);
  const metric=record.metric_id||`${record.asset}.identity`;
  const limit=reviewPolicy.observation_overrides[metric]??reviewPolicy.observation_max_age_days;
  const base={artifact_id:artifact.artifact_id,catalog_id:artifact.id,record_id:record.id,metric_id:metric,
   record:structuredClone(record),period,observation_age_days:null,observation_max_age_days:limit,
   review_state:artifacts[index].review_state,evidence_state:'INSUFFICIENT'};
  if(record.classification!=='OBSERVED')return {...base,observation_state:'NOT_OBSERVED'};
  if(record.value===null)return {...base,observation_state:'UNKNOWN_DATA'};
  const age=ageAt(cutoff,record.as_of_date),evidence=(record.source_ids||[]).map(id=>sourceMap.get(id));
  const available=age!==null&&base.review_state==='AVAILABLE_AT_CUTOFF'&&evidence.length>0&&
   evidence.every(row=>row&&row.publication_age_days!==null&&row.retrieval_age_days!==null);
  return {...base,observation_age_days:age,
   observation_state:age===null?'NOT_AVAILABLE_AT_CUTOFF':age>limit?'STALE_FOR_CURRENT_USE':'WITHIN_REVIEW_WINDOW',
   evidence_state:!available?'INSUFFICIENT':evidence.some(row=>row.retrieval_state==='RECHECK_DUE')?'RECHECK_DUE':'AVAILABLE'};
 }));
 const calculation={...canonical.calculation,dependencies:{cutoff,artifact_ids:artifacts.map(a=>a.artifact_id),
  observation_record_ids:records.filter(r=>r.record.classification==='OBSERVED').map(r=>r.record_id),
  source_ids:sourceChecks.map(r=>r.source.id),policy_id:reviewPolicy.id,policy_version:reviewPolicy.version}};
 return {...canonical,scope:'canonical_and_cataloged_research',research:{persisted:false,financial_inputs_updated:false,
  artifacts,records,source_checks:sourceChecks,calculation,
  summary:{review_states:countBy(artifacts,'review_state'),observation_states:countBy(records,'observation_state'),
   evidence_states:countBy(records,'evidence_state'),source_states:countBy(sourceChecks,'retrieval_state')},
  interpretation:'Record counts are not thesis periods. Review availability is separate from original observation/publication/retrieval dates. Existing analyst review windows apply; freshness does not resolve comparability or investability, renew observations or update financial values.'}};
}
