// Proposed header-only treatment. Does not alter the normal book/A4 renderer.
export function applyHeaderWidgetTrial({circleGapPx=20,titleGapPx=20}={}) {
 const sheet=document.querySelector('.sheet.front'),header=sheet.querySelector(':scope>header');
 const title=header.querySelector('h1'),seasons=header.querySelector('.header-seasons'),badge=header.querySelector('.header-difficulty');
 const mm=96/25.4,bounds=sheet.getBoundingClientRect();
 const rect=el=>{const r=el.getBoundingClientRect();return {left:(r.left-bounds.left)/mm,top:(r.top-bounds.top)/mm,right:(r.right-bounds.left)/mm,bottom:(r.bottom-bounds.top)/mm};};
 const textBounds=el=>{
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),rs=[];
  while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);rs.push(...[...range.getClientRects()].filter(r=>r.width&&r.height));}
  return {left:(Math.min(...rs.map(r=>r.left))-bounds.left)/mm,top:(Math.min(...rs.map(r=>r.top))-bounds.top)/mm,right:(Math.max(...rs.map(r=>r.right))-bounds.left)/mm,bottom:(Math.max(...rs.map(r=>r.bottom))-bounds.top)/mm};
 };
 const circle=rect(header.querySelector('.header-art .peach'));
 const before={title:textBounds(title),seasons:rect(seasons),badge:rect(badge),badgeColour:getComputedStyle(badge).backgroundColor};
 const words=header.innerText,paper=getComputedStyle(sheet).backgroundColor;
 // Place the visible widget 20 px before the circle, then shift right only
 // when the actual title text (including its full stop) needs clearance.
 const containing=seasons.offsetParent.getBoundingClientRect();
 seasons.style.textAlign='left';seasons.querySelector('.season-symbols').style.justifyContent='flex-start';
 const initialText=textBounds(seasons),initialSymbols=rect(seasons.querySelector('.season-symbols'));
 const visibleWidthMm=Math.max(initialText.right,initialSymbols.right)-before.seasons.left;
 const preferredLeftMm=circle.left-circleGapPx/mm-visibleWidthMm;
 const actualLeftMm=Math.max(preferredLeftMm,before.title.right+titleGapPx/mm);
 seasons.style.setProperty('left',`${bounds.left+actualLeftMm*mm-containing.left}px`,'important');
 badge.style.setProperty('background-color','var(--paper)','important');
 const after={title:textBounds(title),seasons:rect(seasons),badge:rect(badge),badgeColour:getComputedStyle(badge).backgroundColor};
 if(words!==header.innerText)throw Error('Header words changed');
 if(JSON.stringify(before.title)!==JSON.stringify(after.title)||JSON.stringify(before.badge)!==JSON.stringify(after.badge))throw Error('Title or badge moved');
 if(after.badgeColour!==paper)throw Error('Badge does not match page paper');
 const seasonText=textBounds(seasons),symbols=rect(seasons.querySelector('.season-symbols'));
 const seasonRight=Math.max(seasonText.right,symbols.right);
 if(seasonRight>after.badge.left-3)throw Error('Season block crowds difficulty badge');
 if(after.seasons.left-after.title.right<titleGapPx/mm-.05)throw Error('Insufficient title padding');
 const collisionShiftPx=(actualLeftMm-preferredLeftMm)*mm;
 if(collisionShiftPx<.1&&Math.abs((circle.left-seasonRight)*mm-circleGapPx)>.1)throw Error('Circle gap is incorrect');
 return {title:title.innerText,headerText:words,paper,before,after,circle,circleGapPx:(circle.left-seasonRight)*mm,preferredCircleGapPx:circleGapPx,minimumTitleGapPx:titleGapPx,collisionShiftPx,titleGapMm:after.seasons.left-after.title.right,shiftLeftMm:before.seasons.left-after.seasons.left,seasonToBadgeGapMm:after.badge.left-seasonRight,headerBottomMm:rect(header).bottom};
}
