import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewIdentities} from '../../engine/research/identities.js';
import {sourceFreshness} from '../../engine/research/freshness.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode),saved=history.find(s=>s.event?.id==='uni-xlm-public-venue-state-20261005'),index=history.indexOf(saved),previous=history[index-1];
const file='data/research/uni-xlm-public-venue-2026-10-05-v1.json',raw=fs.readFileSync(file),a=JSON.parse(raw);

test('public venue evidence preserves each original response/time and unknown XLM contract without inventing state timestamps',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;assert.deepEqual(event,readYaml('data/research/uni-xlm-public-venue-2026-10-05.yaml'));
 const hash=createHash('sha256').update(raw).digest('hex');assert.equal(hash,'116eca762bb31dbbe9a30a26539e88df98a5a98503e6e489df7ae795e36ce03c');assert.ok(event.reason.includes(hash));
 assert.equal(a.captures.length,4);assert.equal(a.observations.length,26);assert.equal(new Set(a.observations.map(o=>o.id)).size,26);
 const reconstructed=Buffer.from(JSON.stringify(a.captures.map(({source_id,...capture})=>capture),null,2)+'\n');
 assert.equal(createHash('sha256').update(reconstructed).digest('hex'),a.transport_archive_sha256);
 for(const capture of a.captures) {
  assert.equal(capture.method,'GET');assert.equal(capture.http_status,200);assert.equal(new URL(capture.url).hostname,'api.exchange.coinbase.com');
  assert.ok(Date.parse(capture.started_at)<=Date.parse(capture.received_at));assert.ok(Date.parse(capture.received_at)<=Date.parse(event.research_review.reviewed_at));
  assert.equal(new Date(capture.http_date).toISOString().slice(0,10),'2026-10-05');
  assert.equal(saved.sources.find(s=>s.id===capture.source_id).retrieved_at,capture.received_at);
  const body=JSON.parse(capture.response_json);
  for(const o of a.observations.filter(o=>o.source_ids.includes(capture.source_id))) {
   const expected=o.field.startsWith('network.')?body.supported_networks.find(n=>n.id===body.default_network)[o.field.slice(8)]:body[o.field];
   assert.deepEqual(o.raw_value,expected);assert.deepEqual(o.value,expected===''?null:expected);
   assert.equal(o.classification,'OBSERVED');assert.equal(o.fixture,false);assert.equal(o.period.basis,'point');assert.equal(o.as_of_date,'2026-10-05');
   assert.equal(o.response_received_at,capture.received_at);assert.equal(o.provider_state_timestamp,null);
  }
 }
 const unknown=a.observations.find(o=>o.asset==='XLM'&&o.field==='network.contract_address');
 assert.equal(unknown.raw_value,'');assert.equal(unknown.value,null);assert.equal(unknown.confidence,'unknown');
 assert.ok(a.observations.filter(o=>o.field==='trading_disabled').every(o=>o.value===false&&o.unit==='flag'));
});

test('reported UNI address comparison replays embedded v1 with its original identity records, versions and exact fields',()=>{
 const original=readYaml('data/research/'+a.identity_dependency.file);assert.equal(fingerprint(original),a.identity_dependency.dossier_fingerprint);
 assert.equal(reviewIdentities(p,original).promoted,false);
 for(const record of a.identity_dependency.records)assert.deepEqual(record,original.identities.find(r=>r.id===record.id));
 for(const source of a.identity_dependency.sources)assert.deepEqual(source,original.sources.find(s=>s.id===source.id));
 const [formula]=a.formulas,[derived]=a.derived,records=[...a.observations,...a.identity_dependency.records];
 assert.equal(formula.expression.op,'casefold_evm_address_eq');assert.equal(formula.version,1);assert.equal(derived.classification,'DERIVED');
 assert.equal(derived.formula_id,formula.id);assert.equal(derived.formula_version,formula.version);assert.deepEqual(derived.dependencies,formula.expression.args.map(arg=>arg.record_id));
 const [reported,identity]=formula.expression.args.map(arg=>{const r=records.find(r=>r.id===arg.record_id);assert.ok(r);assert.ok(['value','identifier.contract_address'].includes(arg.field));return arg.field==='value'?r.value:r.identifier.contract_address;});
 assert.ok([reported,identity].every(address=>/^0x[0-9a-fA-F]{40}$/.test(address)));
 assert.equal(derived.value,reported.toLowerCase()===identity.toLowerCase()?1:0);assert.equal(derived.value,1);
 for(const field of ['investor_eligibility','jurisdiction_review','custody_review','account_trading_access','withdrawal_access'])assert.equal(a.access_review[field],null);
 assert.equal(a.access_review.status,'unverified');
});

test('public venue source versions append while all original financial values, price dates, universe stages and history persist',()=>{
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 const byId=rows=>[...rows].sort((a,b)=>a.id.localeCompare(b.id));for(const field of ['inputs','observations'])assert.deepEqual(byId(saved[field]),byId(previous[field]));
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])assert.deepEqual(saved[field],previous[field]);
 for(const source of previous.sources)assert.deepEqual(saved.sources.find(s=>s.id===source.id),source);
 assert.equal(saved.sources.length,previous.sources.length+6);assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
 for(const asset of ['uni','xlm']) {
  const next=saved.sources.find(s=>s.id===`coinbase-${asset}-product-20261005-v2`);assert.equal(next.version,2);assert.equal(next.supersedes,`coinbase-${asset}-product-20261004-v1`);
  assert.deepEqual(saved.metrics[asset+'.price'],previous.metrics[asset+'.price']);
 }
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-05'}).inputs.find(r=>r.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 const before=fingerprint(history),replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 assert.equal(new Set(history.slice(0,index+1).map(s=>s.period.end)).size,2);assert.equal(saved.period.end,'2026-10-04');
 assert.equal(inspectResearch(p).events.find(e=>e.id===saved.event.id).recorded_update_count,0);assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
