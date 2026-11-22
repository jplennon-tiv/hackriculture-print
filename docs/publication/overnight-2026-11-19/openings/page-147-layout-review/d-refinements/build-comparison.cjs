const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const variants=JSON.parse(fs.readFileSync(path.join(__dirname,'VARIANTS.json'))).variants;
const names=variants.map(v=>v.id+'  '+v.label);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const layers=[];
 let svg='<svg width="1600" height="2210" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,sans-serif;fill:#173e2c;font-size:28px;font-weight:bold}</style>';
 for(let i=0;i<4;i++){
  const x=40+(i%2)*790,y=80+Math.floor(i/2)*1090;
  layers.push({input:await sharp(path.join(__dirname,'D'+(i+1)+'.png')).resize({width:730}).toBuffer(),left:x,top:y});
  svg+='<text x="'+x+'" y="'+(y-25)+'">'+names[i]+'</text>';
 }
 svg+='</svg>';layers.push({input:Buffer.from(svg),left:0,top:0});
 const file=path.join(__dirname,'Vegetable-Guru-Page-147-D-Comparison.png');
 await sharp({create:{width:1600,height:2210,channels:3,background:'#e5e7df'}}).composite(layers).png().toFile(file);
 const checks=JSON.parse(fs.readFileSync(path.join(__dirname,'LAYOUT-CHECKS.json')));
 for(const c of checks)if(c.outOfSafeBounds.length||c.overlaps.length||!c.allTopicTitlesExtracted||!c.allGroupTitlesExtracted||!c.removedOldCopyAbsent)throw Error('Layout validation failed '+c.option);
 const entries=JSON.parse(fs.readFileSync(path.join(__dirname,'../../page-147-thumbnail-review/THUMBNAILS.json'))).entries;
 const selected=[3,4,5,6,12,13,15,16];
 for(const e of entries.filter(e=>selected.includes(e.number)))if(hash(path.join(root,e.file))!==e.sha256)throw Error('Selected original changed '+e.number);
 const pdf=path.join(root,'output/pdf/page-147-layout-review/d-refinements/Vegetable-Guru-Page-147-D-Refinements.pdf');
 const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../LAYOUT-CHECKS.json')))[3];
 const baseline=path.join(__dirname,'../Option-D.png');
 const scale=72/25.4*2.5;
 const regions=[{name:'title',x:16,y:12,w:94,h:40},{name:'contents',x:16,y:56,w:162,h:98}];
 const exactTextChecks=[];
 for(const c of checks){
  if(c.pdfText!==original.pdfText)throw Error('Text changed from original D: '+c.option);
  for(const r of regions){
   const bounds={left:Math.floor(r.x*scale),top:Math.floor(r.y*scale),width:Math.floor(r.w*scale),height:Math.floor(r.h*scale)};
   const before=await sharp(baseline).extract(bounds).raw().toBuffer();
   const after=await sharp(path.join(__dirname,c.option+'.png')).extract(bounds).raw().toBuffer();
   const identical=before.equals(after);exactTextChecks.push({option:c.option,region:r.name,pixelIdentical:identical});if(!identical)throw Error('Text region pixels changed '+c.option+' '+r.name);
  }
 }
 const record={date:'2026-11-22',folio:147,status:'D selected for development; D1–D4 photographic refinements awaiting John’s choice',baseline:'../DIRECTION-SELECTION.json',selectedThumbnailPool:selected,pdf:{file:path.relative(root,pdf),sha256:hash(pdf),pages:4,order:variants.map(v=>v.id),trimMM:[185,240]},comparison:{file:path.relative(root,file),sha256:hash(file)},variants,verification:{allLayoutChecksPassed:true,textEqualsOriginalD:true,exactTextChecks,originalThumbnailHashesUnchanged:8,originalTypeAndPageNumbers:'Retained exactly',visualReview:'Pending final comparison inspection'},scope:'Photograph placement and sizes only; no book integration',delivery:'Pending'};
 fs.writeFileSync(path.join(__dirname,'REVIEW.json'),JSON.stringify(record,null,2)+'\n');
 console.log(JSON.stringify({pdfBytes:fs.statSync(pdf).size,allChecksPassed:true,exactTextRegionChecks:exactTextChecks}));
})().catch(e=>{console.error(e);process.exitCode=1});
