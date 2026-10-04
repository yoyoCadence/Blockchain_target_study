import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createServer} from '../server.js';
import {term,metricLabel,periodLabel} from '../dashboard/zh-hant.js';

let fixture,production;
before(async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const base=`http://127.0.0.1:${server.address().port}`;
  [fixture,production]=await Promise.all(['fixture','production'].map(async mode=>(await fetch(`${base}/api/state?mode=${mode}`)).json()));
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
function app(search=''){
 const nodes=new Map([...fs.readFileSync(new URL('../dashboard/index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g)].map(match=>[match[1],new Node()]));
 const $=id=>nodes.get(id),submit=new Node('button');submit.disabled=true;$('reset').tag='button';$('reset').disabled=true;
 $('scenario-form').append($('parameters'),submit,$('reset'));
 const requests=[];
 const fetch=async(url,options)=>{
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
 return {$,submit,requests,change,count,urls};
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
