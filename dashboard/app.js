import {term,metricLabel,periodLabel} from './zh-hant.js';
const $=id=>document.getElementById(id);
const requestedModes=new URLSearchParams(location.search).getAll('mode');
const validRoute=requestedModes.length<=1&&requestedModes.every(value=>['fixture','production'].includes(value));
let state,mode=validRoute?(requestedModes[0]||'fixture'):null,overrides={},refreshRevision=0,researchRevision=0,freshnessRevision=0;
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined) node.textContent=text;if(className) node.className=className;return node;};
function format(value,unit,metricId) {if(value===null||value===undefined)return '未知';if(unit==='USD'&&metricId?.endsWith('.price'))return `$${new Intl.NumberFormat('zh-TW',{maximumFractionDigits:8}).format(value)}`;if(unit==='ratio')return new Intl.NumberFormat('zh-TW',{style:'percent',maximumFractionDigits:3}).format(value);return `${unit.startsWith('USD')?'$':''}${new Intl.NumberFormat('zh-TW',{notation:'compact',maximumFractionDigits:2}).format(value)}`;}
const definition=id=>{const record=state.dictionary.find(x=>x.id===id);return record?{...record,label:metricLabel(id)}:undefined;};
function metricCard(metric) {
 const button=el('button',undefined,'metric');button.type='button';button.dataset.metric=metric.metric_id;
 button.append(el('span',definition(metric.metric_id)?.label||metric.metric_id,'metric-label'),el('span',format(metric.value,metric.unit,metric.metric_id),'metric-value'),el('span',term(metric.unit),'metric-unit'),el('span',term(metric.classification),`badge ${metric.classification}`));
 if(metric.fixture)button.append(el('span','合成示範資料（Fixture）','fixture-label'));
 if(metric.valuation_date)button.append(el('span',`按報價折算的模型 · ${metric.valuation_date}`,'fixture-label'));
 button.onclick=()=>inspect(metric.metric_id);return button;
}
function renderLineage(tree) {
 const wrap=el('div',undefined,'lineage-node'),m=tree.metric;
 wrap.append(el('h3',`${definition(m.metric_id)?.label||m.metric_id} · ${format(m.value,m.unit,m.metric_id)}`));
 const dl=el('dl',undefined,'metadata');
 for(const [label,value] of Object.entries({'紀錄 ID':m.id,'單位':term(m.unit),'分類':term(m.classification),'知識日':m.as_of_date,'期間':`${term(m.period.basis)} / ${m.period.end}`,'可信程度':term(m.confidence),'版本':m.version,'來源性質':m.fixture?'合成示範資料（Fixture）':'正式研究資料','理由／情境（原文）':m.rationale||m.scenario||'—','錯誤（原始訊息）':m.error||'—'})){dl.append(el('dt',label),el('dd',String(value)));}
 wrap.append(dl);
 if(m.valuation_date)wrap.append(el('p',`折算參考日：${m.valuation_date}。此為按報價折算的模型，原始年率與價格日期保留於血緣；不代表實際年度支出或收入。`));
 if(tree.formula) {wrap.append(el('p',`${tree.formula.id} / v${tree.formula.version}`),el('p',`公式說明（原文）：${tree.formula.description}`),el('pre',JSON.stringify(tree.formula.expression,null,2)));}
 for(const source of tree.sources||[]) {const p=el('p',`${source.title} · ${source.publisher} · 來源層級 ${source.tier} · v${source.version} · 發布 ${source.date} · 取得 ${source.retrieved_at} `);if(!source.fixture){const a=el('a','開啟來源 ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);}else p.append(el('span',`[僅為合成示範證據：${source.url}]`));wrap.append(p);}
 if(tree.base_record)wrap.append(el('p',`此反事實情境以基準紀錄 ${tree.base_record.id} 為依據；原始分類為 ${term(tree.base_record.classification)}。`));
 for(const child of tree.inputs||[]) {const d=el('details');d.open=true;d.append(el('summary',`${metricLabel(child.metric.metric_id)}（${child.metric.metric_id}）`),renderLineage(child));wrap.append(d);}
 return wrap;
}
function inspect(id,tree=state.lineage[id]) {$('inspector-title').textContent=definition(id)?.label||id;$('inspector-body').replaceChildren(renderLineage(tree));$('inspector').showModal();}
$('close-inspector').onclick=()=>$('inspector').close();
function renderGraph() {
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 480');svg.setAttribute('role','img');svg.setAttribute('aria-label','依賴關係圖。所有初始關係均為待查證的研究假設。');
 const positions={};state.assets.forEach((asset,i)=>{const column=i%4,row=Math.floor(i/4);positions[asset.id]={x:45+column*245,y:40+row*120};});
 for(const edge of state.graph.edges){const a=positions[edge.from],b=positions[edge.to],line=document.createElementNS(ns,'line');for(const [key,value] of Object.entries({x1:a.x+80,y1:a.y+24,x2:b.x+80,y2:b.y+24}))line.setAttribute(key,value);if(edge.economic)line.setAttribute('class','economic');svg.append(line);}
 for(const asset of state.assets){const p=positions[asset.id],group=document.createElementNS(ns,'g'),rect=document.createElementNS(ns,'rect'),label=document.createElementNS(ns,'text');for(const [k,v] of Object.entries({x:p.x,y:p.y,width:160,height:48,rx:3}))rect.setAttribute(k,v);label.setAttribute('x',p.x+15);label.setAttribute('y',p.y+30);label.textContent=asset.id;if(asset.role==='core'){rect.setAttribute('class','core');label.setAttribute('class','core');}group.append(rect,label);svg.append(group);}
 $('network').replaceChildren(svg);
 const table=el('table'),head=el('tr');for(const label of ['來源 → 對象','關係','傳導方式','證據狀態'])head.append(el('th',label));table.append(head);
 for(const e of state.graph.edges){const row=el('tr');for(const text of [`${e.from} → ${e.to}`,term(e.type),`${e.economic?'經濟傳導':'一般依賴'} / ${term(e.transmission)}`,`${term(e.status)} · ${e.source_ids.length?e.source_ids.join(', '):'尚無已查證來源'}`])row.append(el('td',text));table.append(row);}$('edge-list').replaceChildren(table);
}
function renderThesis() {
 $('thesis-cards').replaceChildren(...Object.entries(state.thesis).map(([asset,t])=>{const card=el('article',undefined,'thesis-card');card.append(el('h3',asset),el('span',term(t.state),`state ${t.state}`),el('p',`證據覆蓋：${term(t.coverage)} · 最近狀態變更：${t.last_changed}`),el('p',term(t.interpretation)));
 for(const r of t.rule_evaluations){const details=el('details',undefined,'rule');details.append(el('summary',`${r.triggered?'已觸發':r.sufficient?'未觸發':'歷史／資料不足'} · ${r.id}`),el('p',`規則原文：${r.why}`),el('p',`分析者假設／理由原文：${r.rationale}`));for(const e of r.evidence){details.append(el('p',`${term(e.period.basis)}：${e.period.end}`));for(const c of e.conditions){const b=el('button',`${metricLabel(c.metric)}：${format(c.actual,state.metrics[c.metric].unit)} (${term(c.operator)} ${format(c.value,state.metrics[c.metric].unit)})`,'evidence-link');b.onclick=()=>inspect(c.metric,c.lineage);b.disabled=!c.lineage;details.append(b,el('br'));}}card.append(details);}return card;}));
 $('issues').replaceChildren(...(state.issues.length?state.issues.map(i=>el('p',`${term(i.severity)} · ${metricLabel(i.metric_id)}：${i.message}`)):[el('p','沒有驗證問題。')]));
}
function renderComparison() {
 const c=state.comparison,container=$('comparison');container.replaceChildren(el('p',`${state.snapshot_count} 份不可變快照・已儲存的基準歷史（與未儲存情境分開）`));
 if(!c.available){container.append(el('p','尚無前一快照；請以命令列附上實質更新理由保存快照。'));return;}
 container.append(el('p',`更新原因（原文）：${c.reason}`));const flags=el('div',undefined,'comparison-flags');for(const key of ['source_change','assumption_change','scenario_change','formula_change','rule_change'])flags.append(el('span',`${term(key)}：${c[key]?'是':'否'}`));container.append(flags);
 const table=el('table'),head=el('tr');for(const label of ['指標','前一版本 ↗','目前版本 ↗'])head.append(el('th',label));table.append(head);
 for(const change of c.changes){const row=el('tr');row.append(el('td',definition(change.metric_id)?.label||change.metric_id));for(const side of ['previous','current']){const td=el('td'),button=el('button',format(change[side],change.unit,change.metric_id),'evidence-link'),tree=state.comparison_lineage[change.metric_id][side];button.onclick=()=>inspect(change.metric_id,tree);button.disabled=!tree;td.append(button);row.append(td);}table.append(row);}container.append(table);
}
function render(resetInputs=false) {
 $('notice').replaceChildren(el('strong',state.fixture?'合成示範工作區／非即時市場資訊':'正式研究工作區／未查證數據保持未知'),el('span',state.fixture?'全部數字範例均為合成資料；已觀測（OBSERVED）標籤只描述示範紀錄結構，不代表真實查證。':'缺失證據不以虛構數值補齊；取得足夠證據前，投資論點仍標示證據不足。'),el('span',` · 模型期間：${state.period.end}${Object.keys(overrides).length?' · 目前為未儲存的敏感度情境':''}`));
 $('market-cards').replaceChildren(...state.dictionary.filter(d=>d.asset==='MARKET').map(d=>metricCard(state.metrics[d.id])));
 $('asset-models').replaceChildren(...state.assets.filter(a=>a.role==='core').map(asset=>{const box=el('article',undefined,'model'),head=el('div',undefined,'model-head'),title=el('div');title.append(el('span',asset.id,'asset-title'),el('span',asset.name,'asset-name'));head.append(title,el('span','採用 → 單位經濟 → 持有人價值','hint'));box.append(head);const metrics=state.dictionary.filter(d=>d.asset===asset.id),primary=metrics.filter(d=>d.kind==='derived'),inputs=metrics.filter(d=>d.kind==='input');const grid=el('div',undefined,'model-metrics');grid.append(...primary.map(d=>metricCard(state.metrics[d.id])));const details=el('details'),inputGrid=el('div',undefined,'model-metrics');details.append(el('summary',`基準輸入與市場估值（${inputs.length} 項）`));inputGrid.append(...inputs.map(d=>metricCard(state.metrics[d.id])));details.append(inputGrid);box.append(grid,details);return box;}));
 if(resetInputs)$('parameters').replaceChildren(...state.parameters.map(id=>{const d=definition(id),m=state.metrics[id],label=el('label',undefined,'parameter');label.append(el('span',`${d.label}（${term(m.unit)}）`));const input=el('input');input.type='number';input.step='any';input.name=id;input.value=m.value??'';input.placeholder='未知';if(d.minimum!==null)input.min=d.minimum;if(d.maximum!==null)input.max=d.maximum;label.append(input);return label;}));
 const matrix=state.sensitivity,table=el('table'),head=el('tr');head.append(el('th',`${definition(matrix.row).label} ↓ / ${definition(matrix.column).label} →`));for(const value of matrix.columns)head.append(el('th',format(value,state.metrics[matrix.column].unit)));table.append(head);matrix.rows.forEach((value,i)=>{const row=el('tr');row.append(el('th',format(value,state.metrics[matrix.row].unit)));matrix.cells[i].forEach(cell=>{const td=el('td',undefined,cell.value>1?'infeasible':'feasible'),button=el('button',format(cell.value,state.metrics[matrix.output].unit),'evidence-link');button.onclick=()=>inspect(matrix.output,cell.lineage);td.append(button);td.title=cell.issues.map(x=>x.message).join('; ');row.append(td);});table.append(row);});$('matrix').replaceChildren(table);$('matrix-caption').textContent='反事實情境矩陣：點擊儲存格檢視該情境的完整血緣；其他參數沿用目前輸入。';
 renderGraph();renderThesis();renderComparison();
}
async function refresh(nextOverrides={},resetInputs=false) {
 const revision=++refreshRevision,requestMode=mode;
 const workspace=requestMode==='fixture'?'合成示範資料（Fixture）':'正式研究資料（Production）';
 if(resetInputs) {
  state=null;overrides={};
  $('inspector').close();$('inspector-body').replaceChildren();$('inspector-title').textContent='';
  for(const id of ['market-cards','asset-models','parameters','matrix','network','edge-list','thesis-cards','issues','comparison'])$(id).replaceChildren();
  $('matrix-caption').textContent='';$('notice').textContent=`正在載入${workspace}；尚無可顯示的金融結果。`;
 }
 $('error').hidden=true;$('retry-workspace').hidden=true;$('retry-workspace').disabled=true;
 $('load-status').textContent=state?'正在重算情境；畫面保留上一個成功結果。':`正在載入${workspace}…`;
 $('scenario-status').textContent='正在計算…';
 for(const node of $('scenario-form').querySelectorAll('input,button'))node.disabled=true;
 for(const id of ['overview','assets','sensitivity','graph','thesis','versions'])$(id).setAttribute('aria-busy','true');
 try {
  const changed=Object.keys(nextOverrides).length>0;
  const response=await fetch(`/api/${changed?'sensitivity':'state'}?mode=${requestMode}`,changed?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({overrides:nextOverrides})}:{});
  const data=await response.json();if(revision!==refreshRevision)return;
  if(!response.ok)throw new Error(data.error);
  if(data.mode!==requestMode||data.fixture!==(requestMode==='fixture'))throw new Error('工作區回應不一致，請重新載入。');
  state=data;overrides=nextOverrides;render(resetInputs);
  $('load-status').textContent=`${workspace}已載入。${changed?'目前顯示未儲存情境。':'目前顯示基準輸入。'}`;
  $('scenario-status').textContent=changed?'情境已重算・尚未儲存':'基準輸入已載入';
 }catch(error){
  if(revision!==refreshRevision)return;
  $('error').hidden=false;$('error').textContent=`${state?'情境重算':'工作區載入'}失敗：${term(error.message)}`;
  $('load-status').textContent=state?'保留同一工作區的上一個成功結果；輸入尚未套用。':`${workspace}尚未載入，請重新載入或切換工作區。`;
  if(!state)$('notice').textContent=`${workspace}載入失敗；尚無可顯示的金融結果。`;
  $('retry-workspace').hidden=false;$('scenario-status').textContent='計算失敗';
 }finally{
  if(revision===refreshRevision){
   $('retry-workspace').disabled=false;
   for(const node of $('scenario-form').querySelectorAll('input,button'))node.disabled=!state;
   for(const id of ['overview','assets','sensitivity','graph','thesis','versions'])$(id).setAttribute('aria-busy','false');
  }
 }
}

function renderResearch(data) {
 $('research-status').textContent=term(data.notice);
 $('research-records').replaceChildren(...data.records.map(report=>{
  const card=el('details',undefined,'research-card');card.dataset.research=report.id;
  card.append(el('summary',term(report.id)),el('p',`知識日 ${report.as_of_date} · 審查者（原文）${report.review.reviewer} · 審查時間 ${report.review.reviewed_at}`,'hint'));
  if(report.kind==='fixed_block') {
   const summary=report.summary;
   const values=freshnessTable(['觀測項目','原始值（完整字串）','ABI 型別','分類','可信程度'],summary.values.map(value=>[value.label,value.value,value.abi_type,term('OBSERVED'),term(report.full_review.confidence)]));
   values.tabIndex=0;values.setAttribute('aria-label','固定區塊原始值表格，可左右捲動');
   card.append(el('p',report.notice,'hint'),el('p',`固定區塊 ${summary.block_number} · ${summary.block_hash}`,'event-evidence'),
    el('p',`區塊時間 ${summary.block_time} · 取得時間 ${summary.retrieved_at}`,'hint'),
    el('p',`解碼查證方法 v${report.method.version}；部署合約與官方原始碼是否相同尚未查證。`,'hint'),
    el('p','表格可左右捲動，查看完整原始值與可信程度。','hint'),values,
    el('p',summary.receipt_state,'hint'));
   const limits=el('ul');for(const text of summary.limitations)limits.append(el('li',text));card.append(limits);
   const full=el('details');full.append(el('summary','原始 request／response 與查證限制'),
    el('p',`已審查原始檔 SHA-256：${report.artifact_id}`,'event-evidence'),el('pre',JSON.stringify(report.full_review,null,2)));
   card.append(researchSources(report.sources),full);return card;
  }
  if(report.statement)card.append(el('p',`${report.statement.entity_name} · ${term(report.statement.scope)} · ${report.statement.accounting_basis} · ${term(report.statement.audit_status)}`,'hint'),el('p',`報表限制（原文）：${report.statement.limitations}`,'hint'));
  if(report.kind==='capital') {
   card.append(el('p',report.notice,'hint'));
   for(const field of ['entity','unit_definition','table_basis','unknown_policy','comparison_basis','interpretation'])card.append(el('p',report.context[field],'hint'));
   const unresolved=el('ul');for(const item of report.context.unresolved)unresolved.append(el('li',item));card.append(unresolved);
   card.append(el('h3','機械分類核對'),freshnessTable(['核對項目','股數（count）','公式版本','期間／知識日'],report.summary.checks.map(record=>[
    record.label,record.value===null?'未知':new Intl.NumberFormat('zh-TW').format(record.value),`${record.formula_id} / v${record.formula_version}`,`${periodLabel(record.period)}／${record.as_of_date}`
   ])));
  }
  if(report.comparability) {
   card.append(el('span',`${term(report.comparability.classification)} · 可信程度 ${term(report.comparability.confidence)}`,'badge ASSUMPTION'),el('p',`可比性理由（原文）：${report.comparability.rationale}`,'hint'));
   const checks=el('div',undefined,'research-checks');
   for(const [name,check] of Object.entries(report.comparability.checks))checks.append(el('p',`${term(name)}：${check.value===null?'尚未確認':check.value?'分析者判斷已確認':'未確認'} · ${check.rationale}`));
   card.append(checks);
  }
  const wrap=el('div',undefined,'research-table-wrap'),table=el('table'),head=el('tr');
  for(const label of ['指標／資產','數值／識別碼','單位／類型','期間','知識日','分類','可信程度','狀態']) {const th=el('th',label);th.scope='col';head.append(th);}table.append(head);
  for(const record of report.records) {
   const row=el('tr'),period=record.period||report.periods.find(p=>p.id===record.period_id);
   const value=record.identifier?JSON.stringify(record.identifier):record.value===null?'未知':new Intl.NumberFormat('zh-TW',{maximumFractionDigits:6}).format(record.value);
   for(const text of [metricLabel(record.metric_id||record.asset),value,report.kind==='capital'?'股數（count）':term(record.unit||record.identifier?.kind||'—'),periodLabel(period),record.as_of_date,term(record.classification),term(record.confidence),term(record.status||record.investability?.status||'—')])row.append(el('td',text));
   table.append(row);
  }
  wrap.append(table);
  if(report.kind==='capital') {const raw=el('details');raw.append(el('summary',`原始觀測與計算紀錄（${report.records.length} 筆／${report.summary.unknown_observations} 筆未知觀測）`),wrap);card.append(raw);}
  else card.append(wrap);
  const full=el('details');full.append(el('summary','完整原始證據、公式與依賴'),el('p',`已保存的內容雜湊：${report.artifact_id}`,'hint'),el('pre',JSON.stringify(report.full_review,null,2)));
  card.append(researchSources(report.sources),full);return card;
 }));
 renderReviewedEvents(data.events||[]);
}
function researchSources(records) {
 const sources=el('div',undefined,'research-sources');sources.append(el('h3','來源與版本'));
 for(const source of records) {
   const p=el('p',`${source.title} · ${source.publisher} · 來源層級 ${source.tier} · v${source.version} · 發布 ${source.date} · 取得 ${source.retrieved_at} `);
   const url=new URL(source.url);
   if(['https:','http:'].includes(url.protocol)) {const link=el('a','開啟來源 ↗');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';p.append(link);}
   sources.append(p);
 }
 return sources;
}
function renderReviewedEvents(records) {
 const container=$('research-events');container.replaceChildren();
 if(!records.length)return;
 container.append(el('h3',`已保存事件與鏈上證據（${records.length} 筆）`),
  el('p','事件完成狀態只描述已保存範圍；單筆執行不代表年度收入、完整現況或投資性已確認。知識日、事件生效日、審查時間與模型期間分開保留。','hint'));
 for(const record of [...records].reverse()) {
  const {event}=record,card=el('details',undefined,'research-card');card.dataset.event=record.id;
  card.append(el('summary',`${term(record.id)} · ${term(event.type)} · 生效 ${event.effective_date||'未記錄'}`),
   el('p',`事件 ${record.id} · ${term(event.status)} · 知識日 ${event.as_of_date}`,'hint'),
   el('p',`審查者（原文）${event.research_review.reviewer} · 審查 ${event.research_review.reviewed_at}`,'hint'),
   el('p',`原快照模型期間 ${term(record.model_period.basis)} · ${record.model_period.end} · 保存時 ${record.recorded_update_count} 筆數值更新；本次查閱不套用更新。`,'hint'),
   el('h3','執行證據與限制（原文）'),el('p',event.reason,'event-evidence'),
   el('h3','查證方式（原文）'),el('p',event.research_review.rationale,'event-evidence'),researchSources(record.sources));
  const full=el('details');full.append(el('summary','完整原始事件與來源版本'),
   el('p',`保存時間 ${record.created_at} · 內容雜湊 ${record.snapshot_id} · parent ${record.parent_id||'首份快照'}`,'hint'),el('pre',JSON.stringify(record,null,2)));
  card.append(full);container.append(card);
 }
}

async function refreshResearch() {
 const revision=++researchRevision,requestMode=mode;
 $('research-records').replaceChildren();$('research-events').replaceChildren();$('research-status').textContent='正在載入研究證據…';
 for(const id of ['research-records','research-events'])$(id).setAttribute('aria-busy','true');
 $('retry-research').hidden=true;$('retry-research').disabled=true;
 try {
  const response=await fetch(`/api/research?mode=${requestMode}`),data=await response.json();
  if(revision!==researchRevision)return;
  if(!response.ok)throw new Error(data.error);
  if(data.mode!==requestMode)throw new Error('研究回應工作區不一致，請重新載入。');
  renderResearch(data);
 } catch(error) {if(revision===researchRevision){$('research-status').textContent=`研究證據無法取得：${term(error.message)}`;$('retry-research').hidden=false;}}
 finally{if(revision===researchRevision){for(const id of ['research-records','research-events'])$(id).setAttribute('aria-busy','false');$('retry-research').disabled=false;}}
}
$('retry-research').onclick=()=>refreshResearch();
function freshnessTable(labels,rows) {
 const wrap=el('div',undefined,'freshness-table-wrap'),table=el('table'),head=el('tr');
 for(const label of labels){const th=el('th',label);th.scope='col';head.append(th);}table.append(head);
 for(const values of rows){const row=el('tr');for(const value of values)row.append(el('td',String(value??'未知')));table.append(row);}
 wrap.append(table);return wrap;
}
function freshnessSummary(summary) {
 const wrap=el('div',undefined,'freshness-summary');
 for(const [group,counts] of Object.entries(summary))for(const [status,count] of Object.entries(counts))wrap.append(el('span',`${term(group)} · ${term(status)}：${count}`));
 return wrap;
}
function freshnessSources(rows) {
 const details=el('details',undefined,'freshness-card');details.append(el('summary','來源發布／取得日期與版本'));
 details.append(freshnessTable(['來源／版本','發布日','發布距今天數','取得時間','取得距今天數','取得狀態','證據用途'],rows.map(row=>[
  `${row.source.id} · v${row.source.version} · ${row.source.publisher} · 來源層級 ${row.source.tier}`,row.source.date,row.publication_age_days,row.source.retrieved_at,row.retrieval_age_days,term(row.retrieval_state),row.active?'使用中證據':'保留的來源版本'
 ])));
 return details;
}
function renderFreshness(data) {
 const container=$('freshness-report'),policy=el('article',undefined,'freshness-card');
 $('freshness-status').textContent=`${data.fixture?'合成示範資料（Fixture）':'正式研究資料（Production）'} · UTC 截止日 ${data.as_of_date} · 手動查詢完成`;
 policy.append(el('h3',`查證政策・${data.policy.id} / v${data.policy.version}`),el('span',term(data.policy.classification),'badge ASSUMPTION'),el('p',`政策理由（原文）：${data.policy.rationale}`,'hint'),el('p',`觀測窗口 ${data.policy.observation_max_age_days} 天・取得窗口 ${data.policy.retrieval_max_age_days} 天；各指標的個別窗口保留在完整原始報告。`,'hint'),el('p',term(data.interpretation),'hint'));
 if(data.fixture)policy.append(el('p','合成示範資料（Fixture）・全部時效結果只供示範。','fixture-label'));
 const canonical=el('details',undefined,'freshness-card');canonical.append(el('summary',`基準輸入日期（${data.inputs.length} 項）`),freshnessSummary(data.summary),freshnessTable(['指標／紀錄','觀測知識日','距今天數','窗口天數','觀測狀態','證據狀態','來源性質'],data.inputs.map(row=>[
  `${row.metric_id} · ${row.record_id??'未知'} · ${term(row.classification)}`,row.observation_as_of,row.observation_age_days,row.observation_max_age_days,term(row.observation_state),term(row.evidence_state),row.fixture?'合成示範資料（Fixture）':'正式研究資料'
 ])));
 container.replaceChildren(policy,canonical,freshnessSources(data.source_checks));
 if(data.research) {
  const research=el('article',undefined,'freshness-card');research.append(el('h3',`已編目研究・${data.research.artifacts.length} 份審查／${data.research.records.length} 筆紀錄`),el('p',term(data.research.interpretation),'hint'),freshnessSummary(data.research.summary));
  const reviews=el('details');reviews.append(el('summary','截止日的審查可用性'),freshnessTable(['目錄／研究檔案','知識日','審查時間','審查距今天數','審查狀態'],data.research.artifacts.map(row=>[`${row.id} · ${row.artifact_id}`,row.as_of_date,row.review.reviewed_at,row.review_age_days,term(row.review_state)])));
  const records=el('details');records.append(el('summary','原始研究觀測日期與未知值'),freshnessTable(['指標／紀錄','分類／數值','期間','觀測知識日','距今天數','窗口天數','觀測狀態','審查狀態','證據狀態'],data.research.records.map(row=>[
   `${row.record.label||metricLabel(row.metric_id)} · ${row.record_id}`,`${term(row.record.classification)} · ${row.record.value===null?'未知':row.record.value??'身份識別'}`,periodLabel(row.period),row.record.as_of_date,row.observation_age_days,row.observation_max_age_days,term(row.observation_state),term(row.review_state),term(row.evidence_state)
  ])));
  research.append(reviews,records,freshnessSources(data.research.source_checks));container.append(research);
 }
 const full=el('details',undefined,'freshness-card');full.append(el('summary','完整原始報告、政策與公式依賴'),el('pre',JSON.stringify(data,null,2)));container.append(full);
}
function clearFreshness(message) {
 ++freshnessRevision;$('freshness-report').replaceChildren();$('freshness-report').setAttribute('aria-busy','false');
 $('freshness-error').hidden=true;$('check-freshness').disabled=!mode;$('freshness-status').textContent=message;
}
async function refreshFreshness() {
 if(!mode)return;
 const revision=++freshnessRevision,requestMode=mode,query=new URLSearchParams({mode:requestMode});
 if($('freshness-date').value)query.set('as_of',$('freshness-date').value);
 $('freshness-report').replaceChildren();$('freshness-report').setAttribute('aria-busy','true');$('freshness-error').hidden=true;
 $('freshness-status').textContent='正在查詢時效…';$('check-freshness').disabled=true;
 try {
  const response=await fetch(`/api/freshness?${query}`),data=await response.json();
  if(revision!==freshnessRevision)return;
  if(!response.ok)throw new Error(data.error);
  renderFreshness(data);
 }catch(error){if(revision===freshnessRevision){$('freshness-error').hidden=false;$('freshness-error').textContent=`時效查詢失敗：${term(error.message)}`;$('freshness-status').textContent='時效結果未取得，請檢查日期後重新查詢。';}}
 finally{if(revision===freshnessRevision){$('check-freshness').disabled=false;$('freshness-report').setAttribute('aria-busy','false');}}
}
$('freshness-form').onsubmit=event=>{event.preventDefault();refreshFreshness();};
$('freshness-date').oninput=()=>clearFreshness('日期已變更，請手動重新查詢時效。');
$('scenario-form').onsubmit=event=>{event.preventDefault();if(!state||state.mode!==mode)return;const next={};for(const input of $('parameters').querySelectorAll('input'))if(input.value!==''&&Number(input.value)!==state.lineage[input.name].metric.value)next[input.name]=Number(input.value);refresh({...overrides,...next});};
$('reset').onclick=()=>refresh({},true);
$('retry-workspace').onclick=()=>{refresh({},true);refreshResearch();};
$('mode').onchange=event=>{
 if(!['fixture','production'].includes(event.target.value))return;
 mode=event.target.value;$('route-error').hidden=true;
 const url=new URL(location.href);url.searchParams.set('mode',mode);history.replaceState(null,'',url);
 clearFreshness('工作區已變更，請手動重新查詢時效。');refresh({},true);refreshResearch();
};
if(mode){$('mode').value=mode;refresh({},true);refreshResearch();}
else{
 $('mode').value='';$('route-error').hidden=false;$('notice').textContent='工作區尚未選擇，尚無可顯示的金融結果。';
 $('load-status').textContent='請選擇資料工作區後開始使用。';$('research-status').textContent='選擇工作區後載入研究證據。';
 $('check-freshness').disabled=true;
}
