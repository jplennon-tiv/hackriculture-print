"""Reversible B refinement and a proposed calendar-facing-page pairing."""
from pathlib import Path
import io,json,hashlib
import fitz
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
HERE=Path(__file__).resolve().parent
ASSETS=HERE/'assets'
RENDERS=HERE/'renders'
RENDERS.mkdir(exist_ok=True)
MM=72/25.4
W,H=191*MM,246*MM
TRIM=RectangleObject([3*MM,3*MM,188*MM,243*MM])
entries=json.loads((HERE/'CONTENTS.json').read_text())['entries']
cal=json.loads((HERE/'CALENDAR.json').read_text())
for name,file in [('Nunito','NunitoSans-Regular.ttf'),('NunitoBold','NunitoSans-Bold.ttf'),('Lilita','LilitaOne-Calendar.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(ASSETS/file)))
# Exact selected 9A plus the revised native overlay.
base=PdfReader(ASSETS/'9A-base.pdf')
b=io.BytesIO()
c=canvas.Canvas(b,pagesize=(W,H),pageCompression=1,initialFontName='Nunito')
c.saveState();c.setFillColor(HexColor('#153e2a'));c.setFillAlpha(.79)
c.rect(57*MM,13*MM,134*MM,122*MM,stroke=0,fill=1)
c.restoreState();c.setFillColorRGB(1,1,1)
positions=[]
for x,chunk in zip([64,124],[entries[:22],entries[22:]]):
    for row,item in enumerate(chunk):
        y=(246-124-4.65*row)*MM
        c.setFont('Nunito',9.75);c.drawString(x*MM,y,item['name'])
        c.setFont('NunitoBold',9.75);c.drawRightString((x+52)*MM,y,str(item['folio']))
        positions.append({'name':item['name'],'folio':item['folio'],'name_x_mm':x,'folio_right_mm':x+52,'baseline_from_top_mm':124+4.65*row})
c.showPage();c.save()
overlay=PdfReader(io.BytesIO(b.getvalue()))
right=base.pages[0];right.merge_page(overlay.pages[0])
right.mediabox=RectangleObject([0,0,W,H]);right.cropbox=RectangleObject([0,0,W,H]);right.trimbox=TRIM;right.bleedbox=RectangleObject([0,0,W,H])
rightwriter=PdfWriter();rightwriter.add_page(right)
rightpath=HERE/'Vegetable-Guru-9A-B-Left-4mm.pdf'
with rightpath.open('wb') as f:rightwriter.write(f)
# Isolate the exact native calendar diagram/legend from the approved saved proof.
# Remove text outside its crop in a derived copy, so hidden old contents cannot
# leak into the new page's selectable text. No calendar content is changed.
source=fitz.open(ASSETS/'contents-source-reference.pdf')
diagram=fitz.open();diagram.insert_pdf(source,from_page=0,to_page=0)
dp=diagram[0];sw,sh=dp.rect.width,dp.rect.height
clip=fitz.Rect(*[v*MM for v in cal['source_graphic_clip_mm']])
for rect in [fitz.Rect(0,0,sw,clip.y0),fitz.Rect(0,clip.y1,sw,sh),
             fitz.Rect(0,clip.y0,clip.x0,clip.y1),fitz.Rect(clip.x1,clip.y0,sw,clip.y1)]:
    dp.add_redact_annot(rect,fill=None,cross_out=False)
dp.apply_redactions(images=1,graphics=0,text=0)
dp.set_cropbox(clip)
diagram.save(ASSETS/'calendar-diagram.pdf',garbage=4,deflate=True)
expected=source[0].get_text(clip=clip).split()
calendar_check=fitz.open(ASSETS/'calendar-diagram.pdf')
assert calendar_check[0].get_text().split()==expected
# Quiet cream companion page: existing copy and diagram, with shared typography.
buf=io.BytesIO()
c=canvas.Canvas(buf,pagesize=(W,H),pageCompression=1,initialFontName='Nunito')
c.setFillColor(HexColor('#fff8e9'));c.rect(0,0,W,H,stroke=0,fill=1)
c.setFillColor(HexColor('#153e2a'))
c.setFont('Lilita',32);c.drawString(11*MM,(246-36)*MM,'Reading the')
c.setFont('Lilita',48);c.drawString(11*MM,(246-54)*MM,'calendar')
words=cal['paragraph'].split()
lines=[];line=''
for word in words:
    test=(line+' '+word).strip()
    if line and pdfmetrics.stringWidth(test,'Nunito',10.5)>160*MM:
        lines.append(line);line=word
    else:line=test
if line:lines.append(line)
c.setFont('Nunito',10.5)
for i,line in enumerate(lines):c.drawString(11*MM,(246-82)*MM-i*15,line)
# Same approved warm calendar surround, preserving its visual relationship
# with the coloured guide calendars.
c.setFillColorRGB(1,.9033035635948181,.766643762588501)
c.roundRect(11*MM,(246-166)*MM,160*MM,50*MM,3*MM,stroke=0,fill=1)
c.showPage();c.save()
face=fitz.open(stream=buf.getvalue(),filetype='pdf')
calendar_doc=fitz.open(ASSETS/'calendar-diagram.pdf')
target=fitz.Rect(14*MM,121*MM,168*MM,(121+154*35/155)*MM)
face[0].show_pdf_page(target,calendar_doc,0)
face.save(RENDERS/'calendar-face-without-boxes.pdf',garbage=4,deflate=True)
pair=PdfWriter()
left=PdfReader(RENDERS/'calendar-face-without-boxes.pdf').pages[0]
for page in [left,PdfReader(rightpath).pages[0]]:
    page.mediabox=RectangleObject([0,0,W,H]);page.cropbox=RectangleObject([0,0,W,H]);page.trimbox=TRIM;page.bleedbox=RectangleObject([0,0,W,H])
    pair.add_page(page)
pair.add_outline_item('Proposed calendar facing page',0)
pair.add_outline_item('Selected 9A/B - contents moved 4 mm left',1)
pair.add_metadata({'/Title':'Vegetable Guru - calendar and opener pairing proposal','/Author':'John Lennon','/Subject':'Separate layout experiment; facing-page placement not confirmed in the current assembled book.'})
pairpath=HERE/'Vegetable-Guru-Calendar-and-Opener-Proposal.pdf'
with pairpath.open('wb') as f:pair.write(f)
# Source and output checks.
new=fitz.open(rightpath)
oldwords=json.loads((ASSETS/'selected-B-text-positions.json').read_text());newwords=new[0].get_text('words')
assert len(oldwords)==len(newwords)
for a,z in zip(oldwords,newwords):
    assert a[4]==z[4]
    title=a[4] in ('Vegetable','Guides')
    dx=0 if title else -4*MM
    assert abs(z[0]-a[0]-dx)<.02,(a,z)
    assert abs(z[1]-a[1])<.02
orig=PdfReader(ASSETS/'9A-base.pdf').pages[0]
def images(page):
    return {hashlib.sha256(v.get_object().get_data()).hexdigest() for v in page['/Resources']['/XObject'].values() if v.get_object().get('/Subtype')=='/Image'}
assert images(PdfReader(rightpath).pages[0])==images(orig)
out=fitz.open(pairpath)
assert 'Artichoke' not in out[0].get_text()
assert 'Runner beans' in out[0].get_text()
assert 'Muted months may need' in out[0].get_text()
for item in entries:assert item['name'] in out[1].get_text()
for i,page in enumerate(out):
    page.get_pixmap(matrix=fitz.Matrix(120/72,120/72),clip=page.trimbox,alpha=False).save(RENDERS/('page-'+str(i+1)+'.png'))
spread=fitz.open()
tw,th=185*MM,240*MM
sp=spread.new_page(width=2*tw+4*MM,height=th)
sp.draw_rect(sp.rect,color=None,fill=(.91,.9,.86))
sp.show_pdf_page(fitz.Rect(0,0,tw,th),out,0,clip=out[0].trimbox)
sp.show_pdf_page(fitz.Rect(tw+4*MM,0,2*tw+4*MM,th),out,1,clip=out[1].trimbox)
spread.save(RENDERS/'spread.pdf')
sp.get_pixmap(matrix=fitz.Matrix(115/72,115/72),alpha=False).save(HERE/'Vegetable-Guru-Calendar-and-Opener-Spread.png')
sp.get_pixmap(matrix=fitz.Matrix(85/72,85/72),alpha=False).save(RENDERS/'spread-preview.png')
manifest={
 'date':'2026-11-24','status':'B remains the selected direction; 4 mm leftward refinement and calendar-facing-page idea are new proposals',
 'parent':'2026-11-24-vegetable-guides-opener-07-contents','selected_base':'9A','selected_panel':'B',
 'requested_change':'Move contents block left by a small amount','interpreted_shift_mm':-4,
 'panel_left_mm_from_bleed':57,'panel_right_mm_from_bleed':191,
 'title_and_photo_unchanged':True,'all_44_entries_unchanged':True,'contents_positions':positions,
 'calendar_copy_unchanged':True,'calendar_legend_colours_unchanged':True,
 'calendar_source':'assets/contents-source-reference.pdf','calendar_source_clip_mm':cal['source_graphic_clip_mm'],
 'facing_page_status':'A proposal only. Confirm the existing facing page is available before assigning a folio; no added book page or pagination change authorized.',
 'guide_continuity':'Keep approved illustrated headers, family colours and technical diagrams; share existing Lilita/Nunito typography and use deep green sparingly for navigation. Exact current first guide spread was not available remotely for visual comparison.',
 'native_image_ppi':146.92764227642274,'trim_mm':[185,240],'bleed_mm':3,'media_mm':[191,246],
 'checks':{'all_contents_text_moved_exactly_4mm_left':True,'vertical_positions_unchanged':True,'title_positions_unchanged':True,'original_image_stream_unchanged':True,'calendar_source_text_preserved':True,'no_hidden_old_contents_on_calendar_page':True},
 'files':{f.name:{'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for f in [rightpath,pairpath]}
}
(HERE/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'pair':str(pairpath),'opener':str(rightpath),'verified_shift_mm':4,'calendar_paragraph_lines':len(lines),'calendar_native_text':calendar_check[0].get_text()},indent=2))

