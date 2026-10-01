// Isolated browser-only study. Requires start.command; never writes live templates or data.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('./',import.meta.url).pathname;
const studies=process.argv.includes("--studies");
const verdant=process.argv.includes("--verdant");
const pdfPilot=process.argv.includes("--pdf");
assert([studies,verdant,pdfPilot].filter(Boolean).length<=1,'Choose one pilot mode');
const pdfOut=new URL("../../output/pdf/garden-green-pilot/",import.meta.url).pathname;
if(pdfPilot)await fs.mkdir(pdfOut,{recursive:true});
const themes=(pdfPilot||verdant)?["garden-green"]:studies?["garden-green","light-leafy","harvest-pop"]:[null];
const browser=await chromium.launch();const results=[];
try{
 const p=await browser.newPage({viewport:{width:688,height:979},deviceScaleFactor:2});
 await p.emulateMedia({media:'print'});
 for(const theme of themes)for(const units of ['metric','imperial']){
  await p.goto(`http://127.0.0.1:5173/print/vegetable/carrot?units=${units}`,{waitUntil:'networkidle'});
  await p.waitForFunction(()=>document.body.dataset.printReady==='true');
  const pages=p.locator('[class*="cheatPage_"]');
  const measure=()=>p.evaluate(()=>({pages:[...document.querySelectorAll('[class*="cheatPage_"]')].map(e=>({height:e.getBoundingClientRect().height,end:e.lastElementChild.getBoundingClientRect().bottom-e.getBoundingClientRect().top})),widgets:[...document.querySelectorAll('[class*="cheatQfCard_"],[class*="cheatReqCard_"],[class*="cheatCard_"],[class*="cheatFinalTips_"]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}),text:document.body.innerText,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
  const before=await measure();
  if(!studies&&!pdfPilot&&!verdant&&units==='metric')await pages.first().screenshot({path:out+'carrot-current.png'});
  await p.addStyleTag({url:'https://fonts.googleapis.com/css2?family=Lilita+One&display=swap'});
  await p.evaluate(async()=>{await document.fonts.load('400 48px "Lilita One"');await document.fonts.ready;});
  await p.addStyleTag({content:`
  [class*="cheatName_"], [class*="cheatCardHd_"], [class*="cheatQfHd_"], [class*="cheatNeedHd_"], [class*="cheatKeyRiskName_"], [class*="cheatQfLbl_"], [class*="cheatNeedLbl_"], [class*="cheatFinalTipsHd_"], [class*="cheatPage2HdName_"] {font-family:'Lilita One',sans-serif!important;font-weight:400!important;}
  [class*="cheatName_"] {letter-spacing:0!important;}
  [class*="cheatNeedLegend_"]{font-family:Inter,sans-serif!important;}
  `});
  if(theme)await p.addStyleTag({content:await fs.readFile(out+'themes/'+theme+'.css','utf8')});
  if(pdfPilot||verdant)await p.addStyleTag({content:await fs.readFile(out+'themes/garden-green-two-page.css','utf8')});
  await p.evaluate(async()=>{
   const img=document.querySelector('img[class*="cheatBodyImg_"]');
   const r=img.getBoundingClientRect();
   // Hold the approved hero footprint, preserving the surrounding layout.
   img.style.width=r.width+'px';img.style.height=r.height+'px';img.style.objectFit='contain';
   // Blend this opaque concept asset onto the existing pale page background.
   img.style.filter='brightness(1.05)';img.style.mixBlendMode='multiply';
   img.src='/docs/vegetable-style-pilot/assets/carrot-c-style.png';await img.decode();
   await document.fonts.ready;
  });
  if(verdant){
   if(units==='metric')await pages.first().screenshot({path:out+'carrot-garden-green.png'});
   await p.addStyleTag({content:await fs.readFile(out+'themes/verdant.css','utf8')});
   await p.evaluate(async()=>{
    const img=document.querySelector('img[class*="cheatBodyImg_"]');
    const page=img.closest('[class*="cheatPage_"]');
    const r=img.getBoundingClientRect(),pr=page.getBoundingClientRect();
    const backdrop=document.createElement('div');
    backdrop.className='verdant-backdrop';backdrop.setAttribute('aria-hidden','true');
    backdrop.style.left=(r.left-pr.left+5)+'px';backdrop.style.top=(r.top-pr.top+28)+'px';
    backdrop.style.width=(r.width+30)+'px';backdrop.style.height=(r.height-26)+'px';
    page.prepend(backdrop);
    img.src='/docs/vegetable-style-pilot/assets/carrot-cutout.png';
    img.style.filter='none';img.style.mixBlendMode='normal';
    await img.decode();
   });
  }
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const after=await measure();
  assert.equal(after.text,before.text,'Advice changed');assert.equal(after.missing,0);assert.deepEqual(after.widgets,before.widgets,'Widget geometry changed');assert.deepEqual(after.pages,before.pages,'Page dimensions changed');assert.equal(after.pages.length,2);
  const font=await p.evaluate(()=>document.fonts.check('400 48px "Lilita One"'));assert(font);
  if(!pdfPilot&&units==='metric')await pages.first().screenshot({path:out+(verdant?'carrot-verdant.png':theme?'carrot-'+theme+'.png':'carrot-c-style.png')});
  const {text:ignored1,...beforeSizing}=before,{text:ignored2,...afterSizing}=after;
  let physicalPages=null;
  if(pdfPilot){
   const bytes=await p.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
   physicalPages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)??[]).length;
   assert.equal(physicalPages,2,units+': PDF overflow');
   await fs.writeFile(pdfOut+'carrot-'+units+'.pdf',bytes);
  }
  results.push({theme,units,physicalPages,fontLoaded:font,textUnchanged:true,before:beforeSizing,after:afterSizing});
 }
 await fs.writeFile(out+(verdant?'VERDANT-CHECKS.json':pdfPilot?'PDF-CHECKS.json':studies?'STUDY-CHECKS.json':'CHECKS.json'),JSON.stringify({scope:pdfPilot?'Two-page A4 PDF pilot; both units':'Browser-only font and hero mockup; no PDF pagination claim',results},null,2)+'\n');
 console.log(results.map(r=>`${r.theme??"pilot"}/${r.units}: fonts and images loaded; text and widget geometry unchanged${r.physicalPages?`; ${r.physicalPages} PDF pages`:""}`).join("\n"));
}finally{await browser.close();}
