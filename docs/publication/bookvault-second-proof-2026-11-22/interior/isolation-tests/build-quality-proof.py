"""A review document, not a replacement book or production approval."""
from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from PIL import Image

DOC=Path(__file__).resolve().parent
ROOT=DOC.parents[4]
OUT=ROOT/'output/pdf/bookvault-isolation-2026-11-23/Vegetable-Guru-Quality-Comparison.pdf'
STYLE=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=14,textColor=colors.HexColor('#203c32'))
SMALL=ParagraphStyle('small',parent=STYLE,fontSize=9,leading=12)
TITLE=ParagraphStyle('title',parent=STYLE,fontName='Helvetica-Bold',fontSize=22,leading=26)
NOTES={
 2:'The diagnostic uses Bold instead of the approved SemiBold for ordinary contents entries. This is a visible style change; it did not resolve rejection by itself. Restore the approved weight in the proposed final derivative.',
 7:'All task names, month positions and bright/muted states remain. The raster calendar edges are slightly softer after reducing the artwork from 600 to 300 dpi.',
 24:'The approved header repair remains in place. Title, separate trailing square and difficulty badge stay intact. The 300 dpi reduction affects artwork detail; body lettering remains vector text at this stage.',
 25:'Fine hand, soil and root detail is slightly softer at 300 dpi. No missing subject or changed geometry was found. Retaining the 600 dpi fine-art layer would preserve more detail.',
 67:'The two unusual single-character fractions were replaced with ordinary 5/8 text, as requested. The quantity is unchanged. The line remains within its panel.',
 98:'The title and angled Vegetable troubles badge retain their approved positions. Outlining is tested separately; this comparison isolates the earlier conversion and resampling changes.',
 146:'Labels and arrows remain intact. Reducing the flattened diagram slightly softens its edges. Recommend retaining the earlier 600 dpi diagram layer.',
 154:'Wood, brickwork and compost detail remain recognisable; the 300 dpi diagnostic is slightly softer on enlargement. The existing CMYK profile is unchanged.',
 162:'The fine mesh remains visible at 300 dpi. Its finest repeating pattern is less distinct. The original full-resolution master is preserved.',
 167:'Dimensions, labels, diagonal marks and doorway are unchanged. Small raster edges are softer at 300 dpi. Recommend restoring the 600 dpi diagram layer.'}

def para(c,text,x,y,w,style=STYLE):
    p=Paragraph(text,style);_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return y-h

def footer(c,n):
    c.setFillColor(colors.HexColor('#63776f'));c.setFont('Helvetica',8)
    c.drawString(15*mm,10*mm,'The Vegetable Guru · Diagnostic quality review · 23 November 2026')
    c.drawRightString(282*mm,10*mm,str(n))

def main():
    OUT.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(OUT),pagesize=landscape(A4));c.setTitle('The Vegetable Guru - diagnostic quality comparison')
    y=195*mm
    y=para(c,'What changed during upload troubleshooting',15*mm,y,267*mm,TITLE)-5*mm
    y=para(c,'This comparison starts with the approved corrected-header production PDF. It checks subsequent upload workarounds; it does not reopen approved artwork or editorial decisions.',15*mm,y,267*mm)-5*mm
    rows=[['Change','Finding','Recommendation'],
      ['Approved header and colour preparation','Retained in every diagnostic tested here. The exact FOGRA39 profile is unchanged.','Keep.'],
      ['Two fraction characters','Same 5/8 quantity, clearer standard-font representation; line fit retained.','Keep the requested cleanup.'],
      ['Contents SemiBold changed to Bold','Visible heavier lettering; this font substitution failed as a supplier fix.','Restore the approved weight in a proposed final derivative.'],
      ['All raster artwork reduced to 300 dpi','No missing artwork found. Fine diagrams and planting details soften on enlargement.','Keep originals; prefer 600 dpi for the 47 fine-art pages if accepted.'],
      ['99% scale and outward shift','About 20.1 mm minimum inner text margin, but only 5.2 mm outside; everything becomes 1% smaller.','Choose binding margins deliberately after isolation; do not retain merely as a presumed upload fix.'],
      ['Text converted to outlines','Genuine vector glyph curves, not traced pixels. Images retained exactly. Printable text is no longer searchable.','Use only for the printer derivative if needed; preserve editable/searchable master.']]
    data=[[Paragraph(t,SMALL) for t in row] for row in rows]
    table=Table(data,colWidths=[57*mm,115*mm,95*mm]);table.setStyle(TableStyle([
      ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dce8d7')),
      ('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
      ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
      ('LINEBELOW',(0,0),(-1,-1),0.3,colors.HexColor('#b9c9bf'))]))
    _,h=table.wrap(267*mm,1000);table.drawOn(c,15*mm,y-h);y-=h+5*mm
    assert y>20*mm,(y/mm,h/mm)
    para(c,'Coverage: all 174 pages rendered at 120 dpi, extracted body text reconciled, and the following details inspected at 300 dpi. The PDF is a screen comparison, not a colour contract or a physical-print guarantee. Crops may cut surrounding text intentionally.',15*mm,y,267*mm,SMALL)
    footer(c,1);c.showPage()
    samples=json.loads((DOC/'quality/DETAILS.json').read_text())
    for i,s in enumerate(samples,2):
        n=s['page'];y=195*mm
        y=para(c,f'Page {n} · {s["label"]}',15*mm,y,267*mm,TITLE)-5*mm
        y=para(c,NOTES[n],15*mm,y,267*mm)-8*mm
        for x,label,name in [(15*mm,'Approved production master','approved'),(153*mm,'300 dpi diagnostic','diagnostic')]:
            c.setFont('Helvetica-Bold',11);c.setFillColor(colors.HexColor('#203c32'));c.drawString(x,y,label)
            image=DOC/'quality/details'/f'{n:03d}-{name}.png';im=Image.open(image)
            scale=min(129*mm/im.width,(y-30*mm)/im.height)
            w,h=im.width*scale,im.height*scale
            c.drawImage(str(image),x,y-5*mm-h,width=w,height=h)
        footer(c,i);c.showPage()
    c.save();print(OUT)

if __name__=='__main__':main()
