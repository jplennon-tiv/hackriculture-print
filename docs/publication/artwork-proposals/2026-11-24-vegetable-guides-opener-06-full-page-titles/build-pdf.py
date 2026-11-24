"""Build six separate review pages with native embedded white Lilita lettering.
Image pixels are embedded at their actual resolution; no resolution is invented.
Uses local pypdf/ReportLab. Does not run the main book build.
"""
from pathlib import Path
import hashlib, io, json, math
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
MM=72/25.4
W,H=191*MM,246*MM
TRIM=[3*MM,3*MM,188*MM,243*MM]
DONOR=ROOT/'docs/publication/key-risk-title-case/font-donor.pdf'
FONT=HERE/'assets/LilitaOne-donor-subset.ttf'
donor=PdfReader(DONOR)
source_font=donor.pages[0]['/Resources']['/Font']['/F4'].get_object()
assert 'LilitaOne' in source_font['/BaseFont']
fd=source_font['/DescendantFonts'][0].get_object()['/FontDescriptor'].get_object()
FONT.write_bytes(fd['/FontFile2'].get_object().get_data())
font=TTFont('Lilita',str(FONT))
assert all(ord(c) in font.face.charToGlyph for c in 'Vegetable Guides')
pdfmetrics.registerFont(font)
ASC,DESC=font.face.ascent/1000,font.face.descent/1000
art=json.loads((HERE/'ARTWORK.json').read_text())
layout=[]
buf=io.BytesIO()
c=canvas.Canvas(buf,pagesize=(W,H),pageCompression=1,initialFontName='Lilita',initialFontSize=12)
c.setTitle('The Vegetable Guru — photographs 21 and 9, title-only layout proofs')
c.setAuthor('John Lennon')
c.setSubject('191 x 246 mm with 3 mm bleed; native images approximately 147 ppi; layout proof only')
def text(line,size,x,y,align='left'):
    width=pdfmetrics.stringWidth(line,'Lilita',size)
    if align=='right': x-=width
    if align=='centre': x-=width/2
    c.setFont('Lilita',size)
    c.setFillColorRGB(1,1,1)
    c.drawString(x,y,line)
    return [x,y+DESC*size,x+width,y+ASC*size]
for image in art['native_artwork']:
    for option in ['A','B','C']:
        c.saveState()
        c.rect(0,0,W,H,stroke=0,fill=0)
        # Exact full-bleed fill: preserve ratio and clip a negligible strip.
        iw,ih=image['width'],image['height']
        scale=max(W/iw,H/ih)
        dw,dh=iw*scale,ih*scale
        c.drawImage(ImageReader(str(HERE/'assets'/image['file'])),(W-dw)/2,(H-dh)/2,dw,dh,mask=None)
        if option=='A':
            y1=H-18*MM-ASC*72
            bounds=[text('Vegetable',72,20*MM,y1),
                    text('Guides',84,20*MM,y1-84*.89-1*MM)]
        elif option=='B':
            bounds=[text('Vegetable Guides',50,(20+180)/2*MM,H-20*MM-ASC*50,'centre')]
        else:
            y2=19*MM-DESC*76
            bounds=[text('Vegetable',64,180*MM,y2+76*.89+1*MM,'right'),
                    text('Guides',76,180*MM,y2,'right')]
        b=[min(v[0] for v in bounds),min(v[1] for v in bounds),max(v[2] for v in bounds),max(v[3] for v in bounds)]
        assert b[0] >=20*MM-.01 and b[2]<=180*MM+.01
        assert b[1]>=8*MM and b[3]<=238*MM
        layout.append({'code':str(image['id'])+option,'title':'Vegetable Guides','bounds_mm_from_bleed_bottom_left':[round(v/MM,4) for v in b]})
        c.restoreState()
        c.showPage()
c.save()
reader=PdfReader(io.BytesIO(buf.getvalue()))
writer=PdfWriter()
for i,p in enumerate(reader.pages):
    p.mediabox=RectangleObject([0,0,W,H])
    p.cropbox=RectangleObject([0,0,W,H])
    p.trimbox=RectangleObject(TRIM)
    p.bleedbox=RectangleObject([0,0,W,H])
    writer.add_page(p)
    writer.add_outline_item(layout[i]['code']+' — '+art['options'][i]['arrangement'],i)
writer.add_metadata({'/Title':'Vegetable Guru — 21 and 9 title studies','/Author':'John Lennon','/Subject':'Title-only layout review; source images approximately 147 ppi, below 300 ppi production target'})
OUT=HERE/'Vegetable-Guru-21-and-9-Title-Studies.pdf'
with OUT.open('wb') as f: writer.write(f)
# Derived trim-only PDF exists solely to render the comparison sheet.
trim=PdfWriter()
for p in PdfReader(OUT).pages:
    p.cropbox=RectangleObject(TRIM)
    trim.add_page(p)
with (HERE/'renders/trim-preview.pdf').open('wb') as f: trim.write(f)
r=PdfReader(OUT)
assert len(r.pages)==6
checks=[]
for p,entry in zip(r.pages,layout):
    extracted=' '.join(p.extract_text().split())
    assert extracted=='Vegetable Guides',extracted
    fonts=p['/Resources']['/Font']
    lilita=[v.get_object() for v in fonts.values() if 'Lilita' in str(v.get_object().get('/BaseFont',''))]
    assert lilita and all('/FontFile2' in f['/FontDescriptor'].get_object() for f in lilita)
    xobjects=p['/Resources']['/XObject']
    images=[o.get_object() for o in xobjects.values() if o.get_object().get('/Subtype')=='/Image']
    assert len(images)==1 and all((i['/Width'],i['/Height'])==(1105,1423) for i in images)
    checks.append({'code':entry['code'],'text':extracted,'embedded_lilita':True,'embedded_artwork_pixels':[1105,1423],'media_mm':[191,246],'trim_mm':[185,240],'bleed_mm':3})
art['pdf_font']={'source_pdf':str(DONOR.relative_to(ROOT)),'source_resource':'/F4','base_font':str(source_font['/BaseFont']),'extracted_ttf_sha256':hashlib.sha256(FONT.read_bytes()).hexdigest(),'required_glyphs_present':True,'font_embedding':'Native embedded TrueType subset'}
art['layout']=layout
art['checks']=checks
art['pdf_sha256']=hashlib.sha256(OUT.read_bytes()).hexdigest()
art['readiness']={'layout_review':True,'native_300ppi_artwork':False,'production_colour_conversion':False,'book_integration':False,'supplier_upload':False}
(HERE/'ARTWORK.json').write_text(json.dumps(art,indent=2)+'\n')
print(json.dumps({'file':str(OUT),'pages':len(r.pages),'size_bytes':OUT.stat().st_size,'native_ppi':art['native_artwork'][0]['effective_ppi_full_bleed'],'checks':'All six pages have exact boxes, title-only native embedded text and original-resolution artwork'},indent=2))

