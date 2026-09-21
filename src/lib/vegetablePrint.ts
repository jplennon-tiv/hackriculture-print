import type {Vegetable} from '../types';

export const vegetablePrintSlots = ['introduction','key_notes','soil_facts','looking_after_the_crop','harvesting','sowing_notes','final_tips'] as const;
export type VegetablePrintSlot = typeof vegetablePrintSlots[number];
export type PrintText = string | {metric:string;imperial:string};
export interface PrintItem {text:PrintText;rank:number;star?:boolean;icon?:string;measurement_path?:string}
export type ExtractValue = string | PrintItem[] | {title:string;body:string}[];
export interface ExtractReview {
 updated_at:string;updated_by:string;status:'draft'|'approved';locked:boolean;
 dependencies:Record<string,string>;output_checksum:string;
}
export interface VegetableExtract extends ExtractReview {value:ExtractValue;editorial_note:string}
export interface VegetablePrintExtracts {version:1;sections:Partial<Record<VegetablePrintSlot,VegetableExtract>>}
export interface VegetablePrintLayout extends ExtractReview {
 renderer_revision:string;
 value:{pest_limit:number;target_pages:2;tips_position?:'full-width'|'right-column'|'left-column';intro_sentences?:number;variety_count?:number;align_bottoms?:boolean};
 measurements?:Record<string,unknown>;
}
export const VEGETABLE_PRINT_REVISION='vegetable-extracts-v4';

/** Stable change detection, not a cryptographic authentication mechanism. */
export function printChecksum(value:unknown):string {
 const stable=(v:unknown):string=>v===undefined?'missing':Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable((v as Record<string,unknown>)[k])).join(',')+'}':JSON.stringify(v);
 let h=14695981039346656037n;
 for(const b of new TextEncoder().encode(stable(value)))h=BigInt.asUintN(64,(h^BigInt(b))*1099511628211n);
 return 'fnv1a64:'+h.toString(16).padStart(16,'0');
}
export function printSource(root:unknown,path:string):unknown {
 let v=root;
 for(const key of path.split('.')){
  if(['__proto__','prototype','constructor'].includes(key)||!v||typeof v!=='object'||!Object.prototype.hasOwnProperty.call(v,key))return undefined;
  v=(v as Record<string,unknown>)[key];
 }
 return v;
}
export function extractDependencies(veg:Vegetable,paths:string[]) {
 return Object.fromEntries([...new Set(['name',...paths])].map(path=>{
  const value=printSource(veg,path);if(value===undefined)throw Error('Missing source: '+path);
  return [path,printChecksum(value)];
 }));
}
const requiredSource:Record<VegetablePrintSlot,string[]>={introduction:['introduction'],key_notes:['key_notes'],soil_facts:['soil_facts'],looking_after_the_crop:['looking_after_the_crop'],harvesting:['harvesting'],sowing_notes:['sowing_and_planting'],final_tips:['soil_facts','looking_after_the_crop']};
function review(veg:Vegetable,entry:ExtractReview,value:unknown,drafts:boolean,required:string[]) {
 if(!required.every(k=>Object.prototype.hasOwnProperty.call(entry.dependencies,k)))return 'incomplete source linkage';
 if(Object.entries(entry.dependencies).some(([k,h])=>printChecksum(printSource(veg,k))!==h))return 'source changed';
 if(printChecksum(value)!==entry.output_checksum)return 'manual edit needs review';
 if(entry.status!=='approved'&&!drafts)return 'draft awaiting approval';
 return null;
}
export function resolveVegetableExtracts(veg:Vegetable,drafts=false){
 const values:Partial<Record<VegetablePrintSlot,ExtractValue>>={},warnings:string[]=[];
 if(!veg.ai_print_extracts)return {values,warnings};
 if(veg.ai_print_extracts.version!==1)return {values,warnings:['Vegetable print extracts: unsupported version; source used.']};
 for(const slot of vegetablePrintSlots){
  const entry=veg.ai_print_extracts.sections[slot];if(!entry)continue;
  const bound=Array.isArray(entry.value)?(entry.value as PrintItem[]).filter(i=>i.measurement_path).map(i=>i.measurement_path!):[];
  const bindingInvalid=bound.some(path=>{
   const value=printSource(veg,path);
   return !Object.keys(entry.dependencies).some(dep=>path===dep||path.startsWith(dep+'.'))||
    !(typeof value==='string'||value&&typeof value==='object'&&typeof (value as Record<string,unknown>).metric==='string'&&typeof (value as Record<string,unknown>).imperial==='string');
  });
  const reason=bindingInvalid?'invalid measurement linkage':review(veg,entry,entry.value,drafts,['name',...requiredSource[slot]]);
  if(reason)warnings.push(`${slot}: ${reason}; existing source rendering used.`);else values[slot]=entry.value;
 }
 return {values,warnings};
}
export function printItems(value:ExtractValue|undefined,units:'metric'|'imperial',veg?:Vegetable):PrintItem[]|undefined {
 if(!Array.isArray(value))return undefined;
 return (value as PrintItem[]).map(item=>{
  const text=typeof item.text==='string'?item.text:item.text[units];
  const measurement=item.measurement_path?printSource(veg,item.measurement_path):null;
  const unitValue=typeof measurement==='string'?measurement:measurement&&typeof measurement==='object'?(measurement as Record<string,unknown>)[units]:null;
  return {...item,text:item.measurement_path?`${text} ${typeof unitValue==='string'?unitValue:'[measurement unavailable]'}`:text};
 });
}
export function layoutDependencies(veg:Vegetable):Record<string,string>{
 // Layout can be affected by any content field, but never by attribution or
 // metadata alone. Section approval dates do not change its measured content.
 return Object.fromEntries(Object.entries(veg).filter(([k])=>k!=='_field_metadata'&&k!=='metadata'&&!k.startsWith('ai_')).map(([k,v])=>[k,printChecksum(v)]));
}
export function resolveVegetablePrintLayout(veg:Vegetable,drafts=false){
 const layout=veg.ai_print_layout;if(!layout)return {layout:null,warning:null};
 const reason=layout.renderer_revision!==VEGETABLE_PRINT_REVISION?'renderer changed':
  printChecksum(layout.dependencies)!==printChecksum(layoutDependencies(veg))?'layout source changed':
  review(veg,layout,{...layout.value,extracts:Object.fromEntries(Object.entries(veg.ai_print_extracts?.sections??{}).map(([k,v])=>[k,v.value]))},drafts,[]);
 if(reason)return {layout:null,warning:`Vegetable saved layout: ${reason}; automatic fitting used.`};
 if(resolveVegetableExtracts(veg,drafts).warnings.length)return {layout:null,warning:'Vegetable saved layout: extracts need review; automatic fitting used.'};
 return {layout:layout.value,warning:null};
}
export function assertVegetableExtractWritable(veg:Vegetable,slot:VegetablePrintSlot){
 const entry=veg.ai_print_extracts?.sections[slot];if(!entry)return;
 if(entry.locked)throw Error(`${slot} is locked`);
 if(printChecksum(entry.value)!==entry.output_checksum)throw Error(`${slot} has manual edits; preserve them`);
}
