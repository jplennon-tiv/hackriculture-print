// Second isolated experiment: only conventional methods, dates owned by facts.
export function applyConventional({crop,unit}){
 const root=document.querySelector('.rich-print'),key=crop.key,mm=96/25.4;
 const need=(s,p=root)=>{const e=p.querySelector(s);if(!e)throw Error('Missing '+s);return e;};
 const all=(s,p=root)=>[...p.querySelectorAll(s)];
 const normal=s=>s.replace(/\s+/g,'');
 const front=need('.front'),back=need('.back'),plant=need('.planting'),soil=need('.soil'),care=need('.care'),harvest=need('.harvest'),pests=need('.pests'),tips=need('.tips');
 const preserved=['.soil','.pests','.varieties','.key-risks','.remember',...(key==='beetroot'?[]:['.intro','.harvest'])].map(selector=>({selector,text:normal(need(selector).textContent)}));
 const edits=[];
 const replace=(selector,before,after)=>{const e=need(selector);if(e.textContent!==before)throw Error('Changed source: '+selector);edits.push({selector,before,after});if(after===null)e.remove();else e.textContent=after;};
 if(key==='carrot')replace('.care li:first-child','Thin only as needed in evenings or damp weather; water dry soil first. Firm afterwards and clear thinnings: bruised roots attract carrot fly.',null);
 if(key==='beetroot'){
  replace('.care li:first-child','Thin direct sowings early to single plants; protect from birds. Plant module clumps intact and pick their largest roots first.','Protect young plants from birds.');
  const intro=need('.intro');const old='Sow small batches or raise module clumps. Early sowings under cover can give golf-ball-sized roots by late spring; later sowings provide summer, autumn and storage crops.';
  if(!intro.textContent.includes(old))throw Error('Beetroot introduction changed');replace('.intro',intro.textContent,intro.textContent.replace(old,'Sow small batches for summer, autumn and storage crops.'));
  const first=need('li',harvest),oldHarvest=first.textContent;
  if(!oldHarvest.startsWith('Pull globe roots before cricket-ball size.'))throw Error('Beetroot harvest changed');
  replace('.harvest li:first-child',oldHarvest,'Pull globe roots before cricket-ball size.');
  for(const e of all(':scope>div',tips))if(/clump/.test(e.textContent)){edits.push({selector:'.tips',before:e.textContent,after:null});e.remove();}tips.style.setProperty('--book-tip-rows','1');
 }
 if(key==='leek')replace('.care li:first-child','Hoe carefully, water in dry spells and mulch with compost. Let dibbed holes fill naturally after watering-in; do not fill them with dry soil.','Hoe carefully, water in dry spells and mulch with compost.');
 const swaps={carrot:[['½ in.','1.3 cm'],['2–3 in.','5–8 cm'],['6 in.','15 cm']],beetroot:[['12 in.','30 cm'],['4 in.','10 cm'],['1 in.','2.5 cm']],leek:[['6–8 in.','15–20 cm'],['12 in.','30 cm'],['8 in.','20 cm'],['6 in.','15 cm'],['⅝ in.','1.5 cm'],['50°F','10°C']],tomato_outdoor:[['18–24 in.','45–60 cm']],potato:[['6 in.','15 cm']]};
 const convert=s=>unit==='imperial'?s:swaps[key].reduce((s,[a,b])=>s.replaceAll(a,b),s);
 const methods=crop.after.map(m=>({...m,text:convert(m.text)}));
 const art=all('.stages article',plant).map(e=>({src:need('img',e).getAttribute('src'),alt:need('img',e).alt,title:need('h3',e).textContent.replace(/^\d+\s*/,'')}));
 plant.replaceChildren();plant.className='planting sowing-proposal conventional-planting';
 const h=document.createElement('h2');h.textContent='Sowing & planting';plant.append(h);
 const strip=document.createElement('div');strip.className='compact-sequence';
 for(const a of art){const fig=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=a.src;img.alt=a.alt;cap.textContent=a.title;fig.append(img,cap);strip.append(fig);}plant.append(strip);
 const body=document.createElement('div');body.className='method-columns';plant.append(body);
 for(const m of methods){const section=document.createElement('section'),title=document.createElement('h3'),p=document.createElement('p');section.className='sowing-method';title.textContent=m.heading;p.textContent=m.text;section.append(title,document.createTextNode(' '),p);body.append(section);}
 // Add precise timing only to the existing date reference area.
 const facts=all('.fact-grid article'),fact=label=>facts.find(a=>need('h3',a).textContent===label);
 function editFact(label,newLabel,text){const a=fact(label);if(!a)throw Error('Missing fact '+label);const before=a.textContent;need('h3',a).textContent=newLabel;if(text!==undefined)need('p',a).textContent=text;edits.push({selector:'Quick facts '+label,before,after:a.textContent});}
 function addFact(label,text){const a=facts[0].cloneNode(true);a.classList.add('new-action-fact');need('h3',a).textContent=label;need('p',a).textContent=text;need('img',a).remove();need('.fact-column:last-child').append(a);edits.push({selector:'Quick facts',before:null,after:a.textContent});}
 if(key==='carrot'){editFact('Sow','Sow direct');editFact('Depth','Sowing depth');editFact('Plant spacing','After thinning',convert('2–3 in. between plants'));}
 if(key==='beetroot'){editFact('Sow','Sow direct');editFact('Depth','Sowing depth');}
 if(key==='leek'){editFact('Sow','Sow in nursery bed','Late Mar–Apr');editFact('Depth','Sowing depth');editFact('Plant spacing','Plant spacing',need('p',fact('Plant spacing')).textContent.replace(/^Between plants:\s*/,''));addFact('Transplant','May–Jul; about pencil-thick.');}
 if(key==='tomato_outdoor'){editFact('Sow','Sow indoors','Late Mar–early Apr');addFact('Plant out','Late May: cloches; early Jun: open.');}
 if(key==='potato'){
  editFact('Sow','Plant tubers','Apr; early crops from Mar');
  const row=fact('Row spacing');need('p',row).textContent=need('p',row).textContent.replace(/^Earlies:/,'First/second earlies:');
  const yieldFact=facts.find(a=>need('h3',a).textContent.startsWith('Yield ('));if(!yieldFact)throw Error('Missing yield');need('.fact-column:last-child').append(yieldFact);
 }
 if(crop.timing_detail&&key!=='leek')addFact(crop.timing_detail.heading,crop.timing_detail.text);
 const cal=need('.calendar'),sow=need('.sowing_time',cal);
 if(key==='carrot'||key==='beetroot')need('b',sow).textContent='DIRECT';
 if(key==='beetroot')all('span',sow).forEach((e,i)=>e.className=[4,5,6].includes(i+1)?'usual':[3,7].includes(i+1)?'extra':'');
 if(key==='leek'||key==='tomato_outdoor'){
  need('b',sow).textContent=key==='leek'?'SOW':'INDOORS';const row=sow.cloneNode(true);row.className='month-row planting-time';need('b',row).textContent=key==='leek'?'MOVE OUT':'PLANT OUT';all('span',row).forEach((e,i)=>e.className=(key==='leek'?[5,6,7]:[5,6]).includes(i+1)?'usual':'');sow.after(row);
  need('p',cal).textContent=key==='leek'?'Early: sow indoors late winter; plant Apr if ready.':'Plant out after frost, in settled warmth';
 }
 if(key==='potato')need('b',sow).textContent='PLANT';
 front.classList.add('tight-opening');
 root.classList.add('conventional-trial');
 // Natural block flow, with the original art retained in one small sequence.
 for(const e of [...back.children,...need('.growing-columns').children]){e.style.removeProperty('margin-top');e.style.removeProperty('margin-bottom');}
 const columns=all('.growing-columns>div'),growing=need('.growing-columns');
 const tail=document.createElement('section');tail.className='planting sowing-proposal conventional-planting continuation-methods';
 const lastMethod=body.lastElementChild;
 const options=[['original',[soil,plant],[care,harvest]],['planting-right',[soil,care,harvest],[plant]],['planting-left',[plant],[soil,care,harvest]],['soil-above',[plant],[care,harvest]],...(['carrot','leek'].includes(key)?[['split-later',[soil,plant],[tail,care,harvest]]]:[])],trials=[];
 const arrangeTail=name=>{if(name==='split-later')tail.append(lastMethod);else{body.append(lastMethod);tail.remove();}};
 for(const mode of ['headings','lead-ins']){plant.classList.toggle('lead-ins',mode==='lead-ins');tail.classList.toggle('lead-ins',mode==='lead-ins');for(const [name,left,right]of options){arrangeTail(name);soil.classList.toggle('full-soil',name==='soil-above');if(name==='soil-above')growing.before(soil);columns[0].append(...left);columns[1].append(...right);for(let width=40;width<=60;width+=2){growing.style.gridTemplateColumns=`${width}fr ${100-width}fr`;const gap=(need('footer',back).getBoundingClientRect().top-tips.getBoundingClientRect().bottom)/mm;trials.push({mode,name,width,gap,heightMm:growing.getBoundingClientRect().height/mm});}}}
 const score=t=>(t.mode==='headings'?0:8)+(t.name==='original'?0:2)+Math.abs(t.width-50)/2;
 const fits=trials.filter(t=>t.gap>=3),best=fits.length?fits.reduce((a,b)=>score(b)<score(a)?b:a):trials.reduce((a,b)=>b.gap>a.gap?b:a);
 plant.classList.toggle('lead-ins',best.mode==='lead-ins');tail.classList.toggle('lead-ins',best.mode==='lead-ins');arrangeTail(best.name);
 const selected=options.find(t=>t[0]===best.name);soil.classList.toggle('full-soil',best.name==='soil-above');if(best.name==='soil-above')growing.before(soil);columns[0].append(...selected[1]);columns[1].append(...selected[2]);growing.style.gridTemplateColumns=`${best.width}fr ${100-best.width}fr`;
 let pages=2;
 if(best.gap<3){
  arrangeTail('original');
  // Keep an honest, readable continuation if the two agreed cuts are not enough.
  pages=3;root.classList.add('three-page-sowing');
  const third=document.createElement('section');third.className='sheet back mock-continuation verso';third.style.cssText=back.style.cssText;
  third.append(need('header',back).cloneNode(true),need('.mock-category',back).cloneNode(true),need('.mock-title',back).cloneNode(true));
  need('.mock-title h1',third).textContent='Care & harvest · '+(key==='tomato_outdoor'?'Outdoor tomato':crop.name);
  const c=document.createElement('div');c.className='growing-columns continuation-columns';c.innerHTML='<div></div><div></div>';c.children[0].append(care);c.children[1].append(harvest);third.append(c,pests,tips,need('footer',back).cloneNode(true));back.after(third);
  growing.replaceWith(soil,plant);soil.classList.add('full-soil');
  const left=document.createElement('div'),right=document.createElement('div'),ms=[...body.children];left.className=right.className='method-column';body.replaceChildren(left,right);left.append(...ms.slice(0,Math.ceil(ms.length/2)));right.append(...ms.slice(Math.ceil(ms.length/2)));
 }
 all('.sheet').forEach((s,i)=>{need('footer .section-label',s).textContent='VEGETABLE GUIDES · SECOND TRIAL';need('footer .folio',s).textContent=`${i+1} / ${pages}`;});
 const retained=preserved.map(x=>({...x,unchanged:normal(need(x.selector).textContent)===x.text}));if(retained.some(x=>!x.unchanged))throw Error('Unlisted content change');
 if(/\bclump/i.test(root.innerText))throw Error('Clump advice remains');
 if(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|midwinter|late winter)\b/.test(plant.innerText))throw Error('Calendar date remains in planting instructions');
 return {trial:{pages,selected:best,alternatives:trials},edits,retained,methods,originalPlantingImages:art,previousBodyWords:crop.previous_body_words,bodyWords:crop.body_words};
}
