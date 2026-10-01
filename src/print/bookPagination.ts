export type BookEntry={key:string;label:string;start:number;pages:number};
export type BookEdition={vegetables:BookEntry[];troubles:BookEntry[];totalPages:number};
export type BookPagination={version:1;sourceSignature:string;editions:Record<'metric'|'imperial',BookEdition>};
/** A guide's page count is measured, not inferred from its number of conditions. */
export function makeBookEdition(vegetables:{key:string;label:string}[],troubles:{key:string;label:string}[],counts:Record<string,number>):BookEdition{
 let next=1;
 const entries=(items:{key:string;label:string}[],type:'vegetable'|'trouble')=>items.map(item=>{
  const pages=type==='vegetable'?2:counts[item.key];
  if(!Number.isInteger(pages)||pages<1)throw Error(`Missing measured page count: ${item.key}`);
  const entry={...item,start:next,pages};next+=pages;return entry;
 });
 const v=entries(vegetables,'vegetable'),t=entries(troubles,'trouble');
 return {vegetables:v,troubles:t,totalPages:next-1};
}
export function bookEntry(edition:BookEdition,type:'vegetable'|'trouble',key:string){
 const entry=edition[type==='vegetable'?'vegetables':'troubles'].find(e=>e.key===key);
 if(!entry)throw Error(`Book pagination missing ${key}; run node scripts/measure-book-pagination.mjs.`);
 return entry;
}
export function applyBookNumbers(root:HTMLElement,entry:BookEntry){
 const numbers=Array.from(root.querySelectorAll<HTMLElement>('[data-page-number]'));
 if(numbers.length!==entry.pages)throw Error(`${entry.label}: now ${numbers.length} pages, contents expects ${entry.pages}. Run node scripts/measure-book-pagination.mjs and rebuild the contents.`);
 numbers.forEach((n,i)=>n.textContent=String(entry.start+i));
}
/** Invalidate all downstream references if source data affecting ordering/length changes. */
export async function paginationSourceSignature(vegetables:Record<string,{name?:unknown;category?:unknown}>,troubles:unknown){
 const source=JSON.stringify({vegetables:Object.entries(vegetables).map(([key,v])=>[key,v.name,v.category]),troubles});
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
 return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function requireCurrentPagination(expected:string,vegetables:Record<string,{name?:unknown;category?:unknown}>,troubles:unknown){
 if(await paginationSourceSignature(vegetables,troubles)!==expected)throw Error('Book pagination is stale after source changes. Run node scripts/measure-book-pagination.mjs and rebuild the contents.');
}
