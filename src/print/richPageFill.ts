import {pageFillGrowth} from './pageFill';

/** Small remainders only. Content is selected editorially before this runs.
 * No font, image, padding or prose changes; sparse pages remain visibly sparse. */
export function fillRichPages(root:HTMLElement,{alignColumns,fillBottoms}:{alignColumns:boolean;fillBottoms:boolean}){
 const bottom=(e:Element)=>e.getBoundingClientRect().bottom;
 const grow=(elements:HTMLElement[],amount:number,cap:number)=>{
  if(amount<=0||!elements.length)return;
  const each=Math.min(cap,amount/elements.length);
  for(const e of elements){const property=e.tagName==='LI'?'marginBottom':'marginTop';e.style[property]=(parseFloat(getComputedStyle(e)[property])+each)+'px';}
 };
 for(const page of root.querySelectorAll<HTMLElement>('.sheet')){
  const cols=[...page.querySelectorAll<HTMLElement>('.growing-columns>div')];
  if(alignColumns&&cols.length===2){
   // Compare the two arrangements already supported by Richer A, even when
   // both fit. The previous renderer only considered the alternative on overflow.
   const soil=page.querySelector<HTMLElement>('.soil')!;
   const plant=page.querySelector<HTMLElement>('.planting')!;
   const care=page.querySelector<HTMLElement>('.care')!;
   const harvest=page.querySelector<HTMLElement>('.harvest')!;
   cols[0].append(soil,plant);cols[1].append(care,harvest);
   const original=Math.max(...cols.map(c=>bottom(c.lastElementChild!)));
   cols[0].append(care,harvest);cols[1].append(plant);
   const alternative=Math.max(...cols.map(c=>bottom(c.lastElementChild!)));
   if(alternative<original-2)page.dataset.balanced='planting-aside';
   else {cols[0].append(plant);cols[1].append(care,harvest);delete page.dataset.balanced;}
   const ends=cols.map(c=>bottom(c.lastElementChild!));
   const gap=Math.abs(ends[0]-ends[1]);
   if(gap<=96){
    const c=cols[ends[0]<ends[1]?0:1];
    grow([...c.querySelectorAll<HTMLElement>('li:not(:last-child),section+section,.planting>p+p')],gap,8);
   }
  }
  if(!fillBottoms)continue;
  const end=page.querySelector<HTMLElement>('.content-end')!;
  // Leave 6 mm breathing room above the footer. Never mask gaps over 25 mm.
  const budget=page.querySelector('footer')!.getBoundingClientRect().top-23;
  const spare=pageFillGrowth(budget,bottom(end),true);
  if(!spare)continue;
  const blocks=[...page.children].filter((e):e is HTMLElement=>e instanceof HTMLElement&&e!==end&&e.tagName!=='HEADER'&&e.tagName!=='FOOTER'&&!e.classList.contains('intro'));
  const old=blocks.map(e=>e.style.marginTop);
  grow(blocks,spare,12);
  if(bottom(end)>budget+1)blocks.forEach((e,i)=>e.style.marginTop=old[i]);
  // After prose and section gaps, a few pixels per trouble row improve scanability.
  // This changes row height only; cell padding, type and the selected rows stay intact.
  const rows=[...page.querySelectorAll<HTMLElement>('.pests tbody tr')];
  const remaining=Math.max(0,budget-bottom(end));
  if(rows.length&&remaining>1){
   const before=rows.map(e=>e.style.height),extra=Math.min(4,remaining/rows.length);
   rows.forEach(e=>e.style.height=(e.getBoundingClientRect().height+extra)+'px');
   if(bottom(end)>budget+1)rows.forEach((e,i)=>e.style.height=before[i]);
  }
 }
}
