// Reuse the guide's real DOM widgets instead of flattened study screenshots.
// Original captures and source records remain untouched.
export function applyReadableGuideExamples(sources) {
 const sheet=document.querySelector('.combined-opening');
 const insert=(selector,html,cls)=>{
  const target=sheet.querySelector(selector),template=document.createElement('template');
  template.innerHTML=html;const widget=template.content.firstElementChild;
  widget.classList.add(cls);target.replaceChildren(widget);return widget;
 };
 const calendar=insert('.key-calendar-example',sources.radish.calendar,'native-calendar');
 const badge=insert('.difficulty .scale-specimen',sources.broccoli.difficulty,'native-difficulty');
 const needs=insert('.water .scale-specimen',sources.radish.needs,'native-needs');
 needs.querySelector('h2').remove();needs.querySelector(':scope>small').remove();
 for(const row of needs.querySelectorAll(':scope>div'))if(row.querySelector('b').textContent==='Water')row.classList.add('water-example');
 const dates=[...calendar.querySelectorAll('.sowing_time,.harvest_time')].map(r=>[...r.querySelectorAll('span')].map(s=>s.className));
 const ratings=[...needs.querySelectorAll(':scope>div')].map(r=>({label:r.querySelector('b').textContent,value:r.querySelector('strong').textContent,on:r.querySelectorAll('.on').length}));
 if(badge.querySelector('strong').textContent!=='Medium'||badge.querySelector('.difficulty-rating>b').textContent!=='3/5')throw Error('Broccoli example differs from approved capture');
 if(JSON.stringify(ratings)!==JSON.stringify([{label:'Sun',value:'3/5',on:3},{label:'Water',value:'4/5',on:4},{label:'Nutrition',value:'2/5',on:2}]))throw Error('Radish needs differ from approved capture');
 return {dates,ratings,difficulty:'Medium, 3/5',replacements:['Calendar PNG → original calendar DOM','Difficulty PNG → original difficulty DOM','Faded Core Needs PNG → original needs DOM; all rows fully visible on the same peach background'],retainedOriginalIllustrations:6,additionalOriginalGuideIcons:3};
}
