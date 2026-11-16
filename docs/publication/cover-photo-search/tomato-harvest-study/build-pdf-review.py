"""Portable, fully embedded PDF review; retained images are read-only inputs."""
from pathlib import Path
import io, json
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

R = Path(__file__).resolve().parent
records = json.loads((R/'FRAMES.json').read_text())['candidates']
pdfmetrics.registerFont(TTFont('Review', '/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('ReviewBold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
W,H=842,595
INK,PAPER,MUTED,ACCENT='#173e2c','#fff8e9','#526158','#a44007'
c=canvas.Canvas(str(R/'Tomato-harvest-review.pdf'),pagesize=(W,H),pageCompression=1)
c.setTitle('The Vegetable Guru - tomato harvest frame review')
c.setAuthor('Cover research for John Lennon')
def para(text,x,top,width,size=11,bold=False,colour=INK):
    p=Paragraph(text,ParagraphStyle('review',fontName='ReviewBold' if bold else 'Review',fontSize=size,leading=size*1.35,textColor=HexColor(colour)))
    _,height=p.wrap(width,1000); p.drawOn(c,x,top-height); return top-height
def photo(path,x,top,width,height):
    im=Image.open(path).convert('RGB'); im.thumbnail((1200,1000))
    b=io.BytesIO(); im.save(b,format='JPEG',quality=86); b.seek(0)
    scale=min(width/im.width,height/im.height); dw,dh=im.width*scale,im.height*scale
    c.drawImage(ImageReader(b),x+(width-dw)/2,top-dh,dw,dh)
def page(n,title,subtitle):
    c.setFillColor(HexColor(PAPER)); c.rect(0,0,W,H,stroke=0,fill=1)
    para('THE VEGETABLE GURU  /  TOMATO HARVEST FRAME REVIEW',30,H-22,780,9,True,ACCENT)
    para(title,30,H-46,782,25,True)
    para(subtitle,30,H-82,782,10,False,MUTED)
    c.setStrokeColor(HexColor('#ccd5c4'));c.line(30,35,812,35)
    para('11 November 2026 | Review candidates only | Images embedded in this PDF',30,25,735,8,False,MUTED)
    para(str(n),790,25,20,8,False,MUTED)

page(1,'Three promising portrait frames','Same 185:240 crop proportions. T05 is the recommended starting point; no cover image is approved.')
for n,r in enumerate(records[:3]):
    x=30+n*267
    photo(R/r['portrait_preview'],x,480,248,322)
    y=para(r['id']+' - '+r['title'],x,148,248,12,True)
    para(f"5:{r['playback_seconds']-300:06.3f}",x,y-5,248,10,False,ACCENT)
para('T05 brings the harvest towards the reader. The plants frame the subject well, but a separate cream title area would give the lettering room above the photograph.',30,89,780,11)
c.showPage()
for i,r in enumerate(records,2):
    m=int(r['playback_seconds']//60); sec=r['playback_seconds']%60
    page(i,r['id']+' - '+r['title'],f'Player time {m}:{sec:06.3f} | Full landscape frame at left; portrait crop at right')
    photo(R/r['preview'],30,480,503,283)
    photo(R/r['portrait_preview'],563,480,249,323)
    y=para(r['strength'],30,177,503,12,True)
    para(r['limitation'],30,y-12,503,11,False,MUTED)
    para('Captured source: 3840 x 2160 px',563,139,249,10,True)
    para('YouTube 4K stream, unretouched. PDF images are reduced for convenient review; the native PNGs remain intact.',563,119,249,9,False,MUTED)
    para('Original source: Garden Tomato Surplus? Make Passata!',30,65,780,9,False,MUTED)
    c.linkURL('https://www.youtube.com/watch?v=sIUbl3cKZsQ&t='+str(int(r['playback_seconds']))+'s',(30,49,480,69),relative=0)
    c.showPage()
c.save()
print(R/'Tomato-harvest-review.pdf')
