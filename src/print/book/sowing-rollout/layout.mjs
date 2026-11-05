// The input pages are isolated snapshots of the source-linked compact guides.
export function reviseGuide({spec,unit,meta}) {
  const pick = s => s.replace(/\{([^~{}]+)~([^{}]+)\}/g, (_,a,b)=>unit==='imperial'?a:b);
  const q = sel=>document.querySelector(sel);
  const all = sel=>[...document.querySelectorAll(sel)];
  const make = (tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el;};
  const front=q('.front'),back=q('.back'),plant=q('.planting');
  const stageImages=[...plant.querySelectorAll('img')];
  const captions=stageImages.map(i=>i.closest('article')?.querySelector('h3')?.textContent.replace(/^\s*\d+\s*/,'')||i.alt);
  const art=make('div');art.className='compact-sequence';
  stageImages.forEach((im,i)=>{const f=make('figure');f.append(im,make('figcaption',captions[i]));art.append(f);});
  const heading=plant.querySelector('h2');
  plant.className='planting sowing-proposal conventional-planting lead-ins';
  const methods=make('div');methods.className='method-columns';
  for(const [name,text] of spec.methods){const block=make('section');block.className='sowing-method';block.append(make('h3',name),document.createTextNode(' '),make('p',pick(text)));methods.append(block);}
  plant.replaceChildren(heading,art,methods);
  if(stageImages.length===4)art.classList.add('four-drawings');
  if(meta.key==='salsify_scorzonera')art.querySelector('figcaption').textContent='Sow salsify';
  const factArticles=all('.fact-grid article');
  const get=label=>factArticles.find(e=>e.querySelector('h3').textContent===label);
  const cols=all('.fact-column');
  const edit=(el,name,text,icon)=>{
    el.querySelector('h3').textContent=name;el.querySelector('p').textContent=pick(text);
    if(icon)el.querySelector('img').src=icon.startsWith('/')?icon:'/images/coloured-icons/style-a-v1/'+icon+'.svg';
  };
  for(const [old,name,value] of spec.replacements){const el=get(old);if(!el)throw Error('Unknown fact '+old);edit(el,name,value);}
  const base=get('Sow');if(!base)throw Error('Missing sowing fact');
  const depth=get('Depth');
  if(depth)depth.querySelector('h3').textContent=spec.actions[0][0]==='Plant offsets'?'Seed depth':'Sowing depth';
  const actionIcon = label=>{
    if (/^Sow|^From seed/.test(label))return 'sow';
    if(label==='Start kit')return '/images/heroes/richer-a/mushroom.png';
    if(label==='Plant tubers')return '/images/heroes/richer-a/artichoke_jerusalem.png';
    if(label==='Plant cloves')return '/images/heroes/richer-a/garlic.png';
    return 'planting';
  };
  const fact=(name,value,icon,index)=>{
    const el=index===0?base:base.cloneNode(true);edit(el,name,value,icon);el.dataset.action='true';
    if(index!==0)cols.at(-1).append(el);
  };
  spec.actions.forEach(([name,value],i)=>fact(name,value,actionIcon(name),i));
  for(const [name,value,icon] of spec.notes)fact(name,value,icon,1);
  for(const [name,column,copy] of spec.table){
    const row=all('.pests tbody tr').find(e=>e.querySelector('th,strong')?.textContent===name);
    if(!row)throw Error('Missing table label '+name);
    const cell=column==='sign'?(row.cells.length===3?row.cells[1]:row.cells[0].querySelector('span')):row.cells[row.cells.length-1];
    if(!cell)throw Error('Missing table column '+name);cell.textContent=pick(copy);
  }
  const cal=q('.calendar'),sow=cal.querySelector('.sowing_time'),harv=cal.querySelector('.harvest_time');
  const expand=r=>{const set=new Set;for(const x of (r||'').split(',').filter(Boolean)){const [a,b]=x.split('-').map(Number);let i=a;for(let n=0;n<12;n++,i=i%12+1){set.add(i);if(i===(b||a))break;}}return set;};
  const bandNames=[];
  for(const [name,,yes,extra] of spec.actions){
    const row=sow.cloneNode(true),normal=expand(yes),ext=expand(extra);row.className='month-row sowing_time';row.querySelector('b').textContent=name.toUpperCase();bandNames.push(name.toUpperCase());
    row.querySelectorAll('span').forEach((cell,i)=>cell.className=normal.has(i+1)?'usual':ext.has(i+1)?'extra':'');
    cal.insertBefore(row,harv);
  }
  sow.remove(); const longest=Math.max(45,...[...cal.querySelectorAll('b')].map(b=>{const range=document.createRange();range.selectNodeContents(b);return range.getBoundingClientRect().width+5;}));
  for(const row of cal.querySelectorAll('.month-row')) row.style.gridTemplateColumns=Math.ceil(longest)+'px repeat(12,minmax(0,1fr))';
  for(const [where,txt] of spec.moves){const ol=q('.'+where+' ol,.'+where+' ul');const li=make('li',pick(txt));if(where==='care')ol.prepend(li);else ol.append(li);}
  if(spec.intro)q('.intro').textContent=pick(spec.intro);
  for(const [where,idx,text] of spec.edits){const el=all('.'+where+' li')[Number(idx)-1];if(!el)throw Error('Missing '+where+' item '+idx);el.textContent=pick(text);}
  document.querySelector('.rich-print').classList.add('conventional-trial');
  front.classList.add('tight-opening');
  // Old source proofs can have hand-distributed vertical margins.
  for(const e of [...back.children,...q('.growing-columns').children]){e.style.removeProperty('margin-top');e.style.removeProperty('margin-bottom');}
  const footer=back.querySelector('footer');
  const nav=make('nav');nav.setAttribute('aria-label','See also');if(meta.links.length){nav.append('See also: ');meta.links.forEach((l,i)=>{if(i)nav.append(' · ');const a=make('a',l.text);a.href='../../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf#page='+l.pdfPage;nav.append(a);});footer.querySelector('.folio').before(nav);}
  const title=back.querySelector('.mock-title h1');title.style.removeProperty('width');title.style.setProperty('white-space','nowrap','important');title.style.setProperty('font-size','28.5pt','important');
  // Fit only the decorative title, leaving clear space for the small crop drawing.
  const r=document.createRange();r.selectNodeContents(title);
  let pt=28.5;while(r.getBoundingClientRect().width>141*96/25.4&&pt>17){pt-=.25;title.style.setProperty('font-size',pt+'pt','important');}
  return {captions,bandNames};
}

// Choose front fact positions without reducing text size. Preserve figure and
// paragraph order elsewhere. Prefer the original column proportions when possible.
export function fitFront() {
  const front=document.querySelector('.front'), grid=front.querySelector('.fact-grid');
  const cols=[...grid.querySelectorAll('.fact-column')], left=[...cols[0].children],right=[...cols[1].children];
  const original=[...left,...right], length=e=>e.innerText.replace(/\s+/g,' ').length;
  const gap=()=> (front.querySelector('footer').getBoundingClientRect().top-front.querySelector('.key-risks').getBoundingClientRect().bottom)*25.4/96;
  function arrange(short,width) {
    cols[0].replaceChildren(...short);cols[1].replaceChildren(...original.filter(e=>!short.includes(e)));
    if(width)grid.style.setProperty('grid-template-columns',width+'fr '+(100-width)+'fr','important');
  }
  let best={gap:gap(),short:left,width:null};if(best.gap>=3.2)return best.gap;
  const permutations=[left,...[2,3,4,5,6,7,8].filter(n=>n<original.length).map(n=>original.slice().sort((a,b)=>length(a)-length(b)).slice(0,n).sort((a,b)=>original.indexOf(a)-original.indexOf(b)))];
  for(const short of permutations)for(const width of [50,47,53,44,56]){
    arrange(short,width);const g=gap();if(g>best.gap)best={gap:g,short,width};if(g>=3.2)return g;
  }
  arrange(best.short,best.width);
  if(gap()<3.2){
    front.classList.add('paired-facts');
    const byPriority=[...original.filter(e=>e.dataset.action),...original.filter(e=>!e.dataset.action)];
    const splits=[byPriority.filter((_,i)=>i%2===0),...Array.from({length:3},(_,i)=>byPriority.slice(0,Math.floor(original.length/2)-1+i))];
    let paired=null;
    for(const short of splits)for(const width of [50,47,53,45,55]){
      arrange(short,width);const g=gap();if(!paired||g>paired.gap)paired={gap:g,short,width};
    }
    if(paired.gap>best.gap){arrange(paired.short,paired.width);return gap();}
    front.classList.remove('paired-facts');arrange(best.short,best.width);
  }
  return gap();
}

// Column heights and pest-table heights are independent, so measure each in turn.
export function fitBack() {
  const back=document.querySelector('.recto'), q=s=>back.querySelector(s),grid=q('.growing-columns'),[l,r]=grid.children;
  const soil=q('.soil'),care=q('.care'),harvest=q('.harvest'),plant=q('.planting'),tips=q('.tips');
  const headers=[...q('.pests thead tr').children], rows=q('.pests tbody');const removed=[];
  // Find transparent margins once. Only surplus paper inside an image slot
  // may be reclaimed; the painted artwork keeps its size and aspect ratio.
  const margins=[...plant.querySelectorAll('figure img')].map(img=>{
    const canvas=document.createElement('canvas');
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let first=canvas.height,last=-1;
    for(let y=0;y<canvas.height;y++){
      let offset=y*canvas.width*4+3;
      for(let x=0;x<canvas.width;x++,offset+=4)if(data[offset]>0){first=Math.min(first,y);last=y;break;}
    }
    return {img,first,last};
  });
  let compactArt=false;
  function alignArt(){
    if(!compactArt)return;
    const blank=margins.map(({img,first,last})=>{
      const box=img.getBoundingClientRect(), scale=Math.min(box.height/img.naturalHeight,box.width/img.naturalWidth);
      const letterbox=(box.height-scale*img.naturalHeight)/2;
      return [letterbox+first*scale,letterbox+(img.naturalHeight-last-1)*scale];
    });
    const top=Math.max(0,Math.min(...blank.map(a=>a[0]))-2);
    const bottom=Math.max(0,Math.min(...blank.map(a=>a[1]))-2);
    margins.forEach(({img})=>{img.style.display='block';img.style.marginTop=-top+'px';img.style.marginBottom=-bottom+'px';});
  }
  const gap=()=> (q('footer').getBoundingClientRect().top-tips.getBoundingClientRect().bottom)*25.4/96;
  const arrangements=[
    [[soil,plant],[care,harvest]], [[plant],[soil,care,harvest]], [[soil,care],[plant,harvest]], [[plant],[care,harvest]]
  ];
  function position(index,w){const [a,b]=arrangements[index];soil.classList.toggle('full-soil',index===3);if(index===3)grid.before(soil);l.replaceChildren(...a);r.replaceChildren(...b);grid.style.setProperty('grid-template-columns',w+'fr '+(100-w)+'fr','important');alignArt();}
  function table(widths){headers.forEach((e,i)=>e.style.setProperty('width',widths[i]+'%','important'));}
  const tableWidths=headers.length===2?Array.from({length:13},(_,i)=>[38+2*i,62-2*i]):[...Array(8)].flatMap((_,i)=>[...Array(9)].map((_,j)=>[16+2*i,24+2*j,60-2*i-2*j]));
  let best,attempts=[];
  while(true){
    position(0,50);let bestT=-Infinity,bestWidths;
    for(const w of tableWidths){table(w);const g=gap();if(g>bestT){bestT=g;bestWidths=w;}}
    table(bestWidths);best=null;
    for(let i=0;i<arrangements.length;i++)for(const w of [50,48,52,46,54,44,56,42,58,40,60,38,62]){
      position(i,w);const g=gap(),cost=(i===0?0:i===3?3:6)+Math.abs(w-50)/3;
      if(!best||(g>=3.04&&best.gap<3.04)||(g>=3.04&&best.gap>=3.04&&cost<best.cost)||(best.gap<3.04&&g>best.gap))best={index:i,w,gap:g,cost};
    }
    position(best.index,best.w);best.widths=bestWidths;attempts.push({rows:rows.children.length,...best});
    if(best.gap>=3.04)break;
    if(!compactArt){compactArt=true;continue;}
    if(rows.children.length<=1)break;
    const last=rows.lastElementChild;removed.push(last.querySelector('th,strong')?.textContent||last.cells[0].textContent);last.remove();
  }
  return {removed,attempts,compactArt};
}
