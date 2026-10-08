import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Page } from 'playwright';
import { renderPdf, PrintContentError } from '../pdfPlugin';
import { prepareCompactBook } from './print/book/renderCompact';
import { DEFAULT_PAPER, parsePaper } from './lib/paperSize';

vi.mock('./print/book/renderCompact',()=>({prepareCompactBook:vi.fn()}));
const page = {goto:vi.fn(),waitForFunction:vi.fn(),evaluate:vi.fn(),pdf:vi.fn()};
beforeEach(()=>{
    vi.clearAllMocks();
    page.evaluate.mockImplementation(async fn=>String(fn).includes('printWarnings')?['Source companion needs review']:undefined);
    page.pdf.mockResolvedValue(Buffer.from('%PDF /Type /Page /Type /Page /Type /Page'));
    vi.mocked(prepareCompactBook).mockResolvedValue({pages:3,warnings:[]});
});
describe('compact book export selection',()=>{
    it('defaults missing/invalid choices to the new size, retaining explicit A-series choices',()=>{
        expect(DEFAULT_PAPER).toBe('185x240');
        for (const input of [undefined,null,'unknown','185x240']) expect(parsePaper(input)).toBe('185x240');
        for (const input of ['A4','A5','A6']) expect(parsePaper(input)).toBe(input);
    });
    it('uses actual book reflow at full scale for a default export, allowing three pages',async()=>{
        const warnings=vi.fn();
        await renderPdf(page as unknown as Page,'http://localhost:5173','vegetable','kale','metric',undefined,warnings);
        expect(prepareCompactBook).toHaveBeenCalledWith(page,'http://localhost:5173','vegetable','kale','metric',process.cwd());
        expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({width:'185mm',height:'240mm',scale:1,preferCSSPageSize:true}));
        expect(page.pdf.mock.calls[0][0]).not.toHaveProperty('format');
        expect(warnings).toHaveBeenCalledWith(['Source companion needs review']);
    });
    it('preserves the explicit A4 export path',async()=>{
        await renderPdf(page as unknown as Page,'http://localhost:5173','trouble','carrot','imperial','A4');
        expect(prepareCompactBook).not.toHaveBeenCalled();
        expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({format:'A4',scale:1}));
    });
    it('refuses an unexpected physical page count',async()=>{
        page.pdf.mockResolvedValue(Buffer.from('%PDF /Type /Page'));
        await expect(renderPdf(page as unknown as Page,'http://localhost:5173','vegetable','kale')).rejects.toThrow('layout measured 3');
    });
    it('returns an actionable content error and never prints when a book block cannot fit',async()=>{
        vi.mocked(prepareCompactBook).mockRejectedValue(Error('Whole entry needs review'));
        await expect(renderPdf(page as unknown as Page,'http://localhost:5173','trouble','carrot')).rejects.toBeInstanceOf(PrintContentError);
        expect(page.pdf).not.toHaveBeenCalled();
    });
});
