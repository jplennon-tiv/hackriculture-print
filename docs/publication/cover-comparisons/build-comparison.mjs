import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const out = path.join(root, 'output/pdf/cover-comparisons/The-Vegetable-Guru-Cover-Comparisons.pdf');
fs.mkdirSync(path.dirname(out), {recursive:true});
const mm = 72/25.4, W=630*mm, H=290*mm;
const sources = [
 ['1  Refined original','generated_images/exec-4e5246c9-2427-492a-8eb4-bb092933c6fc.png','generated_images/exec-bf09bae9-3c30-426f-942d-00f2966edf86.png'],
 ['2  New illustrated composition','generated_images/exec-1b38cabc-10b2-4146-818f-3070c878915e.png','generated_images/exec-bdb6a50e-d5dc-4f06-ac37-8ae34309621e.png'],
 ['3  Photographic design','generated_images/exec-15c41806-e3dd-478a-a983-99bed9ec3437.png',null],
];
const objs=[null];
const add=x=>(objs.push(Buffer.isBuffer(x)?x:Buffer.from(x)),objs.length-1);
const stream=(dict,b)=>Buffer.concat([Buffer.from(`<< ${dict} /Length ${b.length} >>\nstream\n`),b,Buffer.from('\nendstream')]);
const catalog=add(''), pages=add('');
const regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
const escape=s=>s.replace(/([\\()])/g,'\\$1');
const pageIds=[];
for(let side=1;side<=2;side++) {
 let ops='0.98 0.98 0.965 rg 0 0 '+W+' '+H+' re f\n';
 const text=(s,x,y,size=12,font='F1',colour='0.12 0.22 0.17')=>{ops+=`${colour} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escape(s)}) Tj ET\n`;};
 text('THE VEGETABLE GURU',15*mm,H-15*mm,22,'F2');
 text(side===1?'Front covers':'Back covers',15*mm,H-23*mm,13);
 text('Design comparison  |  12 November 2026',440*mm,H-15*mm,12);
 const xobjects=[];
 for(let i=0;i<3;i++) {
   const x=(15+i*207.5)*mm, y=16*mm, cw=185*mm,ch=240*mm;
   text(sources[i][0],x,H-31*mm,14,'F2');
   const src=sources[i][side];
   if(src){
     const {data,info}=await sharp(path.join(root,src)).flatten({background:'#ffffff'}).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toBuffer({resolveWithObject:true});
     const id=add(stream(`/Type /XObject /Subtype /Image /Width ${info.width} /Height ${info.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,data));
     xobjects.push(`/Im${i} ${id} 0 R`);
     const scale=Math.min(cw/info.width,ch/info.height),iw=info.width*scale,ih=info.height*scale;
     ops+=`q ${iw} 0 0 ${ih} ${x+(cw-iw)/2} ${y+(ch-ih)/2} cm /Im${i} Do Q\n`;
   }else{
     ops+=`0.94 0.95 0.93 rg ${x} ${y} ${cw} ${ch} re f\n0.65 0.70 0.66 RG 1 w [5 5] 0 d ${x} ${y} ${cw} ${ch} re S [] 0 d\n`;
     text('Back cover not yet designed',x+27*mm,y+123*mm,20,'F2');
     text('Reserved for the photographic direction.',x+27*mm,y+112*mm,13);
   }
 }
 text('Working design studies - not production artwork. No overall winner selected.',15*mm,7*mm,10);
 text(`${side} / 2`,602*mm,7*mm,10);
 const content=add(stream('',Buffer.from(ops)));
 pageIds.push(add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> /XObject << ${xobjects.join(' ')} >> >> /Contents ${content} 0 R >>`));
}
objs[pages]=Buffer.from(`<< /Type /Pages /Count 2 /Kids [${pageIds.map(i=>i+' 0 R').join(' ')}] >>`);
objs[catalog]=Buffer.from(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
const info=add('<< /Title (The Vegetable Guru - Three Cover Directions) /Author (John Lennon) /Subject (Front and back cover comparison - 12 November 2026) >>');
const chunks=[Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n','binary')],offsets=[0];
let pos=chunks[0].length;
for(let i=1;i<objs.length;i++){offsets[i]=pos;const b=Buffer.concat([Buffer.from(`${i} 0 obj\n`),objs[i],Buffer.from('\nendobj\n')]);chunks.push(b);pos+=b.length;}
const xref=pos;
chunks.push(Buffer.from(`xref\n0 ${objs.length}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objs.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
fs.writeFileSync(out,Buffer.concat(chunks));
console.log(out);
