const $=id=>document.getElementById(id);
let state,mode='fixture',overrides={},refreshRevision=0,researchRevision=0,freshnessRevision=0;
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
 const revision=++refreshRevision,requestMode=mode;
 $('error').hidden=true;$('scenario-status').textContent='Calculating…';for(const b of document.querySelectorAll('.actions button'))b.disabled=true;
 try {const changed=Object.keys(nextOverrides).length>0;const response=await fetch(`/api/${changed?'sensitivity':'state'}?mode=${requestMode}`,changed?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({overrides:nextOverrides})}:{});const data=await response.json();if(revision!==refreshRevision)return;if(!response.ok)throw new Error(data.error);state=data;overrides=nextOverrides;render(resetInputs);$('scenario-status').textContent=changed?'Scenario recalculated · not saved':'Canonical inputs loaded';}catch(error){if(revision!==refreshRevision)return;$('error').hidden=false;$('error').textContent=error.message;$('scenario-status').textContent='Calculation failed';}finally{if(revision===refreshRevision)for(const b of document.querySelectorAll('.actions button'))b.disabled=false;}
}

function renderResearch(data) {
 $('research-status').textContent=data.notice;
 $('research-records').replaceChildren(...data.records.map(report=>{
  const card=el('details',undefined,'research-card');card.dataset.research=report.id;
  card.append(el('summary',report.label),el('p',`Knowledge as-of ${report.as_of_date} · ${report.review.reviewer} · Reviewed ${report.review.reviewed_at}`,'hint'));
  if(report.statement)card.append(el('p',`${report.statement.entity_name} · ${report.statement.scope} · ${report.statement.accounting_basis} · ${report.statement.audit_status}`,'hint'),el('p',report.statement.limitations,'hint'));
  if(report.comparability) {
   card.append(el('span',`${report.comparability.classification} · ${report.comparability.confidence}`,'badge ASSUMPTION'),el('p',report.comparability.rationale,'hint'));
   const checks=el('div',undefined,'research-checks');
   for(const [name,check] of Object.entries(report.comparability.checks))checks.append(el('p',`${name}: ${check.value===null?'Unconfirmed':check.value?'Confirmed judgment':'Not confirmed'} · ${check.rationale}`));
   card.append(checks);
  }
  const wrap=el('div',undefined,'research-table-wrap'),table=el('table'),head=el('tr');
  for(const label of ['Metric / asset','Value / identifier','Unit / type','Period','As-of','Classification','Confidence','Status']) {const th=el('th',label);th.scope='col';head.append(th);}table.append(head);
  for(const record of report.records) {
   const row=el('tr'),period=record.period||report.periods.find(p=>p.id===record.period_id);
   const value=record.identifier?JSON.stringify(record.identifier):record.value===null?'Unknown':new Intl.NumberFormat('en',{maximumFractionDigits:6}).format(record.value);
   for(const text of [record.metric_id||record.asset,value,record.unit||record.identifier?.kind||'—',period?`${period.basis} · ${period.start} → ${period.end}`:'Identifier',record.as_of_date,record.classification,record.confidence,record.status||record.investability?.status||'—'])row.append(el('td',text));
   table.append(row);
  }
  wrap.append(table);card.append(wrap);
  const sources=el('div',undefined,'research-sources');sources.append(el('h3','Sources and versions'));
  for(const source of report.sources) {
   const p=el('p',`${source.title} · ${source.publisher} · Tier ${source.tier} · v${source.version} · Published ${source.date} · Retrieved ${source.retrieved_at} `);
   const url=new URL(source.url);
   if(['https:','http:'].includes(url.protocol)) {const link=el('a','Open source ↗');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';p.append(link);}
   sources.append(p);
  }
  const full=el('details');full.append(el('summary','Full evidence, formulas and dependencies'),el('p',`Recorded fingerprint: ${report.artifact_id}`,'hint'),el('pre',JSON.stringify(report.full_review,null,2)));
  card.append(sources,full);return card;
 }));
}

async function refreshResearch() {
 const revision=++researchRevision,requestMode=mode;
 $('research-records').replaceChildren();$('research-status').textContent='Loading research evidence…';
 try {
  const response=await fetch(`/api/research?mode=${requestMode}`),data=await response.json();
  if(revision!==researchRevision)return;
  if(!response.ok)throw new Error(data.error);
  renderResearch(data);
 } catch(error) {if(revision===researchRevision)$('research-status').textContent=`Research unavailable: ${error.message}`;}
}
function freshnessTable(labels,rows) {
 const wrap=el('div',undefined,'freshness-table-wrap'),table=el('table'),head=el('tr');
 for(const label of labels){const th=el('th',label);th.scope='col';head.append(th);}table.append(head);
 for(const values of rows){const row=el('tr');for(const value of values)row.append(el('td',String(value??'Unknown')));table.append(row);}
 wrap.append(table);return wrap;
}
function freshnessSummary(summary) {
 const wrap=el('div',undefined,'freshness-summary');
 for(const [group,counts] of Object.entries(summary))for(const [status,count] of Object.entries(counts))wrap.append(el('span',`${group} · ${status}: ${count}`));
 return wrap;
}
function freshnessSources(rows) {
 const details=el('details',undefined,'freshness-card');details.append(el('summary','Source publication / retrieval dates and versions'));
 details.append(freshnessTable(['Source / version','Published','Publication age / days','Retrieved','Retrieval age / days','Retrieval state','Evidence use'],rows.map(row=>[
  `${row.source.id} · v${row.source.version} · ${row.source.publisher} · Tier ${row.source.tier}`,row.source.date,row.publication_age_days,row.source.retrieved_at,row.retrieval_age_days,row.retrieval_state,row.active?'Active evidence':'Retained source'
 ])));
 return details;
}
function renderFreshness(data) {
 const container=$('freshness-report'),policy=el('article',undefined,'freshness-card');
 $('freshness-status').textContent=`${data.fixture?'Fixture / 合成資料':'Production'} · UTC 截止日 ${data.as_of_date} · 手動查詢完成`;
 policy.append(el('h3',`Review policy · ${data.policy.id} / v${data.policy.version}`),el('span',data.policy.classification,'badge ASSUMPTION'),el('p',data.policy.rationale,'hint'),el('p',`Observation window ${data.policy.observation_max_age_days} days · retrieval window ${data.policy.retrieval_max_age_days} days · metric overrides are retained in the full report.`,'hint'),el('p',data.interpretation,'hint'));
 if(data.fixture)policy.append(el('p','SYNTHETIC FIXTURE · 全部時效結果只供合成資料示範。','fixture-label'));
 const canonical=el('details',undefined,'freshness-card');canonical.append(el('summary',`Canonical input dates (${data.inputs.length})`),freshnessSummary(data.summary),freshnessTable(['Metric / record','Observation as-of','Age / days','Window / days','Observation state','Evidence state','Provenance'],data.inputs.map(row=>[
  `${row.metric_id} · ${row.record_id??'Unknown'} · ${row.classification??'Unknown'}`,row.observation_as_of,row.observation_age_days,row.observation_max_age_days,row.observation_state,row.evidence_state,row.fixture?'SYNTHETIC FIXTURE':'Production'
 ])));
 container.replaceChildren(policy,canonical,freshnessSources(data.source_checks));
 if(data.research) {
  const research=el('article',undefined,'freshness-card');research.append(el('h3',`Cataloged research · ${data.research.artifacts.length} reviews / ${data.research.records.length} records`),el('p',data.research.interpretation,'hint'),freshnessSummary(data.research.summary));
  const reviews=el('details');reviews.append(el('summary','Review availability at cutoff'),freshnessTable(['Catalog / artifact','Knowledge as-of','Reviewed at','Review age / days','Review state'],data.research.artifacts.map(row=>[`${row.id} · ${row.artifact_id}`,row.as_of_date,row.review.reviewed_at,row.review_age_days,row.review_state])));
  const records=el('details');records.append(el('summary','Original research observation dates and unknown values'),freshnessTable(['Metric / record','Classification / value','Period','Observation as-of','Age / days','Window / days','Observation state','Review state','Evidence state'],data.research.records.map(row=>[
   `${row.metric_id} · ${row.record_id}`,`${row.record.classification} · ${row.record.value===null?'Unknown':row.record.value??'Identifier'}`,row.period?`${row.period.basis} · ${row.period.start} → ${row.period.end}`:'Identifier',row.record.as_of_date,row.observation_age_days,row.observation_max_age_days,row.observation_state,row.review_state,row.evidence_state
  ])));
  research.append(reviews,records,freshnessSources(data.research.source_checks));container.append(research);
 }
 const full=el('details',undefined,'freshness-card');full.append(el('summary','Full report, policy and formula dependencies'),el('pre',JSON.stringify(data,null,2)));container.append(full);
}
function clearFreshness(message) {
 ++freshnessRevision;$('freshness-report').replaceChildren();$('freshness-report').setAttribute('aria-busy','false');
 $('freshness-error').hidden=true;$('check-freshness').disabled=false;$('freshness-status').textContent=message;
}
async function refreshFreshness() {
 const revision=++freshnessRevision,requestMode=mode,query=new URLSearchParams({mode:requestMode});
 if($('freshness-date').value)query.set('as_of',$('freshness-date').value);
 $('freshness-report').replaceChildren();$('freshness-report').setAttribute('aria-busy','true');$('freshness-error').hidden=true;
 $('freshness-status').textContent='正在查詢時效…';$('check-freshness').disabled=true;
 try {
  const response=await fetch(`/api/freshness?${query}`),data=await response.json();
  if(revision!==freshnessRevision)return;
  if(!response.ok)throw new Error(data.error);
  renderFreshness(data);
 }catch(error){if(revision===freshnessRevision){$('freshness-error').hidden=false;$('freshness-error').textContent=`時效查詢失敗：${error.message}`;$('freshness-status').textContent='時效結果未取得，請檢查日期後重新查詢。';}}
 finally{if(revision===freshnessRevision){$('check-freshness').disabled=false;$('freshness-report').setAttribute('aria-busy','false');}}
}
$('freshness-form').onsubmit=event=>{event.preventDefault();refreshFreshness();};
$('freshness-date').oninput=()=>clearFreshness('日期已變更，請手動重新查詢時效。');
$('scenario-form').onsubmit=event=>{event.preventDefault();const next={};for(const input of $('parameters').querySelectorAll('input'))if(input.value!==''&&Number(input.value)!==state.lineage[input.name].metric.value)next[input.name]=Number(input.value);refresh({...overrides,...next});};
$('reset').onclick=()=>refresh({},true);
$('mode').onchange=event=>{mode=event.target.value;clearFreshness('Workspace 已變更，請手動重新查詢時效。');refresh({},true);refreshResearch();};
refresh({},true);refreshResearch();
