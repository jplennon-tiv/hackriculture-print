import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const jobs=JSON.parse(await fs.readFile(path.join(root,'COMPOSITIONS.json'),'utf8'));
const sources=JSON.parse(await fs.readFile(path.join(root,'SOURCES.json'),'utf8'));
for(const j of jobs){
  for(const [name,bg] of [['cream','#fff8e8'],['dark','#183e30']]){
    await sharp(path.join(root,'assets',j.id+'.png')).flatten({background:bg}).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).jpeg({quality:93}).toFile(path.join(root,'review',j.id+'-'+name+'.jpg'));
  }
}
for(const s of sources) await sharp(path.join(root,s.file)).resize({width:700,height:500,fit:'inside',withoutEnlargement:true}).jpeg({quality:90}).toFile(path.join(root,'review','source-'+s.id+'.jpg'));
for(const name of ['tomato-greenhouse','lettuce','marrow_courgette']) await sharp(path.join(root,'style-references',name+'.png')).flatten({background:'#fff8e8'}).resize({width:240,height:180,fit:'inside'}).jpeg({quality:90}).toFile(path.join(root,'review','style-'+name+'.jpg'));
for(const [name,bg,fg] of [['cream','#fff8e8','#183e30'],['dark','#183e30','#fff8e8']]){
  const layers=[];
  for(let i=0;i<jobs.length;i++){
    const j=jobs[i],x=(i%2)*800,y=Math.floor(i/2)*640;
    const b=await sharp(path.join(root,'assets',j.id+'.png')).resize({width:730,height:555,fit:'inside'}).png().toBuffer({resolveWithObject:true});
    layers.push({input:b.data,left:x+Math.floor((800-b.info.width)/2),top:y+20+Math.floor((555-b.info.height)/2)});
    const svg=`<svg width="760" height="55"><text x="20" y="37" font-family="Helvetica,sans-serif" font-size="26" fill="${fg}">${j.id.slice(0,2)}  ${j.title}</text></svg>`;
    layers.push({input:Buffer.from(svg),left:x+20,top:y+580});
  }
  await sharp({create:{width:1600,height:1280,channels:3,background:bg}}).composite(layers).jpeg({quality:92}).toFile(path.join(root,'review','contact-'+name+'.jpg'));
}
console.log('Rendered cream/dark previews, source previews and contacts.');
