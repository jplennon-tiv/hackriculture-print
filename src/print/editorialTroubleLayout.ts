import type {TroubleGroup} from '../types';
import {troublePlanStatus} from './troublePlan';
export const EDITORIAL_TROUBLE_REVISION='open-editorial-v1-family-tint';
/** Reuse reviewed reading order only; old card heights never govern this renderer. */
export function editorialOrder(group:TroubleGroup,review=false){
 const status=troublePlanStatus(group,review);
 return status.usable?group.ai_layout!.pages.flatMap(p=>p.columns.flatMap(c=>c.map(e=>e.key))):Object.entries(group.conditions??{}).sort(([,a],[,b])=>(b.rank??0)-(a.rank??0)).map(([k])=>k);
}
export function paginateEditorial(source:HTMLElement,output:HTMLElement){
 output.replaceChildren();const template=source.querySelector<HTMLElement>('[data-template]')!;
 const originals=[...source.querySelectorAll<HTMLElement>('[data-source-entry]')];
 let sheet:HTMLElement,columns:HTMLElement[],column=0;const pages:HTMLElement[]=[];
 function addPage(){sheet=template.cloneNode(true) as HTMLElement;sheet.removeAttribute('data-template');
 if(pages.length){sheet.classList.replace('opening','continuation');sheet.querySelector('.intro')?.remove();}
 output.append(sheet);pages.push(sheet);columns=[...sheet.querySelectorAll<HTMLElement>('[data-column]')];column=0;}
 function fits(entry:HTMLElement){return entry.getBoundingClientRect().bottom<=sheet.querySelector('footer')!.getBoundingClientRect().top-14;}
 addPage();
 for(const original of originals){const entry=original.cloneNode(true) as HTMLElement;entry.removeAttribute('data-source-entry');columns![column].append(entry);
  if(!fits(entry)){entry.remove();if(column===0)column=1;else addPage();columns![column].append(entry);
   if(!fits(entry)&&pages.length===1){entry.remove();addPage();columns![column].append(entry);}
   if(!fits(entry))throw Error(`${entry.dataset.key}: entry exceeds a full column; editorial review required.`);
  }
 }
 for(const [i,p]of pages.entries())p.querySelector('[data-page-number]')!.textContent=`${i+1} / ${pages.length}`;
 const actual=[...output.querySelectorAll<HTMLElement>('.entry')].map(e=>e.dataset.key);
 if(actual.length!==originals.length||new Set(actual).size!==actual.length)throw Error('Condition coverage error');
 return pages.length;
}
