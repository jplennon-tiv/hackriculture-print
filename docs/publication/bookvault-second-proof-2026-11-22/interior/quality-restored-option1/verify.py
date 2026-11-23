"""Verify the selected Option 1 printer derivative against its exact native source."""
from pathlib import Path
from collections import Counter
import hashlib,importlib.util,json,multiprocessing as mp,subprocess
import numpy as np
import pypdfium2 as pdfium
from PIL import Image,ImageDraw,ImageFilter
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject

DOC=Path(__file__).resolve().parent
ROOT=DOC.parents[4]
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf'
FINAL=ROOT/'output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Interior-Original-Margins.pdf'
SELECTED=[1,2,3,7,24,25,61,67,98,146,167,170]
KEEP600={7,146,167}|set(range(9,96,2))
OUT=DOC/'checks'

def init():
    global before,after
    before=pdfium.PdfDocument(SOURCE);after=pdfium.PdfDocument(FINAL)

def compare(i):
    a,b=before[i],after[i]
    ai=a.render(scale=120/72).to_pil().convert('RGB')
    bi=b.render(scale=120/72).to_pil().convert('RGB')
    aa,bb=np.asarray(ai),np.asarray(bi)
    assert aa.shape==bb.shape
    ink_a,ink_b=aa.min(axis=2)<100,bb.min(axis=2)<100
    expand=lambda x:np.array(Image.fromarray(x.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
    text=b.get_textpage();chars=text.count_chars();text.close();assert chars==0
    result={'page':i+1,'meanChannelDifference':float(np.abs(aa.astype('int16')-bb.astype('int16')).mean()),
            'missingDarkPixelsBeyond1px':int((ink_a&~expand(ink_b)).sum()),
            'addedDarkPixelsBeyond1px':int((ink_b&~expand(ink_a)).sum())}
    if i+1 in SELECTED:
        for name,p in [('source',a),('final',b)]:
            p.render(scale=300/72).to_pil().convert('RGB').save(OUT/f'{i+1:03d}-{name}.jpg',quality=98,subsampling=0)
    bi.thumbnail((228,296));bi.save(OUT/'thumbnails'/f'{i+1:03d}.jpg',quality=94)
    a.close();b.close();return result

def full_page_600_folios(reader):
    found=[]
    for n,page in enumerate(reader.pages,1):
        seen=set();dimensions=[]
        def walk(res):
            for ref in res.get('/XObject',{}).values():
                key=ref.idnum if hasattr(ref,'idnum') else id(ref)
                if key in seen:continue
                seen.add(key);o=ref.get_object()
                if o.get('/Subtype')=='/Form':walk(o.get('/Resources',{}))
                elif o.get('/Subtype')=='/Image':dimensions.append((int(o['/Width']),int(o['/Height'])))
        walk(page['/Resources'])
        if (4512,5812) in dimensions:found.append(n)
    return found

def main():
    (OUT/'thumbnails').mkdir(parents=True,exist_ok=True)
    spec=importlib.util.spec_from_file_location('helper',DOC.parent/'pdfx-retry/verify-pdfx.py')
    helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
    a,b=PdfReader(SOURCE),PdfReader(FINAL)
    assert len(a.pages)==len(b.pages)==174
    assert all(list(x[k])==list(y[k]) for x,y in zip(a.pages,b.pages) for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'))
    preflight=helper.preflight(b);source_preflight=helper.preflight(a)
    assert not preflight['issues'] and not preflight['fontTypes'] and not b.is_encrypted
    assert preflight['profileSHA256']==source_preflight['profileSHA256']
    assert preflight['version']=='%PDF-1.3'
    images_a,images_b=helper.image_inventory(a),helper.image_inventory(b)
    assert images_a==images_b
    fine=full_page_600_folios(b);assert set(fine)==KEEP600
    print('174 pages; exact boxes, all image pixels, profile; zero fonts; all 47 fine-art pages retain 600 dpi.',flush=True)
    pages=[]
    with mp.Pool(3,initializer=init) as pool:
        for p in pool.imap(compare,range(174)):
            pages.append(p)
            if len(pages)%25==0:print('Rendered',len(pages),flush=True)
    for start in range(0,174,20):
        sheet=Image.new('RGB',(4*240,5*320),'#dddddd');draw=ImageDraw.Draw(sheet)
        for i in range(start,min(start+20,174)):
            thumb=Image.open(OUT/'thumbnails'/f'{i+1:03d}.jpg');j=i-start;x=(j%4)*240;y=(j//4)*320
            draw.text((x+5,y+3),str(i+1),fill='black');sheet.paste(thumb,(x+6,y+20))
        sheet.save(OUT/f'contact-{start+1:03d}-{min(start+20,174):03d}.jpg',quality=95)
    with (OUT/'GHOSTSCRIPT-CHECK.txt').open('w') as log:
        parsed=subprocess.run(['/opt/homebrew/bin/gs','-q','-dBATCH','-dNOPAUSE','-sDEVICE=nullpage',str(FINAL)],stdout=log,stderr=subprocess.STDOUT)
    assert parsed.returncode==0
    # Exact final pages, not re-rendered as a review PDF.
    proof=PdfWriter()
    for n in SELECTED:proof.add_page(b.pages[n-1])
    proof._root_object[NameObject('/OutputIntents')]=b.trailer['/Root']['/OutputIntents'].clone(proof)
    proof.add_metadata({'/Title':'The Vegetable Guru - restored quality page checks'})
    proof_path=FINAL.parent/'Vegetable-Guru-Restored-Quality-Checks.pdf';proof.write(proof_path)
    with FINAL.open('rb') as f:sha=hashlib.file_digest(f,'sha256').hexdigest()
    report={'path':str(FINAL.relative_to(ROOT)),'bytes':FINAL.stat().st_size,'sha256':sha,
            'pageCount':174,'pageBoxesExact':True,'allImagePixelsAndDimensionsExact':True,
            'imageResources':len(images_b),'preserved600dpiFolios':fine,'preflight':preflight,
            'scale':1,'translationMm':0,'originalMarginsRetained':True,'allPagesRenderedDpi':120,
            'detailPagesRenderedDpi':300,'detailPages':SELECTED,'ghostscriptParserExit':0,
            'maximumMeanChannelDifference':max(p['meanChannelDifference'] for p in pages),'pages':pages,
            'reviewPDF':str(proof_path.relative_to(ROOT)),'visualReview':'Pending; see VISUAL-REVIEW.json when completed',
            'limitations':'Local checks are not certified ISO PDF/X validation or physical-proof approval.'}
    (DOC/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='pages'},indent=2),flush=True)
    print('Largest render differences:',json.dumps(sorted(pages,key=lambda p:p['missingDarkPixelsBeyond1px']+p['addedDarkPixelsBeyond1px'],reverse=True)[:5]),flush=True)

if __name__=='__main__':main()
