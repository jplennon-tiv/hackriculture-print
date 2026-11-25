"""Native-vector shape trials on selected D with pale sage option 4."""
from pathlib import Path
import json,re,math,hashlib
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import NameObject,DecodedStreamObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'2026-11-25-interior-title-oval-colours-04/Vegetable-Guru-Interior-Title-Oval-Colour-Options.pdf'
FONTS=HERE.parent/'2026-11-24-section-opener-layered-masters-01/Fonts-Source'
for key,file in [('Display','Lilita.ttf'),('Body','Nunito.ttf'),('Bold','Nunito-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(key,str(FONTS/file)))
MM=72/25.4
VARIANTS=[
 {'number':1,'name':'Current oval','width':158,'height':43,'cx':97,'cy':214.5,'angle':0,'text_dx':0,'text_down':0,'note':'The selected layout for comparison'},
 {'number':2,'name':'Wide and flat','width':180,'height':38,'cx':92.5,'cy':217.5,'angle':0,'text_dx':-4.5,'text_down':2,'note':'Broader, shallower and lower'},
 {'number':3,'name':'Compact oval','width':134,'height':45,'cx':97,'cy':216.5,'angle':0,'text_dx':0,'text_down':0,'note':'A smaller footprint around the copy'},
 {'number':4,'name':'Tall oval','width':140,'height':70,'cx':97,'cy':199,'angle':0,'text_dx':0,'text_down':-15,'note':'Rounder, with more space around the copy'},
 {'number':5,'name':'Gentle tilt','width':166,'height':46,'cx':95,'cy':211,'angle':7,'text_dx':-2,'text_down':-2,'note':'An angled oval with level lettering'},
 {'number':6,'name':'Cropped sweep','width':220,'height':74,'cx':92.5,'cy':235,'angle':0,'text_dx':-4.5,'text_down':4,'note':'Oversized, flowing off the bottom edge'},
]
LAYOUT=json.loads((HERE.parent/'2026-11-25-interior-title-d-e-lettering-03/LAYOUT.json').read_text())
# Confirm actual text-box corners fit inside each ellipse with a small padding.
for r in VARIANTS:
    theta=math.radians(r['angle']);co=math.cos(theta);si=math.sin(theta)
    for t in LAYOUT['text_geometry'][6:]:
        bottom=t['top_mm']+(pdfmetrics.getAscent('Body',t['size_pt'])-pdfmetrics.getDescent('Body',t['size_pt']))/MM
        for x in [t['left_mm']+r['text_dx']-1,t['right_mm']+r['text_dx']+1]:
            for top in [t['top_mm']+r['text_down']-1,bottom+r['text_down']+1]:
                dx=x-r['cx'];dy=r['cy']-top
                xx=co*dx+si*dy;yy=-si*dx+co*dy
                assert (xx/(r['width']/2))**2+(yy/(r['height']/2))**2<1,(r['name'],t['text'])
                assert 17<=x<=177 and top<=235,(r['name'],x,top)
LABELS=HERE/'working-labels.pdf'
DEST=HERE/'Vegetable-Guru-Interior-Title-Oval-Shape-Options.pdf'
c=canvas.Canvas(str(LABELS),pagesize=(420*MM,400*MM))
c.setFillColor(HexColor('#F7F4EA'));c.rect(0,0,420*MM,400*MM,fill=1,stroke=0)
c.setFillColor(HexColor('#173E2C'));c.setFont('Display',23)
c.drawString(21*MM,384*MM,'Interior title: oval shapes')
c.setFont('Body',10)
c.drawString(21*MM,374*MM,'Pale sage throughout, at 82% opacity. Same D photograph, white title and fine-print size.')
scale=118/185;ih=240*scale;positions=[]
for i,r in enumerate(VARIANTS):
    x=21+(i%3)*130;top=366-(i//3)*(ih+24);y=top-ih
    positions.append((x*MM,y*MM,scale))
    c.setFont('Bold',12);c.drawString(x*MM,(y-7)*MM,f"{r['number']}  {r['name']}")
    c.setFont('Body',9);c.drawString(x*MM,(y-13)*MM,r['note'])
c.setFont('Body',8)
c.drawString(21*MM,8*MM,'25 November 2026  |  Shape trials only  |  Wheelbarrow correction remains deferred')
c.showPage();c.save()
source=PdfReader(BASE);base=source.pages[4];data=base.get_contents().get_data()
writer=PdfWriter();writer.append(PdfReader(LABELS));writer.append(source,pages=[4,4,4,4,4,4])
writer._root_object[NameObject('/OCProperties')]=source.trailer['/Root']['/OCProperties'].clone(writer)
def blockpat(key):return re.compile(rb'(/OC /'+key+rb' BDC\s*)(.*?)(\s*EMC)',re.S)
def replace(data,key,body):
    p=blockpat(key);assert len(list(p.finditer(data)))==1
    return p.sub(lambda m:m.group(1)+body+m.group(3),data)
def unchanged(data):
    for key in [b'OVAL',b'COPYRIGHT']:
        data=blockpat(key).sub(b'/OC /'+key+b' BDC CHANGED_LAYER EMC',data)
    return data
oval=blockpat(b'OVAL').search(data).group(2)
copy=blockpat(b'COPYRIGHT').search(data).group(2)
prefix=oval[:oval.index(b'\nn\n')+1]
k=.5522847498307936
def newoval(r):
    rx=r['width']*MM/2;ry=r['height']*MM/2
    t=math.radians(r['angle']);co=math.cos(t);si=math.sin(t)
    fmt=lambda *vs:' '.join(f'{v:.7f}' for v in vs)
    ops=[fmt(co,si,-si,co,r['cx']*MM,(240-r['cy'])*MM)+' cm','n',fmt(rx,0)+' m',
     fmt(rx,k*ry,k*rx,ry,0,ry)+' c',fmt(-k*rx,ry,-rx,k*ry,-rx,0)+' c',
     fmt(-rx,-k*ry,-k*rx,-ry,0,-ry)+' c',fmt(k*rx,-ry,rx,-k*ry,rx,0)+' c','f*','Q']
    return prefix+('\n'.join(ops)+'\n').encode()
for i,r in enumerate(VARIANTS,1):
    new=data if i==1 else replace(data,b'OVAL',newoval(r))
    if r['text_dx'] or r['text_down']:
        body=f"q\n1 0 0 1 {r['text_dx']*MM:.7f} {-r['text_down']*MM:.7f} cm\n".encode()+copy+b'\nQ\n'
        new=replace(new,b'COPYRIGHT',body)
    assert unchanged(new)==unchanged(data)
    stream=DecodedStreamObject();stream.set_data(new)
    writer.pages[i][NameObject('/Contents')]=writer._add_object(stream)
    x,y,s=positions[i-1]
    writer.pages[0].merge_transformed_page(writer.pages[i],Transformation().scale(s).translate(x,y))
    writer.add_outline_item(f"{r['number']} - {r['name']}",i)
writer.add_metadata({'/Title':'The Vegetable Guru - Interior title oval shape options','/Author':'John Lennon','/Subject':'Six native-vector oval shape trials. D and pale sage selected; native typography and independent layers preserved.'})
with open(DEST,'wb') as f:writer.write(f)
LABELS.unlink()
proof=PdfReader(DEST);assert len(proof.pages)==7
for p in proof.pages[1:]:
    assert p.extract_text()==base.extract_text()
    assert len(p['/Resources']['/Properties'])==6
    assert abs(float(p.mediabox.width)/MM-185)<.01 and abs(float(p.mediabox.height)/MM-240)<.01
record={'date':'2026-11-25','status':'six_shapes_awaiting_user_selection','background':'D','selected_colour_option':4,'fill':'#DFE9D3','fine_print_ink':'#173E2C','opacity':.82,'source_pdf':str(BASE),'source_page_1_based':5,'source_sha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'variants':VARIANTS,'unchanged':['D photograph and crop','White title/subtitle/author and their positions','Gradient','Fine-print wording, native font and size','Pale sage colour and 82% opacity'],'changed':['Oval shape, size, rotation and placement','Fine-print block position for selected variants; lettering remains level'],'native_fonts_and_six_layers':True,'copy_and_layer_invariance_passed':True,'text_box_fit_inside_all_ellipses_passed':True,'deferred_fix':'Missing wheelbarrow frame loop; still deferred.','production_changed':False,'upscale_before_print':True}
(HERE/'VARIANTS.json').write_text(json.dumps(record,indent=2)+'\n')
print(DEST,DEST.stat().st_size,'bytes; 7 pages; native copy, type, ellipse fit and layers checked')
