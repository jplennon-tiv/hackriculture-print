// Make contents/assembly depend on verified, current guide PDFs, not old A4 folios.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {afterGuide} from './compact-pagination.mjs';

const root=path.resolve(import.meta.dirname,'..');
const evidence=path.join(root,'docs/publication/book-preparation');
const supplier=process.argv.find(a=>a.startsWith('--supplier='))?.split('=')[1]??'kdp';
if(!['kdp','bookvault'].includes(supplier))throw Error('Invalid supplier');
const suffix=supplier==='kdp'?'':'-BOOKVAULT';
const read=async f=>JSON.parse(await fs.readFile(path.join(root,f),'utf8'));
const receipt=await read(`docs/publication/book-preparation/PRODUCTION-${supplier.toUpperCase()}.json`);
const order=await read('src/print/bookPagination.json');
const previous=await read('docs/publication/book-preparation/ASSEMBLY-PLAN.json');
const editions={};
for(const units of ['imperial','metric']) {
    const documents=[];
    let next=8,vegetablePages=0,troublePages=0,interstitialBlankPages=0;
    for(const type of ['vegetable','trouble']) {
        const entries=order.editions[units][type==='vegetable'?'vegetables':'troubles'];
        if(entries.length!==(type==='vegetable'?44:14))throw Error('Unexpected guide coverage');
        for(const entry of entries) {
            const id=`${units}/${type}/${entry.key}`;
            const item=receipt.results.find(r=>r.id===id);
            if(!item||item.status!=='ok'||item.signature!==receipt.currentSignature||item.startPage!==next)throw Error(`Regenerate current, continuously numbered guide: ${id}`);
            if(receipt.facingPolicy==='vegetable-spreads'&&type==='vegetable'&&next%2!==0)throw Error(`Vegetable opening is not verso: ${id}`);
            const bytes=await fs.readFile(path.join(root,item.pdf));
            if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error(`Changed PDF: ${id}`);
            const pagination=afterGuide(next,item.physicalPages,type,receipt.facingPolicy),{endPage,blankAfterPages,blankFoliosAfter}=pagination;
            documents.push({id,type,key:item.key,label:item.label,pdf:item.pdf,sha256:item.sha256,startPage:next,physicalPages:item.physicalPages,endPage,
                blankAfterPages,blankFoliosAfter,startSide:next%2?'recto':'verso',firstTwoPagesFace:next%2===0});
            interstitialBlankPages+=blankAfterPages;
            if(type==='vegetable')vegetablePages+=item.physicalPages;else troublePages+=item.physicalPages;
            next=pagination.nextPage;
        }
    }
    const lastContentPage=next-1,endBlankPages=lastContentPage%2;
    editions[units]={openingPagesReserved:7,vegetablePages,troublePages,interstitialBlankPages,lastContentPage,endBlankPages,
        plannedEvenTotal:lastContentPage+endBlankPages,documents,
        facingPagePolicy:receipt.facingPolicy==='vegetable-spreads'?'Review proposal: every vegetable starts verso, with its overview and practical advice facing. Explicit blank rectos after odd-length vegetable guides retain that arrangement and can be used for notes. Troubles read continuously. John has not approved this pagination choice.':'Continuous reading order; no hidden spacer pages. Recto/verso is measured per guide.',
        twoPageGuidesNotFacing:documents.filter(d=>d.physicalPages===2&&!d.firstTwoPagesFace).map(d=>d.key)};
}
const report={status:'Measured working review-book plan. Regenerate opening contents and assembly from these hashes. Remaining visual/editorial review may change pagination; not upload-ready.',
    supplier,updatedAt:new Date().toISOString(),sourceRevision:receipt.sourceRevision,implementationSignature:receipt.currentSignature,
    openingPlan:previous.openingPlan,editions};
await fs.writeFile(path.join(evidence,`ASSEMBLY-PLAN${suffix}.json`),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(editions).map(([u,e])=>[u,{pages:e.plannedEvenTotal,vegetablePages:e.vegetablePages,troublePages:e.troublePages,twoPageGuidesNotFacing:e.twoPageGuidesNotFacing}]))));
