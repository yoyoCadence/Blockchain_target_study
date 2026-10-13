import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {assert} from '../validation/index.js';

// D-20261012-03: Binance public archive (data.binance.vision) as a second-venue cross-check. Archives keep
// the published CHECKSUM text, the zip SHA-256 and exact CSV lines around the reference minute; the full
// zip is re-verifiable with verifyBinanceDailyZip. Quotes are USDT/USDC, never converted to or mixed with USD.
const sha256=b=>createHash('sha256').update(b).digest('hex');
export const BINANCE_COLUMNS=['open_time','open','high','low','close','volume','close_time','quote_volume','trades','taker_base_volume','taker_quote_volume','ignore'];
const DECIMAL=/^(0|[1-9][0-9]*)(\.[0-9]+)?$/;

// Since 2025 the spot archive uses microseconds; earlier files use milliseconds. Detect per value, exactly.
export function binanceTimeMs(value) {
 assert(/^[0-9]+$/.test(value),'Binance time must be an integer');
 const v=BigInt(value);if(v>=10n**15n){return Number(v/1000n);}return Number(v);
}

export function parseBinanceRow(line) {
 const f=line.split(',');assert(f.length===BINANCE_COLUMNS.length,'Binance kline row must have 12 columns');
 const row=Object.fromEntries(BINANCE_COLUMNS.map((k,i)=>[k,f[i]]));
 for(const k of ['open','high','low','close','volume','quote_volume'])assert(DECIMAL.test(row[k]),`Binance ${k} must be a decimal string`);
 const open=binanceTimeMs(row.open_time),close=binanceTimeMs(row.close_time);
 assert(open%60000===0&&close>open&&close<open+60000,'Binance row must be one closed minute');
 return {...row,open_at:new Date(open).toISOString(),end_at:new Date(open+60000).toISOString(),time_unit:BigInt(row.open_time)>=10n**15n?'microseconds':'milliseconds'};
}

// Exact signed difference a-b of two decimal strings, and its basis points relative to b (rounded to 0.01 bp).
export function decimalDifference(a,b) {
 const scale=s=>{const [i,f='']=s.split('.');return {i,f};},A=scale(a),B=scale(b),n=Math.max(A.f.length,B.f.length);
 const big=x=>BigInt(x.i+x.f.padEnd(n,'0')),diff=big(A)-big(B),abs=diff<0n?-diff:diff,unit=10n**BigInt(n);
 const text=`${diff<0n?'-':''}${abs/unit}${n?'.'+(abs%unit).toString().padStart(n,'0'):''}`.replace(/(\.[0-9]*?)0+$/,'$1').replace(/\.$/,'');
 // Round half away from zero on the magnitude; BigInt division alone truncates toward zero.
 const bp100=(abs*1_000_000n*2n+big(B))/(2n*big(B));
 return {difference:text,basis_points:(diff<0n?-1:1)*Number(bp100)/100+0};
}

export function reviewBinanceKlineArchive(archive,canonicalPrice) {
 assert(archive?.version===1&&archive.fixture===false,'Binance archive must be version 1 production evidence');
 assert(canonicalPrice?.metric_id==='uni.price'&&canonicalPrice.unit==='USD'&&canonicalPrice.price_window,'Cross-check needs the canonical windowed USD price');
 const comparisons=[];
 for(const s of archive.symbols) {
  assert(/^[A-Z]+$/.test(s.symbol)&&s.base==='UNI'&&['USDT','USDC'].includes(s.quote)&&s.symbol===s.base+s.quote,'Binance symbol/quote mismatch');
  const name=`${s.symbol}-1m-${archive.day}.zip`;
  assert(s.zip_url===`https://data.binance.vision/data/spot/daily/klines/${s.symbol}/1m/${name}`&&s.checksum_url===s.zip_url+'.CHECKSUM','Binance archive URL mismatch');
  const m=/^([0-9a-f]{64}) [ *]?(\S+)\s*$/.exec(s.checksum_text);
  assert(m&&m[2]===name&&m[1]===s.zip_sha256,'Published CHECKSUM must name this file and equal the zip SHA-256');
  assert(s.rows.length===3&&s.rows.every((r,i)=>i===0||r.row_number===s.rows[i-1].row_number+1),'Keep the reference minute and its neighbours');
  const rows=s.rows.map(r=>{const p=parseBinanceRow(r.line);assert(p.close===r.close&&p.open_at===r.open_at,'Binance row fields mismatch');return p;});
  const ref=rows[1];
  assert(ref.open_at===canonicalPrice.price_window.start&&ref.end_at===canonicalPrice.price_window.end,'Reference minute must equal the canonical price window');
  comparisons.push({symbol:s.symbol,quote:s.quote,binance_close:ref.close,canonical_close_usd:String(canonicalPrice.value),
   ...decimalDifference(ref.close,String(canonicalPrice.value)),units_note:`${s.quote} 與 USD 不同單位；差值只供一致性檢查，不換算、不取代正式價格。`});
 }
 return {canonical_record:canonicalPrice.id,window:canonicalPrice.price_window,comparisons};
}

// Re-check a re-downloaded single-entry daily zip: published hash, entry name and the archived lines.
export function verifyBinanceDailyZip(symbol,zip) {
 assert(sha256(zip)===symbol.zip_sha256,'Binance zip SHA-256 changed');
 assert(zip.readUInt32LE(0)===0x04034b50,'Not a zip local file header');
 const method=zip.readUInt16LE(8),size=zip.readUInt32LE(18),nameLength=zip.readUInt16LE(26),extra=zip.readUInt16LE(28);
 assert((zip.readUInt16LE(6)&8)===0,'Zip data descriptors are not supported');
 const name=zip.subarray(30,30+nameLength).toString(),data=zip.subarray(30+nameLength+extra,30+nameLength+extra+size);
 assert(name===symbol.csv_entry&&[0,8].includes(method),'Unexpected zip entry');
 const lines=(method===8?inflateRawSync(data):data).toString('utf8').split(/\r?\n/);
 for(const r of symbol.rows)assert(lines[r.row_number-1]===r.line,`Archived row ${r.row_number} not found`);
 return true;
}
