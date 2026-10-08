import type {Page} from 'playwright';

/** An explicit working production profile; ordinary guide proofs stay unchanged. */
export type BookProductionOptions = {
    supplier: 'kdp'|'bookvault';
    startPage: number;
};

export async function prepareProductionType(page: Page) {
    return page.evaluate(() => {
        const adjusted: {text:string;previousPx:number}[]=[];
        const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
        const parents=new Set<HTMLElement>();
        while(walker.nextNode()) if(walker.currentNode.textContent?.trim()) {
            const parent=walker.currentNode.parentElement;
            if(parent&&!parent.closest('script,style'))parents.add(parent);
        }
        for(const el of parents) {
            const size=parseFloat(getComputedStyle(el).fontSize);
            if(size>=9.4)continue;
            adjusted.push({text:el.textContent!.trim().slice(0,80),previousPx:size});
            el.style.setProperty('font-size','9.4px','important');
        }
        return adjusted;
    });
}

/** Check informative content in trim coordinates before adding real art bleed. */
export async function finishProductionPages(page:Page, options:BookProductionOptions) {
    return page.evaluate(({supplier,startPage})=>{
        const mm=96/25.4, bleed=supplier==='kdp'?3.175:3;
        const width=supplier==='kdp'?188.175:191, height=240+2*bleed;
        const sheets=Array.from(document.querySelectorAll<HTMLElement>('.sheet'));
        const pages=sheets.map((sheet,index)=>{
            const folio=startPage+index, verso=folio%2===0;
            const bounds=sheet.getBoundingClientRect();
            // KDP's 9.525 mm bleed-file outside margin includes 3.175 mm bleed.
            // Use 6.4 mm trim safety plus the 12.7 mm binding margin at 151–300 pp.
            // Bookvault's downloaded text template reserves 17 mm at binding
            // and 5 mm at the other trim edges; it has bleed on all four sides.
            const inside=supplier==='bookvault'?17:12.7, outside=supplier==='bookvault'?5:6.4;
            const inset={left:verso?outside:inside,right:verso?inside:outside,top:outside,bottom:outside};
            const failures:{text:string;reason:string}[]=[];
            let minTypePt=Infinity;
            const walker=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);
            while(walker.nextNode()) {
                const node=walker.currentNode;
                if(!node.textContent?.trim())continue;
                const el=node.parentElement!, style=getComputedStyle(el);
                const range=document.createRange();range.selectNodeContents(node);
                const rects=Array.from(range.getClientRects()).filter(r=>r.width&&r.height);
                if(!rects.length)continue;
                const pt=parseFloat(style.fontSize)*.75;minTypePt=Math.min(minTypePt,pt);
                if(pt<7)failures.push({text:node.textContent.trim(),reason:`${pt} pt below 7 pt`});
                if(rects.some(r=>r.left<bounds.left+inset.left*mm-.5||r.right>bounds.right-inset.right*mm+.5||r.top<bounds.top+inset.top*mm-.5||r.bottom>bounds.bottom-inset.bottom*mm+.5)) failures.push({text:node.textContent.trim(),reason:'text outside production safe area: '+JSON.stringify(rects.map(r=>({left:(r.left-bounds.left)/mm,right:(bounds.right-r.right)/mm,top:(r.top-bounds.top)/mm,bottom:(bounds.bottom-r.bottom)/mm})))});
            }
            if(failures.length)throw Error(`Production page ${folio}: ${JSON.stringify(failures.slice(0,8))}`);
            const leaf=document.createElement('div');leaf.className='book-leaf';
            leaf.style.width=`${width}mm`;leaf.style.height=`${height}mm`;
            leaf.style.background=getComputedStyle(sheet).backgroundColor;
            sheet.before(leaf);leaf.append(sheet);
            sheet.style.setProperty('--bleed-left',`${supplier==='bookvault'||verso?bleed:0}mm`);
            sheet.style.setProperty('--bleed-top',`${bleed}mm`);
            return {folio,verso,minTypePt,safeInsetMm:inset,trimMm:[185,240],mediaMm:[width,height],trimOffsetMm:[supplier==='bookvault'||verso?bleed:0,bleed]};
        });
        const css=document.createElement('style');
        css.textContent=`@page{size:${width}mm ${height}mm;margin:0}.book-leaf{position:relative;overflow:hidden;break-after:page}.book-leaf:last-child{break-after:auto}body .book-leaf .sheet{position:absolute!important;top:var(--bleed-top)!important;left:var(--bleed-left)!important;overflow:visible!important;break-after:auto!important}`;
        document.head.append(css);
        const prior=JSON.parse(document.body.dataset.bookChecks!);
        document.body.dataset.bookChecks=JSON.stringify({...prior,production:{supplier,startPage,pages}});
        return {width,height,pages};
    },options);
}
