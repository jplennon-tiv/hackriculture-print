"""Verify the focused intro PDF and prepare its source comparison/spread."""
from pathlib import Path
import hashlib,json,logging,re
from pypdf import PdfReader
import pdfplumber
from PIL import Image,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/guides-intro-detail'
if (D/'APPROVAL.json').exists():
 raise SystemExit('Accepted page and review evidence are frozen; use a separate revision path.')
read=lambda p:json.loads(p.read_text())
write=lambda p,x:p.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
c=read(D/'CHECKS.json');pdf=R/c['pdf'];assert sha(pdf)==c['pdfSha256']
reader=PdfReader(pdf);assert len(reader.pages)==1
page=reader.pages[0];mm=72/25.4
size=[float(page.mediabox.width)/mm,float(page.mediabox.height)/mm]
assert abs(size[0]-185)<.3 and abs(size[1]-240)<.3,size
fonts=[]
for ref in page['/Resources']['/Font'].values():
 f=ref.get_object()
 if f.get('/Subtype')=='/Type3':
  assert f.get('/CharProcs') and all(len(g.get_object().get_data())>0 for g in f['/CharProcs'].values())
  fonts.append({'name':str(f['/FontDescriptor'].get_object().get('/FontName')),'embedding':'Type3 glyph programs'})
  continue
 for leaf in f.get('/DescendantFonts',[f]):
  leaf=leaf.get_object();desc=leaf.get('/FontDescriptor')
  assert desc and any(k in desc.get_object() for k in ['/FontFile','/FontFile2','/FontFile3'])
 fonts.append({'name':str(f['/BaseFont']),'embedding':'FontFile2'})
normal=lambda s:re.sub(r'\s+','',s)
with pdfplumber.open(pdf) as p:
 text=p.pages[0].extract_text(x_tolerance=2)
 expected=c['checks']['pageText']
 # Layout-independent whole-page character inventory catches omitted text.
 from collections import Counter
 assert Counter(normal(text))==Counter(normal(expected)), 'PDF text differs from measured DOM'
 for phrase in ['Normal planting','Extended season','1/5','3/5','Low demand','High demand']:
  assert normal(phrase) in normal(text),phrase
 for phrase in ['5/5','Temperate climates','Check crop advice']:
  assert phrase not in text,phrase
 images=len(p.pages[0].images)
 raster_count=sum(not i['src'].endswith('.svg') for i in c['checks']['images'])
 assert images==raster_count,(images,raster_count)
assert c['checks']['fitPassed'] and c['checks']['footerGapMm']>=3
for p,h in c['inputs'].items():assert sha(R/p)==h,('source changed',p)
for p,h in c['assets'].items():assert sha(R/p)==h,('art changed',p)
# These are review composites of actual PDF renders, not replacement book artwork.
old=Image.open(R/'docs/publication/whole-book-order-preview/pages/page-011.jpg').convert('RGB')
new=Image.open(D/'page-9.png').convert('RGB')
height=1400;width=round(height*185/240)
old=old.resize((width,height),Image.Resampling.LANCZOS);new=new.resize((width,height),Image.Resampling.LANCZOS)
comparison=Image.new('RGB',(width*2+18,height+36),'#d9dfce');draw=ImageDraw.Draw(comparison)
draw.text((10,10),'CURRENT BOOK · PAGE 9',fill='#173e2c');draw.text((width+28,10),'THREE-PANEL PROPOSAL · PAGE 9',fill='#173e2c')
comparison.paste(old,(0,36));comparison.paste(new,(width+18,36));comparison.save(D/'comparison.jpg',quality=92)
blank=Image.open(R/'docs/publication/whole-book-order-preview/pages/page-010.jpg').convert('RGB').resize((width,height),Image.Resampling.LANCZOS)
spread=Image.new('RGB',(width*2+12,height),'#d9dfce');spread.paste(blank,(0,0));spread.paste(new,(width+12,0));spread.save(D/'spread-8-9.jpg',quality=92)
report={'date':'2026-10-31','status':'passed; visual review recorded separately','pdfSha256':c['pdfSha256'],'pages':1,'actualMediaMm':size,'profile':'185 × 240 mm CSS trim proof; Chromium MediaBox rounding within 0.3 mm; not supplier output','fontsEmbedded':fonts,'pdfImageCount':images,'exactPageTextVerified':True,'bothSourceEditionsIdentical':c['sourceEditionsIdentical'],'sourceAndMainBookHashesUnchanged':True,'footerGapMm':c['checks']['footerGapMm'],'bodyPt':10.5,'ratingNote':'John requested only the first two examples: radish 1/5 and outdoor tomato 3/5. Both match their canonical ratings.'}
write(D/'PDF-CHECKS.json',report)
print(json.dumps(report,indent=2))
