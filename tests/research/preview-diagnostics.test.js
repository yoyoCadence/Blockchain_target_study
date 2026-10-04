import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {ValidationError} from '../../engine/validation/index.js';
import {fingerprint,makeSnapshot,readSnapshots} from '../../engine/snapshots.js';
import {prepareResearchRefresh} from '../../engine/research/index.js';
import {metricLabel} from '../../dashboard/zh-hant.js';

const project=loadProject('production');
const proposal=readYaml('data/research/market-quotes-2026-10-04.yaml');
const candidate=()=>calculate({...project,inputs:[...project.inputs,...proposal.observations]});
const state=()=>fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production'),
 proposal:fs.readFileSync(path.join(project.root,'data/research/market-quotes-2026-10-04.yaml'),'utf8')});

test('blocked real quote preview retains every calculation error in a detached structured ValidationError',()=>{
 const before=state(),result=candidate(),errors=result.issues.filter(i=>i.severity==='ERROR');
 let failure;
 try{prepareResearchRefresh(project,proposal);}catch(error){failure=error;}
 assert.ok(failure instanceof ValidationError);assert.equal(failure.message,'Cannot snapshot calculation errors');
 assert.deepEqual(failure.details,errors);assert.equal(failure.details.length,3);
 let directFailure;
 try{makeSnapshot(project,result,{reason:'Read-only failed snapshot diagnostic test'});}catch(error){directFailure=error;}
 assert.deepEqual(directFailure.details,errors);
 const resultBefore=fingerprint(result);directFailure.details[0].message='Temporary caller presentation change';
 assert.equal(fingerprint(result),resultBefore);assert.equal(state(),before);
 assert.equal(fs.existsSync(path.join(project.root,'data/events/production',`${proposal.id}.json`)),false);
});

for(const command of ['research-preview','research-apply'])test(`${command} reports all real quote blockers in Chinese JSON and never writes`,()=>{
 const before=state(),args=['cli.js',command,'data/research/market-quotes-2026-10-04.yaml','--production'];
 if(command==='research-apply')args.push('--digest','0'.repeat(64));
 const child=spawnSync(process.execPath,args,{cwd:project.root,encoding:'utf8'});
 assert.ifError(child.error);assert.equal(child.status,1);assert.equal(child.stdout,'');
 const report=JSON.parse(child.stderr);
 assert.equal(report.error,'Cannot snapshot calculation errors');assert.equal(report.message,'無法儲存研究快照：計算仍有錯誤，本次未寫入。');
 assert.deepEqual(report.details.map(({metric_label,...issue})=>issue),candidate().issues.filter(i=>i.severity==='ERROR'));
 for(const detail of report.details) {
  assert.equal(detail.metric_label,metricLabel(detail.metric_id));assert.match(detail.message,/Unaligned accounting periods: f\./);
  assert.equal(detail.severity,'ERROR');
 }
 assert.equal(state(),before);
 assert.equal(fs.existsSync(path.join(project.root,'data/events/production',`${proposal.id}.json`)),false);
});

test('other snapshot failures and valid snapshot contents retain their original contracts',()=>{
 const result=calculate(project),before=state();
 assert.throws(()=>makeSnapshot(project,result,{reason:''}),error=>error instanceof ValidationError&&
  error.message==='Material update requires a changelog reason'&&error.details.length===0);
 const snapshot=makeSnapshot(project,result,{previous:readSnapshots(project.root,'production').at(-1),reason:'Read-only snapshot contract test'});
 for(const field of ['metrics','issues','thesis','period'])assert.deepEqual(snapshot[field],result[field]);
 assert.deepEqual(snapshot.inputs,project.inputs);assert.deepEqual(snapshot.sources,project.sources);
 assert.equal(state(),before);
});
