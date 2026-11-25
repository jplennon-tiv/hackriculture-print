"""Original-camera title-page seed study; six uncropped frames per sheet."""
from pathlib import Path
from io import BytesIO
import json, textwrap, hashlib
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parent
FONTS = ROOT.parent / '2026-11-24-section-opener-layered-masters-01/Fonts-Source'
for alias, file in [('Title','Lilita.ttf'),('Body','Nunito.ttf'),('Bold','Nunito-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(alias, str(FONTS/file)))
rows = json.loads((ROOT/'SELECTION.json').read_text())
OUT = ROOT/'Vegetable-Guru-Interior-Title-Video-Contact-Sheets.pdf'
W,H = A4
ink = HexColor('#193F30'); muted = HexColor('#5C675E'); paper = HexColor('#F7F4EA')
c = canvas.Canvas(str(OUT),pagesize=A4,pageCompression=1)
c.setTitle('The Vegetable Guru - Interior title image seeds - 25 November 2026')
c.setAuthor('John Lennon')

def txt(x,y,s,size=9,font='Body',colour=ink):
    c.setFillColor(colour);c.setFont(font,size);c.drawString(x,y,s)

def wrapped(s,width,font='Body',size=8):
    lines=[];line=''
    for word in s.split():
        test=(line+' '+word).strip()
        if pdfmetrics.stringWidth(test,font,size)>width and line:
            lines.append(line);line=word
        else:line=test
    if line:lines.append(line)
    return lines

def timecode(sec):
    return f'{int(sec//60):02}:{sec%60:06.3f}'

def base(title,subtitle,page):
    c.setFillColor(paper);c.rect(0,0,W,H,fill=1,stroke=0)
    txt(28,H-32,'THE VEGETABLE GURU  /  INTERIOR TITLE IMAGE STUDY',8,'Bold')
    txt(28,H-62,title,25,'Title')
    txt(28,H-81,subtitle,9)
    c.setStrokeColor(HexColor('#C8D1C4'));c.line(28,33,W-28,33)
    txt(28,20,'25 November 2026  |  Original video frames  |  Trial image selection',7.5,colour=muted)
    c.setFont('Body',7.5);c.drawRightString(W-28,20,str(page))

headers=[
 ('1-6  |  In the home garden','You among the plants: greenhouse harvests, summer beds and watering.'),
 ('7-12  |  Working in the garden','Wider working scenes: supports, paths, planting and preparing beds.'),
 ('13-18  |  Garden setting seeds','These six have no actor: possible settings for a later composition with you.')]
checks=[]
for sheet,(heading,sub) in enumerate(headers):
    base(heading,sub,sheet+1)
    cw=(W-72)/2;ih=cw*9/16
    for i,r in enumerate(rows[sheet*6:(sheet+1)*6]):
        x=28+(i%2)*(cw+16);top=H-105-(i//2)*223
        with Image.open(ROOT/r['frame_file']) as im:
            assert im.size==(3840,2160),(r['number'],im.size)
            preview=im.convert('RGB');preview.thumbnail((1920,1080),Image.Resampling.LANCZOS)
            b=BytesIO();preview.save(b,format='JPEG',quality=88,subsampling=0)
            b.seek(0);c.drawImage(ImageReader(b),x,top-ih,width=cw,height=ih)
        txt(x,top-ih-16,f"{r['number']:02}  {r['title']}",10,'Bold')
        txt(x,top-ih-31,f"{r['setting']}  |  {timecode(r['seek_seconds'])}",8,colour=muted)
        filename=Path(r['source']).name
        txt(x,top-ih-44,filename,7.15,colour=muted)
        for j,line in enumerate(wrapped(r['note'],cw,size=8)[:2]):
            txt(x,top-ih-59-j*10,line,8)
        checks.append({'number':r['number'],'native_dimensions':[3840,2160],
                       'sha256':hashlib.sha256((ROOT/r['frame_file']).read_bytes()).hexdigest()})
    c.showPage()

for sheet in range(2):
    base('Source reference '+str(sheet+1),
         'Exact original clips and seek times. Frames are unretouched and uncropped.',4+sheet)
    for i,r in enumerate(rows[sheet*9:(sheet+1)*9]):
        y=H-111-i*75
        txt(28,y,f"{r['number']:02}  {r['title']}",10,'Bold')
        p=Path(r['source']);parts=p.parts
        if 'Movies' in parts:folder='/'.join(parts[parts.index('Movies')+1:-1])
        else:folder=str(p.parent)
        txt(28,y-14,folder,8,colour=muted)
        txt(28,y-27,f"{p.name}  |  {timecode(r['seek_seconds'])}  |  3840 x 2160",8)
        for j,line in enumerate(wrapped(r['note'],W-56,size=8)):
            txt(28,y-41-j*10,line,8)
    c.showPage()
c.save()
(ROOT/'CHECKS.json').write_text(json.dumps({'frames':checks,'pages':5,'images_per_sheet':6,
  'source_media_modified':False,'image_generation':False,'paid_upscaling':False,
  'contact_sheet_embedded_dimensions':[1920,1080],
  'portrait_crop':'Not yet selected. Review after image choice.',
  'print_gate':'Upscale adopted background independently, verify >=300 ppi at final placement and inspect detail before printer upload.',
  'production_changed':False},indent=2)+'\n')
print(OUT,OUT.stat().st_size)
