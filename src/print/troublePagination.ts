/** Measured columns; never truncate text. Oversized entries receive continuation cards. */
export function paginateTroubles(source:HTMLElement,output:HTMLElement,template:HTMLElement){
 output.replaceChildren();const warnings:string[]=[];const probe=source.querySelector<HTMLElement>('[data-probe]')!;
 const pages:HTMLElement[]=[];let columns:HTMLElement[]=[],columnIndex=0;
 const newPage=()=>{const page=template.cloneNode(true) as HTMLElement;page.removeAttribute('data-template');if(pages.length)page.dataset.continuation='true';output.append(page);pages.push(page);columns=[...page.querySelectorAll<HTMLElement>('[data-column]')];columnIndex=0;};
 newPage();const budget=columns[0].clientHeight;
 const height=(node:HTMLElement)=>{probe.replaceChildren(node);return node.getBoundingClientRect().height;};
 const fragments=(original:HTMLElement)=>{
  let card=original.cloneNode(true) as HTMLElement;
  if(original.querySelector('img')&&!original.querySelector<HTMLImageElement>('img')!.naturalWidth){card.querySelector('figure')?.remove();warnings.push(`${original.dataset.name}: missing illustration; text retained.`);}
  if(height(card)<=budget)return [card];
  card.querySelectorAll('img').forEach(img=>img.style.height='18mm');if(height(card)<=budget)return [card];
  warnings.push(`${original.dataset.name}: long entry continued across columns/pages.`);
  const sections=[...card.querySelectorAll<HTMLElement>('[data-section]')];
  const base=card.cloneNode(true) as HTMLElement;base.querySelector('[data-copy]')!.replaceChildren();
  const result:HTMLElement[]=[];
  const fresh=()=>{const next=base.cloneNode(true) as HTMLElement;if(result.length){next.querySelector('figure')?.remove();next.querySelector('h2')!.append(' (continued)');}return next;};
  card=fresh();
  for(const section of sections){let words=(section.querySelector('p')?.textContent??'').split(/\s+/).filter(Boolean);
   while(words.length){const part=section.cloneNode(true) as HTMLElement;card.querySelector('[data-copy]')!.append(part);let low=0,high=words.length;
    while(low<high){const mid=Math.ceil((low+high)/2);part.querySelector('p')!.textContent=words.slice(0,mid).join(' ');if(height(card)<=budget)low=mid;else high=mid-1;}
    if(!low){part.remove();if(!card.querySelector('[data-section]'))throw Error('Trouble heading cannot fit the page.');result.push(card);card=fresh();continue;}
    part.querySelector('p')!.textContent=words.slice(0,low).join(' ');words=words.slice(low);if(words.length){result.push(card);card=fresh();}
   }
  }
  if(card.querySelector('[data-section]'))result.push(card);return result;
 };
 for(const original of source.querySelectorAll<HTMLElement>('[data-source-card]'))for(const card of fragments(original)){
  card.removeAttribute('data-source-card');let column=columns[columnIndex];column.append(card);
  // A small illustration reduction can avoid a nearly empty following column.
  // Restore normal size when the card still needs to move; never shrink prose.
  const image=card.querySelector<HTMLImageElement>('img');const oldHeight=image?.style.height??'';
  if(column.scrollHeight>column.clientHeight+1&&image)image.style.height='18mm';
  if(column.scrollHeight>column.clientHeight+1){if(image)image.style.height=oldHeight;card.remove();columnIndex++;if(columnIndex===2)newPage();column=columns[columnIndex];column.append(card);}
 }
 probe.replaceChildren();pages.forEach((page,i)=>page.querySelector('[data-page-number]')!.textContent=`${i+1} / ${pages.length}`);
 return {pages:pages.length,warnings:[...new Set(warnings)]};
}
