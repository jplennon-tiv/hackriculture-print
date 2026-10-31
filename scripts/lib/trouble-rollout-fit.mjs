import {packPriority} from './trouble-priority-fit.mjs';

// Column breaks are a layout choice too. A full left column is not worth placing
// two ribbons directly opposite one another. Keep the strict pages as the bound.
export function packSeparated(order,heights,capacities,stars,basePage,startPage,bodyTops){
 const prefix=[0];for(const k of order)prefix.push(prefix.at(-1)+heights[k]+8);
 const span=(a,b)=>a===b?0:prefix[b]-prefix[a]-8,cache=new Map();
 const boxes=(a,b,page)=>{let y=bodyTops[page===0?0:1];const out=[];for(let x=a;x<b;x++){if(stars.has(order[x]))out.push([y,y+heights[order[x]]]);y+=heights[order[x]]+8;}return out;};
 const overlap=(a,b)=>a.some(x=>b.some(y=>Math.min(x[1],y[1])>Math.max(x[0],y[0])));
 function plan(from,page,previousRight=[]){
  if(from===order.length)return [];
  const id=JSON.stringify([from,page,previousRight]);if(cache.has(id))return cache.get(id);
  const cap=capacities[page===0?0:1];let best=null;
  for(let middle=from+1;middle<=order.length;middle++){
   if(span(from,middle)>cap+.1)break;
   const left=boxes(from,middle,page);if((startPage+page)%2===1&&overlap(previousRight,left))continue;
   for(let end=middle;end<=order.length;end++){
    if(span(middle,end)>cap+.1)break;
    if(order.slice(from,end).some(k=>Math.abs(page-basePage[k])>1))continue;
    const right=boxes(middle,end,page);if(overlap(left,right))continue;
    const rest=plan(end,page+1,(startPage+page)%2===0?right:[]);if(!rest)continue;
    const head={keys:order.slice(from,end),columns:[order.slice(from,middle),order.slice(middle,end)],heights:[span(from,middle),span(middle,end)],capacity:cap},candidate=[head,...rest];
    const preference=!best?0:best[0].keys.length-head.keys.length||(end===order.length?Math.abs(head.heights[0]-head.heights[1])-Math.abs(best[0].heights[0]-best[0].heights[1]):0)||best[0].columns[0].length-head.columns[0].length;
    if(!best||candidate.length<best.length||candidate.length===best.length&&preference<0)best=candidate;
   }
  }
  cache.set(id,best);return best;
 }
 return plan(0,0);
}

/** Bounded repair and fit search; the strict rank order remains the fixed page reference. */
export function exploreRolloutFit(order,heights,capacities,metadata,{startPage=0,bodyTops=[0,0],maxInvertedRankGap=1}={}){
 const ranks=Object.fromEntries(metadata.map(x=>[x.key,x.rank])),stars=new Set(metadata.filter(x=>x.star).map(x=>x.key));
 const base=packPriority(order,heights,capacities);if(!base)throw Error('Entry exceeds available column height');
 const basePage=Object.fromEntries(base.flatMap((p,i)=>p.keys.map(k=>[k,i]))),cache=new Map();
 function assess(candidate,control=false){
  const id=candidate.join('|');if(cache.has(id))return cache.get(id);
  let inversions=0;for(let i=0;i<candidate.length;i++)for(let j=i+1;j<candidate.length;j++)if(ranks[candidate[i]]<ranks[candidate[j]]){const gap=ranks[candidate[j]]-ranks[candidate[i]];if(gap>maxInvertedRankGap){cache.set(id,null);return null;}inversions+=gap;}
  const pages=control?base:packSeparated(candidate,heights,capacities,stars,basePage,startPage,bodyTops)??packPriority(candidate,heights,capacities);if(!pages)return null;
  const pageByKey=Object.fromEntries(pages.flatMap((p,i)=>p.keys.map(k=>[k,i])));
  if(candidate.some(k=>Math.abs(pageByKey[k]-basePage[k])>1)){cache.set(id,null);return null;}
  let violations=candidate.filter((k,i)=>stars.has(k)&&stars.has(candidate[i+1])).length;
  const boxes=[];pages.forEach((p,i)=>p.columns.forEach((col,c)=>{let y=bodyTops[i===0?0:1];for(const key of col){if(stars.has(key))boxes.push({key,page:i,col:c,top:y,bottom:y+heights[key]});y+=heights[key]+8;}}));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j],adjacent=a.page===b.page&&a.col!==b.col||b.page===a.page+1&&(startPage+a.page)%2===0&&a.col===1&&b.col===0;
   if(adjacent&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))violations++;
  }
  const whitespace=pages.slice(0,-1).reduce((s,p,i)=>s+(2*p.capacity-p.heights[0]-p.heights[1])*(pages.length-i),0);
  const moves=candidate.filter(k=>pageByKey[k]!==basePage[k]).length,late=candidate.reduce((s,k)=>s+Math.max(0,pageByKey[k]-basePage[k])*ranks[k]**2,0),drift=candidate.reduce((s,k,i)=>s+Math.abs(i-order.indexOf(k)),0);
  const score=pages.length*1e7+whitespace+inversions*100+late*5+moves*10+drift;
  const result={order:candidate,pages,pageByKey,inversions,whitespace,moves,late,drift,score,violations};cache.set(id,result);return result;
 }
 const baseline=assess(order,true);cache.clear();let best=assess(order),passes=[];
 // A strict order may put several rank-10 features together. Search through
 // partially repaired states instead of requiring an already-valid starting order.
 const compare=(a,b)=>a.violations-b.violations||a.score-b.score;
 if(best.violations){let beam=[best];const visited=new Set([order.join('|')]);for(let round=0;round<8&&best.violations;round++){
  const candidates=[];for(const state of beam)for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++){
   if(i===j||Math.abs(basePage[state.order[i]]-basePage[state.order[j]])>1)continue;
   const candidate=[...state.order];candidate.splice(j,0,candidate.splice(i,1)[0]);const id=candidate.join('|');if(visited.has(id))continue;visited.add(id);
   const result=assess(candidate);if(result)candidates.push(result);
  }
  candidates.sort(compare);if(!candidates.length)break;beam=candidates.slice(0,16);if(compare(beam[0],best)<0){best=beam[0];passes.push({stage:'separate features',round,violations:best.violations,score:best.score,order:best.order});}
 }}
 if(best.violations){
  // Three top-ranked stars can need an extra ordinary separator. John's fixed
  // limit is one page, not one rank point. Widen only after the tighter search
  // fails, retain that page bound, and report the exception for visual review.
  if(maxInvertedRankGap===1){const fallback=exploreRolloutFit(order,heights,capacities,metadata,{startPage,bodyTops,maxInvertedRankGap:2});fallback.rules.rankGapReason='One-rank search could not separate all approved stars; two-rank search used, with the same one-page limit.';return fallback;}
  throw Error(`No separated feature layout found within the one-page/rank bounds (${best.violations} conflicts)`);
 }
 for(const sameRankOnly of [true,false])for(let round=0;round<10;round++){
  let next=best;for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++){
   if(i===j||Math.abs(basePage[best.order[i]]-basePage[best.order[j]])>1||sameRankOnly&&ranks[best.order[i]]!==ranks[best.order[j]])continue;
   const candidate=[...best.order];candidate.splice(j,0,candidate.splice(i,1)[0]);const r=assess(candidate);if(r&&!r.violations&&r.score<next.score-.001)next=r;
  }
  if(next===best)break;passes.push({stage:sameRankOnly?'fit within ties':'fit adjacent ranks',scoreBefore:best.score,scoreAfter:next.score,order:next.order});best=next;
 }
 const sparseEarlyColumn=best.pages.slice(0,-1).some(p=>p.heights.some(h=>h<p.capacity*.5));
 if(maxInvertedRankGap===1&&(best.pages.length>base.length||sparseEarlyColumn)){
  const fallback=exploreRolloutFit(order,heights,capacities,metadata,{startPage,bodyTops,maxInvertedRankGap:2});
  if(fallback.selected.pages.length<best.pages.length||sparseEarlyColumn&&fallback.selected.score<best.score){fallback.rules.rankGapReason='Two-rank search avoids an extra page or a less-than-half-full earlier column caused by feature separation, retaining the one-page movement limit.';return fallback;}
 }
 return{baseline,selected:best,passes,rules:{maxPageDisplacement:1,maxInvertedRankGap,starsNotConsecutive:true,oppositeStarsCannotOverlapVertically:true,acrossGutterChecked:true,alphabeticalTieBreak:false,highestRankMayMoveOnePage:true,score:'page count, early-weighted nonfinal whitespace, rank inversions, rank-weighted deferrals, moves and position drift'}};
}
