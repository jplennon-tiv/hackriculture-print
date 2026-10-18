"""Read-only verification of the focused technique PDFs against the assembled book."""
from pathlib import Path
from collections import Counter
import hashlib, json, logging, re, unicodedata
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[4]
directory=Path(__file__).resolve().parent
norm=lambda s:re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s or '')).strip()
checks=json.loads((directory/'CHECKS.json').read_text())['results'][0]
component=next(c for c in json.loads((root/'docs/publication/whole-book-order-preview/COMPONENT-CHECKS.json').read_text())['components'] if c['id']=='techniques')
bookpath=root/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
newpath=root/'output/pdf/reader-edit-pass/techniques/techniques-imperial-clean.pdf'
result={'sourceBook':str(bookpath),'sourceBookSha256':hashlib.sha256(bookpath.read_bytes()).hexdigest(),'derivativePdf':str(newpath),'derivativePdfSha256':hashlib.sha256(newpath.read_bytes()).hexdigest(),'method':'Compare normalised Unicode/whitespace per text block. Verify each block from actual PDF characters whose centres lie within its measured DOM bounds; this avoids adjacent glyph ascent/descent contamination. Images excluded; running footer checked separately.','pages':[]}
assert result['sourceBookSha256']=='39d437e8571d92aca177c31a2da4e2f371dada19a5f66465e4826678ac747cd6'
with pdfplumber.open(bookpath) as oldpdf,pdfplumber.open(newpath) as newpdf:
 for i,p in enumerate(checks['pages']):
  old=next(x for x in component['dom'] if x['folio']==p['folio']);before=[];after=[];mismatches=[]
  for kind,blocks,pdfpage in [('assembled',old['blocks'],oldpdf.pages[p['folio']+1]),('derivative',p['blocks'],newpdf.pages[i])]:
   for b in blocks:
    if b.get('tag')=='IMG':continue
    text=norm(b['text'])
    if 'THE VEGETABLE GURU' in text or b.get('tag')=='FOOTER':continue
    suffix='Mm' if kind=='derivative' else ''
    x0,y0,x1,y1=[b[k+suffix]*72/25.4 for k in ['left','top','right','bottom']]
    chars=[c for c in pdfpage.chars if x0<=(c['x0']+c['x1'])/2<=x1 and y0<=(c['top']+c['bottom'])/2<=y1]
    actual=norm(pdfplumber.utils.extract_text(chars,x_tolerance=3,y_tolerance=2))
    if actual!=text:mismatches.append({'kind':kind,'expected':text,'actual':actual})
    (before if kind=='assembled' else after).append(text)
   footer=pdfpage.crop((0,227*72/25.4,pdfpage.width,pdfpage.height)).extract_text()
   assert norm(footer)==f"GROWING TECHNIQUES {p['folio']}",(kind,p['folio'],footer)
  bc,ac=Counter(before),Counter(after)
  result['pages'].append({'folio':p['folio'],'unchangedTextBlockCount':sum((bc&ac).values()),'beforeOnly':list((bc-ac).elements()),'afterOnly':list((ac-bc).elements()),'actualPdfBlockChecks':len(before)+len(after),'extractionMismatches':mismatches,'runningFooterMatches':True})
expected={154:(0,0),155:(1,1),156:(13,17),157:(3,3),160:(0,0),161:(2,2)}
for p in result['pages']:
 assert not p['extractionMismatches'],p['extractionMismatches']
 assert (len(p['beforeOnly']),len(p['afterOnly']))==expected[p['folio']]
result['pass']=True
(directory/'TEXT-PRESERVATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pass':True,'actualPdfBlockChecks':sum(p['actualPdfBlockChecks'] for p in result['pages']),'unchangedTextBlocks':sum(p['unchangedTextBlockCount'] for p in result['pages']),'folios':[p['folio'] for p in result['pages']]}))
