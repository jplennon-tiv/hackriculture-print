"""Compare actual PDF/X-1a conversion to the checked reduced PDF/X-3 source."""
from pathlib import Path
from collections import Counter
import hashlib,importlib.util,json,multiprocessing as mp,re,unicodedata
import numpy as np
import pypdfium2 as pdfium
from pypdf import PdfReader
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[4]
spec=importlib.util.spec_from_file_location('pdfx_helpers',DOC.parent/'pdfx-retry/verify-pdfx.py');helpers=importlib.util.module_from_spec(spec);spec.loader.exec_module(helpers)
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3-Optimised.pdf'
OUTPUT=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf'
SELECTED={1,7,9,19,24,98,110,146,150,154,162,163,167,168,170,173}
def normal(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
def init():
 global a_doc,b_doc
 a_doc=pdfium.PdfDocument(str(SOURCE));b_doc=pdfium.PdfDocument(str(OUTPUT))
def compare(n):
 a,b=a_doc[n-1],b_doc[n-1];ta,tb=a.get_textpage(),b.get_textpage()
 at,bt=ta.get_text_range(),tb.get_text_range();ca,cb=ta.count_chars(),tb.count_chars()
 geometry=max((max(abs(x-y) for x,y in zip(ta.get_charbox(j),tb.get_charbox(j))) for j in range(ca)),default=0) if at==bt and ca==cb else None
 ai=a.render(scale=150/72).to_pil().convert('RGB');bi=b.render(scale=150/72).to_pil().convert('RGB')
 aa,bb=np.asarray(ai),np.asarray(bi);assert aa.shape==bb.shape,(n,aa.shape,bb.shape)
 delta=np.abs(aa.astype(np.int16)-bb.astype(np.int16))
 row={'folio':n,'rawTextExact':at==bt,'normalisedTextExact':normal(at)==normal(bt),'sourceCharacterCount':ca,'candidateCharacterCount':cb,'maximumGlyphBoxDifferencePoints':geometry,'meanAbsoluteChannelDifference':float(delta.mean()),'pixelsChanged':int(np.any(delta,axis=2).sum()),'pixelsOver10':int(np.any(delta>10,axis=2).sum()),'pixels':ai.width*ai.height}
 if not row['normalisedTextExact']:
  row['sourceOnlyCharacters']=dict(Counter(normal(at))-Counter(normal(bt)));row['candidateOnlyCharacters']=dict(Counter(normal(bt))-Counter(normal(at)))
 if n in SELECTED:
  for label,page in [('source',a),('pdfx1a',b)]:page.render(scale=300/72).to_pil().convert('RGB').save(DOC/f'{n:03d}-{label}.jpg',quality=97)
 bi.thumbnail((185,240));bi.save(DOC/'thumbnails'/f'{n:03d}.jpg',quality=90)
 ta.close();tb.close();a.close();b.close();return row
if __name__=='__main__':
 (DOC/'thumbnails').mkdir(exist_ok=True)
 a,b=PdfReader(SOURCE),PdfReader(OUTPUT)
 checks={'source':str(SOURCE.relative_to(ROOT)),'candidate':str(OUTPUT.relative_to(ROOT)),'candidateBytes':OUTPUT.stat().st_size,'candidateSHA256':hashlib.file_digest(OUTPUT.open('rb'),'sha256').hexdigest(),'pageCount':len(b.pages),'preflight':helpers.preflight(b)}
 assert len(a.pages)==len(b.pages)==174
 checks['maximumPageBoxDifferencePoints']=max(abs(float(x)-float(y)) for p,q in zip(a.pages,b.pages) for k in ('/MediaBox','/TrimBox','/BleedBox') for x,y in zip(p[k],q[k]))
 checks['sourceProfileSHA256']=helpers.digest(a.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data())
 checks['profileExact']=checks['sourceProfileSHA256']==checks['preflight']['profileSHA256']
 checks['conformance']=str(b.metadata.get('/GTS_PDFXConformance'));checks['encrypted']=b.is_encrypted;checks['pageRotations']=[int(p.get('/Rotate',0)) for p in b.pages]
 print('Structure checked',flush=True)
 ia,ib=helpers.image_inventory(a),helpers.image_inventory(b)
 checks['images']={'sourceUnique':len(ia),'candidateUnique':len(ib),'allImageDimensionsAndDecodedPixelsExact':ia==ib,'missing':sorted(ia.keys()-ib.keys()),'added':sorted(ib.keys()-ia.keys())}
 (DOC/'IMAGE-BYTES.json').write_text(json.dumps({'source':ia,'candidate':ib},indent=2)+'\n')
 print('Image pixels checked',checks['images']['allImageDimensionsAndDecodedPixelsExact'],flush=True)
 pages=[]
 with mp.Pool(3,initializer=init) as pool:
  for row in pool.imap(compare,range(1,175)):
   pages.append(row)
   if len(pages)%25==0:print('Pages rendered and text checked:',len(pages),flush=True)
 checks['pages']=pages;checks['allNormalisedTextExact']=all(r['normalisedTextExact'] for r in pages);checks['rawTextExactPages']=sum(r['rawTextExact'] for r in pages);checks['pixelIdenticalPagesAt150dpi']=sum(r['pixelsChanged']==0 for r in pages);checks['maximumPageMeanChannelDifference']=max(r['meanAbsoluteChannelDifference'] for r in pages)
 log=(DOC/'CONVERSION-LOG.txt').read_text();checks['conversionWarnings']=[l for l in log.splitlines() if re.search(r'warning|error|missing|substitut',l,re.I)]
 (DOC/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
 print(json.dumps({k:v for k,v in checks.items() if k not in ('pages','pageRotations')},indent=2),flush=True)
 assert checks['preflight']['pdfx']=='PDF/X-1:2001'
 assert str(b.metadata.get('/GTS_PDFXConformance'))=='PDF/X-1a:2001'
 assert not checks['preflight']['issues'] and not checks['conversionWarnings']
 assert checks['profileExact'] and checks['images']['allImageDimensionsAndDecodedPixelsExact']
 assert checks['maximumPageBoxDifferencePoints']<0.01 and checks['allNormalisedTextExact']
 assert not checks['encrypted'] and set(checks['pageRotations'])=={0}
