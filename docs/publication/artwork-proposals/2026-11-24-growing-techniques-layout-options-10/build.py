"""Six native-layout experiments; selected photograph and pale sage are fixed."""
from pathlib import Path
import hashlib, io, json, math, subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/'2026-11-24-growing-techniques-planting-opener-08'
A=SOURCE/'assets'; R=HERE/'renders'; R.mkdir(exist_ok=True)
MM=72/25.4; W,H=191*MM,246*MM
for font in ['Lilita','Nunito','Nunito-Bold','Folio']:
    pdfmetrics.registerFont(TTFont(font,str(A/f'{font}.ttf')))
contents=json.loads((SOURCE/'CONTENTS.json').read_text())
base=PdfReader(SOURCE/'Vegetable-Guru-Growing-Techniques-Planting-Page-145.pdf').pages[0]
expected=base.extract_text().split()
photo_path=A/'planting-option-07.png'; photo=Image.open(photo_path)
iw,ih=photo.size; scale=max(W/iw,H/ih); image_reader=ImageReader(photo)
palette={'selected_colour_option':3,'name':'Pale sage','fill':'#DFE9D3','ink':'#173E2C','opacity':0.82}
variants=[
 {'id':1,'name':'Lifted / broad oval','title':{'x':14,'top':14,'sizes':[72,56],'gap':24,'angle':3},'oval':{'cx':115,'cy':267,'rx':180,'ry':151,'angle':0},'description':'Title shifted up and left into a balanced block; existing broad oval retained.'},
 {'id':2,'name':'Higher / flatter oval','title':{'x':20,'top':11,'sizes':[64,54],'gap':21,'angle':0},'oval':{'cx':95,'cy':290,'rx':245,'ry':159,'angle':0},'description':'Higher, tighter, level title; flatter lower arc reveals more of the bed.'},
 {'id':3,'name':'Level / rounder oval','title':{'x':16,'top':22,'sizes':[62,52],'gap':21,'angle':0},'oval':{'cx':95,'cy':230,'rx':120,'ry':120,'angle':0},'description':'Level title comfortably on the left; rounder, centred cropped oval.'},
 {'id':4,'name':'Lower / right offset','title':{'x':16,'top':40,'sizes':[58,48],'gap':19,'angle':3},'oval':{'cx':175,'cy':245,'rx':260,'ry':132,'angle':0},'description':'Title lowered into the left foliage; oval offset right, rising towards the right edge.'},
 {'id':5,'name':'Raised / left offset','title':{'x':16,'top':13,'sizes':[68,54],'gap':23,'angle':2},'oval':{'cx':25,'cy':250,'rx':255,'ry':135,'angle':0},'description':'Raised title with gentle tilt; oval offset left, descending towards the right edge.'},
 {'id':6,'name':'Inset / tilted oval','title':{'x':20,'top':25,'sizes':[60,50],'gap':21,'angle':0},'oval':{'cx':100,'cy':245,'rx':180,'ry':125,'angle':14},'description':'Compact level title inset on the left; true ellipse tilted clockwise by 14 degrees.'},
]

def inside_oval(oval,x,y,inset=3):
    a=math.radians(oval['angle']); co,si=math.cos(a),math.sin(a)
    dx,dy=x-oval['cx'],y-oval['cy']
    return ((dx*co+dy*si)/(oval['rx']-inset))**2+((-dx*si+dy*co)/(oval['ry']-inset))**2 < 1

def draw_opener(c,v):
    c.drawImage(image_reader,(W-iw*scale)/2,(H-ih*scale)/2,iw*scale,ih*scale)
    o=v['oval']; c.saveState()
    c.translate(o['cx']*MM,H-o['cy']*MM);c.rotate(-o['angle'])
    c.setFillColor(HexColor(palette['fill']));c.setFillAlpha(palette['opacity'])
    c.ellipse(-o['rx']*MM,-o['ry']*MM,o['rx']*MM,o['ry']*MM,stroke=0,fill=1)
    c.restoreState()
    t=v['title']; s1,s2=t['sizes']; ascent=pdfmetrics.getFont('Lilita').face.ascent/1000
    c.saveState();c.translate(t['x']*MM,H-t['top']*MM-ascent*s1);c.rotate(t['angle'])
    c.setFillColorRGB(1,1,1);c.setFont('Lilita',s1);c.drawString(0,0,'Growing')
    c.setFont('Lilita',s2);c.drawString(0,-t['gap']*MM,'Techniques')
    end=pdfmetrics.stringWidth('Techniques','Lilita',s2)
    c.setFillColor(HexColor('#d6ea9b'));c.circle(end+4*MM,(-t['gap']+2.5)*MM,1.7*MM,stroke=0,fill=1)
    c.restoreState();c.setFillColor(HexColor(palette['ink']))
    positions=[]
    def text(value,font,size,left,baseline,right=None):
        width=pdfmetrics.stringWidth(value,font,size)/MM
        if right is not None:left=right-width
        f=pdfmetrics.getFont(font).face
        top=baseline-f.ascent/1000*size/MM;bottom=baseline-f.descent/1000*size/MM
        for x in [left,left+width]:
            for y in [top,bottom]:
                assert inside_oval(o,x,y),(v['id'],value,x,y)
        c.setFont(font,size);c.drawString(left*MM,H-baseline*MM,value)
        positions.append({'text':value,'left_mm':left,'right_mm':left+width,'baseline_mm':baseline})
    for gi,g in enumerate(contents['groups']):
        col,row=divmod(gi,3);left,right=[(26,99),(108,180)][col];heading=[149,180.5,212][row]
        text(g['title'],'Nunito-Bold',12.5,left,heading)
        for i,e in enumerate(g['entries']):
            y=heading+7+i*5.2
            text(e['title'],'Nunito',10.8,left,y)
            text(e['pages'],'Nunito-Bold',10.8,None,y,right=right)
            assert positions[-2]['right_mm']+3<positions[-1]['left_mm']
    text('145','Folio',7.35,None,235,right=180)
    return positions

# One six-design contact sheet, followed by six full-size pages.
SW,SH=420*MM,395*MM;cell_w=126*MM;cell_h=cell_w*240/185
b=io.BytesIO();c=canvas.Canvas(b,pagesize=(SW,SH),initialFontName='Nunito',pageCompression=1)
c.setFillColor(HexColor('#FAF8F2'));c.rect(0,0,SW,SH,stroke=0,fill=1)
c.setFillColor(HexColor('#20392E'));c.setFont('Nunito-Bold',25)
c.drawString(12*MM,SH-14*MM,'Growing Techniques: layout options')
c.setFont('Nunito',11);c.drawString(12*MM,SH-21*MM,'Pale sage (colour 3), 82% opacity. Title positions and oval shapes vary; photograph and contents stay fixed.')
for j,v in enumerate(variants):
    col,row=j%3,j//3;x=(12+col*135)*MM;y=SH-26*MM-row*(cell_h+17*MM)-cell_h
    c.saveState();path=c.beginPath();path.rect(x,y,cell_w,cell_h);c.clipPath(path,stroke=0,fill=0)
    s=cell_w/(185*MM);c.translate(x-3*MM*s,y-3*MM*s);c.scale(s,s)
    draw_opener(c,v);c.restoreState()
    c.setFillColor(HexColor('#20392E'));c.setFont('Nunito-Bold',16)
    c.drawCentredString(x+cell_w/2,y-7*MM,f"{v['id']}  {v['name']}")
c.showPage();c.save();out=PdfWriter();out.add_page(PdfReader(io.BytesIO(b.getvalue())).pages[0])
checks=[]
for v in variants:
    b=io.BytesIO();c=canvas.Canvas(b,pagesize=(W,H),initialFontName='Nunito',pageCompression=1)
    positions=draw_opener(c,v);c.showPage();c.save();p=PdfReader(io.BytesIO(b.getvalue())).pages[0]
    assert p.extract_text().split()==expected
    for font in p['/Resources']['/Font'].values():
        d=font.get_object().get('/FontDescriptor');assert d and '/FontFile2' in d.get_object()
    p.trimbox=RectangleObject([3*MM,3*MM,188*MM,243*MM]);p.bleedbox=RectangleObject([0,0,W,H]);p.cropbox=p.trimbox
    out.add_page(p);out.add_outline_item(f"{v['id']} — {v['name']}",v['id'])
    checks.append({'id':v['id'],'complete_contents_and_folio':True,'all_fonts_embedded':True,'contents_inside_oval_inset_mm':3,'positions':positions})
out.add_outline_item('Six layout options',0)
out.add_metadata({'/Title':'Growing Techniques — pale sage title and oval layout options','/Author':'John Lennon','/Subject':'Standalone concept trial. One contact sheet and six full-size versions. Upscale and inspect selected artwork before printer upload.'})
out.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
pdf=HERE/'Vegetable-Guru-Growing-Techniques-Layout-Contact-Sheet.pdf';out.write(pdf)
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
subprocess.run([poppler,'-f','1','-l','1','-png','-singlefile','-scale-to','2400',str(pdf),str(HERE/'Growing-Techniques-Layout-Options-1-6')],check=True,capture_output=True)
for v in variants:
    subprocess.run([poppler,'-f',str(v['id']+1),'-l',str(v['id']+1),'-png','-singlefile','-cropbox','-scale-to','1500',str(pdf),str(R/f"option-{v['id']}")],check=True,capture_output=True)
final=PdfReader(pdf);assert len(final.pages)==7
def photo_hashes(p):
    return sorted(hashlib.sha256(x.get_object().get_data()).hexdigest() for x in p['/Resources']['/XObject'].values() if x.get_object().get('/Subtype')=='/Image')
assert all(photo_hashes(p)==photo_hashes(base) for p in final.pages)
assert all(p.extract_text().split()==expected for p in final.pages[1:])
m={'date':'2026-11-24','status':'awaiting_layout_selection','selected_photo':7,'palette':palette,'variants':variants,'checks':checks,'photo_source':str(photo_path),'photo_sha256':hashlib.sha256(photo_path.read_bytes()).hexdigest(),'all_photo_pixels_unchanged':True,'no_image_generation':True,'fixed_elements':['photo and crop','pale sage and 82% opacity','dark ink','complete contents and destinations','contents positions and font sizes','folio 145'],'pdf_pages':7,'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'production_ready':False,'book_integration':False,'upscale_gate':'Mandatory before printer upload if adopted; paid upscaling deferred.'}
(HERE/'MANIFEST.json').write_text(json.dumps(m,indent=2)+'\n')
print(json.dumps({'pdf':str(pdf),'contact_sheet':str(HERE/'Growing-Techniques-Layout-Options-1-6.png'),'variants':6,'checks':'passed','size_bytes':pdf.stat().st_size},indent=2))
