import path from 'node:path';
import {assert,validateSchema,checkEventEvidence,checkEventReview} from '../validation/index.js';
import {calculate,validateProject,selectInputs} from '../index.js';
import {makeSnapshot,writeExclusive,readSnapshots,assertVersionHistory} from '../snapshots.js';
export function affectedNodes(graph,initial) {
 const nodes=new Set(initial);let changed=true;
 while(changed) {changed=false;for(const edge of graph.edges) if(nodes.has(edge.from)&&!nodes.has(edge.to)) {nodes.add(edge.to);changed=true;}}
 return [...nodes];
}
export function prepareEvent(p,event,history=[]) {
 validateSchema(p.eventSchema,event,'event');
 assert(/^[a-zA-Z0-9_-]+$/.test(event.id),'Event ID must be a safe filename');
 const withSources={...p,sources:[...p.sources,...(event.sources||[])]};
 // Validate every new source before using it as evidence or writing a journal.
 validateProject(withSources);
 assert(event.affected_nodes.every(id=>p.assets.assets.some(a=>a.id===id)),'Unknown affected node');
 checkEventEvidence(event,withSources.sources,p.mode);
 checkEventReview(event,withSources.sources);
 if(event.type==='research_refresh') {
  assert(event.updates.length>0&&event.updates.every(m=>m.classification==='OBSERVED'),'Research refresh only accepts observations');
  for(const update of event.updates) {
   const sources=update.source_ids.map(id=>withSources.sources.find(s=>s.id===id));
   assert(sources.every(Boolean),'Missing research source');
   assert(sources.some(s=>s.tier<=2),'Research observation requires a tier 1 or 2 primary source');
   assert(sources.every(s=>event.source_ids.includes(s.id)),'Research evidence must be declared in event sources');
   assert(sources.every(s=>s.date<=update.as_of_date),'Research source published after observation as-of date');
  }
 }
 const old=selectInputs(p.inputs),nodes=affectedNodes(p.graph,event.affected_nodes);
 for(const update of event.updates) {
  assert(nodes.includes(update.asset),'Event update asset is outside affected nodes');
  assert(update.as_of_date<=event.as_of_date,'Update after event as-of date');
  if(old[update.metric_id]) assert(update.supersedes===old[update.metric_id].id,'Updates must explicitly supersede current input');
  if(['xlm.dtcc_live','xlm.dtcc_material'].includes(update.metric_id)&&update.value===1) assert(['live','completed'].includes(event.status),'Planned DTCC cannot become live/material');
 }
 const next={...withSources,inputs:[...p.inputs,...event.updates]};validateProject(next);
 const result=calculate(next,{history,previousThesis:history.at(-1)?.thesis||{}});
 const snapshot=makeSnapshot(next,result,{previous:history.at(-1),reason:event.reason,event:{...event,propagated_nodes:nodes}});
 return {project:next,result,snapshot,affected_nodes:nodes};
}
export function applyEvent(p,event) {
 assert(event.type!=='research_refresh','Use research-apply with a reviewed preview digest');
 const history=readSnapshots(p.root,p.mode);assertVersionHistory(history.at(-1),p);
 const prepared=prepareEvent(p,event,history);
 // One journal record is the commit: event + new observations + derived snapshot + reason.
 writeExclusive(path.join(p.root,'data/events',p.mode,`${event.id}.json`),{event,snapshot:prepared.snapshot});
 return prepared;
}
