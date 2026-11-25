"""Six colour-only oval variants of the selected D title page."""
from pathlib import Path
import json,re,hashlib
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import NameObject,DecodedStreamObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'2026-11-25-interior-title-d-e-lettering-03/Vegetable-Guru-Interior-Title-D-and-E-Lettering.pdf'
FONTS=HERE.parent/'2026-11-24-section-opener-layered-masters-01/Fonts-Source'
for key,file in [('Display','Lilita.ttf'),('Body','Nunito.ttf'),('Bold','Nunito-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(key,str(FONTS/file)))
MM=72/25.4
COLORS=[
 {'number':1,'name':'Forest green','fill':'#173E2C','text':'#FFFFFF','note':'Current colour'},
 {'number':2,'name':'Deep olive','fill':'#4B4D24','text':'#FFFFFF','note':'Warm and earthy'},
 {'number':3,'name':'Slate blue','fill':'#365163','text':'#FFFFFF','note':'Cool and subdued'},
 {'number':4,'name':'Pale sage','fill':'#DFE9D3','text':'#173E2C','note':'Soft garden green'},
 {'number':5,'name':'Warm cream','fill':'#FFF8E9','text':'#173E2C','note':'Matches the book paper colour'},
 {'number':6,'name':'Butter yellow','fill':'#E8D48B','text':'#173E2C','note':'Warm sunlight colour'},
]
LABELS=HERE/'working-contact-labels.pdf'
DEST=HERE/'Vegetable-Guru-Interior-Title-Oval-Colour-Options.pdf'
CW,CH=420*MM,400*MM
c=canvas.Canvas(str(LABELS),pagesize=(CW,CH))
c.setFillColor(HexColor('#F7F4EA'));c.rect(0,0,CW,CH,fill=1,stroke=0)
c.setFillColor(HexColor('#173E2C'));c.setFont('Display',23)
c.drawString(21*MM,384*MM,'Interior title: oval colours')
c.setFont('Body',10)
c.drawString(21*MM,374*MM,'Same D photograph and layout. All ovals at 82% opacity; light options use dark fine print.')
scale=118/185;ih=240*scale;positions=[]
for i,r in enumerate(COLORS):
    x=21+(i%3)*130;top=366-(i//3)*(ih+24);y=top-ih
    positions.append((x*MM,y*MM,scale))
    c.setFont('Bold',12);c.drawString(x*MM,(y-7)*MM,f"{r['number']}  {r['name']}")
    c.setFont('Body',9);c.drawString(x*MM,(y-13)*MM,r['note'])
c.setFont('Body',8);c.drawString(21*MM,8*MM,'25 November 2026  |  Colour trials only  |  Wheelbarrow correction remains deferred')
c.showPage();c.save()

source=PdfReader(BASE);base=source.pages[1];data=base.get_contents().get_data()
writer=PdfWriter();writer.append(PdfReader(LABELS));writer.append(source,pages=[1,1,1,1,1,1])
writer._root_object[NameObject('/OCProperties')]=source.trailer['/Root']['/OCProperties'].clone(writer)
rgb=re.compile(rb'(?<![\w.])[-+]?(?:\d*\.)?\d+\s+[-+]?(?:\d*\.)?\d+\s+[-+]?(?:\d*\.)?\d+\s+rg\b')
def rgb_op(code):
    channels=[int(code[i:i+2],16)/255 for i in [1,3,5]]
    return (' '.join(f'{v:.6f}' for v in channels)+' rg').encode()
def replace_layer(data,key,colour,expected):
    pattern=re.compile(rb'(/OC /'+key+rb' BDC\s*)(.*?)(\s*EMC)',re.S)
    matches=list(pattern.finditer(data));assert len(matches)==1
    def swap(m):
        block,n=rgb.subn(rgb_op(colour),m.group(2));assert n==expected,(key,n)
        return m.group(1)+block+m.group(3)
    return pattern.sub(swap,data)
def invariant(data):
    # The only permitted changes are fill operators in these two layers.
    for key in [b'OVAL',b'COPYRIGHT']:
        pattern=re.compile(rb'(/OC /'+key+rb' BDC\s*)(.*?)(\s*EMC)',re.S)
        data=pattern.sub(lambda m:m.group(1)+rgb.sub(b'COLOUR',m.group(2))+m.group(3),data)
    return data

for i,r in enumerate(COLORS,1):
    new=replace_layer(data,b'OVAL',r['fill'],1)
    new=replace_layer(new,b'COPYRIGHT',r['text'],5)
    assert invariant(new)==invariant(data)
    stream=DecodedStreamObject();stream.set_data(new)
    writer.pages[i][NameObject('/Contents')]=writer._add_object(stream)
    x,y,s=positions[i-1]
    writer.pages[0].merge_transformed_page(writer.pages[i],Transformation().scale(s).translate(x,y))
    writer.add_outline_item(f"{r['number']} - {r['name']}",i)
writer.add_metadata({'/Title':'The Vegetable Guru - Interior title oval colour options','/Author':'John Lennon','/Subject':'Six colour trials on selected D; same photograph, typography and oval geometry. Native fonts and separate layers.'})
with open(DEST,'wb') as f:writer.write(f)
LABELS.unlink()

proof=PdfReader(DEST);assert len(proof.pages)==7
expected=base.extract_text()
for p in proof.pages[1:]:
    assert p.extract_text()==expected
    assert len(p['/Resources']['/Properties'])==6
    assert abs(float(p.mediabox.width)/MM-185)<.01 and abs(float(p.mediabox.height)/MM-240)<.01
record={'date':'2026-11-25','status':'six_colour_options_awaiting_user_selection','selected_background':'D','user_quote':'D is the one to use - it looks great.','source_pdf':str(BASE),'source_page_1_based':2,'source_sha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'opacity':.82,'oval_bounds_mm':[18,193,176,236],'variants':COLORS,'unchanged':['Background photograph and framing','Title/subtitle/author text, white colour and positions','Text contrast gradient','Fine-print wording/font/sizes/positions','Oval geometry and opacity'],'changed':['Oval fill colour','Fine-print ink only for light options'],'native_type_and_layers_preserved':True,'content_stream_invariance_check':True,'deferred_fix':'Missing wheelbarrow frame loop in front of wheel. Not corrected.','production_changed':False,'upscaling_pending':True}
(HERE/'VARIANTS.json').write_text(json.dumps(record,indent=2)+'\n')
print(DEST,DEST.stat().st_size,'bytes; 7 pages; content, copy, layers and geometry checked')
