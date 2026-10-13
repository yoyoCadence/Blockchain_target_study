import {createHash} from 'node:crypto';

// Read-only checks for SEC filing excerpt archives. Full EDGAR documents are too large to commit, so an
// archive keeps each document's SHA-256/length and exact raw-byte excerpts with byte offsets. Offline
// checks prove every excerpt is internally consistent; verifySecDocument re-checks a re-downloaded
// document byte for byte. Normalisation is a fixed text view (sec-html-text-v1), not an HTML parser.

export const SEC_NORMALIZATION='sec-html-text-v1';
const named={amp:'&',nbsp:' ',lt:'<',gt:'>',quot:'"',apos:"'"};
const sha256=value=>createHash('sha256').update(value).digest('hex');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

// Tags become one space, character references are decoded, whitespace (including NBSP) collapses to a
// single space. map[i] is the raw string index that produced text[i].
export function normalizeSecHtml(raw) {
 const out=[],map=[];let last=' ';
 for(let i=0;i<raw.length;) {
  let ch,len;
  if(raw[i]==='<') {const end=raw.indexOf('>',i);len=(end<0?raw.length:end+1)-i;ch=' ';}
  else if(raw[i]==='&') {
   const m=/^&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z]{2,6});/.exec(raw.slice(i,i+12));
   if(m) {len=m[0].length;const e=m[1];ch=e[0]==='#'?String.fromCodePoint(/^#[xX]/.test(e)?parseInt(e.slice(2),16):Number(e.slice(1))):(named[e]??m[0]);}
   else {ch='&';len=1;}
  } else {ch=String.fromCodePoint(raw.codePointAt(i));len=ch.length;}
  if(/\s/.test(ch)) {if(last!==' ') {out.push(' ');map.push(i);last=' ';}}
  else {out.push(ch);for(let k=0;k<ch.length;k++)map.push(i);last=ch;}
  i+=len;
 }
 return {text:out.join(''),map};
}

export const secExcerptText=raw=>normalizeSecHtml(raw).text.trim();

// SEC's delivery layer appends one script element with a per-response random path just before </BODY>,
// so whole-response hashes differ between retrievals of an unchanged filing. The filing digest removes
// exactly that one element (and nothing else); a response without it is used unchanged.
const INJECTED=/<script type="text\/javascript"\s+src="\/[A-Za-z0-9\/_-]+"><\/script>(?=<\/BODY>)/gi;
export function secFilingBytes(bytes) {
 const text=bytes.toString('latin1'),found=[...text.matchAll(INJECTED)];
 assert(found.length<=1,'More than one injected delivery script');
 if(!found.length)return {bytes,injected:null};
 const {index}=found[0],length=found[0][0].length;
 return {bytes:Buffer.concat([bytes.subarray(0,index),bytes.subarray(index+length)]),injected:{byte_offset:index,byte_length:length}};
}

const EMAIL=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

export function reviewSecExcerptArchive(archive) {
 assert(archive?.version===1&&archive.fixture===false,'SEC excerpt archive must be version 1 production evidence');
 assert(archive.normalization===SEC_NORMALIZATION,'Unsupported SEC normalisation');
 assert(!EMAIL.test(JSON.stringify(archive)),'SEC excerpt archive must not contain an email address');
 assert(archive.search?.http_status===200&&sha256(archive.search.response_json)===archive.search.sha256,'Search response hash mismatch');
 const hits=JSON.parse(archive.search.response_json).hits.hits.map(h=>h._id);
 assert(hits.length===archive.documents.length,'Every search hit needs one document');
 const keys=new Set(),sources=new Set();
 for(const doc of archive.documents) {
  assert(hits.includes(`${doc.accession}:${doc.url.split('/').at(-1)}`),`Document is not a search hit: ${doc.url}`);
  assert(doc.url.startsWith('https://www.sec.gov/Archives/edgar/data/')&&doc.http_status===200,`Document must be an EDGAR 200 response: ${doc.url}`);
  assert([doc.filing_sha256,doc.response_sha256,doc.first_retrieval?.filing_sha256].every(h=>/^[a-f0-9]{64}$/.test(h))&&doc.filing_byte_length>0,`Document hashes/length required: ${doc.key}`);
  assert(doc.first_retrieval.filing_sha256===doc.filing_sha256,`Filing changed between retrievals: ${doc.key}`);
  const end=doc.injected_script?doc.injected_script.byte_offset:doc.filing_byte_length;
  assert(!doc.injected_script||doc.filing_byte_length+doc.injected_script.byte_length===doc.response_byte_length,`Injected script length mismatch: ${doc.key}`);
  assert(!sources.has(doc.source_id),`Duplicate source: ${doc.source_id}`);sources.add(doc.source_id);
  let previous=-1;
  for(const x of doc.excerpts) {
   assert(x.key.startsWith(`${doc.key}#`)&&!keys.has(x.key),`Bad excerpt key: ${x.key}`);keys.add(x.key);
   assert(x.byte_offset>previous&&x.byte_offset+x.byte_length<=end,`Excerpt outside document order/bounds: ${x.key}`);previous=x.byte_offset;
   const bytes=Buffer.from(x.raw,'utf8');
   assert(bytes.length===x.byte_length&&sha256(bytes)===x.sha256,`Excerpt bytes mismatch: ${x.key}`);
   assert(secExcerptText(x.raw)===x.text&&x.text.includes(x.match),`Excerpt text mismatch: ${x.key}`);
  }
 }
 for(const o of archive.observations) {
  assert(o.excerpt_keys.length>0&&o.excerpt_keys.every(k=>keys.has(k)),`Observation cites unknown excerpt: ${o.key}`);
  assert(o.excerpt_keys.every(k=>archive.documents.flatMap(d=>d.excerpts).find(x=>x.key===k).text.includes(o.quote)),`Quote missing from cited excerpts: ${o.key}`);
 }
 return {documents:archive.documents.length,excerpts:keys.size,observations:archive.observations.length};
}

// Re-check a re-downloaded response: identical filing bytes and every excerpt at its recorded offset.
export function verifySecDocument(doc,response) {
 const {bytes}=secFilingBytes(response);
 assert(bytes.length===doc.filing_byte_length&&sha256(bytes)===doc.filing_sha256,`Filing changed: ${doc.url}`);
 for(const x of doc.excerpts)assert(bytes.subarray(x.byte_offset,x.byte_offset+x.byte_length).equals(Buffer.from(x.raw,'utf8')),`Excerpt not at offset: ${x.key}`);
 return true;
}
