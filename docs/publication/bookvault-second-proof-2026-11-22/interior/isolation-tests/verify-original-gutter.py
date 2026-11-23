"""Pre-upload checks of the original-layout outline control."""
from pathlib import Path
import hashlib, importlib.util, json, multiprocessing as mp, subprocess, sys, re, unicodedata
import numpy as np
import pypdfium2 as pdfium
from PIL import Image,ImageFilter
from pypdf import PdfReader

DOC=Path(__file__).resolve().parent
ROOT=DOC.parents[4]
OUT=DOC/'original-gutter-checks'
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-All-300dpi.pdf'
FINAL=ROOT/'output/pdf/bookvault-isolation-2026-11-23/Vegetable-Guru-Interior-Original-Gutter-Outlined.pdf'
KEEP_FONTS='--keep-fonts' in sys.argv
if KEEP_FONTS:
    FINAL=FINAL.with_name('Vegetable-Guru-Interior-Original-Gutter-GS-Native.pdf')
    OUT=DOC/'original-gs-native-checks'

def init():
    global a,b
    a=pdfium.PdfDocument(SOURCE);b=pdfium.PdfDocument(FINAL)

def compare(i):
    ap,bp=a[i],b[i]
    aa=np.array(ap.render(scale=120/72).to_pil().convert('RGB'))
    bi=bp.render(scale=120/72).to_pil().convert('RGB'); bb=np.array(bi)
    assert aa.shape==bb.shape
    ink_a,ink_b=aa.min(axis=2)<100,bb.min(axis=2)<100
    expand=lambda x: np.array(Image.fromarray(x.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
    tp=bp.get_textpage(); count=tp.count_chars()
    if KEEP_FONTS:
        sp=ap.get_textpage()
        norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
        assert norm(sp.get_text_range())==norm(tp.get_text_range()),i+1
        sp.close()
    tp.close()
    r={'page':i+1,'meanChannelDifference':float(np.abs(aa.astype('int16')-bb.astype('int16')).mean()),
       'missingDarkPixelsBeyond1px':int((ink_a&~expand(ink_b)).sum()),
       'addedDarkPixelsBeyond1px':int((ink_b&~expand(ink_a)).sum()),'textCharacters':count}
    if i+1 in [1,2,24,25,61,67,98,146,163,167,170]:
        bp.render(scale=300/72).to_pil().convert('RGB').save(OUT/f'{i+1:03d}.jpg',quality=97)
    ap.close();bp.close();return r

def main():
    OUT.mkdir(exist_ok=True)
    spec=importlib.util.spec_from_file_location('helper',DOC.parent/'pdfx-retry/verify-pdfx.py')
    helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
    a,b=PdfReader(SOURCE),PdfReader(FINAL)
    assert len(a.pages)==len(b.pages)==174
    assert all(list(x[k])==list(y[k]) for x,y in zip(a.pages,b.pages) for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'))
    preflight=helper.preflight(b)
    assert not preflight['issues'] and not b.is_encrypted
    assert bool(preflight['fontTypes'])==KEEP_FONTS
    images_a=helper.image_inventory(a);images_b=helper.image_inventory(b)
    assert images_a==images_b
    print('174 pages, exact boxes, exact image pixels, preflight clear; keepFonts',KEEP_FONTS,flush=True)
    with mp.Pool(3,initializer=init) as pool:
        pages=[]
        for p in pool.imap(compare,range(174)):
            pages.append(p)
            if len(pages)%25==0:print('Rendered',len(pages),flush=True)
    if not KEEP_FONTS: assert not any(p['textCharacters'] for p in pages)
    with (OUT/'GHOSTSCRIPT-CHECK.txt').open('w') as log:
        result=subprocess.run(['/opt/homebrew/bin/gs','-q','-dBATCH','-dNOPAUSE','-sDEVICE=nullpage',str(FINAL)],stdout=log,stderr=subprocess.STDOUT)
    assert result.returncode==0
    report={'path':str(FINAL.relative_to(ROOT)),'bytes':FINAL.stat().st_size,
            'sha256':hashlib.file_digest(FINAL.open('rb'),'sha256').hexdigest(),
            'pageCount':174,'pageBoxesExact':True,'allImagePixelsAndDimensionsExact':True,
            'imageResources':len(images_b),'preflight':preflight,'allPagesRenderedDpi':120,
            'maximumMeanChannelDifference':max(p['meanChannelDifference'] for p in pages),
            'ghostscriptParserExit':0,'pages':pages}
    (OUT/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='pages'},indent=2),flush=True)
    print('Largest geometry differences',json.dumps(sorted(pages,key=lambda p:p['missingDarkPixelsBeyond1px']+p['addedDarkPixelsBeyond1px'],reverse=True)[:8]),flush=True)

if __name__=='__main__':main()
