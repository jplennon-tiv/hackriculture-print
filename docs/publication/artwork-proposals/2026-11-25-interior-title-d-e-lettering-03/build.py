"""D/E title-page lettering proof, native type and independent PDF layers."""
from pathlib import Path
import json, math
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject,NameObject,ArrayObject,TextStringObject,FloatObject,NumberObject,BooleanObject,DecodedStreamObject

HERE=Path(__file__).resolve().parent
PROJECT=HERE.parents[3]
WORKSPACE=PROJECT.parent
FONTS=HERE.parent/'2026-11-24-section-opener-layered-masters-01/Fonts-Source'
for alias,file in [('Lilita','Lilita.ttf'),('Nunito','Nunito.ttf'),('NunitoBold','Nunito-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(alias,str(FONTS/file)))
MM=72/25.4;W=185*MM;H=240*MM
SOURCE_D=WORKSPACE/'generated_images/exec-2a5639c7-e18a-4e6e-8de3-c217246bb1cd.png'
SOURCE_E=WORKSPACE/'generated_images/exec-9e9d9892-b383-4fb9-9e05-2cae778075f3.png'
E_RECT=[450,603,873,1143]
copy=json.loads((PROJECT/'docs/publication/title-copyright-trials/APPROVAL.json').read_text())['text']
DEST=HERE/'Vegetable-Guru-Interior-Title-D-and-E-Lettering.pdf'
TEMP=HERE/'unlayered-working.pdf'
c=canvas.Canvas(str(TEMP),pagesize=(420*MM,297*MM),pageCompression=1)
c.setTitle('The Vegetable Guru - Interior title D and E lettering trial')
c.setAuthor('John Lennon')
checks=[]

def layer(key):c._code.append('/OC /'+key+' BDC')
def end():c._code.append('EMC')

def text(s,x,top,size,font):
    c.setFont(font,size);c.setFillColor(white)
    y=H-top*MM-pdfmetrics.getAscent(font,size)
    c.drawString(x*MM,y,s)
    right=x*MM+pdfmetrics.stringWidth(s,font,size)
    assert x>=17 and right<=177*MM,(s,right/MM)
    checks.append({'text':s,'font':font,'size_pt':size,'left_mm':x,'top_mm':top,'right_mm':right/MM})

def photo(which):
    layer('BG');c.saveState();p=c.beginPath();p.rect(0,0,W,H);c.clipPath(p,stroke=0,fill=0)
    if which=='D':
        with Image.open(SOURCE_D) as im:iw,ih=im.size
        scale=max(W/iw,H/ih);c.drawImage(str(SOURCE_D),(W-iw*scale)/2,(H-ih*scale)/2,iw*scale,ih*scale)
    else:
        # Clip the selected E tile directly from the original contact sheet.
        # No crop/retouch/resampling is written back to the photographic source.
        with Image.open(SOURCE_E) as im:iw,ih=im.size
        l,t,r,b=E_RECT;scale=max(W/(r-l),H/(b-t))
        ox=(W-(r-l)*scale)/2;oy=(H-(b-t)*scale)/2
        c.drawImage(str(SOURCE_E),ox-l*scale,oy-(ih-b)*scale,iw*scale,ih*scale)
    c.restoreState();end()

def scrim():
    layer('SHADE');c.saveState();c.setFillColor(HexColor('#102B1C'))
    # Smooth native PDF gradient mask; no rectangular banding or photo changes.
    c._code.append('/TextSoftMask gs')
    c.rect(0,0,W,H,fill=1,stroke=0)
    c.restoreState();end()

def oval():
    layer('OVAL');c.saveState();c.setFillColor(HexColor('#173E2C'));c.setFillAlpha(.82)
    c.ellipse(18*MM,4*MM,176*MM,47*MM,fill=1,stroke=0)
    c.restoreState();end()

def lettering():
    layer('TITLE')
    text(copy['title'][0],17,18,24.75,'Lilita')
    text(copy['title'][1],17,31,58.5,'Lilita')
    text(copy['title'][2],17,54,82.5,'Lilita')
    text(copy['subtitle'][0],17,92,15.75,'NunitoBold')
    text(copy['subtitle'][1],17,100,15.75,'NunitoBold');end()
    layer('AUTHOR')
    text(copy['author'],17,119,12.75,'NunitoBold');end()
    layer('COPYRIGHT')
    width=pdfmetrics.stringWidth(copy['measurementLabel'],'Nunito',9)/MM
    text(copy['measurementLabel'],97-width/2,199,9,'Nunito')
    for s,top in zip(copy['copyrightLines'],[207,213,217,225]):
        width=pdfmetrics.stringWidth(s,'Nunito',8.25)/MM
        text(s,97-width/2,top,8.25,'Nunito')
    end()

def page(which):
    c.saveState();photo(which);scrim();oval();lettering();c.restoreState()

# Side-by-side comparison at actual trim size on A3 landscape.
c.setFillColor(HexColor('#F7F4EA'));c.rect(0,0,420*MM,297*MM,fill=1,stroke=0)
c.setFillColor(HexColor('#173E2C'));c.setFont('Lilita',22)
c.drawString(18*MM,284*MM,'Interior title: D and E')
c.setFont('Nunito',9);c.drawString(18*MM,277*MM,'White title, subtitle and author. Fine print in a translucent oval. Same layout on both backgrounds.')
for which,x,label in [('D',18,'D  |  Camera panned left; John on the right'),('E',217,'E  |  Existing courgette-garden composition')]:
    c.setFillColor(HexColor('#173E2C'));c.setFont('NunitoBold',10);c.drawString(x*MM,267*MM,label)
    c.saveState();c.translate(x*MM,23*MM);page(which);c.restoreState()
c.setFillColor(HexColor('#5C675E'));c.setFont('Nunito',8)
c.drawString(18*MM,14*MM,'25 November 2026  |  Lettering proof: E uses its original thumbnail. Background resolution still to be prepared for print.')
c.showPage()
for which in ['D','E']:
    c.setPageSize((W,H));page(which);c.showPage()
c.save()

reader=PdfReader(TEMP);writer=PdfWriter();writer.append(reader)
names={'BG':'Background photograph','SHADE':'Text contrast gradient','OVAL':'Fine print oval - vector','TITLE':'Title and subtitle - native fonts','AUTHOR':'Author - native fonts','COPYRIGHT':'Edition and copyright - native fonts'}
refs={}
for key,name in names.items():
    refs[key]=writer._add_object(DictionaryObject({NameObject('/Type'):NameObject('/OCG'),NameObject('/Name'):TextStringObject(name)}))

def arr(values):return ArrayObject([FloatObject(x) for x in values])
fn=DictionaryObject({NameObject('/FunctionType'):NumberObject(2),NameObject('/Domain'):arr([0,1]),NameObject('/C0'):arr([.58]),NameObject('/C1'):arr([0]),NameObject('/N'):FloatObject(1)})
shading=DictionaryObject({NameObject('/ShadingType'):NumberObject(2),NameObject('/ColorSpace'):NameObject('/DeviceGray'),NameObject('/Coords'):arr([0,H,130*MM,H-120*MM]),NameObject('/Function'):fn,NameObject('/Extend'):ArrayObject([BooleanObject(True),BooleanObject(True)])})
mask=DecodedStreamObject();mask.set_data(b'/AlphaShade sh\n')
mask.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/BBox'):arr([0,0,W,H]),NameObject('/Resources'):DictionaryObject({NameObject('/Shading'):DictionaryObject({NameObject('/AlphaShade'):writer._add_object(shading)})}),NameObject('/Group'):DictionaryObject({NameObject('/S'):NameObject('/Transparency'),NameObject('/CS'):NameObject('/DeviceGray'),NameObject('/I'):BooleanObject(True)})})
state=DictionaryObject({NameObject('/Type'):NameObject('/ExtGState'),NameObject('/SMask'):DictionaryObject({NameObject('/S'):NameObject('/Luminosity'),NameObject('/G'):writer._add_object(mask),NameObject('/BC'):arr([0])})})
state_ref=writer._add_object(state)
for p in writer.pages:
    p['/Resources'][NameObject('/Properties')]=DictionaryObject({NameObject('/'+k):v for k,v in refs.items()})
    if '/ExtGState' not in p['/Resources']:p['/Resources'][NameObject('/ExtGState')]=DictionaryObject()
    p['/Resources']['/ExtGState'][NameObject('/TextSoftMask')]=state_ref
writer._root_object[NameObject('/OCProperties')]=DictionaryObject({
    NameObject('/OCGs'):ArrayObject(list(refs.values())),
    NameObject('/D'):DictionaryObject({NameObject('/Order'):ArrayObject(list(refs.values())),NameObject('/ON'):ArrayObject(list(refs.values()))})})
writer.add_metadata({'/Title':'The Vegetable Guru - Interior title D and E lettering trial','/Author':'John Lennon','/Subject':'A3 comparison followed by two 185 x 240 mm trial pages. Six independent layers; native font lettering and translucent fine-print oval.'})
with open(DEST,'wb') as f:writer.write(f)
TEMP.unlink()
r=PdfReader(DEST);assert len(r.pages)==3
for p in r.pages[1:]:
    plain=' '.join(p.extract_text().split())
    for required in ['The Vegetable Guru','Your at-a-glance growing companion','John Lennon','Traditional measurements edition',*copy['copyrightLines']]:
        assert ' '.join(required.split()) in plain,required
    assert abs(float(p.mediabox.width)-W)<.01 and abs(float(p.mediabox.height)-H)<.01
    assert len(p['/Resources']['/Properties'])==6
(HERE/'LAYOUT.json').write_text(json.dumps({'date':'2026-11-25','status':'D/E lettering trials awaiting review','trim_mm':[185,240],'pdf_pages':3,'copy_source':'docs/publication/title-copyright-trials/APPROVAL.json, checked against current reading book title page','copy':copy,'D_background':str(SOURCE_D),'E_background':str(SOURCE_E),'E_clip_pixels':E_RECT,'native_type_preserved':True,'layers':names,'same_type_positions_on_D_and_E':True,'fine_print_oval':{'bounds_mm':[18,193,176,236],'colour':'#173E2C','opacity':.82},'text_geometry':checks[:11],'deferred_fix':'D wheelbarrow missing loop of frame in front of wheel. John explicitly requested no correction yet.','production_changed':False,'print_resolution_pending':True},indent=2)+'\n')
print(DEST,DEST.stat().st_size,'bytes; native copy, layers and page geometry checked')
