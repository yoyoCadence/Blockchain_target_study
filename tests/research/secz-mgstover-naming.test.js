import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadProject,readYaml} from '../../engine/index.js';
import {readSnapshots,verifySnapshot,compareSnapshots} from '../../engine/snapshots.js';
import {normalizeSecHtml,secExcerptText,secFilingBytes,reviewSecExcerptArchive,verifySecDocument} from '../../engine/research/sec-excerpts.js';

const file='data/research/secz-mgstover-naming-2026-10-13-v1.json',bytes=fs.readFileSync(file),archive=JSON.parse(bytes);
const digest=createHash('sha256').update(bytes).digest('hex'),event=readYaml('data/research/secz-mgstover-naming-2026-10-13.yaml');
const p=loadProject('production'),history=readSnapshots(p.root,p.mode);
const saved=history.find(s=>s.event?.id==='secz-mgstover-naming-20261013'),previous=history[history.indexOf(saved)-1];
const clone=()=>structuredClone(archive),observation=key=>archive.observations.find(o=>o.key===key);

test('the archive is LF, email-free and every excerpt and citation re-verifies offline',()=>{
 assert.ok(!bytes.includes(0x0d));assert.equal(digest,'9641cf34584ec7f95aad3722d223cc0d26cea6309b76ff74baa81fff84bd12bd');
 assert.deepEqual(reviewSecExcerptArchive(archive),{documents:14,excerpts:43,observations:7});
 assert.doesNotMatch(bytes.toString('utf8'),/@[A-Za-z0-9-]+\./);assert.match(archive.request_policy.user_agent,/不保存於公開 repo/);
 for(const d of archive.documents) {
  assert.equal(d.first_retrieval.filing_sha256,d.filing_sha256,d.key);assert.notEqual(d.first_retrieval.response_sha256,d.response_sha256,d.key);
  assert.ok(d.injected_script&&d.filing_byte_length+d.injected_script.byte_length===d.response_byte_length,d.key);
 }
});

test('observations record the four name forms and the new predecessor conflict without resolving legal equivalence',()=>{
 const files=key=>[...new Set(observation(key).excerpt_keys.map(k=>k.slice(0,10)))].sort();
 assert.equal(files('interim-note-llc')[0],'2026-05-20');assert.ok(files('annual-note-inc').includes('2026-01-28'));
 assert.equal(observation('defined-term-llc-co').quote,'MG Stover LLC (“MG Stover” or "MG Stover & Co.")');
 assert.equal(observation('formerly-mg-stover-co').quote,'Securitize Fund Services, LLC, formerly MG Stover & Co');
 assert.deepEqual(files('sfs-defined-as-theorem'),['2025-11-12','2026-01-28']);
 assert.deepEqual(archive.conflicts.map(c=>c.key),['sfs-predecessor','inc-vs-llc']);
 assert.equal(archive.scoped_checks[0].matches,0);assert.ok(archive.limitations.some(x=>x.includes('不是州政府登記')));
});

test('tampered excerpts, citations, hashes or leaked contacts are rejected',()=>{
 const cases=[
  [a=>{a.documents[5].excerpts[0].raw+=' ';},/Excerpt bytes mismatch/],
  [a=>{a.documents[5].excerpts[0].text+='x';},/Excerpt text mismatch/],
  [a=>{a.observations[0].excerpt_keys.push('missing#inc-1');},/unknown excerpt/],
  [a=>{a.observations[3].quote='MG Stover, Inc. converted';},/Quote missing/],
  [a=>{a.documents[0].first_retrieval.filing_sha256='0'.repeat(64);},/Filing changed between retrievals/],
  [a=>{a.purpose+=' contact: someone@example.com';},/email address/],
  [a=>{a.documents.pop();},/Every search hit/],
 ];
 for(const [mutate,error] of cases){const a=clone();mutate(a);assert.throws(()=>reviewSecExcerptArchive(a),error);}
});

test('the delivery-script filter removes exactly one trailing element and re-verification checks offsets',()=>{
 const body='<p>MG&#160;Stover, LLC</p>',script='<script type="text/javascript"  src="/a1/B2"></script>';
 const response=Buffer.from(`<HTML><BODY>${body}${script}</BODY></HTML>`),filing=secFilingBytes(response);
 assert.equal(filing.bytes.toString(),`<HTML><BODY>${body}</BODY></HTML>`);assert.deepEqual(filing.injected,{byte_offset:12+body.length,byte_length:script.length});
 assert.throws(()=>secFilingBytes(Buffer.from(`${script}</BODY>${script}</BODY>`)),/More than one/);
 assert.equal(secFilingBytes(Buffer.from('<BODY>x</BODY>')).injected,null);
 const sha=b=>createHash('sha256').update(b).digest('hex'),raw='MG&#160;Stover, LLC';
 const doc={url:'u',filing_byte_length:filing.bytes.length,filing_sha256:sha(filing.bytes),excerpts:[{key:'k',byte_offset:15,byte_length:raw.length,raw}]};
 assert.equal(verifySecDocument(doc,response),true);
 assert.throws(()=>verifySecDocument(doc,Buffer.from(response.toString().replace('LLC','Inc'))),/Filing changed/);
 assert.equal(secExcerptText(raw),'MG Stover, LLC');
 assert.deepEqual(normalizeSecHtml('a <b>x</b>&amp;&#x201c;\n\n y').text,'a x &“ y');
});

test('the source-only event appends 15 tier 1 SEC sources and changes no financial history',()=>{
 verifySnapshot(saved);assert.equal(saved.id,'2c35927c50a5d42d968d4a52cd24647ab3dcee2123b04da009d918fb7f93342a');assert.equal(saved.parent_id,previous.id);
 assert.deepEqual(saved.event.updates,[]);assert.ok(event.reason.includes(digest));assert.equal(event.type,'acquisition');
 assert.equal(event.sources.length,15);assert.ok(event.sources.every(s=>s.tier===1&&s.fixture===false&&s.url.startsWith('https://')));
 for(const d of archive.documents){const s=event.sources.find(x=>x.id===d.source_id);assert.deepEqual([s.url,s.date,s.retrieved_at],[d.url,d.file_date,d.received_at]);}
 assert.ok(Date.parse(event.research_review.reviewed_at)>=Math.max(...event.sources.map(s=>Date.parse(s.retrieved_at))));
 const diff=compareSnapshots(previous,saved);
 assert.deepEqual([diff.source_change,diff.formula_change,diff.assumption_change,diff.scenario_change,diff.rule_change],[true,false,false,false,false]);
 assert.deepEqual(saved.metrics,previous.metrics);assert.equal(saved.inputs.length,previous.inputs.length);
 for(const r of previous.inputs)assert.deepEqual(saved.inputs.find(x=>x.id===r.id),r,r.id);
 assert.equal(saved.sources.length,previous.sources.length+15);
 assert.equal(Object.values(saved.metrics).filter(m=>m.value===null).length,80);
});
