"""Check the topic-page review PDFs and render the final files for inspection."""
from pathlib import Path
import hashlib, io, json, logging, re, subprocess, sys
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
render_arg=next((a for a in sys.argv[1:] if a.startswith('--render-pages=')),None)
render_pages=[int(n) for n in render_arg.split('=',1)[1].split(',')] if render_arg else []
results=[]
for edition in dom['results']:
    units=edition['units']
    page_count=len(edition['pages'])
    target=root/'output/pdf/topic-pages'/f'compost-bins-pilot-{units}.pdf'
    reader=PdfReader(io.BytesIO(target.read_bytes()))
    assert len(reader.pages)==page_count
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
    writer.add_metadata({'/Title':f'The Vegetable Guru - Compost bins pilot ({units} draft)',
                         '/Author':'John Lennon',
                         '/Subject':'Separate two-page compost-bin pilot; no book insertion or final folios. Draft for John.'})
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
            minimum=min(minimum,min(c['size'] for c in p.chars if c.get('upright',True)))
            for b in entry['blocks']:
                if b['tag']=='IMG':continue
                rect=(max(0,(b['leftMm']-.2)*mm),max(0,(b['topMm']-.3)*mm),min(p.width,(b['rightMm']+.2)*mm),min(p.height,(b['bottomMm']+.3)*mm))
                actual=p.crop(rect).extract_text(x_tolerance=1,y_tolerance=2) or ''
                expected=normal(b['text']);found=normal(actual)
                # Small inline step numerals may be ordered after the heading by PDF extraction.
                inline_step=b['tag']=='H3' and expected[:1].isdigit() and expected[1:] in found and expected[0] in found
                rotated_label=b.get('transform','') and 'rotate(-90' in b['transform'] and expected==found[::-1]
                assert expected in found or inline_step or rotated_label, (units,entry['folio'],b['tag'],b['text'],actual)
                verified+=1
            assert str(entry['folio']) in (p.extract_text() or '')
    assert minimum>=7
    for number in (render_pages or [None]):
        scope=['-f',str(number),'-l',str(number)] if number else []
        subprocess.run(['pdftoppm','-r','150','-png',*scope,str(target),str(folder/units)],check=True,capture_output=True)
    for n in range(1,page_count+1):
        generated=folder/f'{units}-{n}.png'
        if generated.exists():generated.replace(folder/f'{units}-{n:02d}.png')
    left=Image.open(folder/f'{units}-01.png').convert('RGB')
    right=Image.open(folder/f'{units}-02.png').convert('RGB')
    combined=Image.new('RGB',(left.width+right.width+20,max(left.height,right.height)),(212,218,201))
    combined.paste(left,(0,0));combined.paste(right,(left.width+20,0))
    combined.save(folder/f'{units}-pair.png')
    results.append({'units':units,'path':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
                    'pages':page_count,'trimMm':[185,240],'originalBrowserPaperMm':before,
                    'paperBoxesNormalisedWithoutScaling':True,'fontsEmbedded':sorted(fontnames),
                    'minimumUprightTextPt':round(minimum,3),'copyBlocksVerifiedAgainstPdf':verified,
                    'reviewFolios':list(range(1,page_count+1)),
                    'minimumDomFooterClearanceMm':min(p['footerGapMm'] for p in edition['pages']),
                    'actualPdfRendered':True,'visualReview':'pending'})
(folder/'CHECKS.json').write_text(json.dumps({'status':'Separate two-page pilot; actual visual inspection pending','date':'2026-10-09','results':results},indent=2)+'\n')
print(json.dumps(results,indent=2))
