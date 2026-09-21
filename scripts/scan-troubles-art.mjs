// Read-only semantic review sheets: label actual current record references.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {readCollection} from '../../hackriculture-data/lib/records.mjs';
const out='output/troubles-art-audit/remaining';await fs.mkdir(out,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const [group,g]of Object.entries(readCollection('troubles'))){
 if(process.argv.length>2&&!process.argv.slice(2).includes(group))continue;
 if(['beetroot_troubles','bean_and_pea_troubles','brassica_troubles'].includes(group))continue;
 const entries=Object.entries(g.conditions);
 for(let start=0;start<entries.length;start+=12){
  const inputs=[];
  for(const [i,[key,c]]of entries.slice(start,start+12).entries()){
   const left=i%4*330,top=Math.floor(i/4)*310;
   let missing=!c.image;
   if(c.image){try{inputs.push({input:await sharp('public'+c.image).resize(310,250,{fit:'contain',background:'white'}).png().toBuffer(),left:left+10,top});}catch{missing=true;}}
   inputs.push({input:Buffer.from(`<svg width="330" height="60"><rect width="330" height="60" fill="white"/><text x="5" y="16" font-size="13">${esc(c.name)}</text><text x="5" y="34" font-size="11">${esc(key)}</text><text x="5" y="50" font-size="11" fill="red">${missing?'NO AVAILABLE IMAGE':''}</text></svg>`),left,top:top+250});
  }
  const file=`${out}/${group}-${start}.png`;
  await sharp({create:{width:1320,height:Math.ceil(Math.min(12,entries.length-start)/4)*310,channels:3,background:'white'}}).composite(inputs).png().toFile(file);console.log(file);
 }
}
