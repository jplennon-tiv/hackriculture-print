/** Browser-only trial: consumes an already source-checked compact production DOM.
 * Not imported by the normal exporter; source proofs and shared data stay intact. */
export function applyTwoPageTrial({slug,units,edits,nav}) {
 const root=document.querySelector('.rich-print'),mm=96/25.4;
 const all=(s,p=root)=>[...p.querySelectorAll(s)];
 const need=(s,p=root)=>{const e=p.querySelector(s);if(!e)throw Error('Missing '+s);return e;};
 const content=s=>[...s.children].filter(e=>!e.matches('header,footer,.content-end'));
 const round=v=>Math.round(v/mm*100)/100;
 const baselineImages=all('img').map(e=>e.getAttribute('src'));
 const originalPests=all('.pests tbody th').map(e=>e.textContent),originalVarieties=all('.varieties article h3').map(e=>e.textContent),originalFacts=need('.fact-grid').textContent;
 const fontNodes=all('p,li,td,th,.fact-grid h3,.measurements,.route-heading,.route-note,.route-shared-note,.varieties small');
 const fonts=fontNodes.map((e,i)=>{e.dataset.trialFontId=String(i);const s=getComputedStyle(e);return {id:String(i),size:s.fontSize,leading:s.lineHeight,family:s.fontFamily,text:e.textContent};});
 const allowedTextChanges=new Set(),allowedRemovals=new Set();
 const changes=[],omissions=[];
 let nextChange=0;
 const mark=(el,kind,description)=>{const id=String(nextChange++);el.dataset.trialChangeId=id;changes.push({id,kind,description});};
 // Remove the export-only bleed wrappers, retaining the trim geometry and parity.
 for(const leaf of all('.book-leaf',document)){const sheet=need('.sheet',leaf);leaf.replaceWith(sheet);}
 root.dataset.twoPageTrial=slug;
 const front=need('.front'),back=need('.back'),third=need('.book-continuation');
 const targets=edits.map(edit=>({...edit,el:all(edit.selector)[edit.index]}));
 for(const edit of targets){
  if(!edit.el||edit.el.textContent!==edit.expected)throw Error(`Source changed: ${slug}/${units} ${edit.selector}[${edit.index}]`);
  if(edit.proposed===null){allowedRemovals.add(edit.el.dataset.trialFontId);omissions.push({selector:edit.selector,index:edit.index,text:edit.expected,reason:edit.reason});edit.el.remove();}
  else {allowedTextChanges.add(edit.el.dataset.trialFontId);edit.el.textContent=edit.proposed;mark(edit.el,'copy',edit.reason);}
 }
 if(slug==='onions_and_shallots'){
  const facts=need('.fact-grid').textContent;
  const required=units==='metric'?['30 cm','20 cm','2.5 cm']:['12 in.','8 in.','1 in.'];
  if(required.some(s=>!facts.includes(s)))throw Error('Repeated onion spacings missing from Quick facts');
  const risk=need('.key-risks');front.insertBefore(risk,need('footer',front));mark(risk,'move','Key risks returned from page three to the opening page.');
  mark(need('.planting'),'layout','Seed and set methods retained; repeated row/salad spacing is in the facing Quick facts.');
 }
 for(const block of content(third)){back.insertBefore(block,need('footer',back));mark(block,'move','Returned from page three to the practical page.');}
 third.remove();
 const cols=all('.growing-columns>div'),soil=need('.soil'),plant=need('.planting'),care=need('.care'),harvest=need('.harvest');
 const arrangements=[['standard',[soil,plant],[care,harvest]],['planting-aside',[soil,care,harvest],[plant]],['harvest-with-planting',[soil,care],[plant,harvest]]];
 const measured=arrangements.map(([name,left,right])=>{cols[0].append(...left);cols[1].append(...right);return {name,height:need('.growing-columns').getBoundingClientRect().height};});
 const chosen=measured.reduce((a,b)=>b.height<a.height-.1?b:a);const arrangement=arrangements.find(a=>a[0]===chosen.name);
 cols[0].append(...arrangement[1]);cols[1].append(...arrangement[2]);
 if(chosen.name!=='standard')mark(need('.growing-columns'),'layout','Practical sections balanced across the two columns; body type unchanged.');
 // Search sensible three-column widths, preserving all problem rows and wording.
 const table=need('.pests table');let headers=all('thead th',table);let best={a:24,b:26,height:table.getBoundingClientRect().height,score:Infinity};
 for(let a=20;a<=28;a+=2)for(let b=26;b<=38;b+=2){if(100-a-b<38)continue;headers[0].style.width=a+'%';headers[1].style.width=b+'%';const height=table.getBoundingClientRect().height,score=height+(.1*(Math.abs(a-24)+Math.abs(b-26)));if(score<best.score)best={a,b,height,score};}
 headers[0].style.width=best.a+'%';headers[1].style.width=best.b+'%';
 if(best.a!==24||best.b!==26)mark(table,'layout','Pest-table column widths adjusted to reduce wrapping; every existing entry remains.');
 let pestColumnPercent=[best.a,best.b,100-best.a-best.b];
 if(slug==='onions_and_shallots'){
  // Join names and signs into one reading column; keep the complete control column.
  // Transfer typography/change identities so the audit still checks every body node.
  allowedTextChanges.add(headers[0].dataset.trialFontId);allowedRemovals.add(headers[1].dataset.trialFontId);
  headers[0].textContent='Problem · what to look for';headers[1].remove();headers=all('thead th',table);
  for(const row of all('tbody tr',table)){
   const [name,sign,control]=[...row.children],cell=document.createElement('td');
   const cloneText=(old,tag)=>{const el=document.createElement(tag);for(const a of old.attributes)el.setAttribute(a.name,a.value);el.textContent=old.textContent;el.style.fontWeight=getComputedStyle(old).fontWeight;return el;};
   cell.append(cloneText(name,'strong'),document.createTextNode(' — '),cloneText(sign,'span'));
   row.replaceChildren(cell,control);
  }
  let two={width:60,score:Infinity};for(let width=54;width<=68;width++){headers[0].style.width=width+'%';headers[1].style.width=(100-width)+'%';const score=table.getBoundingClientRect().height+Math.abs(width-60)*.05;if(score<two.score)two={width,score};}
  headers[0].style.width=two.width+'%';headers[1].style.width=(100-two.width)+'%';pestColumnPercent=[two.width,100-two.width];
  const c=changes.find(c=>c.id===table.dataset.trialChangeId);c.description='Problem names and symptoms share one column; all ten problems and their controls are retained at the original text size.';
 }
 if(slug==='carrot')mark(need('.tips'),'layout','All three Final tips now share one full-width row.');
 // Carry forward the already-approved combined title and navigation wording.
 const h=need('.back h1');h.replaceChildren(document.createTextNode('Growing guide · '));const crop=document.createElement('span');crop.textContent=nav.crop;h.append(crop);
 let size=38;h.style.setProperty('font-size',size+'px','important');while(h.scrollWidth>h.clientWidth+.5&&size>25){size-=.3333;h.style.setProperty('font-size',size+'px','important');}
 const sheets=all('.sheet');for(const [i,s]of sheets.entries()){
  const footer=need('footer',s);footer.replaceChildren();const label=document.createElement('span');label.className='section-label';label.textContent='VEGETABLE GUIDES';footer.append(label);
  if(i&&nav.links.length){const n=document.createElement('nav');n.append('See also: ');nav.links.forEach((l,j)=>{if(j)n.append(' · ');const t=document.createElement('span');t.className='destination';t.textContent=l.text;n.append(t);});footer.append(n);}
  const folio=document.createElement('span');folio.className='folio';folio.textContent=String(nav.start+i);footer.append(folio);
 }
 const fontChecks=fonts.map(before=>{const el=root.querySelector(`[data-trial-font-id="${before.id}"]`);if(!el){if(!allowedRemovals.has(before.id))throw Error('Unexpected text removal '+before.text);return {...before,removed:true};}if(before.text!==el.textContent&&!allowedTextChanges.has(before.id))throw Error('Unexpected text change '+before.text);const s=getComputedStyle(el);return {...before,afterSize:s.fontSize,afterLeading:s.lineHeight,unchanged:before.size===s.fontSize&&before.leading===s.lineHeight&&before.family===s.fontFamily};});
 if(fontChecks.some(f=>!f.removed&&!f.unchanged))throw Error('Body typography changed: '+JSON.stringify(fontChecks.filter(f=>!f.removed&&!f.unchanged)));
 const nowImages=all('img').map(e=>e.getAttribute('src'));if(JSON.stringify([...baselineImages].sort())!==JSON.stringify([...nowImages].sort()))throw Error('Image coverage changed');
 const pests=slug==='carrot'?all('.pests tbody th').map(e=>e.textContent):all('.pests tbody tr td:first-child strong').map(e=>e.textContent);
 if(JSON.stringify(pests)!==JSON.stringify(originalPests)||JSON.stringify(all('.varieties article h3').map(e=>e.textContent))!==JSON.stringify(originalVarieties)||need('.fact-grid').textContent!==originalFacts)throw Error('Pests, varieties or Quick facts changed');
 const pages=sheets.map((s,i)=>{const rect=s.getBoundingClientRect(),footer=need('footer',s).getBoundingClientRect();const end=Math.max(...content(s).map(e=>e.getBoundingClientRect().bottom));return {page:i+1,folio:nav.start+i,footerGapMm:round(footer.top-end),blocks:content(s).map(e=>({class:e.className,topMm:round(e.getBoundingClientRect().top-rect.top),heightMm:round(e.getBoundingClientRect().height)})),changes:all('[data-trial-change-id]',s).map(e=>{const r=e.getBoundingClientRect(),c=changes.find(c=>c.id===e.dataset.trialChangeId);return {...c,left:round(r.left-rect.left),top:round(r.top-rect.top),width:round(r.width),height:round(r.height)};})};});
 return {slug,units,pages,arrangements:measured.map(m=>({name:m.name,heightMm:round(m.height)})),chosenArrangement:chosen.name,pestColumnPercent,pestRows:all('.pests tbody tr').length,pestsRetained:pests,varietiesRetained:originalVarieties,quickFactsUnchanged:true,unlistedTextChanges:0,fonts:fontChecks,bodyTypeUnchanged:true,images:nowImages,omissions,edits:targets.map(({el,...e})=>e),textByPage:sheets.map(s=>s.innerText)};
}
