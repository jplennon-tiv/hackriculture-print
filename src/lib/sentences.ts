/** Preserve gardening abbreviations and decimal measurements when shortening prose. */
export function sentenceParts(text:string):string[] {
 const protectedText=text
  .replace(/\b(?:[A-Z]\.){2,}/g,s=>s.replace(/\./g,'\uE000'))
  .replace(/\b(?:No|Dr|Mr|Mrs|St)\.(?=\s+\S)/g,s=>s.replace('.','\uE000'))
  .replace(/\b(?:in|ft|oz|lb|lbs|cm|mm)\.(?=\s+[a-z0-9])/g,s=>s.replace('.','\uE000'))
  .replace(/(?<=\d)\.(?=\d)/g,'\uE000');
 const ends=[...protectedText.matchAll(/[.!?]+(?:["')\]]*)(?=\s|$)/g)].map(m=>m.index!+m[0].length);
 const parts:string[]=[];let start=0;
 for(const end of ends){const part=text.slice(start,end).trim();if(part)parts.push(part);start=end;}
 const tail=text.slice(start).trim();if(tail)parts.push(tail);
 return parts;
}
export const firstSentence=(text:string)=>sentenceParts(text)[0]??'';
export const countSentences=(text:string)=>sentenceParts(text).length;
export const firstNSentences=(text:string,n:number)=>sentenceParts(text).slice(0,n).join(' ');
