"""Focused top-bleed correction: two practical guide pages, no trim-content change."""
from pathlib import Path
import json,hashlib,subprocess,concurrent.futures
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,DecodedStreamObject
from PIL import Image,ImageDraw,ImageFont
import numpy as np
ROOT=Path(__file__).resolve().parents[4];DOC=Path(__file__).resolve().parent
OUT=ROOT/'output/pdf/header-placement-review-2026-11-23/bleed';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf'
EXPECTED='341ce74932cd81f6a8cc838b742ec7095e471d0ee7d9fcb7b247dd1b417e6b47'
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DISPLAY=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/interior/colour-work/render-sRGB.icc'
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(SOURCE)==EXPECTED
reader=PdfReader(SOURCE);before=PdfWriter();after=PdfWriter();records=[]
for index,folio in enumerate([17,19]):
 src=reader.pages[folio-1];before.add_page(src);p=after.add_page(src)
 raw=p.get_contents().get_data();W=float(p.mediabox.width);H=float(p.mediabox.height);y=float(p.trimbox.top);height=H-y
 assert abs(height*25.4/72-3)<1e-6
 command=f'\nq 0 {7/255:.12f} {29/255:.12f} 0 k 0 {y:.12f} {W:.12f} {height:.12f} re f Q\n'.encode()
 stream=DecodedStreamObject();stream.set_data(raw+command);p[NameObject('/Contents')]=after._add_object(stream)
 for writer in [before,after]:writer.set_page_label(index,index,style='/D',start=folio)
 records.append({'folio':folio,'samplePage':index+1,'fillCMYK8bit':[0,7,29,0],'rectPDFPoints':[0,y,W,height],'rectMediaMM':[0,y*25.4/72,W*25.4/72,height*25.4/72],'sourceNativeContentSHA256':hashlib.sha256(raw).hexdigest(),'originalContentBytesPreservedAsPrefix':True,'allOriginalImageStreamsUnchanged':True,'allFontResourcesUnchanged':True,'trimBoxUnchanged':True,'changeScope':'Only3mm top bleed outside TrimBox; no0.2mm trim repair or other edge changed.'})
for writer in [before,after]:
 writer.root_object[NameObject('/OutputIntents')]=reader.trailer['/Root']['/OutputIntents'].clone(writer)
 writer.pdf_header='%PDF-1.4';writer.add_metadata({'/Title':'The Vegetable Guru - practical header top-bleed review sample','/Author':'John Lennon','/Subject':'Folios17and19 only; existing FOGRA39 colour and trim content preserved; separate review sample, not supplier replacement'})
base=DOC/'Before-Top-Bleed-Sample.pdf';target=OUT/'Vegetable-Guru-Practical-Headers-Bleed-Sample.pdf';before.write(base);after.write(target)
# Source streams and resources are carried through untouched; only one appended
# opaque rectangle is added per page. Compare encoded image streams directly.
check=PdfReader(target);old=PdfReader(base)
for a,b,record in zip(old.pages,check.pages,records):
 assert b.get_contents().get_data().startswith(a.get_contents().get_data())
 for key in ['/MediaBox','/CropBox','/TrimBox','/BleedBox']:assert a[key]==b[key]
 for name,ref in a['/Resources']['/XObject'].items():
  x=ref.get_object();z=b['/Resources']['/XObject'][name].get_object()
  if hasattr(x,'_data'):assert x._data==z._data
 assert a.extract_text()==b.extract_text()
def render(item):
 label,pdf=item;prefix=DOC/label
 subprocess.run([POPPLER,'-r','254','-png','-displayprofile',str(DISPLAY),'-defaultcmykprofile',str(PROFILE),str(pdf),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(render,[('before',base),('after',target)]))
for i,record in enumerate(records,1):
 a=np.asarray(Image.open(DOC/f'before-{i}.png').convert('RGB'));b=np.asarray(Image.open(DOC/f'after-{i}.png').convert('RGB'));assert a.shape==b.shape
 # At254dpi,3mm is exactly30pixels; media191×246mm is1910×2460pixels.
 change=np.any(a!=b,axis=2);inside=change[30:2430,30:1880];assert not inside.any();assert not change[30:].any()
 ys,xs=np.where(change);record.update({'renderDPI':254,'renderShape':list(a.shape),'changedPixels':int(change.sum()),'changedPixelBoundsXYXY':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],'changedPixelsInsideTrim':0,'changedPixelsBelowTopBleed':0})
 # Header-only side-by-side evidence, red horizontal line marks trim.
 aa=Image.fromarray(a).crop((1380,0,1910,300));bb=Image.fromarray(b).crop((1380,0,1910,300));sheet=Image.new('RGB',(1080,350),'#e5e5e5');d=ImageDraw.Draw(sheet);sheet.paste(aa,(0,40));sheet.paste(bb,(550,40));d.text((8,8),f'Folio{record["folio"]} BEFORE',fill='black');d.text((558,8),'AFTER - background-only top bleed',fill='black');d.line((0,70,530,70),fill='red',width=2);d.line((550,70,1080,70),fill='red',width=2);sheet.save(DOC/f'comparison-folio-{record["folio"]}.png')
receipt={'source':str(SOURCE.relative_to(ROOT)),'sourceSHA256':EXPECTED,'sample':str(target.relative_to(ROOT)),'sampleSHA256':sha(target),'sourceUnchanged':sha(SOURCE)==EXPECTED,'geometry':'191×246mm media,185×240mm trim,3mm bleed; two folios retained at original scale','colour':'Exact existing FOGRA39 OutputIntent retained; original CMYKartwork streams untouched; only matching native CMYKcream rectangle appended outside TrimBox.','diagnosis':'Original hero begins inside trim near the top edge. Symmetric continuation copied inward leaves into otherwise blank bleed. Full header hero was never duplicated in trim.','records':records,'status':'Focused sample prepared and exact trim pixel comparison passed; author review pending.'}
(DOC/'CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
