"""Source photographs and indicative crops, not a new cover or artwork approval."""
from pathlib import Path
import hashlib
import json
import shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

HERE = Path(__file__).resolve().parent
SOURCES = HERE / 'sources'
SOURCES.mkdir(exist_ok=True)
ITEMS = [
    dict(id='01', name='Horizontal fruit on the plant', input='pollinator',
         filename='01-horizontal-fruit-Pollinator.jpg', author='Pollinator',
         page='https://commons.wikimedia.org/wiki/File:Zuchinni_1107.jpg',
         image_url='https://upload.wikimedia.org/wikipedia/commons/2/2c/Zuchinni_1107.jpg',
         licence='CC BY 2.5', licence_url='https://creativecommons.org/licenses/by/2.5/',
         crop=[0,60,773,294], verdict='Recommended starting point',
         strengths='One unmistakeable courgette runs across the picture. The surrounding stems and irregular leaves give us a natural arrangement; the small yellow flower is secondary.',
         drawing='Keep the long fruit and a few framing leaves. Omit soil, damaged leaf detail and most crossing stalks. Use cream behind the drawing, with one restrained leaf overflow. Preserve the generous gap above the title.'),
    dict(id='02', name='Two overlapping fruits', input='pexels',
         filename='02-overlapping-fruits-Thomas-Parker.jpg', author='Thomas Parker / Pexels',
         page='https://www.pexels.com/photo/fresh-zucchini-growing-in-a-lush-garden-patch-37521727/',
         image_url='https://images.pexels.com/photos/37521727/pexels-photo-37521727/free-photo-of-fresh-zucchini-growing-in-a-lush-garden-patch.jpeg?auto=compress&dpr=1&h=750&w=1260',
         licence='Pexels License', licence_url='https://www.pexels.com/license/',
         crop=[120,315,900,551], verdict='Alternative: a livelier arrangement',
         strengths='The two different fruit sizes and crossing angles offer more movement and depth. This is a useful alternative if the single-fruit composition feels too quiet.',
         drawing='Keep both fruits and their natural overlap. Omit the large upper blossom and simplify the dense foliage; otherwise it risks repeating the flower-led cover problem. The crop marks the useful fruit area, not a finished photograph strip.'),
]

GREEN=HexColor('#214734'); CREAM=HexColor('#fcf9ed'); GREY=HexColor('#59615a')
BODY=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=14,textColor=GREEN)
SMALL=ParagraphStyle('small',fontName='Helvetica',fontSize=8,leading=11,textColor=GREY)

def paragraph(c,text,x,y,w,style=BODY):
    p=Paragraph(text,style); _,h=p.wrap(w,200);p.drawOn(c,x,y-h);return y-h

def contain(c,path,x,y,w,h):
    iw,ih=Image.open(path).size
    scale=min(w/iw,h/ih); dw,dh=iw*scale,ih*scale
    dx=x+(w-dw)/2;dy=y+(h-dh)/2
    c.drawImage(str(path),dx,dy,dw,dh)
    return dx,dy,dw,dh,scale

def clipped_crop(c,path,box,x,y,w,h):
    iw,ih=Image.open(path).size; x0,y0,x1,y1=box
    scale=w/(x1-x0)
    c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0)
    c.drawImage(str(path),x-x0*scale,y+h-(ih-y0)*scale,iw*scale,ih*scale)
    c.restoreState()

out=HERE/'Courgette-source-options.pdf'
c=canvas.Canvas(str(out),pagesize=(595.276,841.89),pageCompression=1)
c.setTitle('Courgette source options - The Vegetable Guru')
c.setAuthor('The Vegetable Guru - source review')
for item in ITEMS:
    target=SOURCES/item['filename']
    if not target.exists():shutil.copyfile(Path('/tmp/courgette-online-scout')/(item['input']+'.jpg'),target)
    item['local_file']='sources/'+item['filename']
    item['dimensions']=list(Image.open(target).size)
    item['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
    c.setFillColor(CREAM);c.rect(0,0,595.276,841.89,stroke=0,fill=1)
    c.setFillColor(GREEN);c.setFont('Helvetica-Bold',20)
    c.drawString(36,804,f"{item['id']}  {item['name']}")
    c.setFont('Helvetica',11);c.drawString(36,782,item['verdict'])
    dx,dy,dw,dh,s=contain(c,target,36,425,523,338)
    x0,y0,x1,y1=item['crop']
    c.setStrokeColor(HexColor('#eeb449'));c.setLineWidth(1.3)
    c.rect(dx+x0*s,dy+dh-y1*s,(x1-x0)*s,(y1-y0)*s,fill=0,stroke=1)
    c.setFillColor(GREY);c.setFont('Helvetica',8)
    c.drawString(36,408,'Original photograph above; outlined area enlarged below at approximately 3.3:1.')
    clipped_crop(c,target,item['crop'],36,239,523,158.24)
    y=paragraph(c,item['strengths'],36,221,523)
    y=paragraph(c,'<b>For the drawing:</b> '+item['drawing'],36,y-9,523)
    c.setStrokeColor(HexColor('#d6dccf'));c.setLineWidth(.5);c.line(36,98,559,98)
    paragraph(c,f"Photo: {item['author']}. {item['licence']}. The photographs are unchanged; only the indicated crops are shown separately.",36,87,523,SMALL)
    c.setFillColor(GREEN);c.setFont('Helvetica-Bold',8)
    c.drawString(36,47,'Open original source');c.linkURL(item['page'],(36,44,128,57),relative=0)
    c.drawString(149,47,'Licence details');c.linkURL(item['licence_url'],(149,44,225,57),relative=0)
    c.setFont('Helvetica',7);c.setFillColor(GREY)
    c.drawString(36,27,'16 November 2026  |  Source study only; no new cover artwork or approval.')
    c.showPage()
c.save()
(HERE/'SOURCES.json').write_text(json.dumps(dict(date='2026-11-16',status='Proposed source photographs; no source selected by John',recommended='01',pdf=out.name,candidates=ITEMS,reviewed_but_not_shortlisted=[
    {'source':'Anton Pree - Zucchini Plant (42586100)','reason':'Flower buds rather than recognisable fruit.'},
    {'source':'Stuart Halliday - Cucurbita pepo1','reason':'Kitchen board, knife and sliced fruit read as cooking rather than growing.'},
    {'source':'Kolforn - 2022-08-09 Forming fruit, Trimingham (2)','reason':'Round form is less immediately recognisable as a courgette; distracting ground.'},
    {'source':'Kolforn - 2020-07-20 Courgette plant, Trimingham','reason':'Clear fruit, but strongly vertical with many stems; weak shallow-strip fit.'},
    {'source':'Food Gardening Network - Zucchini plant growing in the ground','reason':'Good fruit but vertical and crowded with stems and nasturtium foliage; reuse terms not established.'},
    {'source':'Ginabovara - Zucchini plant with new fruit and flower','reason':'Fruit is small relative to pale stems and unrelated pink flowers.'}
],unresolved=[{'source':'Karolina Grabowska / Kaboompics - Young Zucchini Growing On Garden Plant','reason':'Page read; image could not be retrieved, so not visually assessed.'}],scope='Online sources only. No local-video search, generated artwork or cover changes.'),indent=2)+'\n')
print(out)
