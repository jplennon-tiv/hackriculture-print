"""Compare actual native/final visible ink inside all extracted glyph bounds.

The position check is independent of text extraction's claimed coordinates:
Poppler renders the complete paint stack sequentially, then actual dark pixels
are compared. One device pixel of antialiasing tolerance is allowed.
"""
from pathlib import Path
import json,logging,argparse,hashlib
import numpy as np
import pdfplumber
from PIL import Image,ImageFilter,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[3];WORK=DOC/'colour-work'
SRC=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf'
parser=argparse.ArgumentParser();parser.add_argument('--folios',nargs='*',type=int);args=parser.parse_args()
record_map={r['folio']:r for r in json.loads((DOC/'ACTUAL-VISIBLE-INK-CHECK.json').read_text())['pages']} if args.folios else {}
with pdfplumber.open(SRC) as pdf:
 for folio,page in enumerate(pdf.pages,1):
  if args.folios and folio not in args.folios:continue
  a=np.asarray(Image.open(WORK/'actual-native'/f'page-{folio:03}.png').convert('RGB'))
  b=np.asarray(Image.open(WORK/'actual-cmyk'/f'page-{folio:03}.png').convert('RGB'))
  assert a.shape==b.shape
  mask=Image.new('1',(a.shape[1],a.shape[0]));draw=ImageDraw.Draw(mask)
  for c in page.chars:
   if c['text'].isspace():continue
   # two pixels/point at 144 dpi; native media origin.
   draw.rectangle((int(c['x0']*2),int(c['top']*2),int(c['x1']*2+1),int(c['bottom']*2+1)),fill=1)
  m=np.asarray(mask);ia=(a.min(2)<100)&m;ib=(b.min(2)<100)&m
  da=np.asarray(Image.fromarray(ia.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
  db=np.asarray(Image.fromarray(ib.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
  missing=ia&~db;added=ib&~da
  record={'folio':folio,'sourceDarkPixelsInsideGlyphBounds':int(ia.sum()),'finalDarkPixelsInsideGlyphBounds':int(ib.sum()),'missingBeyondOnePixel':int(missing.sum()),'addedBeyondOnePixel':int(added.sum()),'missingFraction':float(missing.sum()/max(1,ia.sum())),'addedFraction':float(added.sum()/max(1,ib.sum()))}
  record_map[folio]=record;page.close()
  if folio%20==0:print('Visible ink comparison',folio,flush=True)
records=[record_map[n] for n in sorted(record_map)]
receipt={'sourceSHA256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'finalSHA256':hashlib.sha256((SRC.parent/'Vegetable-Guru-Interior-Colour-Managed.pdf').read_bytes()).hexdigest(),'method':'Sequential Poppler144dpi complete-page renders with explicit source/display ICC; actual dark ink inside all native character bounds, allowing one pixel AA tolerance. This is a visibility comparison, not a substitute for visual review. Colour and photographs are reviewed separately.','pages':records,'worstMissing':sorted(records,key=lambda x:x['missingFraction'],reverse=True)[:12],'worstAdded':sorted(records,key=lambda x:x['addedFraction'],reverse=True)[:12]}
(DOC/'ACTUAL-VISIBLE-INK-CHECK.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='pages'},indent=2))
