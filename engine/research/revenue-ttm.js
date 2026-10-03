import {readYaml} from '../index.js';
import {assert,validateSchema} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';
import {evaluate,references} from '../formulas/index.js';
import {reviewRevenues,verifyRevenueReview} from './revenues.js';

export function reviewRevenueTtm(project,request,annual,interim,{formula=readYaml('spec/revenue-ttm-formula.yaml',project.root)}={}) {
 assert(project.mode==='production','Revenue TTM review requires production');
 validateSchema(readYaml('spec/revenue-ttm-schema.yaml',project.root),request,'revenue TTM request');
 validateSchema({type:'object',additionalProperties:false,required:['id','version','unit','expression','null_policy'],
  properties:{id:{const:'research.revenue_ttm_bridge'},version:{type:'integer',minimum:1},unit:{const:'USD'},
   expression:{type:'object'},null_policy:{type:'string',minLength:1}}},formula,'revenue TTM formula');
 assert(fingerprint(references(formula.expression).sort())===fingerprint(['annual','current_ytd','prior_ytd']),'Invalid revenue TTM formula dependencies');
 for(const artifact of [annual,interim]) {
  verifyRevenueReview(artifact);
  assert(reviewRevenues(project,artifact.dossier,{formulas:artifact.formulas}).id===artifact.id,'Revenue TTM input does not replay');
 }
 assert(request.annual_review_id===annual.id&&request.interim_review_id===interim.id,'Revenue TTM request is bound to different review IDs');
 const reviewedAt=Date.parse(request.review.reviewed_at),day=new Date(reviewedAt).toISOString().slice(0,10);
 assert(reviewedAt<=Date.now()&&request.as_of_date<=day,'Revenue TTM review has future or premature knowledge date');
 assert(request.review.reviewer.trim()&&request.review.rationale.trim()&&request.comparability.rationale.trim(),'Revenue TTM review needs rationale and reviewer');
 assert([annual,interim].every(r=>Date.parse(r.dossier.review.reviewed_at)<=reviewedAt),'Revenue TTM review predates input review');
 const a=annual.dossier,b=interim.dossier;
 const context=['asset','entity_name','scope','accounting_basis','fiscal_year_end'];
 assert(context.every(k=>a.statement[k]===b.statement[k]),'Revenue TTM statement scope/accounting context mismatch');
 const full=a.periods.find(p=>p.id===request.annual_period_id),prior=b.periods.find(p=>p.id===request.prior_ytd_period_id),current=b.periods.find(p=>p.id===request.current_ytd_period_id);
 assert(full&&prior&&current,'Unknown revenue TTM period');
 assert(full.basis==='annual'&&full.duration_months===12&&prior.basis==='year_to_date'&&current.basis==='year_to_date','Revenue TTM requires annual and YTD flows, never quarterly or pro forma flows');
 assert(prior.fiscal_year===full.fiscal_year&&current.fiscal_year===full.fiscal_year+1&&prior.duration_months===current.duration_months&&prior.fiscal_quarter===current.fiscal_quarter&&current.duration_months<12,'Revenue TTM requires the same YTD interval one year apart');
 const sources={};
 for(const source of [...a.sources,...b.sources]) {
  assert(!sources[source.id]||fingerprint(sources[source.id])===fingerprint(source),'Revenue TTM source ID conflict');
  sources[source.id]=source;
 }
 const checks=request.comparability.checks;
 for(const check of Object.values(checks)) {
  assert(check.rationale.trim(),'Revenue TTM check needs rationale');
  const evidence=check.source_ids.map(id=>sources[id]);
  assert(evidence.every(Boolean),'Missing revenue TTM comparability source');
  assert(evidence.some(s=>s.tier<=2)&&evidence.every(s=>s.covered_metrics.includes('SECZ.financial_statement')),'Revenue TTM comparability needs primary statement evidence');
  assert([a,b].every(d=>evidence.some(s=>s.tier<=2&&d.sources.some(r=>r.id===s.id))),'Revenue TTM comparability needs evidence from both filings');
  assert(evidence.every(s=>s.date<=request.as_of_date&&Date.parse(s.retrieved_at)<=reviewedAt),'Revenue TTM evidence unavailable at review cutoff');
 }
 const unconfirmed_checks=Object.entries(checks).filter(([,check])=>check.value!==true).map(([id])=>id);
 assert(unconfirmed_checks.length||request.comparability.confidence!=='unknown','Confirmed revenue TTM comparability requires stated confidence');
 const period={basis:'TTM',start:new Date(Date.UTC(full.fiscal_year,current.duration_months,1)).toISOString().slice(0,10),end:current.end,duration_months:12};
 const results=['secz.reported_tokenization_revenue','secz.reported_asset_servicing_revenue','secz.reported_total_revenue'].map(metric_id=>{
  const get=(d,p)=>d.observations.find(r=>r.metric_id===metric_id&&r.period_id===p.id);
  const records=[get(a,full),get(b,prior),get(b,current)];
  assert(records.every(r=>r&&r.unit==='USD'&&r.as_of_date<=request.as_of_date),'Revenue TTM input unavailable at cutoff');
  const [year,lastYtd,thisYtd]=records;
  assert(year.value===null||lastYtd.value===null||lastYtd.value<=year.value,'Revenue TTM prior YTD exceeds full-year revenue');
  const value=unconfirmed_checks.length?null:evaluate(formula.expression,{annual:year,prior_ytd:lastYtd,current_ytd:thisYtd});
  assert(value===null||value>=0,'Negative revenue TTM result');
  const status=unconfirmed_checks.length?'COMPARABILITY_UNVERIFIED':value===null?'UNKNOWN_INPUT':'AVAILABLE';
  const confidence=value===null?'unknown':[...records,request.comparability].some(r=>r.confidence==='low')?'low':[...records,request.comparability].some(r=>r.confidence==='medium')?'medium':'high';
  return {id:`${request.id}.${metric_id}`,metric_id,classification:'DERIVED',fixture:false,value,unit:formula.unit,period,
   as_of_date:request.as_of_date,confidence,status,formula_id:formula.id,formula_version:formula.version,
   dependencies:records.map(r=>r.id),assumption_dependencies:[request.comparability.id],
   context_dependencies:[a.statement.id,b.statement.id,full.id,prior.id,current.id],
   source_ids:[...new Set([...a.statement.source_ids,...b.statement.source_ids,...records.flatMap(r=>r.source_ids),...Object.values(checks).flatMap(c=>c.source_ids)])]};
 });
 if(results.every(r=>r.value!==null)) assert(results[0].value+results[1].value===results[2].value,'Revenue TTM categories do not reconcile');
 const content={schema_version:1,request,formula,input_reviews:{annual,interim},results,unconfirmed_checks,persisted:false,financial_inputs_updated:false,
  limitations:'Conditional reported subsidiary revenue bridge, not an observed audited TTM statement, organic/pro forma growth, historical restatement clearance, six-stream model mapping or parent valuation.'};
 return {id:fingerprint(content),...structuredClone(content)};
}

export function verifyRevenueTtm(artifact) {
 const {id,...content}=artifact;
 assert(id===fingerprint(content),'Revenue TTM review integrity failure');
 return true;
}
