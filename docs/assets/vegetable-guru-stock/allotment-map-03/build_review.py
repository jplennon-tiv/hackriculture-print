"""Rebuild the review from the same half-size ground grid used in the Blender scene."""
from io import BytesIO
from pathlib import Path
import sys
from PIL import Image,ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from layout import OUT,P,patches,paths,edges,photo,SHED_RECT,NEIGHBOUR_RECT,HOOPS,CROP_ROWS

for name,file in [('Body','NotoSans-Regular.ttf'),('Bold','NotoSans-Bold.ttf'),('Serif','NotoSerif-Regular.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(P/'fonts'/file)))
W,H=880,622
c=canvas.Canvas(str(OUT/'Johns-Allotment-Working-Map-03.pdf'),pagesize=(W,H),pageCompression=1)
c.setTitle('John’s allotment · Working Map 03')
paper='#faf7ef'; ink='#213b33'; muted='#51675e'; rule='#aab7a1'
obs='#00605b'; unc='#b64915'
def colour(v): return colors.HexColor(v)
def text(x,y,s,size=11,font='Body',fill=ink):
    c.setFillColor(colour(fill));c.setFont(font,size);c.drawString(x,y,s)
def para(x,y,s,width,size=10,leading=15):
    for ln in simpleSplit(s,'Body',size,width):
        text(x,y,ln,size);y-=leading
    return y
def head(title,sub,num):
    c.setFillColor(colour(paper));c.rect(0,0,W,H,fill=1,stroke=0)
    text(29,H-27,'THE VEGETABLE GURU    /    PHOTOGRAPHIC LOCATION REFERENCE',9,'Bold',muted)
    text(28,H-68,title,30,'Serif')
    text(30,H-92,sub,11)
    c.setLineWidth(.65);c.setStrokeColor(colour(rule));c.line(29,28,W-29,28)
    text(29,13,'JOHN’S ALLOTMENT     /     23 MARCH 2026     /     WORKING MAP 03',8,'Bold',muted)
    c.setFont('Body',9);c.drawRightString(W-29,13,f'For John’s review    ·    {num} / 6')
def pic(f,x,y,w,h):
    im=ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    im.thumbnail((1600,1600))
    sw=min(w/im.width,h/im.height);iw,ih=im.width*sw,im.height*sw
    stream=BytesIO();im.save(stream,'JPEG',quality=88);stream.seek(0)
    c.drawImage(ImageReader(stream),x+(w-iw)/2,y+(h-ih)/2,iw,ih)
def line(points,col,width=1,dash=None):
    c.setStrokeColor(colour(col));c.setLineWidth(width);c.setLineCap(1);c.setLineJoin(1);c.setDash(dash or [])
    p=c.beginPath();p.moveTo(*points[0])
    for pt in points[1:]:p.lineTo(*pt)
    c.drawPath(p);c.setDash([])
def shape(points,col,stroke=None):
    p=c.beginPath();p.moveTo(*points[0])
    for pt in points[1:]:p.lineTo(*pt)
    p.close();c.setFillColor(colour(col));c.setStrokeColor(colour(stroke or col));c.setLineWidth(.5);c.drawPath(p,fill=1,stroke=int(bool(stroke)))
def badge(x,y,v):
    c.setFillColor(colour(ink));c.circle(x,y,6.2,fill=1,stroke=0)
    c.setFillColor(colors.white);c.setFont('Bold',7);c.drawCentredString(x,y-2.4,str(v))
def plan(x,top,s,base=False,numbers=True):
    # The photo, vectors and scale bar all use the identical grid.
    def xy(u,v): return (x+u*s,top-v*s)
    def scaled(points):return [xy(*p) for p in points]
    if base:
        pic(OUT/'ground-mosaic.jpg',x,top-1150*s,575*s,1150*s)
    else:
        fills=dict(grass='#c6d2a6',soil='#ab8d73',paving='#d8d0b9',cover='#5d6765',fleece='#e6e4d6')
        for n,t,pts in patches:shape(scaled(pts),fills[t])
        for (u,v,r,b),fill,outline in [(SHED_RECT,'#8ebba1','#426a53'),(NEIGHBOUR_RECT,'#9d795e',None)]:
            shape(scaled([(u,v),(r,v),(r,b),(u,b)]),fill,outline)
        for left,right,v in CROP_ROWS:
            c.setFillColor(colour('#5b754e'))
            for i in range(12):c.circle(*xy(left+i*(right-left)/11,v),1.5,fill=1,stroke=0)
        for i in range(5):
            o=i*24.46
            line(scaled([(90+o,246),(90+o,344)]),'#969480',.45)
            line(scaled([(90,246+o),(188,246+o)]),'#969480',.45)
        for u,v in [(101,743),(155,940),(201,936)]:
            c.setFillColor(colour('#374746'));c.circle(*xy(u,v),7*s,fill=1,stroke=0)
        for left,right,v in HOOPS:
            a,b=xy(left,v);c.setStrokeColor(colour('#677a73'));c.setLineWidth(.85);c.arc(a,b-8*s,a+(right-left)*s,b+8*s,0,180)
        for n,pts in paths:shape(scaled(pts),'#ead9bd','#806d5a')
    for name,status,pts in edges:
        line(scaled(pts),obs if status=='observed' else unc,1.6 if not base else 1.25,None if status=='observed' else [3,2.8])
    if numbers:
        for i,(n,pts) in enumerate(paths,1):
            v=sum(pt[1] for pt in pts)/len(pts);badge(*xy(255,v),i)
    return xy
def legend(x,y):
    line([(x,y+3),(x+22,y+3)],obs,2);text(x+29,y,'Visible inner grass edge',9)
    line([(x,y-12),(x+22,y-12)],unc,2,[3,3]);text(x+29,y-15,'Course partly hidden',9)
def sidepic(key,title,cap,x,y,w,h):
    pic(photo(key),x,y,w,h)
    text(x,y-16,title,12,'Bold');para(x,y-31,cap,w,9,12)
def pairpage(i,title,sub,items,heading,body):
    head(title,sub,i)
    for j,(key,t,caption) in enumerate(items):
        x=29+j*421;sidepic(key,t,caption,x,237,398,231)
    text(29,137,heading,16,'Serif');para(29,112,body,772,11,17)
    c.showPage()

head('The March allotment, traced from the flyover','Shed end at the top. The numbers follow the seven paved cross-paths from the shed towards the open bed.',1)
xy=plan(58,520,.40)
def call(u,v,lx,ly,label):
    a,b=xy(u,v);line([(a,b),(lx-6,ly+3)],'#58685f',.6);text(lx,ly,label,9,'Bold')
call(156,141,289,477,'Grass behind shed')
call(141,189,289,452,'Pale-green shed')
call(490,180,289,432,'Neighbour’s brown shed')
call(151,291,289,408,'45 cm square paving')
call(445,570,289,309,'Neighbour’s hoops')
call(101,743,289,216,'Bed-side barrel')
call(279,932,289,156,'Open end bed')
legend(35,65)
sidepic('A12','01:52   Looking across the back of the shed','The grass passes behind the pale-green rear wall and turns along the side.',432,327,403,174)
sidepic('A18','02:11   The open end of the plot','The seventh strip sits between the dark cover and open bed. The grass crosses beyond the two containers.',432,91,403,174)
c.showPage()
head('Read the trace against the ground','Both views use the same paving datum, orientation and scale. The photograph is assembled from 22 overlapping frames.',2)
p1=plan(31,503,.397)
p2=plan(295,503,.397,True)
text(36,510,'SHARED PLAN',9,'Bold',muted);text(295,510,'REGISTERED CAMERA FRAMES',9,'Bold',muted)
text(565,481,'What the lines record',16,'Serif');legend(565,453)
para(565,400,'Grass runs behind the shed and around its rear corner. Its precise course alongside the shed towards the slabs is obscured by the roof.',270)
para(565,328,'Branches interrupt the edge at the far corner behind the covered bed. Leaves, the barrel and two containers also obscure local stretches along the side and at the open end.',270)
para(565,232,'The seven numbered strips cross the beds. Dashed joins mark a gap in the camera evidence. Grass shading beyond the line shows the setting only.',270)
para(565,153,'The paving fixes local scale. The ground mosaic aligns ground features. Roofs, trees and barrels can lean, and measurements become less certain further from the paving.',270)
l=100/.46/100*25*.397
line([(566,60),(566+l,60)],ink,2);text(595,57,'1 metre at the paving',9)
c.showPage()
pairpage(3,'The turn behind the shed','The two views are four seconds apart. The rear wall and the grass can be followed while the roof shifts in the picture.',[
 ('A12','A12  /  01:52','At right, grass meets the foot of John’s pale-green rear wall. The transverse grass continues left past the covered bed.'),
 ('A13','A13  /  01:56','More of the narrow grass beside the shed comes into view. Follow the base of the wall to locate the corner.')],
 'Where the line can be placed','The corner where the two grass runs meet is visible. The straight orange join nearer the paving on the review plan covers a hidden stretch. The brown shed across the grass belongs to the neighbour.')
pairpage(4,'The short paths through the beds','Follow the dark covers in sequence. The outgoing pass reveals a final paved strip before the open bed.',[
 ('A17','A17  /  02:07','Three pale paved strips are visible beside the dark covers. The furthest strip, across the top of the last cover, separates it from the open bed.'),
 ('A18','A18  /  02:11','The drone reaches the open bed and containers at the turn. The strip just behind the open soil is path 7 on the plan.')],
 'The end of the pass','The outward movement pauses at about 02:11–02:13. On the return the drone passes the same covered and planted beds and reaches the paved corner again around 02:27–02:30. The later wide views put the neighbouring hoops across the grass.')
pairpage(5,'A scale at the paved corner','The return pass supplies a second look at the planted bed and the paving beside the shed.',[
 ('A21','A21  /  02:27','The paving enters at lower right. Its junction with the planted bed identifies the same short path on the outward run.'),
 ('A04','A04  /  02:30','The slab joints in this earlier registered frame set the scale. Each square slab measures 45 × 45 cm.')],
 'Using the model','The Blender plan uses the same traced points and its individual paving slabs measure 0.45 m each way. Use the six model cameras to choose a sightline and the twenty photographic views to check it. Bed covers and planting describe March 2026.')
pairpage(6,'Check the opposite direction','The paved corner, pale-green shed and dark covered beds identify the plot when the camera turns.',[
 ('A02','A02  /  clip 0017  /  02:15','John identified his plot on the left, reaching almost halfway across this frame. The plot ends just beyond his shed.'),
 ('A06','A06  /  clip 0018  /  03:00','Looking towards the barrel. The neighbouring hoops appear across the grass path. Compare the sequence before placing a feature on either side.')],
 'Which landmarks to carry forward','The barrel beside the covered beds and the water butt at the shed door are separate landmarks. The brown shed and metal hoops belong to the neighbour. A real photograph from the intended angle is the reference for future book artwork.')
c.save()
