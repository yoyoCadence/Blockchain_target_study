import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {loadProject,readYaml,calculate} from '../../engine/index.js';
import {readSnapshots,fingerprint} from '../../engine/snapshots.js';
import {reviewIdentities} from '../../engine/research/identities.js';

const project=loadProject('production');
const original=readYaml('data/research/core-identifiers-2026-10-03.yaml');
test('core identity dossier separates token, listed parent stock and native asset without promoting them',()=>{
 const before=fingerprint(project),history=fingerprint(readSnapshots(project.root,'production')),economics=fingerprint(calculate(project));
 const result=reviewIdentities(project,original);
 assert.equal(result.persisted,false);assert.equal(result.promoted,false);
 assert.deepEqual(result.identities.map(r=>r.identifier.kind),['erc20','common_stock','native_asset']);
 const secz=result.identities.find(r=>r.asset==='SECZ');
 assert.equal(secz.identifier.exchange,'NYSE');assert.equal(secz.identifier.cik,'0002094496');
 assert.ok(secz.sources.some(s=>s.tier===1&&s.date==='2026-08-13'));
 assert.ok(result.identities.every(r=>r.investability.status==='unverified'&&r.investability.investor_eligibility===null&&r.investability.custody_review===null));
 assert.equal(fingerprint(project),before);assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
 assert.equal(fingerprint(calculate(project)),economics);
});

for(const [name,edit,pattern] of [
 ['fixture evidence',d=>{d.sources[0].fixture=true;},/Fixture source/],
 ['missing source',d=>{d.identities[0].source_ids=['absent'];},/Missing identity source/],
 ['tier 5 alone',d=>{d.sources[0].tier=5;},/primary source/],
 ['wrong coverage',d=>{d.sources[0].covered_metrics=['uni.price'];},/does not cover identity/],
 ['publication after as-of',d=>{d.identities[2].as_of_date='2026-09-01';},/published after as-of/],
 ['retrieval after review',d=>{d.sources[0].retrieved_at='2099-01-01T00:00:00Z';},/retrieved after review/],
 ['future review',d=>{d.review.reviewed_at='2099-01-01T00:00:00Z';},/cannot be in the future/],
 ['identity after dossier',d=>{d.identities[0].as_of_date='2026-10-04';},/after dossier as-of/],
 ['source after retrieval',d=>{d.sources[0].date='2099-01-01';},/published after retrieval/],
 ['invented native contract',d=>{d.identities[2].identifier.contract_address='0x'+'1'.repeat(40);},/Native identity/],
 ['wrong UNI address format',d=>{d.identities[0].identifier.contract_address='UNI';},/ERC-20 requires/],
 ['missing SEC CIK',d=>{d.identities[1].identifier.cik=null;},/ten-digit CIK/],
 ['stock confused with tokenized wrapper',d=>{d.identities[1].identifier.network='Solana';},/separate review/],
 ['investment approval',d=>{d.identities[1].investability.status='investable';},/Invalid identity dossier/],
 ['unknown symbol',d=>{d.identities[0].asset='absent';},/Unknown identity asset/],
 ['duplicate identity',d=>{d.identities.push(structuredClone(d.identities[0]));},/Duplicate/]
]) test(`identity dossier rejects ${name}`,()=>{
 const dossier=structuredClone(original);edit(dossier);
 assert.throws(()=>reviewIdentities(project,dossier),pattern);
});

test('identity-review CLI requires production and does not append a financial journal',()=>{
 const history=fingerprint(readSnapshots(project.root,'production'));
 const run=(...args)=>spawnSync(process.execPath,['cli.js','identity-review','data/research/core-identifiers-2026-10-03.yaml',...args],{cwd:project.root,encoding:'utf8'});
 const wrong=run();assert.equal(wrong.status,1);assert.match(wrong.stderr,/require --production/);
 const reviewed=run('--production');assert.equal(reviewed.status,0,reviewed.stderr);
 assert.equal(JSON.parse(reviewed.stdout).identities.length,3);
 assert.equal(fingerprint(readSnapshots(project.root,'production')),history);
});
