import fs from 'node:fs';
import path from 'node:path';
import {root,sha256} from './book-content.mjs';
export const troublesApproval='docs/publication/troubles-rollout/APPROVAL.json';
export function loadApprovedTroubles(){
 const read=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
 const approval=read(troublesApproval);
 for(const f of approval.files)if(sha256(fs.readFileSync(path.resolve(root,f.path)))!==f.sha256)throw Error('Approved Troubles source changed: '+f.path);
 const checks=read('docs/publication/troubles-rollout/CHECKS.json'),pdfs=read('docs/publication/troubles-rollout/PDF-CHECKS.json');
 const editions={imperial:{},metric:{}};
 for(const r of pdfs.results){
  const dom=checks.results.find(x=>x.key===r.key&&x.units===r.units);
  const conditionPages=Object.fromEntries(dom.pages.flatMap((p,i)=>p.entries.map(e=>[e.key,i])));
  if(Object.keys(conditionPages).length!==r.entries)throw Error('Missing approved condition map');
  editions[r.units][r.key]={pdf:r.output,sha256:r.sha256,physicalPages:r.pages,conditionPages,approval:troublesApproval};
 }
 for(const e of Object.values(editions))if(Object.keys(e).length!==14)throw Error('Incomplete approved Troubles set');
 return {editions,opener:{pdf:pdfs.combined.find(r=>r.units==='imperial').output,sourcePage:1,sha256:pdfs.combined.find(r=>r.units==='imperial').sha256},approval:troublesApproval};
}
