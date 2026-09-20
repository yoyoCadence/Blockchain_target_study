import fs from 'node:fs';
import {loadProject,calculate,lineage,readYaml} from './engine/index.js';
import {readSnapshots,makeSnapshot,saveSnapshot,compareSnapshots,assertVersionHistory} from './engine/snapshots.js';
import {applyEvent} from './engine/propagation/index.js';
const [command='validate',...args]=process.argv.slice(2);
const mode=args.includes('--production')?'production':'fixture';
try {
 const project=loadProject(mode),history=readSnapshots(project.root,mode);
 const result=calculate(project,{history,previousThesis:history.at(-1)?.thesis||{}});
 if(command==='validate') {
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
 } else if(command==='event') {
  if(!args[0]||args[0].startsWith('--')) throw new Error('Use node cli.js event path/to/event.yaml [--production]');
  const event=readYaml(args[0],process.cwd());const update=applyEvent(project,event);
  console.log(JSON.stringify({snapshot:update.snapshot.id,affected_nodes:update.affected_nodes},null,2));
 } else if(command==='report') {
  const lines=['# Current thesis', '', `Mode: ${mode.toUpperCase()}${result.fixture?' — SYNTHETIC, NOT MARKET DATA':''}`,`Period: ${result.period.end}`, '',...Object.entries(result.thesis).flatMap(([asset,t])=>[`## ${asset}: ${t.state}`,`Coverage: ${t.coverage}. ${t.interpretation}`,...t.triggered_rules.map(r=>`- ${r.id}: ${r.why}`),''])];
  fs.writeFileSync('reports/current-thesis.md',lines.join('\n').trimEnd()+'\n');console.log('reports/current-thesis.md');
 } else throw new Error('Commands: validate, snapshot --reason TEXT, event FILE, report');
} catch(error) {console.error(error.message,error.details||'');process.exitCode=1;}
