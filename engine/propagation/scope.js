import {assert,unique} from '../validation/index.js';

export function affectedNodes(graph,initial) {
 const nodes=new Set(initial);let changed=true;
 while(changed) {changed=false;for(const edge of graph.edges) if(nodes.has(edge.from)&&!nodes.has(edge.to)) {nodes.add(edge.to);changed=true;}}
 return [...nodes];
}

// Validate registry/event schemas first. Saved events use their own snapshot
// registries so a later dependency graph cannot rewrite historical reachability.
export function checkEventScope(p,event,options={}) {
 unique(p.assets.assets);unique(p.graph.edges);
 const registered=new Set(p.assets.assets.map(a=>a.id));
 assert(event.affected_nodes.every(id=>registered.has(id)),'Unknown affected node');
 assert(p.graph.edges.every(e=>registered.has(e.from)&&registered.has(e.to)),'Invalid event scope graph endpoint');
 const nodes=affectedNodes(p.graph,event.affected_nodes);
 assert(event.updates.every(update=>nodes.includes(update.asset)),'Event update asset is outside affected nodes');
 if(Object.hasOwn(options,'propagatedNodes')) {
  const saved=options.propagatedNodes;
  assert(Array.isArray(saved)&&saved.length===nodes.length&&new Set(saved).size===nodes.length&&nodes.every(id=>saved.includes(id)),
   'Saved event propagated nodes do not match affected nodes');
 }
 return nodes;
}
