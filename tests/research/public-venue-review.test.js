import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject,calculate} from '../../engine/index.js';
import {fingerprint,readSnapshots} from '../../engine/snapshots.js';
import {reviewPublicVenue} from '../../engine/research/public-venue.js';

const file='data/research/uni-xlm-public-venue-2026-10-05-v1.json',bytes=fs.readFileSync(file),a=JSON.parse(bytes),p=loadProject('production');
const digest=b=>createHash('sha256').update(b).digest('hex'),inspect=b=>reviewPublicVenue(p,b,digest(b));
const changed=fn=>{const copy=structuredClone(a);fn(copy);return Buffer.from(JSON.stringify(copy));};
const transport=a=>{a.transport_archive_sha256=digest(Buffer.from(JSON.stringify(a.captures.map(({source_id,...capture})=>capture),null,2)+'\n'));};
const response=(a,index,fn)=>{const body=JSON.parse(a.captures[index].response_json);fn(body);a.captures[index].response_json=JSON.stringify(body);transport(a);};
const observation=(a,asset,field)=>a.observations.find(o=>o.asset===asset&&o.field===field);

test('public-venue reader returns exact typed fields, null access and embedded lineage without changing files or economics',()=>{
 const before=fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),r=inspect(bytes);
 assert.equal(r.sha256,'116eca762bb31dbbe9a30a26539e88df98a5a98503e6e489df7ae795e36ce03c');
 assert.equal(r.persisted,false);assert.equal(r.financial_inputs_updated,false);assert.equal(r.promoted,false);assert.equal(r.method.version,1);
 assert.equal(r.summary.values.length,26);assert.deepEqual(r.full_archive,a);assert.deepEqual(r.summary.address_match,a.derived[0]);
 assert.deepEqual(r.summary.identity_dependencies,a.identity_dependency.records);assert.deepEqual(r.summary.access_review,a.access_review);
 assert.ok(r.summary.values.filter(v=>v.field==='trading_disabled').every(v=>v.value===false&&typeof v.value==='boolean'));
 const unknown=r.summary.values.find(v=>v.asset==='XLM'&&v.field==='network.contract_address');
 assert.equal(unknown.value,null);assert.equal(unknown.raw_value,'');assert.equal(unknown.confidence,'unknown');
 assert.equal(new Set(r.summary.values.map(v=>v.received_at)).size,4);assert.ok(r.summary.values.every(v=>v.provider_state_timestamp===null));
 r.full_archive.observations[0].value='mutated';assert.deepEqual(fs.readFileSync(file),bytes);
 assert.equal(fingerprint({p,economics:calculate(p),history:readSnapshots(p.root,p.mode)}),before);
});

test('offline status and true boolean flags remain observations without clearing personal access',()=>{
 const b=changed(a=>{response(a,2,r=>{r.status='offline';r.trading_disabled=true;});for(const [field,value] of [['status','offline'],['trading_disabled',true]]){
  const o=a.observations.find(o=>o.asset==='UNI'&&o.source_ids[0]===a.captures[2].source_id&&o.field===field);o.value=o.raw_value=value;
 }});const r=inspect(b);
 assert.ok(r.summary.values.some(v=>v.kind==='product'&&v.value==='offline'));assert.equal(r.summary.access_review.account_trading_access,null);
});

for(const [label,address,expected] of [['case differs','0x1F9840A85D5AF5BF1D1762F925BDADDC4201F984',1],['reported address differs','0x'+'1'.repeat(40),0],['reported address missing','',null]])
 test(`restricted comparison preserves ${label} without treating platform identity as custody`,()=>{
  const b=changed(a=>{response(a,0,r=>r.supported_networks[0].contract_address=address);
   const o=observation(a,'UNI','network.contract_address');o.raw_value=address;o.value=address||null;o.confidence=address?'medium':'unknown';
   a.derived[0].value=expected;a.derived[0].confidence=expected===null?'unknown':'medium';});
  const r=inspect(b);assert.equal(r.summary.address_match.value,expected);assert.equal(r.summary.access_review.custody_review,null);
 });

test('capture/observation/dependency order may change while individual metadata and meaning remain fixed',()=>{
 const b=changed(a=>{a.observations.reverse();a.captures.reverse();a.identity_dependency.records.reverse();a.identity_dependency.sources.reverse();transport(a);});
 assert.equal(inspect(b).summary.address_match.value,1);
});

const invalid=[
 ['duplicate endpoint',a=>a.captures[1].url=a.captures[0].url,/Duplicate/],
 ['duplicate source',a=>a.captures[1].source_id=a.captures[0].source_id,/Duplicate/],
 ['wrong host',a=>{a.captures[0].url='https://example.com/currencies/UNI';transport(a);},/endpoint\/source/],
 ['wrong source binding',a=>a.captures[0].source_id=a.captures[2].source_id+'-wrong',/endpoint\/source/],
 ['modified transport hash',a=>a.transport_archive_sha256='0'.repeat(64),/transport archive digest/],
 ['invalid response JSON',a=>{a.captures[0].response_json='<html>Error</html>';transport(a);},/Invalid JSON/],
 ['null response',a=>{a.captures[0].response_json='null';transport(a);},/response object/],
 ['reversed currency',a=>response(a,0,r=>r.id='XLM'),/currency\/network/],
 ['wrong product base',a=>response(a,2,r=>r.base_currency='XLM'),/product identity/],
 ['wrong quote currency',a=>response(a,3,r=>r.quote_currency='EUR'),/product identity/],
 ['wrong product ID',a=>response(a,3,r=>r.id='UNI-USD'),/product identity/],
 ['missing default network',a=>response(a,0,r=>r.supported_networks=[]),/default network/],
 ['duplicate network',a=>response(a,0,r=>r.supported_networks.push(r.supported_networks[0])),/Duplicate/],
 ['string false',a=>response(a,2,r=>r.trading_disabled='false'),/raw field type/],
 ['blank status',a=>response(a,0,r=>r.status=''),/raw field type/],
 ['wrong typed observation',a=>observation(a,'UNI','trading_disabled').value=0,/Invalid public-venue research/],
 ['raw mismatch',a=>observation(a,'UNI','status').raw_value='offline',/raw\/value/],
 ['XLM empty promoted to native',a=>observation(a,'XLM','network.contract_address').value='native',/raw\/value/],
 ['unknown confidence promoted',a=>observation(a,'XLM','network.contract_address').confidence='medium',/raw\/value/],
 ['numeric empty substituted',a=>observation(a,'XLM','network.contract_address').value=0,/Invalid public-venue research/],
 ['wrong unit',a=>observation(a,'UNI','trading_disabled').unit='text',/identity\/source\/date\/unit/],
 ['wrong record source',a=>observation(a,'UNI','id').source_ids=[a.captures[1].source_id],/identity\/source\/date\/unit/],
 ['duplicate observation',a=>a.observations[1].id=a.observations[0].id,/Duplicate/],
 ['missing observation',a=>a.observations.pop(),/Invalid public-venue research/],
 ['provider state time invented',a=>a.observations[0].provider_state_timestamp=a.captures[0].received_at,/Invalid public-venue research/],
 ['received time borrowed',a=>a.observations[0].response_received_at=a.captures[1].received_at,/identity\/source\/date\/unit/],
 ['point date backdated',a=>a.observations[0].period.end='2026-10-04',/identity\/source\/date\/unit/],
 ['capture begins after response',a=>{a.captures[0].started_at='2026-10-05T01:00:00Z';transport(a);},/transport chronology/],
 ['capture in future',a=>{a.captures[0].received_at='2099-01-01T00:00:00Z';transport(a);},/transport chronology/],
 ['invalid HTTP date',a=>{a.captures[0].http_date='invalid';transport(a);},/HTTP Date/],
 ['future HTTP date',a=>{a.captures[0].http_date='Mon, 05 Oct 2026 01:00:00 GMT';transport(a);},/HTTP Date/],
 ['future knowledge day',a=>a.as_of_date='2099-01-01',/knowledge/],
 ['identity traversal',a=>a.identity_dependency.file='../core-identifiers-2026-10-03.yaml',/Invalid public-venue research/],
 ['identity fingerprint rewritten',a=>a.identity_dependency.dossier_fingerprint='0'.repeat(64),/identity dependency/],
 ['identity record rewritten',a=>a.identity_dependency.records[0].identifier.contract_address='0x'+'1'.repeat(40),/embedded identity\/source/],
 ['identity source refreshed',a=>a.identity_dependency.sources[0].retrieved_at=a.captures[0].received_at,/embedded identity\/source/],
 ['formula operator rewritten',a=>a.formulas[0].expression.op='eval',/formula version/],
 ['formula field rewritten',a=>a.formulas[0].expression.args[1].field='constructor',/formula version/],
 ['formula rationale reused',a=>a.formulas[0].rationale='Different scope under same version',/formula version/],
 ['derived value fabricated',a=>a.derived[0].value=0,/derived comparison/],
 ['dependency omitted',a=>a.derived[0].dependencies.pop(),/Invalid public-venue research/],
 ['dependency reordered',a=>a.derived[0].dependencies.reverse(),/derived comparison/],
 ['personal trading cleared',a=>a.access_review.account_trading_access=true,/Invalid public-venue research/],
 ['fixture promoted',a=>a.fixture=true,/Invalid public-venue research/]
];
for(const [label,fn,pattern] of invalid)test(`matching digest still rejects ${label}`,()=>assert.throws(()=>inspect(changed(fn)),pattern));

for(const [field,value,pattern] of [['tier',5,/primary/],['version',1,/primary/],['retrieved_at','2026-10-05T00:08:00Z',/source chronology/],['supersedes',undefined,/primary/]])
 test(`public-venue reader rejects changed product source ${field}`,()=>{
  const project=structuredClone(p);project.sources.find(s=>s.id===a.captures[2].source_id)[field]=value;
  assert.throws(()=>reviewPublicVenue(project,bytes,digest(bytes)),pattern);
 });

test('manual CLI requires production and digest; failures have no stdout or file/history writes',()=>{
 const before=fingerprint(readSnapshots(p.root,p.mode)),run=(...args)=>spawnSync(process.execPath,['cli.js','public-venue-review',...args],{encoding:'utf8'});
 const good=run(file,'--production','--digest',digest(bytes));assert.equal(good.status,0,good.stderr);assert.equal(JSON.parse(good.stdout).summary.observations,26);
 for(const args of [[file],[file,'--production'],[file,'--production','--digest','0'.repeat(64)]]){const r=run(...args);assert.equal(r.status,1);assert.equal(r.stdout,'');}
 assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(fingerprint(readSnapshots(p.root,p.mode)),before);
});

test('reader rejects fixture and object inputs before issuing research conclusions',()=>{
 assert.throws(()=>reviewPublicVenue(loadProject('fixture'),bytes,digest(bytes)),/requires production/);
 assert.throws(()=>reviewPublicVenue(p,a,digest(bytes)),/raw JSON bytes/);
});
