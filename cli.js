import fs from 'node:fs';
import {loadProject,calculate,lineage,readYaml} from './engine/index.js';
import {readSnapshots,makeSnapshot,saveSnapshot,compareSnapshots,assertVersionHistory} from './engine/snapshots.js';
import {applyEvent} from './engine/propagation/index.js';
import {prepareResearchRefresh,applyResearchRefresh} from './engine/research/index.js';
import {reviewIdentities} from './engine/research/identities.js';
import {sourceFreshness} from './engine/research/freshness.js';
import {researchFreshness} from './engine/research/research-freshness.js';
import {reviewRevenues} from './engine/research/revenues.js';
import {compareRevenueReviews} from './engine/research/revenue-comparison.js';
import {reviewRevenueTtm} from './engine/research/revenue-ttm.js';
import {replayCapitalReview} from './engine/research/capital.js';
const [command='validate',...args]=process.argv.slice(2);
const mode=args.includes('--production')?'production':'fixture';
try {
 if(command==='research-freshness'&&mode!=='production') throw new Error('Research freshness requires --production');
 if(['research-preview','research-apply','identity-review','revenue-review','revenue-compare','revenue-ttm','capital-review'].includes(command)) {
  if(mode!=='production') throw new Error('Research commands require --production');
  if(!args[0]||args[0].startsWith('--')) throw new Error(`Use node cli.js ${command} path/to/reviewed-research.yaml --production`);
 }
 const project=loadProject(mode),history=readSnapshots(project.root,mode);
 const result=calculate(project,{history,previousThesis:history.at(-1)?.thesis||{}});
 if(command==='freshness'||command==='research-freshness') {
  assertVersionHistory(history.at(-1),project);
  const cutoffIndex=args.indexOf('--as-of');
  if(cutoffIndex>=0&&(!args[cutoffIndex+1]||args[cutoffIndex+1].startsWith('--'))) throw new Error('Use --as-of YYYY-MM-DD');
  const inspect=command==='research-freshness'?researchFreshness:sourceFreshness;
  console.log(JSON.stringify(inspect(project,cutoffIndex>=0?{as_of_date:args[cutoffIndex+1]}:{}),null,2));
 } else if(command==='identity-review') {
  console.log(JSON.stringify(reviewIdentities(project,readYaml(args[0],process.cwd())),null,2));
 } else if(command==='revenue-review') {
  console.log(JSON.stringify(reviewRevenues(project,readYaml(args[0],process.cwd())),null,2));
 } else if(command==='revenue-compare') {
  if(!args[1]||args[1].startsWith('--')) throw new Error('Use node cli.js revenue-compare previous-review.json current-review.json --production');
  console.log(JSON.stringify(compareRevenueReviews(project,readYaml(args[0],process.cwd()),readYaml(args[1],process.cwd())),null,2));
 } else if(command==='revenue-ttm') {
  if(!args[1]||args[1].startsWith('--')||!args[2]||args[2].startsWith('--')) throw new Error('Use node cli.js revenue-ttm REQUEST ANNUAL_REVIEW INTERIM_REVIEW --production');
  console.log(JSON.stringify(reviewRevenueTtm(project,...args.slice(0,3).map(file=>readYaml(file,process.cwd()))),null,2));
 } else if(command==='capital-review') {
  console.log(JSON.stringify(replayCapitalReview(project,readYaml(args[0],process.cwd())),null,2));
 } else if(command==='validate') {
  assertVersionHistory(history.at(-1),project);
  for(const id of Object.keys(result.metrics)) lineage(project,result,id);
  // Validate both canonical data modes even when the selected mode is fixture.
  loadProject(mode==='fixture'?'production':'fixture');
  const errors=result.issues.filter(x=>x.severity==='ERROR');
  console.log(JSON.stringify({mode,metrics:Object.keys(result.metrics).length,formulas:project.registry.formulas.length,errors,warnings:result.issues.filter(x=>x.severity==='WARNING'),unknown:result.issues.filter(x=>x.severity==='UNKNOWN').length},null,2));
  if(errors.length) process.exitCode=1;
 } else if(command==='snapshot') {
  const reasonIndex=args.indexOf('--reason');const reason=args[reasonIndex+1];
  if(reasonIndex<0) throw new Error('Use --reason "description of material change"');
  const snapshot=makeSnapshot(project,result,{previous:history.at(-1),reason});
  console.log(saveSnapshot(project.root,snapshot));console.log(JSON.stringify(compareSnapshots(history.at(-1),snapshot),null,2));
 } else if(command==='research-preview'||command==='research-apply') {
  const proposal=readYaml(args[0],process.cwd());
  if(command==='research-preview') console.log(JSON.stringify(prepareResearchRefresh(project,proposal).preview,null,2));
  else {
   const digestIndex=args.indexOf('--digest');
   const update=applyResearchRefresh(project,proposal,digestIndex<0?null:args[digestIndex+1]);
   console.log(JSON.stringify({...update.preview,persisted:true,snapshot:update.snapshot.id},null,2));
  }
 } else if(command==='event') {
  if(!args[0]||args[0].startsWith('--')) throw new Error('Use node cli.js event path/to/event.yaml [--production]');
  const event=readYaml(args[0],process.cwd());const update=applyEvent(project,event);
  console.log(JSON.stringify({snapshot:update.snapshot.id,affected_nodes:update.affected_nodes},null,2));
 } else if(command==='report') {
  const {term}=await import('./dashboard/zh-hant.js');
  const lines=['# 目前研究論點', '', `工作區：${mode==='fixture'?'合成示範（FIXTURE）':'正式研究（PRODUCTION）'}${result.fixture?'；合成資料，非市場資料':''}`,`模型期間：${term(result.period.basis)}；${result.period.end}`, '',...Object.entries(result.thesis).flatMap(([asset,t])=>[`## ${asset}：${term(t.state)}`,`證據覆蓋：${term(t.coverage)}。${term(t.interpretation)}`,...t.triggered_rules.map(r=>`- ${r.id}（規則原文）：${r.why}`),''])];
  fs.writeFileSync('reports/current-thesis.md',lines.join('\n').trimEnd()+'\n');console.log('reports/current-thesis.md');
 } else throw new Error('Commands: validate, snapshot --reason TEXT, event FILE, research-preview FILE --production, research-apply FILE --production --digest SHA256, identity-review FILE --production, revenue-review FILE --production, revenue-compare PREVIOUS CURRENT --production, revenue-ttm REQUEST ANNUAL INTERIM --production, capital-review FILE --production, freshness [--production] [--as-of DATE], research-freshness --production [--as-of DATE], report');
} catch(error) {
 if(error.message==='Cannot snapshot calculation errors'&&error.details?.length) {
  const {metricLabel}=await import('./dashboard/zh-hant.js');
  console.error(JSON.stringify({error:error.message,message:'無法儲存研究快照：計算仍有錯誤，本次未寫入。',
   details:error.details.map(issue=>({...issue,metric_label:metricLabel(issue.metric_id)}))},null,2));
 } else console.error(error.message,error.details||'');
 process.exitCode=1;
}
