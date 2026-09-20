import {assert} from '../validation/index.js';
const arities={add:[2,Infinity],sub:[2,Infinity],mul:[2,Infinity],div:[2,2],pow:[2,2]};
export function references(expr) {
 if(typeof expr==='string') return [expr];
 if(typeof expr==='number') {assert(Number.isFinite(expr),'Non-finite formula literal'); return [];}
 assert(expr && typeof expr==='object' && !Array.isArray(expr),'Invalid formula expression');
 assert(Object.keys(expr).every(k=>['op','args'].includes(k)),'Unexpected formula expression field');
 assert(arities[expr.op]&&Array.isArray(expr.args),`Unknown formula operation: ${expr.op}`);
 const [min,max]=arities[expr.op]; assert(expr.args.length>=min&&expr.args.length<=max,`Invalid arity: ${expr.op}`);
 return [...new Set(expr.args.flatMap(references))];
}
export function evaluate(expr,metrics) {
 if(typeof expr==='number') return expr;
 if(typeof expr==='string') return metrics[expr].value;
 const values=expr.args.map(x=>evaluate(x,metrics));
 // A known zero denominator is an error even if another operand is unknown.
 if(expr.op==='div') assert(values[1]!==0,'Division by zero');
 if(values.includes(null)) return null;
 const [a,b]=values;
 const result={add:()=>values.reduce((x,y)=>x+y),sub:()=>values.slice(1).reduce((x,y)=>x-y,a),mul:()=>values.reduce((x,y)=>x*y),div:()=>a/b,pow:()=>a**b}[expr.op]();
 assert(Number.isFinite(result),'Non-finite formula result'); return result;
}
export function orderFormulas(formulas,inputIds) {
 const known=new Set(inputIds), pending=[...formulas],ordered=[];
 while(pending.length) {
  const index=pending.findIndex(f=>references(f.expression).every(id=>known.has(id)));
  assert(index>=0,`Broken dependency or formula cycle: ${pending.map(f=>f.id).join(', ')}`);
  const [formula]=pending.splice(index,1); assert(!known.has(formula.output),`Duplicate formula output: ${formula.output}`);
  known.add(formula.output); ordered.push(formula);
 }
 return ordered;
}
