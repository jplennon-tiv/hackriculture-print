import {useEffect,useRef,type CSSProperties} from 'react';
import {useParams,useSearchParams} from 'react-router-dom';
import troublesJson from '../../../hackriculture-data/generated/master/troubles.json';
import vegetablesJson from '../../../hackriculture-data/generated/master/vegetables.json';
import type {TroublesData,TroubleCondition} from '../types';
import {troublePalette,troubleCopy} from './troubleContent';
import {paginateTroubles} from './troublePagination';
import {paginateTroublePlan,troublePlanStatus} from './troublePlan';
import styles from './troubles.module.css';
const data=troublesJson as TroublesData;
const vegetables=vegetablesJson as Record<string,{name?:string|null;category?:string}>;
export function PrintTroublePage(){
 const {slug=''}=useParams();const group=data[slug];
 const [search]=useSearchParams();const reviewDrafts=search.get('aiReview')==='1';
 const source=useRef<HTMLDivElement>(null),output=useRef<HTMLDivElement>(null);
 const names=(keys:string[])=>keys.map(k=>vegetables[k]?.name??k.replace(/_/g,' ')).join(' / ');
 const conditions=Object.entries(group?.conditions??{}).sort(([,a],[,b])=>(b.rank??0)-(a.rank??0));
 useEffect(()=>{
  let cancelled=false;delete document.body.dataset.printReady;delete document.body.dataset.printError;delete document.body.dataset.printWarnings;
  if(!group){document.body.dataset.printError='Trouble guide not found: '+slug;return;}
  const run=async()=>{
   await document.fonts.ready;
   await Promise.all([...source.current!.querySelectorAll('img')].map(img=>img.decode().catch(()=>undefined)));
   if(cancelled)return;
   const status=troublePlanStatus(group,reviewDrafts);const template=source.current!.querySelector<HTMLElement>('[data-template]')!;
   let result;
   if(status.usable){
    try{result=paginateTroublePlan(source.current!,output.current!,template,group.ai_layout!);}
    catch(err){result=paginateTroubles(source.current!,output.current!,template);result.warnings.push('Saved layout needs review: '+String(err)+'; automatic pagination used.');}
   }else result=paginateTroubles(source.current!,output.current!,template);
   if(status.warning)result.warnings.push(status.warning);
   const warnings=[...result.warnings,...Object.values(group.conditions??{}).map(c=>troubleCopy(c,reviewDrafts).warning).filter((w):w is string=>!!w)];
   document.body.dataset.printWarnings=JSON.stringify(warnings);document.body.dataset.printReady='true';
  };
  run().catch(err=>{if(!cancelled)document.body.dataset.printError=String(err);});
  return()=>{cancelled=true;delete document.body.dataset.printReady;delete document.body.dataset.printError;delete document.body.dataset.printWarnings;};
 },[group,slug,reviewDrafts]);
 if(!group)return <p>Trouble guide not found.</p>;
 const card=(key:string,c:TroubleCondition)=>{
  const copy=troubleCopy(c,reviewDrafts);
  return <article key={key} data-source-card data-name={c.name} data-key={key} className={styles.card}>
   <div className={styles.cardHead}><h2>{c.name}{c.star?' ★':''}</h2><small>{names(c.applies_to??group.applies_to??[])}</small></div>
   <div className={styles.cardBody}>{c.image&&<figure><img src={c.image} alt={c.name}/></figure>}
    {(c.visual_heading||c.visual_symptom)&&<div className={styles.symptom}>{c.visual_heading||c.visual_symptom}</div>}
    <div data-copy>{(['recognise','act','prevent'] as const).map(field=>copy[field]?<section key={field} data-section={field}><h3>{field}</h3><p>{copy[field]}</p></section>:null)}</div>
   </div>
  </article>;
 };
 const palette=troublePalette(group,vegetables);
 return <div className={styles.root} style={{'--trouble-colour':palette.highlight,'--trouble-page-bg':palette.pageBackground} as CSSProperties}>
  <div ref={source} className={styles.measure} aria-hidden="true">
   {group.ai_layout&&<div data-planned-intro className={styles.plannedIntro}><div><p>{group.ai_introduction??group.introduction}</p></div><div className={styles.introImages}>{group.ai_layout.hero_images.map(image=><img key={image} src={image} style={group.ai_layout!.hero_images.length===1&&image.startsWith('/images/troubles/heroes/')?{width:'100%'}:undefined} alt="Crop illustration"/>)}</div></div>}
   <div data-template className={styles.page}><header className={styles.header}><div className={styles.eyebrow}>VEGETABLE CHEAT SHEETS / TROUBLES</div><h1>{group.source_heading}</h1></header><main className={styles.columns}><div data-column className={styles.column}/><div data-column className={styles.column}/></main><footer className={styles.footer}><span>VEGETABLE CHEAT SHEETS</span><span data-page-number/></footer></div>
   {group.introduction&&card('__intro',{name:'About these crops',description:group.introduction})}
   {conditions.map(([key,c])=>card(key,c))}<div data-probe className={styles.probe}/>
  </div><div ref={output}/>
 </div>;
}
