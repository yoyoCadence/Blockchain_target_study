import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {assert,ValidationError} from './validation/index.js';
export function stable(value) {
 if(Array.isArray(value)) return value.map(stable);
 if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,stable(value[k])]));
 return value;
}
export const fingerprint=value=>crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
export function assertVersionHistory(previous,p) {
 if(!previous) return;
 for(const [oldRecords,newRecords,name] of [[previous.inputs,p.inputs,'input'],[previous.sources,p.sources,'source']]) {
  for(const old of oldRecords) assert(newRecords.some(x=>x.id===old.id&&fingerprint(x)===fingerprint(old)),`Historical ${name} changed or removed: ${old.id}`);
 }
 for(const old of previous.formulas) {
  const next=p.registry.formulas.find(f=>f.id===old.id);
  assert(next&&next.version>=old.version,`Formula removed or version regressed: ${old.id}`);
  assert(fingerprint(old)===fingerprint(next)||next.version>old.version,`Formula changed without version increment: ${old.id}`);
 }
 for(const old of previous.rules) {
  const next=p.thesis.rules.find(r=>r.id===old.id);
  assert(next&&next.version>=old.version,`Thesis rule removed or regressed: ${old.id}`);
  assert(fingerprint(old)===fingerprint(next)||next.version>old.version,`Thesis rule changed without version increment: ${old.id}`);
 }
}
export function makeSnapshot(p,result,{previous=null,reason,event=null}={}) {
 assert(reason?.trim(),'Material update requires a changelog reason');
 const calculationErrors=result.issues.filter(x=>x.severity==='ERROR');
 if(calculationErrors.length)throw new ValidationError('Cannot snapshot calculation errors',structuredClone(calculationErrors));
 assert(!Object.values(result.metrics).some(m=>m.id.endsWith('@sensitivity')),'Persist sensitivity inputs as versioned scenarios before snapshotting');
 assertVersionHistory(previous,p);
 const content={schema_version:1,created_at:new Date().toISOString(),parent_id:previous?.id||null,reason,event,mode:p.mode,fixture:result.fixture,period:result.period,
  inputs:structuredClone(p.inputs),sources:structuredClone(p.sources),formulas:structuredClone(p.registry.formulas),rules:structuredClone(p.thesis.rules),
  dictionary:structuredClone(p.dictionary),graph:structuredClone(p.graph),assets:structuredClone(p.assets),sensitivity:structuredClone(p.sensitivity),
  metrics:structuredClone(result.metrics),issues:structuredClone(result.issues),thesis:structuredClone(result.thesis),
  market_valuation:Object.fromEntries(Object.entries(result.metrics).filter(([key])=>/\.(price|market_cap|fdv|ev)$/.test(key))),
  observations:structuredClone(p.inputs.filter(x=>x.classification==='OBSERVED')),assumptions:structuredClone(p.inputs.filter(x=>x.classification==='ASSUMPTION')),scenarios:structuredClone(p.inputs.filter(x=>x.classification==='SCENARIO'))};
 return {id:fingerprint(content),...content};
}
export function verifySnapshot(snapshot) {
 const {id,...content}=snapshot;assert(id===fingerprint(content),`Snapshot integrity failure: ${id}`);return snapshot;
}
export function writeExclusive(file,value) {
 fs.mkdirSync(path.dirname(file),{recursive:true});
 // Exclusive creation never overwrites an existing historical artifact.
 const fd=fs.openSync(file,'wx');try {fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
}
export function saveSnapshot(root,snapshot) {
 verifySnapshot(snapshot);const file=path.join(root,'data/snapshots',snapshot.mode,`${snapshot.id}.json`);writeExclusive(file,snapshot);return file;
}
export function readSnapshots(root,mode) {
 const snapshots=[];
 for(const [directory,event] of [[`data/snapshots/${mode}`,false],[`data/events/${mode}`,true]]) {
  const dir=path.join(root,directory);if(!fs.existsSync(dir)) continue;
  for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))) {const data=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));snapshots.push(verifySnapshot(event?data.snapshot:data));}
 }
 const ids=new Set(snapshots.map(s=>s.id));assert(ids.size===snapshots.length,'Duplicate snapshot identity');
 for(const s of snapshots) {assert(s.mode===mode,'Snapshot mode mismatch');assert(!s.parent_id||ids.has(s.parent_id),`Missing parent snapshot ${s.parent_id}`);}
 const ordered=[];let parent=null;
 while(ordered.length<snapshots.length) {
  const children=snapshots.filter(s=>s.parent_id===parent);assert(children.length===1,'Snapshot branch or disconnected history; resolve explicitly');
  const current=children[0];
  assertVersionHistory(ordered.at(-1),{inputs:current.inputs,sources:current.sources,registry:{formulas:current.formulas},thesis:{rules:current.rules}});
  ordered.push(current);parent=current.id;
 }
 return ordered;
}
export function compareSnapshots(previous,current) {
 if(!previous) return {available:false,changes:[],reason:current.reason};
 const categoryChanged=(key)=>fingerprint(previous[key])!==fingerprint(current[key]);
 const changes=Object.keys(current.metrics).filter(id=>fingerprint(previous.metrics[id])!==fingerprint(current.metrics[id])).map(id=>({metric_id:id,previous:previous.metrics[id]?.value??null,current:current.metrics[id].value,unit:current.metrics[id].unit,classification:current.metrics[id].classification}));
 return {available:true,previous_id:previous.id,current_id:current.id,reason:current.reason,source_change:categoryChanged('sources')||categoryChanged('observations'),assumption_change:categoryChanged('assumptions'),scenario_change:categoryChanged('scenarios'),formula_change:categoryChanged('formulas'),rule_change:categoryChanged('rules'),changes};
}
