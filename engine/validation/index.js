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
 for(const update of event.updates) {
  assert(update.as_of_date<=event.as_of_date,'Update after event as-of date');
  if(['xlm.dtcc_live','xlm.dtcc_material'].includes(update.metric_id)&&update.value===1)assert(['live','completed'].includes(event.status),'Planned DTCC cannot become live/material');
 }
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
// Event, observation and source schemas must be validated before evidence selection.
export function checkResearchEvidence(event,sources) {
 if(event.type!=='research_refresh')return;
 assert(event.updates.length>0&&event.updates.every(m=>m.classification==='OBSERVED'),'Research refresh only accepts observations');
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 for(const update of event.updates) {
  const evidence=update.source_ids.map(id=>sourceMap.get(id));
  assert(evidence.every(Boolean),'Missing research source');
  assert(evidence.some(s=>s.tier<=2),'Research observation requires a tier 1 or 2 primary source');
  assert(evidence.every(s=>event.source_ids.includes(s.id)),'Research evidence must be declared in event sources');
  assert(evidence.every(s=>s.date<=update.as_of_date),'Research source published after observation as-of date');
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
// Point inventories that must describe one block. Model-basis flags (assumptions,
// scenarios) carry no time evidence. Real (non-fixture) readings must state the
// exact block time; synthetic fixtures may align by day only.
function sameBlockKnown(formula,dependencies) {
 const known=dependencies.filter(m=>m.value!==null&&m.period.basis!=='model');
 assert(known.every(m=>m.period.basis==='point'),`Point-in-time supply required: ${formula.id}`);
 assert(new Set(known.map(m=>m.period.end)).size<=1,`Unaligned supply dates: ${formula.id}`);
 if(known.some(m=>!m.fixture))assert(known.every(m=>m.observed_at)&&new Set(known.map(m=>Date.parse(m.observed_at))).size<=1,`Supply readings must share one block time: ${formula.id}`);
 return known;
}
export function blockTime(formula,dependencies) {
 if(formula.period_policy!=='same_block_point')return undefined;
 const known=dependencies.filter(m=>m.value!==null&&m.period.basis!=='model');
 return known.length&&known.every(m=>m.observed_at)?known[0].observed_at:undefined;
}
export function checkPeriods(formula, dependencies) {
 if(formula.period_policy==='conditional_ttm_bridge')return checkReportedTtmBridge(formula,dependencies);
 if(formula.period_policy==='reported_ttm_sum') {
  assert(formula.asset==='SECZ'&&formula.unit==='USD/year'&&dependencies.length===2,'Reported TTM sum requires two SECZ annual revenue totals');
  const known=dependencies.filter(m=>m.value!==null);
  assert(known.every(m=>m.asset==='SECZ'&&m.unit==='USD/year'&&m.period.basis==='TTM'&&m.period.start&&m.period.duration_months===12&&m.statement_context),'Reported TTM sum needs explicit twelve-month flows');
  assert(new Set(known.map(m=>JSON.stringify([m.period.basis,m.period.start,m.period.end,m.period.duration_months]))).size<=1,'Reported TTM category periods differ');
  assert(new Set(known.map(m=>JSON.stringify(['entity_name','scope','accounting_basis','audit_status'].map(k=>m.statement_context[k])))).size<=1,'Reported TTM category scopes differ');
  return known.length===2?{...known[0].period}:{basis:'model',end:dependencies.map(m=>m.period.end).sort().at(-1)};
 }
 if(formula.period_policy==='same_block_point') {
  const known=sameBlockKnown(formula,dependencies);
  // An unknown output carries no period evidence, so only a complete reading set is a dated point.
  const complete=dependencies.every(m=>m.value!==null);
  return complete&&known.length?{basis:'point',end:known[0].period.end}:{basis:'model',end:dependencies.map(m=>m.period.end).sort().at(-1)};
 }
 if(formula.period_policy==='aligned_price_valuation') {
  const price=dependencies.find(m=>m.metric_id===formula.price_input),supply=dependencies.filter(m=>m!==price);
  assert(price&&supply.length===1&&price.unit==='USD'&&supply[0].unit==='UNI'&&formula.unit==='USD','Aligned valuation requires one USD/token price and one token supply');
  assert(!dependencies.some(m=>m.valuation_date),'Aligned valuation cannot reprice a prior valuation');
  const [amount]=supply;
  if(price.value!==null)assert(price.period.basis==='point','Aligned valuation requires a point price');
  if(amount.value!==null)assert(amount.period.basis==='point','Aligned valuation requires a point supply');
  if(price.value!==null&&amount.value!==null) {
   assert(price.period.end===amount.period.end&&price.as_of_date===amount.as_of_date,`Price and supply dates are not aligned: ${formula.id}`);
   // Same-minute policy: the closed one-minute candle must contain the supply block time.
   if(!price.fixture||!amount.fixture) {
    const window=price.price_window,at=Date.parse(amount.observed_at);
    assert(window?.basis==='one_minute_close'&&Number.isFinite(at),`Real valuation requires a one-minute close and a block time: ${formula.id}`);
    const start=Date.parse(window.start),end=Date.parse(window.end);
    assert(end-start===60000&&start<=at&&at<end,`Price minute does not contain the supply block time: ${formula.id}`);
   }
  }
  return price.value!==null&&amount.value!==null?{basis:'point',end:price.period.end}:{basis:'model',end:dependencies.map(m=>m.period.end).sort().at(-1)};
 }
 if(formula.period_policy==='annual_rate_valuation') {
  const rate=dependencies.find(m=>m.metric_id===formula.rate_input),price=dependencies.find(m=>m.metric_id===formula.price_input);
  assert(rate&&price&&dependencies.length===2,'Annual-rate valuation requires its declared rate and price');
  assert(['UNI/year','XLM/year'].includes(rate.unit)&&price.unit==='USD'&&formula.unit==='USD/year'&&rate.asset===price.asset&&formula.asset===rate.asset,
   'Annual-rate valuation requires native-token/year and USD/token units');
  assert(['annual','TTM','model'].includes(rate.period.basis),'Annual-rate valuation requires an annual rate');
  assert(price.value===null||price.period.basis==='point','Annual-rate valuation requires a point quote');
  assert(!dependencies.some(m=>m.valuation_date),'Annual-rate valuation cannot reprice a prior valuation');
  if(price.value!==null&&rate.value!==null) {
   assert(rate.as_of_date<=price.as_of_date&&rate.period.end<=price.period.end,'Annual-rate valuation cannot use a later rate at an earlier quote');
   assert(rate.period.basis==='model'||rate.period.end===price.period.end,'Historical accounting flows cannot be repriced at a different endpoint');
  }
  return {basis:'model',end:price.value!==null?price.period.end:dependencies.map(m=>m.period.end).sort().at(-1)};
 }
 const valuationDates=[...new Set(dependencies.map(m=>m.valuation_date).filter(Boolean))];
 if(valuationDates.length) {
  assert(formula.period_policy==='valuation_compatible',`Explicit valuation period policy required: ${formula.id}`);
  assert(valuationDates.length===1,`Unaligned valuation dates: ${formula.id}`);
  // Unknown placeholders provide no accounting-period evidence. Known flows
  // and inventories still require an explicit common valuation endpoint.
  const known=dependencies.filter(m=>m.value!==null&&m.period.basis!=='model');
  const flows=known.filter(m=>['annual','quarterly','TTM'].includes(m.period.basis));
  assert(flows.every(m=>m.period.basis!=='quarterly'),`Incompatible accounting bases: ${formula.id}`);
  assert(new Set(flows.map(m=>m.period.basis)).size<=1,`Incompatible accounting bases: ${formula.id}`);
  assert(known.every(m=>m.period.end===valuationDates[0]),`Unaligned accounting periods: ${formula.id}`);
  return {basis:'model',end:valuationDates[0]};
 }
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

// Deliberate calendar-year FY - prior YTD + current YTD conversion. The
// comparability assumption is a dependency, not a multiplier that turns rejection into zero revenue.
function checkReportedTtmBridge(formula,dependencies) {
 const roles=formula.ttm_inputs,get=role=>dependencies.find(m=>m.metric_id===roles[role]);
 const annual=get('annual'),prior=get('prior_ytd'),current=get('current_ytd'),gate=get('comparability');
 assert(annual&&prior&&current&&gate&&dependencies.length===4,'TTM bridge needs four declared inputs');
 assert(formula.asset==='SECZ'&&formula.unit==='USD/year'&&[annual,prior,current].every(m=>m.asset==='SECZ'&&m.unit==='USD'),'TTM bridge requires SECZ USD amounts');
 assert(gate.asset==='SECZ'&&gate.unit==='ratio'&&gate.classification==='ASSUMPTION'&&[null,0,1].includes(gate.value),'TTM comparability must be an explicit 0/1/null assumption');
 const known=[annual,prior,current].filter(m=>m.value!==null);
 const scope=m=>JSON.stringify([m.statement_context?.entity_name,m.statement_context?.scope,m.statement_context?.accounting_basis]);
 assert(new Set(known.map(scope)).size<=1,'TTM statement scope/accounting context mismatch');
 for(const [m,basis,months] of [[annual,'annual',12],[prior,'year_to_date',null],[current,'year_to_date',null]]) {
  if(m.value===null)continue;
  const p=m.period,y=Number(p.end.slice(0,4));
  assert(m.classification==='OBSERVED'&&m.statement_context&&['audited','unaudited'].includes(m.statement_context.audit_status),'TTM amount needs observed statement/audit context');
  assert(m.statement_context.audit_status===(basis==='annual'?'audited':'unaudited'),'TTM policy requires audited FY and unaudited YTD; preserve their distinct audit status');
  assert(m.statement_context.scope==='operating_subsidiary_consolidated'&&m.statement_context.accounting_basis==='US_GAAP','TTM requires disclosed subsidiary US GAAP scope');
  assert(p.basis===basis&&p.start===`${y}-01-01`,'TTM bridge needs calendar annual/YTD flows, not quarterly, point or model');
  const duration=months??p.duration_months;
  assert(Number.isInteger(duration)&&duration>=1&&duration<=12&&(basis!=='year_to_date'||duration<12)&&p.duration_months===duration,'TTM amount needs an explicit valid duration');
  const expectedEnd=new Date(Date.UTC(y,duration,0)).toISOString().slice(0,10);
  assert(p.end===expectedEnd,'TTM flow dates do not match duration');
 }
 if(prior.value!==null&&annual.value!==null)assert(prior.period.start===annual.period.start&&prior.value<=annual.value,'TTM prior YTD must belong to and not exceed the full year');
 if(prior.value!==null&&current.value!==null)assert(alignedCalendarPeriods(prior.period.end,current.period.end,12)&&prior.period.duration_months===current.period.duration_months,'TTM YTD intervals must match one year apart');
 if(annual.value!==null&&current.value!==null)assert(Number(current.period.end.slice(0,4))===Number(annual.period.end.slice(0,4))+1,'TTM current YTD must follow the full year');
 if(known.length!==3)return {basis:'model',end:dependencies.map(m=>m.period.end).sort().at(-1)};
 return {basis:'TTM',start:new Date(Date.UTC(Number(annual.period.end.slice(0,4)),current.period.duration_months,1)).toISOString().slice(0,10),end:current.period.end,duration_months:12};
}
