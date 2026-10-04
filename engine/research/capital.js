import {readYaml} from '../index.js';
import {assert,unique,validateSchema,utcDay} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';
import {evaluate,references,orderFormulas} from '../formulas/index.js';

const prefix='research.secz.resale.';
const labels={
 'offered-common-total':'轉售表普通股欄合計（含權證標的）',
 'disclosed-earned-rights-total':'轉售表已披露 earnout 數值合計',
 'combined-offered-total':'兩欄機械合計',
 'common-less-warrant-capacity':'普通股欄扣除權證容量',
 'earnout-less-sponsor':'已披露 earnout 扣除已發行 Sponsor 條件股',
 'unreconciled-company-earnout-gap':'公司 earnout 上限與排除 Sponsor 後的未解差額',
 'stated-after-less-before':'S-1 stated-after 與 issued-before 差額'
};
const keyMetrics=['issued-before','stated-after','registered-total','opinion-issued-resale',
 'opinion-warrant-capacity','opinion-earmarked-earnout','company-earnout-capacity','sponsor-issued-conditional'];

// This verifies the saved research arithmetic, not a current share denominator.
// All values/formula versions come from the immutable artifact, outside the
// financial registry. A matching digest alone does not establish valid evidence.
export function replayCapitalReview(project,artifact) {
 assert(project.mode==='production','Capital review requires production');
 validateSchema(readYaml('spec/capital-review-schema.yaml',project.root),artifact,'capital review');
 const {id,...content}=artifact;
 assert(id===fingerprint(content),'Capital review integrity failure');
 const reviewAt=Date.parse(artifact.review.reviewed_at);
 assert(reviewAt<=Date.now(),'Capital review cannot be in the future');
 assert(artifact.as_of_date<=utcDay(Date.now()),'Capital as-of cannot be in the future');
 assert(artifact.as_of_date<=utcDay(reviewAt),'Capital review precedes artifact as-of');
 for(const records of [artifact.sources,artifact.observations,artifact.formulas,artifact.derived])unique(records);
 unique([...artifact.observations,...artifact.derived]);
 unique([...artifact.observations,...artifact.derived],'metric_id');
 unique(artifact.rows,'row');unique(artifact.formulas,'output');
 assert(artifact.context.known_rows===artifact.rows.length,'Capital row count does not match context');
 const sources=Object.fromEntries(artifact.sources.map(s=>[s.id,s]));
 for(const source of artifact.sources) {
  validateSchema(project.sourceSchema,source,'capital source');
  assert(!source.fixture,'Fixture source in capital review');
  assert(source.date<=utcDay(source.retrieved_at),'Capital source published after retrieval');
  assert(Date.parse(source.retrieved_at)<=reviewAt,'Capital source retrieved after review');
  if(source.supersedes) {
   const prior=sources[source.supersedes];
   assert(prior&&source.version>prior.version,'Invalid capital source supersession');
  }
 }
 const records=Object.fromEntries(artifact.observations.map(o=>[o.id,o]));
 const values=Object.fromEntries(artifact.observations.map(o=>[o.metric_id,o]));
 const validateRecord=(record,classification)=>{
  validateSchema(project.schema,record,'capital record');
  assert(record.classification===classification,'Invalid capital classification');
  assert(record.asset==='SECZ'&&!record.fixture,'Invalid capital asset/provenance');
  assert(record.unit==='count'&&record.period.basis==='point','Capital requires point share counts');
  assert(record.period.end<=record.as_of_date&&record.as_of_date<=artifact.as_of_date,'Invalid capital record chronology');
  assert(record.value===null||Number.isSafeInteger(record.value),'Capital share counts must be safe integers');
  assert(record.value!==null||record.confidence==='unknown','Null capital requires unknown confidence');
  assert(record.value===null||record.confidence!=='unknown','Known capital requires stated confidence');
 };
 for(const record of artifact.observations) {
  validateRecord(record,'OBSERVED');
  assert(record.value===null||record.value>=0,'Negative observed capital');
  const selected=record.source_ids.map(sourceId=>sources[sourceId]);
  assert(selected.every(Boolean),'Missing capital source');
  assert(selected.some(s=>s.tier<=2),'Capital requires tier 1 or 2 primary evidence');
  assert(selected.every(s=>s.date<=record.as_of_date),'Capital source published after observation as-of');
  assert(selected.every(s=>s.covered_metrics.includes(record.metric_id)),'Capital source does not cover observation');
 }
 const common=[],disclosed=[],rowIds=[];
 for(const [index,row] of artifact.rows.entries()) {
  assert(row.row===index+1,'Capital rows must retain consecutive original order');
  const pair=['common','earnout'].map(column=>{
   const record=records[row[`${column}_observation_id`]];
   assert(record&&record.metric_id===`${prefix}${column}-row${String(row.row).padStart(2,'0')}`,'Capital row observation mismatch');
   const cell=row[`${column}_text`],value=cell==='—'?null:Number(cell.replaceAll(',',''));
   assert(record.value===value,'Capital raw cell differs from observation');
   rowIds.push(record.id);
   return record;
  });
  assert(fingerprint(pair[0].period)===fingerprint(pair[1].period)&&pair[0].as_of_date===pair[1].as_of_date,'Capital row columns use different dates');
  common.push(pair[0].metric_id);
  if(pair[1].value!==null)disclosed.push(pair[1].metric_id);
 }
 assert(keyMetrics.every(metric=>values[prefix+metric]),'Missing capital category observation');
 assert(artifact.observations.length===rowIds.length+keyMetrics.length,'Unexpected capital observations');
 // The v1 contract explicitly sums only disclosed earnout cells; the original
 // null cells remain in the artifact and are never silently replaced with zero.
 const expr=(op,args)=>({op,args:args.map(metric=>prefix+metric)});
 const expressions={
  'offered-common-total':{op:'add',args:common},
  'disclosed-earned-rights-total':{op:'add',args:disclosed},
  'combined-offered-total':expr('add',['offered-common-total','disclosed-earned-rights-total']),
  'common-less-warrant-capacity':expr('sub',['offered-common-total','opinion-warrant-capacity']),
  'earnout-less-sponsor':expr('sub',['disclosed-earned-rights-total','sponsor-issued-conditional']),
  'unreconciled-company-earnout-gap':expr('sub',['company-earnout-capacity','earnout-less-sponsor']),
  'stated-after-less-before':expr('sub',['stated-after','issued-before'])
 };
 for(const formula of artifact.formulas) {
  references(formula.expression); // Reject unsafe ASTs before any evaluation.
  const name=formula.output.slice(prefix.length);
  assert(formula.output===prefix+name&&Object.hasOwn(expressions,name)&&formula.id===`research.secz_resale_${name}`,'Unknown capital formula');
  assert(fingerprint(formula.expression)===fingerprint(expressions[name]),'Capital formula does not match declared category arithmetic');
 }
 for(const formula of orderFormulas(artifact.formulas,Object.keys(values))) {
  const record=artifact.derived.find(r=>r.metric_id===formula.output);
  assert(record,'Missing capital derived record');
  validateRecord(record,'DERIVED');
  assert(record.formula_id===formula.id&&record.formula_version===formula.version,'Capital formula version mismatch');
  const dependencies=references(formula.expression).map(metric=>values[metric]);
  assert(fingerprint(record.dependencies)===fingerprint(dependencies.map(r=>r.id)),'Capital derived dependencies mismatch');
  assert(dependencies.every(r=>r.as_of_date<=record.as_of_date),'Capital derived precedes its evidence');
  assert(record.value===evaluate(formula.expression,values),'Capital review does not replay recorded result');
  values[formula.output]=record;
 }
 return structuredClone({artifact_id:id,kind:artifact.kind,as_of_date:artifact.as_of_date,
  persisted:false,financial_inputs_updated:false,
  notice:'僅驗證歷史披露與機械分類調節；不是現在股本、完全稀釋分母、法律判定或已完成估值。',
  summary:{rows:artifact.rows.length,observations:artifact.observations.length,
   unknown_observations:artifact.observations.filter(o=>o.value===null).length,
   checks:artifact.derived.map(record=>({label:labels[record.metric_id.slice(prefix.length)],...record})),
   unresolved:artifact.context.unresolved},
  full_review:artifact});
}
