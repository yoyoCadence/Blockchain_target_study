import {readYaml,selectInputs} from '../index.js';
import {assert,validateSchema} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';

const DAY=86_400_000;
// UTC calendar-day difference. An unavailable-at-cutoff date has no usable age.
export const ageAt=(cutoff,date)=>{
 if(!date) return null;
 const days=Math.floor(Date.parse(`${cutoff}T00:00:00Z`)/DAY)-Math.floor(Date.parse(date)/DAY);
 return days<0?null:days;
};
export const countBy=(rows,key)=>Object.fromEntries([...new Set(rows.map(r=>r[key]))].sort().map(state=>[state,rows.filter(r=>r[key]===state).length]));
export function sourceDateCheck(source,as_of_date,policy) {
 const retrievedAge=ageAt(as_of_date,source.retrieved_at);
 return {publication_age_days:ageAt(as_of_date,source.date),retrieval_age_days:retrievedAge,
  retrieval_state:retrievedAge===null?'NOT_AVAILABLE_AT_CUTOFF':retrievedAge>policy.retrieval_max_age_days?'RECHECK_DUE':'RECENTLY_RETRIEVED'};
}

export function sourceFreshness(project,{as_of_date=new Date().toISOString().slice(0,10),policy=readYaml('spec/source-freshness.yaml',project.root)}={}) {
 validateSchema({type:'string',format:'date'},as_of_date,'freshness as-of date');
 assert(as_of_date<=new Date().toISOString().slice(0,10),'Freshness cutoff cannot be in the future');
 validateSchema(readYaml('spec/source-freshness-schema.yaml',project.root),policy,'freshness policy');
 assert(policy.rationale.trim(),'Freshness policy requires a rationale');
 const definitions=project.dictionary.metrics.filter(d=>d.kind==='input');
 assert(Object.keys(policy.observation_overrides).every(id=>definitions.some(d=>d.id===id)),'Unknown freshness policy input');
 const selected=selectInputs(project.inputs),usedBy=new Map();
 for(const definition of definitions) {
  const record=selected[definition.id];
  if(record?.classification==='OBSERVED') for(const id of record.source_ids||[]) {
   if(!usedBy.has(id)) usedBy.set(id,[]);
   usedBy.get(id).push(definition.id);
  }
 }
 const sourceChecks=project.sources.map(source=>({source,active:usedBy.has(source.id),used_by:usedBy.get(source.id)||[],
  ...sourceDateCheck(source,as_of_date,policy)}));
 const sourceMap=Object.fromEntries(sourceChecks.map(row=>[row.source.id,row]));
 const inputs=definitions.map(definition=>{
  const record=selected[definition.id],limit=policy.observation_overrides[definition.id]??policy.observation_max_age_days;
  const base={metric_id:definition.id,asset:definition.asset,record_id:record?.id??null,
   ...(record?{classification:record.classification}:{}),fixture:record?.fixture??false,observation_as_of:null,
   observation_age_days:null,observation_max_age_days:limit,source_ids:record?.source_ids||[]};
  if(!record||record.value===null) return {...base,observation_state:'UNKNOWN_DATA',evidence_state:'INSUFFICIENT'};
  if(record.classification!=='OBSERVED') return {...base,observation_state:'NOT_OBSERVED',evidence_state:'INSUFFICIENT'};
  const age=ageAt(as_of_date,record.as_of_date);
  const evidence=base.source_ids.map(id=>sourceMap[id]);
  const available=evidence.length>0&&evidence.every(row=>row&&row.publication_age_days!==null&&row.retrieval_age_days!==null);
  const evidenceState=!available?'INSUFFICIENT':evidence.some(row=>row.retrieval_state==='RECHECK_DUE')?'RECHECK_DUE':'AVAILABLE';
  return {...base,observation_as_of:record.as_of_date,observation_age_days:age,
   observation_state:age===null?'NOT_AVAILABLE_AT_CUTOFF':age>limit?'STALE_FOR_CURRENT_USE':'WITHIN_REVIEW_WINDOW',evidence_state:evidenceState};
 });
 return {mode:project.mode,fixture:project.mode==='fixture',as_of_date,persisted:false,
  policy:{...structuredClone(policy),digest:fingerprint(policy)},
  calculation:{classification:'DERIVED',formula_id:'freshness.utc_calendar_days',formula_version:1,
   definition:'floor(UTC cutoff milliseconds / 86400000) - floor(UTC evidence-date milliseconds / 86400000); future dates produce null',
   dependencies:{cutoff:as_of_date,observation_record_ids:inputs.map(row=>row.record_id).filter(Boolean),source_ids:sourceChecks.map(row=>row.source.id),policy_id:policy.id,policy_version:policy.version}},
  summary:{input_states:countBy(inputs,'observation_state'),evidence_states:countBy(inputs,'evidence_state'),active_source_states:countBy(sourceChecks.filter(row=>row.active),'retrieval_state')},
  inputs,source_checks:sourceChecks,
  interpretation:'Review windows are analyst assumptions. Historical facts do not become false when old; retrieval does not renew observation as-of. Insufficient evidence is independent. No financial values or thesis states are changed.'};
}
