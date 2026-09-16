import { useEffect, useRef, type CSSProperties } from 'react';
import type { ResolvedPlanting } from './plantingIllustrations';
import type { PlantingFitState } from './plantingFit';
import styles from './print.module.css';
import art from './planting.module.css';

export function PlantingCard({planting,fit,notes,onAssets}: {
    planting:ResolvedPlanting;fit:PlantingFitState;notes:string[];
    onAssets:(failed:boolean)=>void;
}) {
    const ref=useRef<HTMLDivElement>(null);
    useEffect(()=>{
        let cancelled=false;
        const images=[...ref.current!.querySelectorAll('img')];
        Promise.all(images.map(image=>image.decode().then(()=>true,()=>false))).then(loaded=>{
            if(!cancelled)onAssets(loaded.some(ok=>!ok));
        });
        return ()=>{cancelled=true;};
    },[onAssets]);
    return <div ref={ref} className={`${styles.cheatCard} ${art.card} ${planting.layout.paired?art.paired:''}`}
        data-planting-card="illustrated" data-planting-images={fit.showImages?'shown':'text-fallback'}
        style={{'--planting-art-height':`${fit.imageMm}mm`} as CSSProperties}>
        <div className={styles.cheatCardHd}>SOWING &amp; PLANTING</div>
        <div className={art.stages}>
            {planting.steps.map((step,i)=><section className={art.stage} key={step.id}>
                <h3 className={art.title}><span className={art.number}>{i+1}</span>{step.title}</h3>
                {fit.showImages&&<img className={art.image} src={step.image} alt="" width={1774} height={887}/>}
                <p className={art.caption}>{step.text}</p>
            </section>)}
        </div>
        <div className={art.lower}>
            <dl className={art.measures}>{planting.measurements.map(m=><div key={m.path}>
                <dt>{m.label}: </dt><dd>{m.value}</dd>
            </div>)}</dl>
            {planting.content.supplementary.map(t=><p className={art.caption} key={t.id}>{t.text}</p>)}
            {notes.length>0&&<ul className={art.notes}>{notes.map((text,i)=><li key={i}>{text}</li>)}</ul>}
        </div>
    </div>;
}
