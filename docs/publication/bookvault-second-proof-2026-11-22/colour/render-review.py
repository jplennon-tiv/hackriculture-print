from pathlib import Path
import json,hashlib,math
import pypdfium2 as pdfium
from PIL import Image,ImageDraw,ImageFont
import numpy as np
ROOT=Path.cwd(); D=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/colour'; O=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/colour'
(D/'contacts').mkdir(exist_ok=True);(D/'detail').mkdir(exist_ok=True)
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
font=ImageFont.truetype(FONT,22);small=ImageFont.truetype(FONT,17)
source=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
cover=ROOT/'output/pdf/cover-print-resolution-review/Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf'
old=ROOT/'output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf'
doc=pdfium.PdfDocument(source); assert len(doc)==178
thumbs=[];records=[]; detailed=set([1,2,3,5,7,34,35,56,57,96,97,145,174]+list(range(146,170)))
for folio in range(1,175):
 p=doc[folio+1];im=p.render(scale=1).to_pil().convert('RGB');a=np.asarray(im)
 corners=[list(map(int,a[y,x])) for x,y in [(8,8),(im.width-9,8),(8,im.height-9),(im.width-9,im.height-9)]]
 records.append({'folio':folio,'pdfPage':folio+2,'cornersRGB':corners,'renderSize':list(im.size)})
 im.thumbnail((300,389),Image.Resampling.LANCZOS);thumbs.append(im.copy())
 if folio in detailed:
  detail=p.render(scale=150/72).to_pil().convert('RGB');detail.save(D/'detail'/f'folio-{folio:03}.jpg',quality=94,subsampling=0)
 p.close()
 if folio%24==0:print('Rendered interior',folio,flush=True)
contacts=[]
for start in range(0,174,16):
 sheet=Image.new('RGB',(1320,1800),'#e2e2e2');dr=ImageDraw.Draw(sheet);dr.text((26,16),f'Interior folios {start+1}-{min(start+16,174)} | existing approved artwork',font=font,fill='#173e2c')
 for j in range(start,min(start+16,174)):
  col=(j-start)%4;row=(j-start)//4;x=24+col*324;y=64+row*431;sheet.paste(thumbs[j],(x,y));dr.text((x,y+392),f'P{j+1}',font=small,fill='#173e2c')
 path=D/'contacts'/f'contact-{start+1:03}.jpg';sheet.save(path,quality=93,subsampling=0);contacts.append(path)
# More legible photographic spread contact sheets: 4 pages / landscape sheet.
for start in [1,5,145,149,153,157,161,165]:
 folios=([1,2,3,7] if start==1 else [5,97,145,146] if start==5 else list(range(start,min(start+4,170))))
 sheet=Image.new('RGB',(1800,1250),'#e2e2e2');dr=ImageDraw.Draw(sheet)
 dr.text((24,14),'Photographic review - '+', '.join('P'+str(n) for n in folios),font=font,fill='#173e2c')
 for j,f in enumerate(folios):
  p=doc[f+1];im=p.render(scale=1.4).to_pil().convert('RGB');im.thumbnail((420,1140),Image.Resampling.LANCZOS)
  x=24+j*444;sheet.paste(im,(x,64));dr.text((x,64+im.height+8),f'P{f}',font=small,fill='#173e2c');p.close()
 sheet.save(D/'contacts'/f'photos-{start:03}.jpg',quality=94,subsampling=0)
cp=pdfium.PdfDocument(cover); ci=cp[0].render(scale=150/72).to_pil().convert('RGB');ci.save(D/'detail'/'approved-cover-wrap.jpg',quality=96,subsampling=0)
# Historical production comparison shows colour treatment, not identical layouts.
od=pdfium.PdfDocument(old)
for current,earlier,label in [(34,14,'carrot'),(56,40,'kale'),(4,3,'cream-blank')]:
 ims=[]
 for d,idx in [(od,earlier-1),(doc,current+1)]:
  im=d[idx].render(scale=1.5).to_pil().convert('RGB');im.thumbnail((690,895),Image.Resampling.LANCZOS);ims.append(im)
 sheet=Image.new('RGB',(1440,1000),'#e2e2e2');dr=ImageDraw.Draw(sheet)
 dr.text((20,16),f'Accepted first-proof PDF, P{earlier}',font=font,fill='#173e2c');dr.text((740,16),f'Current source, P{current}',font=font,fill='#173e2c')
 for x,im in zip([20,740],ims):sheet.paste(im,(x,64))
 sheet.save(D/'detail'/f'comparison-{label}.jpg',quality=95,subsampling=0)
result={'source':str(source.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'interiorFolios':174,'pdfPages':178,'allPageContactDpi':72,'detailedFolios':sorted(detailed),'detailDpi':150,'cover':str(cover.relative_to(ROOT)),'coverSha256':hashlib.sha256(cover.read_bytes()).hexdigest(),'oldProofInterior':str(old.relative_to(ROOT)),'pageSamples':records,'status':'Rendered; visual review pending'}
(D/'RENDER-CHECKS.json').write_text(json.dumps(result,indent=2)+'\n')
print('Rendered contacts and detail; source PDFs unchanged',flush=True)
