import fs from 'node:fs';
import path from 'node:path';
import {root,sha256} from './book-content.mjs';

export const approvedGuideReceipt='docs/publication/whole-book-order-preview/integration-2026-10-15/APPROVED-GUIDES.json';
export function loadApprovedTwoPageGuides(){
  const read=p=>fs.readFileSync(path.resolve(root,p));
  const receipt=JSON.parse(read(approvedGuideReceipt));
  const inputs={[approvedGuideReceipt]:sha256(read(approvedGuideReceipt)),...receipt.inputs};
  for(const record of receipt.records)inputs[record.pdf]=record.sha256;
  for(const [p,h] of Object.entries(inputs))if(sha256(read(p))!==h)throw Error('Approved two-page source changed: '+p);
  if(receipt.records.length!==8)throw Error('Expected four approved crops in both units');
  const editions=Object.fromEntries(['imperial','metric'].map(u=>[u,Object.fromEntries(receipt.records.filter(r=>r.units===u).map(r=>[r.key,r]))]));
  return {editions,inputs};
}
