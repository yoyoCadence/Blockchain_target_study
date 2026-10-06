import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {readYaml} from '../index.js';
import {assert,unique,validateSchema} from '../validation/index.js';
import {fingerprint} from '../snapshots.js';
import {reviewIdentities} from './identities.js';
import {reviewRevenues,verifyRevenueReview} from './revenues.js';
import {reviewRevenueTtm,verifyRevenueTtm} from './revenue-ttm.js';
import {replayCapitalReview} from './capital.js';
import {inspectReviewedEvents} from './event-evidence.js';
import {reviewFixedBlock} from './fixed-block.js';
import {reviewTokenState} from './token-state.js';
import {reviewPublicVenue} from './public-venue.js';
import {reviewXlmSupply} from './xlm-supply.js';
import {reviewUniSupplyComposition} from './supply-composition.js';
import {reviewUniFirepitState} from './firepit-state.js';

// Explicit local catalog only: no discovery, remote fetching, ingestion or writes.
export function inspectResearch(project,{catalog}={}) {
 assert(['fixture','production'].includes(project.mode),'Invalid research inspection mode');
 const content={mode:project.mode,persisted:false,financial_inputs_updated:false,records:[],events:[],
  notice:project.mode==='fixture'?'Production research is available in the Production workspace; it is not mixed with synthetic fixtures.':'Original research evidence, separate from canonical financial inputs. Same-period filings do not add thesis periods; unverified values remain unknown.'};
 if(project.mode==='fixture') return content;
 catalog??=readYaml('spec/research-catalog.yaml',project.root);
 validateSchema(readYaml('spec/research-catalog-schema.yaml',project.root),catalog,'research catalog');
 unique(catalog.records);unique(catalog.records,'file');unique(catalog.records,'expected_id');
 const knownSources=new Map(project.sources.map(source=>[source.id,fingerprint(source)]));
 const recordDigest=(record,period,statement)=>{
  const {sources:embeddedSources,...original}=record;
  return fingerprint({record:original,period,statement});
 };
 const knownRecords=new Map(project.inputs.map(record=>[record.id,recordDigest(record,record.period,null)]));
 const versionKey=record=>JSON.stringify([record.id,record.version]);
 const knownFormulas=new Map(project.registry.formulas.map(formula=>[versionKey(formula),fingerprint(formula)]));
 const knownAssumptions=new Map(project.inputs.filter(record=>record.classification==='ASSUMPTION').map(record=>[versionKey(record),fingerprint(record)]));
 for(const entry of catalog.records) {
  const bytes=['fixed_block','token_state','public_venue','xlm_supply','uni_supply_composition','uni_firepit_state'].includes(entry.kind)?fs.readFileSync(path.join(project.root,'data/research',entry.file)):null;
  const saved=bytes?JSON.parse(bytes):readYaml(`data/research/${entry.file}`,project.root);
  const actualId=bytes?createHash('sha256').update(bytes).digest('hex'):entry.kind==='identity'?fingerprint(saved):saved.id;
  assert(actualId===entry.expected_id,'Research catalog fingerprint mismatch');
  let records,periods=[],sources,statement=null,comparability=null,review,as_of_date,capital=null,fixedBlock=null,publicVenue=null,xlmSupply=null,uniBlock=null,formulas=[];
  if(entry.kind==='identity') {
   const result=reviewIdentities(project,saved);
   records=result.identities;sources=saved.sources;review=saved.review;as_of_date=saved.as_of_date;
  } else if(entry.kind==='revenue') {
   verifyRevenueReview(saved);
   assert(reviewRevenues(project,saved.dossier,{formulas:saved.formulas}).id===saved.id,'Research catalog revenue does not replay');
   ({observations:records,periods,sources,statement,review,as_of_date}=saved.dossier);
   formulas=saved.formulas;
  } else if(entry.kind==='capital') {
   capital=replayCapitalReview(project,saved);
   records=[...saved.observations,...saved.derived];
   periods=[...new Map(records.map(r=>[fingerprint(r.period),r.period])).values()];
   ({sources,review,as_of_date}=saved);
   formulas=saved.formulas;
  } else if(entry.kind==='public_venue') {
   publicVenue=reviewPublicVenue(project,bytes,entry.expected_id);
   const reviewedEvent=inspectReviewedEvents(project).find(e=>e.id===entry.event_id);
   assert(reviewedEvent&&reviewedEvent.event.as_of_date===saved.as_of_date&&reviewedEvent.event.reason.includes(entry.expected_id)&&
    publicVenue.method.source_ids.every(id=>reviewedEvent.event.source_ids.includes(id)), 'Public-venue catalog does not match reviewed event');
   review=reviewedEvent.event.research_review;as_of_date=saved.as_of_date;
   assert(saved.captures.every(c=>Date.parse(c.received_at)<=Date.parse(review.reviewed_at)),'Public-venue capture retrieved after review');
   records=[...saved.observations,...saved.derived].map(o=>{
    const value=publicVenue.summary.values.find(v=>v.id===o.id);
    return {...o,metric_id:o.classification==='DERIVED'?o.formula_id:`${o.asset.toLowerCase()}.venue_evidence`,
     label:value?`${value.asset}／${value.kind==='currency'?'貨幣與網路':'產品'} · ${value.label}`:'UNI 回報地址與原身份文字比較'};
   });
   periods=[{basis:'point',end:saved.as_of_date}];formulas=saved.formulas;
   sources=publicVenue.method.source_ids.map(id=>project.sources.find(s=>s.id===id));
  } else if(['uni_supply_composition','uni_firepit_state'].includes(entry.kind)) {
   uniBlock=(entry.kind==='uni_firepit_state'?reviewUniFirepitState:reviewUniSupplyComposition)(project,bytes,entry.expected_id);
   sources=uniBlock.method.source_ids.map(id=>project.sources.find(s=>s.id===id));
   const reviewedEvent=inspectReviewedEvents(project).find(e=>e.id===entry.event_id);
   assert(reviewedEvent&&reviewedEvent.event.as_of_date===saved.as_of_date&&reviewedEvent.event.reason.includes(entry.expected_id)&&
    sources.every(source=>reviewedEvent.sources.some(s=>fingerprint(s)===fingerprint(source))),'UNI fixed-block catalog does not match reviewed event');
   review=reviewedEvent.event.research_review;as_of_date=saved.as_of_date;
   assert([saved.captured_at,...saved.documents.map(d=>d.received_at)].every(time=>Date.parse(time)<=Date.parse(review.reviewed_at)),'UNI fixed-block capture retrieved after review');
   const labels=new Map(uniBlock.summary.derived.map(d=>[d.id,d.label]));
   records=[...saved.observations,...saved.derived.map(d=>({...d,label:labels.get(d.id)}))];
   periods=[{basis:'point',end:saved.anchor.effective_at.slice(0,10)}];formulas=saved.formulas;
  } else if(entry.kind==='xlm_supply') {
   xlmSupply=reviewXlmSupply(project,bytes,entry.expected_id);
   const reviewedEvent=inspectReviewedEvents(project).find(e=>e.id===entry.event_id);
   assert(reviewedEvent&&reviewedEvent.event.as_of_date===saved.as_of_date&&reviewedEvent.event.reason.includes(entry.expected_id)&&
    saved.sources.every(source=>reviewedEvent.sources.some(s=>fingerprint(s)===fingerprint(source))),'XLM supply catalog does not match reviewed event');
   review=reviewedEvent.event.research_review;as_of_date=saved.as_of_date;
   assert(saved.captures.every(c=>Date.parse(c.received_at)<=Date.parse(review.reviewed_at)),'XLM supply capture retrieved after review');
   const labels=new Map([...xlmSupply.summary.values.map(v=>[v.id,`XLM 回報 · ${v.label}`]),
    ...xlmSupply.summary.residuals.map(r=>[r.id,r.formula_id==='research.xlm.supply.total_residual'?'總供給殘差（原始＋inflation－burned－total）':'流通殘差（total－升級準備－費用池－SDF mandate－流通）'])]);
   records=[...saved.observations,...saved.derived].map(o=>({...o,label:labels.get(o.id)}));
   periods=[{basis:'point',end:saved.as_of_date}];formulas=saved.formulas;
   sources=xlmSupply.method.source_ids.map(id=>project.sources.find(s=>s.id===id));
  } else if(['fixed_block','token_state'].includes(entry.kind)) {
   const tokenState=entry.kind==='token_state',inspect=tokenState?reviewTokenState:reviewFixedBlock;
   fixedBlock=inspect(project,bytes,entry.expected_id);
   const originalSourceIds=tokenState?saved.anchor.source_ids:saved.source_ids;
   const reviewedEvent=inspectReviewedEvents(project).find(e=>e.id===entry.event_id);
   assert(reviewedEvent&&reviewedEvent.event.as_of_date===saved.anchor.as_of_date&&
    reviewedEvent.event.reason.includes(entry.expected_id)&&originalSourceIds.every(id=>reviewedEvent.event.source_ids.includes(id)),
    'Fixed-block catalog does not match reviewed event');
   review=reviewedEvent.event.research_review;as_of_date=saved.anchor.as_of_date;
   periods=[{basis:'point',end:saved.anchor.effective_at.slice(0,10)}];
   if(tokenState) {
    records=[...saved.observations,...saved.derived].map(o=>({...o,asset:'UNI',
     metric_id:o.classification==='DERIVED'?o.formula_id:`research.uni.token-state.${fixedBlock.summary.values.find(v=>v.id===o.id).key}`,
     label:o.classification==='DERIVED'?'餘額與剩餘授權比較旗標':fixedBlock.summary.values.find(v=>v.id===o.id).label}));
    formulas=saved.formulas;
   } else records=saved.observations.map(o=>({...o,id:`${saved.id}:${o.id}`,asset:'UNI',metric_id:`research.uni.vesting.${o.id}`,
    label:fixedBlock.summary.values.find(v=>v.id===o.id).label,unit:o.abi_type,confidence:saved.confidence,period:periods[0],observed_at:saved.anchor.effective_at}));
   const sourceIds=[...new Set([...originalSourceIds,...fixedBlock.method.source_ids])];
   sources=sourceIds.map(id=>project.sources.find(s=>s.id===id));
  } else {
   verifyRevenueTtm(saved);
   assert(reviewRevenueTtm(project,saved.request,saved.input_reviews.annual,saved.input_reviews.interim,{formula:saved.formula}).id===saved.id,'Research catalog TTM does not replay');
   records=saved.results;periods=records.map(r=>r.period);comparability=saved.request.comparability;
   sources=[...new Map(Object.values(saved.input_reviews).flatMap(r=>r.dossier.sources).map(s=>[s.id,s])).values()];
   review=saved.request.review;as_of_date=saved.request.as_of_date;
   formulas=[saved.formula,...Object.values(saved.input_reviews).flatMap(input=>input.formulas)];
  }
  // Reuse the same immutable evidence IDs across every read-only entry point.
  // Embedded rendering sources are checked separately, not observation fields.
  for(const source of sources) {
   const digest=fingerprint(source);
   assert(!knownSources.has(source.id)||knownSources.get(source.id)===digest,`Research source ID conflict: ${source.id}`);
   knownSources.set(source.id,digest);
  }
  for(const record of records) {
   const period=record.period||periods.find(p=>p.id===record.period_id)||null;
   const digest=recordDigest(record,period,statement);
   assert(!knownRecords.has(record.id)||knownRecords.get(record.id)===digest,`Research record ID conflict: ${record.id}`);
   knownRecords.set(record.id,digest);
  }
  for(const formula of formulas) {
   const key=versionKey(formula),digest=fingerprint(formula);
   assert(!knownFormulas.has(key)||knownFormulas.get(key)===digest,`Research formula version conflict: ${formula.id} / v${formula.version}`);
   knownFormulas.set(key,digest);
  }
  if(comparability) {
   const key=versionKey(comparability),digest=fingerprint(comparability);
   assert(!knownAssumptions.has(key)||knownAssumptions.get(key)===digest,`Research assumption version conflict: ${comparability.id} / v${comparability.version}`);
   knownAssumptions.set(key,digest);
  }
  content.records.push({id:entry.id,label:entry.label,kind:entry.kind,artifact_id:actualId,
   as_of_date,review,records,periods,sources,statement,comparability,full_review:saved,
   ...(capital?{context:saved.context,summary:capital.summary,notice:capital.notice}:{}),
   ...(publicVenue?{summary:publicVenue.summary,method:publicVenue.method,event_id:entry.event_id,
    notice:'單一平台的公開回報；個人／地區／託管／交易／提款仍未驗證，不更新金融或投資性。'}:{}),
   ...(uniBlock?{summary:uniBlock.summary,method:uniBlock.method,event_id:entry.event_id,
    notice:entry.kind==='uni_firepit_state'?'固定區塊的 Firepit 狀態；次數乘以現行門檻不等於已查證的累計或年度銷毀，dead 餘額未歸因，不更新金融、估值或論點。':'固定區塊的供給組成與鑄造參數；扣除後餘額不是流通供給，鑄造條件不是預測，不更新金融、市值／FDV 或論點。'}:{}),
   ...(xlmSupply?{summary:xlmSupply.summary,method:xlmSupply.method,event_id:entry.event_id,
    notice:'供應者回報的單一時點供給與算術殘差；不是獨立 ledger／帳戶查證、自由流通、同步市值／FDV 或投資性判斷，不更新金融。'}:{}),
   ...(fixedBlock?{summary:fixedBlock.summary,method:fixedBlock.method,event_id:entry.event_id,
    notice:entry.kind==='token_state'?'固定區塊餘額／供給及 point 比較；唯讀查閱不更新金融、年度分配、市值／FDV 或論點。':'固定區塊原始值；唯讀查閱不更新金融、年度預算或論點。'}:{})});
 }
 content.events=inspectReviewedEvents(project);
 return structuredClone(content);
}
