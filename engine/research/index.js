import path from 'node:path';
import {readYaml} from '../index.js';
import {assert,validateSchema} from '../validation/index.js';
import {prepareEvent} from '../propagation/index.js';
import {readSnapshots,assertVersionHistory,fingerprint,compareSnapshots,writeExclusive} from '../snapshots.js';

export function prepareResearchRefresh(project,proposal) {
 assert(project.mode==='production','Research refresh requires production mode');
 const schema=readYaml('spec/research-refresh-schema.yaml',project.root);
 schema.properties.sources.items=project.sourceSchema;
 schema.properties.observations.items=project.schema;
 schema.properties.review=project.eventSchema.properties.research_review;
 validateSchema(schema,proposal,'research refresh');
 const history=readSnapshots(project.root,project.mode);
 assertVersionHistory(history.at(-1),project);
 // Include every material model input in the digest so a stale preview cannot apply.
 const digest=fingerprint({proposal,parent_id:history.at(-1)?.id||null,
  inputs:project.inputs,sources:project.sources,formulas:project.registry,
  dictionary:project.dictionary,graph:project.graph,assets:project.assets,
  thesis:project.thesis,sensitivity:project.sensitivity});
 const event={id:proposal.id,type:'research_refresh',status:'completed',
  as_of_date:proposal.as_of_date,effective_date:proposal.as_of_date,
  source_ids:[...new Set(proposal.observations.flatMap(m=>m.source_ids||[]))],
  affected_nodes:proposal.affected_nodes,reason:proposal.reason,fixture:false,
  updates:proposal.observations,sources:proposal.sources,
  research_review:proposal.review,research_digest:digest};
 const prepared=prepareEvent(project,event,history);
 const comparison=compareSnapshots(history.at(-1),prepared.snapshot);
 const preview={mode:'production',persisted:false,review_digest:digest,
  parent_id:history.at(-1)?.id||null,review:proposal.review,
  added_source_ids:proposal.sources.map(s=>s.id),observation_ids:proposal.observations.map(m=>m.id),
  affected_nodes:prepared.affected_nodes,comparison,issues:prepared.result.issues,
  metrics:prepared.result.metrics,thesis:prepared.result.thesis,market_valuation:prepared.snapshot.market_valuation};
 return {...prepared,event,preview};
}

export function applyResearchRefresh(project,proposal,expectedDigest) {
 assert(/^[a-f0-9]{64}$/.test(expectedDigest||''),'Apply requires the review digest from research-preview');
 const prepared=prepareResearchRefresh(project,proposal);
 assert(prepared.preview.review_digest===expectedDigest,'Stale research preview; review a new preview before applying');
 // The existing exclusive event journal retains sources and observations together
 // with the reviewed payload, full recomputation, evidence and immutable snapshot.
 writeExclusive(path.join(project.root,'data/events/production',`${prepared.event.id}.json`),
  {event:prepared.event,snapshot:prepared.snapshot});
 return prepared;
}
