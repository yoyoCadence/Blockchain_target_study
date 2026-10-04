import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadProject,calculate,readYaml,validateProject} from '../../engine/index.js';
import {fingerprint,readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {prepareResearchRefresh} from '../../engine/research/index.js';
import {inspectResearch} from '../../engine/research/inspection.js';

const project=loadProject('production'),history=readSnapshots(project.root,'production');
const quoteReview=history.find(s=>s.event?.id==='uni-xlm-market-quotes-source-review-20261004');
const previous=history[history.indexOf(quoteReview)-1];
const proposal=readYaml('data/research/market-quotes-2026-10-04.yaml');
const archive=readYaml('data/research/market-quotes-2026-10-04-v1.json');

test('saved market quote archive preserves exact primary responses, product units and independent UTC instants',()=>{
 const {id,...content}=archive;assert.equal(id,fingerprint(content));
 assert.equal(archive.fixture,false);assert.equal(archive.captures.length,4);
 assert.deepEqual(proposal.observations.map(o=>[o.asset,o.value]),[['UNI',9.0556],['XLM',0.216265]]);
 validateProject({...project,inputs:[...quoteReview.inputs,...proposal.observations]});
 for(const observation of proposal.observations) {
  const [tickerCapture,productCapture]=observation.source_ids.map(source=>archive.captures.find(c=>c.id===source));
  const ticker=JSON.parse(tickerCapture.body),product=JSON.parse(productCapture.body);
  assert.equal(tickerCapture.status,200);assert.equal(productCapture.status,200);
  assert.equal(product.id,`${observation.asset}-USD`);assert.equal(product.base_currency,observation.asset);
  assert.equal(product.quote_currency,'USD');assert.equal(observation.unit,'USD');
  assert.equal(observation.classification,'OBSERVED');assert.equal(observation.confidence,'medium');assert.equal(observation.fixture,false);
  assert.equal(observation.value,Number(ticker.price));assert.equal(observation.as_of_date,ticker.time.slice(0,10));
  assert.deepEqual(observation.period,{basis:'point',end:ticker.time.slice(0,10)});
  assert.match(ticker.time,/\.\d{9}Z$/);assert.ok(observation.rationale.includes(ticker.time));
  assert.ok(observation.rationale.includes(tickerCapture.body));assert.ok(observation.rationale.includes(archive.id));
  for(const capture of [tickerCapture,productCapture]) {
   const source=quoteReview.sources.find(s=>s.id===capture.id);assert.ok(source);
   assert.equal(source.url,capture.url);assert.equal(source.publisher,'Coinbase Exchange');assert.equal(source.tier,1);
   assert.equal(source.retrieved_at,capture.retrieved_at);assert.equal(source.date,'2026-10-04');
   assert.ok(Date.parse(capture.requested_at)<=Date.parse(capture.retrieved_at));
   assert.ok(Date.parse(source.retrieved_at)<=Date.parse(quoteReview.event.research_review.reviewed_at));
  }
  assert.ok(Date.parse(ticker.time)<=Date.parse(tickerCapture.retrieved_at));
  assert.match(observation.rationale,/不是 bid、ask、中間價或收盤價/);
 }
 assert.equal(JSON.parse(archive.captures[0].body).time,'2026-10-04T11:33:36.662371063Z');
 assert.equal(JSON.parse(archive.captures[1].body).time,'2026-10-04T11:33:54.575362751Z');
});

test('source-only quote review appends four sources while retaining every financial and historical version',()=>{
 verifySnapshot(quoteReview);assert.equal(quoteReview.parent_id,previous.id);
 assert.equal(previous.id,'729d45b96a313aa128095c53c26d179d75621dc38002ab08ea0b873690ec7135');
 const {propagated_nodes,...event}=quoteReview.event;
 assert.deepEqual(event,readYaml('data/research/market-quotes-source-review-2026-10-04.yaml'));
 assert.equal(event.type,'market_data_review');assert.equal(event.status,'completed');assert.deepEqual(event.updates,[]);
 assert.deepEqual(propagated_nodes,['UNI','XLM']);assert.equal(event.sources.length,4);
 assert.equal(quoteReview.sources.length,previous.sources.length+4);
 for(const field of ['inputs','metrics','observations','assumptions','scenarios','formulas','rules','dictionary','graph',
  'assets','market_valuation','thesis','period','sensitivity'])assert.deepEqual(quoteReview[field],previous[field],field);
 for(const source of previous.sources)assert.deepEqual(quoteReview.sources.find(s=>s.id===source.id),source);
 const compared=compareSnapshots(previous,quoteReview);
 assert.equal(compared.source_change,true);assert.deepEqual(compared.changes,[]);
 for(const flag of ['formula_change','assumption_change','scenario_change','rule_change'])assert.equal(compared[flag],false);
});

test('unaligned current quote candidate is refused before persistence without moving historical periods',()=>{
 const before=fingerprint({project,history,economics:calculate(project)});
 const pending=readYaml('data/research/uni-market-quote-pending-2026-10-04.yaml');
 const candidate=calculate({...project,inputs:[...project.inputs,...pending.observations]});
 assert.deepEqual(candidate.issues.filter(i=>i.severity==='ERROR').map(i=>i.metric_id),
  ['uni.net_accrual','uni.required_share','uni.required_share_net']);
 assert.ok(candidate.issues.filter(i=>i.severity==='ERROR').every(i=>/Unaligned accounting periods/.test(i.message)));
 assert.throws(()=>prepareResearchRefresh(project,pending),/Cannot snapshot calculation errors/);
 assert.equal(fs.existsSync(path.join(project.root,'data/events/production',`${proposal.id}.json`)),false);
 assert.equal(fingerprint({project,history:readSnapshots(project.root,'production'),economics:calculate(project)}),before);
 assert.equal(quoteReview.period.end,'2026-01-01');
 assert.equal(Object.values(quoteReview.metrics).filter(m=>m.value===null).length,83);
 for(const metric of ['uni.price','xlm.price','uni.market_cap','uni.fdv','secz.ev','uni.growth_distribution','uni.net_accrual'])
  assert.equal(quoteReview.metrics[metric].value,null,metric);
});

test('quote source review remains separately inspectable, replayable and excluded from fixture and thesis periods',()=>{
 const review=inspectResearch(project).events.find(e=>e.id===quoteReview.event.id);
 assert.equal(review.recorded_update_count,0);assert.equal(review.sources.length,4);
 assert.match(review.event.reason,/9\.0556 USD\/UNI/);assert.match(review.event.reason,/0\.216265 USD\/XLM/);
 assert.match(review.event.reason,/正式 uni.price／xlm.price/);assert.ok(review.event.research_review.rationale.includes(archive.id));
 assert.deepEqual(inspectResearch(loadProject('fixture')).events,[]);
 assert.equal(new Set(history.slice(0,history.indexOf(quoteReview)+1).map(s=>JSON.stringify(s.period))).size,1);
 assert.ok(Object.values(quoteReview.thesis).every(t=>t.coverage==='insufficient'));
 const replay=calculate({...project,inputs:quoteReview.inputs,sources:quoteReview.sources,
  registry:{...project.registry,formulas:quoteReview.formulas}},
  {history:history.slice(0,history.indexOf(quoteReview)),previousThesis:previous.thesis});
 assert.deepEqual(replay.metrics,quoteReview.metrics);assert.deepEqual(replay.thesis,quoteReview.thesis);
});
