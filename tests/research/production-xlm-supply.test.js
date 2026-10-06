import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots,fingerprint} from '../../engine/snapshots.js';
import {inspectResearch} from '../../engine/research/inspection.js';
import {sourceFreshness} from '../../engine/research/freshness.js';

const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='xlm-reported-supply-20261005'),index=history.indexOf(saved),previous=history[index-1];
const raw=fs.readFileSync('data/research/xlm-supply-2026-10-05-v1.json'),a=JSON.parse(raw);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('XLM supply preserves exact captured bytes, provider timestamp and all nine reported fields',()=>{
 verifySnapshot(saved);const {propagated_nodes,...event}=saved.event;
 assert.deepEqual(event,readYaml('data/research/xlm-supply-2026-10-05.yaml'));
 assert.equal(hash(raw),'790c9763971cb01bd8712431ea7207eb4f4418e5a17459cf0df661f1ede5ad51');
 assert.ok(event.reason.includes(hash(raw)));assert.equal(a.fixture,false);assert.equal(a.version,1);
 const [capture,document]=a.captures,body=JSON.parse(capture.response_json);
 assert.equal(hash(capture.response_json),capture.body_sha256);
 assert.equal(capture.url,'https://dashboard.stellar.org/api/v2/lumens/');
 assert.equal(document.url,'https://developers.stellar.org/docs/learn/fundamentals/lumens');
 for(const c of a.captures) {
  assert.equal(c.method,'GET');assert.equal(c.http_status,200);
  assert.ok(Date.parse(c.started_at)<=Date.parse(c.received_at));
  assert.ok(Date.parse(c.received_at)<=Date.parse(event.research_review.reviewed_at));
  assert.equal(new Date(c.http_date).toISOString().slice(0,10),a.as_of_date);
  assert.match(c.body_sha256,/^[a-f0-9]{64}$/);
 }
 assert.equal(body.updatedAt,'2026-10-05T11:14:19.137Z');
 assert.ok(Date.parse(body.updatedAt)<Date.parse(capture.received_at));
 assert.equal(a.context.provider_updated_at,body.updatedAt);assert.equal(a.context.received_at,capture.received_at);
 const fields=['originalSupply','inflationLumens','burnedLumens','totalSupply','upgradeReserve','feePool','sdfMandate','circulatingSupply','updatedAt'];
 assert.deepEqual(a.observations.map(o=>o.field),fields);
 assert.equal(new Set(a.observations.map(o=>o.id)).size,9);
 for(const o of a.observations) {
  assert.equal(o.value,body[o.field]);assert.equal(o.raw_value,body[o.field]);assert.equal(typeof o.value,'string');
  assert.equal(o.classification,'OBSERVED');assert.equal(o.fixture,false);assert.equal(o.confidence,'medium');
  assert.equal(o.measurement_basis,'provider_reported');assert.equal(o.unit,o.field==='updatedAt'?'UTC instant':'XLM');
  assert.equal(o.asset,'XLM');assert.equal(o.version,1);assert.equal(o.as_of_date,a.as_of_date);
  assert.deepEqual(o.period,{basis:'point',end:a.as_of_date});
  assert.deepEqual(o.source_ids,[a.sources[0].id]);assert.ok(a.sources[0].covered_metrics.includes(o.metric_id));
  assert.equal(o.observed_at,body.updatedAt);assert.equal(o.response_received_at,capture.received_at);
 }
 assert.equal(a.context.document_last_updated_date,'2026-09-28');
 assert.equal(a.sources[1].date,a.context.document_last_updated_date);
 assert.equal(document.last_updated_marker,null);assert.match(a.context.document_date_basis,/未保存或重播完整正文/);
});

test('XLM research residuals replay embedded signed decimal v1 with exact record dependencies and seven decimal places',()=>{
 const byId=new Map(a.observations.map(o=>[o.id,o]));
 const scaled=value=>{assert.match(value,/^\d+(?:\.\d{1,7})?$/);const [whole,fraction='']=value.split('.');return BigInt(whole)*10000000n+BigInt(fraction.padEnd(7,'0'));};
 const expected=[['originalSupply',1,'inflationLumens',1,'burnedLumens',-1,'totalSupply',-1],
  ['totalSupply',1,'upgradeReserve',-1,'feePool',-1,'sdfMandate',-1,'circulatingSupply',-1]];
 assert.equal(a.formulas.length,2);assert.equal(a.derived.length,2);
 assert.deepEqual(a.formulas.map(f=>f.id),['research.xlm.supply.total_residual','research.xlm.supply.circulating_residual']);
 a.formulas.forEach((f,i)=>{
  assert.equal(f.version,1);assert.equal(f.unit,'XLM');assert.equal(f.decimals,7);
  assert.equal(f.expression.op,'signed_decimal_sum');assert.ok(f.rationale);
  assert.deepEqual(f.method_source_ids,[a.sources[1].id]);
  assert.deepEqual(f.expression.args.flatMap(arg=>[byId.get(arg.record_id).field,arg.sign]),expected[i]);
  const residual=f.expression.args.reduce((sum,arg)=>sum+BigInt(arg.sign)*scaled(byId.get(arg.record_id).value),0n);
  const d=a.derived[i];assert.equal(d.formula_id,f.id);assert.equal(d.formula_version,f.version);
  assert.equal(d.classification,'DERIVED');assert.equal(d.fixture,false);assert.equal(d.confidence,'medium');
  assert.deepEqual(d.dependencies,f.expression.args.map(arg=>arg.record_id));
  assert.equal(d.value,'0.0000000');assert.equal(scaled(d.value),residual);assert.equal(residual,0n);
  assert.equal(d.unit,f.unit);assert.equal(d.observed_at,a.context.provider_updated_at);
  assert.deepEqual(d.period,{basis:'point',end:a.as_of_date});assert.equal(d.as_of_date,a.as_of_date);
 });
 for(const field of ['ledger_sequence','ledger_hash','component_account_balances','independently_verified_circulating_supply',
  'fully_diluted_supply','synchronized_market_cap','synchronized_fdv'])assert.equal(a.context[field],null);
 assert.equal(a.limitations.length,4);
 assert.ok(a.limitations.some(l=>l.includes('没有獨立核對 ledger')));
 assert.ok(a.limitations.some(l=>l.includes('前一天 Coinbase')));
});

test('XLM supply source-only event appends versioned evidence while original identity and price lineage remain intact',()=>{
 const event=saved.event;assert.deepEqual(event.updates,[]);assert.equal(event.status,'completed');assert.equal(event.type,'market_data_review');
 assert.deepEqual(event.sources,a.sources);assert.deepEqual(event.source_ids,a.sources.map(s=>s.id));
 assert.equal(saved.parent_id,'f69c8c2d8b4b5f036177b1e482b8c07eb23651849b786eeaa7e0afee44da9941');
 assert.equal(saved.sources.length,previous.sources.length+2);
 for(const s of previous.sources)assert.deepEqual(saved.sources.find(next=>next.id===s.id),s);
 a.sources.forEach((s,i)=>{
  assert.deepEqual(saved.sources.find(next=>next.id===s.id),s);assert.equal(s.fixture,false);assert.equal(s.tier,2);
  assert.equal(s.retrieved_at,a.captures[i].received_at);assert.equal(s.url,a.captures[i].url);
  assert.ok(s.date<=a.as_of_date);assert.ok(Date.parse(s.retrieved_at)<=Date.parse(event.research_review.reviewed_at));
 });
 const doc=a.sources[1],old=saved.sources.find(s=>s.id===doc.supersedes);
 assert.equal(doc.version,2);assert.equal(doc.supersedes,'stellar-lumens-docs-20260928-v1');assert.equal(old.version,1);
 const identities=readYaml('data/research/core-identifiers-2026-10-03.yaml');
 assert.ok(identities.identities.find(r=>r.asset==='XLM').source_ids.includes(old.id));
 assert.deepEqual(saved.metrics['xlm.price'],previous.metrics['xlm.price']);assert.equal(saved.metrics['xlm.price'].as_of_date,'2026-10-04');
});

test('XLM supply preserves all financial, thesis, immutable history and fixture results without a new model period',()=>{
 const diff=compareSnapshots(previous,saved);assert.equal(diff.source_change,true);assert.deepEqual(diff.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(diff[flag],false);
 const byId=rows=>[...rows].sort((a,b)=>a.id.localeCompare(b.id));
 for(const field of ['inputs','observations'])assert.deepEqual(byId(saved[field]),byId(previous[field]));
 for(const field of ['metrics','formulas','assumptions','scenarios','rules','assets','graph','thesis','market_valuation','sensitivity','dictionary','period'])
  assert.deepEqual(saved[field],previous[field]);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
 assert.equal(saved.period.end,'2026-10-04');assert.equal(new Set(history.slice(0,index+1).map(s=>s.period.end)).size,2);
 for(const id of ['secz.revenue','xlm.network_fees','xlm.native_demand','xlm.capture_ratio','uni.market_cap','uni.fdv'])assert.equal(saved.metrics[id].value,null);
 assert.equal(sourceFreshness(p,{as_of_date:'2026-10-05'}).inputs.find(r=>r.metric_id==='uni.growth_budget').observation_state,'STALE_FOR_CURRENT_USE');
 const before=fingerprint(history);
 const replay=calculate({...p,inputs:saved.inputs,sources:saved.sources,registry:{...p.registry,formulas:saved.formulas}},
  {history:history.slice(0,index),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,saved.metrics);assert.deepEqual(replay.thesis,saved.thesis);
 for(const snapshot of history)verifySnapshot(snapshot);
 const inspected=inspectResearch(p),entry=inspected.events.find(e=>e.id===saved.event.id);
 assert.equal(entry.recorded_update_count,0);assert.deepEqual(entry.sources,a.sources);
 assert.equal(inspected.records.length,10);assert.ok(!inspected.records.some(r=>r.id===a.id));
 assert.equal(inspected.records.find(r=>r.kind==='xlm_supply').artifact_id,hash(raw));
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.equal(calculate(loadProject('fixture')).metrics['uni.required_share'].value,0.422);
 assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});
