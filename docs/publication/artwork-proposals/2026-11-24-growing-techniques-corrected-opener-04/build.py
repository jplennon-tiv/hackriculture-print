"""Standalone Growing Techniques photographic trial; no production changes."""
from pathlib import Path
import copy, hashlib, io, json, subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

HERE = Path(__file__).resolve().parent
FONTS = HERE/'assets'
MM = 72/25.4
W, H = 191*MM, 246*MM
for name in ['Lilita', 'Nunito', 'Nunito-Bold', 'Folio']:
    pdfmetrics.registerFont(TTFont(name, str(FONTS/f'{name}.ttf')))
contents = json.loads((HERE/'CONTENTS.json').read_text())
photo_path = HERE/'assets/watering-option-08.png'
photo = Image.open(photo_path)
iw, ih = photo.size
scale = max(W/iw, H/ih)
buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=(W,H), initialFontName='Nunito', pageCompression=1)
c.drawImage(ImageReader(photo), (W-iw*scale)/2, (H-ih*scale)/2, iw*scale, ih*scale)
oval = {'cx':115, 'cy':267, 'rx':180, 'ry':151, 'opacity':0.82, 'colour':'#404B26'}
c.saveState()
c.setFillColor(HexColor(oval['colour']))
c.setFillAlpha(oval['opacity'])
c.ellipse((oval['cx']-oval['rx'])*MM, H-(oval['cy']+oval['ry'])*MM,
          (oval['cx']+oval['rx'])*MM, H-(oval['cy']-oval['ry'])*MM, stroke=0, fill=1)
c.restoreState()

# Matching two-line Lilita title; its left placement keeps John's face visible.
asc = pdfmetrics.getFont('Lilita').face.ascent/1000
c.saveState()
c.translate(20*MM, H-18*MM-asc*72)
c.rotate(3)
c.setFillColorRGB(1,1,1)
c.setFont('Lilita',72)
c.drawString(0,0,'Growing')
second_y = -84*.89-MM
c.drawString(0,second_y,'Techniques')
end = pdfmetrics.stringWidth('Techniques','Lilita',72)
c.setFillColor(HexColor('#d6ea9b'))
c.circle(end+4*MM, second_y+2.5*MM, 1.7*MM, stroke=0, fill=1)
c.restoreState()

positions=[]
def draw_text(text,font,size,left,baseline,right=None,kind='entry',column=0):
    width=pdfmetrics.stringWidth(text,font,size)/MM
    x=left if right is None else right-width
    face=pdfmetrics.getFont(font).face
    top=baseline-face.ascent/1000*size/MM
    bottom=baseline-face.descent/1000*size/MM
    for xx in [x,x+width]:
        for yy in [top,bottom]:
            assert ((xx-oval['cx'])/(oval['rx']-3))**2+((yy-oval['cy'])/(oval['ry']-3))**2 < 1, (text,xx,yy)
    c.setFillColor(HexColor('#FFFAF0'))
    c.setFont(font,size)
    c.drawString(x*MM,H-baseline*MM,text)
    positions.append({'text':text,'kind':kind,'column':column+1,'left_mm':x,'right_mm':x+width,'top_mm':top,'bottom_mm':bottom,'baseline_mm':baseline,'font_size_pt':size})

for group_index, group in enumerate(contents['groups']):
    column,row=divmod(group_index,3)
    left,right_edge=[(26,99),(108,180)][column]
    heading_baseline=[149,180.5,212][row]
    draw_text(group['title'],'Nunito-Bold',12.5,left,heading_baseline,kind='group',column=column)
    for i,entry in enumerate(group['entries']):
        baseline=heading_baseline+7+i*5.2
        draw_text(entry['title'],'Nunito',10.8,left,baseline,column=column)
        draw_text(entry['pages'],'Nunito-Bold',10.8,None,baseline,right=right_edge,column=column)
        assert positions[-2]['right_mm']+3 < positions[-1]['left_mm'],entry['title']

c.setFillColor(HexColor('#FFFAF0'))
c.setFont('Folio',7.35)
c.drawRightString(180*MM,11*MM,'145')
c.showPage()
c.save()
page=PdfReader(io.BytesIO(buf.getvalue())).pages[0]
page.trimbox=RectangleObject([3*MM,3*MM,188*MM,243*MM])
page.bleedbox=RectangleObject([0,0,W,H])
writer=PdfWriter()
writer.add_page(page)
writer.add_metadata({'/Title':'Vegetable Guru - Growing Techniques watering trial - page 145','/Author':'John Lennon','/Subject':'Concept trial only. Selected option 8. Upscale and inspect selected imagery to minimum 300 ppi before printer upload.'})
out=HERE/'Vegetable-Guru-Growing-Techniques-Watering-Page-145.pdf'
writer.write(out)
trim=PdfWriter()
trimpage=copy.copy(page)
trimpage.cropbox=page.trimbox
trim.add_page(trimpage)
trim.write(HERE/'renders/trim-preview.pdf')
subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-png','-singlefile','-cropbox','-scale-to','1500',str(HERE/'renders/trim-preview.pdf'),str(HERE/'renders/page-145')],check=True,capture_output=True)

checked=PdfReader(out).pages[0]
assert [s.strip() for s in checked.extract_text().splitlines()]==['Growing','Techniques']+[p['text'] for p in positions]+['145']
for font in checked['/Resources']['/Font'].values():
    desc=font.get_object().get('/FontDescriptor')
    assert desc and '/FontFile2' in desc.get_object()
page_map=json.loads((HERE.parent.parent/'whole-book-order-preview/PAGE-MAP.json').read_text())
current={p['folio']:p['label'] for p in page_map if isinstance(p.get('folio'),int) and 145<=p['folio']<=169}
assert current[145]=='Growing Techniques'
expected=[(146,146),(147,147),(148,149),(150,150),(151,151),(152,153),(154,154),(155,155),(156,156),(157,157),(158,159),(160,160),(161,161),(162,163),(164,165),(166,166),(167,167),(168,168),(169,169)]
entries=[e for g in contents['groups'] for e in g['entries']]
assert [(e['start'],e['end']) for e in entries]==expected
assert [p for e in entries for p in range(e['start'],e['end']+1)]==list(range(146,170))
assert len(entries)==19 and len(contents['groups'])==6
record={'date':'2026-11-24','status':'Corrected option 8 likeness accepted for the trial; completed page layout awaiting review','selected_candidate':8,'folio':145,'media_mm':[191,246],'trim_mm':[185,240],'bleed_mm':3,'source_pixels':[iw,ih],'effective_ppi':72/scale,'title_sizes_pt':[72,72],'title_angle_degrees':3,'group_size_pt':12.5,'contents_size_pt':10.8,'contents_columns':2,'reading_order':'down left, then down right','groups':6,'entries':19,'text_positions':positions,'current_destinations':current,'fonts_embedded':True,'contents_within_oval_inset_mm':3,'oval':oval,'production_ready':False,'book_integration':False,'upscaling':'Deferred until concept adoption; minimum 300 ppi and visual detail inspection required before printer upload','source_sha256':hashlib.sha256(photo_path.read_bytes()).hexdigest(),'pdf_sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(HERE/'MANIFEST.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({'pdf':str(out),'source_pixels':[iw,ih],'effective_ppi':72/scale,'checks':'passed'},indent=2))
