from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from pypdf import PdfReader
ROOT=Path.cwd(); D=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/colour'; O=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/colour'
O.mkdir(exist_ok=True,parents=True)
# Remove unused canvas from the four-page viewing strips, preserving every page.
for path in sorted((D/'contacts').glob('photos-*.jpg')):
 im=Image.open(path)
 if im.height>650: im.crop((0,0,im.width,650)).save(path,quality=94,subsampling=0)
# Include the final greenhouse folio in the more legible photographic sequence.
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',22)
sheet=Image.new('RGB',(920,650),'#e2e2e2'); dr=ImageDraw.Draw(sheet)
dr.text((24,14),'Photographic review - P168 and P169',font=font,fill='#173e2c')
for j,f in enumerate([168,169]):
 im=Image.open(D/'detail'/f'folio-{f:03}.jpg'); im.thumbnail((420,550),Image.Resampling.LANCZOS)
 sheet.paste(im,(24+j*456,64));dr.text((24+j*456,615),f'P{f}',font=font,fill='#173e2c')
sheet.save(D/'contacts'/'photos-169.jpg',quality=94,subsampling=0)
pdf=O/'Vegetable-Guru-Print-Colour-Review.pdf'
c=canvas.Canvas(str(pdf),pagesize=(595.28,841.89));c.setTitle('The Vegetable Guru — second-proof colour review');c.setAuthor('The Vegetable Guru project')
c.setFillColor(HexColor('#fff8e9'));c.rect(0,0,595.28,841.89,fill=1,stroke=0)
style=ParagraphStyle('body',fontName='Helvetica',fontSize=11,leading=15,textColor=HexColor('#173e2c'),spaceAfter=11)
heading=ParagraphStyle('heading',parent=style,fontName='Helvetica-Bold',fontSize=20,leading=25,spaceAfter=15)
subhead=ParagraphStyle('subhead',parent=style,fontName='Helvetica-Bold',fontSize=13,leading=17,spaceAfter=8)
items=[
 ('The Vegetable Guru',heading),('Second-proof colour review · 22 November 2026',subhead),
 ('Native-artwork review only: no creative retouching was indicated. This is not final print approval. Production CMYK preparation is now required before the second proof; the controlled conversion study identifies selective shadow protection for five photographs (three interior and two rear-cover tiles).',style),
 ('Coverage',subhead),
 ('All 174 interior folios were checked on eleven complete-page contact sheets. Opening and technique photographs received larger contact views; compost, netting, winter kale, greenhouses, selected guide/troubles pages and the separately approved cover received detailed checks. The original 178-page preview contains four cover leaves, which are excluded from the interior assessment.',style),
 ('Findings',subhead),
 ('Blank folios 4, 6, 96 and 174 are uniformly cream: every sampled rendered pixel is RGB 255, 248, 233 (#fff8e9). Family tints, calendar colours and pale panels remain distinct and readable. Seasonal and daylight changes in the photographs are natural variation, not a reason for blanket normalisation.',style),
 ('Check on the physical proof',subhead),
 ('P154 main compost photo, P155 left compost photo and P168 lower greenhouse photo: relative-colourimetric conversion without black-point compensation compresses some dark texture. Selective compensation is recommended while preserving the established palette. P162 pale mesh retains detail. The exact production files must pass native text and all-page actual-render checks before submission.',style),
 ('Production boundary',subhead),
 ('This contact PDF shows the native source, not final production colour. Bookvault currently recommends FOGRA39 for UK coated stock; production derivatives are being prepared now using the exact accepted first-proof profile, with source ICCs honoured and transparency resolved. The production-colour report will record final file checks. Once approved, keep those PDFs and colour settings fixed for the print run.',style),
 ('Following pages: approved cover; photographic pages; first-proof comparisons; all 174 folios.',style)
]
y=800
for txt,s in items:
 p=Paragraph(txt,s);w,h=p.wrap(507,y-35);p.drawOn(c,44,y-h);y-=h+s.spaceAfter
assert y>30,y
c.bookmarkPage('summary');c.addOutlineEntry('Review summary','summary',0);c.showPage()
paths=[('Approved cover',D/'detail'/'approved-cover-wrap.jpg')]
paths += [(f'Photographic pages {p.stem.split("-")[-1]}',p) for p in sorted((D/'contacts').glob('photos-*.jpg'))]
paths += [('First-proof comparison: '+name,D/'detail'/f'comparison-{name}.jpg') for name in ['carrot','kale','cream-blank']]
paths += [(f'All folios from {p.stem.split("-")[-1]}',p) for p in sorted((D/'contacts').glob('contact-*.jpg'))]
for n,(label,path) in enumerate(paths,1):
 im=Image.open(path);w,h=im.size; pw,ph=w/2,h/2
 c.setPageSize((pw,ph));c.drawImage(str(path),0,0,pw,ph);c.bookmarkPage(f'page{n}');c.addOutlineEntry(label,f'page{n}',0);c.showPage()
c.save()
print(json.dumps({'pdf':str(pdf.relative_to(ROOT)),'pages':len(PdfReader(pdf).pages),'bytes':pdf.stat().st_size,'summaryBottom':y},indent=2))
