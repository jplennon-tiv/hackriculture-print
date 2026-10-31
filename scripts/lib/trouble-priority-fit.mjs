/** Measured complete-entry packing. Source priorities are never rewritten. */
export function packPriority(order, heights, capacities) {
 const prefix=[0];for(const key of order)prefix.push(prefix.at(-1)+heights[key]+8);
 const span=(a,b)=>a===b?0:prefix[b]-prefix[a]-8;
 const cache=new Map();
 function plan(from,opening){
  if(from===order.length)return [];
  const id=from+'/'+opening;if(cache.has(id))return cache.get(id);
  const cap=capacities[opening?0:1];let best=null;
  for(let middle=from+1;middle<=order.length;middle++){
   if(span(from,middle)>cap+.1)break;
   for(let end=middle;end<=order.length;end++){
    if(span(middle,end)>cap+.1)break;
    const rest=plan(end,false);if(!rest)continue;
    const candidate=[{keys:order.slice(from,end),columns:[order.slice(from,middle),order.slice(middle,end)],heights:[span(from,middle),span(middle,end)],capacity:cap},...rest];
    const endPreference=!best?0:from+best[0].keys.length-end;
    const balancePreference=!best||end!==order.length?0:Math.abs(span(from,middle)-span(middle,end))-Math.abs(best[0].heights[0]-best[0].heights[1]);
    const preference=!best?0:endPreference||balancePreference||from+best[0].columns[0].length-middle;
    if(!best||candidate.length<best.length||candidate.length===best.length&&preference<0)best=candidate;
   }
  }
  cache.set(id,best);return best;
 }
 return plan(0,true);
}
export function explorePriorityFit(order,heights,capacities,metadata){
 const ranks=Object.fromEntries(metadata.map(x=>[x.key,x.rank])),stars=new Set(metadata.filter(x=>x.star).map(x=>x.key));
 const baseline=packPriority(order,heights,capacities),basePage=Object.fromEntries(baseline.flatMap((p,i)=>p.keys.map(k=>[k,i])));
 function assess(candidate){
  const pages=packPriority(candidate,heights,capacities);if(!pages)return null;
  const pageByKey=Object.fromEntries(pages.flatMap((p,i)=>p.keys.map(k=>[k,i])));
  if(candidate.some(k=>Math.abs(pageByKey[k]-basePage[k])>1))return null;
  // Protect the highest priority entries from being deferred beyond the opening.
  if(candidate.some(k=>ranks[k]===10&&pageByKey[k]>basePage[k]))return null;
  let inversions=0;
  for(let i=0;i<candidate.length;i++){
   if(stars.has(candidate[i])&&stars.has(candidate[i+1]))return null;
   for(let j=i+1;j<candidate.length;j++)if(ranks[candidate[i]]<ranks[candidate[j]]){
    const gap=ranks[candidate[j]]-ranks[candidate[i]];if(gap>1)return null;inversions+=gap;
   }
  }
  // Same-page stars must not sit directly opposite one another; natural y positions.
  for(const p of pages){
   const boxes=[];p.columns.forEach((col,c)=>{let y=0;for(const k of col){if(stars.has(k))boxes.push({key:k,col:c,top:y,bottom:y+heights[k]});y+=heights[k]+8;}});
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(boxes[i].col!==boxes[j].col&&Math.min(boxes[i].bottom,boxes[j].bottom)>Math.max(boxes[i].top,boxes[j].top))return null;
  }
  const whitespace=pages.slice(0,-1).reduce((s,p,i)=>s+(2*p.capacity-p.heights[0]-p.heights[1])*(pages.length-i),0);
  const moves=candidate.filter(k=>pageByKey[k]!==basePage[k]).length;
  const late=candidate.reduce((s,k)=>s+Math.max(0,pageByKey[k]-basePage[k])*ranks[k]*ranks[k],0);
  const drift=candidate.reduce((s,k,i)=>s+Math.abs(i-order.indexOf(k)),0);
  return {order:candidate,pages,pageByKey,inversions,whitespace,moves,late,drift,score:pages.length*1e7+whitespace+inversions*100+late*5+moves*10+drift};
 }
 const start=assess(order);if(!start)throw Error('Strict priority control violates star separation; manual review needed');
 let best=start;const passes=[];
 for(const sameRankOnly of [true,false]){
  for(let round=0;round<10;round++){
   let next=best;
   for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++){
    if(i===j||Math.abs(basePage[best.order[i]]-basePage[best.order[j]])>1)continue;
    if(sameRankOnly&&ranks[best.order[i]]!==ranks[best.order[j]])continue;
    const candidate=[...best.order];candidate.splice(j,0,candidate.splice(i,1)[0]);
    const result=assess(candidate);if(result&&result.score<next.score-.001)next=result;
   }
   if(next===best)break;
   passes.push({sameRankOnly,scoreBefore:best.score,scoreAfter:next.score,order:next.order});best=next;
  }
 }
 return {baseline:start,selected:best,passes,rules:{maxPageDisplacement:1,maxInvertedRankGap:1,highestPriorityNotDeferred:true,starsNotConsecutive:true,samePageStarsCannotOverlapVertically:true,alphabeticalTieBreak:false,score:'10,000,000 per page + early-weighted nonfinal whitespace + 100 per rank inversion + 5 × rank² for each deferred entry + 10 per page-shifted entry + total position drift'}};
}
