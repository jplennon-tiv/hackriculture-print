import {describe,it,expect,vi,beforeEach} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {Page} from 'playwright';
import {pdfPlugin,renderPdf,PrintContentError} from '../pdfPlugin';
import book from './print/bookPagination.json';
import {prepareCompactBook} from './print/book/renderCompact';
vi.mock('./print/book/renderCompact',()=>({prepareCompactBook:vi.fn(async()=>({pages:2,warnings:[]}))}));
vi.mock('../../hackriculture-data/lib/records.mjs',()=>({refreshGenerated:vi.fn()}));
vi.mock('./print/bookPagination.json',async()=>{
 const {createHash}=await import('node:crypto');
 const edition={vegetables:[{key:'carrot',label:'Carrot',start:1,pages:2},{key:'bad',label:'Bad',start:3,pages:2},{key:'leek',label:'Leek',start:5,pages:2}],troubles:[],totalPages:6};
 const sourceSignature=createHash('sha256').update(JSON.stringify({vegetables:[['carrot','Carrot',null],['bad','Bad',null],['leek','Leek',null]],troubles:{}})).digest('hex');
 return {default:{version:1,sourceSignature,editions:{metric:edition,imperial:edition}}};
});

const mock=vi.hoisted(()=>({url:'',page:{goto:vi.fn(),waitForFunction:vi.fn(),evaluate:vi.fn(),pdf:vi.fn(),setViewportSize:vi.fn()},browser:{newPage:vi.fn(),close:vi.fn()}}));
vi.mock('playwright',()=>({chromium:{launch:vi.fn(async()=>mock.browser)}}));
beforeEach(()=>{
    vi.clearAllMocks();mock.url='';
    mock.page.goto.mockImplementation(async url=>{mock.url=url;});
    mock.page.evaluate.mockImplementation(async fn=>String(fn).includes('printWarnings')?['Page 2: content exceeds the layout budget.']:mock.url.includes('/bad')?'Planting source advice has changed. Review captions.':'');
    mock.page.pdf.mockResolvedValue(Buffer.from('%PDF-test'));
    mock.browser.newPage.mockResolvedValue(mock.page);
    mock.browser.close.mockResolvedValue(undefined);
});

describe('shared single and batch print guard',()=>{
    it('waits for readiness and produces a normal AI-free export',async()=>{
        await renderPdf(mock.page as unknown as Page,'http://127.0.0.1:5173','vegetable','carrot','metric','A5');
        expect(mock.url).toBe('http://127.0.0.1:5173/print/vegetable/carrot?units=metric');
        expect(mock.page.waitForFunction).toHaveBeenCalled();
        expect(mock.page.pdf).toHaveBeenCalledWith(expect.objectContaining({format:'A5',scale:1/Math.SQRT2}));
    });
    it('refuses to generate a PDF with a stale summary or unsafe fit',async()=>{
        await expect(renderPdf(mock.page as unknown as Page,'http://localhost:5173','vegetable','bad')).rejects.toBeInstanceOf(PrintContentError);
        expect(mock.page.pdf).not.toHaveBeenCalled();
    });
    it.each([[true,true],[false,true],[true,false]])('batch handles cover %s and how-to %s and continues after item failures',async(coverPresent,howToPresent)=>{
        const temporary=mkdtempSync(join(tmpdir(),'planting-batch-test-'));
        const root=join(temporary,'hackriculture-print'),shared=join(temporary,'hackriculture-data');
        mkdirSync(root);mkdirSync(shared);mkdirSync(join(shared,'generated/master'),{recursive:true});
        mkdirSync(join(root,'public/front-matter'),{recursive:true});
        writeFileSync(join(root,'public/front-matter/contents-A4.pdf'),'%PDF-contents');
        writeFileSync(join(root,'public/front-matter/pagination.json'),JSON.stringify({sourceSignature:book.sourceSignature,edition:book.editions.metric}));
        if(coverPresent)writeFileSync(join(root,'public/front-matter/cover-A4.pdf'),'%PDF-approved-cover');
        if(howToPresent)writeFileSync(join(root,'public/front-matter/how-to-use-A4.pdf'),'%PDF-how-to');
        writeFileSync(join(shared,'generated/master/vegetables.json'),JSON.stringify({carrot:{name:'Carrot'},bad:{name:'Bad'},leek:{name:'Leek'}}));
        writeFileSync(join(shared,'generated/master/troubles.json'),'{}');
        let handler: (...args:any[])=>Promise<void>;
        const plugin=pdfPlugin();
        (plugin.configureServer as Function)({config:{root},httpServer:{address:()=>({port:5173})},middlewares:{use:(h:typeof handler)=>{handler=h;}}});
        const chunks:string[]=[];
        const res={setHeader:vi.fn(),writeHead:vi.fn(),write:(s:string)=>chunks.push(s),end:vi.fn()};
        const log=vi.spyOn(console,'error').mockImplementation(()=>{});
        try{
            await handler!({url:'/api/pdf/batch?units=metric&paper=A4',method:'POST'},res,vi.fn());
            const events=chunks.map(s=>JSON.parse(s));
            expect(events.at(-1)).toMatchObject({event:'done',total:6,ok:3+Number(coverPresent)+Number(howToPresent),errors:3-Number(coverPresent)-Number(howToPresent)});
            expect(events[0]).toMatchObject({frontMatter:3,total:6});
            expect(events[3]).toMatchObject({type:'front-matter',slug:'how-to-use',status:howToPresent?'ok':'error'});
            if(howToPresent)expect(readFileSync(join(root,'output/02_how-to-use_A4.pdf'),'utf8')).toBe('%PDF-how-to');
            else expect(existsSync(join(root,'output/02_how-to-use_A4.pdf'))).toBe(false);
            expect(events[1]).toMatchObject({type:'front-matter',slug:'cover',status:coverPresent?'ok':'error'});
            if(coverPresent)expect(readFileSync(join(root,'output/00_cover_A4.pdf'),'utf8')).toBe('%PDF-approved-cover');
            else expect(existsSync(join(root,'output/00_cover_A4.pdf'))).toBe(false);
            expect(events.find(e=>e.slug==='bad')).toMatchObject({status:'error',detail:expect.stringContaining('Review captions')});
            expect(readFileSync(join(root,'output/vegetable_carrot.pdf'),'utf8')).toBe('%PDF-test');
            expect(events.find(e=>e.slug==='carrot').warnings).toEqual(['Page 2: content exceeds the layout budget.']);
            expect(readFileSync(join(root,'output/batch-report.txt'),'utf8')).toContain('Page 2: content exceeds');
            expect(existsSync(join(root,'output/vegetable_bad.pdf'))).toBe(false);
            const order=JSON.parse(readFileSync(join(root,'output/collection-order.json'),'utf8'));
            expect(order.complete).toBe(false);
            expect(order.documents.filter((d:any)=>d.start!==null).map((d:any)=>d.start)).toEqual([1,5]);
            expect(readFileSync(join(root,'output/01_contents_A4.pdf'),'utf8')).toBe('%PDF-contents');
            expect(mock.page.goto.mock.calls.every(([url])=>url.endsWith('?units=metric'))).toBe(true);
            expect(mock.browser.close).toHaveBeenCalled();
        }finally{log.mockRestore();rmSync(temporary,{recursive:true,force:true});}
    });
    it('compact batch exports guide proofs without requiring or copying A4 opening pages',async()=>{
        const temporary=mkdtempSync(join(tmpdir(),'compact-batch-test-'));
        const root=join(temporary,'hackriculture-print'),shared=join(temporary,'hackriculture-data');
        mkdirSync(root);mkdirSync(join(shared,'generated/master'),{recursive:true});
        writeFileSync(join(shared,'generated/master/vegetables.json'),JSON.stringify({carrot:{name:'Carrot'},bad:{name:'Bad'},leek:{name:'Leek'}}));
        writeFileSync(join(shared,'generated/master/troubles.json'),'{}');
        mock.page.pdf.mockResolvedValue(Buffer.from('%PDF /Type /Page /Type /Page'));
        let handler: (...args:any[])=>Promise<void>;
        (pdfPlugin().configureServer as Function)({config:{root},httpServer:{address:()=>({port:5173})},middlewares:{use:(h:typeof handler)=>{handler=h;}}});
        const chunks:string[]=[];
        const res={setHeader:vi.fn(),writeHead:vi.fn(),write:(s:string)=>chunks.push(s),end:vi.fn()};
        const log=vi.spyOn(console,'error').mockImplementation(()=>{});
        try {
            await handler!({url:'/api/pdf/batch?units=metric',method:'POST'},res,vi.fn());
            const events=chunks.map(s=>JSON.parse(s));
            expect(events[0]).toMatchObject({total:3,frontMatter:0});
            expect(events[0].warnings[0]).toContain('opening pages');
            expect(events.at(-1)).toMatchObject({event:'done',ok:2,errors:1});
            const output=join(root,'output/book-185x240/metric');
            const order=JSON.parse(readFileSync(join(output,'collection-order.json'),'utf8'));
            expect(order).toMatchObject({paper:'185x240',complete:false,scope:'guide-proofs',numberedPages:null});
            expect(order.documents.every((d:any)=>d.start===null&&d.pages===2)).toBe(true);
            expect(existsSync(join(root,'output/collection-order.json'))).toBe(false);
            expect(prepareCompactBook).toHaveBeenCalled();
        } finally {log.mockRestore();rmSync(temporary,{recursive:true,force:true});}
    });
    it('single export returns an actionable 422 error for a stale summary',async()=>{
        let handler: (...args:any[])=>Promise<void>;
        (pdfPlugin().configureServer as Function)({config:{root:'/unused'},httpServer:{address:()=>({port:5173})},middlewares:{use:(h:typeof handler)=>{handler=h;}}});
        const res={setHeader:vi.fn(),writeHead:vi.fn(),end:vi.fn()};
        const log=vi.spyOn(console,'error').mockImplementation(()=>{});
        try{
            await handler!({url:'/api/pdf/vegetable/bad',method:'GET'},res,vi.fn());
            expect(res.writeHead).toHaveBeenCalledWith(422,expect.any(Object));
            expect(JSON.parse(res.end.mock.calls[0][0]).error).toContain('Review captions');
        }finally{log.mockRestore();}
    });
});
