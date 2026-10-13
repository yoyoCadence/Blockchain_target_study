import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {loadProject,calculate,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {binanceTimeMs,parseBinanceRow,decimalDifference,reviewBinanceKlineArchive,verifyBinanceDailyZip} from '../../engine/research/binance-klines.js';

const file='data/research/binance-uni-klines-2026-10-07-v1.json',bytes=fs.readFileSync(file),archive=JSON.parse(bytes);
const digest=createHash('sha256').update(bytes).digest('hex'),p=loadProject('production');
const price=p.inputs.find(r=>r.id==='uni.price@2-coinbase-candle-20261007'),clone=()=>structuredClone(archive);

test('the archive cross-checks the canonical same-minute close in its own quote units',()=>{
 assert.ok(!bytes.includes(0x0d));assert.equal(digest,'e6ffc5c4490a254fec1f1de73eb1a2b215567efa7af6bc9b1c6238e9f1944079');
 const r=reviewBinanceKlineArchive(archive,price);
 assert.deepEqual(r.comparisons.map(c=>[c.symbol,c.quote,c.binance_close,c.difference,c.basis_points]),[['UNIUSDT','USDT','7.99500000','0.0036',4.5],['UNIUSDC','USDC','7.99400000','0.0026',3.25]]);
 assert.ok(r.comparisons.every(c=>c.canonical_close_usd==='7.9914'&&/不換算/.test(c.units_note)));
 assert.ok(archive.symbols.every(s=>s.time_unit==='microseconds'&&s.csv_rows===1440));
 assert.equal(calculate(p).metrics['uni.price'].value,7.9914);
});

test('mismatched checksum, rows, window or quote units are rejected',()=>{
 const cases=[
  [a=>{a.symbols[0].zip_sha256='0'.repeat(64);},/CHECKSUM/],
  [a=>{a.symbols[0].rows[1].close='7.99600000';},/row fields mismatch/],
  [a=>{a.symbols[0].rows.pop();},/neighbours/],
  [a=>{a.symbols[1].quote='USD';},/symbol\/quote mismatch/],
  [a=>{const r=a.symbols[0].rows;a.symbols[0].rows=[r[0],r[0],r[1]].map((x,i)=>({...x,row_number:i+100}));},/canonical price window/],
 ];
 for(const [mutate,error] of cases){const a=clone();mutate(a);assert.throws(()=>reviewBinanceKlineArchive(a,price),error);}
 assert.throws(()=>reviewBinanceKlineArchive(archive,{...price,price_window:undefined}),/windowed USD price/);
});

test('time units, decimal differences and the zip re-verification are exact',()=>{
 assert.equal(binanceTimeMs('1791370920000000'),binanceTimeMs('1791370920000'));
 assert.throws(()=>parseBinanceRow('1791370920000000,1,1,1,1,1,1791370999999999,1,1,1,1,0'),/one closed minute/);
 assert.deepEqual(decimalDifference('7.9914','7.99500000'),{difference:'-0.0036',basis_points:-4.5});
 assert.deepEqual(decimalDifference('8','8.0'),{difference:'0',basis_points:0});
 const s=archive.symbols[0],csv=Buffer.from(['header-free',...s.rows.map(r=>r.line)].join('\n')),data=deflateRawSync(csv),name=Buffer.from(s.csv_entry);
 const head=Buffer.alloc(30);head.writeUInt32LE(0x04034b50,0);head.writeUInt16LE(8,8);head.writeUInt32LE(data.length,18);head.writeUInt16LE(name.length,26);
 const zip=Buffer.concat([head,name,data]),entry={...s,zip_sha256:createHash('sha256').update(zip).digest('hex'),rows:s.rows.map((r,i)=>({...r,row_number:i+2}))};
 assert.equal(verifyBinanceDailyZip(entry,zip),true);
 assert.throws(()=>verifyBinanceDailyZip({...entry,rows:[{...entry.rows[0],line:'x'}]},zip),/not found/);
 assert.throws(()=>verifyBinanceDailyZip(s,zip),/SHA-256 changed/);
});

test('the source-only event appends two tier 1 exchange sources and changes no financial history',()=>{
 const history=readSnapshots(p.root,p.mode),snap=history.find(s=>s.event?.id==='binance-uni-cross-check-20261013'),prev=history[history.indexOf(snap)-1];
 verifySnapshot(snap);assert.equal(snap.id,'a0003005ac79c33feefaad864ac1bcdec8d56dc428acbb703960d2bacc4a7a76');assert.equal(prev.event?.id,'uni-firepit-state-20261013');
 const event=readYaml('data/research/binance-uni-cross-check-2026-10-13.yaml');assert.ok(event.reason.includes(digest));assert.deepEqual(snap.event.updates,[]);
 assert.deepEqual(event.sources.map(s=>s.url),archive.symbols.map(s=>s.zip_url));assert.ok(event.sources.every(s=>s.tier===1&&!s.covered_metrics.includes('uni.price')));
 const diff=compareSnapshots(prev,snap);assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change],[true,false,false,false]);
 assert.deepEqual(snap.metrics,prev.metrics);
});
