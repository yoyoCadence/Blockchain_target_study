import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ROOT,loadProject} from '../../engine/index.js';
import {readSnapshots,saveSnapshot} from '../../engine/snapshots.js';

// Replay the real pre-UNI v1 state in an isolated temporary CLI workspace.
export function historicalQuoteWorkspace(t) {
 const history=readSnapshots(ROOT,'production'),index=history.findIndex(s=>s.event?.id==='xlm-market-quote-baseline-20261004');
 const baseline=history[index],root=fs.mkdtempSync(path.join(os.tmpdir(),'historic-quote-'));
 const copy=(from,to)=>{fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})) {
  const a=path.join(from,entry.name),b=path.join(to,entry.name);if(entry.isDirectory())copy(a,b);else fs.writeFileSync(b,fs.readFileSync(a));
 }};
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const directory of ['spec','engine','dashboard'])copy(path.join(ROOT,directory),path.join(root,directory));
 const write=(file,value)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(value));};
 write('spec/formula-registry.yaml',{version:1,formulas:baseline.formulas});
 write('spec/data-dictionary.yaml',baseline.dictionary);
 write('spec/assumptions.yaml',{version:1,metrics:baseline.inputs.filter(m=>m.classification==='ASSUMPTION')});
 write('spec/scenarios.yaml',{version:1,metrics:baseline.inputs.filter(m=>m.classification==='SCENARIO')});
 write('data/observed/observations.yaml',{version:1,metrics:baseline.inputs.filter(m=>m.classification==='OBSERVED')});
 write('sources/sources.yaml',{version:1,sources:baseline.sources});
 for(const snapshot of history.slice(0,index+1))saveSnapshot(root,snapshot);
 fs.writeFileSync(path.join(root,'cli.js'),fs.readFileSync(path.join(ROOT,'cli.js')));
 write('package.json',{type:'module'});fs.symlinkSync(path.join(ROOT,'node_modules'),path.join(root,'node_modules'),'junction');
 const proposal='data/research/uni-market-quote-pending-2026-10-04.yaml';
 fs.mkdirSync(path.dirname(path.join(root,proposal)),{recursive:true});fs.writeFileSync(path.join(root,proposal),fs.readFileSync(path.join(ROOT,proposal)));
 return loadProject('production',root);
}
