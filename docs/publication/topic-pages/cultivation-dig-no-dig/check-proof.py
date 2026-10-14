"""Check the focused three-page PDFs and render the final files for inspection."""
from pathlib import Path
import hashlib, io, json, logging, re, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
import pdfplumber
from PIL import Image

logging.getLogger('pdfminer').setLevel(logging.ERROR)
folder=Path(__file__).resolve().parent
root=folder.parents[3]
dom=json.loads((folder/'DOM-CHECKS.json').read_text())
mm=72/25.4
normal=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
results=[]
for edition in dom['results']:
    units=edition['units']
    target=root/'output/pdf/topic-pages'/f'cultivation-dig-no-dig-{units}-draft.pdf'
    reader=PdfReader(io.BytesIO(target.read_bytes()))
    assert len(reader.pages)==4
    before=[]
    writer=PdfWriter()
    for page in reader.pages:
        before.append([float(page.mediabox.width)/mm,float(page.mediabox.height)/mm])
        assert abs(float(page.mediabox.width)/mm-185)<.3
        assert abs(float(page.mediabox.height)/mm-240)<.3
        # Chromium rounds its paper dimensions. Correct boxes, without scaling content.
        for box in ['mediabox','cropbox','trimbox']:
            setattr(page,box,RectangleObject([0,0,185*mm,240*mm]))
        writer.add_page(page)
    writer.add_metadata({'/Title':f'The Vegetable Guru - Cultivation: Dig or No-Dig ({units} draft)',
                         '/Author':'John Lennon',
                         '/Subject':'Four-page draft for review. Proposed folios 149-152; not assembled or approved.'})
    with target.open('wb') as f:writer.write(f)
    reader=PdfReader(target)
    fontnames=set()
    for page in reader.pages:
        for ref in page['/Resources']['/Font'].values():
            font=ref.get_object()
            if font.get('/Subtype')=='/Type3':
                # Chromium embeds some variable-font weights as glyph programs.
                assert font.get('/ToUnicode') is not None
                assert all(len(g.get_object().get_data())>0 for g in font['/CharProcs'].values())
                fontnames.add('Type3 embedded glyphs with Unicode mapping')
            else:
                for descendant in font.get('/DescendantFonts',[font]):
                    desc=descendant.get_object()['/FontDescriptor'].get_object()
                    assert any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3'])
                fontnames.add(str(font.get('/BaseFont')))
    verified=0
    minimum=100
    with pdfplumber.open(target) as doc:
        for p,entry in zip(doc.pages,edition['pages']):
            assert round(p.width/mm,4)==185 and round(p.height/mm,4)==240
            minimum=min(minimum,min(c['size'] for c in p.chars))
            for b in entry['blocks']:
                if b['tag']=='IMG':continue
                rect=(max(0,(b['leftMm']-.2)*mm),max(0,(b['topMm']-.3)*mm),min(p.width,(b['rightMm']+.2)*mm),min(p.height,(b['bottomMm']+.3)*mm))
                actual=p.crop(rect).extract_text(x_tolerance=1,y_tolerance=2) or ''
                assert normal(b['text']) in normal(actual), (units,entry['folio'],b['tag'],b['text'],actual)
                verified+=1
            assert str(entry['folio']) in (p.extract_text() or '')
    assert minimum>=7
    subprocess.run(['pdftoppm','-r','150','-png',str(target),str(folder/units)],check=True,capture_output=True)
    left=Image.open(folder/f'{units}-2.png').convert('RGB')
    right=Image.open(folder/f'{units}-3.png').convert('RGB')
    spread=Image.new('RGB',(left.width+right.width+20,max(left.height,right.height)),(212,218,201))
    spread.paste(left,(0,0));spread.paste(right,(left.width+20,0))
    spread.save(folder/f'{units}-spread.png')
    # Consecutive digging pages: useful review pairing, not a bound facing spread.
    a=Image.open(folder/f'{units}-3.png').convert('RGB')
    b=Image.open(folder/f'{units}-4.png').convert('RGB')
    paired=Image.new('RGB',(a.width+b.width+20,max(a.height,b.height)),(212,218,201))
    paired.paste(a,(0,0));paired.paste(b,(a.width+20,0))
    paired.save(folder/f'{units}-digging-pages.png')
    thumbs=[]
    for n in range(1,5):
        im=Image.open(folder/f'{units}-{n}.png').convert('RGB')
        im.thumbnail((620,805));thumbs.append(im)
    overview=Image.new('RGB',(sum(i.width for i in thumbs)+100,max(i.height for i in thumbs)+40),(212,218,201))
    x=20
    for im in thumbs:overview.paste(im,(x,20));x+=im.width+20
    overview.save(folder/f'{units}-overview.png')
    results.append({'units':units,'path':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
                    'pages':4,'trimMm':[185,240],'originalBrowserPaperMm':before,
                    'paperBoxesNormalisedWithoutScaling':True,'fontsEmbedded':sorted(fontnames),
                    'minimumTextPt':round(minimum,3),'copyBlocksVerifiedAgainstPdf':verified,
                    'pageFolios':[149,150,151,152],
                    'minimumDomFooterClearanceMm':min(p['footerGapMm'] for p in edition['pages']),
                    'actualPdfRendered':True,'visualReview':'pending'})
(folder/'CHECKS.json').write_text(json.dumps({'status':'Draft; not installed or approved','date':'2026-10-08','results':results},indent=2)+'\n')
print(json.dumps(results,indent=2))
