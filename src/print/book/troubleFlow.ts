import type {Page} from 'playwright';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, sep} from 'node:path';

/** Source-bound invisible geometry, separate from the displayed diagnostic art. */
export type TroubleMask = {
    key:string; src:string; sourceSha256:string; url:string; sha256:string;
    width:number; height:number; bounds:{left:number;top:number;bottom:number};
};
export type TroubleFlowOptions = {
    masks:TroubleMask[];
    priority?:{key:string;rank:number;star:boolean}[];
    /** Explicit reviewed experiment order. All source identities must remain. */
    order?:string[];
};

/** Opt-in proof profile. Do not enable other guides until their masks are reviewed. */
export async function prepareTroubleFlow(page:Page, root:string, options:TroubleFlowOptions) {
    // The removed arrowed navigation used to occupy this lower header space.
    // Keep a normal 14 px separation, rather than reserving its former 30 px.
    await page.addStyleTag({content:'.editorial-trouble header,.editorial-trouble .continuation header.has-crop-legend{padding-bottom:14px}'});
    if(options.priority) {
        await page.addStyleTag({content:`
            .editorial-trouble .entry.featured{background:var(--wash);border-top:2px solid var(--accent);border-radius:9px 17px 12px 16px;padding:10px 11px 11px}
            .editorial-trouble .feature-label{font:900 10px/1.2 'Nunito Sans',sans-serif;letter-spacing:.6px;color:var(--deep);text-transform:uppercase;margin:0 0 6px}
        `});
        await page.evaluate(({priority,order})=>{
            const source=document.querySelector('.measure')!;
            const entries=Array.from(source.querySelectorAll<HTMLElement>('[data-source-entry]'));
            const metadata=new Map(priority.map(p=>[p.key,p]));
            if(metadata.size!==entries.length||entries.some(e=>!metadata.has(e.dataset.key!)))throw Error('Incomplete priority metadata');
            // Latest instruction: no alphabetical tie-break. Retain source order
            // for equal ranks in the strict control; fit may vary tied entries.
            entries.sort((a,b)=>metadata.get(b.dataset.key!)!.rank-metadata.get(a.dataset.key!)!.rank);
            if(order) {
                if(order.length!==entries.length||new Set(order).size!==order.length||order.some(k=>!metadata.has(k)))throw Error('Priority experiment changed entry coverage');
                entries.sort((a,b)=>order.indexOf(a.dataset.key!)-order.indexOf(b.dataset.key!));
            }
            for(const entry of entries) {
                const meta=metadata.get(entry.dataset.key!)!;
                entry.dataset.importance=String(meta.rank);
                if(meta.star) {
                    entry.classList.add('featured');
                    // The shared star becomes a book panel label; avoid duplicating it in the title.
                    const title=entry.querySelector('h2')!;title.textContent=title.textContent!.replace(/\s*★\s*$/,'');
                    const label=document.createElement('p');label.className='feature-label';label.textContent='★ Most common';entry.prepend(label);
                }
                source.append(entry);
            }
        },{priority:options.priority,order:options.order});
    } else if(options.order)throw Error('Explicit ordering needs priority metadata');
    for(const mask of options.masks) {
        for(const [url,expected,isArt] of [[mask.src,mask.sourceSha256,true],[mask.url,mask.sha256,false]] as const) {
            if(!url.startsWith('/')||url.startsWith('//'))throw Error('Wrapping assets must use local absolute URL paths');
            const filename=resolve(root,isArt?'public':'',`.${url}`);
            if(!filename.startsWith(resolve(root)+sep))throw Error('Wrapping asset outside project');
            const actual=createHash('sha256').update(await readFile(filename)).digest('hex');
            if(actual!==expected)throw Error(`Wrapping source changed; review the mask: ${url}`);
        }
    }
    await page.evaluate(async masks=>{
        await document.fonts.ready;
        const entries=Array.from(document.querySelectorAll<HTMLElement>('.measure [data-source-entry]'));
        const illustrated=entries.filter(e=>e.querySelector('.diagnostic'));
        if(new Set(masks.map(m=>m.key)).size!==masks.length||illustrated.length!==masks.length)throw Error('Wrapping masks must cover every illustrated entry exactly once');
        for(const entry of illustrated) {
            const img=entry.querySelector<HTMLImageElement>('.diagnostic')!;
            const mask=masks.find(m=>m.key===entry.dataset.key);
            if(!mask||img.getAttribute('src')!==mask.src)throw Error(`Wrapping source mismatch: ${entry.dataset.key}`);
            const preload=new Image();preload.src=mask.url;await preload.decode();
            const width=135,height=157.5,scale=width/mask.width,gap=4*96/25.4;
            if(Math.abs(mask.height*scale-height)>.01)throw Error('Mask aspect ratio mismatch');
            Object.assign(img.style,{
                width:width+'px',height:height+'px',shapeOutside:`url("${mask.url}")`,
                shapeImageThreshold:'0.5',shapeMargin:'4mm',
                marginLeft:Math.max(8,gap-mask.bounds.left*scale)+'px',
                marginTop:Math.max(2,gap-mask.bounds.top*scale)+'px',
                marginBottom:Math.max(5,gap-(height-mask.bounds.bottom*scale))+'px',
            });
        }
        await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    },options.masks);
}
