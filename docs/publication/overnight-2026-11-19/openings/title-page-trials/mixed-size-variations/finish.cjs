const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require(path.join(process.cwd(),'node_modules/sharp'));
const work=__dirname,m=JSON.parse(fs.readFileSync(path.join(work,'VARIANTS.json')));
const pdf='output/pdf/title-page-trials/mixed-size-variations/Vegetable-Guru-Title-Page-Six-Variations.pdf';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
(async()=>{
 const pageW=440,pageH=Math.round(pageW*240/185),gap=32,left=34,top=115,rowH=pageH+64;
 const width=3*pageW+2*gap+2*left,height=top+2*rowH+20,c=[];
 let labels=`<text x="34" y="39" font-size="27" font-weight="700">The Vegetable Guru · Six title-page variations</text><text x="34" y="69" font-size="17">One large photograph, one medium and three thumbnails · Existing artwork</text>`;
 for(let i=0;i<m.variants.length;i++){
  const v=m.variants[i],x=left+(i%3)*(pageW+gap),y=top+Math.floor(i/3)*rowH;
  labels+=`<text x="${x}" y="${y-13}" font-size="18" font-weight="700">${v.id} · ${escape(v.title)}</text><rect x="${x-1}" y="${y-1}" width="${pageW+2}" height="${pageH+2}" fill="none" stroke="#c9c4b7"/>`;
  c.push({input:await sharp(path.join(work,v.id+'.png')).resize(pageW,pageH).png().toBuffer(),left:x,top:y});
 }
 c.push({input:Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><g font-family="Arial" fill="#173e2c">${labels}</g></svg>`),left:0,top:0});
 await sharp({create:{width,height,channels:3,background:'#ede9dc'}}).composite(c).jpeg({quality:92}).toFile(path.join(work,'comparison-preview.jpg'));
 const check=JSON.parse(fs.readFileSync(path.join(work,'CHECKS.json')));
 const review={date:'2026-11-22',status:'Layout proposals; awaiting visual inspection and John’s selection',pdf:{file:pdf,sha256:hash(pdf),pages:6,trimMM:[185,240]},renders:m.variants.map(v=>({id:v.id,file:path.relative(process.cwd(),path.join(work,v.id+'.png')),sha256:hash(path.join(work,v.id+'.png'))})),sourcesVerified:Object.values(m.assets).every(a=>hash(a.file)===a.sha256),pictureCountEach:5,roleCountEach:{large:1,medium:1,thumbnail:3},copyVerifiedOnAllPages:check.allExpectedTextVerified,minimumEffectiveDPI:Math.min(...check.variants.flatMap(v=>v.pictures.map(p=>p.effectiveDPI))),productionStatus:'Layout comparison only; no full-book integration or supplier preparation'};
 fs.writeFileSync(path.join(work,'REVIEW.json'),JSON.stringify(review,null,2)+'\n');
 console.log(JSON.stringify({pdf:review.pdf,minimumEffectiveDPI:review.minimumEffectiveDPI,allSourceHashesMatch:review.sourcesVerified,comparison:[width,height]}));
})();
