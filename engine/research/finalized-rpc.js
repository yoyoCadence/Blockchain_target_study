import {isDeepStrictEqual as same} from 'node:util';
import {assert,unique,utcDay} from '../validation/index.js';
import {readRpcBatch} from './fixed-block.js';

// Shared checks for saved finalized-block evidence packets. Every function only
// reads already-saved values; `label` prefixes the error for the calling reader.
const quantity=value=>typeof value==='string'&&/^0x(0|[1-9a-f][0-9a-f]*)$/.test(value);
export const evmAddress=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
// Plain non-negative decimal text exactly as a provider printed it; no sign, exponent or leading zeros.
export const decimalToken=value=>typeof value==='string'&&/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value);
export const RAW_UNI='UNI raw base units';

export function decodeAbiWord(type,word,label) {
 assert(typeof word==='string'&&/^0x[0-9a-f]{64}$/.test(word),`${label} ABI response word mismatch`);
 if(type==='address') {assert(word.slice(2,26)==='0'.repeat(24),`${label} nonzero ABI address padding`);return '0x'+word.slice(26);}
 const integer=BigInt(word);assert(integer<(1n<<BigInt(type.slice(4))),`${label} ABI integer exceeds declared width`);
 return integer.toString();
}

// Restricted research operators only; nothing here is evaluated from YAML text.
export function researchOperators(label) {
 const units=ok=>assert(ok,`${label} formula dependency unit mismatch`);
 const nonNegative=value=>{assert(value>=0n,`${label} subtraction is negative`);return value.toString();};
 return {
  sub_raw_uint256:(f,inputs)=>{
   units(inputs.every(r=>r.unit===RAW_UNI)&&f.unit===RAW_UNI);
   return nonNegative(inputs.slice(1).reduce((sum,r)=>sum-BigInt(r.value),BigInt(inputs[0].value)));
  },
  gte_uint:(f,inputs)=>{
   units(inputs.length===2&&inputs.every(r=>r.unit==='unix seconds')&&f.unit==='ratio');
   return BigInt(inputs[0].value)>=BigInt(inputs[1].value)?1:0;
  },
  mul_div_floor_uint256:(f,inputs)=>{
   units(inputs.length===2&&inputs[0].unit===RAW_UNI&&inputs[1].unit==='percent'&&f.unit===RAW_UNI&&/^[1-9][0-9]*$/.test(f.expression.divisor));
   return (BigInt(inputs[0].value)*BigInt(inputs[1].value)/BigInt(f.expression.divisor)).toString();
  },
  mul_raw_uint256:(f,inputs)=>{
   units(inputs.length===2&&inputs[0].unit==='count'&&inputs[1].unit===RAW_UNI&&f.unit===RAW_UNI);
   return (BigInt(inputs[0].value)*BigInt(inputs[1].value)).toString();
  },
  sub_mul_raw_uint256:(f,inputs)=>{
   units(inputs.length===3&&inputs[0].unit===RAW_UNI&&inputs[1].unit==='count'&&inputs[2].unit===RAW_UNI&&f.unit===RAW_UNI);
   return nonNegative(BigInt(inputs[0].value)-BigInt(inputs[1].value)*BigInt(inputs[2].value));
  },
  casefold_evm_address_eq:(f,inputs)=>{
   units(inputs.length===2&&inputs.every(r=>r.unit==='address'&&evmAddress(r.value))&&f.unit==='ratio');
   return inputs[0].value.toLowerCase()===inputs[1].value.toLowerCase()?1:0;
  },
  // Decimal USD/UNI price x (first raw supply minus the rest) / 10^18, floored to cents.
  mul_decimal_sub_raw18_floor2:(f,inputs)=>{
   units(inputs.length>=2&&inputs[0].unit==='USD/UNI'&&decimalToken(inputs[0].value)&&inputs.slice(1).every(r=>r.unit===RAW_UNI)&&f.unit==='USD');
   const [whole,fraction='']=inputs[0].value.split('.'),supply=inputs.slice(2).reduce((sum,r)=>sum-BigInt(r.value),BigInt(inputs[1].value));
   assert(supply>=0n,`${label} subtraction is negative`);
   const cents=BigInt(whole+fraction)*supply*100n/10n**BigInt(18+fraction.length);
   return `${cents/100n}.${(cents%100n).toString().padStart(2,'0')}`;
  }
 };
}

// Chronology, saved RPC source, mainnet/finalized probe and both anchor rechecks.
export function reviewFinalizedAnchor(project,artifact,method,label) {
 const {anchor,transport}=artifact,day=artifact.as_of_date,now=Date.now();
 const capturedAt=Date.parse(artifact.captured_at),effectiveAt=Date.parse(anchor.effective_at),point={basis:'point',end:utcDay(effectiveAt)};
 assert(capturedAt<=now&&day<=utcDay(now),`${label} evidence cannot be in the future`);
 assert(utcDay(capturedAt)===day&&anchor.as_of_date===day&&effectiveAt<=Date.parse(transport.probe.received_at),`${label} knowledge/anchor chronology mismatch`);
 for(const section of [transport.probe,transport.state]) {
  const received=Date.parse(section.received_at),httpDate=Date.parse(section.http_date);
  assert(section.endpoint===method.endpoint,`${label} RPC endpoint mismatch`);
  assert(Date.parse(section.started_at)<=received&&received<=capturedAt,`${label} RPC transport chronology mismatch`);
  assert(Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,`${label} HTTP Date chronology mismatch`);
 }
 assert(Date.parse(transport.probe.received_at)<=Date.parse(transport.state.started_at)&&capturedAt===Date.parse(transport.state.received_at),`${label} state capture order mismatch`);
 const rpcSource=project.sources.find(s=>s.id===method.rpc_source_id);
 assert(same(anchor.source_ids,[method.rpc_source_id])&&rpcSource&&!rpcSource.fixture&&rpcSource.tier<=2,`Missing primary production ${label} RPC source`);
 assert(rpcSource.date<=day&&Date.parse(rpcSource.retrieved_at)===capturedAt&&new URL(rpcSource.url).href===new URL(method.endpoint).href,`${label} RPC source chronology/endpoint mismatch`);

 const probe=readRpcBatch(transport.probe,2),state=readRpcBatch(transport.state,method.getters.length+2);
 unique(transport.labels);unique(transport.labels,'label');
 const labels=new Map(transport.labels.map(l=>[l.id,l.label])),labeled=name=>r=>labels.get(r.id)===name;
 assert([...probe.requests,...state.requests].every(r=>labels.has(r.id)),`${label} request label mismatch`);
 const chain=probe.requests.find(labeled('chain')),finalized=probe.requests.find(labeled('finalized'));
 assert(chain?.method==='eth_chainId'&&same(chain.params,[])&&finalized?.method==='eth_getBlockByNumber'&&same(finalized.params,['finalized',false]),`Invalid ${label} finalized anchor requests`);
 assert(probe.byId.get(chain.id).result==='0x'+BigInt(method.chain_id).toString(16),`${label} RPC chain mismatch`);
 const header=probe.byId.get(finalized.id).result;
 assert(header&&quantity(header.number)&&quantity(header.timestamp),`Invalid ${label} anchor header quantities`);
 const matches=block=>block&&block.hash===anchor.hash&&block.number===anchor.number_hex&&block.timestamp===anchor.timestamp_hex;
 assert(matches(header)&&BigInt(header.number).toString()===anchor.number&&anchor.selector.blockHash===anchor.hash,`${label} anchor header mismatch`);
 const seconds=BigInt(header.timestamp);
 assert(seconds<=BigInt(Number.MAX_SAFE_INTEGER)&&Number(seconds)*1000===effectiveAt,`${label} block timestamp does not decode`);
 const fixed=state.requests.find(labeled('fixed header')),height=state.requests.find(r=>r.id===anchor.height_recheck_response_id);
 assert(fixed?.method==='eth_getBlockByHash'&&same(fixed.params,[anchor.hash,false])&&matches(state.byId.get(fixed.id).result),`${label} fixed header recheck mismatch`);
 assert(height?.method==='eth_getBlockByNumber'&&same(height.params,[anchor.number_hex,false])&&labels.get(height.id)==='height recheck'&&
  matches(state.byId.get(height.id).result),`${label} canonical height recheck mismatch`);
 return {anchor,day,capturedAt,point,rpcSource,state,labeled,header,seconds,fixed,height};
}

// One labeled eth_call: exactly {to, data}, pinned to the anchor hash with requireCanonical.
export function pinnedCall(state,labeled,key,anchor,to,calldata,label) {
 const request=state.requests.find(labeled(key));
 assert(request?.method==='eth_call'&&request.params.length===2&&same(request.params[1],anchor.selector),`${label} query is not pinned to canonical block hash`);
 assert(same(request.params[0],{to,data:calldata}),`${label} selector/contract/arguments mismatch`);
 return {id:request.id,word:state.byId.get(request.id).result};
}

// A saved GET capture and its saved primary source; returns that source.
export function reviewSavedDocument(project,doc,rule,{capturedAt,day},label) {
 const received=Date.parse(doc.received_at),httpDate=Date.parse(doc.http_date),source=project.sources.find(s=>s.id===rule.source_id);
 assert(doc.url===rule.url&&doc.source_id===rule.source_id,`${label} document endpoint/source mismatch`);
 assert(Date.parse(doc.started_at)<=received&&received<=capturedAt&&utcDay(received)===day&&Number.isFinite(httpDate)&&httpDate<=received&&utcDay(httpDate)===day,`${label} document chronology mismatch`);
 assert(source&&!source.fixture&&source.tier<=2&&source.url===doc.url,`Missing primary ${label} document source`);
 assert(source.date<=day&&Date.parse(source.retrieved_at)===received,`${label} document source chronology mismatch`);
 return source;
}

export function reviewLineExcerpts(doc,lines,label) {
 unique(doc.line_excerpts,'line');
 assert(doc.line_excerpts.length===lines.length&&lines.every(([line,fragment])=>doc.line_excerpts.find(l=>l.line===line)?.text.includes(fragment)),`${label} source line excerpt mismatch`);
}

// Formula definitions must equal the method; values replay through restricted operators.
export function replayResearchFormulas(artifact,method,{anchor,day,point},methodSources,label) {
 const operators=researchOperators(label),records=new Map(artifact.observations.map(o=>[o.id,o])),derived=[];
 for(const expected of method.formulas) {
  const formula=artifact.formulas.find(f=>f.id===expected.id);
  assert(same(formula,expected)&&Object.hasOwn(operators,formula.expression.op),`${label} formula version/definition mismatch`);
  assert(formula.method_source_ids.every(id=>methodSources.some(s=>s.id===id)),`${label} formula method source mismatch`);
  const deps=formula.expression.args,inputs=deps.map(id=>records.get(id));
  assert(new Set(deps).size===deps.length&&inputs.every(Boolean),`${label} formula dependency mismatch`);
  const value=operators[formula.expression.op](formula,inputs),d=artifact.derived.find(r=>r.formula_id===formula.id);
  assert(d&&d.id===`${formula.id}@1-block${anchor.number}`&&d.metric_id===formula.id&&d.formula_version===formula.version&&same(d.dependencies,deps)&&
   d.value===value&&d.unit===formula.unit&&d.as_of_date===day&&same(d.period,point)&&d.observed_at===anchor.effective_at,`${label} derived value/lineage mismatch`);
  // Only formulas the method names as scenario outputs may be SCENARIO, and they must carry its name.
  const scenario=method.scenario_formula_ids?.includes(formula.id)?method.scenario.name:null;
  assert(d.classification===(scenario?'SCENARIO':'DERIVED')&&(scenario?d.scenario_name===scenario:!Object.hasOwn(d,'scenario_name')),`${label} derived classification/scenario mismatch`);
  derived.push({id:d.id,label:method.derived_labels[formula.id],classification:d.classification,...(scenario?{scenario_name:scenario}:{}),confidence:d.confidence,formula_id:formula.id,
   formula_version:formula.version,op:formula.expression.op,dependencies:[...deps],value,unit:formula.unit});
 }
 return derived;
}
