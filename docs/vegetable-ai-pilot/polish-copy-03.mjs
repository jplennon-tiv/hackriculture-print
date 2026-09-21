import assert from 'node:assert/strict';
import {readCollection,revision,saveCollections} from '../../../hackriculture-data/lib/records.mjs';
import {assertVegetableExtractWritable,resolveVegetablePrintLayout,printChecksum} from '../../src/lib/vegetablePrint.ts';
const rev=revision(),data=readCollection('vegetables');
for(const [key,slot]of [['broccoli','harvesting'],['brussels_sprouts','sowing_notes']]){
 const v=data[key],p=v.ai_print_layout,e=v.ai_print_extracts.sections[slot];
 assert.equal(p.status,'draft');assert.equal(p.locked,false);assert.equal(e.status,'draft');
 assert.equal(resolveVegetablePrintLayout(v,true).warning,null);assertVegetableExtractWritable(v,slot);
 if(key==='broccoli'){
  e.value=v.harvesting.map(item=>({text:item.text,rank:item.rank,icon:'harvest'}));
  e.editorial_note='Full original five harvest paragraphs restored to use spare right-column space, including side-shoot duration and late-picking distinctions. Master text unchanged.';
 }else{
  // Exact source short wording lets the existing optional-note deduper match it.
  e.value[1].text=v.sowing_and_planting.notes[2].short_text;
  e.editorial_note='Source-grounded sowing timing plus exact reviewed optional-note wording to prevent duplicate frame/holding-bed advice. Master and approved planting companion unchanged.';
 }
 e.output_checksum=printChecksum(e.value);e.updated_at=new Date().toISOString();
 p.output_checksum=printChecksum({...p.value,extracts:Object.fromEntries(Object.entries(v.ai_print_extracts.sections).map(([s,e])=>[s,e.value]))});
 p.updated_at=new Date().toISOString();delete p.measurements;
}
console.log(saveCollections({vegetables:data},{expectedRevision:rev,actor:'AI:gpt-6-astra'}));
