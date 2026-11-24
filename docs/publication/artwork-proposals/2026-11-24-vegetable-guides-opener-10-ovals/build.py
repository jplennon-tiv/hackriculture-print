"""Six oval layout variations on selected continuity A. Proposal files only.
Uses the existing photograph unretouched, with native type and vector shapes.
"""
from pathlib import Path
import io,json,hashlib,math,copy,subprocess
from PIL import Image,ImageDraw,ImageFont
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

HERE=Path(__file__).resolve().parent;A=HERE/'assets';R=HERE/'renders';R.mkdir(exist_ok=True)
MM=72/25.4;W,H=191*MM,246*MM;TRIM=[3*MM,3*MM,188*MM,243*MM]
POPPLER=Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm')
for name in ['Lilita','Nunito','Nunito-Bold']:pdfmetrics.registerFont(TTFont(name,str(A/f'{name}.ttf')))
entries=json.loads((HERE/'CONTENTS.json').read_text())['entries']
FOREST='#153e2a';INK='#173e2c';CREAM='#fff8e9';PALE='#d6ea9b'
TITLE_OVAL={'cx':77,'cy':39,'rx':103,'ry':46,'angle':3}
CONTENTS_OVAL={'cx':167,'cy':173,'rx':137,'ry':91,'angle':0}
VARIATIONS=[
 {'id':1,'name':'A faint title oval','title_oval':{'fill':FOREST,'alpha':.34},'contents':'panel','contents_alpha':.84,'contents_fill':FOREST,'title_ink':'#ffffff','list_ink':'#ffffff','caption':'Title oval 34% opaque; selected dark panel retained.'},
 {'id':2,'name':'A pale title oval','title_oval':{'fill':CREAM,'alpha':.82},'contents':'panel','contents_alpha':.84,'contents_fill':FOREST,'title_ink':INK,'list_ink':'#ffffff','caption':'Title oval 82% opaque; green lettering on cream.'},
 {'id':3,'name':'A dark contents oval','title_oval':None,'contents':'oval','contents_alpha':.84,'contents_fill':FOREST,'title_ink':'#ffffff','list_ink':'#ffffff','caption':'Contents oval 84% opaque; title stays open.'},
 {'id':4,'name':'A pale contents oval','title_oval':None,'contents':'oval','contents_alpha':.92,'contents_fill':CREAM,'title_ink':'#ffffff','list_ink':INK,'caption':'Contents oval 92% opaque; green list on cream.'},
 {'id':5,'name':'Two translucent green ovals','title_oval':{'fill':FOREST,'alpha':.28},'contents':'oval','contents_alpha':.76,'contents_fill':FOREST,'title_ink':'#ffffff','list_ink':'#ffffff','caption':'Title 28% / contents 76% opaque; more photo visible.'},
 {'id':6,'name':'Pale title, dark contents','title_oval':{'fill':CREAM,'alpha':.82},'contents':'oval','contents_alpha':.84,'contents_fill':FOREST,'title_ink':INK,'list_ink':'#ffffff','caption':'Cream title oval and dark green contents oval.'}
]

def oval(c,geometry,fill,alpha):
    c.saveState();c.setFillColor(HexColor(fill));c.setFillAlpha(alpha)
    c.translate(geometry['cx']*MM,H-geometry['cy']*MM);c.rotate(geometry['angle'])
    rx,ry=geometry['rx']*MM,geometry['ry']*MM
    c.ellipse(-rx,-ry,rx,ry,stroke=0,fill=1);c.restoreState()

def title(c,colour):
    asc=pdfmetrics.getFont('Lilita').face.ascent/1000
    y=H-18*MM-asc*72
    c.saveState();c.translate(20*MM,y);c.rotate(3)
    c.setFillColor(HexColor(colour));c.setFont('Lilita',72);c.drawString(0,0,'Vegetable')
    y2=-84*.89-MM;c.setFont('Lilita',84);c.drawString(0,y2,'Guides')
    end=pdfmetrics.stringWidth('Guides','Lilita',84)
    c.setFillColor(HexColor(PALE if colour=='#ffffff' else '#4b8b83'))
    c.circle(end+4*MM,y2+2.5*MM,1.7*MM,stroke=0,fill=1)
    c.restoreState()

def inside_oval(x,y,g,inset=0):
    dx=x-g['cx'];dy=g['cy']-y;a=math.radians(-g['angle'])
    xx=dx*math.cos(a)-dy*math.sin(a);yy=dx*math.sin(a)+dy*math.cos(a)
    return (xx/(g['rx']-inset))**2+(yy/(g['ry']-inset))**2

positions=[]
for x,chunk in zip([64,124],[entries[:22],entries[22:]]):
    for row,e in enumerate(chunk):
        y=124+4.65*row
        for text,font,left,right in [(e['name'],'Nunito',x,None),(str(e['folio']),'Nunito-Bold',None,x+52)]:
            width=pdfmetrics.stringWidth(text,font,9.75)/MM
            if left is None:left=right-width
            if right is None:right=left+width
            f=pdfmetrics.getFont(font).face
            top=y-f.ascent/1000*9.75/MM;bottom=y-f.descent/1000*9.75/MM
            for xx,yy in [(left,top),(right,top),(left,bottom),(right,bottom)]:
                assert inside_oval(xx,yy,CONTENTS_OVAL,3)<1,(text,xx,yy)
            positions.append({'text':text,'font':font,'baseline_mm':y,'left_mm':left,'right_mm':right,'top_mm':top,'bottom_mm':bottom})

buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(W,H),pageCompression=1,initialFontName='Nunito-Bold')
c.setTitle('Vegetable Guru - six oval variations on selected A');c.setAuthor('John Lennon')
photo=Image.open(A/'09-leeks-native.png');iw,ih=photo.size;s=max(W/iw,H/ih)
for v in VARIATIONS:
    c.drawImage(ImageReader(photo),(W-iw*s)/2,(H-ih*s)/2,iw*s,ih*s)
    if v['title_oval']:oval(c,TITLE_OVAL,**v['title_oval'])
    if v['contents']=='oval':oval(c,CONTENTS_OVAL,v['contents_fill'],v['contents_alpha'])
    else:
        c.saveState();c.setFillColor(HexColor(v['contents_fill']));c.setFillAlpha(v['contents_alpha'])
        c.roundRect(57*MM,13*MM,142*MM,122*MM,5*MM,stroke=0,fill=1);c.restoreState()
    title(c,v['title_ink'])
    c.setFillColor(HexColor(v['list_ink']))
    for pos in positions:
        c.setFont(pos['font'],9.75);c.drawString(pos['left_mm']*MM,H-pos['baseline_mm']*MM,pos['text'])
    c.showPage()
c.save()
reader=PdfReader(io.BytesIO(buf.getvalue()));writer=PdfWriter();trim=PdfWriter()
for page,v in zip(reader.pages,VARIATIONS):
    page.trimbox=RectangleObject(TRIM);page.bleedbox=RectangleObject([0,0,W,H]);writer.add_page(page)
    writer.add_outline_item(str(v['id'])+' - '+v['name'],v['id']-1)
    cropped=copy.copy(page);cropped.cropbox=RectangleObject(TRIM);trim.add_page(cropped)
writer.add_metadata({'/Title':'Vegetable Guru - six oval studies','/Author':'John Lennon','/Subject':'Separate design proposals. Selected A typography, 44 contents entries. Native photograph approximately 147 ppi, not yet production-ready.'})
writer.compress_identical_objects();trim.compress_identical_objects()
pdf=HERE/'Vegetable-Guru-Oval-Studies.pdf';writer.write(pdf);trim.write(R/'trim-preview.pdf')
with (R/'poppler.log').open('w') as log:
    subprocess.run([str(POPPLER),'-png','-cropbox','-scale-to','1500',str(R/'trim-preview.pdf'),str(R/'oval')],check=True,stderr=log)

# Contact sheet is a layout of the unretouched PDF renders.
cw,ch=600,round(600*240/185);pad=32;gx=24;gy=34;label=87
sheet=Image.new('RGB',(pad*2+3*cw+2*gx,pad*2+2*(ch+label)+gy),'#eef0e9');d=ImageDraw.Draw(sheet)
large=ImageFont.truetype(str(A/'Lilita.ttf'),24);small=ImageFont.truetype(str(A/'Nunito-Bold.ttf'),15)
for i,v in enumerate(VARIATIONS):
    x=pad+(i%3)*(cw+gx);y=pad+(i//3)*(ch+label+gy)
    d.text((x,y),str(v['id'])+'  '+v['name'],font=large,fill=INK)
    d.text((x,y+34),v['caption'],font=small,fill='#4e6255')
    d.text((x,y+57),'Same title angle, type size and complete contents.',font=small,fill='#4e6255')
    im=Image.open(R/f'oval-{i+1}.png').convert('RGB');im.thumbnail((cw,ch),Image.Resampling.LANCZOS)
    sheet.paste(im,(x,y+label))
sheet.save(HERE/'Vegetable-Guru-Oval-Contact-Sheet.jpg',quality=94)

output=PdfReader(pdf);assert len(output.pages)==6
assert len({hashlib.sha256(p.get_contents().get_data()).hexdigest() for p in output.pages})==6
expected=['Vegetable','Guides']+[p['text'] for p in positions]
for page in output.pages:
    assert page.extract_text().splitlines()==expected,page.extract_text().splitlines()[:10]
    assert abs(float(page.trimbox.width)/MM-185)<.01 and abs(float(page.trimbox.height)/MM-240)<.01
    for f in page['/Resources']['/Font'].values():
        fd=f.get_object().get('/FontDescriptor');assert fd and '/FontFile2' in fd.get_object()
    imageobjects=[v.get_object() for v in page['/Resources']['/XObject'].values() if v.get_object().get('/Subtype')=='/Image']
    assert len(imageobjects)==1 and (imageobjects[0]['/Width'],imageobjects[0]['/Height'])==(1105,1423)
assert hashlib.sha256((A/'09-leeks-native.png').read_bytes()).hexdigest()=='9bbface5b946c7e128a645f8ff48e8e619c31510ee45bd84a1dcc71354ee5231'
manifest={'date':'2026-11-24','status':'Six unselected oval proposals on John-selected continuity A','selected_parent':'../2026-11-24-vegetable-guides-opener-09-design-continuity/SELECTION.json',
 'source_photo':'assets/09-leeks-native.png','source_title':'assets/selected-A.pdf','visual_shape_reference':'assets/troubles-reference-p98.pdf','calendar':'parked','guide_pages':'unchanged',
 'title_angle_degrees':3,'title_sizes_pt':[72,84],'contents_size_pt':9.75,'contents_position':'identical to selected A; first baseline124mm, columns64/124mm from media left',
 'title_oval':TITLE_OVAL,'contents_oval':CONTENTS_OVAL,'variations':VARIATIONS,'media_mm':[191,246],'trim_mm':[185,240],'bleed_mm':3,
 'native_photo_pixels':[1105,1423],'effective_ppi':146.93,'production_ready':False,'photo_retouched':False,
 'checks':{'six_distinct_pages':True,'exact_all_44_contents_names_and_folios':True,'fonts_embedded':True,'contents_text_inside_oval_with_3mm_inset':True,'original_source_photo_hash_verified':True},
 'files':{str(f.relative_to(HERE)):{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in [pdf,HERE/'Vegetable-Guru-Oval-Contact-Sheet.jpg',*A.glob('*')]}}
(HERE/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'pdf':str(pdf),'pages':6,'bytes':pdf.stat().st_size,'content_checks':'passed','photo_ppi':146.93},indent=2))
