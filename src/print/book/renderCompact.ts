import type { Page } from 'playwright';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { kaleBookCopy } from './kaleCopy';
import {workingBookCopy,workingBookConsolidations} from './workingCopy';
import {prepareProductionType,finishProductionPages,type BookProductionOptions} from './production';

/** Reuse approved source-linked markup, then lay it out in a separate document.
 * React's A4 measurement effects cannot interfere with the book's geometry.
 * No canonical data, A4 styles or frozen reference files are modified here. */
export async function prepareCompactBook(page: Page, baseUrl: string, type: 'vegetable'|'trouble', slug: string, units: string, root: string, production?:BookProductionOptions) {
    let css = await readFile(join(root, 'src/print/book/compact.css'), 'utf8');
    if(production) {
        if(!Number.isInteger(production.startPage)||production.startPage<1)throw Error('Production needs a positive physical start page');
        css+='\n'+await readFile(join(root,'src/print/book/production.css'),'utf8');
        if(production.supplier==='bookvault')css+='\n'+await readFile(join(root,'src/print/book/bookvault.css'),'utf8');
    }
    const captured = await page.evaluate(type => {
        const el = document.querySelector(type === 'vegetable' ? '.rich-print' : '.editorial-trouble');
        if (!el) throw Error('Missing approved print source');
        return { html: el.outerHTML, css: Array.from(document.querySelectorAll('style'), e => e.textContent).join('\n') };
    }, type);
    await page.goto(`${baseUrl}/print-shell.html`);
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><base href="${baseUrl}/"><style>${captured.css}\n${css}</style></head><body>${captured.html}</body></html>`);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images, i => i.decode())); });
    const adjustedType=production?await prepareProductionType(page):[];
    const edits=type==='vegetable'?(slug==='kale'?kaleBookCopy(units):production?workingBookCopy(slug,units):[]):[];
    const consolidations=production&&type==='vegetable'?workingBookConsolidations(slug):[];
    const result=await page.evaluate(layoutCompactBook, { type, slug, units, edits, consolidations, startPage:production?.startPage });
    const geometry=production?await finishProductionPages(page,production):undefined;
    return {...result,geometry,adjustedType};
}

type LayoutInput = {type:'vegetable'|'trouble';slug:string;units:string;edits:{selector:string;expected:string;proposed:string;label?:string}[];consolidations?:{selector:string;duplicateOf:string}[];startPage?:number};

/** Browser-only DOM layout. Move whole content blocks; never truncate a page. */
export function layoutCompactBook({type, slug, units, edits,consolidations=[],startPage}: LayoutInput) {
    const root = document.querySelector<HTMLElement>(type === 'vegetable' ? '.rich-print' : '.editorial-trouble')!;
    const warnings: string[] = [];
    let cropLabelLegend:{label:string;crops:string[];entries:string[]}|undefined;
    const all = <T extends Element = HTMLElement>(parent: ParentNode, selector: string) => Array.from(parent.querySelectorAll<T>(selector));
    const need = (parent: ParentNode, selector: string): HTMLElement => {
        const found = parent.querySelector<HTMLElement>(selector);
        if (!found) throw Error(`Compact book source missing ${selector}`);
        return found;
    };
    const bottom = (e: Element) => e.getBoundingClientRect().bottom;
    const textEdge = (el: Element | null, edge: 'top'|'bottom') => {
        if (!el) return null;
        const range = document.createRange(); range.selectNodeContents(el);
        const values = Array.from(range.getClientRects()).filter(r=>r.width&&r.height).map(r=>r[edge]);
        return values.length ? (edge==='top'?Math.min(...values):Math.max(...values)) : null;
    };
    const limit = (sheet: HTMLElement) => need(sheet,'footer').getBoundingClientRect().top - (type === 'vegetable' ? 3*3.77952756 : 14);
    const sheets = () => all(root, '.sheet:not([data-template])').filter(s => !s.closest('.measure'));
    const parity = () => sheets().forEach((s,i) => s.classList.toggle('verso',((startPage??0)+i) % 2 === 0));
    // Local proof numbering. Final collection folios/contents need a measured book map.
    const number = () => sheets().forEach((s,i) => {
        const footer = need(s, 'footer');
        footer.replaceChildren();
        for (const text of ['GROWING GUIDES',`${units.toUpperCase()} · ${(startPage??1)+i}`]) {
            const span = document.createElement('span'); span.textContent = text; footer.append(span);
        }
    });

    let originalNodes: HTMLElement[];
    let originalImages: HTMLImageElement[];
    if (type === 'vegetable') {
        root.querySelectorAll<HTMLElement>('[style]').forEach(e => {
            e.style.removeProperty('margin-top'); e.style.removeProperty('margin-bottom');
            if (e.tagName === 'TR') e.style.removeProperty('height');
        });
        all(root,'.sheet').forEach(s => s.classList.remove('compact','dense'));
        const front = need(root,'.front'), back = need(root,'.back');
        if(startPage!==undefined) {
            // A4 chooses its own column balance. A bound-book draft measures its
            // coherent Soil/Planting and Care/Harvest arrangement independently.
            const columns=all(root,'.growing-columns>div');
            columns[0].append(need(root,'.soil'),need(root,'.planting'));
            columns[1].append(need(root,'.care'),need(root,'.harvest'));
        }
        back.querySelector('header>.eyebrow')?.remove();
        // Approved Kale alone consolidates repeated measurements; later draft
        // summaries have their own exact-source checks and retain those rows.
        if (slug==='kale'&&edits.length) {
            const facts = all(root,'.fact-grid p').map(e => e.textContent!.trim());
            for (const row of Array.from(need(root,'.measurements').children).slice(0,3)) {
                const copy = row.cloneNode(true) as HTMLElement; copy.querySelector('b')?.remove();
                if (!facts.includes(copy.textContent!.trim())) throw Error('Review changed Kale repeated measurement before book export');
                row.remove();
            }
        }
        if(edits.length) {
            for (const {selector, expected, proposed, label} of edits) {
                const el = need(root,selector);
                if (el.textContent !== expected) throw Error(`Review changed ${slug} book summary: ${selector}`);
                if (label) el.replaceChildren(need(el,'b'),document.createTextNode(' '+proposed.slice(label.length).trim()));
                else el.textContent = proposed;
            }
        }
        for(const {selector,duplicateOf} of consolidations) {
            const repeated=need(root,selector), surviving=need(root,duplicateOf);
            const copy=repeated.cloneNode(true) as HTMLElement;copy.querySelector('b')?.remove();
            if(copy.textContent!.trim()!==surviving.textContent!.trim())throw Error(`Review changed ${slug} repeated measurement: ${selector}`);
            repeated.remove();
        }
        const factGrid = need(root,'.fact-grid'), facts = all(factGrid,':scope>article');
        // Stable semantic groups, not fixed array positions: short facts and qualifications.
        const short = document.createElement('div'), long = document.createElement('div');
        short.className = long.className = 'fact-column';
        for (const fact of facts) {
            const name = need(fact,'h3').textContent!.trim();
            (name === 'Plant spacing' || name === 'Ready in' ? long : short).append(fact);
        }
        factGrid.append(short,long);
        if(startPage!==undefined) {
            // A long row/yield qualification can be taller than the wide facts.
            // Trial whole articles at their real type size; retain a move only
            // when it saves at least one body line. Ordinary short facts stay put.
            const order=(column:HTMLElement)=>facts.filter(f=>f.parentElement===column).forEach(f=>column.append(f));
            for(let pass=0;pass<facts.length;pass++) {
                const before=factGrid.getBoundingClientRect().height;
                let best:{fact:HTMLElement;target:HTMLElement}|undefined, saving=12;
                for(const fact of facts) {
                    const source=fact.parentElement!, target=source===short?long:short;
                    const value=need(fact,'p'), lines=value.getBoundingClientRect().height/parseFloat(getComputedStyle(value).lineHeight);
                    if(source===short?lines<4:lines>2)continue;
                    target.append(fact);order(target);
                    const reduction=before-factGrid.getBoundingClientRect().height;
                    source.append(fact);order(source);
                    if(reduction>saving){best={fact,target};saving=reduction;}
                }
                if(!best)break;
                best.target.append(best.fact);order(best.target);
            }
        }
        // The reference has five varieties (three plus two). Complete rows of
        // six should stay three plus three, not inherit a wasteful third row.
        for (const grid of all(root,'.varieties>div')) {
            const cards=all(grid,':scope>article'), count=cards.length;
            cards.forEach((card,i)=>{
                let span=count===1?6:count===2||count===4?3:2;
                if(count>4&&count%3===1&&i===count-1)span=6;
                if(count>4&&count%3===2&&i>=count-2)span=3;
                card.style.gridColumn=`span ${span}`;
            });
        }
        // More than two tips must not flow underneath the narrow heading column.
        // Reserve that column across all natural tip rows; keep the two-tip pilot.
        for (const tips of all(root,'.tips')) tips.style.setProperty('--book-tip-rows',String(Math.ceil(all(tips,':scope>div').length/2)));
        parity(); number();
        const title = need(front,'h1');
        title.style.removeProperty('max-width');
        title.style.removeProperty('white-space');
        // Keep the approved Kale header exactly. Longer names use the left title area.
        if (title.getBoundingClientRect().width > 190) {
            front.style.setProperty('--book-title-width','300px');
            front.style.setProperty('--book-title-size','52px');
            front.style.setProperty('--book-seasons-left','310px');
            front.style.setProperty('--book-seasons-top','12px');
            need(front,'.header-seasons').style.width = '150px';
            title.style.whiteSpace = 'normal';
            for (let size=52; bottom(title)>front.getBoundingClientRect().top+119 && size>32; size-=1) front.style.setProperty('--book-title-size',`${size-1}px`);
        }
        if(startPage!==undefined) {
            // Tilt makes longer titles rise further at their right edge. Fit the
            // actual text rectangle to the safe top, rather than naming crops.
            const range=document.createRange();range.selectNodeContents(title);
            const top=Math.min(...Array.from(range.getClientRects()).filter(r=>r.width&&r.height).map(r=>r.top));
            const safe=front.getBoundingClientRect().top+6.6*3.77952756;
            if(top<safe)title.style.setProperty('top',`${parseFloat(getComputedStyle(title).top)+safe-top}px`,'important');
        }
        originalNodes = all(root,'p,li,td,th,h2,h3,.measurements').filter(e=>!e.closest('header,footer'));
        originalImages = all<HTMLImageElement>(root,'img').filter(e=>!e.closest('header'));
        const makeContinuation = (after: HTMLElement) => {
            const sheet = document.createElement('section'); sheet.className = 'sheet back book-continuation';
            const header = document.createElement('header'), h1 = document.createElement('h1');
            h1.textContent = title.textContent!.replace(/\.$/,'') + ' · continued'; header.append(h1);
            sheet.append(header,document.createElement('footer')); after.after(sheet); parity(); number();
            return sheet;
        };
        const content = (s: HTMLElement) => all(s,':scope>*').filter(e=>!e.matches('header,footer,.content-end'));
        // Keep the practical title and reminder banner together on page two.
        // Overflowing varieties/risks follow practical advice, beside the pest
        // reference, rather than displacing the whole growing section a page.
        const fitsWithSmallGapAdjustment=(block:HTMLElement,sheet:HTMLElement)=>{
            const excess=bottom(block)-limit(sheet);
            if(excess<=0)return true;
            const margin=parseFloat(getComputedStyle(block).marginTop);
            if(excess>6||margin-excess<2.5)return false;
            // Up to 1.6 mm of terminal spacing can save an orphaned section;
            // preserve the type, all advice, and at least 2 px of separation.
            block.style.setProperty('margin-top',`${margin-excess-.5}px`,'important');
            return bottom(block)<=limit(sheet);
        };
        const frontBlocks=content(front), backBlocks=content(back), spill:HTMLElement[]=[];
        frontBlocks.forEach(e=>e.remove());
        for (const block of frontBlocks) {
            if (spill.length) { spill.push(block); continue; }
            front.insertBefore(block,need(front,'footer'));
            if (!fitsWithSmallGapAdjustment(block,front)) { block.remove(); spill.push(block); }
        }
        backBlocks.forEach(e=>e.remove());
        let current=back;
        const queue=backBlocks.flatMap(block=>block.matches('.growing-columns')?[block,...spill]:[block]);
        for (const block of queue) {
            current.insertBefore(block,need(current,'footer'));
            if (fitsWithSmallGapAdjustment(block,current)) continue;
            block.remove(); current=makeContinuation(current); current.insertBefore(block,need(current,'footer'));
            if (bottom(block)>limit(current)) throw Error(`Compact ${slug}: ${block.className || block.tagName} needs editorial layout review; content was not clipped`);
        }
        all(root,'.content-end').forEach(e=>e.remove());
    } else {
        const source = need(root,'.measure'), output = need(root,':scope>div:last-child');
        const template = need(source,'[data-template]');
        const entries = all(source,'[data-source-entry]');
        originalNodes = all(source,'[data-source-entry]');
        originalImages = all<HTMLImageElement>(source,'[data-source-entry] img');
        const keys = entries.map(e=>e.dataset.key);
        if(startPage!==undefined) {
            // Deduplicate only a complete group-wide crop list, with its full
            // membership printed on every page. Partial applicability stays
            // explicit on each diagnostic entry; no advice is shortened.
            const cropLists=entries.map(e=>need(e,'.crops').textContent!.split('/').map(s=>s.trim()).filter(Boolean));
            const crops=Array.from(new Set(cropLists.flat())).sort((a,b)=>a.localeCompare(b));
            const coversAll=(list:string[])=>list.length===crops.length&&crops.every(c=>list.includes(c));
            const common=entries.filter((_,i)=>coversAll(cropLists[i]));
            if(crops.join(' / ').length>60&&common.length>=4) {
                cropLabelLegend={label:'All listed crops',crops,entries:common.map(e=>e.dataset.key!)};
                const legend=document.createElement('p');legend.className='crop-legend';
                legend.textContent=`All listed crops: ${crops.join(' · ')}`;
                const header=need(template,'header');header.classList.add('has-crop-legend');header.insertBefore(legend,header.querySelector('.intro'));
                common.forEach(e=>need(e,'.crops').textContent='All listed crops');
            }
        }
        output.replaceChildren();
        const addPage = () => {
            const continuation = output.children.length > 0;
            const current = template.cloneNode(true) as HTMLElement; current.removeAttribute('data-template');
            if (continuation) { current.classList.replace('opening','continuation'); current.querySelector('.intro')?.remove(); }
            output.append(current); parity(); number();
            return current;
        };
        const first=addPage(), firstColumn=need(first,'[data-column]');
        for (const entry of entries) {
            entry.removeAttribute('data-source-entry');
            const img = entry.querySelector('.diagnostic'); if (img) need(entry,'.advice').prepend(img);
            firstColumn.append(entry);
        }
        // Measure complete entries at the real column width. Choose ordered
        // page/column breaks together: filling one column greedily can strand
        // a single entry on the last page or leave its other column empty.
        const heights=entries.map(e=>e.getBoundingClientRect().height+parseFloat(getComputedStyle(e).marginBottom));
        const tails=entries.map(e=>parseFloat(getComputedStyle(e).marginBottom));
        const prefix=[0];heights.forEach(h=>prefix.push(prefix[prefix.length-1]+h));
        const span=(from:number,to:number)=>to===from?0:prefix[to]-prefix[from]-tails[to-1];
        const continuation=addPage();
        const capacities=[first,continuation].map(s=>limit(s)-need(s,'[data-column]').getBoundingClientRect().top);
        type Plan={pages:number;sparse:number;maxStretch:number;cost:number;breaks:[number,number][]};
        const cache=new Map<string,Plan|null>();
        const plan=(from:number,opening:boolean):Plan|null=>{
            if(from===entries.length)return {pages:0,sparse:0,maxStretch:0,cost:0,breaks:[]};
            const key=`${from}/${opening}`;if(cache.has(key))return cache.get(key)!;
            const cap=capacities[opening?0:1];let best:Plan|null=null;
            for(let middle=from+1;middle<=entries.length;middle++) {
                const left=span(from,middle);if(left>cap+.1)break;
                for(let end=middle;end<=entries.length;end++) {
                    const right=span(middle,end);if(right>cap+.1)break;
                    const rest=plan(end,false);if(!rest)continue;
                    // Page count first; production next minimises the worst
                    // inter-entry stretch needed for aligned text edges. Then
                    // balance page usage. Never drop or reorder an entry.
                    const single=(middle-from===1?1:0)+(end-middle===1?1:0);
                    // Production pages should not all become 3+2 columns merely
                    // to equalise page totals. Prefer fewer long alignment gaps,
                    // while page count and complete ordered coverage stay first.
                    const shorterCount=left<right?middle-from:end-middle;
                    // A sparse column keeps natural heights, but its unequal
                    // ending still has a visual cost. Do not make singleton
                    // columns free and thereby scatter them through the guide.
                    const stretch=Math.abs(left-right)/(shorterCount<2?2:Math.max(1,shorterCount-1));
                    const cost=rest.cost+(2*cap-left-right)**2+(left-right)**2*.15+single*2500+(startPage!==undefined?4*stretch**2:0);
                    const candidate={pages:rest.pages+1,sparse:rest.sparse+(single&&(end!==entries.length||end-from>3)?1:0),maxStretch:Math.max(rest.maxStretch,stretch),cost,breaks:[[middle,end] as [number,number],...rest.breaks]};
                    const preference=!best?0:startPage===undefined?candidate.cost-best.cost:
                        candidate.sparse-best.sparse||candidate.maxStretch-best.maxStretch||candidate.cost-best.cost;
                    if(!best||candidate.pages<best.pages||candidate.pages===best.pages&&preference<0)best=candidate;
                }
            }
            cache.set(key,best);return best;
        };
        const chosen=plan(0,true);
        if(!chosen)throw Error('Compact diagnostic entries need editorial layout review; content was not clipped');
        entries.forEach(e=>e.remove());continuation.remove();
        let from=0;
        chosen.breaks.forEach(([middle,end],index)=>{
            const sheet=index===0?first:addPage(), columns=all(sheet,'[data-column]');
            columns[0].append(...entries.slice(from,middle));columns[1].append(...entries.slice(middle,end));
            sheet.dataset.columnBalance=JSON.stringify({entries:[middle-from,end-middle],method:'ordered measured page/column partition'});
            from=end;
        });
        source.remove();
        // Pack first, then share inter-entry space. A single entry is never stretched.
        for (const sheet of sheets()) {
            need(sheet,'.columns').classList.add('align-ends');
            const columns=all(sheet,'[data-column]');
            if(columns.length!==2||columns.some(c=>c.children.length<2)) {
                // A single entry cannot share inter-entry space. Keep both
                // columns natural on this sparse page instead of padding it.
                columns.forEach(c=>{c.style.alignSelf='start';});
                sheet.dataset.alignmentException='Sparse page: natural entry heights retained; first text edges aligned, last edges may differ.';
                continue;
            }
            const endings=columns.map(c=>textEdge(c.lastElementChild!.querySelector('.advice section:last-child p'),'bottom'));
            if(endings.some(e=>e===null)||Math.abs(endings[0]!-endings[1]!)<=.5)continue;
            let target=Math.max(...endings as number[]);
            if(startPage!==undefined) {
                // Enlarged production labels sometimes leave too little room
                // to extend a float-bearing column. First use existing spare
                // inter-entry space in its neighbour to bring that text up.
                const minimum=columns.map((c,i)=>{
                    const natural=Array.from(c.children).reduce((sum,e)=>sum+e.getBoundingClientRect().height+parseFloat(getComputedStyle(e).marginTop)+parseFloat(getComputedStyle(e).marginBottom),0);
                    return endings[i]!-(c.getBoundingClientRect().height-natural);
                });
                const maximum=columns.map((c,i)=>endings[i]!+limit(sheet)-bottom(c.lastElementChild!));
                const low=Math.max(...minimum),high=Math.min(...maximum);
                if(low<=high)target=Math.max(low,Math.min(target,high));
            }
            const extra=endings.map(e=>target-e!);
            // A float can extend below the last line. Align actual text, while
            // keeping the full illustration above the content limit as well.
            if(columns.some((c,i)=>bottom(c.lastElementChild!)+extra[i]>limit(sheet))) {
                sheet.dataset.alignmentException='Natural column endings retained to keep the complete illustration above the footer.';
                continue;
            }
            const heights=columns.map((c,i)=>c.getBoundingClientRect().height+extra[i]);
            columns.forEach((c,i)=>{c.style.alignSelf='start';c.style.height=`${heights[i]}px`;});
        }
        if(startPage!==undefined) {
            const last=sheets()[sheets().length-1], columns=all(last,'[data-column]');
            const tallestDrawing=Math.max(...all(last,'.diagnostic').map(e=>e.getBoundingClientRect().height));
            const largestGap=Math.max(...columns.flatMap(c=>all(c,':scope>.entry').slice(1).map((e,i)=>e.getBoundingClientRect().top-bottom(c.children[i]))));
            if(tallestDrawing>0&&largestGap>tallestDrawing) {
                columns.forEach(c=>{c.style.removeProperty('height');c.style.alignSelf='start';});
                last.dataset.alignmentException='Sparse final page: natural column endings retained instead of an inter-entry gap taller than a diagnostic illustration.';
            }
        }
        if (JSON.stringify(all(output,'.entry').map(e=>e.dataset.key))!==JSON.stringify(keys)) throw Error('Compact diagnostic coverage changed');
    }
    parity(); number();
    if (originalNodes.some(e=>!root.contains(e)) || originalImages.some(e=>!root.contains(e))) throw Error('Compact book lost source content');
    const checks = sheets().map((sheet,i) => {
        const box = sheet.getBoundingClientRect(), footer = need(sheet,'footer').getBoundingClientRect();
        const legend=sheet.querySelector('.crop-legend'), navigation=sheet.querySelector('.navigation');
        if(legend&&navigation&&bottom(legend)>navigation.getBoundingClientRect().top) throw Error(`Compact ${slug}: crop legend overlaps navigation; review header`);
        if (sheet.classList.contains('front')) {
            const title=need(sheet,'h1').getBoundingClientRect();
            for (const selector of ['.header-seasons','.header-difficulty']) {
                const other=need(sheet,selector).getBoundingClientRect();
                if(title.left<other.right && title.right>other.left && title.top<other.bottom && title.bottom>other.top) throw Error(`Compact ${slug}: title overlaps ${selector}; review header`);
            }
        }
        // Diagnostic columns include an invisible final margin. Check the real
        // entries (which enclose floated art), not that trailing empty margin.
        const blocks = type==='trouble'?all(sheet,':scope>header,.entry'):all(sheet,':scope>*').filter(e=>!e.matches('footer'));
        const contentBottom = Math.max(...blocks.map(bottom));
        if (contentBottom>footer.top-11) throw Error(`Compact page ${i+1} overlaps footer; review layout`);
        const walker = document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
            const n=walker.currentNode; if (!n.textContent?.trim()) continue;
            const range=document.createRange();range.selectNodeContents(n);
            if(Array.from(range.getClientRects()).some(r=>r.width&&r.height&&(r.left<box.left||r.right>box.right||r.top<box.top||r.bottom>box.bottom))) throw Error(`Compact page ${i+1} text outside trim: ${n.textContent.slice(0,60)}`);
        }
        const columns = all(sheet,'[data-column]').map(c=>({
            entries: c.children.length,
            top: textEdge(c.firstElementChild?.querySelector('.crops')??null,'top'),
            bottom: textEdge(c.lastElementChild?.querySelector('.advice section:last-child p')??null,'bottom'),
        }));
        if (columns.length===2 && columns.every(c=>c.entries>1) && !sheet.dataset.alignmentException) {
            for (const edge of ['top','bottom'] as const) if (Math.abs(columns[0][edge]!-columns[1][edge]!)>.5) warnings.push(`Page ${i+1}: Troubles ${edge} text alignment needs review.`);
        }
        return {page:i+1,footerGapMm:(footer.top-contentBottom)/3.77952756,columns,alignmentException:sheet.dataset.alignmentException};
    });
    if (Array.from(document.images).some(i=>!i.complete||!i.naturalWidth)) throw Error('Compact book missing artwork');
    document.body.dataset.bookChecks = JSON.stringify({type,slug,units,pages:checks,contentPreserved:true,consolidations,cropLabelLegend});
    return {pages:checks.length,warnings};
}
