import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProject,readYaml,validateProject,selectInputs} from '../../engine/index.js';
import {utcDay} from '../../engine/validation/index.js';
import {reviewIdentities} from '../../engine/research/identities.js';
import {prepareResearchRefresh} from '../../engine/research/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';

test('UTC day normalization handles positive/negative offsets and leap boundaries without rewriting timestamps',()=>{
 assert.equal(utcDay('2026-01-01T00:30:00+14:00'),'2025-12-31');
 assert.equal(utcDay('2025-12-31T23:30:00-08:00'),'2026-01-01');
 assert.equal(utcDay('2024-03-01T00:15:00+01:00'),'2024-02-29');
 assert.equal(utcDay('2026-10-03T00:00:00Z'),'2026-10-03');
});

for(const mode of ['fixture','production']) {
 test(`${mode} canonical validation rejects publication after the UTC retrieval day`,()=>{
  const p=loadProject(mode);
  p.sources.push({id:'test-utc-source',version:1,url:'https://example.test/utc',publisher:'Isolated test',title:'Test-only UTC evidence',date:'2026-01-01',retrieved_at:'2026-01-01T00:30:00+14:00',tier:2,covered_metrics:['uni.price'],fixture:mode==='fixture'});
  assert.throws(()=>validateProject(p),/published after retrieval/);
 });
 test(`${mode} canonical validation permits publication on the UTC day despite an earlier local date`,()=>{
  const p=loadProject(mode);
  const source={id:'test-utc-source',version:1,url:'https://example.test/utc',publisher:'Isolated test',title:'Test-only UTC evidence',date:'2026-01-01',retrieved_at:'2025-12-31T23:30:00-08:00',tier:2,covered_metrics:['uni.price'],fixture:mode==='fixture'};
  p.sources.push(source);assert.doesNotThrow(()=>validateProject(p));
  assert.equal(source.retrieved_at,'2025-12-31T23:30:00-08:00');
 });
}

const production=loadProject('production');
const identity=()=>readYaml('data/research/core-identifiers-2026-10-03.yaml');

test('identity review rejects an as-of after its true UTC review day',()=>{
 const d=identity();d.review.reviewed_at='2026-10-03T00:30:00+14:00';
 d.sources.forEach(s=>{s.retrieved_at='2026-10-02T09:00:00Z';});
 assert.throws(()=>reviewIdentities(production,d),/precedes dossier as-of/);
});

test('identity review permits a UTC-day cutoff despite the preceding local review date',()=>{
 const d=identity();d.review.reviewed_at='2026-10-02T23:00:00-08:00';
 assert.doesNotThrow(()=>reviewIdentities(production,d));
 assert.equal(d.review.reviewed_at,'2026-10-02T23:00:00-08:00');
});

test('identity source chronology uses UTC retrieval boundaries in both directions',()=>{
 const d=identity(),source=d.sources[0];
 source.date='2026-10-03';source.retrieved_at='2026-10-03T00:30:00+14:00';
 assert.throws(()=>reviewIdentities(production,d),/published after retrieval/);
 source.retrieved_at='2026-10-02T23:00:00-08:00';d.review.reviewed_at='2026-10-03T07:15:00Z';
 assert.doesNotThrow(()=>reviewIdentities(production,d));
});

function batch() {
 const old=selectInputs(production.inputs)['uni.growth_budget'];
 return {version:1,id:'test-utc-review',as_of_date:'2026-10-03',reason:'Isolated UTC test, not production evidence',affected_nodes:['UNI'],
  review:{reviewer:'Test-only analyst',reviewed_at:'2026-10-03T00:30:00+14:00',rationale:'Test-only timestamp boundary'},
  sources:[{id:'test-utc-review-source',version:1,url:'https://example.test/utc',publisher:'Isolated test',title:'Synthetic test evidence',date:'2026-10-01',retrieved_at:'2026-10-02T09:00:00Z',tier:2,covered_metrics:['uni.growth_budget'],fixture:false}],
  observations:[{...old,id:'test-utc-budget@3',version:old.version+1,supersedes:old.id,as_of_date:'2026-10-03',source_ids:['test-utc-review-source']}]};
}

test('research preview rejects a review on the preceding UTC day before any journal writes',()=>{
 const history=fingerprint(readSnapshots(production.root,'production'));
 assert.throws(()=>prepareResearchRefresh(production,batch()),/precedes refresh as-of/);
 assert.equal(fingerprint(readSnapshots(production.root,'production')),history);
});

test('research preview permits a correct UTC-day review while preserving metadata and canonical state',()=>{
 const proposal=batch();proposal.review.reviewed_at='2026-10-02T23:00:00-08:00';
 const before=fingerprint(production),history=fingerprint(readSnapshots(production.root,'production'));
 const result=prepareResearchRefresh(production,proposal);
 assert.equal(result.preview.persisted,false);
 assert.equal(proposal.review.reviewed_at,'2026-10-02T23:00:00-08:00');
 assert.equal(fingerprint(production),before);assert.equal(fingerprint(readSnapshots(production.root,'production')),history);
});
