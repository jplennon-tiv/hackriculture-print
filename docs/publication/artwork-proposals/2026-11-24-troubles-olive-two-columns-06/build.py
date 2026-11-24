"""Build one standalone Troubles opener trial; no production files are changed."""
from pathlib import Path
import copy,hashlib,io,json,subprocess
from PIL import Image
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/'2026-11-24-troubles-tomato-opener-04'
A=SOURCE/'assets'; R=HERE/'renders'
MM=72/25.4; W,H=191*MM,246*MM
for name in ['Lilita','Nunito','Nunito-Bold','Folio']:
    pdfmetrics.registerFont(TTFont(name,str(A/f'{name}.ttf')))
entries=json.loads((SOURCE/'CONTENTS.json').read_text())['entries']
photo=Image.open(A/'tomato-C-selected-preview.png'); iw,ih=photo.size
scale=max(W/iw,H/ih)
buf=io.BytesIO()
c=canvas.Canvas(buf,pagesize=(W,H),initialFontName='Nunito',pageCompression=1)
c.drawImage(ImageReader(photo),(W-iw*scale)/2,(H-ih*scale)/2,iw*scale,ih*scale)
# A cropped translucent ellipse echoes selected Guides option 3.
oval={'cx':130,'cy':250,'rx':154,'ry':91,'opacity':0.82,'colour':'#404B26'}
c.saveState();c.setFillColor(HexColor(oval['colour']));c.setFillAlpha(oval['opacity'])
c.ellipse((oval['cx']-oval['rx'])*MM,H-(oval['cy']+oval['ry'])*MM,
          (oval['cx']+oval['rx'])*MM,H-(oval['cy']-oval['ry'])*MM,stroke=0,fill=1)
c.restoreState()
# Same first-line size, placement and casual tilt as the Guides selection.
asc=pdfmetrics.getFont('Lilita').face.ascent/1000
y=H-18*MM-asc*72
c.saveState();c.translate(20*MM,y);c.rotate(3);c.setFillColorRGB(1,1,1)
c.setFont('Lilita',72);c.drawString(0,0,'Vegetable')
second_size=78; second_y=-84*.89-MM
c.setFont('Lilita',second_size);c.drawString(0,second_y,'Troubles')
end=pdfmetrics.stringWidth('Troubles','Lilita',second_size)
assert end/MM < 158
c.setFillColor(HexColor('#d6ea9b'));c.circle(end+4*MM,second_y+2.5*MM,1.7*MM,stroke=0,fill=1)
c.restoreState()
positions=[]
contents_size=12.5
for i,e in enumerate(entries):
    column,row=divmod(i,7)
    baseline=189+row*5.8
    left,right_edge=[(31,101),(110,180)][column]
    for text,font,x,right in [(e['title'],'Nunito',left,None),(e['pages'],'Nunito-Bold',None,right_edge)]:
        width=pdfmetrics.stringWidth(text,font,contents_size)/MM
        if x is None:x=right-width
        face=pdfmetrics.getFont(font).face
        top=baseline-face.ascent/1000*contents_size/MM
        bottom=baseline-face.descent/1000*contents_size/MM
        for xx in [x,x+width]:
            for yy in [top,bottom]:
                assert ((xx-oval['cx'])/(oval['rx']-3))**2+((yy-oval['cy'])/(oval['ry']-3))**2 < 1,(text,xx,yy)
        c.setFillColor(HexColor('#FFFAF0'));c.setFont(font,contents_size);c.drawString(x*MM,H-baseline*MM,text)
        positions.append({'text':text,'column':column+1,'left_mm':x,'right_mm':x+width,'baseline_mm':baseline})
    assert positions[-2]['right_mm']+4 < positions[-1]['left_mm']
c.setFont('Folio',7.35);c.drawRightString(180*MM,11*MM,'97')
c.showPage();c.save()
reader=PdfReader(io.BytesIO(buf.getvalue()));page=reader.pages[0]
page.trimbox=RectangleObject([3*MM,3*MM,188*MM,243*MM]);page.bleedbox=RectangleObject([0,0,W,H])
writer=PdfWriter();writer.add_page(page)
writer.add_metadata({'/Title':'Vegetable Guru - Troubles olive two-column opener - page 97','/Author':'John Lennon','/Subject':'Concept trial only. Upscale and inspect selected imagery to minimum 300 ppi before printer upload.'})
out=HERE/'Vegetable-Guru-Troubles-Olive-Two-Columns-Page-97.pdf';writer.write(out)
trim=PdfWriter();trimpage=copy.copy(page);trimpage.cropbox=page.trimbox;trim.add_page(trimpage);trim.write(R/'trim-preview.pdf')
subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-png','-singlefile','-cropbox','-scale-to','1500',str(R/'trim-preview.pdf'),str(R/'page-97')],check=True,capture_output=True)
checked=PdfReader(out).pages[0]
assert [line.strip() for line in checked.extract_text().splitlines()]==['Vegetable','Troubles']+[p['text'] for p in positions]+['97']
for font in checked['/Resources']['/Font'].values():
    desc=font.get_object().get('/FontDescriptor'); assert desc and '/FontFile2' in desc.get_object()
page_map=json.loads((HERE.parent.parent/'whole-book-order-preview/PAGE-MAP.json').read_text())
groups={}
for item in page_map:
    if item.get('kind')=='trouble': groups.setdefault(item['key'],[]).append(item['folio'])
assert [(e['start'],e['end']) for e in entries]==[(min(v),max(v)) for v in groups.values()]
assert next(p['folio'] for p in page_map if p.get('label')=='Vegetable Troubles' and p.get('kind')=='section-opener')==97
ppi=72/scale
record={'date':'2026-11-24','status':'revised layout for review; tomato C and deep olive option 8 selected, butter yellow option 6 fallback','folio':97,'media_mm':[191,246],'trim_mm':[185,240],'bleed_mm':3,'source_pixels':[iw,ih],'effective_ppi':ppi,'title_sizes_pt':[72,second_size],'title_angle_degrees':3,'contents_size_pt':contents_size,'contents_columns':2,'entries_per_column':7,'reading_order':'down left, then down right','previous_contents_size_pt':10.5,'previous_oval_opacity':0.92,'text_positions':positions,'all_14_groups_and_current_ranges':True,'fonts_embedded':True,'contents_within_oval_inset_mm':3,'oval':oval,'production_ready':False,'upscaling':'Deferred until concept adoption; mandatory before printer upload','book_integration':False,'source_sha256':hashlib.sha256((A/'tomato-C-selected-preview.png').read_bytes()).hexdigest(),'pdf_sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(HERE/'MANIFEST.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({'pdf':str(out),'source_pixels':[iw,ih],'effective_ppi':ppi,'checks':'passed'},indent=2))
