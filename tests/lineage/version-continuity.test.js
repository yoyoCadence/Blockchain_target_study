import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,calculate,selectInputs} from '../../engine/index.js';
import {makeSnapshot,saveSnapshot,readSnapshots,verifySnapshot,fingerprint} from '../../engine/snapshots.js';
import {createServer} from '../../server.js';

function history(t,mode='fixture') {
 const p=loadProject(mode),root=fs.mkdtempSync(path.join(os.tmpdir(),'version-continuity-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const first=makeSnapshot(p,calculate(p),{reason:'Test-only original versions'});
 const second=makeSnapshot(p,calculate(p),{previous:first,reason:'Test-only successor versions'});
 const firstFile=saveSnapshot(root,first);return {p,root,mode,first,second,firstFile};
}
function commit(w,edit=()=>{}) {
 edit(w.second);const {id,...content}=w.second;w.second.id=fingerprint(content);verifySnapshot(w.second);
 w.secondFile=saveSnapshot(w.root,w.second);return fs.readFileSync(w.secondFile,'utf8');
}

for(const mode of ['fixture','production'])for(const field of ['inputs','sources'])for(const kind of ['rewrite','remove'])test(`${mode} adjacent snapshot cannot ${kind} historical ${field} with matching hashes`,t=>{
 const w=history(t,mode),before=commit(w,s=>{
  if(kind==='remove')s[field].shift();
  else if(field==='sources')s.sources[0].publisher='Test-only same-ID rewrite';
  else s.inputs[0].confidence=s.inputs[0].confidence==='low'?'high':'low';
 });
 verifySnapshot(w.first);verifySnapshot(w.second);
 assert.throws(()=>readSnapshots(w.root,mode),field==='inputs'?/Historical input changed or removed/:/Historical source changed or removed/);
 assert.equal(fs.readFileSync(w.secondFile,'utf8'),before);
});

for(const mode of ['fixture','production'])for(const field of ['formulas','rules'])test(`${mode} adjacent ${field} change requires a version increase`,t=>{
 const w=history(t,mode);commit(w,s=>{if(field==='formulas')s.formulas[0].description+=' Test-only revision';else s.rules[0].rationale+=' Test-only revision';});
 assert.throws(()=>readSnapshots(w.root,mode),field==='formulas'?/Formula changed without version increment/:/Thesis rule changed without version increment/);
});

for(const field of ['formulas','rules'])for(const kind of ['remove','regress'])test(`adjacent ${field} cannot ${kind} a retained version`,t=>{
 const w=history(t);commit(w,s=>{if(kind==='remove')s[field].shift();else s[field][0].version=0;});
 assert.throws(()=>readSnapshots(w.root,'fixture'),field==='formulas'?/Formula removed or version regressed/:/Thesis rule removed or regressed/);
});

for(const mode of ['fixture','production'])test(`${mode} legal appended inputs/sources and incremented formula/rule versions remain readable`,t=>{
 const w=history(t,mode),next=structuredClone(w.p),old=selectInputs(next.inputs)[mode==='fixture'?'uni.price':'uni.growth_budget'];
 next.inputs.push({...structuredClone(old),id:'test-only-new-input-version',version:old.version+1,supersedes:old.id});
 const source=next.sources[0];next.sources.push({...structuredClone(source),id:'test-only-new-source-version',version:source.version+1,supersedes:source.id});
 next.registry.formulas[0].version++;next.registry.formulas[0].description+=' Test-only versioned revision';
 next.thesis.rules[0].version++;next.thesis.rules[0].rationale+=' Test-only versioned revision';
 w.second=makeSnapshot(next,calculate(next),{previous:w.first,reason:'Test-only documented input/source/formula/rule versions'});
 commit(w);assert.deepEqual(readSnapshots(w.root,mode).map(s=>s.id),[w.first.id,w.second.id]);
 for(const field of ['inputs','sources'])for(const record of w.first[field])assert.deepEqual(w.second[field].find(r=>r.id===record.id),record);
});

test('API rejects historical source rewrites even if current data agrees with the latest snapshot',async t=>{
 const w=history(t);commit(w,s=>{s.sources[0].publisher='Test-only same-ID rewrite';});
 const names=['canonical-schema','source-registry','event-schema','project-schema','data-dictionary','formula-registry','asset-registry','dependency-graph','thesis-rules','sensitivity'];
 for(const file of names.map(n=>`spec/${n}.yaml`)) {
  const target=path.join(w.root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,fs.readFileSync(path.join(w.p.root,file)));
 }
 const inputs=path.join(w.root,'data/fixtures/inputs.yaml'),sources=path.join(w.root,'data/fixtures/sources.yaml');
 fs.mkdirSync(path.dirname(inputs),{recursive:true});
 fs.writeFileSync(inputs,JSON.stringify({version:1,metrics:w.second.inputs}));fs.writeFileSync(sources,JSON.stringify({version:1,sources:w.second.sources}));
 assert.doesNotThrow(()=>loadProject('fixture',w.root));
 const files=[w.firstFile,w.secondFile,inputs,sources],before=fingerprint(files.map(f=>fs.readFileSync(f,'utf8')));
 const server=createServer(w.root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
  assert.equal(response.status,400);assert.match((await response.json()).error,/Historical source changed or removed/);
  assert.equal(fingerprint(files.map(f=>fs.readFileSync(f,'utf8'))),before);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('committed histories retain all hashes, periods and financial/thesis replay',()=>{
 for(const mode of ['fixture','production']) {
  const p=loadProject(mode),snapshots=readSnapshots(p.root,mode),before=fingerprint(snapshots);
  for(const [index,snapshot]of snapshots.entries()) {
   const historic={...p,inputs:snapshot.inputs,sources:snapshot.sources,
    registry:{...p.registry,formulas:snapshot.formulas},dictionary:snapshot.dictionary,
    thesis:{...p.thesis,rules:snapshot.rules}};
   const result=calculate(historic,{history:snapshots.slice(0,index),previousThesis:snapshots[index-1]?.thesis??{}});
   assert.deepEqual(result.metrics,snapshot.metrics);assert.deepEqual(result.thesis,snapshot.thesis);
   assert.deepEqual(result.period,snapshot.period);
  }
  assert.equal(fingerprint(readSnapshots(p.root,mode)),before);
 }
});
