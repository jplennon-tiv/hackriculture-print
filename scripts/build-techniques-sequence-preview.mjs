import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

// A bounded ordering proof. Existing content PDFs are reused by the assembler.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'docs/publication/techniques-sequence');
const tmp=path.join(root,'tmp/pdfs/techniques-sequence');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
await fs.mkdir(dir,{recursive:true});await fs.mkdir(tmp,{recursive:true});
const book=await read('docs/publication/whole-book-order-preview/CHECKS.json');
const reader=(await read('docs/publication/reader-edit-pass/techniques/PDF-CHECKS.json')).find(p=>p.units==='imperial'&&p.mode==='clean');
const rotation=await read('docs/publication/topic-pages/crop-rotation-planning/APPROVAL-2026-10-18.json');
const nutrient=await read('docs/publication/topic-pages/nutrient-cycles/APPROVAL-2026-10-18.json');
const inputs={};
async function protect(p,h){const a=path.resolve(root,p);const actual=sha(await fs.readFile(a));if(h&&actual!==h)throw Error('Source changed: '+p);inputs[path.relative(root,a)]=actual;return path.relative(root,a);}
const bookPath=await protect(book.pdf,book.sha256);
const readerPath=await protect(reader.pdf,reader.sha256);
const rotationPath=await protect('docs/publication/topic-pages/crop-rotation-planning/references/approved-2026-10-18/crop-rotation-planning-imperial.pdf',rotation.proofs[0].sha256);
await protect(nutrient.proof.path,nutrient.proof.sha256);
const nutrientHtml='docs/publication/topic-pages/nutrient-cycles/references/approved-2026-10-18/page.html';
await protect(nutrientHtml,nutrient.frozen[nutrientHtml]);
for(const [p,h] of Object.entries(nutrient.retainedAssets))await protect(p,h);
for(const p of ['docs/publication/topic-pages/nutrient-cycles/draft.css','docs/publication/topic-pages/techniques-expansion/references/collection-approved-2026-10-12/draft.css'])await protect(p);
const pages=[];
const add=(folio,label,source,sourcePage,sourceFolio,kind='topic')=>pages.push({folio,label,source,sourcePage,sourceFolio,kind,pdfPage:pages.length+1});
const old=(folio,label,sourceFolio)=>add(folio,label,bookPath,sourceFolio+2,sourceFolio);
old(145,'Growing Techniques',145);pages[0].kind='opener';
old(146,'Organic growing · The core ideas',146);
add(147,'Nutrient cycles · Feed the soil','tmp/pdfs/techniques-sequence/nutrient-147.pdf',1,147);
add(148,'Crop rotation & planning · Families and three years',rotationPath,1,156);
add(149,'Crop rotation & planning · Succession and four beds',rotationPath,2,157);
add(150,'Blank · preserves the following facing topics',null,null,null,'blank');
old(151,'Planning your plot · Choosing the right spot',147);
old(152,'Beds and paths · Straight paths and keyholes',148);
old(153,'Beds and paths · Finger paths and leaf patterns',149);
add(154,'Making compost · The secret’s in the bin',readerPath,1,154);
add(155,'Making compost · Feed it, leave it, use it',readerPath,2,155);
old(156,'Dig or No-Dig · Choosing your approach',150);
old(157,'Dig or No-Dig · No dig',151);
old(158,'Dig or No-Dig · Digging part 1',152);
old(159,'Dig or No-Dig · Digging part 2',153);
add(160,'Sowing and planting · A sound start',readerPath,4,157);
old(161,'Watering · Read the soil, water the roots',158);
add(162,'Blank · preserves the greenhouse continuation spread',null,null,null,'blank');
old(163,'Greenhouses · What, where & how big?',159);
add(164,'Greenhouses · Pots and raised beds',readerPath,5,160);
add(165,'Greenhouses · No-dig beds and seasons',readerPath,6,161);

// Only this short navigation reference and page parity change in the nutrient source.
let html=await fs.readFile(path.join(root,nutrientHtml),'utf8');
if(!html.includes('pages 156–157.'))throw Error('Expected rotation reference missing');
html=html.replace('class="sheet verso nutrient-reference"','class="sheet nutrient-reference"').replace('data-folio="158"','data-folio="147"').replace('pages 156–157.','pages 148–149.').replace('<span>158</span></footer>','<span>147</span></footer>');
await fs.writeFile(path.join(dir,'nutrient-147.html'),html);
const footerSource=await fs.readFile(path.join(root,'docs/publication/whole-book-order-preview/footers.html'),'utf8');
const style=footerSource.match(/<style>([\s\S]*?)<\/style>/)[1];
const footerPages=pages.filter(p=>p.kind==='topic');
const footerHtml='<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>'+style+'</style></head><body>'+footerPages.map(p=>`<section class="sheet" data-folio="${p.folio}"><footer style="left:${p.folio%2?17:8}mm;right:${p.folio%2?8:17}mm"><span class="section-label">GROWING TECHNIQUES</span><span class="folio">${p.folio}</span></footer></section>`).join('')+'</body></html>';
await fs.writeFile(path.join(dir,'footers.html'),footerHtml);
const browser=await chromium.launch();const renders=[];
try{
 for(const [file,out] of [['nutrient-147.html','nutrient-147.pdf'],['footers.html','footers.pdf']]){
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto('http://127.0.0.1:5173/docs/publication/techniques-sequence/'+file,{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const result=await page.evaluate(()=>({sheets:document.querySelectorAll('.sheet').length,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),overflow:[...document.querySelectorAll('p,th,td,h1,h2,footer')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)}));
  if(file==='nutrient-147.html')result.geometry=await page.evaluate(()=>{const s=document.querySelector('.sheet'),b=s.getBoundingClientRect(),c=s.querySelector('.page-content').getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect(),mm=96/25.4;return {leftMm:(c.left-b.left)/mm,rightMm:(c.right-b.left)/mm,footerClearanceMm:(f.top-c.bottom)/mm,bodyFontPt:parseFloat(getComputedStyle(s.querySelector('.example p')).fontSize)*.75};});
  if(errors.length||result.overflow.length||result.images.some(i=>!i.loaded)||result.fonts.some(f=>f.status!=='loaded'&&(file!=='footers.html'||f.family==='Nunito')))throw Error(JSON.stringify({errors,result}));
  if(result.geometry&&(result.geometry.leftMm<16.8||result.geometry.rightMm>177.2||result.geometry.footerClearanceMm<3))throw Error('Nutrient geometry failed');
  await page.pdf({path:path.join(tmp,out),preferCSSPageSize:true,printBackground:true});
  renders.push({file,pdf:path.relative(root,path.join(tmp,out)),...result});await page.close();
 }
}finally{await browser.close();}
const plan={date:'2026-10-18',status:'Section-only order proof, awaiting John’s review',units:'imperial; nutrient page retains its approved dual-unit depth',folioRange:[145,165],pages,inputs,footerFolios:footerPages.map(p=>p.folio),renders,proposedBlanks:[{folio:150,reason:'Places the plot introduction on the right and preserves the Beds and paths, compost and cultivation pairs.'},{folio:162,reason:'Places the greenhouse introduction on the right, followed by facing growing-options pages.'}],facingPairs:[[146,147],[148,149],[152,153],[154,155],[156,157],[158,159],[160,161],[164,165]],copyChanges:[{folio:147,before:'pages 156–157',after:'pages 148–149',reason:'Rotation reference follows this proposed order.'}],fullBookChanged:false,canonicalDataChanged:false};
await fs.writeFile(path.join(dir,'ASSEMBLY.json'),JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({pages:pages.length,blanks:plan.proposedBlanks.map(p=>p.folio),rendered:renders.map(r=>[r.file,r.sheets])}));
