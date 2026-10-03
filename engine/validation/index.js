import Ajv from 'ajv';
import addFormats from 'ajv-formats';
export class ValidationError extends Error {
  constructor(message, details=[]) { super(message); this.name='ValidationError'; this.details=details; }
}
export const assert = (ok,message) => { if(!ok) throw new ValidationError(message); };
// Use only after schema date-time validation; retain the original timestamp.
export const utcDay = value => new Date(value).toISOString().slice(0,10);
// Calendar intervals require an aligned fixed day or two actual month ends.
// Week-based fiscal calendars need explicit support instead of month-only inference.
export function alignedCalendarPeriods(previousEnd,currentEnd,months) {
 if(![previousEnd,currentEnd].every(value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)))return false;
 const previous=new Date(`${previousEnd}T00:00:00Z`),current=new Date(`${currentEnd}T00:00:00Z`);
 if(![previous,current].every(date=>Number.isFinite(date.getTime()))||utcDay(previous)!==previousEnd||utcDay(current)!==currentEnd)return false;
 const distance=(current.getUTCFullYear()-previous.getUTCFullYear())*12+current.getUTCMonth()-previous.getUTCMonth();
 if(!Number.isInteger(months)||months<=0||distance!==months)return false;
 const monthEnd=date=>{const end=new Date(date);end.setUTCMonth(end.getUTCMonth()+1,0);return date.getUTCDate()===end.getUTCDate();};
 return previous.getUTCDate()===current.getUTCDate()||(monthEnd(previous)&&monthEnd(current));
}
const ajv = new Ajv({allErrors:true,strict:false});
addFormats(ajv);
export function validateSchema(schema, value, context) {
  const validate=ajv.compile(schema);
  if(!validate(value)) throw new ValidationError(`Invalid ${context}`, validate.errors);
}
export function unique(items, key='id') {
 const seen=new Set(); for(const item of items) {assert(!seen.has(item[key]),`Duplicate ${key}: ${item[key]}`); seen.add(item[key]);}
}
// Validate event/source schemas first; use the same evidence rules for new and saved events.
export function checkEventEvidence(event,sources,mode) {
 assert(event.as_of_date<=utcDay(Date.now()),'Event as-of cannot be in the future');
 assert(event.fixture===(mode==='fixture'),'Event data mode mismatch');
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 assert(event.source_ids.every(id=>sourceMap.has(id)),'Unknown event source');
 assert(event.source_ids.every(id=>sourceMap.get(id).date<=event.as_of_date),'Event source published after event as-of');
 if(['live','completed'].includes(event.status)) {
  assert(event.effective_date&&event.effective_date<=event.as_of_date,'Live/completed event needs a past effective date');
  assert(event.fixture||event.source_ids.some(id=>sourceMap.get(id).tier<5),'Live/completed event needs primary or credible evidence');
 }
 if(['planned','announced','cancelled'].includes(event.status))assert(event.updates.every(m=>m.classification==='SCENARIO'||m.classification==='ASSUMPTION'),'Planned/announced event cannot create live observations');
}
// Event schema and source schemas must be validated before this chronology check.
export function checkEventReview(event,sources) {
 const review=event.research_review;if(!review)return;
 assert(review.reviewer.trim()&&review.rationale.trim(),'Research review needs a reviewer and rationale');
 const reviewedAt=Date.parse(review.reviewed_at);
 assert(reviewedAt<=Date.now(),'Research review cannot be in the future');
 assert(utcDay(review.reviewed_at)>=event.as_of_date,'Research review precedes refresh as-of date');
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 const ids=new Set([...event.source_ids,...(event.sources||[]).map(s=>s.id)]);
 for(const id of ids) {
  const source=sourceMap.get(id);assert(source,`Missing research source: ${id}`);
  assert(Date.parse(source.retrieved_at)<=reviewedAt,'Research source retrieved after review');
 }
}
export function normalize(record, definition) {
 const out=structuredClone(record);
 if(out.unit==='bps' && definition.unit==='ratio') {out.original_value=out.value;out.original_unit=out.unit;out.value=out.value===null?null:out.value/10000;out.unit='ratio';}
 assert(out.unit===definition.unit,`Unit mismatch: ${out.metric_id}: ${out.unit} != ${definition.unit}`);
 assert(out.value===null||Number.isFinite(out.value),`Non-finite value: ${out.metric_id}`);
 if(out.value!==null) {
  if(out.unit.endsWith('/year')) {
   assert(['annual','TTM','model'].includes(out.period.basis),`Annual-rate unit ${out.unit} cannot use ${out.period.basis} period: ${out.metric_id}`);
   if(out.classification==='OBSERVED'&&out.period.basis==='model') assert(out.rationale?.trim(),`Observed model annual rate requires rationale: ${out.metric_id}`);
  }
  if(definition.minimum!==null) assert(out.value>=definition.minimum,`Below minimum: ${out.metric_id}`);
  if(definition.maximum!==null) assert(out.value<=definition.maximum,`Above maximum: ${out.metric_id}`);
 }
 return out;
}
export function checkPeriods(formula, dependencies) {
 const factual=dependencies.filter(x=>x.period.basis!=='model');
 const flows=factual.filter(x=>['annual','quarterly','TTM'].includes(x.period.basis));
 assert(new Set(flows.map(x=>x.period.basis)).size<=1,`Incompatible accounting bases: ${formula.id}`);
 const ends=[...new Set(factual.map(x=>x.period.end))].sort();
 if(formula.period_policy==='prior_comparison') {
  assert(ends.length<=2,`Too many accounting periods: ${formula.id}`);
  const previous=dependencies.filter(x=>x.metric_id.includes('.prior_')&&x.period.basis!=='model');
  const current=dependencies.filter(x=>!x.metric_id.includes('.prior_')&&x.period.basis!=='model');
  for(const old of previous) for(const now of current) {
   assert(old.period.end<now.period.end,`Prior period must precede current: ${formula.id}`);
   assert(alignedCalendarPeriods(old.period.end,now.period.end,now.period.basis==='quarterly'?3:12),`Non-comparable prior period: ${formula.id}`);
  }
 } else assert(ends.length<=1,`Unaligned accounting periods: ${formula.id}`);
 return {basis:flows[0]?.period.basis||factual[0]?.period.basis||'model',end:ends.at(-1)||dependencies[0].period.end};
}
