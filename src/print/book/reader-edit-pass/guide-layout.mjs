/** Isolated reader corrections over the retained approved guide composition. */
export function applyReaderEdits({key,unit,type,start,edits}) {
 const all=(s,r=document)=>[...r.querySelectorAll(s)],mm=96/25.4;
 const round=x=>Math.round(x/mm*100)/100;
 const sheets=all('.sheet');
 const textNodes=()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode()){const n=w.currentNode;if(n.textContent.trim()&&!n.parentElement.closest('style,script'))a.push(n);}return a;};
 const fonts=()=>textNodes().map(n=>{const s=getComputedStyle(n.parentElement);return {font:s.fontFamily,size:s.fontSize,leading:s.lineHeight,weight:s.fontWeight};});
 const images=()=>all('.sheet img').map(e=>({src:e.getAttribute('src'),alt:e.alt,complete:e.complete,naturalWidth:e.naturalWidth}));
 const rows=()=>all('.pests tbody tr').map(e=>e.textContent);
 const varieties=()=>all('.varieties article').map(e=>({name:e.querySelector('h3').textContent,description:e.querySelector('p')?.textContent}));
 const entries=()=>all('.entry').map(e=>e.dataset.key);
 const clearance=s=>{const blocks=type==='trouble'?all(':scope>header,.entry',s):all(':scope>*',s).filter(e=>!e.matches('footer'));return round(s.querySelector('footer').getBoundingClientRect().top-Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom)));};
 const before={fonts:fonts(),images:images(),rows:rows(),varieties:varieties(),entries:entries(),pages:sheets.length,text:sheets.map(s=>s.innerText),gaps:sheets.map(clearance)};
 const changes=edits.map(edit=>{
  const el=all(edit.selector)[edit.index];
  if(!el||el.textContent!==edit.expected)throw Error(`${key}/${unit}/${edit.id}: expected text mismatch: ${el?.textContent}`);
  if(edit.expectedFactValue&&el.parentElement.querySelector('p')?.textContent!==edit.expectedFactValue)throw Error(`${key}/${unit}/${edit.id}: wrong Quick fact value`);
  el.textContent=edit.proposed;el.dataset.readerChange=edit.id;
  return {...edit,folio:start+sheets.indexOf(el.closest('.sheet'))};
 });
 const layoutAdjustments=[];
 if(key==='lettuce'){
  const grid=document.querySelector('.growing-columns');
  grid.style.gridTemplateColumns='minmax(0,52fr) minmax(0,48fr)';
  layoutAdjustments.push('The existing two growing columns use a 52:48 split, preserving the baseline overall height and all body type, tables and images.');
 }
 // A changed action must retain the natural entry height. Re-share only the
 // existing space between entries on that page to keep the final text edges level.
 if(type==='trouble')for(const s of sheets.filter(s=>s.querySelector('[data-reader-change]'))){
  const cols=all('[data-column]',s);
  const edge=e=>{const r=document.createRange();r.selectNodeContents(e);return Math.max(...[...r.getClientRects()].map(r=>r.bottom));};
  if(cols.length===2&&cols.every(c=>c.children.length>1)&&!s.dataset.alignmentException){
   const ends=cols.map(c=>edge(c.lastElementChild.querySelector('.advice section:last-child p')));
   const target=Math.max(...ends);
   cols.forEach((c,i)=>c.style.height=(c.getBoundingClientRect().height+target-ends[i])+'px');
  }
 }
 const same=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${key}/${unit}: ${label} changed`);};
 same(before.fonts,fonts(),'body typography');same(before.images,images(),'images');same(before.rows,rows(),'pest rows');same(before.varieties,varieties(),'variety names/descriptions');same(before.entries,entries(),'diagnostic coverage');
 if(before.pages!==(type==='vegetable'?2:3)||sheets.length!==before.pages)throw Error(`${key}: page count changed`);
 const pages=sheets.map((s,i)=>{
  const box=s.getBoundingClientRect(),f=s.querySelector('footer').getBoundingClientRect();
  const blocks=type==='trouble'?all(':scope>header,.entry',s):all(':scope>*',s).filter(e=>!e.matches('footer'));
  const end=Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom));
  const changed=changes.filter(c=>c.folio===start+i).map(c=>{const r=s.querySelector(`[data-reader-change="${c.id}"]`).getBoundingClientRect();return {id:c.id,leftMm:round(r.left-box.left),topMm:round(r.top-box.top),widthMm:round(r.width),heightMm:round(r.height)};});
  const columns=all('[data-column]',s).map(c=>{const t=c.lastElementChild?.querySelector('.advice section:last-child p');const r=document.createRange();if(t)r.selectNodeContents(t);return {entries:c.children.length,lastTextBottomMm:t?round(Math.max(...[...r.getClientRects()].map(r=>r.bottom))-box.top):null};});
  return {folio:start+i,footerGapMm:round(f.top-end),baselineFooterGapMm:before.gaps[i],changed,columns,alignmentException:s.dataset.alignmentException||null};
 });
 if(pages.some(p=>p.footerGapMm<Math.min(2.9,p.baselineFooterGapMm-.1)))throw Error(`${key}/${unit}: insufficient footer clearance ${JSON.stringify(pages)}`);
 return {pages,changes,layoutAdjustments,bodyTypeUnchanged:true,pestRowsUnchanged:true,varietyNamesAndDescriptionsUnchanged:true,imagesUnchanged:true,diagnosticCoverageUnchanged:true,bodyFonts:[...new Set(before.fonts.map(f=>`${f.font};${f.size}/${f.leading};${f.weight}`))],images:images(),pestRowCount:rows().length,varietyCount:varieties().length,diagnosticCount:entries().length,textBefore:before.text,textAfter:sheets.map(s=>s.innerText)};
}
