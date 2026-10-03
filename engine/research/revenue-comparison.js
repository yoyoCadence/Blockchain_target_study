import {assert} from '../validation/index.js';
import {readYaml} from '../index.js';
import {fingerprint} from '../snapshots.js';
import {reviewRevenues,verifyRevenueReview} from './revenues.js';

export function compareRevenueReviews(project,previous,current) {
 const method=readYaml('spec/revenue-comparison-method.yaml',project.root);
 assert(method.id==='research.revenue_review_comparison'&&method.version===1,'Unknown revenue comparison method');
 for(const review of [previous,current]) {
  verifyRevenueReview(review);
  assert(reviewRevenues(project,review.dossier,{formulas:review.formulas}).id===review.id,'Revenue review does not replay recorded results');
 }
 const old=previous.dossier,next=current.dossier;
 assert(old.as_of_date<=next.as_of_date,'Current revenue review predates previous as-of');
 const retain=(before,after,label)=>{
  for(const record of before) {
   const same=after.find(r=>r.id===record.id);
   assert(!same||fingerprint(same)===fingerprint(record),`Historical ${label} changed under the same ID: ${record.id}`);
  }
 };
 retain(old.sources,next.sources,'source');retain(old.observations,next.observations,'observation');
 retain(old.periods,next.periods,'period');retain([old.statement],[next.statement],'statement');
 for(const formula of previous.formulas) {
  const updated=current.formulas.find(f=>f.id===formula.id);
  assert(updated&&updated.version>=formula.version,'Revenue formula version regressed');
  assert(fingerprint(updated)===fingerprint(formula)||updated.version>formula.version,'Revenue formula changed without version increment');
 }
 for(const source of next.sources.filter(s=>s.supersedes&&!old.sources.some(p=>p.id===s.id))) {
  const replaced=old.sources.find(s=>s.id===source.supersedes)||next.sources.find(s=>s.id===source.supersedes);
  assert(replaced&&source.version>replaced.version,'Invalid compared source supersession');
 }
 const context_fields=['asset','entity_name','scope','accounting_basis','fiscal_year_end','audit_status'];
 const context_changes=context_fields.filter(field=>old.statement[field]!==next.statement[field]);
 const rows=dossier=>dossier.observations.map(record=>{
  const {id,...period}=dossier.periods.find(p=>p.id===record.period_id);
  return {key:fingerprint({metric_id:record.metric_id,unit:record.unit,period}),record,period};
 });
 const before=rows(old),after=rows(next),matched=[];
 for(const row of after.filter(r=>r.record.supersedes&&!before.some(p=>p.record.id===r.record.id))) {
  const prior=before.find(r=>r.record.id===row.record.supersedes);
  assert(prior&&prior.key===row.key&&row.record.version>prior.record.version,'Invalid compared observation supersession');
 }
 if(!context_changes.length) for(const row of after) {
  const prior=before.find(r=>r.key===row.key);
  if(!prior) continue;
  matched.push({metric_id:row.record.metric_id,period:row.period,previous:prior.record,current:row.record,
   lineage_status:row.record.id===prior.record.id?'SAME_RECORD':row.record.supersedes===prior.record.id?'SUPERSEDES':'INDEPENDENT_OBSERVATIONS',
   record_change:fingerprint(prior.record)!==fingerprint(row.record),value_change:prior.record.value!==row.record.value,
   conflict:row.record.id!==prior.record.id&&!row.record.supersedes&&prior.record.value!==null&&row.record.value!==null&&prior.record.value!==row.record.value,
   evidence_status:prior.record.value===null||row.record.value===null?'INSUFFICIENT':'AVAILABLE'});
 }
 const content={classification:'DERIVED',fixture:false,formula_id:method.id,formula_version:method.version,method,
  dependencies:[previous.id,current.id],previous_id:previous.id,current_id:current.id,persisted:false,
  alignment_status:context_changes.length?'CONTEXT_MISMATCH':matched.length?'MATCHED_INTERVALS':'NO_COMMON_INTERVALS',
  context_changes,source_change:fingerprint(old.sources)!==fingerprint(next.sources),
  formula_change:fingerprint(previous.formulas)!==fingerprint(current.formulas),
  statement_change:fingerprint(old.statement)!==fingerprint(next.statement),matched,
  unmatched_previous:before.filter(r=>!matched.some(m=>m.previous.id===r.record.id)),
  unmatched_current:after.filter(r=>!matched.some(m=>m.current.id===r.record.id)),
  sources:{previous:old.sources,current:next.sources},
  limitations:'Mechanical alignment is not economic comparability, correction-lineage clearance, annual/TTM mapping or a new thesis period.'};
 return {id:fingerprint(content),...structuredClone(content)};
}
