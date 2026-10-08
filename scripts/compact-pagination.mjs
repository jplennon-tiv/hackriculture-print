// Explicit review-book policy; ordinary single-guide exports do not insert pages.
export const facingPolicies=['continuous','vegetable-spreads'];

export function afterGuide(startPage,pages,type,policy='continuous') {
    if(!Number.isInteger(startPage)||startPage<1||!Number.isInteger(pages)||pages<1||!facingPolicies.includes(policy))throw Error('Invalid compact pagination input');
    const endPage=startPage+pages-1;
    const blankAfterPages=policy==='vegetable-spreads'&&type==='vegetable'&&(endPage+1)%2!==0?1:0;
    return {endPage,blankAfterPages,blankFoliosAfter:blankAfterPages?[endPage+1]:[],nextPage:endPage+1+blankAfterPages};
}
