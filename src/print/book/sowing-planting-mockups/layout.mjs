// Browser-only mock-up transformation. Full reviewed prose; no source writes.
export function applySowingMockup({crop,unit,start}){
 const root=document.querySelector('.rich-print'),key=crop.key;
 const need=s=>{const e=root.querySelector(s);if(!e)throw Error('Missing '+s);return e;};
 const all=s=>[...root.querySelectorAll(s)],mm=96/25.4;
 const normal=s=>s.replace(/\s+/g,'');
 const preserved=['.soil','.harvest','.pests','.varieties','.key-risks','.intro','.remember'].map(s=>({selector:s,text:normal(need(s).textContent)}));
 const beforeImages=all('img').map(e=>e.getAttribute('src'));
 const front=need('.front'),back=need('.back'),plant=need('.planting'),care=need('.care'),soil=need('.soil'),harvest=need('.harvest'),pests=need('.pests'),tips=need('.tips');
 const relocations=[];
 function replace(selector,before,after){const e=need(selector);if(e.textContent!==before)throw Error('Changed source '+selector+' '+e.textContent);relocations.push({selector,before,after});if(after===null)e.remove();else e.textContent=after;}
 if(key==='carrot')replace('.care li:first-child','Thin only as needed in evenings or damp weather; water dry soil first. Firm afterwards and clear thinnings: bruised roots attract carrot fly.',null);
 if(key==='beetroot'){
  replace('.care li:first-child','Thin direct sowings early to single plants; protect from birds. Plant module clumps intact and pick their largest roots first.','Protect young plants from birds.');
  for(const e of [...tips.querySelectorAll('div')])if(/Leave four or five seedlings|Take the largest clump roots/.test(e.textContent)){relocations.push({selector:'.tips',before:e.textContent,after:'Included in the clump method.'});e.remove();}
  tips.style.setProperty('--book-tip-rows','1');
 }
 if(key==='leek')replace('.care li:first-child','Hoe carefully, water in dry spells and mulch with compost. Let dibbed holes fill naturally after watering-in; do not fill them with dry soil.','Hoe carefully, water in dry spells and mulch with compost.');
 // Retain short deliberate care reminders for potatoes and tomato supports.
 const swaps={carrot:[['½ in.','1.3 cm'],['2–3 in.','5–8 cm'],['6 in.','15 cm']],beetroot:[['12 in.','30 cm'],['4 in.','10 cm'],['2 in.','5 cm'],['1 in.','2.5 cm']],leek:[['12–14 in.','30–35 cm'],['6–8 in.','15–20 cm'],['12 in.','30 cm'],['8 in.','20 cm'],['6 in.','15 cm'],['⅝ in.','1.5 cm'],['50°F','10°C']],tomato_outdoor:[['18–24 in.','45–60 cm']],potato:[['6 in.','15 cm']]};
 const convert=s=>unit==='imperial'?s:(swaps[key]||[]).reduce((s,[a,b])=>s.replaceAll(a,b),s);
 const methods=crop.after.map(m=>({...m,text:convert(m.text)}));
 const originals=[...plant.querySelectorAll('.stages article')].map(a=>({src:a.querySelector('img').getAttribute('src'),title:a.querySelector('h3').textContent.replace(/^\d+\s*/,''),alt:a.querySelector('img').alt}));
 plant.replaceChildren();plant.className='planting sowing-proposal';
 const h=document.createElement('h2');h.textContent='Sowing & planting';plant.append(h);
 const body=document.createElement('div');body.className='method-columns';plant.append(body);
 const artTargets={carrot:[0,0,1],beetroot:[0,1],leek:[1,1],tomato_outdoor:[1,3],potato:[2,2]};
 methods.forEach((m,index)=>{
  const a=document.createElement('section');a.className='sowing-method';a.dataset.method=String(index);
  const title=document.createElement('h3');title.textContent=m.heading;a.append(title);
  const arts=originals.filter((_,j)=>artTargets[key][j]===index);
  if(arts.length){const strip=document.createElement('div');strip.className='method-art';for(const art of arts){const img=document.createElement('img');img.src=art.src;img.alt=art.alt;strip.append(img);}a.append(strip);}
  const p=document.createElement('p');p.textContent=m.text;a.append(p);body.append(a);
  if((key==='beetroot'||key==='leek')&&index===2){
   const fig=document.createElement('figure');fig.className='clump-diagram';
   const image=document.createElement('img');image.src=`/src/print/book/sowing-planting-mockups/${key}-clump.svg`;image.alt='A small group of seedlings with their shared rootball kept together.';
   const caption=document.createElement('figcaption');caption.textContent='Keep the clump and its rootball together.';fig.append(image,caption);a.insertBefore(fig,p);
  }
 });
 // Name the actual operation in Quick facts, with readiness conditions in prose.
 const facts=all('.fact-grid article');
 const fact=(heading)=>facts.find(a=>a.querySelector('h3').textContent===heading);
 function editFact(heading,label,text){const a=fact(heading);if(!a)throw Error('Missing fact '+heading);const before=a.textContent;a.querySelector('h3').textContent=label;if(text!==undefined)a.querySelector('p').textContent=text;relocations.push({selector:'Quick facts '+heading,before,after:a.textContent});return a;}
 function addFact(label,text){const a=fact('Sow').cloneNode(true);a.classList.add('new-action-fact');a.querySelector('h3').textContent=label;a.querySelector('p').textContent=text;a.querySelector('img').remove();need('.fact-column:last-child').append(a);return a;}
 if(key==='carrot'){editFact('Sow','Sow direct');editFact('Depth','Sowing depth');editFact('Plant spacing','After thinning',convert('2–3 in. between plants'));}
 if(key==='beetroot'){addFact('Early modules','Sow Feb–Mar; plant well-rooted clumps in spring.');editFact('Sow','Sow direct');editFact('Depth','Sowing depth');editFact('Plant spacing','Single plants',convert('4 in. apart; clumps: see method.'));}
 if(key==='leek'){addFact('Transplant singles','May–Jul; about pencil-thick.');editFact('Sow','Sow in nursery bed','Late Mar–Apr');editFact('Depth','Sowing depth');editFact('Plant spacing','Single plants',fact('Plant spacing').querySelector('p').textContent.replace(/^Between plants:\s*/,''));}
 if(key==='tomato_outdoor'){addFact('Plant out','Late May–early Jun; after frost.');editFact('Sow','Sow indoors','Late Mar–early Apr');}
 if(key==='potato'){editFact('Sow','Plant tubers','Apr; early: Mar');const r=fact('Row spacing');if(r){const p=r.querySelector('p');p.textContent=p.textContent.replace(/^Earlies:/,'First/second earlies:');}}
 const calendar=need('.calendar'),sow=calendar.querySelector('.sowing_time');
 const bands=[];
 if(key==='carrot')sow.querySelector('b').textContent='DIRECT';
 if(key==='beetroot'){
  sow.querySelector('b').textContent='DIRECT';[...sow.querySelectorAll('span')].forEach((s,i)=>s.className=[4,5,6].includes(i+1)?'usual':[3,7].includes(i+1)?'extra':'');
  const row=sow.cloneNode(true);row.className='month-row module-time';row.querySelector('b').textContent='MODULES';[...row.querySelectorAll('span')].forEach((s,i)=>s.className=[2,3].includes(i+1)?'extra':'');sow.after(row);bands.push('Direct sowing and early modules separated; no invented plant-out band.');
 }
 if(key==='leek'||key==='tomato_outdoor'){
  sow.querySelector('b').textContent=key==='leek'?'SOW':'INDOORS';
  const row=sow.cloneNode(true);row.className='month-row planting-time';row.querySelector('b').textContent=key==='leek'?'MOVE OUT':'PLANT OUT';
  [...row.querySelectorAll('span')].forEach((s,i)=>s.className=(key==='leek'?[5,6,7]:[5,6]).includes(i+1)?'usual':'');sow.after(row);bands.push('New action band; exact dates and conditions in Quick facts and prose.');
 }
 if(key==='potato')sow.querySelector('b').textContent='PLANT';
 if(key==='leek')calendar.querySelector('p').textContent='Move out: nursery-bed singles; clumps: see method';
 if(key==='tomato_outdoor')calendar.querySelector('p').textContent='Plant out: after frost, in settled warmth';
 // Closer section gaps accommodate the new calendar/fact rows at full type.
 if(['tomato_outdoor','beetroot','leek'].includes(key))front.classList.add('tight-opening');
 if(key==='potato'){
  const yieldFact=facts.find(a=>a.querySelector('h3').textContent.startsWith('Yield ('));
  if(!yieldFact)throw Error('Missing unit-specific potato yield fact');
  need('.fact-column:last-child').append(yieldFact);
 }
 if(key==='carrot'){
  // The three small pictures already form a clear sequence. Keeping them
  // together avoids paying for a separate picture row at every subheading.
  const strip=document.createElement('div');strip.className='compact-sequence';
  for(const art of originals){const f=document.createElement('figure'),img=document.createElement('img'),c=document.createElement('figcaption');img.src=art.src;img.alt=art.alt;c.textContent=art.title;f.append(img,c);strip.append(f);}
  plant.insertBefore(strip,body);for(const e of body.querySelectorAll('.method-art'))e.remove();
 }
 // Remove frozen padding adjustments, never change retained text sizes.
 for(const e of [...back.children,...need('.growing-columns').children]){e.style.removeProperty('margin-top');e.style.removeProperty('margin-bottom');}
 const cols=[...need('.growing-columns').children],arrangements=[['original',[soil,plant],[care,harvest]],['planting-left',[plant],[soil,care,harvest]],['planting-right',[soil,care,harvest],[plant]]];
 const trials=[];
 for(const [name,left,right]of arrangements){cols[0].append(...left);cols[1].append(...right);for(const split of [50,52,54,48,46,56,44,58,42]){need('.growing-columns').style.gridTemplateColumns=`${split}fr ${100-split}fr`;trials.push({name,split,height:need('.growing-columns').getBoundingClientRect().height,gap:(need('.back footer').getBoundingClientRect().top-tips.getBoundingClientRect().bottom)/mm});}}
 const best=trials.reduce((a,b)=>b.gap>a.gap+.3?b:a);const chosen=arrangements.find(a=>a[0]===best.name);cols[0].append(...chosen[1]);cols[1].append(...chosen[2]);need('.growing-columns').style.gridTemplateColumns=`${best.split}fr ${100-best.split}fr`;
 let pages=2;
 if(best.gap<3){
  pages=3;root.classList.add('three-page-sowing');
  const third=document.createElement('section');third.className='sheet back mock-continuation verso';third.style.cssText=back.style.cssText;
  third.append(back.querySelector('header').cloneNode(true),back.querySelector('.mock-category').cloneNode(true),back.querySelector('.mock-title').cloneNode(true));
  third.querySelector('.mock-title h1').replaceChildren(document.createTextNode('Care & harvest · '));const name=document.createElement('span');name.style.color='var(--deep)';name.textContent=key==='tomato_outdoor'?'Outdoor tomato':crop.name;third.querySelector('h1').append(name);
  const continued=document.createElement('div');continued.className='growing-columns continuation-columns';continued.innerHTML='<div></div><div></div>';continued.children[0].append(care);continued.children[1].append(harvest);third.append(continued,pests,tips,back.querySelector('footer').cloneNode(true));back.after(third);
  const colsBlock=need('.growing-columns');colsBlock.replaceWith(soil,plant);soil.classList.add('full-soil');
  const ms=[...body.children],left=document.createElement('div'),right=document.createElement('div');left.className=right.className='method-column';body.replaceChildren(left,right);
  const cut={carrot:1,beetroot:2,leek:2,tomato_outdoor:2,potato:3}[key]??2;left.append(...ms.slice(0,cut));right.append(...ms.slice(cut));
  // A ground-method sequence is the largest group: balance potato methods.
  if(key==='potato'){
   const preparation=document.createElement('div');preparation.className='preparation-grid';preparation.append(...ms.slice(0,2));body.before(preparation);
   left.replaceChildren(ms[2]);right.replaceChildren(...ms.slice(3));
  }
 }
 [...root.querySelectorAll('.sheet')].forEach((s,i)=>{s.querySelector('footer .section-label').textContent='VEGETABLE GUIDES · LAYOUT TRIAL';s.querySelector('footer .folio').textContent=String(i+1)+' / '+pages;});
 const retained=preserved.map(p=>({...p,unchanged:normal(need(p.selector).textContent)===p.text}));if(retained.some(p=>!p.unchanged))throw Error('Unexpected change to retained content');
 return {trial:{pages,chosen:best,alternatives:trials},relocations,bands,retained,methods,originalPlantingImages:originals,originalImages:beforeImages};
}

export function measureMockup(){
 const mm=96/25.4,root=document.querySelector('.rich-print');
 const pages=[...root.querySelectorAll('.sheet')].map((s,i)=>{
  const box=s.getBoundingClientRect(),foot=s.querySelector('footer').getBoundingClientRect();
  const blocks=[...s.children].filter(e=>!e.matches('header,footer,.content-end,.mock-category,.mock-title'));
  const end=Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom));
  return {page:i+1,footerGapMm:+((foot.top-end)/mm).toFixed(2),blocks:blocks.map(e=>({class:e.className,topMm:+((e.getBoundingClientRect().top-box.top)/mm).toFixed(1),heightMm:+(e.getBoundingClientRect().height/mm).toFixed(1)}))};
 });
 return {pages,text:[...root.querySelectorAll('.sheet')].map(s=>s.innerText),images:[...root.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),methodFonts:[...root.querySelectorAll('.sowing-method p')].map(p=>({sizePt:parseFloat(getComputedStyle(p).fontSize)*.75,leadingPx:getComputedStyle(p).lineHeight})),paragraphs:[...root.querySelectorAll('.sowing-method p')].map(p=>{const s=p.closest('.sheet'),r=p.getBoundingClientRect(),b=s.getBoundingClientRect();return {page:[...root.querySelectorAll('.sheet')].indexOf(s),text:p.textContent,boxPt:[r.left-b.left,r.top-b.top,r.right-b.left,r.bottom-b.top].map(v=>v*.75)};}),fontsReady:document.fonts.status==='loaded'};
}
