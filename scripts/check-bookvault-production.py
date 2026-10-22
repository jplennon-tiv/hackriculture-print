"""Check every finished page against current authorised text and physical template."""
from pathlib import Path
import json,hashlib,logging,math,argparse
import pdfplumber
from pypdf import PdfReader
from pypdf.generic import ContentStream
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/pdf/bookvault-print-ready';DOC=ROOT/'docs/publication/bookvault-print-ready';TMP=ROOT/'tmp/pdfs/bookvault-print-ready';MM=72/25.4

def resources(res,reader,seen=None):
    seen=set() if seen is None else seen;fonts={};issues=[];spaces=[];res=res.get_object()
    for name,ref in res.get('/Font',{}).items():
        f=ref.get_object()
        for ch in f.get('/DescendantFonts',[f]):
            ch=ch.get_object();fd=ch.get('/FontDescriptor',{});fd=fd.get_object() if hasattr(fd,'get_object') else fd
            fonts[str(f.get('/BaseFont',f.get('/Subtype')))]=ch.get('/Subtype')=='/Type3' or any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3'])
    for ref in res.get('/ExtGState',{}).values():
        st=ref.get_object()
        if st.get('/SMask','/None')!='/None' or float(st.get('/ca',1))!=1 or float(st.get('/CA',1))!=1 or st.get('/BM','/Normal') not in ('/Normal','/Compatible'):issues.append('Transparency graphics state')
    for ref in res.get('/XObject',{}).values():
        ob=ref.get_object()
        if id(ob) in seen:continue
        seen.add(id(ob))
        if '/SMask' in ob or ob.get('/Group',{}).get('/S')=='/Transparency':issues.append('Transparent object')
        if ob.get('/Subtype')=='/Image':spaces.append(str(ob.get('/ColorSpace')))
        if '/Resources' in ob:
            f,p,s=resources(ob['/Resources'],reader,seen);fonts.update(f);issues+=p;spaces+=s
        if ob.get('/Subtype')=='/Form':
            for vals,op in ContentStream(ob,reader).operations:
                if op in (b'rg',b'RG'):issues.append('RGB form operation')
    return fonts,issues,spaces

parser=argparse.ArgumentParser();parser.add_argument('--cover-only',action='store_true');args=parser.parse_args()
prior=json.loads((DOC/'PREFLIGHT.json').read_text()) if args.cover_only else None
all_checks=[x for x in prior['checks'] if x['kind']=='interior'] if prior else []
if prior:
    for x in all_checks:assert hashlib.sha256((ROOT/x['pdf']).read_bytes()).hexdigest()==x['sha256'],'Retained interior check does not match current file'
for kind,pages,size in [('interior',168,(191,246)),('cover',1,(388,246))]:
    if args.cover_only and kind!='cover':continue
    file=OUT/f'the-vegetable-guru-{kind}.pdf';native=TMP/f'{kind}-rgb.pdf';r=PdfReader(file);src=PdfReader(native)
    assert len(r.pages)==pages
    intent=r.trailer['/Root']['/OutputIntents'][0].get_object();assert intent['/OutputConditionIdentifier']=='FOGRA39' and intent['/DestOutputProfile'].get_object()['/N']==4
    records=[]
    with pdfplumber.open(native) as a,pdfplumber.open(file) as b:
        for i,(before,after,p) in enumerate(zip(a.pages,b.pages,r.pages)):
            assert abs(float(p.mediabox.width)/MM-size[0])<.001 and abs(float(p.mediabox.height)/MM-size[1])<.001
            assert [round(float(v)/MM,5) for v in p.trimbox]==[3,3,size[0]-3,size[1]-3]
            assert p.bleedbox==p.mediabox and p.cropbox==p.mediabox
            assert not p.get('/Annots') and p.get('/Group',{}).get('/S')!='/Transparency'
            assert len(before.chars)==len(after.chars),(kind,i,'Glyph count')
            delta=0
            for c,d in zip(before.chars,after.chars):
                assert c['text']==d['text'] and c['fontname']==d['fontname'],(kind,i,'Glyph/font changed')
                delta=max(delta,*(abs(c[k]-d[k]) for k in ['x0','x1','top','bottom','size']))
            assert delta<.00001,(kind,i,delta)
            fonts,issues,spaces=resources(p['/Resources'],r)
            assert all(fonts.values()),(kind,i,'Unembedded font',fonts)
            for vals,op in p.get_contents().operations:
                if op in (b'rg',b'RG'):issues.append('RGB page operation')
            assert not issues,(kind,i,issues)
            assert all(x=='/DeviceCMYK' for x in spaces),(kind,i,spaces)
            low=[];min_dpi=9999
            for image in after.images:
                dpi=min(image['srcsize'][0]*72/image['width'],image['srcsize'][1]*72/image['height']);min_dpi=min(min_dpi,dpi)
                if dpi<599:low.append(round(dpi,2))
            assert not low,(kind,i,low)
            safe=[]
            if kind=='interior':
                left,right=(8,171) if (i+1)%2==0 else (20,183)
                for ch in after.chars:
                    if not ch['text'].strip():continue
                    if ch['x0']/MM<left-.15 or ch['x1']/MM>right+.15 or ch['top']/MM<8-.15 or ch['bottom']/MM>238+.15:safe.append(ch['text'])
            records.append({'page':i+1,'glyphs':len(after.chars),'maximumGlyphGeometryDeltaPt':delta,'nativeFontsEmbedded':fonts,'imageSpaces':spaces,'artDpi':round(min_dpi,2) if after.images else None,'safetyOutsideCharacters':''.join(safe)})
            before.close();after.close()
            if (i+1)%30==0:print(f'Checked {kind} page {i+1}',flush=True)
    all_checks.append({'kind':kind,'pdf':str(file.relative_to(ROOT)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'pageCount':pages,'mediaMm':size,'outputProfile':'FOGRA39 / ISO Coated v2 300% (ECI)','checks':records})
# Stronger interior text check against the current reading PDF, not just an intermediate.
if args.cover_only:
    records=prior['readingProofComparison']
else:
    records=[]
    with pdfplumber.open(ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf') as old,pdfplumber.open(OUT/'the-vegetable-guru-interior.pdf') as new:
        for i,after in enumerate(new.pages):
            before=old.pages[i+2];assert len(before.chars)==len(after.chars),(i,'Glyph count')
            delta=0
            for c,d in zip(before.chars,after.chars):
                assert c['text']==d['text'] and c['fontname']==d['fontname']
                delta=max(delta,abs(c['size']-d['size']),*(abs(d[k]-c[k]-3*MM) for k in ['x0','x1','top','bottom']))
            assert delta<.00001,(i,delta)
            records.append({'folio':i+1,'glyphs':len(after.chars),'maximumDeltaBeyond3mmBleedTranslationPt':delta})
            before.close();after.close()
        print('All 168 pages preserve original reading-proof glyphs, fonts and positions.',flush=True)
result={'date':'2026-10-19','status':'Automated production checks passed; separate visual review and Bookvault validation still required','checks':all_checks,'readingProofComparison':records,'limits':['Print-production files for author review, not author approval or supplier acceptance','Minimum final image resolution describes flattened artwork; original source resolution varies and is recorded separately','No PDF/X conformance certification claimed','Metadata and barcode placeholders intentionally retained']}
(DOC/'PREFLIGHT.json').write_text(json.dumps(result,indent=2)+'\n')
print('Wrote PREFLIGHT.json',flush=True)
