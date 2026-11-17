const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../../../../..');
const output = __dirname;
const read = file => fs.readFile(path.join(__dirname,file), 'utf8');
const pngURI = buf => 'data:image/png;base64,' + buf.toString('base64');
async function build() {
  const choices=JSON.parse(await read('ARTWORK.json')).arrangements;
  const base=await read('../cream-solid-lettering/Cream-Solid-Lettering.svg');
  await fs.mkdir(output,{recursive:true});
  for (const [index,choice] of choices.entries()) {
    const input=path.join(root,choice.file);
    const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const {width,height}=info;
    // Choose the quietest line between the two independent alpha silhouettes.
    const occupancy=Array.from({length:height},(_,y)=>{
      let count=0;
      for(let x=0;x<width;x++) if(data[4*(y*width+x)+3]>10) count++;
      return count;
    });
    let split=Math.round(height/2);
    for(let y=Math.floor(height*.33);y<height*.66;y++) {
      if(occupancy[y]<occupancy[split]) split=y;
    }
    console.log(choice.name, 'split',split,'pixels across split',occupancy[split]);
    let svg=base;
    for(const [j,id] of ['top-vegetables','bottom-vegetables'].entries()) {
      const top=j?split:0, end=j?height:split;
      let left=width,right=-1,first=end,last=top;
      for(let y=top;y<end;y++) for(let x=0;x<width;x++) {
        if(data[4*(y*width+x)+3]<3) continue;
        left=Math.min(left,x);right=Math.max(right,x);first=Math.min(first,y);last=Math.max(last,y);
      }
      const w=right-left+1,h=last-first+1;
      const band=await sharp(input).extract({left,top:first,width:w,height:h}).png().toBuffer();
      const headerHeight = 350;
      const scale=Math.min(1082/w,(j?462:headerHeight)/h);
      const W=w*scale,H=h*scale, X=(1100-W)/2,Y=j?1420-H:6;
      const group='<g id="'+id+'" inkscape:groupmode="layer" inkscape:label="'+(j?'Lower':'Upper')+' arrangement"><image x="'+X+'" y="'+Y+'" width="'+W+'" height="'+H+'" href="'+pngURI(band)+'" filter="url(#harvest-shadow)"/></g>';
      const start=svg.indexOf('<g id="'+id+'"'), stop=svg.indexOf('\n',start);
      if(start<0 || stop<0) throw Error('Missing source group '+id);
      svg=svg.slice(0,start)+group+svg.slice(stop);
    }
    svg=svg.replace('</defs>', '<filter id="harvest-shadow" x="-25%" y="-30%" width="150%" height="175%" color-interpolation-filters="sRGB"><feDropShadow dx="-3" dy="8" stdDeviation="6" flood-color="#3f331d" flood-opacity=".38"/></filter></defs>');
    await fs.writeFile(path.join(output,choice.key+'.svg'),svg);
    const preview=await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"'))).png().toBuffer();
    await fs.writeFile(path.join(output,choice.key+'.png'),preview);
  }
}
build().catch(e=>{console.error(e);process.exitCode=1});
