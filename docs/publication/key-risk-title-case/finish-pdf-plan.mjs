import fs from 'node:fs';
import {build} from 'esbuild';
const d='docs/publication/key-risk-title-case';
const bundle=await build({entryPoints:['src/lib/troubleLabel.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {troubleLabel}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
const plan=JSON.parse(fs.readFileSync(d+'/PDF-PLAN.json'));
for(const p of plan.pages)for(const l of p.labels){
 l.new=troubleLabel(l.old);
 let offset=0;
 for(const line of l.lines){
  if(line.old!==line.old.trim())throw Error('Unexpected label space');
  line.new=l.new.slice(offset,offset+line.old.length);offset+=line.old.length+1;
 }
 if(l.lines.map(l=>l.new).join(' ')!==l.new)throw Error('Line mapping');
}
fs.writeFileSync(d+'/PDF-PLAN.json',JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({pages:plan.pages.length,labels:plan.pages.reduce((n,p)=>n+p.labels.length,0),changes:plan.pages.reduce((n,p)=>n+p.labels.filter(l=>l.old!==l.new).length,0)}));
