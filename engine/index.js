import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import YAML from 'yaml';
import {assert,unique,validateSchema,normalize,checkPeriods,utcDay} from './validation/index.js';
import {references,evaluate,orderFormulas} from './formulas/index.js';
import {evaluateTheses} from './thesis/index.js';
import {verifySnapshot,fingerprint} from './snapshots.js';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function readYaml(file,root=ROOT) {return YAML.parse(fs.readFileSync(path.resolve(root,file),'utf8'),{uniqueKeys:true});}
export function loadProject(mode='fixture',root=ROOT) {
 assert(['fixture','production'].includes(mode),'Invalid data mode');
 const project={mode,root,schema:readYaml('spec/canonical-schema.yaml',root),sourceSchema:readYaml('spec/source-registry.yaml',root),eventSchema:readYaml('spec/event-schema.yaml',root),projectSchema:readYaml('spec/project-schema.yaml',root)};
 for(const [key,file] of Object.entries({dictionary:'data-dictionary',registry:'formula-registry',assets:'asset-registry',graph:'dependency-graph',thesis:'thesis-rules',sensitivity:'sensitivity'})) project[key]=readYaml(`spec/${file}.yaml`,root);
 const collection=(file,key,itemSchema)=>{
  const doc=readYaml(file,root);
  validateSchema({type:'object',additionalProperties:false,required:['version',key],properties:{version:{type:'integer',minimum:1},notice:{type:'string'},[key]:{type:'array',items:itemSchema}}},doc,file);
  return doc[key];
 };
 project.inputs=mode==='fixture'?collection('data/fixtures/inputs.yaml','metrics',project.schema):[...collection('data/observed/observations.yaml','metrics',project.schema),...collection('spec/assumptions.yaml','metrics',project.schema),...collection('spec/scenarios.yaml','metrics',project.schema)];
 project.sources=collection(mode==='fixture'?'data/fixtures/sources.yaml':'sources/sources.yaml','sources',project.sourceSchema);
 // Event journals are single-file immutable transactions and separated by data mode.
 const dir=path.join(root,'data/events',mode);
 if(fs.existsSync(dir)) for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()) {
  const transaction=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
  verifySnapshot(transaction.snapshot);
  const {propagated_nodes,...savedEvent}=transaction.snapshot.event;
  assert(fingerprint(savedEvent)===fingerprint(transaction.event),'Event journal does not match immutable snapshot');
  validateSchema(project.eventSchema,transaction.event,'saved event');
  project.inputs.push(...transaction.event.updates);
  project.sources.push(...(transaction.event.sources||[]));
 }
 validateProject(project);
 return project;
}
export function validateProject(p) {
 validateSchema(p.projectSchema,p,'project registries');
 unique(p.dictionary.metrics);unique(p.registry.formulas);unique(p.registry.formulas,'output');unique(p.inputs);unique(p.sources);unique(p.assets.assets);unique(p.thesis.rules);unique(p.graph.edges);
 const dictionary=Object.fromEntries(p.dictionary.metrics.map(x=>[x.id,x]));
 const sourceMap=Object.fromEntries(p.sources.map(x=>[x.id,x]));
 const nodes=new Set(p.assets.assets.map(x=>x.id));
 for(const source of p.sources) {
  validateSchema(p.sourceSchema,source,'source');
  assert(p.mode==='fixture'||!source.fixture,'Fixture source in production');
  assert(source.date<=utcDay(source.retrieved_at),'Source published after retrieval');
  if(source.supersedes) {assert(sourceMap[source.supersedes],`Missing superseded source: ${source.id}`);assert(source.version>sourceMap[source.supersedes].version,`Source version must increase: ${source.id}`);}
 }
 for(const m of p.inputs) {
  validateSchema(p.schema,m,`metric ${m.id}`);
  assert(dictionary[m.metric_id]?.kind==='input',`Unknown or derived input: ${m.metric_id}`);
  assert(m.asset===dictionary[m.metric_id].asset,`Asset mismatch: ${m.id}`);
  assert(m.classification!=='DERIVED','Stored input may not claim to be derived');
  assert(p.mode==='fixture'||!m.fixture,'Fixture data in production');
  assert(m.period.end<=m.as_of_date||m.classification==='SCENARIO',`Accounting period after as-of: ${m.id}`);
  normalize(m,dictionary[m.metric_id]);
  if(m.range) {assert(m.range[0]<=m.range[1],`Invalid scenario range: ${m.id}`);assert(m.value===null||(m.value>=m.range[0]&&m.value<=m.range[1]),`Scenario value outside range: ${m.id}`);}
  if(m.classification==='OBSERVED') {
   const sources=m.source_ids.map(id=>{assert(sourceMap[id],`Missing source: ${id}`);return sourceMap[id];});
   assert(m.fixture||sources.some(s=>s.tier<5),`Tier 5 alone cannot support observation ${m.id}`);
   assert(sources.every(s=>s.date<=m.as_of_date),`Source published after observation as-of: ${m.id}`);
   assert(sources.every(s=>s.covered_metrics.includes(m.metric_id)),`Source does not cover ${m.id}`);
   assert(m.fixture===sources.some(s=>s.fixture),`Fixture provenance mismatch: ${m.id}`);
  }
 }
 for(const f of p.registry.formulas) {
  assert(Number.isInteger(f.version)&&f.version>0,`Invalid formula version ${f.id}`);
  assert(dictionary[f.output]?.kind==='derived',`Missing derived dictionary entry ${f.output}`);
  assert(f.unit===dictionary[f.output].unit,`Formula output unit mismatch ${f.id}`);
  assert(['compatible','prior_comparison'].includes(f.period_policy),`Invalid period policy ${f.id}`);
  assert(references(f.expression).length>0,`Formula has no lineage: ${f.id}`);
 }
 orderFormulas(p.registry.formulas,p.dictionary.metrics.filter(x=>x.kind==='input').map(x=>x.id));
 for(const r of p.thesis.rules) {
  assert(nodes.has(r.asset)&&p.thesis.states.includes(r.state),'Invalid thesis asset/state');
  assert(r.classification==='ASSUMPTION'&&r.rationale,'Rule thresholds must be analyst assumptions');
  assert(Number.isInteger(r.periods)&&r.periods>0&&r.conditions.length>0,'Invalid rule period/conditions');
  for(const c of r.conditions) assert(dictionary[c.metric]&&['lt','lte','gt','gte','eq'].includes(c.operator)&&Number.isFinite(c.value),'Invalid thesis condition');
 }
 for(const e of p.graph.edges) {
  assert(nodes.has(e.from)&&nodes.has(e.to)&&p.graph.edge_types.includes(e.type),`Invalid graph edge ${e.id}`);
  assert(['direct','medium','indirect'].includes(e.transmission)&&['observed','planned','assumed'].includes(e.status)&&typeof e.economic==='boolean',`Invalid graph metadata ${e.id}`);
  assert(Array.isArray(e.source_ids)&&e.source_ids.every(id=>sourceMap[id]),`Unknown graph source ${e.id}`);
  assert(e.status==='assumed'||e.source_ids.length>0,`Graph evidence required ${e.id}`);
  assert(e.status!=='assumed'||e.rationale,`Graph assumption rationale required ${e.id}`);
  assert(!['creates_revenue','creates_token_demand','dilutes'].includes(e.type)||e.economic,`Economic edge must be explicitly classified: ${e.id}`);
 }
 assert(p.sensitivity.parameters.every(id=>dictionary[id]?.kind==='input'),'Invalid sensitivity parameter');
 assert(p.sensitivity.parameters.includes(p.sensitivity.matrix.row)&&p.sensitivity.parameters.includes(p.sensitivity.matrix.column)&&dictionary[p.sensitivity.matrix.output]?.kind==='derived','Invalid sensitivity matrix definitions');
 selectInputs(p.inputs); // validates supersession, conflicts remain errors until explicitly resolved
}
export function selectInputs(records) {
 const ids=Object.fromEntries(records.map(r=>[r.id,r])),superseded=new Set();
 for(const r of records) if(r.supersedes) {
  const old=ids[r.supersedes];assert(old&&old.metric_id===r.metric_id,`Invalid supersession: ${r.id}`);
  assert(r.version>old.version&&r.as_of_date>=old.as_of_date,`Non-monotonic supersession: ${r.id}`);
  assert(!superseded.has(r.supersedes),`Conflicting supersession branch: ${r.id}`);superseded.add(r.supersedes);
 }
 const current={};
 for(const r of records.filter(r=>!superseded.has(r.id))) {
  assert(!current[r.metric_id],`Unresolved observation conflict: ${r.metric_id}; retain both and explicitly supersede`);
  current[r.metric_id]=r;
 }
 return current;
}
export function calculate(p,{overrides={},history=[],previousThesis={}}={}) {
 const current=selectInputs(p.inputs),metrics={},issues=[];
 const defaultDate=Object.values(current).map(x=>x.period.end).sort().at(-1)||'2025-12-31';
 const definitions=Object.fromEntries(p.dictionary.metrics.map(x=>[x.id,x]));
 for(const id of Object.keys(overrides)) assert(p.sensitivity.parameters.includes(id),`Not a sensitivity parameter: ${id}`);
 for(const d of p.dictionary.metrics.filter(x=>x.kind==='input')) {
  let input=current[d.id]||{id:`${d.id}@unknown`,metric_id:d.id,asset:d.asset,value:null,unit:d.unit,classification:'ASSUMPTION',rationale:'No verified observation available. Unknown, not an estimated fact. Date is the model reference date, not an observation date.',as_of_date:defaultDate,period:{basis:'model',end:defaultDate},confidence:'unknown',version:1,fixture:false};
  if(Object.hasOwn(overrides,d.id)) input={...input,id:`${d.id}@sensitivity`,classification:'SCENARIO',source_ids:[],scenario:'Interactive sensitivity — unsaved',rationale:'User-selected counterfactual, not a new observation.',value:overrides[d.id],base_record_id:input.id,range:undefined};
  metrics[d.id]=normalize(input,d);
  if(input.value===null) issues.push({severity:'UNKNOWN',metric_id:d.id,message:'Input unavailable; downstream outputs remain unknown.'});
 }
 for(const f of orderFormulas(p.registry.formulas,Object.keys(metrics))) {
  const dependencyIds=references(f.expression),dependencies=dependencyIds.map(id=>metrics[id]);
  let value=null,period={basis:'model',end:defaultDate},error=null;
  try {period=checkPeriods(f,dependencies);value=evaluate(f.expression,metrics);} catch(e) {error=e.message;issues.push({severity:'ERROR',metric_id:f.output,message:e.message});}
  metrics[f.output]={id:`${f.output}@${f.version}`,metric_id:f.output,asset:f.asset,value,unit:f.unit,classification:'DERIVED',as_of_date:dependencies.map(x=>x.as_of_date).sort().at(-1),period,confidence:dependencies.some(x=>x.value===null)?'unknown':dependencies.some(x=>['low','unknown'].includes(x.confidence))?'low':'medium',version:f.version,fixture:dependencies.some(x=>x.fixture),formula_id:f.id,formula_version:f.version,dependencies:dependencyIds,input_record_ids:dependencies.map(x=>x.id),error};
  if(value===null&&!error) issues.push({severity:'UNKNOWN',metric_id:f.output,message:'Incomplete upstream data.'});
  validateSchema(p.schema,Object.fromEntries(Object.entries(metrics[f.output]).filter(([k])=>!['input_record_ids','error'].includes(k))),`derived ${f.output}`);
 }
 for(const id of ['uni.required_share','uni.required_share_net']) if(metrics[id].value>1) issues.push({severity:'WARNING',metric_id:id,message:'Required market share exceeds 100%: scenario is infeasible.'});
 if(metrics['uni.fdv'].value!==null&&metrics['uni.market_cap'].value!==null&&metrics['uni.fdv'].value<metrics['uni.market_cap'].value) issues.push({severity:'WARNING',metric_id:'uni.fdv',message:'FDV is below market cap; review definitions.'});
 const flows=Object.values(metrics).filter(x=>x.period.basis==='annual'||x.period.basis==='quarterly');
 const period={basis:flows.find(x=>x.period.end===defaultDate)?.period.basis||'annual',end:defaultDate};
 const thesis=evaluateTheses(p.thesis.rules,{period,metrics},history,previousThesis);
 return {mode:p.mode,fixture:p.mode==='fixture',period,metrics,issues,thesis};
}
export function lineage(p,result,id,visited=new Set()) {
 assert(result.metrics[id],`Unknown metric ${id}`);assert(!visited.has(id),`Lineage cycle ${id}`);
 const metric=result.metrics[id],next=new Set([...visited,id]);
 if(metric.classification==='DERIVED') return {metric,formula:p.registry.formulas.find(f=>f.id===metric.formula_id&&f.version===metric.formula_version),inputs:metric.dependencies.map(key=>lineage(p,result,key,next))};
 return {metric,sources:(metric.source_ids||[]).map(key=>p.sources.find(s=>s.id===key)),...(metric.base_record_id?{base_record:p.inputs.find(x=>x.id===metric.base_record_id)}:{})};
}
