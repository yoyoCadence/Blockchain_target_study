import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewXlmSupply} from '../../engine/research/xlm-supply.js';

const file='data/research/xlm-supply-2026-10-05-v1.json',bytes=fs.readFileSync(file),a=JSON.parse(bytes),p=loadProject('production');
const digest=b=>createHash('sha256').update(b).digest('hex'),inspect=(b,project=p)=>reviewXlmSupply(project,b,digest(b));
const changed=fn=>{const copy=structuredClone(a);fn(copy);return Buffer.from(JSON.stringify(copy));};
const response=(a,fn)=>{const body=JSON.parse(a.captures[0].response_json);fn(body);a.captures[0].response_json=JSON.stringify(body);a.captures[0].body_sha256=digest(a.captures[0].response_json);};
const observation=(a,field)=>a.observations.find(o=>o.field===field);
// Change one reported decimal consistently in the response and the typed record.
const report=(a,field,value)=>{response(a,body=>body[field]=value);const o=observation(a,field);o.value=o.raw_value=value;};
// Move the provider update time consistently through every dependent record.
const retime=(a,value)=>{report(a,'updatedAt',value);a.context.provider_updated_at=value;for(const r of [...a.observations,...a.derived])r.observed_at=value;};

test('XLM supply reader replays exact provider strings, residuals and unknowns without changing files or economics',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),r=inspect(bytes);
 assert.equal(r.sha256,'790c9763971cb01bd8712431ea7207eb4f4418e5a17459cf0df661f1ede5ad51');
 assert.equal(r.persisted,false);assert.equal(r.financial_inputs_updated,false);assert.equal(r.promoted,false);
 assert.deepEqual(r.method,{id:'xlm-supply-review',version:1,source_ids:['stellar-dashboard-supply-20261005-v1','stellar-lumens-docs-20260928-v2','stellar-lumens-docs-20260928-v1']});
 assert.deepEqual(r.full_archive,a);assert.equal(r.summary.observations,9);
 assert.deepEqual(r.summary.values.map(v=>v.value),a.observations.map(o=>o.raw_value));
 assert.ok(r.summary.values.every(v=>typeof v.value==='string'&&v.measurement_basis==='provider_reported'&&v.classification==='OBSERVED'));
 assert.ok(r.summary.values.every(v=>v.observed_at==='2026-10-05T11:14:19.137Z'&&v.received_at==='2026-10-05T11:22:26.166Z'));
 assert.equal(r.summary.values.find(v=>v.field==='totalSupply').value,'50001786839.6994714');
 assert.deepEqual(r.summary.residuals.map(d=>[d.id,d.value,d.formula_version,d.classification]),
  a.derived.map(d=>[d.id,'0.0000000',1,'DERIVED']));
 assert.deepEqual(r.summary.residuals.map(d=>d.dependencies),a.derived.map(d=>d.dependencies));
 assert.equal(r.summary.definition.body_replayable,false);assert.equal(r.summary.definition.last_updated_marker,null);
 assert.equal(r.summary.definition.document_last_updated_date,'2026-09-28');
 assert.deepEqual(Object.keys(r.summary.unknown),['ledger_sequence','ledger_hash','component_account_balances',
  'independently_verified_circulating_supply','fully_diluted_supply','synchronized_market_cap','synchronized_fdv']);
 assert.ok(Object.values(r.summary.unknown).every(v=>v===null));
 assert.ok(r.summary.limitations.some(l=>l.includes('不證明真實供給')));
 r.full_archive.observations[0].value='mutated';assert.deepEqual(fs.readFileSync(file),bytes);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

for(const [label,field,value,index,expected] of [
 ['negative circulating residual','circulatingSupply','35057712273.2161014',1,'-0.0000001'],
 ['positive total residual','inflationLumens','5443902088.3472865',0,'1.0000000'],
 ['shorter exact fraction','feePool','10763671.07406',1,'0.0000001']])
 test(`restricted decimal replay preserves ${label} without judging supply health`,()=>{
  const r=inspect(changed(a=>{report(a,field,value);a.derived[index].value=expected;}));
  assert.equal(r.summary.residuals[index].value,expected);assert.equal(r.summary.residuals[1-index].value,'0.0000000');
  assert.equal(r.summary.unknown.independently_verified_circulating_supply,null);
 });

test('record, residual, formula and source order may change while IDs and meaning remain fixed',()=>{
 const r=inspect(changed(a=>{a.observations.reverse();a.derived.reverse();a.formulas.reverse();a.sources.reverse();}));
 assert.deepEqual(r.summary.residuals.map(d=>d.value),['0.0000000','0.0000000']);
});

const invalid=[
 ['captures swapped',a=>a.captures.reverse(),/Invalid XLM supply research/],
 ['report host changed',a=>a.captures[0].url='https://example.com/api/v2/lumens/',/endpoint\/content type/],
 ['content type changed',a=>a.captures[0].content_type='text/html',/endpoint\/content type/],
 ['body digest rewritten',a=>a.captures[0].body_sha256='0'.repeat(64),/response body digest/],
 ['body edited without digest',a=>a.captures[0].response_json=a.captures[0].response_json.replace('10763671.0740601','10763671.0740602'),/response body digest/],
 ['invalid response JSON',a=>{a.captures[0].response_json='<html>Error</html>';a.captures[0].body_sha256=digest(a.captures[0].response_json);},/Invalid JSON/],
 ['array response',a=>{a.captures[0].response_json='[]';a.captures[0].body_sha256=digest('[]');},/response object/],
 ['undeclared response field',a=>response(a,b=>b.ledger='1'),/response fields/],
 ['dropped details field',a=>response(a,b=>delete b._details),/response fields/],
 ['numeric reported value',a=>response(a,b=>b.feePool=10763671.0740601),/decimal format/],
 ['eight decimal places',a=>report(a,'feePool','10763671.07406010'),/decimal format/],
 ['negative reported value',a=>report(a,'feePool','-10763671.0740601'),/decimal format/],
 ['exponent notation',a=>report(a,'originalSupply','1e11'),/decimal format/],
 ['leading zero',a=>report(a,'feePool','010763671.0740601'),/decimal format/],
 ['observation value differs',a=>observation(a,'feePool').value='10763671.0740602',/raw\/value/],
 ['raw value differs',a=>observation(a,'feePool').raw_value='10763671.0740602',/raw\/value/],
 ['value converted to number',a=>observation(a,'feePool').value=10763671.0740601,/Invalid XLM supply research/],
 ['provider update after receipt',a=>retime(a,'2026-10-05T11:30:00.000Z'),/provider update chronology/],
 ['provider update on previous day',a=>retime(a,'2026-10-04T23:59:59.000Z'),/provider update chronology/],
 ['provider update not canonical',a=>retime(a,'2026-10-05T11:14:19.137+00:00'),/provider update chronology/],
 ['context update time changed',a=>a.context.provider_updated_at='2026-10-05T11:00:00.000Z',/context timestamp/],
 ['context receipt borrowed',a=>a.context.received_at=a.captures[1].received_at,/context timestamp/],
 ['observed time replaced by receipt',a=>observation(a,'totalSupply').observed_at=a.captures[0].received_at,/identity\/source\/date\/unit/],
 ['receipt borrowed from document',a=>observation(a,'totalSupply').response_received_at=a.captures[1].received_at,/identity\/source\/date\/unit/],
 ['point date backdated',a=>observation(a,'totalSupply').period.end='2026-10-04',/identity\/source\/date\/unit/],
 ['wrong unit',a=>observation(a,'feePool').unit='UTC instant',/identity\/source\/date\/unit/],
 ['document cited as report source',a=>observation(a,'feePool').source_ids=[a.sources[1].id],/identity\/source\/date\/unit/],
 ['metric ID rewritten',a=>observation(a,'feePool').metric_id='xlm.circulating_supply',/identity\/source\/date\/unit/],
 ['duplicate observation',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['missing observation',a=>a.observations.pop(),/Invalid XLM supply research/],
 ['provider report promoted',a=>a.observations[0].measurement_basis='independently_verified',/Invalid XLM supply research/],
 ['confidence promoted',a=>a.observations[0].confidence='high',/Invalid XLM supply research/],
 ['fixture promoted',a=>a.fixture=true,/Invalid XLM supply research/],
 ['capture begins after receipt',a=>a.captures[0].started_at='2026-10-05T11:30:00.000Z',/transport chronology/],
 ['capture in future',a=>a.captures[1].received_at='2099-01-01T00:00:00.000Z',/transport chronology/],
 ['invalid HTTP date',a=>a.captures[0].http_date='invalid',/HTTP Date/],
 ['HTTP Date after receipt',a=>a.captures[1].http_date='Mon, 05 Oct 2026 12:00:00 GMT',/HTTP Date/],
 ['future knowledge day',a=>a.as_of_date='2099-01-01',/knowledge cannot be future/],
 ['document body replay invented',a=>a.captures[1].response_json='<html></html>',/Invalid XLM supply research/],
 ['document marker invented',a=>a.captures[1].last_updated_marker='2026-09-28',/Invalid XLM supply research/],
 ['embedded source refreshed',a=>a.sources[0].retrieved_at='2026-10-05T11:30:00.000Z',/embedded\/saved source/],
 ['embedded source tier rewritten',a=>a.sources[1].tier=1,/embedded\/saved source/],
 ['duplicate source',a=>a.sources[1].id=a.sources[0].id,/Duplicate/],
 ['document date rewritten',a=>a.context.document_last_updated_date='2026-10-01',/definition source\/date/],
 ['formula operator rewritten',a=>a.formulas[0].expression.op='eval',/formula version/],
 ['formula sign flipped',a=>a.formulas[1].expression.args[4].sign=1,/formula version/],
 ['formula decimals changed',a=>a.formulas[0].decimals=8,/formula version/],
 ['formula rationale reused',a=>a.formulas[1].rationale='Different scope under same version',/formula version/],
 ['formula method source omitted',a=>a.formulas[0].method_source_ids=[],/formula version/],
 ['derived value fabricated',a=>a.derived[0].value='1.0000000',/derived residual/],
 ['derived value numeric',a=>a.derived[0].value=0,/Invalid XLM supply research/],
 ['dependency reordered',a=>a.derived[1].dependencies.reverse(),/derived residual/],
 ['dependency omitted',a=>a.derived[0].dependencies.pop(),/derived residual/],
 ['derived time moved to receipt',a=>a.derived[0].observed_at=a.captures[0].received_at,/derived residual/],
 ['derived formula duplicated',a=>a.derived[1].formula_id=a.derived[0].formula_id,/derived residual/],
 ['synchronized market cap filled',a=>a.context.synchronized_market_cap=1,/Invalid XLM supply research/],
 ['independent circulating supply filled',a=>a.context.independently_verified_circulating_supply='35057712273.2161013',/Invalid XLM supply research/],
 ['ledger sequence invented',a=>a.context.ledger_sequence=1,/Invalid XLM supply research/],
 ['archive identity changed',a=>a.id='xlm-reported-supply-20261005-v2',/method\/archive version/]
];
for(const [label,fn,pattern] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(fn)),pattern));

// Same edit in the saved project and the embedded archive isolates each source rule.
for(const [label,index,fn,pattern] of [
 ['report source tier',0,s=>s.tier=3,/primary/],
 ['document source version',1,s=>s.version=3,/primary/],
 ['document supersession removed',1,s=>delete s.supersedes,/primary/],
 ['report retrieval shifted',0,s=>s.retrieved_at='2026-10-05T11:22:27.000Z',/source chronology/],
 ['document published after knowledge',1,s=>s.date='2026-10-06',/source chronology/],
 ['report coverage removed',0,s=>s.covered_metrics=s.covered_metrics.filter(m=>m!=='research.xlm.supply.feePool'),/identity\/source\/date\/unit/],
 ['definition coverage removed',1,s=>s.covered_metrics=['XLM.identity'],/definition source\/date/]])
 test(`XLM supply reader rejects saved and embedded ${label}`,()=>{
  const project=structuredClone(p);fn(project.sources.find(s=>s.id===a.sources[index].id));
  assert.throws(()=>inspect(changed(a=>fn(a.sources[index])),project),pattern);
 });

test('XLM supply reader rejects a missing or rewritten superseded definition source',()=>{
 const missing=structuredClone(p);missing.sources=missing.sources.filter(s=>s.id!=='stellar-lumens-docs-20260928-v1');
 assert.throws(()=>inspect(bytes,missing),/superseded definition source/);
 const moved=structuredClone(p);moved.sources.find(s=>s.id==='stellar-lumens-docs-20260928-v1').url='https://example.com/lumens';
 assert.throws(()=>inspect(bytes,moved),/superseded definition source/);
 const unsaved=structuredClone(p);unsaved.sources=unsaved.sources.filter(s=>s.id!==a.sources[0].id);
 assert.throws(()=>inspect(bytes,unsaved),/embedded\/saved source/);
});

test('manual CLI requires production and digest; failures have no stdout or file/history writes',()=>{
 const before=fingerprint(readSnapshots(p.root,p.mode)),run=(...args)=>spawnSync(process.execPath,['cli.js','xlm-supply-review',...args],{encoding:'utf8'});
 const good=run(file,'--production','--digest',digest(bytes));assert.equal(good.status,0,good.stderr);
 const out=JSON.parse(good.stdout);assert.equal(out.summary.observations,9);assert.equal(out.summary.residuals[1].value,'0.0000000');
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)],['--production','--digest',digest(bytes)]]){
  const r=run(...args);assert.equal(r.status,1);assert.equal(r.stdout,'');
 }
 assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});

test('reader rejects fixture and object inputs before issuing research conclusions',()=>{
 assert.throws(()=>reviewXlmSupply(loadProject('fixture'),bytes,digest(bytes)),/requires production/);
 assert.throws(()=>reviewXlmSupply(p,a,digest(bytes)),/raw JSON bytes/);
 assert.throws(()=>reviewXlmSupply(p,bytes,'790c9763'),/reviewed SHA-256/);
});
