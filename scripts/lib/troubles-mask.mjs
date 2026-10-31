// Read-only pixel analysis for invisible wrapping geometry; no displayed image is edited.
// The algorithm is the approved 31 October Brassica mask specimen, at 108 × 126 px.
export const buildWrappingMasks=()=>[...document.querySelectorAll('.diagnostic')].map(img=>{
   const w=img.naturalWidth,h=img.naturalHeight,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
   const pixels=ctx.getImageData(0,0,w,h).data,ink=new Uint8Array(w*h),kept=new Uint8Array(w*h);
   for(let i=0;i<ink.length;i++)ink[i]=pixels[4*i+3]>0&&Math.min(pixels[4*i],pixels[4*i+1],pixels[4*i+2])<247?1:0;
   let discardedPixels=0;const queue=new Int32Array(w*h);
   for(let start=0;start<ink.length;start++)if(ink[start]){
    let head=0,tail=1,touchesEdge=false;queue[0]=start;ink[start]=0;
    while(head<tail){const i=queue[head++],x=i%w;
     if(x===0||x===w-1||i<w||i>=(h-1)*w)touchesEdge=true;
     for(const next of [x>0?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(next>=0&&next<ink.length&&ink[next]){ink[next]=0;queue[tail++]=next;}
    }
    if(tail>=16&&!(touchesEdge&&tail<256))for(let i=0;i<tail;i++)kept[queue[i]]=1;else discardedPixels+=tail;
   }
   const scale=Math.min(img.width/w,img.height/h),dx=(img.width-w*scale)/2,dy=(img.height-h*scale)/2;
   const step=Math.max(1,Math.floor(2/scale)),left=[],right=[];
   for(let y=0;y<h;y+=step){let lo=w,hi=-1;
    for(let yy=y;yy<Math.min(y+step,h);yy++)for(let x=0;x<w;x++)if(kept[yy*w+x]){lo=Math.min(lo,x);hi=Math.max(hi,x+1);}
    if(hi<0)continue;
    const top=dy+y*scale,bottom=dy+Math.min(y+step,h)*scale;
    left.push([dx+lo*scale,top],[dx+lo*scale,bottom]);right.push([dx+hi*scale,top],[dx+hi*scale,bottom]);
   }
   if(!left.length)throw Error('No mask silhouette');
   const points=[...left,...right.reverse()].map(p=>p.map(n=>n.toFixed(3)).join(',')).join(' ');
   const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}"><polygon fill="black" points="${points}"/></svg>\n`;
   const bounds={left:Math.min(...left.map(p=>p[0])),top:Math.min(...left.map(p=>p[1])),bottom:Math.max(...left.map(p=>p[1]))};
   return {key:img.closest('.entry').dataset.key,src:img.getAttribute('src'),width:img.width,height:img.height,bounds,svg,discardedPixels};
  });
