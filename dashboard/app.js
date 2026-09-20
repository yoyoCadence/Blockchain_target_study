const $=id=>document.getElementById(id);
let state,mode='fixture',overrides={};
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined) node.textContent=text;if(className) node.className=className;return node;};
function format(value,unit) {if(value===null||value===undefined)return 'Unknown';if(unit==='ratio')return new Intl.NumberFormat('en',{style:'percent',maximumFractionDigits:3}).format(value);return `${unit.startsWith('USD')?'$':''}${new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:2}).format(value)}`;}
const definition=id=>state.dictionary.find(x=>x.id===id);
function metricCard(metric) {
 const button=el('button',undefined,'metric');button.type='button';button.dataset.metric=metric.metric_id;
 button.append(el('span',definition(metric.metric_id)?.label||metric.metric_id,'metric-label'),el('span',format(metric.value,metric.unit),'metric-value'),el('span',metric.unit,'metric-unit'),el('span',metric.classification,`badge ${metric.classification}`));
 if(metric.fixture)button.append(el('span','SYNTHETIC FIXTURE','fixture-label'));
 button.onclick=()=>inspect(metric.metric_id);return button;
}
function renderLineage(tree) {
 const wrap=el('div',undefined,'lineage-node'),m=tree.metric;
 wrap.append(el('h3',`${definition(m.metric_id)?.label||m.metric_id} · ${format(m.value,m.unit)}`));
 const dl=el('dl',undefined,'metadata');
 for(const [label,value] of Object.entries({ID:m.id,Unit:m.unit,Classification:m.classification,'As-of':m.as_of_date,Period:`${m.period.basis} / ${m.period.end}`,Confidence:m.confidence,Version:m.version,Provenance:m.fixture?'SYNTHETIC FIXTURE':'Production','Rationale / scenario':m.rationale||m.scenario||'—',Error:m.error||'—'})){dl.append(el('dt',label),el('dd',String(value)));}
 wrap.append(dl);
 if(tree.formula) {wrap.append(el('p',`${tree.formula.id} / v${tree.formula.version}`),el('p',tree.formula.description),el('pre',JSON.stringify(tree.formula.expression,null,2)));}
 for(const source of tree.sources||[]) {const p=el('p',`${source.title} · ${source.publisher} · Tier ${source.tier} · v${source.version} · Published ${source.date} · Retrieved ${source.retrieved_at} `);if(!source.fixture){const a=el('a','Open source ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);}else p.append(el('span',`[Synthetic evidence only: ${source.url}]`));wrap.append(p);}
 if(tree.base_record)wrap.append(el('p',`Counterfactual based on canonical record ${tree.base_record.id}; original classification ${tree.base_record.classification}.`));
 for(const child of tree.inputs||[]) {const d=el('details');d.open=true;d.append(el('summary',child.metric.metric_id),renderLineage(child));wrap.append(d);}
 return wrap;
}
function inspect(id,tree=state.lineage[id]) {$('inspector-title').textContent=definition(id)?.label||id;$('inspector-body').replaceChildren(renderLineage(tree));$('inspector').showModal();}
$('close-inspector').onclick=()=>$('inspector').close();
function renderGraph() {
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 480');svg.setAttribute('role','img');svg.setAttribute('aria-label','Dependency graph. All initial edges are assumed research hypotheses.');
 const positions={};state.assets.forEach((asset,i)=>{const column=i%4,row=Math.floor(i/4);positions[asset.id]={x:45+column*245,y:40+row*120};});
 for(const edge of state.graph.edges){const a=positions[edge.from],b=positions[edge.to],line=document.createElementNS(ns,'line');for(const [key,value] of Object.entries({x1:a.x+80,y1:a.y+24,x2:b.x+80,y2:b.y+24}))line.setAttribute(key,value);if(edge.economic)line.setAttribute('class','economic');svg.append(line);}
 for(const asset of state.assets){const p=positions[asset.id],group=document.createElementNS(ns,'g'),rect=document.createElementNS(ns,'rect'),label=document.createElementNS(ns,'text');for(const [k,v] of Object.entries({x:p.x,y:p.y,width:160,height:48,rx:3}))rect.setAttribute(k,v);label.setAttribute('x',p.x+15);label.setAttribute('y',p.y+30);label.textContent=asset.id;if(asset.role==='core'){rect.setAttribute('class','core');label.setAttribute('class','core');}group.append(rect,label);svg.append(group);}
 $('network').replaceChildren(svg);
 const table=el('table'),head=el('tr');for(const label of ['From → To','Relationship','Transmission','Evidence status'])head.append(el('th',label));table.append(head);
 for(const e of state.graph.edges){const row=el('tr');for(const text of [`${e.from} → ${e.to}`,e.type,`${e.economic?'Economic':'Dependency'} / ${e.transmission}`,`${e.status} · ${e.source_ids.length?e.source_ids.join(', '):'no verified source'}`])row.append(el('td',text));table.append(row);}$('edge-list').replaceChildren(table);
}
function renderThesis() {
 $('thesis-cards').replaceChildren(...Object.entries(state.thesis).map(([asset,t])=>{const card=el('article',undefined,'thesis-card');card.append(el('h3',asset),el('span',t.state,`state ${t.state}`),el('p',`Evidence coverage: ${t.coverage} · Last state change: ${t.last_changed}`),el('p',t.interpretation));
 for(const r of t.rule_evaluations){const details=el('details',undefined,'rule');details.append(el('summary',`${r.triggered?'TRIGGERED':r.sufficient?'Not triggered':'Insufficient history / data'} · ${r.id}`),el('p',r.why),el('p',r.rationale));for(const e of r.evidence){details.append(el('p',`${e.period.basis}: ${e.period.end}`));for(const c of e.conditions){const b=el('button',`${c.metric}: ${format(c.actual,state.metrics[c.metric].unit)} (${c.operator} ${format(c.value,state.metrics[c.metric].unit)})`,'evidence-link');b.onclick=()=>inspect(c.metric,c.lineage);b.disabled=!c.lineage;details.append(b,el('br'));}}card.append(details);}return card;}));
 $('issues').replaceChildren(...(state.issues.length?state.issues.map(i=>el('p',`${i.severity} · ${i.metric_id}: ${i.message}`)):[el('p','No validation issues.')]));
}
function renderComparison() {
 const c=state.comparison,container=$('comparison');container.replaceChildren(el('p',`${state.snapshot_count} immutable snapshots · persisted canonical history (independent of unsaved sensitivity)`));
 if(!c.available){container.append(el('p','No previous snapshot available. Create a snapshot with a material-update reason using the CLI.'));return;}
 container.append(el('p',c.reason));const flags=el('div',undefined,'comparison-flags');for(const key of ['source_change','assumption_change','scenario_change','formula_change','rule_change'])flags.append(el('span',`${key.replaceAll('_',' ')}: ${c[key]?'Yes':'No'}`));container.append(flags);
 const table=el('table'),head=el('tr');for(const label of ['Metric','Previous ↗','Current ↗'])head.append(el('th',label));table.append(head);
 for(const change of c.changes){const row=el('tr');row.append(el('td',definition(change.metric_id)?.label||change.metric_id));for(const side of ['previous','current']){const td=el('td'),button=el('button',format(change[side],change.unit),'evidence-link'),tree=state.comparison_lineage[change.metric_id][side];button.onclick=()=>inspect(change.metric_id,tree);button.disabled=!tree;td.append(button);row.append(td);}table.append(row);}container.append(table);
}
function render(resetInputs=false) {
 $('notice').replaceChildren(el('strong',state.fixture?'FIXTURE WORKSPACE / 合成測試資料，非即時市場資訊':'PRODUCTION WORKSPACE / 未查證數據保持 Unknown'),el('span',state.fixture?'All numerical examples are synthetic. OBSERVED badges describe fixture record structure, not real-world verification.':'No fabricated values are substituted for missing evidence. Thesis coverage remains insufficient until supported.'),el('span',` · Accounting period: ${state.period.end}${Object.keys(overrides).length?' · Unsaved sensitivity scenario active':''}`));
 $('market-cards').replaceChildren(...state.dictionary.filter(d=>d.asset==='MARKET').map(d=>metricCard(state.metrics[d.id])));
 $('asset-models').replaceChildren(...state.assets.filter(a=>a.role==='core').map(asset=>{const box=el('article',undefined,'model'),head=el('div',undefined,'model-head'),title=el('div');title.append(el('span',asset.id,'asset-title'),el('span',asset.name,'asset-name'));head.append(title,el('span','ADOPTION → UNIT ECONOMICS → HOLDER CAPTURE','hint'));box.append(head);const metrics=state.dictionary.filter(d=>d.asset===asset.id),primary=metrics.filter(d=>d.kind==='derived'),inputs=metrics.filter(d=>d.kind==='input');const grid=el('div',undefined,'model-metrics');grid.append(...primary.map(d=>metricCard(state.metrics[d.id])));const details=el('details'),inputGrid=el('div',undefined,'model-metrics');details.append(el('summary',`Canonical inputs & market valuation (${inputs.length})`));inputGrid.append(...inputs.map(d=>metricCard(state.metrics[d.id])));details.append(inputGrid);box.append(grid,details);return box;}));
 if(resetInputs)$('parameters').replaceChildren(...state.parameters.map(id=>{const d=definition(id),m=state.metrics[id],label=el('label',undefined,'parameter');label.append(el('span',`${d.label} (${m.unit})`));const input=el('input');input.type='number';input.step='any';input.name=id;input.value=m.value??'';input.placeholder='Unknown';if(d.minimum!==null)input.min=d.minimum;if(d.maximum!==null)input.max=d.maximum;label.append(input);return label;}));
 const matrix=state.sensitivity,table=el('table'),head=el('tr');head.append(el('th',`${definition(matrix.row).label} ↓ / ${definition(matrix.column).label} →`));for(const value of matrix.columns)head.append(el('th',format(value,state.metrics[matrix.column].unit)));table.append(head);matrix.rows.forEach((value,i)=>{const row=el('tr');row.append(el('th',format(value,state.metrics[matrix.row].unit)));matrix.cells[i].forEach(cell=>{const td=el('td',undefined,cell.value>1?'infeasible':'feasible'),button=el('button',format(cell.value,state.metrics[matrix.output].unit),'evidence-link');button.onclick=()=>inspect(matrix.output,cell.lineage);td.append(button);td.title=cell.issues.map(x=>x.message).join('; ');row.append(td);});table.append(row);});$('matrix').replaceChildren(table);$('matrix-caption').textContent='Counterfactual matrix · click a cell to inspect its own scenario lineage. Other parameters follow current inputs.';
 renderGraph();renderThesis();renderComparison();
}
async function refresh(nextOverrides={},resetInputs=false) {
 $('error').hidden=true;$('scenario-status').textContent='Calculating…';for(const b of document.querySelectorAll('.actions button'))b.disabled=true;
 try {const changed=Object.keys(nextOverrides).length>0;const response=await fetch(`/api/${changed?'sensitivity':'state'}?mode=${mode}`,changed?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({overrides:nextOverrides})}:{});const data=await response.json();if(!response.ok)throw new Error(data.error);state=data;overrides=nextOverrides;render(resetInputs);$('scenario-status').textContent=changed?'Scenario recalculated · not saved':'Canonical inputs loaded';}catch(error){$('error').hidden=false;$('error').textContent=error.message;$('scenario-status').textContent='Calculation failed';}finally{for(const b of document.querySelectorAll('.actions button'))b.disabled=false;}
}
$('scenario-form').onsubmit=event=>{event.preventDefault();const next={};for(const input of $('parameters').querySelectorAll('input'))if(input.value!==''&&Number(input.value)!==state.lineage[input.name].metric.value)next[input.name]=Number(input.value);refresh({...overrides,...next});};
$('reset').onclick=()=>refresh({},true);
$('mode').onchange=event=>{mode=event.target.value;refresh({},true);};
refresh({},true);
