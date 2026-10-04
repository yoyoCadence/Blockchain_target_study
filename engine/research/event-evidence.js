import {assert,unique,validateSchema,checkEventEvidence,checkEventReview,checkResearchEvidence} from '../validation/index.js';
import {readSnapshots,assertVersionHistory} from '../snapshots.js';
import {checkEventScope} from '../propagation/scope.js';

// A loaded project has already checked journal/snapshot agreement and source
// metadata. Inspect saved versions only; never prepare/apply or fetch evidence.
export function inspectReviewedEvents(project) {
 assert(['fixture','production'].includes(project.mode),'Invalid event inspection mode');
 if(project.mode==='fixture')return [];
 const history=readSnapshots(project.root,project.mode);
 assertVersionHistory(history.at(-1),project);
 const records=[];
 for(const snapshot of history) {
  if(!snapshot.event?.research_review)continue;
  const {propagated_nodes,...event}=snapshot.event;
  validateSchema(project.eventSchema,event,'reviewed saved event');
  checkEventEvidence(event,snapshot.sources,project.mode);
  checkEventReview(event,snapshot.sources);checkResearchEvidence(event,snapshot.sources);
  checkEventScope({...project,assets:snapshot.assets,graph:snapshot.graph},event,{propagatedNodes:propagated_nodes});
  records.push({id:event.id,snapshot_id:snapshot.id,parent_id:snapshot.parent_id,
   created_at:snapshot.created_at,model_period:snapshot.period,event,
   propagated_nodes,recorded_update_count:event.updates.length,
   sources:event.source_ids.map(id=>snapshot.sources.find(source=>source.id===id))});
 }
 unique(records);
 return structuredClone(records);
}
