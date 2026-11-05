// Bounded composition proposal for Chicory only. Frozen source pages stay intact.
export function composeChicory({unit,copy}) {
  const q=s=>document.querySelector(s), pick=s=>s.replace(/\{([^~{}]+)~([^{}]+)\}/g,(_,a,b)=>unit==='imperial'?a:b);
  const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=pick(text);if(cls)el.className=cls;return el;};
  const plant=q('.planting'),care=q('.care ol'),tips=q('.tips');
  if(care.children.length!==5||tips.querySelectorAll(':scope > div').length!==4)throw Error('Changed Chicory source structure');
  const oldTips=[...tips.querySelectorAll(':scope > div')];oldTips[0].remove();oldTips[3].remove();
  const icon=oldTips[1].querySelector('img');icon.src='/images/planting/chicory/forcing-v1/opaque-cover.svg';icon.alt='Opaque forcing cover';
  [...care.children].slice(2).forEach(e=>e.remove());
  // For this proposal, three forcing scenes replace the generic sow/thin strip.
  // Both source drawings remain frozen in the original guide.
  plant.querySelector('.compact-sequence').remove();
  const methods=plant.querySelector('.method-columns');methods.replaceChildren();
  const method=([title,text])=>{const section=make('section',null,'sowing-method');section.append(make('h3',title),document.createTextNode(' '),make('p',text));return section;};
  methods.append(method(copy.sow));
  const forcing=make('div',null,'chicory-forcing');
  forcing.append(make('h3','Forcing winter chicons','forcing-heading'));
  const fig=make('figure',null,'forcing-figure'),im=make('img');im.src='/images/planting/chicory/forcing-v1/forcing-sequence.png';im.alt='Trim leaves above the crown; stand roots in compost with crowns exposed; cover the pot with an opaque upturned bucket.';fig.append(im);
  const caption=make('figcaption',null,'forcing-captions');for(const title of ['1 · Prepare','2 · Pot up','3 · Cover'])caption.append(make('span',title));fig.append(caption);forcing.append(fig);
  copy.steps.forEach(step=>forcing.append(method(step)));plant.append(forcing);
  q('.back').classList.add('chicory-forcing-review');
  const style=make('style');style.textContent=`
    .chicory-forcing-review .planting .compact-sequence{margin-bottom:1.4mm!important}
    .chicory-forcing-review .chicory-forcing{margin-top:2mm}
    .chicory-forcing-review .forcing-heading{font:900 10pt/1.2 'Nunito Sans';color:var(--deep);margin:0 0 1mm}
    .chicory-forcing-review .forcing-intro{font:400 9pt/1.25 'Nunito Sans';margin:0 0 1mm}
    .chicory-forcing-review .forcing-figure{margin:1mm 0 2mm!important}
    .chicory-forcing-review .forcing-figure img{display:block;width:100%;height:auto;max-width:none!important}
    .chicory-forcing-review .forcing-captions{display:grid;grid-template-columns:repeat(3,1fr);gap:1mm;font:800 7.8pt/1.2 'Nunito Sans';text-align:center;margin-top:1mm}
    .chicory-forcing-review .chicory-forcing .sowing-method{margin:0 0 1.5mm!important}
    .chicory-forcing-review .chicory-forcing .sowing-method:last-child{margin-bottom:0!important}
    .chicory-forcing-review .tips{grid-template-columns:auto 1fr 1fr!important}
    .chicory-forcing-review .tips h2{grid-row:auto!important}
  `;document.head.append(style);
}

// Trial only the crop-specific column split, with the complete table retained.
export function fitChicory() {
  const q=s=>document.querySelector('.back '+s),grid=q('.growing-columns'),[left,right]=grid.children;
  const plant=q('.planting'),soil=q('.soil'),care=q('.care'),harvest=q('.harvest');
  left.replaceChildren(plant);right.replaceChildren(soil,care,harvest);soil.classList.remove('full-soil');
  const trials=[];let best=null;
  for(const width of [54,56,58,60,62,64]){
    grid.style.setProperty('grid-template-columns',width+'fr '+(100-width)+'fr','important');
    const gap=(q('footer').getBoundingClientRect().top-q('.tips').getBoundingClientRect().bottom)*25.4/96;
    trials.push({leftPercent:width,gapMm:gap});if(!best||gap>best.gapMm)best=trials.at(-1);
  }
  grid.style.setProperty('grid-template-columns',best.leftPercent+'fr '+(100-best.leftPercent)+'fr','important');
  return {best,trials,pestsRetained:q('.pests tbody').children.length};
}
