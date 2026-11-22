const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const names=['A  Checkerboard above','B  Contents beside photos','C  Six photo-led groups','D  Checkerboard at the foot'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const layers=[];
 let svg='<svg width="1600" height="2210" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,sans-serif;fill:#173e2c;font-size:28px;font-weight:bold}</style>';
 for(let i=0;i<4;i++){
  const x=40+(i%2)*790,y=80+Math.floor(i/2)*1090;
  layers.push({input:await sharp(path.join(__dirname,'Option-'+String.fromCharCode(65+i)+'.png')).resize({width:730}).toBuffer(),left:x,top:y});
  svg+='<text x="'+x+'" y="'+(y-25)+'">'+names[i]+'</text>';
 }
 svg+='</svg>';layers.push({input:Buffer.from(svg),left:0,top:0});
 const file=path.join(__dirname,'Vegetable-Guru-Page-147-Layout-Comparison.png');
 await sharp({create:{width:1600,height:2210,channels:3,background:'#e5e7df'}}).composite(layers).png().toFile(file);
 const checks=JSON.parse(fs.readFileSync(path.join(__dirname,'LAYOUT-CHECKS.json')));
 for(const c of checks)if(c.outOfSafeBounds.length||c.overlaps.length||!c.allTopicTitlesExtracted||!c.allGroupTitlesExtracted||!c.removedOldCopyAbsent)throw Error('Layout validation failed '+c.option);
 const entries=JSON.parse(fs.readFileSync(path.join(__dirname,'../page-147-thumbnail-review/THUMBNAILS.json'))).entries;
 const selected=[3,4,5,6,12,13,15,16];
 for(const e of entries.filter(e=>selected.includes(e.number)))if(hash(path.join(root,e.file))!==e.sha256)throw Error('Selected original changed '+e.number);
 const pdf=path.join(root,'output/pdf/page-147-layout-review/Vegetable-Guru-Page-147-Layout-Options.pdf');
 const record={date:'2026-11-22',folio:147,status:'Four layout proposals for John to choose; no final layout approval',selectedThumbnailPool:selected,selectionRecord:'../page-147-thumbnail-review/SELECTION.json',pdf:{file:path.relative(root,pdf),sha256:hash(pdf),pages:4,order:['A','B','C','D'],trimMM:[185,240]},comparison:{file:path.relative(root,file),sha256:hash(file)},sources:['CONTENTS.json','../page-147-thumbnail-review/THUMBNAILS.json'],layoutChanges:'Removed all original page text except Growing Techniques, including the small section badge, brand line, lead, description, lower strapline and folio. Added six established subsection groups, 19 topic entries and page references covering 148–171 exactly once.',photoHandling:'Selected source files retained unchanged. Layout derivatives use proportional central square crops, with no stretching, retouching or regeneration.',verification:'All four final PDF pages rendered and visually inspected. Local Lilita One and Nunito Sans used. All topic and group titles extracted. Text glyph and photo bounds have no collisions and stay within content safety. The original divider was inspected for source comparison. No whole-book or supplier work.',options:checks.map((c,i)=>({letter:c.option,name:names[i].slice(3),photos:c.photoNumbers,contentBottomMM:c.contentBottomMM})),delivery:'Pending'};
 fs.writeFileSync(path.join(__dirname,'REVIEW.json'),JSON.stringify(record,null,2)+'\n');
 console.log(JSON.stringify({pdfBytes:fs.statSync(pdf).size,allChecksPassed:true,selectedSourceHashesUnchanged:8}));
})().catch(e=>{console.error(e);process.exitCode=1});
