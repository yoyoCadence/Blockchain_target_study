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
 assert.equal(v.$('research-records').children.length,6);assert.equal(v.$('retry-research').hidden,true);
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
 v.researchRequests[1].reply(productionResearch);await tick();assert.equal(v.$('research-records').children.length,6);
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
