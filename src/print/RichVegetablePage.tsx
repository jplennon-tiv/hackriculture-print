import {useEffect,useMemo,useRef,type CSSProperties} from 'react';
import {useParams,useSearchParams} from 'react-router-dom';
import dataJson from '../../../hackriculture-data/generated/master/vegetables.json';
import type {GardeningData} from '../types';
import {slugify} from '../lib/slug';
import {firstSentence} from '../lib/sentences';
import {rt} from '../lib/ranked';
import {getRiskIcon} from '../lib/keyRiskIcons';
import {quickFactIconPath,pickFinalTipIcon} from '../lib/quickFactIcons';
import {readPlantingSource} from '../lib/planting';
import {vegetableModel} from './vegetableModel';
import {themeStyle} from './familyTheme';
import heroes from './heroArtwork.json';
import book from './bookPagination.json';
import troubles from '../../../hackriculture-data/generated/master/troubles.json';
import {applyBookNumbers,bookEntry,requireCurrentPagination} from './bookPagination';
import './richVegetable.css';
import {fillRichPages} from './richPageFill';
const data=dataJson as unknown as GardeningData;
export const RICH_VEGETABLE_REVISION='richer-a-v2-editorial-fill';
const art=heroes as Record<string,{src:string;status:string}>;
function Scale({value,kind=''}:{value:number;kind?:string}){return <span className={'scale '+kind} aria-label={`${value} out of 5`}>{Array.from({length:5},(_,i)=><i key={i} className={i<value?'on':''}/>)}</span>}
export function RichVegetablePage(){
 const {slug=''}=useParams();const [params]=useSearchParams();const units=params.get('units')==='metric'?'metric':'imperial';
 const key=Object.keys(data).find(k=>slugify(data[k].name??k)===slug)??slug;
 if(!data[key])return <p>Vegetable not found: {slug}</p>;
 return <Sheet key={key+units+JSON.stringify(data[key])} cropKey={key} units={units} review={params.get('aiReview')==='1'}/>;
}
function Sheet({cropKey,units,review}:{cropKey:string;units:'metric'|'imperial';review:boolean}){
 const m=useMemo(()=>vegetableModel(data[cropKey],cropKey,units,review),[cropKey,units,review]);const ref=useRef<HTMLDivElement>(null);
 const hero=art[cropKey]?.src??m.veg.image;
 useEffect(()=>{let cancelled=false;delete document.body.dataset.printReady;delete document.body.dataset.printError;
 const run=async()=>{await document.fonts.ready;await Promise.all([...ref.current!.querySelectorAll('img')].map(i=>i.decode()));if(cancelled)return;
 await requireCurrentPagination(book.sourceSignature,dataJson,troubles);if(cancelled)return;
 applyBookNumbers(ref.current!,bookEntry(book.editions[units],'vegetable',cropKey));
 const errors:string[]=[];
 const fits=(p:HTMLElement)=>p.querySelector('.content-end')!.getBoundingClientRect().bottom<=p.querySelector('footer')!.getBoundingClientRect().top-6;
 for(const p of ref.current!.querySelectorAll<HTMLElement>('.sheet')){
 if(!fits(p))p.classList.add('compact');
 if(!fits(p)&&p.classList.contains('front'))p.classList.add('dense');
 if(!fits(p)&&p.classList.contains('back')){
 const cols=[...p.querySelectorAll<HTMLElement>('.growing-columns>div')],plant=p.querySelector<HTMLElement>('.planting')!,care=p.querySelector<HTMLElement>('.care')!,harvest=p.querySelector<HTMLElement>('.harvest')!;
 const before=Math.max(...cols.map(c=>c.getBoundingClientRect().height));
 cols[0].append(care,harvest);cols[1].append(plant);
 const after=Math.max(...cols.map(c=>c.getBoundingClientRect().height));
 if(after>=before){cols[0].append(plant);cols[1].append(care,harvest);}else p.dataset.balanced='planting-aside';
 }
 }

 if(m.richFill)fillRichPages(ref.current!,m.richFill);

 // Fit display titles to their reserved header space; never resize body copy.
 for(const p of ref.current!.querySelectorAll<HTMLElement>('.front')){
 const title=p.querySelector<HTMLElement>('h1')!,badge=p.querySelector<HTMLElement>('.header-difficulty')!;
 let size=parseFloat(getComputedStyle(title).fontSize);
 while(size>40&&title.getBoundingClientRect().bottom>badge.getBoundingClientRect().top-5){size-=1;title.style.fontSize=size+'px';}
 // Float seasons beside short titles, or below the actual fitted title bounds.
 // Measure after fonts/title fitting so long or wrapped names remain clear.
 const seasons=p.querySelector<HTMLElement>('.header-seasons');
 if(seasons){
 seasons.style.transform='';
 const t=title.getBoundingClientRect(),s=seasons.getBoundingClientRect();
 const beside=s.left>=t.right+12;
 const top=beside?t.top+6:t.bottom+10;
 seasons.style.transform=`translateY(${top-s.top}px)`;
 seasons.dataset.placement=beside?'beside-title':'below-title';
 }
 }
 for(const [i,p] of [...ref.current!.querySelectorAll<HTMLElement>('.sheet')].entries()){
 const foot=p.querySelector('footer')!.getBoundingClientRect(),bounds=p.getBoundingClientRect();
 const end=p.querySelector('.content-end')!.getBoundingClientRect().bottom;
 if(end>foot.top-6)errors.push(`Page ${i+1} exceeds available content height by ${Math.ceil((end-foot.top+6)/3.78)} mm`);
 const outside=[...p.querySelectorAll('p,li,td,th,h2,h3')].filter(e=>{const r=e.getBoundingClientRect();return r.left<bounds.left-1||r.right>bounds.right+1});if(outside.length)errors.push(`Page ${i+1}: horizontal text overflow`);
 }
 document.body.dataset.printRevision=RICH_VEGETABLE_REVISION;document.body.dataset.printWarnings=JSON.stringify(m.warnings);
 if(errors.length)document.body.dataset.printError=errors.join('; ');
 document.body.dataset.printReady='true';};run().catch(e=>{if(!cancelled)document.body.dataset.printError=String(e)});return()=>{cancelled=true;delete document.body.dataset.printReady;delete document.body.dataset.printError};
 },[m]);
 const image=(src:string|undefined,cls='')=>src?<img className={cls} src={src} alt=""/>:null;
 const footer=(n:number)=><footer><span>VEGETABLE GROWING <b>CHEAT SHEETS</b></span><span>{m.name.toUpperCase()} <b data-page-number>{n}</b></span></footer>;
 const prose=(title:string,items:unknown[],cls:string)=><section className={cls}><h2>{title}</h2><ol>{items.map((x,i)=><li key={i}>{m.itemText(x)}</li>)}</ol></section>;
 const noteItems=Array.isArray(m.veg.key_notes)?m.veg.key_notes as {title:string;body:string}[]:m.keyNotes.map(x=>({title:firstSentence(m.itemText(x)),body:m.itemText(x)}));
 const sowingNotes=[...m.sowingNotes.map(m.itemText),...(m.curated.values.sowing_notes!==undefined?[]:m.planting?.content.optional_note_paths??[]).map(p=>m.itemText(readPlantingSource(m.veg,p)))].filter(Boolean);
 return <div ref={ref} className="rich-print" style={themeStyle(m.category) as CSSProperties} data-editorial-report={JSON.stringify(m.editorialReport)}>
 <section className="sheet front"><header>
 <div className="header-art"><div className="peach"/>{image(hero,'hero-art')}</div>
 <div className="eyebrow">{m.category}</div>
 <h1 data-length={m.name.length>22?'long':m.name.length>12?'medium':'short'}>{m.name}<span>.</span></h1>
 <div className="header-details">
 <aside className="header-difficulty"><small>DIFFICULTY</small><strong>{m.diff.label}</strong><span className="difficulty-rating"><Scale value={m.veg.difficulty??1}/><b>{m.veg.difficulty??1}/5</b></span></aside>
 {m.seasons.length>0&&<div className="header-seasons"><div className="season-symbols">{m.seasons.map(s=><img key={s} src={`/images/header_chars/season_${s.toLowerCase()}.png`} alt=""/>)}</div><div><small>HARVEST SEASONS</small><b>{m.seasons.join(' / ')}</b></div></div>}
 </div></header>
 <p className="intro">{m.intro}</p>
 <section className="quick"><h2>Quick facts</h2><div className={"fact-grid "+(m.quickFacts.some(f=>f.value.length>110)?"detailed":"")}>{m.quickFacts.map((f,i)=><article key={i}>{image(f.icon)}<div><h3>{f.label}</h3><p>{f.value}</p></div></article>)}</div></section>
 <div className="year-needs">{m.hasCalendar&&<section className="calendar"><h2>Growing calendar</h2><div className="month-row"><b/>{['J','F','M','A','M','J','J','A','S','O','N','D'].map((v,i)=><span key={i}>{v}</span>)}</div>{m.calRows.map(row=><div key={row.label} className={'month-row '+(row.label==='SOW'?'sowing_time':'harvest_time')}><b>{row.label}</b>{Array.from({length:12},(_,i)=><span key={i} className={row.main.has(i)?'usual':row.less.has(i)?'extra':''}/>)}</div>)}<p>Bright: usual months · Muted: less usual</p></section>}
 <section className="needs"><h2>Core needs</h2><small>1 = low · 5 = high</small>{Object.entries(m.coreNeeds??{}).map(([k,v])=><div key={k}>{image(quickFactIconPath(k==='nutrition'?'feeding':k))}<b>{k[0].toUpperCase()+k.slice(1)}</b><Scale value={v} kind={k}/><strong>{v}/5</strong></div>)}</section></div>
 {m.topVarieties.length>0&&<section className={"varieties "+(m.topVarieties.length>6?"many":"")}><h2>Recommended varieties</h2><div>{m.topVarieties.map((v,i)=><article key={i}><small>{v.type}</small><h3>{v.name}</h3><p>{v.short_text||firstSentence(v.text)}</p></article>)}</div></section>}
 {m.keyRisks.length>0&&<section className="key-risks"><h2>Key risks</h2><div style={{gridTemplateColumns:`repeat(${m.keyRisks.length},1fr)`}}>{m.keyRisks.map((r,i)=><article key={i}>{image(getRiskIcon(r.name,cropKey))}<h3>{r.name}</h3><p>{firstSentence(r.text)}</p></article>)}</div></section>}<div className="content-end"/>{footer(1)}</section>
 <section className="sheet back"><header><div className="eyebrow">{m.name} / GROWING GUIDE</div><h1>Growing <span>&amp; harvesting</span></h1>{image(hero,'hero-art')}</header>
 {noteItems.length>0&&<div className="remember" style={m.richFill?{gridTemplateColumns:`repeat(${Math.min(3,noteItems.length)},1fr)`}:undefined}>{noteItems.slice(0,3).map((n,i)=><div key={i}><h3>{n.title}</h3><p>{n.body}</p></div>)}</div>}
 <div className="growing-columns"><div>{prose('Soil & preparation',m.soilItems,'soil')}
 <section className="planting"><h2>{cropKey==='mushroom'?'Establishing the crop':'Sowing & planting'}</h2>{m.planting&&!m.planting.issue?<><div className="stages" style={{gridTemplateColumns:`repeat(${m.planting.steps.length},1fr)`}}>{m.planting.steps.map((s,i)=><article key={s.id}><h3><span>{i+1}</span> {s.title}</h3>{image(s.image)}<p>{s.text}</p></article>)}</div><div className="measurements">{m.planting.measurements.map(v=><span key={v.path}><b>{v.label}</b> {v.value}</span>)}</div>{m.planting.content.supplementary.map(v=><p key={v.id}>{v.text}</p>)}</>:<><p>{m.sowingMethod}</p><div className="measurements">{[['Depth',m.sowingDepth],['Rows',m.sowingRowSpacing],['Final plants',m.sowingPlantSpacing]].filter(([,v])=>v).map(([k,v])=><span key={k}><b>{k}</b> {v}</span>)}</div></>}{sowingNotes.map((s,i)=><p key={i}>{s}</p>)}</section></div>
 <div>{prose('Looking after the crop',m.careItems,'care')}{prose('Harvesting & storage',m.harvestItems,'harvest')}</div></div>
 {m.troubleEntries.length>0&&<section className="pests"><h2>Pests & diseases</h2><table><thead><tr><th>Problem</th><th>What to look for</th><th>What to do</th></tr></thead><tbody>{m.troubleEntries.map(([k,v],i)=>{const t=v as {signs?:string;control?:string};return <tr key={i}><th>{k}</th><td>{t.signs||firstSentence(rt(v,units))}</td><td>{t.control||''}</td></tr>})}</tbody></table></section>}
 {m.tipItems.length>0&&<section className="tips" style={m.richFill&&m.tipItems.length<3?{gridTemplateColumns:`85px repeat(${m.tipItems.length},1fr)`}:undefined}><h2>Final tips</h2>{m.tipItems.map((t,i)=><div key={i}>{image(pickFinalTipIcon(t,m.itemText(t),i,m.curated.values.final_tips!==undefined))}<p>{m.itemText(t)}</p></div>)}</section>}<div className="content-end"/>{footer(2)}</section></div>;
}

