import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,loadProject,calculate,selectInputs,lineage} from '../../engine/index.js';
import {makeSnapshot,saveSnapshot,readSnapshots} from '../../engine/snapshots.js';
import {applyEvent} from '../../engine/propagation/index.js';
import {prepareResearchRefresh,applyResearchRefresh} from '../../engine/research/index.js';

function copyDirectory(from,to) {
 // Node 24's fs.cpSync can abort on this Windows workspace's Unicode path.
 fs.mkdirSync(to,{recursive:true});
 for(const entry of fs.readdirSync(from,{withFileTypes:true})) {
  const source=path.join(from,entry.name),target=path.join(to,entry.name);
  if(entry.isDirectory()) copyDirectory(source,target);
  else fs.writeFileSync(target,fs.readFileSync(source));
 }
}

function workspace(t,withBaseline=true) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-refresh-'));
 for(const directory of ['spec','sources','data/observed'])
  copyDirectory(path.join(ROOT,directory),path.join(root,directory));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const project=loadProject('production',root);
 if(withBaseline) saveSnapshot(root,makeSnapshot(project,calculate(project),{reason:'Isolated test baseline; no real research data'}));
 return project;
}

function proposal(p) {
 const old=selectInputs(p.inputs)['uni.growth_budget'];
 // Synthetic test evidence exists only in temporary roots, never in production files.
 return {version:1,id:'reviewed-uni-research',as_of_date:'2026-01-07',
  reason:'Test a reviewed primary-source refresh',affected_nodes:['UNI'],
  review:{reviewer:'Test analyst',reviewed_at:'2026-01-08T10:00:00Z',rationale:'Isolated test review, not real evidence'},
  sources:[{id:'test-primary@1',version:1,url:'https://example.test/evidence',publisher:'Test publisher',
   title:'Synthetic test evidence',date:'2026-01-05',retrieved_at:'2026-01-06T10:00:00Z',tier:2,
   covered_metrics:['uni.price','uni.growth_budget'],fixture:false}],
  observations:[
   {id:'test-uni-price@1',metric_id:'uni.price',asset:'UNI',value:9,unit:'USD',classification:'OBSERVED',
    as_of_date:'2026-01-07',period:{basis:'point',end:'2025-12-31'},confidence:'medium',version:1,
    fixture:false,source_ids:['test-primary@1']},
   {id:'test-uni-budget@2',metric_id:'uni.growth_budget',asset:'UNI',value:20e6,unit:'UNI/year',classification:'OBSERVED',
    as_of_date:'2026-01-07',period:{basis:'annual',end:'2025-12-31'},confidence:'medium',version:2,
    fixture:false,source_ids:['test-primary@1'],supersedes:old.id}
  ]};
}

test('research preview recomputes with primary evidence without changing persisted state',t=>{
 const p=workspace(t),batch=proposal(p),before=structuredClone(p);
 const preview=prepareResearchRefresh(p,batch);
 assert.deepEqual(p,before);
 assert.equal(fs.existsSync(path.join(p.root,'data/events/production')),false);
 assert.equal(readSnapshots(p.root,'production').length,1);
 assert.equal(preview.preview.persisted,false);
 assert.equal(preview.result.metrics['uni.growth_distribution'].value,180e6);
 assert.equal(preview.result.metrics['uni.required_share'].value,null);
 assert.equal(preview.preview.comparison.source_change,true);
 assert.equal(preview.preview.comparison.assumption_change,false);
 assert.equal(preview.preview.comparison.scenario_change,false);
 assert.equal(preview.preview.comparison.formula_change,false);
 assert.ok(preview.preview.issues.some(x=>x.severity==='UNKNOWN'));
 assert.equal(preview.preview.thesis.UNI.coverage,'insufficient');
 assert.match(preview.preview.review_digest,/^[a-f0-9]{64}$/);
});

test('apply saves review, sources and observations together; reload and historical replay retain lineage',t=>{
 const p=workspace(t),batch=proposal(p),digest=prepareResearchRefresh(p,batch).preview.review_digest;
 const applied=applyResearchRefresh(p,batch,digest),loaded=loadProject('production',p.root);
 const history=readSnapshots(p.root,'production'),result=calculate(loaded,{history});
 assert.equal(history.length,2);
 assert.equal(history[1].id,applied.snapshot.id);
 assert.deepEqual(history[1].event.research_review,batch.review);
 assert.equal(history[1].event.research_digest,digest);
 assert.deepEqual(loaded.sources,batch.sources);
 assert.ok(loaded.inputs.some(m=>m.id===batch.observations[1].supersedes));
 assert.equal(result.metrics['uni.growth_distribution'].value,180e6);
 const tree=lineage(loaded,result,'uni.growth_distribution');
 assert.ok(tree.inputs.every(input=>input.sources[0].id==='test-primary@1'));
 for(const [id,metric] of Object.entries(applied.result.metrics)) assert.equal(result.metrics[id].value,metric.value,id);
 history.forEach((snapshot,index)=>{
  const replayProject={...loaded,inputs:snapshot.inputs,sources:snapshot.sources,
   registry:{version:1,formulas:snapshot.formulas},dictionary:snapshot.dictionary,
   thesis:{...loaded.thesis,rules:snapshot.rules}};
  const replay=calculate(replayProject,{history:history.slice(0,index),previousThesis:history[index-1]?.thesis||{}});
  for(const [id,metric] of Object.entries(snapshot.metrics)) assert.equal(replay.metrics[id].value,metric.value,id);
  assert.deepEqual(replay.thesis,snapshot.thesis);
 });
 assert.throws(()=>applyResearchRefresh(loaded,batch,digest),/Duplicate/);
 assert.equal(readSnapshots(p.root,'production').length,2);
});

test('the first research refresh can be reviewed and saved without an earlier production snapshot',t=>{
 const p=workspace(t,false),batch=proposal(p),prepared=prepareResearchRefresh(p,batch);
 assert.equal(prepared.preview.parent_id,null);
 assert.equal(prepared.preview.comparison.available,false);
 assert.equal(prepared.preview.metrics['uni.growth_distribution'].value,180e6);
 assert.equal(prepared.preview.metrics['uni.required_share'].value,null);
 applyResearchRefresh(p,batch,prepared.preview.review_digest);
 assert.equal(readSnapshots(p.root,'production').length,1);
 assert.equal(loadProject('production',p.root).sources.length,1);
});

test('a later refresh explicitly supersedes records and sources without deleting evidence',t=>{
 const p=workspace(t),batch=proposal(p);
 applyResearchRefresh(p,batch,prepareResearchRefresh(p,batch).preview.review_digest);
 const loaded=loadProject('production',p.root),next=structuredClone(batch);
 next.id='reviewed-uni-research-2';
 next.sources[0]={...next.sources[0],id:'test-primary@2',version:2,supersedes:'test-primary@1'};
 next.observations=next.observations.map(m=>({...m,id:`${m.id}-next`,version:m.version+1,
  supersedes:m.id,source_ids:['test-primary@2'],value:m.metric_id==='uni.price'?10:m.value}));
 const prepared=prepareResearchRefresh(loaded,next);
 applyResearchRefresh(loaded,next,prepared.preview.review_digest);
 const current=loadProject('production',p.root),history=readSnapshots(p.root,'production');
 assert.equal(current.sources.length,2);
 assert.ok(current.inputs.some(m=>m.id==='test-uni-price@1'));
 assert.equal(calculate(current).metrics['uni.growth_distribution'].value,200e6);
 assert.equal(history[1].metrics['uni.growth_distribution'].value,180e6);
 assert.equal(history[2].parent_id,history[1].id);
});

test('stale payload, model state or parent history cannot apply an old preview',t=>{
 const p=workspace(t),batch=proposal(p),digest=prepareResearchRefresh(p,batch).preview.review_digest;
 const edited=structuredClone(batch);edited.observations[0].value=10;
 assert.throws(()=>applyResearchRefresh(p,edited,digest),/Stale research preview/);
 const changed=structuredClone(p);changed.dictionary.metrics[0].label+=' changed';
 assert.throws(()=>applyResearchRefresh(changed,batch,digest),/Stale research preview/);
 saveSnapshot(p.root,makeSnapshot(p,calculate(p),{previous:readSnapshots(p.root,'production').at(-1),reason:'Test history advanced'}));
 assert.throws(()=>applyResearchRefresh(p,batch,digest),/Stale research preview/);
 assert.equal(fs.existsSync(path.join(p.root,'data/events/production')),false);
});

test('apply requires a digest and duplicate event IDs cannot overwrite a journal',t=>{
 const p=workspace(t),batch=proposal(p);
 assert.throws(()=>applyResearchRefresh(p,batch),/requires the review digest/);
 const prepared=prepareResearchRefresh(p,batch);
 assert.throws(()=>applyEvent(p,prepared.event),/Use research-apply/);
 applyResearchRefresh(p,batch,prepared.preview.review_digest);
 const file=path.join(p.root,'data/events/production',`${batch.id}.json`),original=fs.readFileSync(file,'utf8');
 const loaded=loadProject('production',p.root),next=structuredClone(batch);
 next.sources=[];
 next.observations=next.observations.map(m=>({...m,id:`${m.id}-next`,version:m.version+1,supersedes:m.id}));
 assert.throws(()=>applyResearchRefresh(loaded,next,prepareResearchRefresh(loaded,next).preview.review_digest),/EEXIST/);
 assert.equal(fs.readFileSync(file,'utf8'),original);
 assert.equal(readSnapshots(p.root,'production').length,2);
});

for(const [name,edit,pattern] of [
 ['missing review',b=>{delete b.review;},/Invalid research refresh/],
 ['blank review',b=>{b.review.reviewer=' ';},/reviewer and rationale/],
 ['malformed source',b=>{delete b.sources[0].url;},/Invalid research refresh/],
 ['fixture source',b=>{b.sources[0].fixture=true;},/Fixture source/],
 ['fixture observation',b=>{b.observations[0].fixture=true;},/Fixture data/],
 ['tier 3 only',b=>{b.sources[0].tier=3;},/tier 1 or 2/],
 ['tier 5 only',b=>{b.sources[0].tier=5;},/primary or credible|tier 1 or 2/],
 ['missing evidence',b=>{b.observations[0].source_ids=['absent'];},/Unknown event source/],
 ['future publication',b=>{b.as_of_date='2026-01-08';b.sources[0].date='2026-01-08';b.sources[0].retrieved_at='2026-01-08T09:00:00Z';},/published after observation/],
 ['late retrieval',b=>{b.sources[0].retrieved_at='2026-01-09T10:00:00Z';},/retrieved after review/],
 ['wrong coverage',b=>{b.sources[0].covered_metrics=['uni.price'];},/Source does not cover/],
 ['assumption posing as research',b=>{b.observations[0].classification='ASSUMPTION';b.observations[0].rationale='Not verified';},/only accepts observations/],
 ['incorrect unit',b=>{b.observations[0].unit='ratio';},/Unit mismatch/],
 ['quarterly amount labeled as annual rate',b=>{b.observations[1].period.basis='quarterly';},/Annual-rate unit/],
 ['unmatched period',b=>{b.observations[0].period.end='2025-11-30';},/Cannot snapshot calculation errors/],
 ['missing supersession',b=>{delete b.observations[1].supersedes;},/explicitly supersede/],
 ['regressed version',b=>{b.observations[1].version=1;},/Non-monotonic supersession/],
 ['invalid source supersession',b=>{b.sources[0].supersedes='absent';},/Missing superseded source/],
 ['unsafe identifier',b=>{b.id='../escape';},/Invalid research refresh/],
 ['unknown node',b=>{b.affected_nodes=['absent'];},/Unknown affected node/]
]) test(`invalid research ${name} fails without writing`,t=>{
 const p=workspace(t),batch=proposal(p);edit(batch);
 assert.throws(()=>prepareResearchRefresh(p,batch),pattern);
 assert.equal(readSnapshots(p.root,'production').length,1);
 assert.equal(fs.existsSync(path.join(p.root,'data/events/production')),false);
});

test('research workflow rejects fixture mode and tampered journal source/review metadata',t=>{
 const p=workspace(t),batch=proposal(p);
 assert.throws(()=>prepareResearchRefresh({...p,mode:'fixture'},batch),/requires production/);
 applyResearchRefresh(p,batch,prepareResearchRefresh(p,batch).preview.review_digest);
 const file=path.join(p.root,'data/events/production',`${batch.id}.json`),original=fs.readFileSync(file,'utf8');
 for(const edit of [x=>{x.event.sources[0].title='Tampered';},x=>{x.event.research_review.reviewer='Tampered';}]) {
  const journal=JSON.parse(original);edit(journal);fs.writeFileSync(file,JSON.stringify(journal));
  assert.throws(()=>loadProject('production',p.root),/journal does not match/);
 }
});

test('CLI preview and apply use explicit production mode and the reviewed digest',t=>{
 const p=workspace(t),batch=proposal(p);
 fs.writeFileSync(path.join(p.root,'cli.js'),fs.readFileSync(path.join(ROOT,'cli.js')));
 copyDirectory(path.join(ROOT,'engine'),path.join(p.root,'engine'));
 const packageFile=path.join(p.root,'package.json');fs.writeFileSync(packageFile,JSON.stringify({type:'module'}));
 fs.symlinkSync(path.join(ROOT,'node_modules'),path.join(p.root,'node_modules'),'junction');
 const file=path.join(p.root,'reviewed.json');fs.writeFileSync(file,JSON.stringify(batch));
 const run=(...args)=>spawnSync(process.execPath,['cli.js',...args],{cwd:p.root,encoding:'utf8'});
 const wrong=run('research-preview',file);assert.equal(wrong.status,1);assert.match(wrong.stderr,/require --production/);
 const preview=run('research-preview',file,'--production');assert.equal(preview.status,0,preview.stderr);
 const digest=JSON.parse(preview.stdout).review_digest;
 const missing=run('research-apply',file,'--production');assert.equal(missing.status,1);assert.match(missing.stderr,/requires the review digest/);
 const apply=run('research-apply',file,'--production','--digest',digest);assert.equal(apply.status,0,apply.stderr);
 assert.equal(JSON.parse(apply.stdout).persisted,true);
 assert.equal(readSnapshots(p.root,'production').length,2);
});
