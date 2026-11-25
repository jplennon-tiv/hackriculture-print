"""Increase selected title page's white lettering by 10%; preserve native fonts."""
from pathlib import Path
import json,re,hashlib
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,DecodedStreamObject
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import ImageFont

HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'2026-11-25-interior-title-oval-shapes-05/Vegetable-Guru-Interior-Title-Oval-Shape-Options.pdf'
FONTS=HERE.parent/'2026-11-24-section-opener-layered-masters-01/Fonts-Source'
fonts={}
for key,file in [('Lilita','Lilita.ttf'),('NunitoBold','Nunito-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(key,str(FONTS/file)))
    fonts[key]=ImageFont.truetype(str(FONTS/file),1000)
MM=72/25.4;H=240*MM
FACTOR=1.10
meta=json.loads((HERE.parent/'2026-11-25-interior-title-d-e-lettering-03/LAYOUT.json').read_text())
rows=meta['text_geometry'][:6];checks=[]
source=PdfReader(BASE);base=source.pages[6];data=base.get_contents().get_data()
def layerpat(key):return re.compile(rb'(/OC /'+key+rb' BDC\s*)(.*?)(\s*EMC)',re.S)
textpat=re.compile(rb'BT 1 0 0 1 ([-\d.]+) ([-\d.]+) Tm (/[^\s]+) ([-\d.]+) Tf ([-\d.]+) TL (.*?Tj T\* ET)',re.S)
offset=0
def change_layer(m):
    global offset
    def change_text(t):
        global offset
        r=rows[offset];offset+=1
        size=round(r['size_pt']*FACTOR,3);font=r['font']
        y=H-r['top_mm']*MM-pdfmetrics.getAscent(font,size)
        right=r['left_mm']+pdfmetrics.stringWidth(r['text'],font,size)/MM
        assert right<124,(r['text'],right)
        bounds=fonts[font].getbbox(r['text'],anchor='ls')
        actual_top=(H-y+bounds[1]*size/1000)/MM
        actual_bottom=(H-y+bounds[3]*size/1000)/MM
        checks.append({**r,'previous_size_pt':r['size_pt'],'size_pt':size,'right_mm':right,'actual_visible_top_mm':actual_top,'actual_visible_bottom_mm':actual_bottom})
        return f"BT 1 0 0 1 {r['left_mm']*MM:.7f} {y:.7f} Tm ".encode()+t.group(3)+f" {size} Tf {size*1.2:.7f} TL ".encode()+t.group(6)
    block=textpat.sub(change_text,m.group(2))
    return m.group(1)+block+m.group(3)
new=data
for key in [b'TITLE',b'AUTHOR']:new=layerpat(key).sub(change_layer,new)
assert offset==6
for a,b in zip(checks,checks[1:]):
    assert b['actual_visible_top_mm']-a['actual_visible_bottom_mm']>=2,(a['text'],b['text'])
def strip_layers(s):
    for key in [b'TITLE',b'AUTHOR']:s=layerpat(key).sub(b'/OC /'+key+b' BDC TYPE_LAYER EMC',s)
    return s
assert strip_layers(new)==strip_layers(data)
writer=PdfWriter();writer.append(source,pages=[6])
writer._root_object[NameObject('/OCProperties')]=source.trailer['/Root']['/OCProperties'].clone(writer)
stream=DecodedStreamObject();stream.set_data(new)
writer.pages[0][NameObject('/Contents')]=writer._add_object(stream)
writer.add_metadata({'/Title':'The Vegetable Guru - Selected title page with larger white lettering','/Author':'John Lennon','/Subject':'Background D; Pale sage option 4; Cropped sweep shape 6; white lettering enlarged 10 percent. Layered native typography.'})
dest=HERE/'Vegetable-Guru-Interior-Title-Larger-White-Text.pdf'
with open(dest,'wb') as f:writer.write(f)
proof=PdfReader(dest)
assert len(proof.pages)==1 and proof.pages[0].extract_text()==base.extract_text()
assert len(proof.pages[0]['/Resources']['/Properties'])==6
assert abs(float(proof.pages[0].mediabox.width)/MM-185)<.01
assert abs(float(proof.pages[0].mediabox.height)/MM-240)<.01
record={'date':'2026-11-25','status':'larger_white_text_trial_awaiting_review','selected_background':'D','selected_colour':{'option':4,'name':'Pale sage','fill':'#DFE9D3','opacity':.82,'fine_print_ink':'#173E2C'},'selected_shape':{'option':6,'name':'Cropped sweep'},'white_text_scale':FACTOR,'source_pdf':str(BASE),'source_page_1_based':7,'source_sha256':hashlib.sha256(BASE.read_bytes()).hexdigest(),'text_geometry':checks,'native_fonts_and_six_layers':True,'all_other_layers_identical':True,'visible_text_gaps_minimum_2mm':True,'unchanged':['D background/crop','Gradient','Oval shape, colour, opacity and position','Fine print content/font/size/position','White text left/top anchors'],'deferred_fix':'Missing wheelbarrow frame loop remains deferred.','production_changed':False,'upscale_before_print':True}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
print(dest,dest.stat().st_size,'bytes; native typography, text gaps, unchanged layers and complete copy verified')
