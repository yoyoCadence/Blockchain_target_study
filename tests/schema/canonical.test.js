import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {project,change} from '../helpers.js';
import {validateProject,loadProject,ROOT,calculate} from '../../engine/index.js';
import {validateSchema} from '../../engine/validation/index.js';
test('every canonical YAML parses with unique keys; both datasets validate',()=>{
 for(const dir of ['spec','sources','data'])for(const file of fs.readdirSync(path.join(ROOT,dir),{recursive:true}).filter(x=>x.endsWith('.yaml')))assert.ok(YAML.parse(fs.readFileSync(path.join(ROOT,dir,file),'utf8'),{uniqueKeys:true}));
 validateProject(project());validateProject(loadProject('production'));
});
for(const [name,edit] of [
 ['observed source',m=>{delete m.source_ids;}],['date',m=>{m.as_of_date='2025-02-30';}],['classification enum',m=>{m.classification='FACT';}],['confidence',m=>{m.confidence='certain';}],['unit',m=>{m.unit='dollars';}],['version',m=>{m.version=0;}]
])test(`schema rejects invalid ${name}`,()=>{const p=project(),m=structuredClone(p.inputs.find(x=>x.classification==='OBSERVED'));edit(m);assert.throws(()=>validateSchema(p.schema,m,'test'));});
test('all four classifications enforce their own evidence',()=>{
 const p=project(),base=structuredClone(p.inputs[0]);
 for(const [classification,fields] of [['ASSUMPTION',{}],['SCENARIO',{}],['DERIVED',{formula_id:'f.test',formula_version:1,dependencies:[]}]]) {
  const record={...base,classification,...fields};delete record.rationale;delete record.scenario;delete record.range;
  assert.throws(()=>validateSchema(p.schema,record,'classification'));
 }
});
test('production rejects synthetic observations and tier 5 only evidence',()=>{
 const p=project();p.mode='production';assert.throws(()=>validateProject(p),/Fixture/);
 p.inputs.forEach(m=>m.fixture=false);p.sources.forEach(s=>s.fixture=false);assert.throws(()=>validateProject(p),/Tier 5/);
});
test('source coverage, missing sources and duplicate record IDs are rejected',()=>{
 let p=project();p.sources[0].covered_metrics=[];assert.throws(()=>validateProject(p),/cover/);
 p=project();p.sources=[];assert.throws(()=>validateProject(p),/Missing source/);
 p=project();p.inputs.push(p.inputs[0]);assert.throws(()=>validateProject(p),/Duplicate/);
});
test('input constraints reject negative AUM, turnover, share and margins >100%',()=>{
 for(const [id,value] of [['market.equity_aum',-1],['uni.turnover',-1],['uni.market_share',-0.1],['secz.fcf_margin',1.1]])assert.throws(()=>validateProject(change(project(),id,value)),/minimum|maximum|range/);
});
test('negative growth is allowed; basis points normalize explicitly',()=>{
 const p=project();change(p,'xlm.activity_growth',-0.2);change(p,'uni.fee',1.25,{unit:'bps'});validateProject(p);
 const m=calculate(p).metrics['uni.fee'];assert.equal(m.value,0.000125);assert.equal(m.original_unit,'bps');
});
test('conflicting observations are retained and block silent selection',()=>{
 const p=project(),m=structuredClone(p.inputs[0]);m.id+='-conflict';p.inputs.push(m);assert.throws(()=>validateProject(p),/conflict/);assert.equal(p.inputs.filter(x=>x.metric_id===m.metric_id).length,2);
});
