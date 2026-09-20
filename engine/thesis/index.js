const rank=['HEALTHY','WATCH','STRESS','BREAK_CANDIDATE','INVALIDATED'];
const operators={lt:(a,b)=>a<b,lte:(a,b)=>a<=b,gt:(a,b)=>a>b,gte:(a,b)=>a>=b,eq:(a,b)=>a===b};
function consecutive(frames) {
 for(let i=1;i<frames.length;i++) {
  const a=frames[i-1].period,b=frames[i].period;
  if(a.basis!==b.basis) return false;
  const da=new Date(a.end),db=new Date(b.end);
  const months=(db.getUTCFullYear()-da.getUTCFullYear())*12+db.getUTCMonth()-da.getUTCMonth();
  if(months!==(b.basis==='quarterly'?3:12)) return false;
 }
 return true;
}
export function evaluateTheses(rules,current,history=[],previousThesis={}) {
 // Latest revision per period wins; repeated snapshots cannot manufacture persistence.
 const byPeriod=new Map();
 for(const frame of [...history,current]) if(frame.period.end<=current.period.end && frame.period.basis===current.period.basis) byPeriod.set(`${frame.period.basis}:${frame.period.end}`,frame);
 const frames=[...byPeriod.values()].sort((a,b)=>a.period.end.localeCompare(b.period.end));
 return Object.fromEntries(['UNI','SECZ','XLM'].map(asset=>{
  const evaluations=rules.filter(r=>r.asset===asset).map(rule=>{
   const window=frames.slice(-rule.periods);
   const evidence=window.map(frame=>({period:frame.period,conditions:rule.conditions.map(c=>({...c,actual:frame.metrics[c.metric]?.value??null,record_id:frame.metrics[c.metric]?.id??null}))}));
   const sufficient=window.length===rule.periods&&consecutive(window)&&evidence.every(e=>e.conditions.every(c=>c.actual!==null));
   const triggered=sufficient&&evidence.every(e=>e.conditions.every(c=>operators[c.operator](c.actual,c.value)));
   return {id:rule.id,state:rule.state,why:rule.why,classification:rule.classification,rationale:rule.rationale,sufficient,triggered,evidence};
  });
  const triggered=evaluations.filter(x=>x.triggered);
  const state=triggered.reduce((s,r)=>rank.indexOf(r.state)>rank.indexOf(s)?r.state:s,'HEALTHY');
  const complete=evaluations.every(r=>r.sufficient);
  return [asset,{state,coverage:complete?'complete':'insufficient',interpretation:state==='HEALTHY'&&!complete?'No confirmed trigger; insufficient evidence. Not an affirmative healthy thesis.':'Rule-based research monitoring; not an investment recommendation.',triggered_rules:triggered,rule_evaluations:evaluations,last_changed:previousThesis[asset]?.state===state?previousThesis[asset].last_changed:current.period.end}];
 }));
}
