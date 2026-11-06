import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {reviseGuide,fitFront,fitBack} from '../../src/print/book/sowing-rollout/layout.mjs';
import {measureMockup} from '../../src/print/book/sowing-planting-mockups/layout.mjs';
import {composeChicory,fitChicory} from '../../src/print/book/sowing-rollout/revisions/chicory-forcing.mjs';
import {composeCourgette,fitCourgette} from '../../src/print/book/sowing-rollout/revisions/courgette-pocket.mjs';
import {addMushroomCompostPanel} from '../../src/print/book/sowing-rollout/revisions/mushroom-compost.mjs';
const args=process.argv.slice(2),revision=args.includes('--revision'),keys=args.filter(a=>a!=='--revision');
if(revision&&keys.length!==1)throw Error('A one-off revision requires exactly one crop key.');
const revisionPath=revision?'/revisions/'+keys[0]:'';
const dir='docs/publication/sowing-rollout'+revisionPath,tmp='tmp/sowing-rollout',pdfDir='output/pdf/sowing-rollout'+(revision?revisionPath:'/individual');
const amendments=revision?JSON.parse(await fs.readFile('src/print/book/sowing-rollout/revisions/'+keys[0]+'.json')):null;
if (await fs.access(dir+'/APPROVAL.json').then(()=>true,()=>false)) throw Error('Use a separate revision after approval.');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
await fs.mkdir(pdfDir,{recursive:true});await fs.mkdir(dir+'/checks',{recursive:true});
const copy=await fs.readFile('src/print/book/sowing-rollout/copy.txt','utf8');
const specs={};let spec;
for(const raw of copy.split('\n')){
 const line=raw.trim();if(!line||line[0]==='#')continue;
 if(line[0]==='['){spec={actions:[],notes:[],methods:[],moves:[],replacements:[],edits:[],table:[]};specs[line.slice(1,-1)]=spec;continue;}
 const prefix=line[0],field={'@':'actions','+':'notes','=':'replacements','!':'moves','%':'edits','~':'table'}[prefix];
 if(prefix==='^'){spec.intro=line.slice(1);continue;}
 spec[field||'methods'].push((field?line.slice(1):line).split('|').map(s=>s.trim()));
}
if(Object.keys(specs).length!==39)throw Error('Expected 39 individual guides');
// A later proof can have its own directory while using the original crop snapshot.
const selectedKeys = amendments?.cropKey ? [amendments.cropKey] : keys;
if (selectedKeys.some(key => !Object.hasOwn(specs, key))) throw Error('Unknown crop in spread request.');
const css=await fs.readFile('src/print/book/sowing-rollout/layout.css','utf8');
const browser=await chromium.launch();let failures=0;
try{
 for(const [key,spec] of Object.entries(specs)){
  if(selectedKeys.length&&!selectedKeys.includes(key))continue;
  const pages=[];
  try{
   for(const unit of ['imperial','metric']){
    const path=tmp+'/'+key+'-'+unit;
    const meta=JSON.parse(await fs.readFile(path+'.json'));const original=await fs.readFile(path+'.html','utf8');
    const masterHash=sha(await fs.readFile('../hackriculture-data/vegetables/'+key+'/'+key+'.json'));
    const update=amendments?.sourceUpdate;
    if(update){
      const receipt=JSON.parse(await fs.readFile(update.receipt));
      if(update.beforeSha256!==meta.masterHash||receipt.beforeSha256!==update.beforeSha256||receipt.afterSha256!==update.afterSha256||!receipt.exactPreviousBytesVerified)throw Error('Unverified source update: '+key);
    }
    if(sha(original)!==meta.htmlHash || masterHash!==(update?.afterSha256??meta.masterHash)) throw Error('Source revision changed: '+key);
    const page=await browser.newPage({viewport:{width:1100,height:1200}});pages.push({page,meta,unit});
    const url='http://127.0.0.1:5173/'+path+'.html';await page.route(url,r=>r.fulfill({contentType:'text/html',body:original}));await page.goto(url,{waitUntil:'load'});await page.emulateMedia({media:'print'});
    await page.addStyleTag({content:css});await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(reviseGuide,{spec,unit,meta});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    await page.evaluate(fitFront);
    const trial=await page.evaluate(fitBack);Object.assign(pages.at(-1),{trial});
   }
   const maxCut=Math.max(...pages.map(p=>p.trial.removed.length));const results={};
   for(const {page,meta,unit,trial} of pages){
    const extra=maxCut-trial.removed.length;
    for(let i=0;i<extra;i++)trial.removed.push(await page.evaluate(()=>{const row=document.querySelector('.pests tbody tr:last-child');const name=row.querySelector('th,strong').textContent;row.remove();return name;}));
    let imageAlignment;
    if(amendments){
      const baseline=JSON.parse(await fs.readFile('docs/publication/sowing-rollout/checks/'+key+'.json'))[unit];
      if(sha(await fs.readFile(baseline.pdf))!==amendments.baselinePdfSha256[unit])throw Error('Reviewed baseline changed: '+unit);
      const before=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(e=>e.innerText));
      if(before.join('\n')!==baseline.text.join('\n'))throw Error('Recreated baseline text differs: '+unit);
      await page.evaluate(({edits,factColumns,factWidths,wideFacts,additionalVarieties,additionalFacts,additionalPests,unit})=>{
        const pick=s=>s.replace(/\{([^~{}]+)~([^{}]+)\}/g,(_,a,b)=>unit==='imperial'?a:b);
        for(const change of edits){
          if(change.unit&&change.unit!==unit)continue;
          const elements=[...document.querySelectorAll(change.selector)];
          if(elements.length!==1)throw Error('Expected exactly one '+change.selector);
          const el=elements[0],old=change.attribute?el.getAttribute(change.attribute):el.textContent;
          if(!old.includes(change.before)||old.indexOf(change.before)!==old.lastIndexOf(change.before))throw Error('Changed source for '+change.selector);
          if(change.remove===true){
            if(change.attribute)throw Error('Element removal cannot target an attribute.');
            el.remove();continue;
          }
          const next=old.replace(change.before,change.after);
          if(change.attribute)el.setAttribute(change.attribute,next);else el.textContent=next;
          if(change.alt)el.setAttribute('alt',change.alt);
        }
        for(const fact of additionalFacts||[]){
          const label=pick(fact.label),articles=[...document.querySelectorAll('.fact-grid article')];
          if(articles.some(e=>e.querySelector('h3').textContent===label))throw Error('Duplicate additional fact '+label);
          const item=articles[0].cloneNode(true);item.removeAttribute('data-action');item.dataset.addedFact=fact.id;
          item.querySelector('h3').textContent=label;item.querySelector('p').textContent=pick(fact.value);
          const icon=item.querySelector('img');icon.src=fact.icon;icon.alt='';
          document.querySelector('.fact-column').append(item);
        }
        if(factColumns){
          factColumns=factColumns.map(column=>column.map(pick));
          const articles=[...document.querySelectorAll('.fact-grid article')];
          const names=articles.map(e=>e.querySelector('h3').textContent);
          if([...factColumns.flat()].sort().join('|')!==[...names].sort().join('|'))throw Error('Fact regrouping must preserve every fact exactly once.');
          document.querySelectorAll('.fact-column').forEach((col,i)=>col.replaceChildren(...factColumns[i].map(name=>articles.find(e=>e.querySelector('h3').textContent===name))));
          if(factWidths)document.querySelector('.fact-grid').style.setProperty('grid-template-columns',factWidths.map(w=>w+'fr').join(' '),'important');
          for(const name of (wideFacts||[]).map(pick)){const el=articles.find(e=>e.querySelector('h3').textContent===name);if(!el)throw Error('Missing wide fact '+name);el.style.setProperty('grid-column','1 / -1','important');}
        }
        for(const pest of additionalPests||[]){
          const tbody=document.querySelector('.pests tbody'),rows=[...tbody.rows];
          const label=row=>row.querySelector('th,strong')?.textContent;
          if(rows.some(row=>label(row)===pest.name))throw Error('Duplicate additional pest '+pest.name);
          const template=rows[0];if(template.cells.length!==3)throw Error('Additional pest requires the established three-column table.');
          const row=template.cloneNode(true);row.dataset.addedPest=pest.name;
          row.querySelector('th,strong').textContent=pest.name;row.cells[1].textContent=pick(pest.signs);row.cells[2].textContent=pick(pest.control);
          const anchor=pest.before?rows.find(row=>label(row)===pest.before):null;
          if(pest.before&&!anchor)throw Error('Missing pest placement anchor '+pest.before);
          tbody.insertBefore(row,anchor);
        }
        if(additionalVarieties?.length){
          const grid=document.querySelector('.varieties > div'),template=grid.querySelector('article');
          for(const variety of additionalVarieties){
            if([...grid.querySelectorAll('h3')].some(e=>e.textContent===variety.name))throw Error('Duplicate variety '+variety.name);
            const item=template.cloneNode(true);item.querySelector('h3').textContent=variety.name;item.querySelector('p').textContent=variety.text;item.querySelector('small')?.remove();grid.append(item);
          }
          for(const item of grid.children)item.style.setProperty('grid-column','span 2','important');
        }
      },{...amendments,unit});
      if(amendments.composition==='mushroom-compost-v1'){
        if(key!=='mushroom')throw Error('Mushroom compost panel is crop-specific.');
        await page.evaluate(addMushroomCompostPanel,amendments.compostPanel);
      }
      if(amendments.composition==='chicory-forcing-v1'){
        if(key!=='chicory')throw Error('Chicory composition is crop-specific');
        await page.evaluate(composeChicory,{unit,copy:amendments.copy});
      }
      if(amendments.composition==='courgette-pocket-v1'){
        if(key!=='marrow_courgette')throw Error('Courgette composition is crop-specific');
        await page.evaluate(composeCourgette,{unit,copy:amendments.copy});
      }
      await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));
      await page.evaluate(fitFront);
      if(amendments.composition==='chicory-forcing-v1')trial.revision=await page.evaluate(fitChicory);
      if(amendments.composition==='courgette-pocket-v1')trial.revision=await page.evaluate(fitCourgette);
      if(amendments.plantingImageAlignment)imageAlignment=await page.evaluate(mode=>{
        const images=[...document.querySelectorAll('.compact-sequence img')];
        const entries=images.map(img=>{
          const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
          const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          let top=canvas.height,bottom=-1;
          for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(rgba[(y*canvas.width+x)*4+3]>8){top=Math.min(top,y);bottom=y;break;}
          if(bottom<top)throw Error('Empty planting image');
          const rect=img.getBoundingClientRect(),scale=Math.min(rect.width/img.naturalWidth,rect.height/img.naturalHeight);
          const artTop=rect.top+(rect.height-img.naturalHeight*scale)/2;
          const centre=artTop+(top+bottom+1)*scale/2,base=artTop+(bottom+1)*scale;
          return {img,centre,base,top,bottom,scale};
        });
        if(!['centre','bottom'].includes(mode))throw Error('Unknown image alignment '+mode);
        const coordinate=e=>mode==='bottom'?e.base:e.centre;
        const target=mode==='bottom'?Math.max(...entries.map(coordinate)):entries.reduce((sum,e)=>sum+coordinate(e),0)/entries.length;
        const sheetTop=images[0].closest('.sheet').getBoundingClientRect().top;
        const mm=v=>v*25.4/96;
        const records=entries.map(e=>{
          const shift=target-coordinate(e);e.img.style.transform=`translateY(${shift}px)`;
          return {src:e.img.getAttribute('src'),beforeAlignmentMm:mm(coordinate(e)-sheetTop),shiftMm:mm(shift),afterAlignmentMm:mm(target-sheetTop),captionTopMm:mm(e.img.closest('figure').querySelector('figcaption').getBoundingClientRect().top-sheetTop)};
        });
        return {method:'Visible artwork '+mode+' alignment, alpha > 8; existing image sizes and caption baselines retained',images:records};
      },amendments.plantingImageAlignment);
    }
    const m=await page.evaluate(measureMockup);
    const proof=await page.evaluate(()=>{
      const box=e=>{const r=e.getBoundingClientRect(),s=e.closest('.sheet').getBoundingClientRect();return [r.left-s.left,r.top-s.top,r.right-s.left,r.bottom-s.top].map(v=>v*.75);};
      const all=s=>[...document.querySelectorAll(s)];
      const sample=e=>({text:e.innerText,box:box(e)});
      const panelBlocks=all('.mushroom-compost h2, .mushroom-compost h3, .mushroom-compost p').map(sample);
      return {actions:all('.fact-grid [data-action]').map(sample),additionalFacts:all('.fact-grid [data-added-fact]').map(sample),additionalPestCells:all('.pests [data-added-pest]').flatMap(row=>[...row.cells].map(sample)),methods:all('.sowing-method').map(sample),varieties:all('.varieties article').map(sample),pests:all('.pests tbody tr').map(e=>e.querySelector('th,strong')?.textContent),calendar:all('.calendar .month-row b').map(e=>e.textContent).filter(Boolean),
       ...(panelBlocks.length?{panelBlocks}:{}),art:all('.planting img').map(e=>e.getAttribute('src')), nav:all('.recto nav a').map(e=>({text:e.textContent,box:box(e)})),text:all('.sheet').map(e=>e.innerText)};
    });
    const expectedArt=amendments?.plantingArt??meta.art;
    if(m.pages.length!==2||!m.fontsReady||m.images.some(e=>!e.loaded)||m.methodFonts.some(e=>e.sizePt!==9)||proof.art.join('|')!==expectedArt.join('|'))throw Error('Invalid page/font/image coverage');
    if(/undefined|\bNaN\b|module clumps|multi.?sown clump/i.test(proof.text.join(' ')))throw Error('Unresolved text or clump reference');
    const gaps=m.pages.map(p=>p.footerGapMm),pdf=pdfDir+'/'+key+'-'+unit+'.pdf';
    if(Math.min(...gaps)<3){
      if(revision)await fs.writeFile(tmp+'/'+key+'-'+unit+'-failed.html',await page.content());
      throw Error('Insufficient footer clearance: '+gaps+(trial.revision?' '+JSON.stringify(trial.revision):''));
    }
    await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
    if(revision)await fs.writeFile(dir+'/'+key+'-'+unit+'.html',await page.content());
    results[unit]={key,folio:meta.folio,name:meta.label,unit,source:meta.source,masterHash:amendments?.sourceUpdate?.afterSha256??meta.masterHash,...(amendments?.sourceUpdate?{sourceMasterHash:meta.masterHash}:{}),baselineHash:meta.htmlHash,pdf,gaps,links:meta.links,trial,...proof,...(amendments?{amendments}:{} ),...(imageAlignment?{imageAlignment}:{})};
   }
   await fs.writeFile(dir+'/checks/'+key+'.json',JSON.stringify(results,null,2)+'\n');
   console.log(key,JSON.stringify(Object.values(results).map(r=>[...r.gaps,r.pests.length,r.trial.removed.length])));
  }catch(e){failures++;console.error('FAILED '+key+': '+String(e));}finally{await Promise.all(pages.map(p=>p.page.close()));}
 }
}finally{await browser.close();}if(failures)process.exitCode=1;
