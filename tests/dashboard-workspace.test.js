import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createServer} from '../server.js';
import {term,metricLabel,periodLabel} from '../dashboard/zh-hant.js';

let fixture,production,productionResearch;
before(async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const base=`http://127.0.0.1:${server.address().port}`;
  [fixture,production]=await Promise.all(['fixture','production'].map(async mode=>(await fetch(`${base}/api/state?mode=${mode}`)).json()));
  productionResearch=await (await fetch(`${base}/api/research?mode=production`)).json();
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

// Minimal DOM for the real app module; the rendered browser is checked separately.
class Node {
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.value='';this.hidden=false;this.disabled=false;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 set textContent(text){this.children=[String(text)];}
 get textContent(){return this.children.map(child=>typeof child==='string'?child:child.textContent).join('');}
 setAttribute(name,value){this.attrs[name]=value;}
 querySelectorAll(selector){const tags=selector.split(',');return this.children.filter(child=>child instanceof Node).flatMap(child=>[...(tags.includes(child.tag)?[child]:[]),...child.querySelectorAll(selector)]);}
 close(){this.open=false;}
 showModal(){this.open=true;}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function app(search='',{manualResearch=false}={}){
 const nodes=new Map([...fs.readFileSync(new URL('../dashboard/index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g)].map(match=>[match[1],new Node()]));
 const $=id=>nodes.get(id),submit=new Node('button');submit.disabled=true;$('reset').tag='button';$('reset').disabled=true;
 $('scenario-form').append($('parameters'),submit,$('reset'));
 const requests=[],researchRequests=[];
 const fetch=async(url,options)=>{
  if(url.startsWith('/api/research')&&manualResearch)return new Promise(resolve=>researchRequests.push({url,reply:(data,ok=true)=>resolve({ok,json:async()=>structuredClone(data)})}));
  if(url.startsWith('/api/research'))return {ok:true,json:async()=>({mode:new URL(url,'http://local').searchParams.get('mode'),records:[],notice:'test'})};
  return new Promise(resolve=>requests.push({url,options,reply:(data,ok=true)=>resolve({ok,json:async()=>structuredClone(data)})}));
 };
 const document={getElementById:$,createElement:tag=>new Node(tag),createElementNS:(_,tag)=>new Node(tag)};
 const source=fs.readFileSync(new URL('../dashboard/app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
 const location={href:`http://local/${search}#research`,search},urls=[];
 const history={replaceState:(_,__,url)=>urls.push(String(url))};
 vm.runInNewContext(source,{document,fetch,term,metricLabel,periodLabel,Intl,URLSearchParams,URL,location,history});
 const change=mode=>{$('mode').value=mode;$('mode').onchange({target:$('mode')});};
 const count=()=>$('market-cards').querySelectorAll('button').length+$('asset-models').querySelectorAll('button').length;
 return {$,submit,requests,researchRequests,change,count,urls};
}
async function loaded(){const view=app();view.requests[0].reply(fixture);await tick();assert.equal(view.count(),84);return view;}

test('initial pending state cannot submit a scenario without baseline data',async()=>{
 const v=app();assert.equal(v.count(),0);assert.equal(v.submit.disabled,true);
 v.$('scenario-form').onsubmit({preventDefault(){}});assert.equal(v.requests.length,1);
 assert.match(v.$('notice').textContent,/Fixture/);assert.equal(v.$('overview').attrs['aria-busy'],'true');
 v.requests[0].reply(fixture);await tick();assert.equal(v.submit.disabled,false);assert.equal(v.count(),84);
});
test('switch failure clears every old result and inspector, keeps calculation blocked, and retries the selected workspace',async()=>{
 const v=await loaded();v.$('inspector').showModal();v.$('inspector-body').textContent='old evidence';
 v.change('production');assert.equal(v.count(),0);assert.equal(v.$('parameters').querySelectorAll('input').length,0);
 for(const id of ['matrix','network','edge-list','thesis-cards','issues','comparison','inspector-body'])assert.equal(v.$(id).children.length,0,id);
 assert.equal(v.$('inspector').open,false);assert.equal(v.submit.disabled,true);assert.match(v.$('notice').textContent,/Production/);
 v.requests[1].reply({error:'offline'},false);await tick();
 assert.equal(v.count(),0);assert.equal(v.submit.disabled,true);assert.equal(v.$('retry-workspace').hidden,false);
 assert.match(v.$('notice').textContent,/Production.*失敗/);assert.equal(v.$('overview').attrs['aria-busy'],'false');
 v.$('retry-workspace').onclick();assert.equal(v.requests[2].url,'/api/state?mode=production');
 v.requests[2].reply(production);await tick();assert.equal(v.count(),84);assert.equal(v.submit.disabled,false);
 assert.equal(v.$('retry-workspace').hidden,true);assert.match(v.$('notice').textContent,/正式研究工作區/);
 assert.equal(v.$('parameters').querySelectorAll('input').find(input=>input.name==='uni.fee').value,'');
});
test('a late old workspace success cannot replace the latest workspace or its controls',async()=>{
 const v=await loaded();v.change('production');v.change('fixture');
 v.requests[2].reply(fixture);await tick();const notice=v.$('notice').textContent;
 v.requests[1].reply(production);await tick();assert.equal(v.$('notice').textContent,notice);assert.equal(v.count(),84);
 assert.equal(v.submit.disabled,false);assert.match(notice,/合成示範工作區/);
});
test('a late failure cannot show an old error or enable controls during the latest pending load',async()=>{
 const v=await loaded();v.change('production');v.change('fixture');
 v.requests[1].reply({error:'old failure'},false);await tick();
 assert.equal(v.$('error').hidden,true);assert.equal(v.$('retry-workspace').hidden,true);assert.equal(v.submit.disabled,true);assert.equal(v.count(),0);
 v.requests[2].reply(fixture);await tick();assert.equal(v.submit.disabled,false);
});
test('failed same-workspace sensitivity retains the last successful result and does not apply invalid input',async()=>{
 const v=await loaded(),notice=v.$('notice').textContent;
 const margin=v.$('parameters').querySelectorAll('input').find(input=>input.name==='secz.fcf_margin');margin.value='2';
 v.$('scenario-form').onsubmit({preventDefault(){}});assert.equal(v.submit.disabled,true);
 assert.equal(v.requests[1].url,'/api/sensitivity?mode=fixture');assert.equal(JSON.parse(v.requests[1].options.body).overrides['secz.fcf_margin'],2);
 v.requests[1].reply({error:'invalid margin'},false);await tick();
 assert.equal(v.count(),84);assert.equal(v.$('notice').textContent,notice);assert.match(v.$('load-status').textContent,/上一個成功結果.*尚未套用/);
 assert.equal(v.submit.disabled,false);assert.equal(margin.value,'2');
});
for(const [name,patch] of [['mode',{mode:'fixture'}],['provenance',{fixture:true}]])test(`mismatched ${name} response is rejected before production results render`,async()=>{
 const v=await loaded();v.change('production');v.requests[1].reply({...production,...patch});await tick();
 assert.equal(v.count(),0);assert.equal(v.submit.disabled,true);assert.match(v.$('error').textContent,/工作區回應不一致/);
});
test('initial load failure remains retryable without dereferencing an absent state',async()=>{
 const v=app();v.requests[0].reply({error:'initial failure'},false);await tick();
 v.$('scenario-form').onsubmit({preventDefault(){}});assert.equal(v.requests.length,1);
 assert.equal(v.submit.disabled,true);v.$('retry-workspace').onclick();v.requests[1].reply(fixture);await tick();
 assert.equal(v.submit.disabled,false);assert.equal(v.$('error').hidden,true);assert.equal(v.count(),84);
});

test('a direct production URL requests production before any data loads and selects its workspace',async()=>{
 const v=app('?mode=production');assert.equal(v.requests[0].url,'/api/state?mode=production');
 assert.equal(v.$('mode').value,'production');v.requests[0].reply(production);await tick();
 assert.match(v.$('notice').textContent,/正式研究工作區/);assert.equal(v.count(),84);
});
for(const search of ['?mode=invalid','?mode=','?mode=fixture&mode=production'])test(`invalid route ${search} blocks implicit data loads until an explicit workspace choice`,async()=>{
 const v=app(search);assert.equal(v.requests.length,0);assert.equal(v.count(),0);assert.equal(v.$('mode').value,'');
 assert.equal(v.$('route-error').hidden,false);assert.equal(v.$('check-freshness').disabled,true);
 v.$('freshness-form').onsubmit({preventDefault(){}});assert.equal(v.requests.length,0);
 v.change('production');assert.equal(v.requests[0].url,'/api/state?mode=production');
 assert.equal(v.$('route-error').hidden,true);assert.equal(v.$('check-freshness').disabled,false);
 assert.equal(v.urls[0],'http://local/?mode=production#research');v.requests[0].reply(production);await tick();
 assert.equal(v.count(),84);
});
test('workspace selection preserves the anchor and unrelated query while replacing the mode',async()=>{
 const v=app('?mode=fixture&context=review');v.requests[0].reply(fixture);await tick();v.change('production');
 assert.equal(v.urls[0],'http://local/?mode=production&context=review#research');
});

test('independent research retry preserves loaded financial results and unapplied scenario inputs',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);await tick();
 const margin=v.$('parameters').querySelectorAll('input').find(input=>input.name==='secz.fcf_margin');margin.value='0.3';
 v.researchRequests[0].reply({error:'research offline'},false);await tick();
 assert.equal(v.$('retry-research').hidden,false);assert.equal(v.count(),84);
 v.$('retry-research').onclick();assert.equal(v.researchRequests[1].url,'/api/research?mode=production');
 assert.equal(v.requests.length,1);assert.equal(margin.value,'0.3');assert.equal(v.$('research-records').attrs['aria-busy'],'true');
 v.researchRequests[1].reply(productionResearch);await tick();
 assert.equal(v.$('research-records').children.length,productionResearch.records.length);assert.equal(v.$('retry-research').hidden,true);
 assert.equal(margin.value,'0.3');assert.equal(v.count(),84);assert.equal(v.$('research-records').attrs['aria-busy'],'false');
});
test('wrong research workspace is rejected without displaying its records',async()=>{
 const v=app('',{manualResearch:true});v.researchRequests[0].reply(productionResearch);await tick();
 assert.equal(v.$('research-records').children.length,0);assert.match(v.$('research-status').textContent,/工作區不一致/);
 assert.equal(v.$('retry-research').hidden,false);
});
test('late research failure cannot enable retry or clear busy state for the latest workspace',async()=>{
 const v=app('',{manualResearch:true});v.change('production');
 v.researchRequests[0].reply({error:'old research error'},false);await tick();
 assert.equal(v.$('retry-research').hidden,true);assert.equal(v.$('retry-research').disabled,true);
 assert.equal(v.$('research-records').attrs['aria-busy'],'true');assert.doesNotMatch(v.$('research-status').textContent,/old research error/);
 v.researchRequests[1].reply(productionResearch);await tick();assert.equal(v.$('research-records').children.length,productionResearch.records.length);
});
test('late research success cannot replace the current workspace failure and retry',async()=>{
 const v=app('',{manualResearch:true});v.change('production');
 v.researchRequests[1].reply({error:'current research error'},false);await tick();
 v.researchRequests[0].reply({mode:'fixture',records:[],notice:'stale success'});await tick();
 assert.equal(v.$('research-records').children.length,0);assert.match(v.$('research-status').textContent,/current research error/);
 assert.equal(v.$('retry-research').hidden,false);
});

test('reviewed event cards preserve exact evidence and separate current event dates from model periods',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const cards=v.$('research-events').querySelectorAll('details').filter(card=>card.dataset.event);
 assert.equal(cards.length,productionResearch.events.length);assert.equal(cards[0].dataset.event,productionResearch.events.at(-1).id);
 const accrued=cards.find(card=>card.dataset.event==='uni-v2-fee-accrual-20261004');
 assert.match(accrued.textContent,/6952494133386631432161/);
 assert.match(accrued.textContent,/知識日 2026-10-04/);assert.match(accrued.textContent,/模型期間 年度 · 2026-01-01/);
 assert.match(accrued.textContent,/保存時 0 筆數值更新/);assert.match(accrued.textContent,/來源層級 1 · v1/);
 assert.equal(v.$('research-events').attrs['aria-busy'],'false');assert.equal(v.count(),84);
});
test('switching to fixture immediately clears event evidence and late production success cannot restore it',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.researchRequests[0].reply(productionResearch);await tick();
 assert.ok(v.$('research-events').children.length>0);v.$('retry-research').onclick();v.change('fixture');
 assert.equal(v.$('research-events').children.length,0);assert.equal(v.$('research-events').attrs['aria-busy'],'true');
 v.researchRequests[1].reply(productionResearch);await tick();assert.equal(v.$('research-events').children.length,0);
 v.researchRequests[2].reply({mode:'fixture',records:[],events:[],notice:'fixture'});await tick();
 assert.equal(v.$('research-events').children.length,0);assert.equal(v.$('research-events').attrs['aria-busy'],'false');
});
test('research failure clears old event cards and independent retry restores them without applying scenario input',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const margin=v.$('parameters').querySelectorAll('input').find(input=>input.name==='secz.fcf_margin');margin.value='0.3';
 v.$('retry-research').onclick();assert.equal(v.$('research-events').children.length,0);
 v.researchRequests[1].reply({error:'event research offline'},false);await tick();
 assert.equal(v.$('research-events').children.length,0);assert.equal(v.$('retry-research').hidden,false);
 v.$('retry-research').onclick();v.researchRequests[2].reply(productionResearch);await tick();
 assert.equal(v.$('research-events').querySelectorAll('details').filter(card=>card.dataset.event).length,productionResearch.events.length);
 assert.equal(margin.value,'0.3');assert.equal(v.requests.length,1);assert.equal(v.count(),84);
});

test('single venue source review retains its saved scope alongside a later independent XLM baseline',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(card=>card.dataset.event==='uni-xlm-market-quotes-source-review-20261004');
 assert.match(card.textContent,/UNI／XLM 單次交易所價格查證 · 市場資料查證/);
 assert.match(card.textContent,/9\.0556 USD\/UNI/);assert.match(card.textContent,/0\.216265 USD\/XLM/);
 assert.match(card.textContent,/2026-10-04T11:33:36\.662371063Z/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);
 assert.equal(production.metrics['uni.price'].value,9.0556);assert.equal(production.metrics['xlm.price'].value,0.216265);
 assert.equal(production.metrics['xlm.price'].classification,'OBSERVED');
 const quote=v.$('asset-models').querySelectorAll('button').find(button=>button.dataset.metric==='xlm.price');
 assert.match(quote.textContent,/\$0\.216265/);
 quote.onclick();assert.match(v.$('inspector-body').textContent,/\$0\.216265/);
 const savedQuote=v.$('research-events').querySelectorAll('details').find(card=>card.dataset.event==='uni-market-quote-baseline-20261004');
 assert.match(savedQuote.textContent,/9\.0556/);
 const cost=v.$('asset-models').querySelectorAll('button').find(button=>button.dataset.metric==='uni.growth_distribution');
 assert.match(cost.textContent,/按報價折算的模型 · 2026-10-04/);
 cost.onclick();assert.match(v.$('inspector-body').textContent,/不代表實際年度支出或收入/);
 assert.equal(v.count(),84);
});

test('UNI vesting card retains quarterly execution and unpinned current-state limits without financial ingestion',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(card=>card.dataset.event==='uni-vesting-execution-20261004');
 assert.match(card.textContent,/UNI 季度提領與公開合約參數/);assert.match(card.textContent,/生效 2026-10-01/);
 assert.match(card.textContent,/5000000000000000000000000/);assert.match(card.textContent,/quartersPaid=1/);
 assert.match(card.textContent,/未固定 block number／hash/);assert.match(card.textContent,/保存時 0 筆數值更新/);
 assert.match(card.textContent,/"updates": \[\]/);assert.equal(v.count(),84);
 assert.equal(production.metrics['uni.price'].value,9.0556);assert.equal(production.metrics['uni.growth_budget'].as_of_date,'2026-01-01');
});

test('fixed-block UNI card distinguishes canonical state, receipt null and unchanged financial inputs',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(card=>card.dataset.event==='uni-vesting-fixed-block-20261004');
 assert.match(card.textContent,/UNI 固定區塊參數與剩餘授權/);assert.match(card.textContent,/requireCanonical=true/);
 assert.match(card.textContent,/20000000000000000000000000/);assert.match(card.textContent,/本次未能 RPC 交叉確認/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.match(card.textContent,/"updates": \[\]/);
 assert.equal(production.metrics['uni.growth_budget'].as_of_date,'2026-01-01');assert.equal(v.count(),84);
});

test('fixed-block research table preserves raw strings and separates block, retrieval and review dates',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').querySelectorAll('details').find(c=>c.dataset.research==='uni-vesting-fixed-block-20261004');
 assert.match(card.textContent,/UNI 固定區塊參數與剩餘授權/);assert.match(card.textContent,/固定區塊 26119713/);
 assert.match(card.textContent,/20000000000000000000000000/);assert.doesNotMatch(card.textContent,/20,000,000,000,000,000,000,000,000/);
 assert.match(card.textContent,/區塊時間 2026-10-04T14:53:11.000Z/);assert.match(card.textContent,/取得時間 2026-10-04T15:08:12.569Z/);
 assert.match(card.textContent,/審查時間 2026-10-04T15:10:00.682Z/);assert.match(card.textContent,/RPC 無結果/);
 assert.match(card.textContent,/原始 request／response/);assert.match(card.textContent,/deployment_source_equivalence/);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('token-state event keeps point balance, raw supply and future-funding limits outside financial values',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);
 v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(c=>c.dataset.event==='uni-token-state-20261004');
 assert.match(card.textContent,/UNI 固定區塊餘額與供給/);assert.match(card.textContent,/262247996305835021033106178/);
 assert.match(card.textContent,/totalSupply raw=1000000000000000000000000000/);assert.match(card.textContent,/不是健康論點或付款保證/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.equal(production.metrics['uni.fdv'].value,null);assert.equal(v.count(),84);
});

test('token-state research renders exact OBSERVED integers separately from DERIVED comparison and its complete dependencies',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research==='uni-token-state-20261004');
 assert.match(card.textContent,/262247996305835021033106178/);assert.match(card.textContent,/1000000000000000000000000000/);
 assert.match(card.textContent,/UNI 原始最小單位/);assert.match(card.textContent,/已觀測（OBSERVED）/);assert.match(card.textContent,/推導值（DERIVED）/);
 assert.match(card.textContent,/2026-10-04T14:53:11\.000Z/);assert.match(card.textContent,/2026-10-04T16:06:27\.842Z/);assert.match(card.textContent,/2026-10-04T16:10:51\.187Z/);
 assert.match(card.textContent,/research\.uni\.owner_balance_covers_vesting_allowance \/ v1/);
 assert.match(card.textContent,/research\.uni\.token-state\.block26119713\.owner_balance@1/);assert.match(card.textContent,/research\.uni\.token-state\.block26119713\.vesting_allowance@1/);
 assert.match(card.textContent,/流通／自由流通／完全稀釋供給尚未查證/);assert.match(card.textContent,/付款保證/);
 assert.equal(card.querySelectorAll('table').length,2);assert.equal(card.querySelectorAll('a').length,2);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('public venue event preserves provider flags and personal-access nulls without updating price or financial inputs',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(c=>c.dataset.event==='uni-xlm-public-venue-state-20261005');
 assert.match(card.textContent,/UNI／XLM 公開市場與網路表示/);assert.match(card.textContent,/trading_disabled／cancel_only／limit_only／post_only／auction_mode 都為 false/);
 assert.match(card.textContent,/研究觀測保留 null／unknown/);assert.match(card.textContent,/不是個人交易／提款或全球可用性認證/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.equal(production.metrics['uni.market_cap'].value,null);assert.equal(v.count(),84);
});

test('public venue research renders exact typed raw values, original dates, address lineage and unknown access',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research==='uni-xlm-public-venue-20261005');
 assert.match(card.textContent,/UNI／XLM 單一公開市場與網路表示/);assert.match(card.textContent,/false/);assert.match(card.textContent,/空字串（""）/);
 assert.match(card.textContent,/供應者狀態生效時間未知/);assert.match(card.textContent,/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984/);
 assert.match(card.textContent,/2026-10-05T00:07:10\.660Z/);assert.match(card.textContent,/2026-10-05T00:07:12\.143Z/);assert.match(card.textContent,/2026-10-05T00:13:08\.875Z/);
 assert.match(card.textContent,/research\.uni\.coinbase_reported_contract_matches_identity \/ v1/);assert.match(card.textContent,/UNI\.identity@1-20261003/);
 for(const label of ['個人資格','地區資格','託管查證','帳戶交易權限','提款權限'])assert.ok(card.textContent.includes(label+'：未知'));
 assert.equal(card.querySelectorAll('table').length,2);assert.equal(card.querySelectorAll('a').length,6);
 const tables=card.querySelectorAll('div').filter(n=>n.attrs['aria-label']?.includes('表格，可左右捲動'));assert.equal(tables.length,2);assert.ok(tables.every(n=>n.tabIndex===0));
 assert.equal(production.metrics['uni.fdv'].value,null);assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('public venue derived null is shown as unknown instead of a healthy or matched flag',async()=>{
 const data=structuredClone(productionResearch),r=data.records.find(r=>r.kind==='public_venue');r.summary.address_match.value=null;r.summary.address_match.confidence='unknown';
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(data);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research===r.id),derived=card.querySelectorAll('table')[1];
 assert.match(derived.textContent,/未知/);assert.match(derived.textContent,/推導值（DERIVED）/);assert.equal(derived.textContent.includes('100%'),false);
});

test('XLM supply research renders exact decimal strings, separate times, residual lineage and unknown valuation',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research==='xlm-supply-20261005');
 assert.match(card.textContent,/XLM 官方回報供給／精確殘差/);assert.match(card.textContent,/2026-10-05T11:25:20\.229Z/);
 for(const value of ['100000000000','5443902087.3472865','55442115247.6478151','50001786839.6994714','258885847.5135978','10763671.0740601','14674425047.8957122','35057712273.2161013'])
  assert.ok(card.textContent.includes(value),value);
 assert.match(card.textContent,/供應者更新 2026-10-05T11:14:19\.137Z · 收到回應 2026-10-05T11:22:26\.166Z；兩者不是同一時刻/);
 assert.match(card.textContent,/供應者回報（provider_reported）/);assert.match(card.textContent,/0\.0000000/);
 assert.match(card.textContent,/research\.xlm\.supply\.total_residual \/ v1/);assert.match(card.textContent,/research\.xlm\.supply\.circulating_residual \/ v1/);
 assert.match(card.textContent,/research\.xlm\.supply\.circulatingSupply@1-20261005/);assert.match(card.textContent,/不代表真實供給、自由流通或論點健康/);
 assert.match(card.textContent,/取代 stellar-lumens-docs-20260928-v1/);assert.match(card.textContent,/不能離線重播/);
 for(const label of ['Ledger 序號','各組成帳戶餘額','獨立查證流通供給','完全稀釋供給','同步市值','同步 FDV'])assert.ok(card.textContent.includes(label+'：未知'),label);
 assert.equal(card.querySelectorAll('table').length,2);assert.equal(card.querySelectorAll('a').length,3);
 const tables=card.querySelectorAll('div').filter(n=>n.attrs['aria-label']?.includes('表格，可左右捲動'));assert.equal(tables.length,2);assert.ok(tables.every(n=>n.tabIndex===0));
 assert.equal(production.metrics['xlm.price'].as_of_date,'2026-10-04');assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('UNI supply composition research renders exact raw readings, derived checks, document basis and unknown valuation',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research==='uni-supply-20261006');
 assert.match(card.textContent,/UNI 固定區塊供給組成／鑄造參數/);assert.match(card.textContent,/2026-10-06T13:36:06\.327Z/);
 for(const value of ['1000000000000000000000000000','112633581211219518941995199','262247996305835021033106178','20000000000000000000000000','1704067200','31536000',
  '887366418788780481058004801','625118422482945460024898623','0x1a9C8182C09F50C8318d769245beA52c32BE35BC','0x1a9c8182c09f50c8318d769245bea52c32be35bc'])
  assert.ok(card.textContent.includes(value),value);
 assert.match(card.textContent,/固定區塊 26133577 · 0x301ce0f2aed56d73a46cf4e6ac24aebe273892d4fd1e3aa2f19707cee87179f4/);
 assert.match(card.textContent,/區塊時間 2026-10-06T13:17:11\.000Z · 取得時間 2026-10-06T13:34:54\.065Z/);
 assert.match(card.textContent,/research\.uni\.mint\.cap_amount_at_block \/ v1/);assert.match(card.textContent,/research\.uni\.supply\.block26133577\.dead_sink_balance@1/);
 assert.match(card.textContent,/不是流通或自由流通供給/);assert.match(card.textContent,/dateModified 2026-04-09T14:56:21\.000Z/);
 assert.match(card.textContent,/commit ab22c084bacb2636a1aebf9759890063eb6e4946/);assert.match(card.textContent,/第 29 行：uint8 public constant mintCap = 2;/);
 assert.match(card.textContent,/UNI 原始最小單位/);assert.match(card.textContent,/Unix 秒/);assert.match(card.textContent,/官方文件片段/);
 for(const label of ['流通供給','流通供給定義','dead address 餘額歸因','未來鑄造決定','同步價格','市值','完全稀釋估值（FDV）','部署原始碼等價'])assert.ok(card.textContent.includes(label+'：未知'),label);
 assert.equal(card.querySelectorAll('table').length,2);assert.equal(card.querySelectorAll('a').length,3);
 const tables=card.querySelectorAll('div').filter(n=>n.attrs['aria-label']?.includes('表格，可左右捲動'));assert.equal(tables.length,2);assert.ok(tables.every(n=>n.tabIndex===0));
 assert.equal(production.metrics['uni.market_cap'].value,null);assert.equal(production.metrics['uni.fdv'].value,null);assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('UNI supply zero flags render as observed zero instead of unknown or a healthy signal',async()=>{
 const data=structuredClone(productionResearch),r=data.records.find(r=>r.kind==='uni_supply_composition');
 r.summary.derived.find(d=>d.formula_id==='research.uni.mint.time_permitted_at_block').value=0;
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(data);await tick();
 const table=v.$('research-records').children.find(c=>c.dataset.research===r.id).querySelectorAll('table')[1];
 const row=table.children.find(tr=>tr.textContent.includes('區塊時間已滿足鑄造時間條件'));
 assert.equal(row.children[1].textContent,'0');assert.match(row.textContent,/推導值（DERIVED）/);assert.equal(row.textContent.includes('未知'),false);
});

test('Firepit state research renders exact readings, mechanical products, pinned source lines and unknown annualization',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-records').children.find(c=>c.dataset.research==='uni-firepit-20261006');
 assert.match(card.textContent,/UNI 主網 Firepit 狀態／release 次數與門檻/);assert.match(card.textContent,/2026-10-06T14:44:07\.673Z/);
 for(const value of ['1395','4000000000000000000000','5580000000000000000000000','107053581211219518941995199','112633581211219518941995199',
  '0x000000000000000000000000000000000000dead','0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721','0xf38521f130fcCF29dB1961597bc5d2B60F995f85'])assert.ok(card.textContent.includes(value),value);
 assert.match(card.textContent,/固定區塊 26133926 · 0xf00aa9e42de56c422eebd891c319a2dd6837f531100c1ee957779a599b644060/);
 assert.match(card.textContent,/區塊時間 2026-10-06T14:27:35\.000Z · 取得時間 2026-10-06T14:43:40\.447Z/);
 assert.match(card.textContent,/research\.uni\.firepit\.nonce_times_threshold \/ v1/);assert.match(card.textContent,/research\.uni\.firepit\.block26133926\.threshold@1/);
 assert.match(card.textContent,/兩者都不是年度銷毀或收入/);assert.match(card.textContent,/commit 8604e4b9aed88bdd6be3a322e19722c40f94be2c（2025-12-18）/);
 assert.match(card.textContent,/ExchangeReleaser\.sol · uniswap-protocol-fees-exchange-releaser-raw-8604e4b-v1/);
 assert.match(card.textContent,/第 50 行：RESOURCE\.safeTransferFrom\(msg\.sender, RESOURCE_RECIPIENT, threshold\);/);assert.match(card.textContent,/第 24 行：\+\+nonce;/);
 assert.match(card.textContent,/官方 README 行/);assert.match(card.textContent,/UNI 原始最小單位/);
 for(const label of ['門檻變更歷史','精確累計支付','dead address 餘額歸因','L2 橋接銷毀','換出資產 USD 價值','費用來源歸因','年化 burn','同步價格','部署原始碼等價'])
  assert.ok(card.textContent.includes(label+'：未知'),label);
 assert.equal(card.querySelectorAll('table').length,2);assert.equal(card.querySelectorAll('a').length,6);
 const tables=card.querySelectorAll('div').filter(n=>n.attrs['aria-label']?.includes('表格，可左右捲動'));assert.equal(tables.length,2);assert.ok(tables.every(n=>n.tabIndex===0));
 assert.equal(production.metrics['uni.net_burn_yield'].value,null);assert.equal(production.metrics['uni.crypto_fees'].value,null);assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-records').children.length,0);assert.equal(v.$('research-events').children.length,0);
});

test('research card text, list and raw blocks can break long unspaced evidence on narrow screens',()=>{
 // README rows carry long unspaced URLs; without this rule the narrow page overflowed (312/509 in Chrome).
 const css=fs.readFileSync(new URL('../dashboard/style.css',import.meta.url),'utf8');
 for(const selector of ['.research-card .hint','.research-card li','.event-evidence','.research-sources p,.research-checks p'])
  assert.match(css,new RegExp(`${selector.replace(/[.,]/g,'\\$&')}\\{[^}]*overflow-wrap:anywhere`),selector);
});

test('Firepit zero comparison flags render as observed zero instead of unknown',async()=>{
 const data=structuredClone(productionResearch),r=data.records.find(r=>r.kind==='uni_firepit_state');
 r.summary.derived.find(d=>d.formula_id==='research.uni.firepit.token_jar_matches_docs').value=0;
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(data);await tick();
 const table=v.$('research-records').children.find(c=>c.dataset.research===r.id).querySelectorAll('table')[1];
 const row=table.children.find(tr=>tr.textContent.includes('TOKEN_JAR 與 README 地址相符'));
 assert.equal(row.children[1].textContent,'0');assert.match(row.textContent,/推導值（DERIVED）/);assert.equal(row.textContent.includes('未知'),false);
});

test('Firepit state event shows release count, current threshold and unattributed residual without annualizing',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(c=>c.dataset.event==='uni-firepit-state-20261006');
 assert.match(card.textContent,/UNI 主網 Firepit 累計 release 次數與現行門檻 · 代幣銷毀事件/);
 for(const value of ['nonce=1395','4000000000000000000000','5580000000000000000000000','107053581211219518941995199','112633581211219518941995199'])
  assert.ok(card.textContent.includes(value),value);
 assert.match(card.textContent,/門檻歷史未查證/);assert.match(card.textContent,/不年化、不計估值/);assert.match(card.textContent,/不是新的銷毀交易、年度 burn 或費用收入/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.equal(card.querySelectorAll('a').length,6);
 assert.equal(production.metrics['uni.net_burn_yield'].value,null);assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-events').children.length,0);
});

test('UNI supply composition event shows exact raw supply and mint parameters without valuation or circulating definition',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(c=>c.dataset.event==='uni-supply-composition-20261006');
 assert.match(card.textContent,/UNI 固定區塊供給組成與鑄造參數 · 股本／稀釋研究/);
 for(const value of ['1000000000000000000000000000','112633581211219518941995199','262247996305835021033106178','887366418788780481058004801','625118422482945460024898623','1704067200'])
  assert.ok(card.textContent.includes(value),value);
 assert.match(card.textContent,/不是流通供給定義/);assert.match(card.textContent,/鑄造條件滿足不代表治理會鑄造/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.equal(card.querySelectorAll('a').length,3);
 assert.equal(production.metrics['uni.market_cap'].value,null);assert.equal(production.metrics['uni.fdv'].value,null);assert.equal(v.count(),84);
 v.change('fixture');assert.equal(v.$('research-events').children.length,0);
});

test('XLM supply event shows exact reported decimals and separate timestamps without adding valuation',async()=>{
 const v=app('?mode=production',{manualResearch:true});v.requests[0].reply(production);v.researchRequests[0].reply(productionResearch);await tick();
 const card=v.$('research-events').querySelectorAll('details').find(c=>c.dataset.event==='xlm-reported-supply-20261005');
 assert.match(card.textContent,/XLM 官方回報供給與口徑 · 市場資料查證/);
 assert.match(card.textContent,/50001786839\.6994714 XLM/);assert.match(card.textContent,/35057712273\.2161013 XLM/);
 assert.match(card.textContent,/2026-10-05T11:14:19\.137Z/);assert.match(card.textContent,/2026-10-05T11:22:26\.166Z/);
 assert.match(card.textContent,/零殘差不證明真實供給或健康論點/);assert.match(card.textContent,/前一天價格不能配成本次同步市值／FDV/);
 assert.match(card.textContent,/保存時 0 筆數值更新/);assert.match(card.textContent,/"updates": \[\]/);
 assert.equal(card.querySelectorAll('a').length,2);assert.equal(v.count(),84);
 assert.equal(productionResearch.records.length,12);assert.equal(production.metrics['xlm.price'].as_of_date,'2026-10-04');
 v.change('fixture');assert.equal(v.$('research-events').children.length,0);
});
