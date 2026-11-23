"""Verify actual final CMYK interior against the preserved native bleed baseline."""
from pathlib import Path
import json,hashlib,logging,importlib.util
import pdfplumber
from pypdf import PdfReader
import pypdf.filters
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=200_000_000
from pypdf.generic import ContentStream
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[4];DOC=Path(__file__).resolve().parent
OUT=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior'
SOURCE=OUT/'Vegetable-Guru-Interior-Production-Preparation.pdf'
FINAL=OUT/'Vegetable-Guru-Interior-Colour-Managed.pdf'
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
sr=PdfReader(SOURCE);r=PdfReader(FINAL);assert len(r.pages)==174
profile=r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object()
assert hashlib.sha256(profile.get_data()).hexdigest()==sha(PROFILE)

def inspect(page):
    fonts={};issues=[];images=[];seen=set()
    def walk(res):
        res=res.get_object()
        if id(res) in seen:return
        seen.add(id(res))
        for name,ref in res.get('/Font',{}).items():
            f=ref.get_object()
            for child in f.get('/DescendantFonts',[f]):
                child=child.get_object();fd=child.get('/FontDescriptor',{});fd=fd.get_object() if hasattr(fd,'get_object') else fd
                fonts[str(f.get('/BaseFont'))]=child.get('/Subtype')=='/Type3' or any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3'])
        for ref in res.get('/ExtGState',{}).values():
            st=ref.get_object()
            if st.get('/SMask','/None')!='/None' or float(st.get('/ca',1))!=1 or float(st.get('/CA',1))!=1 or str(st.get('/BM','/Normal')) not in ('/Normal','/Compatible'):issues.append('Transparency graphics state')
        for ref in res.get('/XObject',{}).values():
            ob=ref.get_object()
            if not hasattr(ob,'get'):continue
            if '/SMask' in ob:issues.append('Image soft mask')
            group=ob.get('/Group',{})
            if hasattr(group,'get') and group.get('/S')=='/Transparency':issues.append('Transparency group')
            if ob.get('/Subtype')=='/Image':images.append({'pixels':[int(ob['/Width']),int(ob['/Height'])],'space':str(ob['/ColorSpace'])})
            if '/Resources' in ob:walk(ob['/Resources'])
            if ob.get('/Subtype')=='/Form':
                for vals,op in ContentStream(ob,r).operations:
                    if op in (b'rg',b'RG',b'cs',b'CS',b'sc',b'SC',b'scn',b'SCN'):issues.append('Non-CMYK form colour operation')
    walk(page['/Resources'])
    for vals,op in page.get_contents().operations:
        if op in (b'rg',b'RG',b'cs',b'CS',b'sc',b'SC',b'scn',b'SCN'):issues.append('Non-CMYK page colour operation')
    return fonts,issues,images

records=[];glyph_total=0
with pdfplumber.open(SOURCE) as old,pdfplumber.open(FINAL) as new:
    for i,(a,b,page) in enumerate(zip(old.pages,new.pages,r.pages),1):
        assert all(page[k]==sr.pages[i-1][k] for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox')),(i,'Geometry boxes changed')
        assert not page.get('/Annots')
        assert len(a.chars)==len(b.chars),(i,'Glyph count',len(a.chars),len(b.chars))
        delta=0
        for c,d in zip(a.chars,b.chars):
            assert c['text']==d['text'] and c['fontname']==d['fontname'],(i,c['text'],d['text'],c['fontname'],d['fontname'])
            delta=max(delta,*(abs(c[k]-d[k]) for k in ('x0','x1','top','bottom','size')))
        assert delta<.0001,(i,'Native glyph geometry changed',delta)
        fonts,issues,images=inspect(page)
        assert all(fonts.values()),(i,'Unembedded font',fonts)
        assert not issues,(i,issues)
        assert len(images)==1 and images[0]['space']=='/DeviceCMYK',(i,images)
        dpi=[images[0]['pixels'][0]*72/float(page.mediabox.width),images[0]['pixels'][1]*72/float(page.mediabox.height)]
        assert min(dpi)>=599.9,(i,dpi)
        records.append({'folio':i,'nativeGlyphs':len(a.chars),'nativeFontNamesAndTextIdentical':True,'maximumGlyphGeometryDeltaPt':delta,'allFontResourcesEmbedded':True,'opaqueCMYKArtwork':True,'artworkPixels':images[0]['pixels'],'compositingDpi':dpi})
        glyph_total+=len(a.chars);a.close();b.close()
        if i%20==0:print('Checked colour production folio',i,flush=True)
receipt={'date':'2026-11-22','status':'All 174 pages pass native-lettering, geometry, font-embedding, CMYK and transparency checks; final visual colour review and supplier acceptance separate.',
 'sourceSHA256':sha(SOURCE),'outputSHA256':sha(FINAL),'bytes':FINAL.stat().st_size,'pageCount':174,'profileSHA256':sha(PROFILE),'profile':'ISO Coated v2 300% (ECI), FOGRA39','nativeGlyphsPreserved':glyph_total,'pages':records,
 'limits':['600dpi compositing does not add detail absent from original images','No PDF/X conformance certification claimed','Copyright and ISBN placeholders retained for the next stage','Bookvault supplier validation and author approval still required']}
(DOC/'COLOUR-PRODUCTION-CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n')
print({k:v for k,v in receipt.items() if k!='pages'},flush=True)
