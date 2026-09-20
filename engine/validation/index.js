import Ajv from 'ajv';
import addFormats from 'ajv-formats';
export class ValidationError extends Error {
  constructor(message, details=[]) { super(message); this.name='ValidationError'; this.details=details; }
}
export const assert = (ok,message) => { if(!ok) throw new ValidationError(message); };
const ajv = new Ajv({allErrors:true,strict:false});
addFormats(ajv);
export function validateSchema(schema, value, context) {
  const validate=ajv.compile(schema);
  if(!validate(value)) throw new ValidationError(`Invalid ${context}`, validate.errors);
}
export function unique(items, key='id') {
 const seen=new Set(); for(const item of items) {assert(!seen.has(item[key]),`Duplicate ${key}: ${item[key]}`); seen.add(item[key]);}
}
export function normalize(record, definition) {
 const out=structuredClone(record);
 if(out.unit==='bps' && definition.unit==='ratio') {out.original_value=out.value;out.original_unit=out.unit;out.value=out.value===null?null:out.value/10000;out.unit='ratio';}
 assert(out.unit===definition.unit,`Unit mismatch: ${out.metric_id}: ${out.unit} != ${definition.unit}`);
 assert(out.value===null||Number.isFinite(out.value),`Non-finite value: ${out.metric_id}`);
 if(out.value!==null) {
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
   const months=(new Date(now.period.end).getUTCFullYear()-new Date(old.period.end).getUTCFullYear())*12+new Date(now.period.end).getUTCMonth()-new Date(old.period.end).getUTCMonth();
   assert(months===(now.period.basis==='quarterly'?3:12),`Non-comparable prior period: ${formula.id}`);
  }
 } else assert(ends.length<=1,`Unaligned accounting periods: ${formula.id}`);
 return {basis:flows[0]?.period.basis||factual[0]?.period.basis||'model',end:ends.at(-1)||dependencies[0].period.end};
}
