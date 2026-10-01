import {useEffect,useRef,type CSSProperties} from 'react';
import {useParams,useSearchParams} from 'react-router-dom';
import troublesJson from '../../../hackriculture-data/generated/master/troubles.json';
import vegetablesJson from '../../../hackriculture-data/generated/master/vegetables.json';
import type {TroublesData} from '../types';
import {convertMeasurement} from '../lib/measure';
import {troubleCopy} from './troubleContent';
import {troublePlanStatus} from './troublePlan';
import {themeStyle,troubleFamilies} from './familyTheme';
import {EDITORIAL_TROUBLE_REVISION,editorialOrder,paginateEditorial} from './editorialTroubleLayout';
import './editorialTrouble.css';
import book from './bookPagination.json';
import {applyBookNumbers,bookEntry,requireCurrentPagination} from './bookPagination';
const data=troublesJson as TroublesData;
const vegetables=vegetablesJson as Record<string,{name?:string|null}>;
export function EditorialTroublePage(){
 const {slug=''}=useParams();const group=data[slug];const [search]=useSearchParams();const review=search.get('aiReview')==='1';const units=search.get('units')==='metric'?'metric':'imperial';
 const measuring=search.get('pagination')==='measure';
 const source=useRef<HTMLDivElement>(null),output=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false;delete document.body.dataset.printReady;delete document.body.dataset.printError;
 const run=async()=>{if(!group)throw Error('Unknown Troubles guide');await document.fonts.ready;await Promise.all([...source.current!.querySelectorAll('img')].map(i=>i.decode()));if(cancelled)return;
 paginateEditorial(source.current!,output.current!);
 if(!measuring){await requireCurrentPagination(book.sourceSignature,vegetablesJson,troublesJson);if(cancelled)return;applyBookNumbers(output.current!,bookEntry(book.editions[units],'trouble',slug));}
 document.body.dataset.printRevision=EDITORIAL_TROUBLE_REVISION;
 document.body.dataset.printWarnings=JSON.stringify([troublePlanStatus(group,review).warning,...Object.values(group.conditions??{}).map(c=>troubleCopy(c,review).warning)].filter(Boolean));document.body.dataset.printReady='true';};run().catch(e=>{if(!cancelled)document.body.dataset.printError=String(e)});
 return()=>{cancelled=true;delete document.body.dataset.printReady;delete document.body.dataset.printError};},[slug,group,review,units,measuring]);
 if(!group)return <p>Guide not found.</p>;
 const title=group.source_heading.replace(/\s*troubles\s*$/i,'');
 return <div className="editorial-trouble" style={themeStyle(troubleFamilies[slug]) as CSSProperties}><div className="measure" ref={source} aria-hidden="true">
 <div data-template className="sheet opening"><header><div className="blob"/><div className="eyebrow">VEGETABLE GROWING / TROUBLES GUIDE</div><h1>{title}</h1><div className="ribbon">Troubles</div><p className="intro">{troublePlanStatus(group,review).usable?(group.ai_introduction??group.introduction):group.introduction}</p><div className="navigation">Recognise <span>→</span> Act <span>→</span> Prevent</div></header><main className="columns"><div data-column className="column"/><div data-column className="column"/></main><footer><span>{title.toUpperCase()} / TROUBLES</span><span data-page-number/></footer></div>
 {editorialOrder(group,review).map(key=>{const c=group.conditions![key],copy=troubleCopy(c,review);return <article className="entry" data-key={key} data-source-entry key={key}>{c.image&&<img className="diagnostic" src={c.image} alt={c.name}/>}<p className="crops">{(c.applies_to??group.applies_to??[]).map(k=>vegetables[k]?.name??k).join(' / ')}</p><h2>{c.name}{c.star?' ★':''}</h2>{(c.visual_heading||c.visual_symptom)&&<p className="symptom">{convertMeasurement(c.visual_heading||c.visual_symptom||'',units)??(c.visual_heading||c.visual_symptom)}</p>}<div className="advice">{(['recognise','act','prevent'] as const).map(f=>copy[f]&&<section key={f} className={f}><h3>{f}</h3><p>{copy[f]}</p></section>)}</div></article>})}
 </div><div ref={output}/></div>;
}
