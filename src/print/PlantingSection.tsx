import type {ResolvedPlanting} from './plantingIllustrations';
import './plantingRoutes.css';

type Props = {
    title:string;
    planting:ResolvedPlanting|null;
    method?:string;
    fallbackMeasurements:Array<[string,string|null|undefined]>;
    notes:string[];
};

/** Richer A planting content. Optional routes group the same source-linked steps. */
export function PlantingSection({title,planting,method,fallbackMeasurements,notes}:Props){
    const valid=planting&&!planting.issue?planting:null;
    const grouped=!!valid?.routes.length;
    const stages=(steps:ResolvedPlanting['steps'])=><div className="stages" style={{gridTemplateColumns:`repeat(${steps.length},1fr)`}}>
        {steps.map((step,i)=><article key={step.id}>
            <h3><span>{i+1}</span> {step.title}</h3>
            <img src={step.image} alt={step.alt??''}/>
            <p>{step.text}</p>
        </article>)}
    </div>;
    const note=(item:ResolvedPlanting['supplementary'][number],className?:string)=><p className={className} key={item.id}>
        {item.label&&<><b>{item.label}:</b>{' '}</>}{item.text}
    </p>;
    return <section className={'planting'+(grouped?' planting-routes':'')}>
        <h2>{title}</h2>
        {valid?<>
            {grouped?valid.routes.map(route=><section className="plant-route" key={route.id}>
                <h3 className="route-heading">{route.title}</h3>
                {stages(route.steps)}
                {route.notes.map(item=>note(item,'route-note'))}
            </section>):stages(valid.steps)}
            {(!grouped||valid.measurements.length>0)&&<div className="measurements">{valid.measurements.map(v=><span key={v.path}><b>{v.label}</b> {v.value}</span>)}</div>}
            {valid.supplementary.map(item=>note(item,grouped?'route-shared-note':undefined))}
        </>:<>
            <p>{method}</p>
            <div className="measurements">{fallbackMeasurements.filter(([,value])=>value).map(([label,value])=><span key={label}><b>{label}</b> {value}</span>)}</div>
        </>}
        {notes.map((text,i)=><p key={i}>{text}</p>)}
    </section>;
}
