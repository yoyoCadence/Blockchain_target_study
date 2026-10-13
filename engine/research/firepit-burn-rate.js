import {reviewUniFirepitState} from './firepit-state.js';
import {assert} from '../validation/index.js';

// D-20261012-02: research-layer SCENARIO "recent rate" between two digest-reviewed Firepit captures.
// Annualised burn = releases in window x threshold x seconds-per-year / window seconds (BigInt, floor).
// Both endpoints are our own finalized reads, so no archive history is needed; the threshold must be
// identical at both ends. Not a canonical input, fee revenue, USD value or forecast.
export const FIREPIT_BURN_SCENARIO='firepit_recent_rate';
const YEAR_SECONDS=31_557_600n,DAY_SECONDS=86_400n,SHORT_WINDOW_DAYS=30n,UNIT=10n**18n;

const decimal=raw=>{const s=raw<0n?'-':'',v=raw<0n?-raw:raw,frac=(v%UNIT).toString().padStart(18,'0').replace(/0+$/,'');return `${s}${v/UNIT}${frac?'.'+frac:''}`;};

export function firepitBurnRateScenario(project,start,end) {
 const a=reviewUniFirepitState(project,start.bytes,start.digest,start.methodFile),b=reviewUniFirepitState(project,end.bytes,end.digest,end.methodFile);
 const value=(r,key)=>r.summary.values.find(v=>v.key===key).value;
 for(const key of ['threshold','resource','resource_recipient','token_jar','threshold_setter'])
  assert(value(a,key)===value(b,key),`Firepit ${key} differs between endpoints; recent-rate scenario not computed`);
 const t0=BigInt(value(a,'block_timestamp')),t1=BigInt(value(b,'block_timestamp')),n0=BigInt(value(a,'nonce')),n1=BigInt(value(b,'nonce'));
 assert(BigInt(b.summary.block_number)>BigInt(a.summary.block_number)&&t1>t0&&n1>=n0,'Firepit endpoints must move forward');
 const threshold=BigInt(value(a,'threshold')),releases=n1-n0,burned=releases*threshold,window=t1-t0,annual=burned*YEAR_SECONDS/window;
 const deadDelta=BigInt(value(b,'dead_sink_balance'))-BigInt(value(a,'dead_sink_balance'));
 return {classification:'SCENARIO',scenario:FIREPIT_BURN_SCENARIO,decision:'D-20261012-02',short_window:window<SHORT_WINDOW_DAYS*DAY_SECONDS,
  endpoints:[a,b].map(r=>({archive_id:r.archive_id,sha256:r.sha256,block_number:r.summary.block_number,block_time:r.summary.block_time,nonce:value(r,'nonce')})),
  threshold_raw:threshold.toString(),releases:releases.toString(),window_seconds:window.toString(),burned_raw:burned.toString(),burned_uni:decimal(burned),
  annualized_raw:annual.toString(),annualized_uni:decimal(annual),unit:'UNI/year',
  context:{dead_balance_delta_raw:deadDelta.toString(),dead_balance_delta_uni:decimal(deadDelta),not_from_mainnet_firepit_uni:decimal(deadDelta-burned)},
  limitations:['只計主網 Firepit；dead 餘額同期增加的其他部分不歸因。','兩端門檻相同，但期間內若曾短暫改變又改回仍無法排除。','窗口短於 30 天時年化會放大雜訊；不是預測、不是手續費收入、未換算 USD。']};
}
