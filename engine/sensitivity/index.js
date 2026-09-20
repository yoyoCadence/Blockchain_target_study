import {calculate,lineage} from '../index.js';
import {assert} from '../validation/index.js';
export function sensitivity(p,overrides={},options={}) {return calculate(p,{...options,overrides});}
export function matrix(p,overrides={},options={}) {
 const m=p.sensitivity.matrix;
 assert(m.rows.length*m.columns.length<=100,'Sensitivity matrix too large');
 return {...m,cells:m.rows.map(row=>m.columns.map(column=>{const result=calculate(p,{...options,overrides:{...overrides,[m.row]:row,[m.column]:column}});return {value:result.metrics[m.output].value,issues:result.issues.filter(x=>x.severity!=='UNKNOWN'),lineage:lineage(p,result,m.output)};}))};
}
