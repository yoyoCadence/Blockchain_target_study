import {readYaml} from '../index.js';
import {assert,unique,validateSchema} from '../validation/index.js';

// This dossier verifies identifiers only. It cannot promote assets or supply
// numerical financial inputs, market valuations or investability clearance.
export function reviewIdentities(project,dossier) {
 validateSchema(readYaml('spec/identity-review-schema.yaml',project.root),dossier,'identity dossier');
 unique(dossier.sources);unique(dossier.identities);unique(dossier.identities,'asset');
 assert(dossier.review.reviewer.trim()&&dossier.review.rationale.trim(),'Identity review needs a reviewer and rationale');
 assert(Date.parse(dossier.review.reviewed_at)<=Date.now(),'Identity review cannot be in the future');
 assert(dossier.as_of_date<=dossier.review.reviewed_at.slice(0,10),'Identity review precedes dossier as-of');
 const sources=Object.fromEntries(dossier.sources.map(s=>[s.id,s]));
 for(const source of dossier.sources) {
  validateSchema(project.sourceSchema,source,'identity source');
  assert(!source.fixture,'Fixture source in identity dossier');
  assert(source.date<=source.retrieved_at.slice(0,10),'Identity source published after retrieval');
  assert(Date.parse(source.retrieved_at)<=Date.parse(dossier.review.reviewed_at),'Identity source retrieved after review');
 }
 for(const record of dossier.identities) {
  assert(project.assets.assets.some(a=>a.id===record.asset),'Unknown identity asset');
  assert(record.as_of_date<=dossier.as_of_date,'Identity after dossier as-of');
  const evidence=record.source_ids.map(id=>sources[id]);
  assert(evidence.every(Boolean),'Missing identity source');
  assert(evidence.some(s=>s.tier<=2),'Identity requires a tier 1 or 2 primary source');
  assert(evidence.every(s=>s.date<=record.as_of_date),'Identity source published after as-of');
  assert(evidence.every(s=>s.covered_metrics.includes(`${record.asset}.identity`)),'Source does not cover identity');
  const identifier=record.identifier;
  assert(identifier.symbol===record.asset,'Identity symbol mismatch');
  if(identifier.kind==='erc20') assert(identifier.network?.trim()&&/^0x[0-9a-fA-F]{40}$/.test(identifier.contract_address),'ERC-20 requires network and contract address');
  if(identifier.kind==='native_asset') assert(identifier.network?.trim()&&identifier.contract_address===null,'Native identity needs network; do not invent an ERC-20 address');
  if(identifier.kind==='common_stock') assert(identifier.exchange?.trim()&&/^\d{10}$/.test(identifier.cik)&&identifier.network===null&&identifier.contract_address===null,'Common stock requires exchange and ten-digit CIK; tokenized representations need separate review');
  else assert(identifier.exchange===null&&identifier.cik===null,'Token identity is not a verified equity listing');
 }
 return {id:dossier.id,as_of_date:dossier.as_of_date,persisted:false,promoted:false,
  identities:dossier.identities.map(record=>({...record,sources:record.source_ids.map(id=>sources[id])})),review:dossier.review};
}
