const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const variants=JSON.parse(fs.readFileSync(path.join(__dirname,'VARIANTS.json'))).variants;
(async()=>{
 const layers=[];let svg='<svg width="1600" height="2210" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,sans-serif;fill:#173e2c;font-size:28px;font-weight:bold}</style>';
 for(let i=0;i<4;i++){const x=40+(i%2)*790,y=80+Math.floor(i/2)*1090;
  layers.push({input:await sharp(path.join(__dirname,'Option-'+variants[i].id+'.png')).resize({width:730}).png().toBuffer(),left:x,top:y});
  svg+=`<text x="${x}" y="${y-25}">${variants[i].id}  ${variants[i].label}</text>`;
 }
 svg+='</svg>';layers.push({input:Buffer.from(svg),left:0,top:0});
 const comparison=path.join(__dirname,'Vegetable-Guru-Page-99-Layout-Comparison.png');
 await sharp({create:{width:1600,height:2210,channels:3,background:'#e5e7df'}}).composite(layers).png().toFile(comparison);
 await sharp(comparison).resize(1300).jpeg({quality:92}).toFile(path.join(__dirname,'comparison-preview.jpg'));
 const checks=JSON.parse(fs.readFileSync(path.join(__dirname,'LAYOUT-CHECKS.json')));
 for(const c of checks)if(c.outOfSafeBounds.length||c.overlaps.length||!c.allGroupTitlesExtracted||!c.allPageRangesExtracted||!c.removedOldCopyAbsent||!c.folioPresent||!c.titlePresent||c.photoSizesMM.some(x=>x!==29))throw Error('Layout validation failed '+c.option);
 const selection=JSON.parse(fs.readFileSync(path.join(__dirname,'../page-99-thumbnail-review/SELECTION.json')));
 for(const e of selection.photos)if(hash(path.join(root,e.file))!==e.sha256)throw Error('Selected original changed '+e.number);
 const contents=JSON.parse(fs.readFileSync(path.join(__dirname,'CONTENTS.json')));
 if(hash(path.join(root,contents.source))!==contents.sourceSHA256)throw Error('Page map changed');
 const pdf=path.join(root,'output/pdf/page-99-layout-review/Vegetable-Guru-Page-99-Layout-Options.pdf');
 const record={date:'2026-11-22',folio:99,status:'Four proposals awaiting John’s layout selection',selectedThumbnailPool:selection.selected,selectionRecord:'../page-99-thumbnail-review/SELECTION.json',pdf:{file:path.relative(root,pdf),sha256:hash(pdf),pages:4,order:variants.map(v=>v.id),trimMM:[185,240]},comparison:{file:path.relative(root,comparison),sha256:hash(comparison)},designSource:'docs/publication/overnight-2026-11-19/openings/page-147-layout-review/selected-d2-folio/APPROVAL.json',sources:['CONTENTS.json','VARIANTS.json','../page-99-thumbnail-review/THUMBNAILS.json'],changes:'Old page-99 wording retained only as title and folio. Added all fourteen existing crop-group headings and their full page ranges. Repeated Troubles suffix omitted under the section title; no other group names changed. Orange 16 pt Lilita group-heading role and green 10 pt Nunito page references reused from the approved format.',photoHandling:'All eight selected source files unchanged; proportional central square derivatives, all placed at 29 mm. No new artwork generation.',verification:{actualPDFRendered:true,allGroupTitlesAndRangesExtracted:true,folioOnEveryPage:true,noOverlapsOrUnsafeBounds:true,sourceMapHashUnchanged:true,allEightSourceHashesUnchanged:true},options:variants,delivery:'Pending'};
 fs.writeFileSync(path.join(__dirname,'REVIEW.json'),JSON.stringify(record,null,2)+'\n');
 console.log(JSON.stringify({pdfBytes:fs.statSync(pdf).size,checks:'passed',photosPerPage:8,pages:4}));
})().catch(e=>{console.error(e);process.exitCode=1});
