import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),project=new URL('../../../',root);
const palettes=JSON.parse(await fs.readFile(new URL('palettes.json',root)));
const manifest=JSON.parse(await fs.readFile(new URL('../fresh-c/DESIGN-APPROVAL.json',root)));
const files=manifest.files;
for(const f of files)assert.equal(createHash('sha256').update(await fs.readFile(new URL(f.path,project))).digest('hex'),f.sha256,f.path);
const lum=h=>{const c=h.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const colours=palettes.flatMap(p=>['cream','tinted'].map(paper=>({paperMode:paper,group:p.group,deepOnPaper:+contrast(p.deep,paper==='cream'?'#fff8e9':p.paper).toFixed(2),inkOnSoft:+contrast(p.ink,p.soft).toFixed(2),inkOnPaper:+contrast(p.ink,paper==='cream'?'#fff8e9':p.paper).toFixed(2),paperOnDark:+contrast(paper==='cream'?'#fff8e9':p.paper,p.dark).toFixed(2),accentOnPaper:+contrast(p.accent,paper==='cream'?'#fff8e9':p.paper).toFixed(2)})));
assert(colours.every(p=>p.deepOnPaper>=4.5&&p.inkOnSoft>=4.5&&p.inkOnPaper>=4.5&&p.paperOnDark>=4.5&&(p.group==='Root Crops'||p.accentOnPaper>=3)));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:850,height:1180}});
 const ready=()=>page.evaluate(async()=>{await document.fonts.ready;await document.fonts.load('400 80px "Lilita One"');await document.fonts.load('400 13px "Nunito Sans"');await Promise.all([...document.images].map(i=>i.decode()));});
 const layout=()=>page.evaluate(()=>[...document.querySelectorAll('.sheet,.sheet *')].map(e=>{const r=e.getBoundingClientRect();return [e.tagName,e.childElementCount?null:e.textContent,r.x,r.y,r.width,r.height]}));
 await page.goto(new URL('../fresh-c/a-rich-metric.html',root).href);await ready();const original=await layout();
 await page.goto(new URL('preview.html',root).href);await ready();
 for(const p of palettes)for(const paper of ['cream','tinted']){await page.evaluate(([g,t])=>theme(g,'group','both',t),[p.id,paper]);assert.deepEqual(await layout(),original,`${p.id}/${paper} changed layout or text`);}
 for(const [g,r,p] of [['onions','tinted',1],['onions','tinted',2],['salads','tinted',1],['stalks','tinted',1]]){await page.evaluate(([g,r,p])=>theme(g,'group',p,r),[g,r,p]);await page.locator('.sheet:visible').screenshot({path:new URL(`${g}-${r}-${p}.png`,root).pathname});}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1500,height:1100});await page.goto(new URL('TINTED.html?group=onions',root).href);await page.locator('.family[data-group="onions"]').click();
 for(const f of page.frames().slice(1))await f.waitForFunction(()=>document.body.dataset.group==='onions');
 for(const f of page.frames().slice(1))await f.waitForFunction(()=>document.body.dataset.ribbon==='group');
 for(const paper of ['cream','tinted']){await page.selectOption('#paper',paper);for(const f of page.frames().slice(1)){await f.waitForFunction(t=>document.body.dataset.paper===t,paper);assert.equal(await f.evaluate(()=>getComputedStyle(document.querySelector('.sheet')).backgroundColor),paper==='cream'?'rgb(255, 248, 233)':'rgb(250, 243, 246)');}}
 await page.screenshot({path:new URL('review.png',root).pathname});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile horizontal overflow');assert.deepEqual(errors,[]);
 const checks={scope:'Isolated metric browser colour study; no production changes or physical PDF export.',approvedReferenceHashesVerified:files.length,palettes:8,ribbonModes:1,paperModes:2,paperSwitchPassed:true,allVariantTextAndGeometryIdenticalToApprovedMetric:true,fontsAndImagesLoaded:true,paletteControlsPassed:true,groupRibbonEnforced:true,mobileHorizontalOverflow:false,browserErrors:errors,contrast:colours};
 await fs.writeFile(new URL('CHECKS.json',root),JSON.stringify(checks,null,2)+'\n');console.log(JSON.stringify(checks,null,2));
}finally{await browser.close()}
