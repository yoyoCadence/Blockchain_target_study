import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.js';
test('local dashboard/API serves canonical values, lineage, sensitivity and errors',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 try {
  const html=await fetch(base);assert.match(await html.text(),/Living Underwriting/);
  const locale=await fetch(`${base}/zh-hant.js`);assert.equal(locale.status,200);
  assert.match(locale.headers.get('content-type'),/text\/javascript/);
  let response=await fetch(`${base}/api/state`),data=await response.json();assert.equal(response.status,200);assert.equal(data.fixture,true);assert.ok(data.lineage['uni.net_accrual'].formula);assert.equal(data.assets.length,14);assert.equal(data.comparison.assumption_change,true);assert.equal(data.comparison_lineage['uni.fee'].previous.metric.value,0.00017);assert.equal(data.comparison_lineage['uni.fee'].current.metric.value,0.000125);
  response=await fetch(`${base}/api/sensitivity`,{method:'POST',body:JSON.stringify({overrides:{'secz.fcf_margin':0.5}})});data=await response.json();assert.equal(data.metrics['secz.required_revenue'].value,100e6);
  response=await fetch(`${base}/api/sensitivity`,{method:'POST',body:JSON.stringify({overrides:{'secz.fcf_margin':2}})});assert.equal(response.status,400);
  response=await fetch(`${base}/api/state?mode=production`);data=await response.json();assert.equal(data.fixture,false);assert.equal(data.metrics['uni.market_cap'].value,null);assert.ok(!data.issues.some(i=>i.severity==='ERROR'));
  assert.equal((await fetch(`${base}/../package.json`)).status,404);
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('research API serves verified production evidence separately from fixtures and refuses writes',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  let response=await fetch(`${base}/api/research`),data=await response.json();
  assert.equal(response.status,200);assert.equal(data.mode,'fixture');assert.deepEqual(data.records,[]);
  response=await fetch(`${base}/api/research?mode=production`);data=await response.json();
  assert.equal(response.status,200);assert.equal(data.records.length,6);assert.equal(data.financial_inputs_updated,false);
  assert.equal(data.records.find(r=>r.kind==='revenue_ttm').records[0].value,null);
  assert.equal(data.records.find(r=>r.kind==='identity').records[1].investability.status,'unverified');
  assert.equal((await fetch(`${base}/api/research?mode=production`,{method:'POST'})).status,405);
  assert.equal((await fetch(`${base}/api/research?mode=missing`)).status,400);
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
