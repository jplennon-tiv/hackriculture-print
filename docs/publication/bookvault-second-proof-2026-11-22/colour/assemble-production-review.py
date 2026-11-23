from pathlib import Path
import json,hashlib,io
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';P=D/'production';O=R/'output/pdf/bookvault-second-proof-2026-11-22/colour';O.mkdir(exist_ok=True)
out=O/'Vegetable-Guru-Production-Colour-Checks.pdf';c=canvas.Canvas(str(out),pagesize=(842,595));c.setTitle('The Vegetable Guru - production colour checks');c.setAuthor('The Vegetable Guru project')
body=ParagraphStyle('body',fontName='Helvetica',fontSize=11,leading=15,textColor=HexColor('#173e2c'));head=ParagraphStyle('head',parent=body,fontName='Helvetica-Bold',fontSize=22,leading=27)
def para(s,x,y,w,style=body):
 p=Paragraph(s,style);_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return y-h-12
def page(title,subtitle='Actual CMYK PDF rendered through its FOGRA39 profile to sRGB for viewing; not a physical print simulation.'):
 c.setPageSize((842,595));c.setFillColor(HexColor('#f6f5f1'));c.rect(0,0,842,595,stroke=0,fill=1);para(title,28,571,786,head);para(subtitle,28,535,786)
def put(im,x,y,w,h):
 if not isinstance(im,Image.Image):im=Image.open(im)
 scale=min(w/im.width,h/im.height);nw=im.width*scale;nh=im.height*scale
 im=im.convert('RGB');im.thumbnail((round(nw*2),round(nh*2)),Image.Resampling.LANCZOS);buf=io.BytesIO();im.save(buf,format='JPEG',quality=93,subsampling=0);buf.seek(0)
 c.drawImage(ImageReader(buf),x+(w-nw)/2,y+(h-nh)/2,nw,nh)
def finish(label):
 c.setFillColor(HexColor('#53695a'));c.setFont('Helvetica',8);c.drawString(28,16,label);c.showPage()
page('Production colour prepared for the second proof','22 November 2026 | 174 interior pages and the separately prepared complete cover wrap')
y=492
for s in [
 '<b>Prepared now:</b> both production PDFs use the exact ISO Coated v2 300% (ECI) / FOGRA39 profile embedded in the accepted first proof. This follows Bookvault\'s current recommendation for UK coated stock. Source ICC profiles were honoured and artwork transparency flattened; native lettering remains vector.',
 '<b>Five bounded photograph corrections:</b> black-point compensation preserves useful dark texture in the P154 compost panorama, P155 left compost photo, P168 lower greenhouse photo, and two rear-cover photos (salad colander; John kneeling). Every CMYK pixel outside those photograph rectangles remains unchanged by that treatment.',
 '<b>Three cream corrections:</b> the P7, P97 and P145 section openers had the same intended cream tagged with a different RGB profile. Their flat background now matches the other cream pages and all four blank pages: CMYK bytes 0, 7, 29, 0. Photos, calendar panel, native lettering and every unselected pixel are unchanged.',
 '<b>Checked:</b> all 174 actual converted pages on eleven contact sheets; larger actual views of the corrected photos, pale netting, representative illustrations, openers and full cover. Independent pixel checks confirm the bounded corrections. Interior checks preserve all 340,299 native glyphs and font data; cover checks preserve genuine font-outline lettering and native text.',
 '<b>Outcome:</b> no further colour change is indicated by these checks. Natural seasonal and lighting variation is retained. The physical proof must still confirm printed cream, deep-photo detail and pale mesh on the chosen stock; screen views cannot measure the press, paper or matt laminate.',
 '<b>Hold fixed:</b> after the physical proof is accepted, use these same production PDFs, ICC profile and conversion settings for the print run. Metadata, supplier validation and ordering approval remain separate.'
]:y=para(s,28,y,786)
assert y>25,y
finish('Viewing report only - not a supplier upload or print approval. Exact file hashes and receipts are in the accompanying production-colour report.')
page('Complete cover - actual prepared CMYK file');put(P/'detail/cover.png',24,42,794,470);finish('Front, spine and rear; current final file a37c9d4216c14643bd7bb46c9fd066bf12fe400a6301365e01b997a8e0821a8e')
for folios,title in [([154,155],'Compost photographs - final prepared pages'),([162,168],'Pale mesh and greenhouse shadows - final prepared pages')]:
 page(title)
 for j,f in enumerate(folios):put(P/'detail'/f'folio-{f:03}.png',28+400*j,38,386,473)
 finish('Actual converted pages '+', '.join('P'+str(f) for f in folios)+'; composition and native text preserved.')
page('Three interior photographs - conversion comparison','Left: historical relative conversion. Right: final photo-only black-point compensation. Both are renders of actual CMYK PDFs.')
plan=json.loads((D/'SELECTIVE-PHOTO-BPC.json').read_text())
for row,rec in enumerate(plan['regions']):
 f=rec['folio'];box=tuple(round(v/4) for v in rec['pixelCentreBox600dpiPillow']);y=351-row*151
 para('P'+str(f),28,y+132,60)
 for j,name in enumerate([f'before-photo-{f:03}.png',f'folio-{f:03}.png']):
  im=Image.open(P/'detail'/name).crop(box);put(im,89+j*363,y,349,139)
finish('Photo bounds come from native PDF transforms/clips; all pixels outside the three selected regions are unchanged by the shadow treatment.')
page('Two rear-cover photographs - conversion comparison','Left: historical relative conversion. Right: final photo-only black-point compensation. Actual CMYK cover renders.')
coverplan=json.loads((R/'docs/publication/bookvault-second-proof-2026-11-22/cover/SELECTIVE-BPC-PHOTOS.json').read_text())
for row,rec in enumerate(coverplan):
 box=tuple(round(v/4) for v in rec['rgb_raster_crop_px']);y=279-row*225
 para('Salad colander' if row==0 else 'John kneeling',28,y+208,150)
 for j,path in enumerate([D/'intent-review/actual-cover-cmyk.png',P/'detail/cover.png']):put(Image.open(path).crop(box),183+j*309,y,294,211)
finish('The correction preserves clothing folds and shaded ground/bed detail. Front harvest and the established palette are unchanged.')
page('Section opener cream - final prepared pages','P7, P97 and P145 now use the same flat cream conversion as the neighbouring cream pages and four internal blanks.')
for j,f in enumerate([7,97,145]):put(P/'detail'/f'folio-{f:03}.png',24+j*268,46,258,463)
finish('Exact background masks exclude every photo placement and leave the calendar panel and native text unchanged.')
c.save();r=PdfReader(out);assert len(r.pages)==7
(D/'PRODUCTION-VIEWING-PDF.json').write_text(json.dumps({'file':str(out.relative_to(R)),'pages':len(r.pages),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'kind':'Display renders of actual prepared CMYK PDFs; not supplier file or physical print simulation'},indent=2)+'\n');print(out, out.stat().st_size)
