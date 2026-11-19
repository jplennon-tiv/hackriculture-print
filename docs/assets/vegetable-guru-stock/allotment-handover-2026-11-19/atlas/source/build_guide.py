from pathlib import Path
import sys,math
from PIL import Image
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor,Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from layout import P,OUT,DATA,LAND,SHED,BIN,GROUND_POLYGONS,METRES_PER_UNIT,SLAB,PAVING_Y
for n,f in [('Sans','NotoSans-Regular'),('Bold','NotoSans-Bold'),('Serif','NotoSerif-Regular')]:
 pdfmetrics.registerFont(TTFont(n,str(P/'fonts'/(f+'.ttf'))))
W,H=908,616
c=Canvas(str(OUT/'Johns-Allotment-Photo-Map.pdf'),pagesize=(W,H),pageCompression=1)
c.setTitle('John’s allotment — Photo map and walkthrough');c.setAuthor('John Lennon / Hackriculture')
c.setSubject('Source-based visual reference for The Vegetable Guru. March 2026 layout with April 2026 and July 2024 photographs.')
paper='#F9F7F0'; ink='#223C32'; sub='#4B5A51'; dim='#5E685E'; line='#CBCEC0'; moss='#52705A'; tan='#BE704D'; ochre='#8D5635'
def color(s):return HexColor(s)
def rect(x,y,w,h,col):
 c.setFillColor(color(col));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
def txt(x,y,s,sz=11,font='Sans',fg=ink):
 c.setFillColor(color(fg));c.setFont(font,sz);c.drawString(x,H-y,s)
def ln(x1,y1,x2,y2,col=line,w=.8):
 c.setStrokeColor(color(col));c.setLineWidth(w);c.line(x1,H-y1,x2,H-y2)
def link(key,x,y,w,h):
 c.linkRect('',f'p{key}',(x,H-y-h,x+w,H-y),relative=0,thickness=0)
def wrap(text,width,size=12,font='Sans'):
 lines=[];cur=''
 for word in text.split():
  test=(cur+' '+word).strip()
  if cur and pdfmetrics.stringWidth(test,font,size)>width:lines.append(cur);cur=word
  else:cur=test
 if cur:lines.append(cur)
 return lines
def para(x,y,s,w,sz=12,lead=17,font='Sans',fg=sub):
 for l in wrap(s,w,sz,font):
  txt(x,y,l,sz,font,fg);y+=lead
 return y
def pic(k,x,y,w,h):
 img=P/(k+'.jpg');iw,ih=Image.open(img).size
 z=min(w/iw,h/ih);a,b=iw*z,ih*z;xx=x+(w-a)/2;yy=y+(h-b)/2
 c.drawImage(str(img),xx,H-yy-b,width=a,height=b)
 return (xx,yy,a,b)
def tag(x,y,s,col=moss):
 txt(x,y,s,9,'Bold',col)
def dot(x,y,n,fill=moss,r=9):
 c.setFillColor(color(fill));c.setStrokeColor(color(paper));c.setLineWidth(1.3);c.circle(x,H-y,r,fill=1,stroke=1)
 c.setFillColor(color('#FFFFFF'));c.setFont('Bold',9);c.drawCentredString(x,H-y-3.1,str(n))
def label(x,y,title,body,w=216):
 txt(x,y,title,13,'Bold');return para(x,y+18,body,w,10.4,15)
pages=['Overview','Plot plan','Opposite views','Shed corner','Summer beds','April rows','Ground overlays','Paths & edges']
def head(i,title,subtitle):
 rect(0,0,W,H,paper);c.bookmarkPage('p'+str(i));c.addOutlineEntry(pages[i-1],'p'+str(i),level=0)
 txt(32,28,'HACKRICULTURE   /   THE VEGETABLE GURU',9,'Bold',moss)
 txt(626,28,'ALLOTMENT REFERENCE     /     WORKING MAP 02',9,'Bold',moss)
 ln(32,40,876,40);txt(32,83,title,34,'Serif')
 para(33,108,subtitle,840,12.2,17)
 xs=[33,112,191,306,401,503,592,715]
 ln(32,570,876,570)
 for i2,(x,name) in enumerate(zip(xs,pages),1):
  size=9.4;w=pdfmetrics.stringWidth(name,'Bold',size)
  if i2==i:ln(x,575,x+w,575,tan,2.8)
  txt(x,592,name,size,'Bold',ink if i2==i else dim);link(i2,x-2,574,w+5,25)
 txt(838,592,f'{i} / {len(pages)}',9,'Bold',dim)
def source(x,y,k,w=400):
 d=next(z for z in DATA if z[0]==k)
 txt(x,y,d[2]+'   ·   '+d[3],9,'Sans',dim)
def opener(i,heading,intro,keys,meaning,nav):
 head(i,heading,intro)
 x1=33; x2=464;pw=411
 for x,k in zip((x1,x2),keys):
  d=next(z for z in DATA if z[0]==k)
  tag(x,148,k+'   /   '+d[1].upper())
  pic(k,x,160,pw,232)
  source(x,411,k)
  para(x,439,d[4],pw-2,12.4,18)
 ln(33,495,875,495)
 tag(33,518,'READ THE VIEW')
 para(33,541,meaning,820,12,16)
 c.showPage()
head(1,'John’s allotment','A photographic walkthrough for placing future book illustrations on the right bed.')
x,y,w,h=pic('A02',32,139,603,341)
for xx,yy,n,cl in [(0.255,.273,'1',moss),(.493,.73,'2',moss),(.253,.763,'3',moss),(.571,.292,'N',ochre),(.66,.48,'N',ochre)]:
 dot(x+xx*w,y+yy*h,n,cl,10.5)
source(33,498,'A02')
for iy,(n,title,body) in enumerate([
 ('1','Pale-green shed','John’s plot extends just beyond this shed.'),
 ('2','Grass path','The beds are on the left of the path in this view.'),
 ('3','Cross paths','Narrow paved strips divide the growing ground.'),
 ('N','Neighbouring plot','The brown shed and metal hoops are across the grass path.')]):
 yy=160+iy*81;dot(664,yy-3,n,moss if n!='N' else ochre);label(683,yy,title,body,190)
ln(33,512,875,512)
para(33,535,'Start with the plot plan on page 2. For an illustration, choose the original still on pages 3–6 that shows the required bed and direction. The Blender model lets you explore how those views relate.',830,12.2,17)
c.showPage()
head(2,'Plot plan','Shed end at the top. Each square paving slab measures 45 cm on a side. The rest of the plan is approximate.')
# All schematic coordinates are shared with the Blender model.
s=12.45; ox=186;oy=533
def proj(x,y):return (ox+x*s,oy-y*s)
palette={'grass':'#CAD5B1','soil':'#D7C7A9','brick':'#C0A389','paving':'#D2CEB8','cover':'#64675E','fleece':'#EFEBDE'}
def polygon(points,fill):
 path=c.beginPath()
 for i,(x,y) in enumerate(points):
  a,b=proj(x,y)
  if i==0:path.moveTo(a,H-b)
  else:path.lineTo(a,H-b)
 path.close();c.setFillColor(color(fill));c.drawPath(path,fill=True,stroke=False)
for layer in ('soil','grass','brick','paving','cover','fleece'):
 for n,x,y,w,h,t in LAND:
  if t==layer:
   a,b=proj(x,y+h);rect(a,b,w*s,h*s,palette[t])
 for _,t,pts in GROUND_POLYGONS:
  if t==layer:polygon(pts,palette[t])
for k in range(1,4):
 a,b=proj(SLAB*k,PAVING_Y+4*SLAB);z,zz=proj(SLAB*k,PAVING_Y);ln(a,b,z,zz,'#ABA894',.5)
 a,b=proj(0,PAVING_Y+SLAB*k);z,zz=proj(4*SLAB,PAVING_Y+SLAB*k);ln(a,b,z,zz,'#ABA894',.5)
def area(x,y,w,h,cl):
 a,b=proj(x,y+h);rect(a,b,w*s,h*s,cl)
area(*SHED,'#7DA68B');area(14,23.5,2.45,2.35,'#AD8F78')
for cy in [4.4,7.6,10.8]:
 a,b=proj(14.25,cy);z,zz=proj(17.55,cy);ln(a,b,z,zz,'#9A9F95',1.4)
for x,y in [(14.25,4.4),(17.55,4.4)]:
 a,b=proj(x,y);z,zz=proj(x,10.8);ln(a,b,z,zz,'#B8BBAE',.65)
for y in (16.,17.,22.35,23.10,23.8):
 for i in range(10):
  a,b=proj(4.15+i*.76,y)
  c.setFillColor(color('#67805C'));c.circle(a,H-b,1.55,fill=1,stroke=0)
bx,by=proj(*BIN);c.setFillColor(color('#444943'));c.circle(bx,H-by,7,fill=1,stroke=0)
def leader(px,py,tx,ty,words,side):
 xx,yy=proj(px,py);endx=(tx+112) if side=='left' else tx-5
 ln(xx,yy,endx,ty-3,'#848F80',.65);c.setFillColor(color('#516453'));c.circle(xx,H-yy,2.4,fill=1,stroke=0)
 txt(tx,ty,words,10,'Bold',ink)
leader(1.6,26.8,35,177,'Pale-green shed','left')
leader(1.3,23.0,35,234,'45 cm paving','left')
leader(5.8,16.3,35,318,'Planted strip','left')
leader(.9,7.85,35,434,'Barrel','left')
leader(14.9,24.8,401,208,'Brown shed','right')
leader(12.65,13.1,401,341,'Grass path','right')
leader(15.4,7.6,401,420,'Metal hoops','right')
txt(398,459,'Neighbour’s plot',9,'Sans',ochre)
txt(186,554,'Barrel end',9,'Bold',dim)
bar=2*s/METRES_PER_UNIT
ln(35,505,35+bar,505,ink,1.4)
for x in (35,35+bar/2,35+bar):ln(x,501,x,509,ink,1.2)
txt(35,525,'0',9,'Sans',dim);txt(35+bar-4,525,'2 m',9,'Sans',dim)
def sightline(x,y,dx,dy,code,tx,ty):
 col='#2E6671'; col_bg='#F9F7F0'
 ex,ey=x+dx,y+dy; norm=math.hypot(dx,dy);u,v=dx/norm,dy/norm
 for ax,ay,bx,by in [(x,y,ex,ey),(ex,ey,ex-7*u-4*v,ey-7*v+4*u),(ex,ey,ex-7*u+4*v,ey-7*v-4*u)]:
  ln(ax,ay,bx,by,col_bg,4.5)
  ln(ax,ay,bx,by,col,2)
 rect(tx-2,ty-10,26,13,col_bg);txt(tx,ty,code,9,'Bold',col)
 link(3,tx-4,ty-13,34,20)
sightline(310,535,-8,-34,'A02',319,541)
sightline(269,213,0,28,'A06',277,213)
ln(505,139,505,550)
for yy,cod,title,body,pg in [
 (156,'A02 / A06','Look both ways along the beds','The arrows show the two viewing directions. The grass path changes sides in the photographs. The hoops stay across it.',3),
 (253,'A04 / A05','Find the shed corner','Use the square slabs, shed and planted strip together. John’s plot ends just beyond the shed.',4),
 (350,'A07 / A08 / A11','Choose a working-height still','Use A07 for the covered summer bed beside the shed, and A11 for the April view back towards the open door.',5),
 (447,'A02 / A06 / B01','Follow the grass edges','Two more finger paths run between the three dark covers. Grass marks the sides and ends. The corner behind the shed is partly hidden.',8)]:
 tag(526,yy,cod);txt(526,yy+20,title,15,'Bold');para(526,yy+39,body,341,10.9,15);link(pg,520,yy-12,353,81)
c.showPage()
opener(3,'One plot, two directions','The same grass path and metal hoops make this pair the quickest orientation check.',('A02','A06'),'In A02 the hoops stand to the right of the path. In A06 they stand to the left. Match that reversal before choosing a background.',None)
opener(4,'At the shed corner','The square paving connects the planted strip to the pale-green shed.',('A04','A05'),'For a close view beside the shed, begin with A04. Use A05 to recognise the structure and to see how much neighbouring ground enters the wider shot.',None)
opener(5,'Summer at standing height','Two original photographs record the July beds from different angles.',('A07','A08'),'Use A07 when both the shed and the covered bed need to appear. A08 records the second angle. The exact positions of these summer beds within the March layout remain open.',None)
opener(6,'April from the path','The covers and barrel appear at working height. The open shed door identifies the shed-facing view.',('A10','A11'),'The barrel by the covered beds and the water butt beside the shed door are separate landmarks. Similar containers also appear on nearby plots.',None)
head(7,'Reading the ground overlays','These two aerial patches have been straightened against visible ground features. Both have the shed end uppermost.')
tag(33,150,'A06   /   BARREL-END GROUND')
tag(301,150,'A04   /   SHED-END GROUND')
pic('A06-ground',34,164,245,322)
pic('A04-ground',302,165,277,133)
para(302,320,'Each slab measures 45 × 45 cm. Its joints fix the local scale in two directions. The roof enters from the left.',277,11.6,17)
ln(300,389,579,389)
tag(302,411,'USING THE OVERLAYS')
para(302,434,'The model includes these patches as optional layers. The gap between their edges is estimated. Tall objects lean in a ground-plane projection.',276,11.6,17)
tag(605,150,'B01   /   ORIGINAL DETAIL')
pic('B01',605,165,269,219)
source(605,404,'B01')
para(605,428,'Match the netted plant, paved finger paths and cover weights to A06. B01 is the book’s original finger-paths photograph.',267,11.5,17)
ln(33,505,875,505)
txt(33,529,'In Blender, frames 1–6 switch model views. In the Original photographs scene, use camera view and Rendered shading for frames 1–9.',11)
txt(33,552,'The scale bar on page 2 uses the measured slab. Distances away from the paving also depend on the fit of the two aerial patches.',11)
c.showPage()
head(8,'Paths and grass boundaries','The March photographs show where the finger paths end and where grass separates the plots.')
tag(33,151,'A06   /   TOWARDS THE BARREL')
tag(592,151,'A02 DETAIL   /   TOWARDS THE SHED')
left=pic('A06',33,167,539,303)
right=pic('A02-grass',592,167,283,126)
green='#306A53';gold='#A7491D'
def trace(frame,reference,points,tone):
 x,y,w,h=frame;rw,rh=reference
 pts=[(x+w*px/rw,y+h*py/rh) for px,py in points]
 for col,wt in [(paper,3.4),(tone,1.8)]:
  for a,b in zip(pts,pts[1:]):ln(*a,*b,col,wt)
# Mark only visible portions of the inner grass edge and exposed paving.
for pts in [[(45,365),(97,277),(132,239)],[(220,127),(255,74),(297,26),(403,19)],[(505,17),(575,18)],[(626,126),(649,184),(681,258)]]:
 trace(left,(840,472),pts,green)
for pts in [[(304,109),(383,110),(458,110),(524,111)],[(292,164),(362,165),(457,169),(549,172)]]:
 trace(left,(840,472),pts,gold)
trace(right,(810,358),[(536,265),(574,263),(603,273),(659,275)],green)
source(33,487,'A06')
txt(592,313,'23 March 2026  ·  Clip 0017  ·  02:15',9,'Sans',dim)
para(592,340,'Beyond the final covered bed, a strip of grass runs towards the side path. The shed obscures part of this end in the available views.',279,11.6,17)
ln(593,424,616,424,green,2.2);txt(625,428,'Inner edge of the grass path',10,'Bold')
ln(593,449,616,449,gold,2.2);txt(625,453,'Paving between dark covers',10,'Bold')
ln(33,501,875,501)
para(33,525,'B01 at 02:04 confirms both strips between the three covers. A04 at 02:30 supplies the shed-end paving. The continuous pass from 01:52 in DJI_20260323173752_0018_D.MP4 is needed to trace the whole perimeter.',836,11.8,16)
c.showPage();c.save()
