// One-off Courgettes and Marrows explanation; no canonical advice is changed.
export function composeCourgette() {
  const q=s=>document.querySelector(s);
  // John excludes this food-quality issue from the Pests & diseases table.
  const bitterness=[...q('.pests tbody').rows].filter(row=>row.querySelector('th,strong')?.textContent==='Bitterness');
  if(bitterness.length!==1)throw Error('Expected one Courgette Bitterness row');
  bitterness[0].remove();
  // Keep metric dimensions with their unit in the narrow Quick facts column.
  const depth=q('.fact-grid article:has(img[src$="/depth.svg"]) p');
  if(!depth)throw Error('Missing Courgette sowing-depth fact');
  depth.textContent=depth.textContent.replace(/(\d+(?:\.\d+)?) cm/g,'$1\u00a0cm');
  const sequence=q('.planting .compact-sequence'),methods=q('.planting .method-columns');
  if(sequence.children.length!==2||methods.children.length!==3)throw Error('Changed Courgette planting source');
  const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  img.src='/images/planting/marrow_courgette/revision-v1/prepared-pocket.png';img.alt='Cutaway of a planting pocket refilled with soil mixed with mature compost, making a slight mound.';caption.textContent='Prepare a pocket';figure.append(img,caption);sequence.insertBefore(figure,sequence.lastElementChild);
  sequence.lastElementChild.querySelector('figcaption').textContent='Plant out';
  // At three columns the old images still paint at their width-limited size;
  // the smaller frame reclaims vertical letterboxing, not text size.
  const style=document.createElement('style');style.textContent='.courgette-pocket-review .compact-sequence img{height:54px!important}';document.head.append(style);q('.back').classList.add('courgette-pocket-review');
}

export function fitCourgette() {
  const q=s=>document.querySelector('.back '+s),grid=q('.growing-columns'),[left,right]=grid.children;
  const soil=q('.soil'),plant=q('.planting'),care=q('.care'),harvest=q('.harvest'),trials=[];
  const arrangements=[[[soil,plant],[care,harvest]],[[plant],[soil,care,harvest]],[[soil,care],[plant,harvest]]];
  let best;
  for(let i=0;i<arrangements.length;i++)for(const width of [48,50,51,52,54,56,58]){
    left.replaceChildren(...arrangements[i][0]);right.replaceChildren(...arrangements[i][1]);soil.classList.remove('full-soil');grid.style.setProperty('grid-template-columns',width+'fr '+(100-width)+'fr','important');
    const gap=(q('footer').getBoundingClientRect().top-q('.tips').getBoundingClientRect().bottom)*25.4/96;
    const result={arrangement:i,leftPercent:width,gapMm:gap};trials.push(result);
    if(!best||gap>best.gapMm)best=result;
  }
  left.replaceChildren(...arrangements[best.arrangement][0]);right.replaceChildren(...arrangements[best.arrangement][1]);grid.style.setProperty('grid-template-columns',best.leftPercent+'fr '+(100-best.leftPercent)+'fr','important');
  return {best,trials,pestsRetained:q('.pests tbody').children.length};
}
