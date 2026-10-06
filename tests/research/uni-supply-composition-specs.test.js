import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readYaml} from '../../engine/index.js';
import {validateSchema} from '../../engine/validation/index.js';

const schema=readYaml('spec/uni-supply-composition-schema.yaml'),method=readYaml('spec/uni-supply-composition-method.yaml');
const a=JSON.parse(fs.readFileSync('data/research/uni-supply-composition-2026-10-06-v1.json'));
const checkArchive=value=>validateSchema(schema,value,'UNI supply composition research');
const checkMethod=value=>validateSchema(schema.definitions.method,value,'UNI supply composition method');
const pad=address=>address.slice(2).padStart(64,'0'),record=key=>a.observations.find(o=>o.key===key);

test('schema and method v1 accept the saved archive and pin its identity, endpoint and RPC source',()=>{
 checkArchive(a);checkMethod(method);
 assert.equal(method.version,1);assert.equal(method.archive_id,a.id);assert.equal(method.endpoint,a.transport.state.endpoint);
 assert.equal(method.endpoint,a.transport.probe.endpoint);assert.deepEqual(a.anchor.source_ids,[method.rpc_source_id]);
 assert.equal(method.targets.token,a.token);assert.deepEqual({...method.targets,token:undefined},{...a.addresses,token:undefined});
 assert.deepEqual(method.formulas,a.formulas);
 assert.deepEqual(Object.keys(method.derived_labels).sort(),a.formulas.map(f=>f.id).sort());
 assert.ok(Object.values(method.derived_labels).every(label=>/[一-鿿]/u.test(label)));
});

test('method getters reproduce every saved eth_call, label, ABI type and unit',()=>{
 const requests=JSON.parse(a.transport.state.request_json),labels=new Map(a.transport.labels.map(l=>[l.id,l.label]));
 assert.equal(new Set(method.getters.map(([key])=>key)).size,10);
 for(const [key,type,signature,selector,args,unit,label] of method.getters) {
  const o=record(key),request=requests.find(r=>r.id===o.response_id);
  assert.equal(request.method,'eth_call');assert.equal(request.params[0].to,method.targets.token);
  assert.equal(request.params[0].data,selector+args.map(target=>pad(method.targets[target])).join(''),`${key} calldata`);
  assert.equal(labels.get(o.response_id),key);assert.equal(o.abi_type,type);assert.equal(o.unit,unit);assert.equal(o.label,label);
  assert.match(signature,/^[a-zA-Z]+\((address(,address)?)?\)$/);assert.equal(signature.slice(signature.indexOf('(')+1,-1).split(',').filter(Boolean).length,args.length);
 }
 assert.equal(requests.filter(r=>r.method==='eth_call').length,method.getters.length);
 assert.equal(record('block_timestamp').label,method.header_label);
});

test('method document rules match the saved address excerpts and Uni.sol lines exactly',()=>{
 const [table,code]=a.documents,{address_table:tableRule,source_code:codeRule}=method.documents;
 assert.equal(table.url,tableRule.url);assert.equal(table.source_id,tableRule.source_id);assert.equal(table.date_modified_marker,tableRule.date_modified_marker);
 for(const [label,key,target,chinese] of tableRule.excerpts) {
  const excerpt=table.excerpts.find(e=>e.label===label),o=record(key);
  assert.equal(o.excerpt_label,label);assert.equal(o.label,chinese);assert.deepEqual(o.source_ids,[tableRule.source_id]);
  assert.equal(o.value.toLowerCase(),method.targets[target]);assert.ok(excerpt.html.includes(`<code>${o.value}</code>`));
 }
 assert.equal(code.url,codeRule.url);assert.equal(code.source_id,codeRule.source_id);assert.equal(code.commit,codeRule.commit);assert.ok(code.url.includes(codeRule.commit));
 assert.deepEqual(code.line_excerpts.map(l=>l.line),codeRule.lines.map(([line])=>line));
 for(const [line,fragment] of codeRule.lines)assert.ok(code.line_excerpts.find(l=>l.line===line).text.includes(fragment),`line ${line}`);
});

const archiveMutations=[
 ['fixture promoted',a=>a.fixture=true],
 ['market cap filled',a=>a.context.market_cap='1'],
 ['circulating supply defined',a=>a.context.circulating_supply_definition='total minus treasury'],
 ['non-canonical selector',a=>a.anchor.selector.requireCanonical=false],
 ['latest instead of finalized anchor',a=>a.anchor.selected_tag='latest'],
 ['uppercase token address',a=>a.token=a.token.toUpperCase().replace('0X','0x')],
 ['document body claimed replayable',a=>a.documents[0].body_replayable=true],
 ['documents swapped',a=>a.documents.reverse()],
 ['RPC observation also claims an excerpt',a=>a.observations[1].excerpt_label='UNI Token'],
 ['RPC observation without response word',a=>delete a.observations[1].response_word],
 ['document observation with response id',a=>a.observations.find(o=>o.excerpt_label).response_id=10],
 ['observation dropped',a=>a.observations.pop()],
 ['observation promoted to high confidence',a=>a.observations[0].confidence='high'],
 ['fractional derived value',a=>a.derived[0].value='1.5'],
 ['non-flag derived value',a=>a.derived[2].value=2],
 ['derived formula version bumped',a=>a.derived[0].formula_version=2],
 ['transport label dropped',a=>a.transport.labels.pop()],
 ['unexpected top-level field',a=>a.market_cap=null]];
for(const [label,fn] of archiveMutations)test(`schema rejects archive with ${label}`,()=>{
 const copy=structuredClone(a);fn(copy);assert.throws(()=>checkArchive(copy),/Invalid UNI supply composition research/);
});

const methodMutations=[
 ['wrong method id',m=>m.id='uni-supply-review'],
 ['version bump without new schema',m=>m.version=2],
 ['short selector',m=>m.getters[0][3]='0x18160d'],
 ['unknown argument target',m=>m.getters[2][4]=['treasury']],
 ['unsupported ABI type',m=>m.getters[0][1]='int256'],
 ['getter removed',m=>m.getters.pop()],
 ['malformed date marker',m=>m.documents.address_table.date_modified_marker='2026-04-09'],
 ['short commit',m=>m.documents.source_code.commit='ab22c08'],
 ['excerpt mapped to vesting',m=>m.documents.address_table.excerpts[1][2]='vesting'],
 ['extra method field',m=>m.circulating_supply_definition='total minus treasury']];
for(const [label,fn] of methodMutations)test(`method schema rejects ${label}`,()=>{
 const copy=structuredClone(method);fn(copy);assert.throws(()=>checkMethod(copy),/Invalid UNI supply composition method/);
});
