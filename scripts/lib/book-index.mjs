import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readBookContent, root, sharedRoot} from './book-content.mjs';
import {readCollection} from '../../../hackriculture-data/lib/records.mjs';
import {loadApprovedTwoPageGuides} from './approved-two-page-guides.mjs';

export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const normal = s => s.normalize('NFKC').replace(/\u00ad/g, '').replace(/\s+/g, '').toLowerCase();
const json = p => JSON.parse(fs.readFileSync(path.resolve(root, p), 'utf8'));

export function headingPage(texts, heading) {
  const hits = texts.flatMap((text, i) => text.split(/\n\s*\n|\n(?=RECOGNISE(?:\n|$))/).some(block => normal(block) === normal(heading)) ? [i] : []);
  if (hits.length !== 1) throw Error(`Expected one standalone heading for ${heading}; found ${hits.length}`);
  return hits[0];
}

/** References remain structured until display; never compress C/T and numeric folios together. */
export function compactReferences(refs) {
  const groups = new Map();
  for (const ref of refs) {
    const key = ref.prefix || '';
    if (!groups.has(key)) groups.set(key, new Map());
    groups.get(key).set(ref.folio, ref);
  }
  const output = [];
  for (const prefix of [...groups.keys()].sort()) {
    const rows = [...groups.get(prefix).values()].sort((a,b) => a.folio - b.folio);
    for (let i=0; i<rows.length; i++) {
      const first=rows[i]; let last=first;
      while (i+1<rows.length && rows[i+1].folio===last.folio+1) last=rows[++i];
      output.push({label:prefix+first.folio+(last!==first?'–'+prefix+last.folio:''), pdf:first.pdf, page:first.page});
    }
  }
  return output;
}

/** Reads saved, hash-bound source PDFs; no source export or full-book assembly. */
export function resolveIndex({planPath='docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json', topicMapPath}={}) {
  const book=readBookContent();
  const plan=json(planPath), production=json('docs/publication/book-preparation/PRODUCTION-BOOKVAULT.json');
  const expansion=json('../hackriculture-resources/summaries/techniques-expansion/copy.json');
  const topicChecks=json('docs/publication/topic-pages/techniques-expansion/CHECKS.json');
  const topicDom=json('docs/publication/topic-pages/techniques-expansion/DOM-CHECKS.json');
  const cultivationApproval=json('docs/publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json');
  const cultivationDom=json('docs/publication/topic-pages/cultivation-dig-no-dig/DOM-CHECKS.json');
  const troubles=readCollection('troubles',sharedRoot);
  // Later integration supplies ordinary folios keyed by the same stable topic IDs.
  // No editing of index entries or guessed full-book numbering is required.
  const topicMap=topicMapPath?json(topicMapPath):null;
  const inputs={},cache=new Map();
  const approvedGuides=plan.approvedGuides?loadApprovedTwoPageGuides().editions:{};
  const pdfPaths=[...new Set([
    ...Object.values(plan.editions).flatMap(e=>e.documents.map(d=>path.resolve(root,d.pdf))),
    ...topicChecks.results.map(e=>path.resolve(root,e.path)),
    ...cultivationApproval.files.filter(e=>/\/(imperial|metric)\.pdf$/.test(e.path)).map(e=>path.resolve(root,e.path))
  ])];
  const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
  const extracted=JSON.parse(execFileSync(python,['-c','import sys,json; from pypdf import PdfReader; paths=json.load(sys.stdin); print(json.dumps({p:[page.extract_text() for page in PdfReader(p).pages] for p in paths}))'],{input:JSON.stringify(pdfPaths),encoding:'utf8',maxBuffer:30*1024*1024}));
  function readPdf(pdf, expected, count) {
    const absolute=path.resolve(root,pdf), bytes=fs.readFileSync(absolute), sha=hash(bytes);
    if (sha!==expected) throw Error('Source PDF changed: '+pdf);
    inputs[path.relative(root,absolute)]={sha256:sha,pages:count};
    if (!cache.has(sha)) {
      const pages=extracted[absolute];
      if (pages.length!==count) throw Error('PDF page count differs: '+pdf);
      cache.set(sha,pages);
    }
    return cache.get(sha);
  }
  const editions={};
  for (const units of ['imperial','metric']) {
    const registry=new Map();
    for (const d of plan.editions[units].documents) {
      const replacement=approvedGuides[units]?.[d.key];
      const receipt=d.approvedReplacement?replacement:production.results.find(p=>p.id===d.id);
      if (!receipt || receipt.sha256!==d.sha256) throw Error('Production/assembly source mismatch: '+d.id);
      const texts=readPdf(d.pdf,d.sha256,d.physicalPages);
      const dom=d.approvedReplacement?texts:receipt.dom.texts;
      if (dom.length!==texts.length) throw Error('Missing source text: '+d.id);
      registry.set(d.type+':'+d.key,{pdf:d.pdf,texts,dom,start:d.startPage,prefix:''});
    }
    const tc=topicChecks.results.find(x=>x.units===units),td=topicDom.results.find(x=>x.units===units);
    const topicPdf=path.relative(root,path.resolve(root,tc.path));
    const topicText=readPdf(topicPdf,tc.sha256,expansion.pages.length);
    for(const [i,p] of expansion.pages.entries()) {
      if(td.pages[i].id!==p.id) throw Error('Topic copy/DOM order mismatch');
      registry.set('technique:'+p.id,{pdf:topicPdf,texts:[topicText[i]],dom:[td.pages[i].text],start:i+1,sourceOffset:i,prefix:'T'});
    }
    const cf=cultivationApproval.files.find(x=>x.path.endsWith('/'+units+'.pdf'));
    const cultivationText=readPdf(cf.path,cf.sha256,4);
    const cd=cultivationDom.results.find(x=>x.units===units);
    for(const [i,id] of ['overview','no-dig','digging','digging-finish'].entries()) registry.set('cultivation:'+id,{pdf:cf.path,texts:[cultivationText[i]],dom:[cd.pages[i].text],start:i+1,sourceOffset:i,prefix:'C'});
    const resolved=book.data.index.entries.map(entry=>{
      const references=[];
      for(const ref of entry.refs||[]) {
        const source=registry.get(ref.source);
        if(!source) throw Error('Unresolved index source: '+ref.source);
        let offsets=source.texts.map((_,i)=>i),heading;
        if(ref.condition) {
          const key=ref.source.split(':')[1];
          const condition=troubles[key]?.conditions[ref.condition];
          if(!condition) throw Error('Unknown indexed condition: '+ref.condition);
          heading=condition.name; offsets=[headingPage(source.dom,heading)];
        }
        for(const offset of offsets) {
          if(heading && !normal(source.texts[offset]).includes(normal(heading))) throw Error('Heading missing from actual PDF: '+heading);
          const mapped=topicMap?.[units]?.[ref.source];
          if(topicMap && source.prefix && (!Number.isInteger(mapped)||mapped<1)) throw Error('Missing final topic folio: '+ref.source);
          references.push({source:ref.source,...(heading?{condition:ref.condition,heading}:{}),prefix:mapped?'':source.prefix,folio:mapped?mapped+offset:source.start+offset,pdf:source.pdf,page:(source.sourceOffset||0)+offset+1});
        }
      }
      return {...entry,references,displayReferences:compactReferences(references)};
    }).sort((a,b)=>(a.sortAs||a.term).localeCompare(b.sortAs||b.term,'en-GB',{sensitivity:'base',ignorePunctuation:true}));
    editions[units]=resolved;
  }
  const labels=unit=>editions[unit].map(e=>({id:e.id,labels:e.displayReferences.map(r=>r.label)}));
  return {status:'Index proposal; page selection and design await review',sourceRevision:book.revision,copyPath:path.join(sharedRoot,'book-layout/index.json'),copySha256:hash(fs.readFileSync(path.join(sharedRoot,'book-layout/index.json'))),assemblyPlan:{path:planPath,sha256:hash(fs.readFileSync(path.resolve(root,planPath)))},temporaryTopicReferences:!topicMap,identicalEditionReferences:JSON.stringify(labels('imperial'))===JSON.stringify(labels('metric')),heading:book.data.index.heading,introduction:book.data.index.introduction,inputs,editions};
}
