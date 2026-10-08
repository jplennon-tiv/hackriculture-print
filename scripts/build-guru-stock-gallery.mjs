// Review gallery and screen-only placement studies. Never exports or overwrites book PDFs.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const rel='docs/assets/vegetable-guru-stock',dir=path.join(root,rel);
const base='http://127.0.0.1:5173';
const manifest=JSON.parse(await fs.readFile(path.join(dir,'ARTWORK.json'),'utf8'));
const approval=JSON.parse(await fs.readFile(path.join(root,'docs/redesign-rollout/APPROVAL.json'),'utf8')).compactEntryPages;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of approval.files)if(hash(await fs.readFile(path.join(root,f.path)))!==f.sha256)throw Error('Approved source changed '+f.path);
const asset=id=>manifest.assets.find(a=>a.id===id);
const url=id=>'/'+rel+'/assets/'+asset(id).file;
await fs.mkdir(path.join(dir,'previews'),{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1500,height:1150},deviceScaleFactor:1});await page.route('**/@vite/client',r=>r.abort());
 const entrySource='/docs/publication/vegetable-guru-entry-pages/imperial.html';
 const placementResults=[];
 for(const [name,folios,ids] of [['contents-headers',[4,5],['H1','H2']],['how-to-headers',[6,7],['H5','H6']]]){
  await page.goto(base+entrySource);
  const body=await page.evaluate(({folios,images})=>folios.map((folio,index)=>{
   const s=document.querySelector(`[data-folio="${folio}"]`).cloneNode(true);
   const header=s.querySelector('header');header.querySelector('img').src=images[index];
   s.querySelector('.content').replaceChildren(header);s.querySelector('footer').remove();return s.outerHTML;
  }).join(''),{folios,images:ids.map(url)});
  const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/docs/publication/vegetable-guru-entry-pages/entry-pages.css"><style>body{margin:0}.context-pair{display:flex;gap:8px;padding:16px;width:max-content;background:#dce3d6}body .sheet{margin:0;box-shadow:none;height:73mm;flex:none}</style></head><body><div class="context-pair">${body}</div></body></html>`;
  await fs.writeFile(path.join(dir,'previews',name+'.html'),html);await page.goto(base+'/'+rel+'/previews/'+name+'.html');
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  await page.locator('.context-pair').screenshot({path:path.join(dir,'previews',name+'.png')});
  placementResults.push({name,folios,assets:ids,kind:'Screen-only header placement study; unchanged source typography and text'});
 }
 await page.goto(base+'/docs/publication/vegetable-guru-opening-pages/imperial.html');
 const welcome=await page.evaluate(({header,spot})=>{const s=document.querySelector('[data-folio="3"]').cloneNode(true);s.querySelector('.harvest').src=header;s.querySelector('.about .tile img').src=spot;return s.outerHTML},{header:url('H3'),spot:url('S1')});
 const welcomeHtml=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/docs/publication/vegetable-guru-opening-pages/opening-pages.css"><style>body{margin:0}body .sheet{margin:0;box-shadow:none}.about .tile img{object-fit:contain}</style></head><body>${welcome}</body></html>`;
 await fs.writeFile(path.join(dir,'previews','welcome.html'),welcomeHtml);await page.goto(base+'/'+rel+'/previews/welcome.html');
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
 await page.locator('.sheet').screenshot({path:path.join(dir,'previews','welcome.png')});placementResults.push({name:'welcome',folios:[3],assets:['H3','S1'],kind:'Screen-only placement study; author image slot retained with contain fit'});
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
 const card=a=>`<article><h3><b>${a.id}</b> ${esc(a.name)}</h3><a class="art ${a.role==='portrait spot'?'portrait':''}" href="assets/${a.file}"><img src="assets/${a.file}" alt="${esc(a.name)}"></a><p>${a.pair?'Header pair '+a.pair:'Portrait illustration'} · <a href="assets/${a.file}" download>Save PNG</a></p></article>`;
 const compareStyle=`*{box-sizing:border-box}body{margin:0;background:#e5e9dd;color:#173e2c;font:16px/1.45 system-ui,sans-serif}main{max-width:1360px;margin:auto;padding:24px}h1{font-size:30px}h2{font-size:21px;margin:0 0 14px}.comparison{padding:20px;margin:20px 0;background:#e5e9dd}.compare-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.compare-cell{padding:14px;background:#fff8e9}.compare-cell b{display:block;margin-bottom:12px}.compare-images{display:flex;gap:8px;height:245px;align-items:center;justify-content:center}.compare-images a{display:flex;min-width:0;flex:1;align-items:center;justify-content:center;height:100%}.compare-images img{width:100%;height:100%;object-fit:contain}@media(max-width:700px){.compare-grid{grid-template-columns:1fr}}`;
 const compareRow=a=>{
  const refs=a.references.filter(r=>r.includes('/public/images/heroes/richer-a/')).map(r=>path.relative(dir,r));
  const previous=a.previousVersions.at(-1).file;
  const cell=(label,sources)=>`<div class="compare-cell"><b>${label}</b><div class="compare-images">${sources.map(src=>`<a href="${src}"><img src="${src}" alt="${esc(a.id+' '+label)}"></a>`).join('')}</div></div>`;
  return `<section class="comparison" id="compare-${a.id}"><h2>${a.id} · ${esc(a.name)}</h2><div class="compare-grid">${cell('Approved hero references',refs)}${cell('Earlier, overly detailed version',['assets/'+previous])}${cell('Current redraw',['assets/'+a.file])}</div></section>`;
 };
 const comparisonHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Vegetable Guru — style redraw</title><style>${compareStyle}</style></head><body><main><h1>Matching the approved heroes</h1><p>Approved references, the earlier stock and the current redraws. Same cream background and image-box height; exact image files, with no pixel editing.</p>${manifest.assets.map(compareRow).join('')}<p><a href="REVIEW.html">Return to the stock gallery</a></p></main></body></html>`;
 await fs.writeFile(path.join(dir,'STYLE-REDRAW.html'),comparisonHtml);
 await page.goto(base+'/'+rel+'/STYLE-REDRAW.html');
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
 for(const id of ['H1','S1'])await page.locator('#compare-'+id).screenshot({path:path.join(dir,'style-redraw-'+id.toLowerCase()+'.png')});
 const comparisonLinks=await page.locator('a').evaluateAll(a=>[...new Set(a.map(e=>e.href))]);
 for(const link of comparisonLinks){const response=await page.request.get(link);if(!response.ok())throw Error('Broken comparison link '+link)}
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Vegetable Guru - Illustration stock</title><style>
 @font-face{font-family:Lilita;src:url('/fonts/richer-a-1.woff2')}@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:#e5e9dd;color:#173e2c;font:16px/1.5 Nunito,system-ui,sans-serif}main{max-width:1360px;margin:auto;padding:32px 26px 60px}h1,h2,h3{font-family:Lilita;font-weight:400;line-height:1.13}h1{font-size:44px;margin:10px 0 15px}h2{font-size:29px;margin:38px 0 10px}h3{font-size:20px;margin:0 0 12px;min-height:45px}h3 b{color:#a44007}p{max-width:930px}a{color:inherit}.eyebrow{font-size:12px;font-weight:900;letter-spacing:1.7px}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:24px}article{padding:17px;background:#fff8e9;border-radius:7px}article p{font-size:13px;margin:12px 0 0}.art{display:flex;align-items:center;justify-content:center;height:225px;background:#fff8e9}.art img{display:block;width:100%;height:100%;object-fit:contain}.art.portrait img{width:auto;max-width:100%}.controls{display:flex;gap:10px;margin-top:16px}button{padding:9px 14px;border:1px solid #a6b19b;border-radius:4px;background:#fff8e9;color:#173e2c;font:800 14px Nunito;cursor:pointer}.caption{font-size:14px;color:#52634c}.pair-preview{width:100%;display:block;margin:16px 0 24px}.welcome-row{display:grid;grid-template-columns:minmax(280px,560px) 1fr;gap:34px;align-items:start}.welcome-row img{width:100%;display:block}.welcome-notes{padding-top:12px}.welcome-notes ul{padding-left:22px}.references{display:flex;gap:22px;align-items:center}.references img{display:block;max-width:330px;width:100%}details{margin-top:30px;border-top:1px solid #b5bea9;padding-top:18px}summary{cursor:pointer;font-weight:900}@media(max-width:900px){.gallery{grid-template-columns:repeat(2,1fr)}.welcome-row{grid-template-columns:1fr}}@media(max-width:520px){.gallery{grid-template-columns:1fr}main{padding:22px 14px}.references{flex-direction:column}}
 </style></head><body><main><header><div class="eyebrow">THE VEGETABLE GURU · HERO-STYLE REDRAW · 7 OCTOBER 2026</div><h1>Eight illustrations, redrawn</h1><p>The same subjects and arrangements, now using the approved vegetable heroes as direct style references: broader colour planes, simpler foliage and graphic highlight strokes. Three header pairs and two portrait options.</p><p class="caption">New artwork for review. Each asset is a separate transparent PNG. Click an image to view it full size.</p><div class="controls"><button data-bg="#fff8e9">Cream background</button><button data-bg="#173e2c">Dark green background</button><button data-bg="#ffffff">White background</button></div></header><section class="gallery">${manifest.assets.map(card).join('')}</section>
 <h2>Compared with the approved heroes</h2><p>These two examples show the style references, the earlier detailed version and the redraw. <a href="STYLE-REDRAW.html">Compare all eight illustrations</a>.</p><a href="style-redraw-h1.png"><img class="pair-preview" src="style-redraw-h1.png" alt="H1 root harvest: approved heroes, earlier version and current redraw"></a><a href="style-redraw-s1.png"><img class="pair-preview" src="style-redraw-s1.png" alt="S1 beans: approved heroes, earlier version and current redraw"></a><h2>Paired headers in place</h2><p>Roots and leaves across the contents; starting plants and gathering the harvest across the how-to. These are separate placement studies using the existing page headings.</p><a href="previews/contents-headers.png"><img class="pair-preview" src="previews/contents-headers.png" alt="Contents headers with H1 beetroot harvest on the left and H2 turnips and parsnips on the right"></a><a href="previews/how-to-headers.png"><img class="pair-preview" src="previews/how-to-headers.png" alt="How-to headers with H5 seedlings and trowel on the left and H6 harvest trug on the right"></a>
 <h2>A replacement in the author-image slot</h2><div class="welcome-row"><a href="previews/welcome.png"><img src="previews/welcome.png" alt="Welcome page using H3 summer vegetables in the header and S1 beans with blossom beside the author block"></a><div class="welcome-notes"><p>The small portrait image stays beside the author introduction. S1 gives it a new legume drawing with flowers; S2 is a brighter alternative.</p><p>This proposed allocation gives each opening-page header a different image:</p><ul><li>Welcome: H3, summer harvest</li><li>Contents: H1 and H2, roots and leaves</li><li>How-to: H5 and H6, starting plants and gathering in</li><li>Author block: S1, beans and blossom</li></ul><p>H4 and S2 remain available as alternatives or for later pages.</p><p class="caption">Placement studies are screen previews, not new print proofs. Approved page files and existing PDFs remain unchanged.</p></div></div>
 <details><summary>Style references and saved files</summary><div class="references"><img src="../../front-matter/entry-pages/studies/assets/harvest-cluster.png" alt="Original harvest illustration style reference"><img src="../../../public/images/heroes/richer-a/pea.png" alt="Original pea portrait reference"></div><p>Redrawn with the built-in image-generation tool using the approved crop heroes as the primary style references. The original harvest and pea images above are retained source context. Exact prompts, output hashes, previous versions and framing revisions are in <a href="ARTWORK.json">ARTWORK.json</a>. <a href="README.md">Stock notes</a> · <a href="../../handover/START-HERE.md">Current handover</a></p></details>
 </main><script>document.querySelectorAll('[data-bg]').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll('.art').forEach(a=>a.style.background=b.dataset.bg)))</script></body></html>`;
 await fs.writeFile(path.join(dir,'REVIEW.html'),html);await page.goto(base+'/'+rel+'/REVIEW.html');await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
 await page.locator('.gallery').screenshot({path:path.join(dir,'stock-overview.png')});
 const links=await page.locator('a').evaluateAll(a=>[...new Set(a.map(e=>e.href))]);
 for(const link of links){const response=await page.request.get(link);if(!response.ok())throw Error('Broken gallery link '+link)}
 for(const [label,colour] of [['Dark green background','rgb(23, 62, 44)'],['White background','rgb(255, 255, 255)'],['Cream background','rgb(255, 248, 233)']]){
  await page.getByRole('button',{name:label,exact:true}).click();
  if(!await page.locator('.art').evaluateAll((nodes,expected)=>nodes.every(n=>getComputedStyle(n).backgroundColor===expected),colour))throw Error('Background control failed '+label);
 }
 for(const f of approval.files)if(hash(await fs.readFile(path.join(root,f.path)))!==f.sha256)throw Error('Approved source changed '+f.path);
 manifest.placementStudies=placementResults;manifest.approvedPageHashesUnchanged=true;manifest.galleryChecks={imagesLoaded:true,linksChecked:links.length,backgroundControlsChecked:3,comparisonAssetRows:manifest.assets.length,comparisonLinksChecked:comparisonLinks.length};
 await fs.writeFile(path.join(dir,'ARTWORK.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest.galleryChecks));
}finally{await browser.close()}
