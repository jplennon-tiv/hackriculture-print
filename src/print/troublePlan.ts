import {layoutSourceSignature} from '../lib/aiPrint';
import type {TroubleGroup} from '../types';
export const troubleLayoutVersion='troubles-cards-2';
export interface TroubleLayoutPlan {
 version:1; status:'draft'|'approved'; renderer:string; source_signature:string;
 updated_at:string; updated_by:string;
 hero_images:string[];
 pages:{columns:{key:string;height_mm:number}[][];intro_height_mm?:number}[];
}
export function troubleLayoutSignature(group:TroubleGroup){
 return layoutSourceSignature(group);
}
export function compactTroublePage(plan:TroubleLayoutPlan,pageIndex:number){
 return pageIndex===plan.pages.length-1&&plan.pages[pageIndex].columns.flat().length<4;
}
export function troublePlanStatus(group:TroubleGroup,review=false){
 const plan=group.ai_layout;if(!plan)return {usable:false,warning:null};
 if(plan.renderer!==troubleLayoutVersion||plan.source_signature!==troubleLayoutSignature(group))return {usable:false,warning:'Saved layout needs review after source or design changes; automatic pagination used.'};
 if(plan.status!=='approved'&&!review)return {usable:false,warning:'Saved layout is a draft; automatic pagination used.'};
 const keys=plan.pages.flatMap(p=>p.columns.flatMap(c=>c.map(x=>x.key)));
 const expected=Object.keys(group.conditions??{});
 if(keys.length!==expected.length||new Set(keys).size!==keys.length||expected.some(k=>!keys.includes(k)))return {usable:false,warning:'Saved layout does not cover every condition; automatic pagination used.'};
 return {usable:true,warning:plan.status==='draft'?'Review proof: draft layout and introduction.':null};
}

/** If a planned fit fails, caller falls back to lossless automatic pagination. */
export function paginateTroublePlan(source:HTMLElement,output:HTMLElement,template:HTMLElement,plan:TroubleLayoutPlan){
 output.replaceChildren();const cards=[...source.querySelectorAll<HTMLElement>('[data-source-card]')];const warnings:string[]=[];
 for(const [pageIndex,spec]of plan.pages.entries()){
  const sheet=template.cloneNode(true) as HTMLElement;sheet.removeAttribute('data-template');output.append(sheet);
  if(pageIndex>0)sheet.dataset.continuation='true';
  if(spec.intro_height_mm){
   if([...source.querySelectorAll<HTMLImageElement>('[data-planned-intro] img')].some(img=>!img.naturalWidth))throw Error('Missing introductory image');
   const intro=source.querySelector<HTMLElement>('[data-planned-intro]')!.cloneNode(true) as HTMLElement;
   intro.style.height=spec.intro_height_mm+'mm';sheet.querySelector('header')!.after(intro);
   if(intro.scrollHeight>intro.clientHeight+1)throw Error('Introduction needs layout review');
  }
  const cols=[...sheet.querySelectorAll<HTMLElement>('[data-column]')];
  if(spec.columns.length!==2)throw Error('Expected two columns');
  for(const [i,entries]of spec.columns.entries()){
   const extraHeight=pageIndex>0?18:0;
   cols[i].style.height=(238+extraHeight-(spec.intro_height_mm??0))+'mm';
   for(const entry of entries){
    const original=cards.find(c=>c.dataset.key===entry.key);if(!original)throw Error('Missing condition '+entry.key);
    const card=original.cloneNode(true) as HTMLElement;card.removeAttribute('data-source-card');card.style.height=(entry.height_mm+extraHeight/entries.length)+'mm';cols[i].append(card);
    let image=card.querySelector<HTMLImageElement>('img');
    if(image&&!original.querySelector<HTMLImageElement>('img')!.naturalWidth){card.querySelector('figure')?.remove();image=null;warnings.push(`${original.dataset.name}: missing illustration; text retained.`);}
    if(image){
     let low=18,high=48;while(high-low>.2){const mid=(low+high)/2;image.style.height=mid+'mm';if(card.scrollHeight<=card.clientHeight)low=mid;else high=mid;}image.style.height=low+'mm';
    }
    if(card.scrollHeight>card.clientHeight+1)throw Error(entry.key+' exceeds saved card budget');
    // Keep the budget-fitted image size, but leave spare final-page space outside the card.
    if(compactTroublePage(plan,pageIndex))card.style.height='auto';
   }
   if(cols[i].scrollHeight>cols[i].clientHeight+1)throw Error('Saved column exceeds page budget');
  }
  sheet.querySelector('[data-page-number]')!.textContent=`${pageIndex+1} / ${plan.pages.length}`;
 }
 return {pages:plan.pages.length,warnings};
}
