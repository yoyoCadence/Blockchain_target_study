import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const project=loadProject('production');
const catalog=()=>readYaml('spec/research-catalog.yaml');

test('research inspection replays cataloged evidence without financial input or journal changes',()=>{
 const before=fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')});
 const result=inspectResearch(project);assert.equal(result.records.length,catalog().records.length);
 assert.equal(result.persisted,false);assert.equal(result.financial_inputs_updated,false);
 const quarter=result.records.find(r=>r.id==='secz-quarter-half-2026');
 assert.equal(quarter.records.length,12);assert.equal(quarter.records[0].value,7839139);
 assert.equal(quarter.statement.scope,'operating_subsidiary_consolidated');
 const ttm=result.records.find(r=>r.kind==='revenue_ttm');
 assert.ok(ttm.records.every(r=>r.value===null&&r.status==='COMPARABILITY_UNVERIFIED'));
 assert.equal(ttm.comparability.classification,'ASSUMPTION');assert.equal(ttm.comparability.checks.acquisition_treatment.value,null);
 assert.ok(result.records.find(r=>r.kind==='identity').records.every(r=>r.investability.status==='unverified'));
 assert.equal(fingerprint({project,economics:calculate(project),history:readSnapshots(project.root,'production')}),before);
});

test('fixture inspection never supplies production research even with a supplied catalog',()=>{
 const result=inspectResearch(loadProject('fixture'),{catalog:catalog()});
 assert.deepEqual(result.records,[]);assert.equal(result.mode,'fixture');assert.match(result.notice,/not mixed/);
});

for(const [name,edit,pattern] of [
 ['path traversal',c=>{c.records[0].file='../observed/observations.yaml';},/Invalid research catalog/],
 ['Windows absolute path',c=>{c.records[0].file='C:\\private\\evidence.json';},/Invalid research catalog/],
 ['unknown reader kind',c=>{c.records[0].kind='execute';},/Invalid research catalog/],
 ['wrong fingerprint',c=>{c.records[0].expected_id='0'.repeat(64);},/fingerprint mismatch/],
 ['duplicate artifact',c=>{c.records.push({...c.records[0],id:'duplicate'});},/Duplicate file/]
]) test(`research catalog rejects ${name}`,()=>{
 const c=catalog();edit(c);assert.throws(()=>inspectResearch(project,{catalog:c}),pattern);
});

test('catalog inspection rejects tampered stored evidence instead of returning an unverified table',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'research-inspection-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const c=catalog();c.records=c.records.filter(r=>r.kind==='revenue').slice(0,1);
 fs.mkdirSync(path.join(root,'spec'));fs.mkdirSync(path.dirname(path.join(root,'data/research',c.records[0].file)),{recursive:true});
 fs.writeFileSync(path.join(root,'spec/research-catalog-schema.yaml'),fs.readFileSync(path.join(project.root,'spec/research-catalog-schema.yaml')));
 const altered=readYaml(`data/research/${c.records[0].file}`);altered.dossier.observations[0].value++;
 fs.writeFileSync(path.join(root,'data/research',c.records[0].file),JSON.stringify(altered));
 assert.throws(()=>inspectResearch({...project,root},{catalog:c}),/integrity failure/);
});
