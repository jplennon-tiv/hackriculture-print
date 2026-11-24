"""Colour contact sheets for the selected Growing Techniques planting opener; no production changes."""
from pathlib import Path
import copy, hashlib, io, json, subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/'2026-11-24-growing-techniques-planting-opener-08'
ASSETS=SOURCE/'assets'
R=HERE/'renders'; R.mkdir(exist_ok=True)
MM=72/25.4
W,H=191*MM,246*MM
for font in ['Lilita','Nunito','Nunito-Bold','Folio']:
    pdfmetrics.registerFont(TTFont(font,str(ASSETS/f'{font}.ttf')))
contents=json.loads((SOURCE/'CONTENTS.json').read_text())
base_pdf=SOURCE/'Vegetable-Guru-Growing-Techniques-Planting-Page-145.pdf'
base_page=PdfReader(base_pdf).pages[0]
expected=[line.strip() for line in base_page.extract_text().splitlines()]
entries=[e for g in contents['groups'] for e in g['entries']]
photo=Image.open(ASSETS/'planting-option-07.png')
iw,ih=photo.size; scale=max(W/iw,H/ih)
image_reader=ImageReader(photo)
variants=[
    {'id':1,'name':'Warm cream','fill':'#FFF2D5','ink':'#173E2C','opacity':0.82,'group':'light'},
    {'id':2,'name':'Soft ivory','fill':'#F7F8ED','ink':'#20392E','opacity':0.82,'group':'light'},
    {'id':3,'name':'Pale sage','fill':'#DFE9D3','ink':'#173E2C','opacity':0.82,'group':'light'},
    {'id':4,'name':'Pistachio','fill':'#D2DE9E','ink':'#26361E','opacity':0.82,'group':'light'},
    {'id':5,'name':'Soft blue','fill':'#D7E9EF','ink':'#173742','opacity':0.82,'group':'light'},
    {'id':6,'name':'Butter yellow','fill':'#F5DF94','ink':'#293719','opacity':0.82,'group':'light'},
    {'id':7,'name':'Forest green','fill':'#153E2A','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
    {'id':8,'name':'Deep olive','fill':'#404B26','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
    {'id':9,'name':'Dark teal','fill':'#123F44','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
    {'id':10,'name':'Midnight blue','fill':'#20344C','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
    {'id':11,'name':'Slate','fill':'#3E4B58','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
    {'id':12,'name':'Charcoal','fill':'#292E2C','ink':'#FFFAF0','opacity':0.82,'group':'dark'},
]
oval={'cx':115,'cy':267,'rx':180,'ry':151}

def draw_opener(c,v):
    c.drawImage(image_reader,(W-iw*scale)/2,(H-ih*scale)/2,iw*scale,ih*scale)
    c.saveState();c.setFillColor(HexColor(v['fill']));c.setFillAlpha(v['opacity'])
    c.ellipse((oval['cx']-oval['rx'])*MM,H-(oval['cy']+oval['ry'])*MM,
              (oval['cx']+oval['rx'])*MM,H-(oval['cy']-oval['ry'])*MM,stroke=0,fill=1)
    c.restoreState()
    ascent=pdfmetrics.getFont('Lilita').face.ascent/1000
    c.saveState();c.translate(20*MM,H-18*MM-ascent*72);c.rotate(3)
    c.setFillColorRGB(1,1,1);c.setFont('Lilita',72);c.drawString(0,0,'Growing')
    second_y=-84*.89-MM
    c.setFont('Lilita',64);c.drawString(0,second_y,'Techniques')
    end=pdfmetrics.stringWidth('Techniques','Lilita',64)
    c.setFillColor(HexColor('#d6ea9b'));c.circle(end+4*MM,second_y+2.5*MM,1.7*MM,stroke=0,fill=1)
    c.restoreState()
    c.setFillColor(HexColor(v['ink']))
    for gi,group in enumerate(contents['groups']):
        col,row=divmod(gi,3)
        left,right=[(26,99),(108,180)][col]
        heading=[149,180.5,212][row]
        c.setFont('Nunito-Bold',12.5);c.drawString(left*MM,H-heading*MM,group['title'])
        for i,e in enumerate(group['entries']):
            baseline=heading+7+i*5.2
            c.setFont('Nunito',10.8);c.drawString(left*MM,H-baseline*MM,e['title'])
            c.setFont('Nunito-Bold',10.8);c.drawRightString(right*MM,H-baseline*MM,e['pages'])
    c.setFont('Folio',7.35);c.drawRightString(180*MM,11*MM,'145')

# Exact page content is reused under clipping and uniform scaling on each sheet.
SW,SH=420*MM,395*MM
cell_w=126*MM; cell_h=cell_w*240/185
buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(SW,SH),initialFontName='Nunito',pageCompression=1)
for batch,title in [(variants[:6],'Growing Techniques: light ovals'),(variants[6:],'Growing Techniques: dark ovals')]:
    c.setFillColor(HexColor('#FAF8F2'));c.rect(0,0,SW,SH,stroke=0,fill=1)
    c.setFillColor(HexColor('#20392E'));c.setFont('Nunito-Bold',25)
    c.drawString(12*MM,SH-14*MM,title)
    c.setFont('Nunito',11);c.drawString(12*MM,SH-21*MM,'Same photograph and layout; all ovals at 82% opacity. Dark text on light colours; warm white on dark.')
    for j,v in enumerate(batch):
        col=j%3;row=j//3
        x=(12+col*135)*MM
        top=SH-26*MM-row*(cell_h+17*MM)
        y=top-cell_h
        c.saveState()
        path=c.beginPath();path.rect(x,y,cell_w,cell_h);c.clipPath(path,stroke=0,fill=0)
        s=cell_w/(185*MM)
        c.translate(x-3*MM*s,y-3*MM*s);c.scale(s,s)
        draw_opener(c,v);c.restoreState()
        c.setFillColor(HexColor('#20392E'));c.setFont('Nunito-Bold',18)
        c.drawCentredString(x+cell_w/2,y-7*MM,f"{v['id']}  {v['name']}"+(' (current)' if v['id']==8 else ''))
    c.showPage()
c.save()
contact_reader=PdfReader(io.BytesIO(buf.getvalue()))
out=PdfWriter()
for p in contact_reader.pages:out.add_page(p)

# Append twelve full-size views for easier inspection of type and colour.
individual_checks=[]
for v in variants:
    full=io.BytesIO();c=canvas.Canvas(full,pagesize=(W,H),initialFontName='Nunito',pageCompression=1)
    draw_opener(c,v);c.showPage();c.save()
    p=PdfReader(io.BytesIO(full.getvalue())).pages[0]
    assert [line.strip() for line in p.extract_text().splitlines()]==expected
    for f in p['/Resources']['/Font'].values():
        d=f.get_object().get('/FontDescriptor')
        assert d and '/FontFile2' in d.get_object()
    p.trimbox=RectangleObject([3*MM,3*MM,188*MM,243*MM])
    p.bleedbox=RectangleObject([0,0,W,H])
    # Full-page review views show trim; bleed remains in the document.
    p.cropbox=p.trimbox
    out.add_page(p)
    out.add_outline_item(f"{v['id']} — {v['name']}",v['id']+1)
    individual_checks.append({'id':v['id'],'all_contents_and_folio':True,'fonts_embedded':True})
out.add_outline_item('Light ovals — 1–6',0)
out.add_outline_item('Dark ovals — 7–12',1)
out.add_metadata({'/Title':'Growing Techniques — light and dark oval colour choices',
                  '/Author':'John Lennon',
                  '/Subject':'Two contact sheets and twelve full-size layout previews. Selected planting photograph 7; trial resolution, not for printer upload.'})
pdf=HERE/'Vegetable-Guru-Growing-Techniques-Oval-Colour-Contact-Sheets.pdf'
if hasattr(out,'compress_identical_objects'): out.compress_identical_objects(remove_identicals=True,remove_orphans=True)
out.write(pdf)
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
renders=[]
for page,label in [(1,'Light-Ovals-1-6'),(2,'Dark-Ovals-7-12')]:
    target=HERE/f'Vegetable-Guru-Growing-Techniques-{label}'
    subprocess.run([poppler,'-f',str(page),'-l',str(page),'-png','-singlefile','-scale-to','2100',str(pdf),str(target)],check=True,capture_output=True)
    renders.append(str(target)+'.png')
assert len(PdfReader(pdf).pages)==14
manifest={'date':'2026-11-24','status':'awaiting_oval_colour_choice','selected_photo':7,'rejected_colour':'previous plum-brown #392c31','variants':variants,'oval_geometry_mm':oval,'photo_source':str(ASSETS/'planting-option-07.png'),'photo_sha256':hashlib.sha256((ASSETS/'planting-option-07.png').read_bytes()).hexdigest(),'fixed_elements':['photo bytes and crop','title','terminal dot','oval geometry','contents names and ranges','folio 145'],'checks':individual_checks,'opacity_all':0.82,'current_colour_option':8,'no_image_regeneration':True,'pdf_pages':14,'first_two_pages':'contact sheets, six designs each','remaining_pages':'full-size variants 1–12','source_pixels':[iw,ih],'effective_ppi':72/scale,'production_ready':False,'book_integration':False,'upscale_gate':'Mandatory before printer upload if adopted; paid subscription/upscale deferred.'}
(HERE/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'pdf':str(pdf),'renders':renders,'variants':12,'checks':'passed','size_bytes':pdf.stat().st_size},indent=2))
