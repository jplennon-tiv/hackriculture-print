import {describe,it,expect,vi,beforeEach} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {Page} from 'playwright';
import {pdfPlugin,renderPdf,PrintContentError} from '../pdfPlugin';

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
        mkdirSync(root);mkdirSync(shared);
        mkdirSync(join(root,'public/front-matter'),{recursive:true});
        if(coverPresent)writeFileSync(join(root,'public/front-matter/cover-A4.pdf'),'%PDF-approved-cover');
        if(howToPresent)writeFileSync(join(root,'public/front-matter/how-to-use-A4.pdf'),'%PDF-how-to');
        writeFileSync(join(shared,'vegetables.json'),JSON.stringify({carrot:{name:'Carrot'},bad:{name:'Bad'},leek:{name:'Leek'}}));
        writeFileSync(join(shared,'troubles.json'),'{}');
        let handler: (...args:any[])=>Promise<void>;
        const plugin=pdfPlugin();
        (plugin.configureServer as Function)({config:{root},httpServer:{address:()=>({port:5173})},middlewares:{use:(h:typeof handler)=>{handler=h;}}});
        const chunks:string[]=[];
        const res={setHeader:vi.fn(),writeHead:vi.fn(),write:(s:string)=>chunks.push(s),end:vi.fn()};
        const log=vi.spyOn(console,'error').mockImplementation(()=>{});
        try{
            await handler!({url:'/api/pdf/batch?units=metric&paper=A4',method:'POST'},res,vi.fn());
            const events=chunks.map(s=>JSON.parse(s));
            expect(events.at(-1)).toMatchObject({event:'done',total:5,ok:2+Number(coverPresent)+Number(howToPresent),errors:3-Number(coverPresent)-Number(howToPresent)});
            expect(events[0]).toMatchObject({frontMatter:2,total:5});
            expect(events[2]).toMatchObject({type:'front-matter',slug:'how-to-use',status:howToPresent?'ok':'error'});
            if(howToPresent)expect(readFileSync(join(root,'output/01_how-to-use_A4.pdf'),'utf8')).toBe('%PDF-how-to');
            else expect(existsSync(join(root,'output/01_how-to-use_A4.pdf'))).toBe(false);
            expect(events[1]).toMatchObject({type:'front-matter',slug:'cover',status:coverPresent?'ok':'error'});
            if(coverPresent)expect(readFileSync(join(root,'output/00_cover_A4.pdf'),'utf8')).toBe('%PDF-approved-cover');
            else expect(existsSync(join(root,'output/00_cover_A4.pdf'))).toBe(false);
            expect(events.find(e=>e.slug==='bad')).toMatchObject({status:'error',detail:expect.stringContaining('Review captions')});
            expect(readFileSync(join(root,'output/vegetable_carrot.pdf'),'utf8')).toBe('%PDF-test');
            expect(events.find(e=>e.slug==='carrot').warnings).toEqual(['Page 2: content exceeds the layout budget.']);
            expect(readFileSync(join(root,'output/batch-report.txt'),'utf8')).toContain('Page 2: content exceeds');
            expect(existsSync(join(root,'output/vegetable_bad.pdf'))).toBe(false);
            expect(mock.page.goto.mock.calls.every(([url])=>url.endsWith('?units=metric'))).toBe(true);
            expect(mock.browser.close).toHaveBeenCalled();
        }finally{log.mockRestore();rmSync(temporary,{recursive:true,force:true});}
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
