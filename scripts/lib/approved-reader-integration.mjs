import fs from 'node:fs';
import path from 'node:path';
import {root, sha256} from './book-content.mjs';

const json=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
export const sectionReceipt='docs/publication/techniques-sequence/APPROVAL-2026-10-18.json';
export const sectionPdf='docs/publication/techniques-sequence/references/approved-2026-10-18/growing-techniques.pdf';
export const readerReceipt='docs/publication/reader-edit-pass/APPROVAL-2026-10-16.json';
export const approvedTopicOrder=[
 ['technique:organic',146],['technique:nutrient-cycles',147],['technique:rotation',148,2],
 ['technique:plot-location',151],['technique:plot-layout',152],['technique:plot-layout-branching',153],
 ['technique:compost-bins',154],['technique:compost-use',155],
 ['cultivation:overview',156],['cultivation:no-dig',157],['cultivation:digging',158],['cultivation:digging-finish',159],
 ['technique:sowing',160],['technique:watering',161],['technique:greenhouse-choose',163],
 ['technique:greenhouse-beds',164],['technique:greenhouse-no-dig-seasons',165]
];
// Saved 18 October sources keep their folios; the current section omits its two blanks.
export const currentTopicOrder=approvedTopicOrder.map(([id,folio,count=1])=>[id,folio-(folio>150?1:0)-(folio>162?1:0),count]);
function verify(pdf,expected){const hash=sha256(fs.readFileSync(path.resolve(root,pdf)));if(hash!==expected)throw Error('Approved input changed: '+pdf);return hash;}
export function loadReaderGuides(){
 const approval=json(readerReceipt),file='docs/publication/reader-edit-pass/guides/MANIFEST.json';
 verify(file,approval.proofEvidence['guides/MANIFEST.json']);
 const result={imperial:{},metric:{}};
 for(const r of json(file).checks){verify(r.cleanPdf,r.cleanSha256);result[r.unit][r.key]={pdf:r.cleanPdf,sha256:r.cleanSha256,physicalPages:r.pages.length,approvedFolios:r.pages.map(p=>p.folio),receipt:readerReceipt};}
 return result;
}
export function applyApprovedTopics(sources){
 const receipt=json(sectionReceipt);for(const f of receipt.files)verify(f.path,f.sha256);
 const hash=receipt.files.find(f=>f.path===sectionPdf)?.sha256;if(!hash)throw Error('Missing accepted section');
 for(const [id,folio,count=1] of approvedTopicOrder)sources.imperial[id]={pdf:sectionPdf,sha256:hash,sourcePage:folio-144,physicalPages:count,sourcePdfPages:21};
 const rp='docs/publication/topic-pages/crop-rotation-planning/references/approved-2026-10-18/crop-rotation-planning-metric.pdf';
 const rh=verify(rp,'c7cba0f3dd0999ee1643fe51b187ff672fe0cc5fabc8fe9c415e54b39023eb01');
 sources.metric['technique:rotation']={pdf:rp,sha256:rh,sourcePage:1,physicalPages:2,sourcePdfPages:2};
 // The nutrient page contains the approved dual-unit depth; no separate metric reflow.
 sources.metric['technique:nutrient-cycles']={...sources.imperial['technique:nutrient-cycles']};
 const tp='output/pdf/reader-edit-pass/techniques/techniques-metric-clean.pdf';
 const th=verify(tp,'6acfaf301badc377baa57553b7bfd9680414a9e43e45dc3178a547ebb63082be');
 for(const [id,page] of [['compost-bins',1],['compost-use',2],['sowing',4],['greenhouse-beds',5],['greenhouse-no-dig-seasons',6]])sources.metric['technique:'+id]={pdf:tp,sha256:th,sourcePage:page,physicalPages:1,sourcePdfPages:6};
 // Later author-requested copy lives in separate, source-checked working proofs.
 const editsPath='docs/publication/final-text-edits/MANIFEST.json';
 if(fs.existsSync(path.resolve(root,editsPath))){
  const edits=json(editsPath);
  for(const [p,h] of Object.entries(edits.inputs))verify(p,h);
  for(const edit of edits.edits){
   const placement=approvedTopicOrder.find(([id])=>id===edit.source);
   if(!placement||placement[1]!==edit.folio)throw Error('Final edit placement changed: '+edit.source);
   for(const proof of edit.proofs){
    verify(proof.pdf,proof.sha256);verify(proof.html,proof.htmlSha256);
    if(proof.physicalPages!==(placement[2]||1))throw Error('Final edit changed pagination: '+edit.source);
    sources[proof.units][edit.source]={pdf:proof.pdf,sha256:proof.sha256,sourcePage:proof.sourcePage,physicalPages:proof.physicalPages,sourcePdfPages:proof.sourcePdfPages,finalCopyEdit:editsPath};
   }
  }
 }
 const currentPath='docs/publication/techniques-subsections/MANIFEST.json';
 const current=json(currentPath);
 for(const [p,h] of Object.entries(current.inputs))verify(p,h);
 for(const entry of current.entries){
  const placement=currentTopicOrder.find(([id])=>id===entry.source);
  if(!placement||placement[1]!==entry.folio||placement[2]!==entry.physicalPages)throw Error('Subsection placement changed: '+entry.source);
  for(const proof of entry.proofs){
   verify(proof.pdf,proof.sha256);
   sources[proof.units][entry.source]={...proof,subsectionRevision:currentPath};
  }
 }
 return sources;
}
