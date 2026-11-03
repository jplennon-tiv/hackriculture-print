// Complete original house font for missing lowercase glyphs in old PDF subsets.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
const d='docs/publication/key-risk-title-case',pdf=d+'/font-donor.pdf';
if(fs.existsSync(d+'/PDF-CHECKS.json'))throw Error('Completed correction is frozen');
const browser=await chromium.launch();
try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:5173/print-shell.html');
 await p.setContent(`<style>@font-face{font-family:Lilita;src:url('http://127.0.0.1:5173/fonts/richer-a-1.woff2')}p{font:12px Lilita;line-height:2;word-break:break-all}</style><p>${Array.from({length:224},(_,i)=>i+32).map(n=>'&#'+n+';').join('')}&#8211;&#8212;&#8216;&#8217;&#8220;&#8221;&#8226;</p>`);
 await p.evaluate(()=>document.fonts.ready);await p.pdf({path:pdf,format:'A4',printBackground:true});
 const plan=JSON.parse(fs.readFileSync(d+'/PDF-PLAN.json'));plan.inputs[pdf]=crypto.createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');plan.inputs['public/fonts/richer-a-1.woff2']=crypto.createHash('sha256').update(fs.readFileSync('public/fonts/richer-a-1.woff2')).digest('hex');fs.writeFileSync(d+'/PDF-PLAN.json',JSON.stringify(plan,null,2)+'\n');
}finally{await browser.close()}
