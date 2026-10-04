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
  const bytes=entry.kind==='fixed_block'?fs.readFileSync(path.join(project.root,'data/research',entry.file)):null;
  const saved=bytes?JSON.parse(bytes):readYaml(`data/research/${entry.file}`,project.root);
  const actualId=bytes?createHash('sha256').update(bytes).digest('hex'):entry.kind==='identity'?fingerprint(saved):saved.id;
  assert(actualId===entry.expected_id,'Research catalog fingerprint mismatch');
  let records,periods=[],sources,statement=null,comparability=null,review,as_of_date,capital=null,fixedBlock=null,formulas=[];
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
  } else if(entry.kind==='fixed_block') {
   fixedBlock=reviewFixedBlock(project,bytes,entry.expected_id);
   const reviewedEvent=inspectReviewedEvents(project).find(e=>e.id===entry.event_id);
   assert(reviewedEvent&&reviewedEvent.event.as_of_date===saved.anchor.as_of_date&&
    reviewedEvent.event.reason.includes(entry.expected_id)&&saved.source_ids.every(id=>reviewedEvent.event.source_ids.includes(id)),
    'Fixed-block catalog does not match reviewed event');
   review=reviewedEvent.event.research_review;as_of_date=saved.anchor.as_of_date;
   periods=[{basis:'point',end:saved.anchor.effective_at.slice(0,10)}];
   records=saved.observations.map(o=>({...o,id:`${saved.id}:${o.id}`,asset:'UNI',metric_id:`research.uni.vesting.${o.id}`,
    label:fixedBlock.summary.values.find(v=>v.id===o.id).label,unit:o.abi_type,confidence:saved.confidence,period:periods[0],observed_at:saved.anchor.effective_at}));
   const sourceIds=[...new Set([...saved.source_ids,...fixedBlock.method.source_ids])];
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
   ...(fixedBlock?{summary:fixedBlock.summary,method:fixedBlock.method,event_id:entry.event_id,
    notice:'固定區塊原始值；唯讀查閱不更新金融、年度預算或論點。'}:{})});
 }
 content.events=inspectReviewedEvents(project);
 return structuredClone(content);
}
