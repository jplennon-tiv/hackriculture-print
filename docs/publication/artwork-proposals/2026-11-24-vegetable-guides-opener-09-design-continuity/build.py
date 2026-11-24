"""Separate design studies, using unchanged photograph and actual ordered guides.
No book renderer, canonical data or production file is written.
Run with the bundled Python (ReportLab, pypdf, Pillow) and Poppler.
"""
from pathlib import Path
import io, json, hashlib, subprocess, copy
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader, PdfWriter, Transformation, PageObject
from pypdf.generic import RectangleObject
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
A=HERE/'assets'; OUT=HERE/'renders'; OUT.mkdir(exist_ok=True)
MM=72/25.4; W,H=191*MM,246*MM
TRIM=RectangleObject([3*MM,3*MM,188*MM,243*MM])
RUNTIME=Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies')
POPPLER=RUNTIME/'bin/override/pdftoppm'
for n in ['Lilita','Nunito','Nunito-Bold']:
    pdfmetrics.registerFont(TTFont(n,str(A/f'{n}.ttf')))
entries=json.loads((HERE/'CONTENTS.json').read_text())['entries']
for e in entries:
    assert all(ord(ch) in pdfmetrics.getFont('Nunito').face.charToGlyph for ch in e['name'])
CREAM='#fff8e9'; GREEN='#173e2c'; PANEL='#153e2a'; PALE='#d6ea9b'
READERS=[]

def txt(c,s,x,top,size,font='Lilita',colour=GREEN):
    c.setFillColor(HexColor(colour));c.setFont(font,size)
    c.drawString(x*MM,H-top*MM,s)

def title(c,mode):
    if mode=='C':
        c.setFillColor(HexColor(CREAM));c.rect(0,H-79*MM,W,79*MM,fill=1,stroke=0)
        txt(c,'PART 1',20,16,10,'Nunito-Bold')
        c.saveState();c.translate(20*MM,H-41*MM);c.rotate(3)
        c.setFillColor(HexColor(GREEN));c.setFont('Lilita',62);c.drawString(0,0,'Vegetable')
        c.setFont('Lilita',72);c.drawString(0,-24*MM,'Guides')
        end=pdfmetrics.stringWidth('Guides','Lilita',72)
        c.setFillColor(HexColor('#4b8b83'));c.circle(end+3.5*MM,-24*MM+2*MM,1.5*MM,stroke=0,fill=1)
        c.restoreState()
    elif mode=='D':
        c.saveState();c.translate(20*MM,H-39*MM);c.rotate(3)
        for text,y,size in [('Vegetable',0,65),('Guides',-25*MM,78)]:
            tw=pdfmetrics.stringWidth(text,'Lilita',size)
            c.setFillColor(HexColor(PANEL));c.roundRect(-4*MM,y-3*MM,tw+8*MM,size*.82+6*MM,2*MM,stroke=0,fill=1)
            c.setFillColor(HexColor(CREAM));c.setFont('Lilita',size);c.drawString(0,y,text)
        c.restoreState()
    else:
        ascent=pdfmetrics.getFont('Lilita').face.ascent/1000
        y=H-18*MM-ascent*72
        c.saveState()
        if mode=='A':c.translate(20*MM,y);c.rotate(3);x=0;y=0
        else:x=20*MM
        c.setFillColorRGB(1,1,1);c.setFont('Lilita',72);c.drawString(x,y,'Vegetable')
        y2=y-84*.89-1*MM
        c.setFont('Lilita',84);c.drawString(x,y2,'Guides')
        if mode=='A':
            end=pdfmetrics.stringWidth('Guides','Lilita',84)
            c.setFillColor(HexColor(PALE));c.circle(x+end+4*MM,y2+2.5*MM,1.7*MM,stroke=0,fill=1)
        c.restoreState()

def contents(c,mode):
    pale=mode in ['B','D']
    c.saveState();c.setFillColor(HexColor(CREAM if pale else PANEL));c.setFillAlpha(.95 if pale else .84)
    c.roundRect(57*MM,13*MM,142*MM,122*MM,5*MM,stroke=0,fill=1)
    c.restoreState()
    ink=GREEN if pale else '#ffffff'
    first=130 if pale else 124
    if pale:txt(c,'In this section',64,119,14,colour=ink)
    for x,chunk in zip([64,124],[entries[:22],entries[22:]]):
        for row,item in enumerate(chunk):
            y=first+4.65*row
            txt(c,item['name'],x,y,9.75,'Nunito',ink)
            c.setFont('Nunito-Bold',9.75);c.drawRightString((x+52)*MM,H-y*MM,str(item['folio']))
            assert pdfmetrics.stringWidth(item['name'],'Nunito',9.75)+pdfmetrics.stringWidth(str(item['folio']),'Nunito-Bold',9.75)+3*MM<52*MM

def make_opener(mode):
    b=io.BytesIO();c=canvas.Canvas(b,pagesize=(W,H),pageCompression=1,initialFontName='Nunito-Bold')
    photo=Image.open(A/'09-leeks-native.png');iw,ih=photo.size;s=max(W/iw,H/ih)
    c.drawImage(ImageReader(photo),(W-iw*s)/2,(H-ih*s)/2,iw*s,ih*s)
    title(c,mode);contents(c,mode)
    c.showPage();c.save();r=PdfReader(io.BytesIO(b.getvalue()));READERS.append(r)
    p=r.pages[0];p.trimbox=TRIM;p.bleedbox=RectangleObject([0,0,W,H]);return p

def guide(index,change=False):
    r=PdfReader(A/'ordered-artichoke-p8-9.pdf');READERS.append(r);p=r.pages[index]
    if change:
        b=io.BytesIO();c=canvas.Canvas(b,pagesize=(W,H),pageCompression=1,initialFontName='Lilita')
        # These bands only cover the original crop-name lettering. Category,
        # seasons, difficulty oval, original heroes and every body item remain.
        if index==0:
            x,y,width,height=9.8,11.7,81.5,19.8
            cx,cy,angle=12,25.8,3
            label_width=76
        else:
            x,y,width,height=19,14,100,14.3
            cx,cy,angle=22,25.1,0
            label_width=83
        # Screen colour sampled from the ordered CMYK proof. The token's raw
        # RGB value is visibly lighter after that proof's colour conversion.
        c.setFillColor(HexColor('#edf4ec'));c.rect(x*MM,H-(y+height)*MM,width*MM,height*MM,fill=1,stroke=0)
        c.saveState();c.translate(cx*MM,H-cy*MM);c.rotate(angle)
        s='Artichoke, Globe';size=min(28,label_width*MM/pdfmetrics.stringWidth(s,'Lilita',1))
        tw=pdfmetrics.stringWidth(s,'Lilita',size)
        c.setFillColor(HexColor('#30554b'));c.roundRect(-2*MM,-2*MM,tw+4*MM,size*.82+4*MM,1.8*MM,fill=1,stroke=0)
        c.setFillColor(HexColor(CREAM));c.setFont('Lilita',size);c.drawString(0,0,s)
        c.restoreState();c.showPage();c.save()
        over=PdfReader(io.BytesIO(b.getvalue()));READERS.append(over);p.merge_page(over.pages[0])
    return p

CONCEPTS=[
 {'code':'A','title':'A quiet family resemblance','subtitle':'Angled heading, terminal dot and rounded dark panel. Guide pages unchanged.','description':'The smallest step: borrow the guide title angle and soft panel corners while keeping the photographic drama.'},
 {'code':'B','title':'Bring the pale paper into the photograph','subtitle':'Cream contents card with green lettering. Guide pages unchanged.','description':'The pale card echoes the guides\' readable, softly rounded information panels. My preferred bridge.'},
 {'code':'C','title':'Give the opener a guide-style heading','subtitle':'Cream heading band above the full-width photograph. Guide pages unchanged.','description':'The strongest connection without editing the guides. A quieter opener, with less uninterrupted photograph.'},
 {'code':'D','title':'A shared title ribbon','subtitle':'A bolder experiment: the opener and both guide headings share a dark ribbon.','description':'Tests a small change to guide headings only. Illustrations, colour families, advice, diagrams and body layout stay in place.'}
]

proof=PdfWriter();pages=[]
for concept in CONCEPTS:
    group=[make_opener(concept['code']),guide(0,concept['code']=='D'),guide(1,concept['code']=='D')]
    pages.append(group)
    for p in group:proof.add_page(p)
    proof.add_outline_item(concept['code']+' - '+concept['title'],len(proof.pages)-3)
proof.add_metadata({'/Title':'Vegetable Guru - design continuity page proofs','/Author':'John Lennon','/Subject':'Four separate proposals. Calendar parked. Not production-ready: native photo approximately 147 ppi.'})
proof.write(HERE/'Vegetable-Guru-Continuity-Page-Proofs.pdf')

# Contact boards are comparisons across a page turn, not fictitious three-page spreads.
BW,BH=420*MM,225*MM
boards=PdfWriter()
for ci,concept in enumerate(CONCEPTS):
    b=io.BytesIO();c=canvas.Canvas(b,pagesize=(BW,BH),pageCompression=1,initialFontName='Nunito-Bold')
    c.setFillColor(HexColor('#eceee7'));c.rect(0,0,BW,BH,stroke=0,fill=1)
    c.setFillColor(HexColor(GREEN));c.setFont('Lilita',22);c.drawString(10*MM,209*MM,concept['code']+'  '+concept['title'])
    c.setFont('Nunito-Bold',9.2);c.drawString(10*MM,200.5*MM,concept['subtitle'])
    c.setFont('Nunito-Bold',8.1);c.drawString(10*MM,191.8*MM,'SECTION OPENER - PAGE 7')
    c.drawString(153*MM,191.8*MM,'TURN THE PAGE  /  OPENING GUIDE SPREAD - PAGES 8-9')
    c.setFont('Nunito-Bold',8.5);c.drawString(10*MM,14*MM,concept['description'])
    c.setFont('Nunito-Bold',7);c.setFillColor(HexColor('#5e6c62'))
    c.drawString(10*MM,7*MM,'DESIGN PROPOSAL ONLY  |  24 NOVEMBER 2026  |  Calendar set aside. Photo resolution remains below the 300 ppi production target.')
    c.save();r=PdfReader(io.BytesIO(b.getvalue()));READERS.append(r);board=r.pages[0]
    scale=122/185
    for p,x in zip(pages[ci],[10,153,276]):
        # Crop to actual trim and isolate it, so neighbouring page marks cannot leak.
        p2=copy.copy(p);p2.cropbox=TRIM;p2.trimbox=TRIM
        p2.mediabox=TRIM
        board.merge_transformed_page(p2,Transformation().translate(-3*MM,-3*MM).scale(scale).translate(x*MM,28*MM))
    boards.add_page(board)
boards.add_metadata({'/Title':'Vegetable Guru - four ways to connect the opener and guides','/Author':'John Lennon'})
boards.write(HERE/'Vegetable-Guru-Continuity-Studies.pdf')

# Standalone opener proofs, plus trimmed rendering files for faithful review.
opens=PdfWriter();trim=PdfWriter()
for group in pages:
    opens.add_page(group[0])
    p=copy.copy(group[0]);p.cropbox=TRIM;trim.add_page(p)
opens.write(HERE/'Vegetable-Guru-Continuity-Openers.pdf');trim.write(OUT/'trim-openers.pdf')
for src,prefix,scale in [(OUT/'trim-openers.pdf',OUT/'opener',1400),(HERE/'Vegetable-Guru-Continuity-Studies.pdf',OUT/'board',2200)]:
    with (OUT/'poppler.log').open('a') as log:
        subprocess.run([str(POPPLER),'-png','-cropbox','-scale-to',str(scale),str(src),str(prefix)],check=True,stderr=log)

# Assemble the existing page renders without retouching any source photograph.
images=[Image.open(OUT/f'opener-{i}.png').convert('RGB') for i in range(1,5)]
cw,ch=images[0].size; gap=50; label=84;pad=48
sheet=Image.new('RGB',(cw*2+gap+pad*2,(ch+label)*2+gap+pad*2),'#eceee7');d=ImageDraw.Draw(sheet)
f=ImageFont.truetype(str(A/'Lilita.ttf'),36);small=ImageFont.truetype(str(A/'Nunito-Bold.ttf'),21)
labels=['A  Quiet family resemblance','B  Pale contents card','C  Guide-style heading','D  Shared title ribbon']
for i,im in enumerate(images):
    x=pad+(i%2)*(cw+gap);y=pad+(i//2)*(ch+label+gap)
    d.text((x,y),labels[i],font=f,fill=GREEN)
    d.text((x,y+44),'Guide pages unchanged' if i<3 else 'Small guide-heading change - see comparison PDF',font=small,fill='#58645c')
    sheet.paste(im,(x,y+label))
sheet.save(HERE/'Vegetable-Guru-Continuity-Contact-Sheet.jpg',quality=93)

# Structural checks: all entries, all guide pairs, geometry, and font embedding.
check=PdfReader(HERE/'Vegetable-Guru-Continuity-Page-Proofs.pdf')
assert len(check.pages)==12
for n in [0,3,6,9]:
    t=check.pages[n].extract_text()
    assert all(e['name'] in t for e in entries)
    assert abs(float(check.pages[n].trimbox.width)/MM-185)<.02
    assert abs(float(check.pages[n].trimbox.height)/MM-240)<.02
assert len({hashlib.sha256(check.pages[n].get_contents().get_data()).hexdigest() for n in [0,3,6,9]})==4
base=PdfReader(A/'ordered-artichoke-p8-9.pdf')
for n in [1,4,7]:
    for j in [0,1]:assert check.pages[n+j].get_contents().get_data()==base.pages[j].get_contents().get_data()
manifest={'date':'2026-11-24','status':'Unselected design proposals; no production integration','calendar':'Parked at John\'s request',
 'opener_seed':'9A plus B with contents moved 4 mm left','guide_seed':'Exact ordered interior, physical pages 8-9; native reading-book pages 10-11 retained for editable reference',
 'concepts':CONCEPTS,'photo_pixels':[1105,1423],'effective_photo_ppi':146.93,'production_ready':False,
 'checks':{'four_distinct_opener_designs':True,'all_44_crop_names_and_folios_preserved':True,'A_B_C_guide_content_streams_unchanged':True,'D_changes_only_guide_title_bands':True,'media_mm':[191,246],'trim_mm':[185,240],'bleed_mm':3},
 'files':{str(f.relative_to(HERE)):{'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in list(A.glob('*'))+list(HERE.glob('*.pdf'))}}
(HERE/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'pages':len(check.pages),'concepts':4,'output':str(HERE),'checks':'passed'},indent=2))
