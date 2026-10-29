import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';

const p=loadProject('production'),file='data/research/secz-revenue-definitions-2026-10-29-v1.yaml';
const dossier=readYaml(file),digest=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const history=readSnapshots(p.root,p.mode),index=history.findIndex(s=>s.event?.id==='secz-revenue-definitions-20261029');
const saved=history[index],previous=history[index-1];

test('definition evidence retains historical dates, two primary sources and its extraction limitation',()=>{
 assert.equal(digest,'6c977fd8ee6eca30041a594c3ba48bce4152ba1bcd6fdbe6da47d221665d8b4f');
 assert.deepEqual([dossier.capture.kind,dossier.capture.raw_response_sha256],['web_reader_text',null]);
 assert.match(dossier.capture.limitation,/沒有保存原始 HTTP bytes/);
 assert.equal(dossier.observations.length,4);
 for(const o of dossier.observations){
  assert.equal(o.classification,'OBSERVED');assert.equal(o.fixture,false);
  const source=dossier.sources.find(s=>s.id===o.source_ids[0]);
  assert.equal(source.tier,1);assert.equal(o.as_of_date,source.date);
  assert.ok(Date.parse(o.period.end)<Date.parse(o.as_of_date));
  assert.ok(Date.parse(source.date)<Date.parse(source.retrieved_at));
  assert.equal(o.source_ids.length,1);assert.ok(o.section&&o.summary);
 }
 assert.equal(dossier.statement.parent_equivalence_verified,null);
});

test('the source-only snapshot appends two sources without changing economics, assumptions or history',()=>{
 verifySnapshot(saved);assert.equal(saved.id,'e0f7c2361cc4ba0bdab93a1604255e2a48c34e258e11c0e4db651b71027a7057');
 assert.equal(saved.parent_id,previous.id);
 const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/secz-revenue-definitions-2026-10-29.yaml'));
 assert.deepEqual(propagated_nodes,['SECZ','UNI']);
 assert.match(saved.event.reason,new RegExp(digest));assert.deepEqual(saved.event.updates,[]);
 assert.deepEqual(saved.event.sources,dossier.sources);assert.equal(saved.sources.length,previous.sources.length+2);
 for(const field of ['metrics','inputs','formulas','rules','assets','dictionary','graph','sensitivity','period'])assert.deepEqual(saved[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 const diff=compareSnapshots(previous,saved);
 assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change,diff.rule_change],[true,false,false,false,false]);
 for(const key of ['tokenization','servicing','transaction','saas','administration','other','revenue'])assert.equal(saved.metrics[`secz.${key}`].value,null);
 assert.equal(Object.values(calculate(p).metrics).filter(m=>m.value===null).length,72);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
});
