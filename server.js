import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadProject,calculate,lineage,ROOT} from './engine/index.js';
import {matrix} from './engine/sensitivity/index.js';
import {readSnapshots,compareSnapshots,assertVersionHistory} from './engine/snapshots.js';
const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
export function createServer(root=ROOT) {
 return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
  try {
   const url=new URL(req.url,'http://localhost');
   if(req.method==='GET'&&files[url.pathname]) {const file=path.join(root,'dashboard',files[url.pathname]);res.writeHead(200,{'Content-Type':mime[path.extname(file)]});res.end(fs.readFileSync(file));return;}
   if(!['/api/state','/api/sensitivity','/api/lineage','/api/snapshots'].includes(url.pathname)) return json(404,{error:'Not found'});
   if(req.method!=='GET'&&!(req.method==='POST'&&url.pathname==='/api/sensitivity')) return json(405,{error:'Method not allowed'});
   const p=loadProject(url.searchParams.get('mode')||'fixture',root),history=readSnapshots(root,p.mode);
   assertVersionHistory(history.at(-1),p);
   const options={history,previousThesis:history.at(-1)?.thesis||{}};
   if(url.pathname==='/api/snapshots') return json(200,{snapshots:history.map(s=>({id:s.id,reason:s.reason,period:s.period,created_at:s.created_at})),comparison:history.length?compareSnapshots(history.at(-2),history.at(-1)):{available:false,changes:[]}});
   let overrides={};
   if(req.method==='POST') {
    let body='';for await(const chunk of req) {body+=chunk;if(body.length>16384) throw new Error('Request too large');}
    const data=JSON.parse(body||'{}');overrides=data.overrides;
    if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)) throw new Error('overrides must be an object');
    for(const value of Object.values(overrides)) if(typeof value!=='number'||!Number.isFinite(value)) throw new Error('Sensitivity values must be finite numbers');
   }
   const result=calculate(p,{...options,overrides});
   if(url.pathname==='/api/lineage') return json(200,lineage(p,result,url.searchParams.get('metric')));
   const inspection=Object.fromEntries(Object.keys(result.metrics).map(id=>[id,lineage(p,result,id)]));
   const comparison=history.length?compareSnapshots(history.at(-2),history.at(-1)):{available:false,changes:[]};
   const historicalLineage=(snapshot,id)=>lineage({...p,inputs:snapshot.inputs,sources:snapshot.sources,registry:{formulas:snapshot.formulas}},snapshot,id);
   const comparisonLineage=Object.fromEntries(comparison.changes.map(c=>[c.metric_id,{previous:history.at(-2)?.metrics[c.metric_id]?historicalLineage(history.at(-2),c.metric_id):null,current:historicalLineage(history.at(-1),c.metric_id)}]));
   const thesis=structuredClone(result.thesis);
   for(const asset of Object.values(thesis))for(const rule of asset.rule_evaluations)for(const evidence of rule.evidence)for(const condition of evidence.conditions){
    const historical=history.filter(s=>s.period.end===evidence.period.end&&s.period.basis===evidence.period.basis).at(-1);
    condition.lineage=evidence.period.end===result.period.end?inspection[condition.metric]:historical?historicalLineage(historical,condition.metric):null;
   }
   json(200,{...result,thesis,dictionary:p.dictionary.metrics,assets:p.assets.assets,graph:p.graph,parameters:p.sensitivity.parameters,sensitivity:matrix(p,overrides,options),lineage:inspection,snapshot_count:history.length,comparison,comparison_lineage:comparisonLineage});
  } catch(e) {json(400,{error:e.message,details:e.details||[]});}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const port=Number(process.env.PORT||4310);createServer().listen(port,'127.0.0.1',()=>console.log(`Living Underwriting Engine: http://127.0.0.1:${port} (local only)`));
}
