import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {researchFreshness} from '../../engine/research/research-freshness.js';
import {createServer} from '../../server.js';

const production=loadProject('production');
const identity=()=>readYaml('data/research/core-identifiers-2026-10-03.yaml');

function isolated(t,dossiers) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-id-consistency-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.join(root,'data/research'),{recursive:true});
 for(const file of ['research-catalog-schema.yaml','identity-review-schema.yaml','source-freshness.yaml','source-freshness-schema.yaml'])
  fs.writeFileSync(path.join(root,'spec',file),fs.readFileSync(path.join(production.root,'spec',file)));
 const catalog={version:2,records:dossiers.map((dossier,index)=>{
  dossier=structuredClone(dossier);dossier.id+=`-test-${index}`;
  const file=`review-${index}.json`;fs.writeFileSync(path.join(root,'data/research',file),JSON.stringify(dossier));
  return {id:`review-${index}`,label:'Test identity review',kind:'identity',file,expected_id:fingerprint(dossier)};
 })};
 return {project:{...production,root},catalog};
}

// Avoid fs.cpSync on this Windows Unicode workspace; copy only isolated test
// data needed by canonical loads. No real catalog or evidence is edited.
function copyTree(from,to) {
 fs.mkdirSync(to,{recursive:true});
 for(const entry of fs.readdirSync(from,{withFileTypes:true})) {
  const source=path.join(from,entry.name),target=path.join(to,entry.name);
  if(entry.isDirectory())copyTree(source,target);
  else if(entry.isFile())fs.writeFileSync(target,fs.readFileSync(source));
 }
}

for(const [name,edit] of [
 ['source collision',d=>d.sources[0].title+=' changed under the same ID'],
 ['record collision',d=>d.identities[0].confidence='low'],
 ['canonical input collision',d=>d.identities[0].id=production.inputs[0].id]
])test(`both read-only APIs reject ${name} in a separately valid, hash-pinned catalog without writing`,async t=>{
 const prior=identity(),current=identity();edit(current);
 const {project,catalog}=isolated(t,[prior,current]);
 for(const dir of ['spec','data','sources'])copyTree(path.join(production.root,dir),path.join(project.root,dir));
 fs.writeFileSync(path.join(project.root,'spec/research-catalog.yaml'),JSON.stringify(catalog));
 const savedFiles=catalog.records.map(r=>path.join(project.root,'data/research',r.file));
 const before=savedFiles.map(file=>fs.readFileSync(file));
 const server=createServer(project.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const endpoint of ['/api/research?mode=production','/api/freshness?mode=production&as_of=2026-10-04']) {
  const response=await fetch(base+endpoint);assert.equal(response.status,400);
  assert.match((await response.json()).error,name==='source collision'?/source ID conflict/:/record ID conflict/);
 }
 savedFiles.forEach((file,index)=>assert.deepEqual(fs.readFileSync(file),before[index]));
 assert.deepEqual(inspectResearch(loadProject('fixture',project.root)).records,[]);
});

for(const surface of ['inspection','freshness']) {
 const inspect=(p,catalog)=>surface==='inspection'?inspectResearch(p,{catalog}):researchFreshness(p,{catalog,as_of_date:'2026-10-04'});
 test(`${surface} rejects conflicting primary sources under one ID across independently pinned reviews`,t=>{
  const prior=identity(),current=identity();current.sources[0].title+=' changed under the same ID';
  const {project,catalog}=isolated(t,[prior,current]);
  assert.throws(()=>inspect(project,catalog),/source ID conflict/);
 });
 test(`${surface} rejects research source metadata conflicting with canonical history`,t=>{
  const dossier=identity(),oldId=dossier.sources[0].id;
  dossier.sources[0].id=production.sources[0].id;
  for(const record of dossier.identities)record.source_ids=record.source_ids.map(id=>id===oldId?dossier.sources[0].id:id);
  const {project,catalog}=isolated(t,[dossier]);
  assert.throws(()=>inspect(project,catalog),/source ID conflict/);
 });
 test(`${surface} rejects changed observation metadata under a previously used record ID`,t=>{
  const prior=identity(),current=identity();current.identities[0].confidence='low';
  const {project,catalog}=isolated(t,[prior,current]);
  assert.throws(()=>inspect(project,catalog),/record ID conflict/);
 });
 test(`${surface} refuses a research record that reuses a canonical input ID`,t=>{
  const dossier=identity();dossier.identities[0].id=production.inputs[0].id;
  const {project,catalog}=isolated(t,[dossier]);
  assert.throws(()=>inspect(project,catalog),/record ID conflict/);
 });
 test(`${surface} permits identical evidence reuse, explicit source versions and new observation IDs`,t=>{
  const prior=identity(),current=identity(),oldSource=current.sources[0];
  const nextSource={...oldSource,id:`${oldSource.id}-v2`,version:oldSource.version+1,supersedes:oldSource.id,title:'Explicit new source version'};
  current.sources.push(nextSource);
  const record=current.identities[0];
  record.id+='-v2';record.version++;record.confidence='medium';
  record.source_ids=[...record.source_ids,nextSource.id];
  const {project,catalog}=isolated(t,[prior,current]);
  const before=fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')});
  const result=inspect(project,catalog);assert.equal(result.persisted,false);
  assert.equal(fingerprint({production,financial:calculate(production),history:readSnapshots(production.root,'production')}),before);
 });
}
