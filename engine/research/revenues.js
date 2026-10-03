import {readYaml} from '../index.js';
import {assert,unique,validateSchema} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';
import {evaluate,references} from '../formulas/index.js';

// Separate from the annual underwriting registry: these formulas inspect raw
// reported USD flows, not USD/year, a valuation or a six-stream mapping.
const metrics=['secz.reported_tokenization_revenue','secz.reported_asset_servicing_revenue','secz.reported_total_revenue'];
const utcDay=value=>new Date(value).toISOString().slice(0,10);

export function reviewRevenues(project,dossier,{formulas=readYaml('spec/revenue-review-formulas.yaml',project.root).formulas}={}) {
 assert(project.mode==='production','Revenue review requires production');
 validateSchema(readYaml('spec/revenue-review-schema.yaml',project.root),dossier,'revenue dossier');
 validateSchema({type:'array',minItems:2,maxItems:2,items:{type:'object',additionalProperties:false,
  required:['id','version','unit','expression','null_policy'],properties:{id:{type:'string'},version:{type:'integer',minimum:1},
   unit:{enum:['USD','ratio']},expression:{type:['object','string','number']},null_policy:{type:'string',minLength:1}}}},formulas,'revenue review formulas');
 unique(formulas);
 const formulaIds=['research.revenue_reconciliation','research.revenue_yoy'];
 const expectedReferences=[['tokenization','asset_servicing','reported_total'],['current','prior']];
 formulas=formulaIds.map((id,index)=>{
  const formula=formulas.find(f=>f.id===id);
  assert(formula&&formula.unit===['USD','ratio'][index],'Unknown revenue review formula/unit');
  assert(fingerprint(references(formula.expression).sort())===fingerprint(expectedReferences[index].sort()),'Invalid revenue review formula dependencies');
  return formula;
 });
 for(const records of [dossier.sources,dossier.periods,dossier.observations,dossier.comparisons]) unique(records);
 unique(dossier.periods.map(p=>({id:`${p.basis}:${p.start}:${p.end}`})));
 unique(dossier.observations.map(o=>({id:`${o.period_id}:${o.metric_id}`})));
 unique(dossier.comparisons.map(c=>({id:`${c.current_period_id}:${c.prior_period_id}`})));
 assert(dossier.purpose.trim()&&dossier.review.reviewer.trim()&&dossier.review.rationale.trim(),'Revenue review needs purpose, reviewer and rationale');
 const reviewAt=Date.parse(dossier.review.reviewed_at),reviewDay=utcDay(reviewAt);
 assert(reviewAt<=Date.now(),'Revenue review cannot be in the future');
 assert(dossier.as_of_date<=reviewDay,'Revenue review precedes dossier as-of');
 const sources=Object.fromEntries(dossier.sources.map(s=>[s.id,s]));
 for(const source of dossier.sources) {
  validateSchema(project.sourceSchema,source,'revenue source');
  assert(!source.fixture,'Fixture source in revenue dossier');
  assert(source.date<=utcDay(source.retrieved_at),'Revenue source published after retrieval');
  assert(Date.parse(source.retrieved_at)<=reviewAt,'Revenue source retrieved after review');
 }
 const evidence=(record,metric)=>{
  assert(record.as_of_date<=dossier.as_of_date,'Revenue evidence after dossier as-of');
  const selected=record.source_ids.map(id=>sources[id]);
  assert(selected.every(Boolean),'Missing revenue source');
  assert(selected.some(s=>s.tier<=2),'Revenue evidence requires a tier 1 or 2 primary source');
  assert(selected.every(s=>s.date<=record.as_of_date),'Revenue source published after observation as-of');
  assert(selected.every(s=>s.covered_metrics.includes(metric)),'Source does not cover reported revenue evidence');
 };
 const statement=dossier.statement,filing=statement.filing;
 evidence(statement,'SECZ.financial_statement');
 assert(statement.entity_name.trim()&&statement.limitations.trim(),'Statement scope needs name and limitations');
 assert((filing.period_of_report===null||filing.period_of_report<=filing.filing_date)&&filing.financial_issuance_date<=filing.filing_date,'Filing precedes report/financial issuance');
 assert(filing.form!=='8-K/A'||filing.period_of_report!==null,'8-K/A requires its reported event date');
 assert(!filing.body_as_filed_date||filing.body_as_filed_date<=filing.filing_date,'Body as-filed date after filing index date');
 assert(filing.filing_date<=statement.as_of_date,'Statement as-of precedes filing');
 if(statement.audit_status==='audited') {
  assert(statement.audit?.auditor.trim(),'Audited statement requires audit evidence');
  evidence({as_of_date:statement.as_of_date,source_ids:statement.audit.source_ids},'SECZ.financial_statement');
  assert(statement.audit.report_date<=filing.financial_issuance_date,'Audit report after financial issuance');
  assert(dossier.periods.every(p=>p.basis==='annual'),'Audited annual dossier requires annual intervals');
 } else assert(!statement.audit,'Unaudited statement cannot claim an audit report');
 const periods=Object.fromEntries(dossier.periods.map(p=>[p.id,p]));
 for(const period of dossier.periods) {
  const {fiscal_year:year,fiscal_quarter:quarter,basis}=period;
  assert(basis!=='annual'||quarter===4,'Annual interval requires fiscal year end');
  const start=utcDay(Date.UTC(year,basis==='quarterly'?(quarter-1)*3:0,1));
  const end=utcDay(Date.UTC(year,quarter*3,0));
  assert(period.start===start&&period.end===end&&period.duration_months===(basis==='quarterly'?3:quarter*3),'Invalid calendar fiscal interval/duration');
  assert(period.end<=filing.financial_issuance_date,'Financial interval ends after issuance');
 }
 const byPeriod={};
 for(const observation of dossier.observations) {
  evidence(observation,observation.metric_id);
  assert(periods[observation.period_id],'Unknown reported revenue period');
  assert(observation.as_of_date>=statement.as_of_date,'Revenue observation precedes statement evidence');
  assert(observation.value!==null||observation.confidence==='unknown','Null revenue requires unknown confidence');
  assert(observation.value===null||observation.confidence!=='unknown','Known revenue requires stated confidence');
  (byPeriod[observation.period_id]??={})[observation.metric_id]=observation;
 }
 const derived=(id,formulaIndex,records,value,status,context)=>({
  id,classification:'DERIVED',fixture:false,value,status,
  unit:formulas[formulaIndex].unit,formula_id:formulas[formulaIndex].id,
  formula_version:formulas[formulaIndex].version,
  dependencies:records.map(r=>r.id),context_dependencies:[statement.id,...context.periods.map(p=>p.id)],
  source_ids:[...new Set([...statement.source_ids,...records.flatMap(r=>r.source_ids)])],
  confidence:value===null?'unknown':([statement,...records].some(r=>r.confidence==='low')?'low':[statement,...records].some(r=>r.confidence==='medium')?'medium':'high'),
  as_of_date:records.map(r=>r.as_of_date).sort().at(-1),...context
 });
 const reconciliations=dossier.periods.map(period=>{
  const records=metrics.map(metric=>byPeriod[period.id]?.[metric]);
  assert(records.every(Boolean),'Each interval requires both revenue categories and reported total; unknown stays null');
  const value=evaluate(formulas[0].expression,{tokenization:records[0],asset_servicing:records[1],reported_total:records[2]});
  assert(value===null||value===0,`Reported revenue categories do not reconcile: ${period.id}`);
  return derived(`${period.id}.reconciliation`,0,records,value,value===null?'UNKNOWN_INPUT':'RECONCILED',{periods:[period]});
 });
 const comparisons=dossier.comparisons.flatMap(comparison=>{
  const current=periods[comparison.current_period_id],prior=periods[comparison.prior_period_id];
  assert(current&&prior,'Unknown comparison period');
  assert(current.basis===prior.basis&&current.duration_months===prior.duration_months,'Cannot compare quarterly and year-to-date intervals');
  assert(current.fiscal_year===prior.fiscal_year+1&&current.fiscal_quarter===prior.fiscal_quarter&&current.start.slice(5)===prior.start.slice(5)&&current.end.slice(5)===prior.end.slice(5),'Year-over-year comparison requires the same fiscal interval one year earlier');
  return metrics.map(metric=>{
   const records=[byPeriod[current.id][metric],byPeriod[prior.id][metric]];
   const status=records.some(r=>r.value===null)?'UNKNOWN_INPUT':records[1].value===0?'ZERO_BASE':'AVAILABLE';
   const value=status==='AVAILABLE'?evaluate(formulas[1].expression,{current:records[0],prior:records[1]}):null;
   return derived(`${comparison.id}.${metric}`,1,records,value,status,{periods:[current,prior],kind:comparison.kind});
  });
 });
 const content=structuredClone({schema_version:1,dossier,formulas,reconciliations,comparisons,persisted:false,financial_inputs_updated:false});
 return {id:fingerprint(content),...content};
}

export function verifyRevenueReview(review) {
 const {id,...content}=review;
 assert(id===fingerprint(content),'Revenue review integrity failure');
 return review;
}
