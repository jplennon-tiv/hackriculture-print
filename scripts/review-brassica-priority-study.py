"""Verify the ranked Brassica experiment against the prior full-guide proof."""
from pathlib import Path
from collections import Counter
import hashlib,json,logging,subprocess
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image,ImageDraw,ImageFont
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];EV=ROOT/'docs/publication/brassica-priority-study';TMP=ROOT/'tmp/pdfs/brassica-priority-study';OUT=ROOT/'output/pdf/brassica-priority-study'
if (EV/'APPROVAL.json').exists():raise SystemExit('Approved study is frozen')
OUT.mkdir(parents=True,exist_ok=True)
DOM=json.loads((EV/'CHECKS.json').read_text());OLD=json.loads((ROOT/'docs/publication/brassica-flow-preview/CHECKS.json').read_text())
def images(resources):
 out=[]
 for ref in resources.get('/XObject',{}).get_object().values() if '/XObject' in resources else []:
  obj=ref.get_object()
  if obj.get('/Subtype')=='/Image':out.append((int(obj['/Width']),int(obj['/Height']),hashlib.sha256(obj.get_data()).hexdigest()))
  elif '/Resources' in obj:out+=images(obj['/Resources'])
 return out
def fonts(resources):
 out=[]
 for ref in resources.get('/Font',{}).get_object().values() if '/Font' in resources else []:
  f=ref.get_object()
  for ff in f.get('/DescendantFonts',[f]):
   font=ff.get_object();desc=font.get('/FontDescriptor')
   assert (font.get('/Subtype')=='/Type3' and '/CharProcs' in font) or (desc and any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3']))
   out.append(str(f.get('/BaseFont','Embedded Type3 glyphs')))
 for ref in resources.get('/XObject',{}).get_object().values() if '/XObject' in resources else []:
  obj=ref.get_object()
  if '/Resources' in obj:out+=fonts(obj['/Resources'])
 return out
def inspect(filename,metrics):
 reader=PdfReader(filename);assert len(reader.pages)==len(metrics)
 glyphs=Counter();art=Counter();embedded=set();labels=[]
 with pdfplumber.open(filename) as doc:
  for p,m,pdf in zip(doc.pages,metrics,reader.pages):
   label_chars=set()
   for entry in m['entries']:
    if not entry.get('featureLabel'):continue
    label=entry['featureLabel'];bounds=label['bounds']
    found=[(i,c) for i,c in enumerate(p.chars) if bounds['left']*.75-.5<=(c['x0']+c['x1'])/2<=bounds['right']*.75+.5 and bounds['top']*.75-.5<=(c['top']+c['bottom'])/2<=bounds['bottom']*.75+.5]
    assert ''.join(c['text'] for _,c in found if not c['text'].isspace())==''.join(label['text'].split()), 'Ribbon text differs from source'
    labels.append(label['text']);label_chars.update(i for i,_ in found)
   glyphs.update((c['text'],round(c['size'],2)) for i,c in enumerate(p.chars) if i not in label_chars and not c['text'].isspace() and c['top']>=m['bodyTopPx']*.75-.5 and c['bottom']<m['footerTopPx']*.75-1)
   art.update(images(pdf['/Resources']));embedded.update(fonts(pdf['/Resources']))
 return glyphs,art,sorted(embedded),labels
report={'status':'technical checks passed; composition proposed','results':[]}
for r in DOM['results']:
 units=r['units'];prior=next(x for x in OLD['results'] if x['units']==units)
 baseline=inspect(ROOT/f'output/pdf/brassica-flow-preview/brassica-troubles-{units}.pdf',prior['after'])
 for mode in ['strict','fit']:
  pages=r[mode]['pages'];filename=TMP/f'{units}-{mode}.pdf';glyphs,art,embedded,labels=inspect(filename,pages)
  assert labels==['Common Pest','Common Pest']
  assert +glyphs==baseline[0],f'Advice/type changed in {units}/{mode}: {+glyphs-baseline[0]}, {baseline[0]-(+glyphs)}'
  assert art==baseline[1] and sum(art.values())==29
  entries=[e for p in pages for e in p['entries']];assert len(entries)==29 and len({e['key'] for e in entries})==29
  assert all(entries[i]['rank']>=entries[i+1]['rank'] for i in range(len(entries)-1)), 'Selected proof reverses importance ranks'
  assert sum(e['featured'] for e in entries)==2
  assert all(not(a['featured'] and b['featured']) for a,b in zip(entries,entries[1:]))
  writer=PdfWriter()
  for i,p in enumerate(PdfReader(filename).pages):
   p.mediabox=RectangleObject([0,0,185*72/25.4,240*72/25.4]);p.cropbox=p.mediabox;writer.add_page(p);writer.add_outline_item(f'Brassica - {106+i}',i)
  writer.add_metadata({'/Title':f'Brassica: {"importance order" if mode=="strict" else "importance and page fit"} ({units})','/Subject':'Review experiment. Two Common Pest ribbons on pale panels. No alphabetical tie-break. 185 x 240 mm trim, not supplier output.'})
  dest=OUT/f'brassica-{mode}-{units}.pdf'
  with dest.open('wb') as f:writer.write(f)
  subprocess.run(['pdftoppm','-scale-to','1600','-png',str(dest),str(EV/f'{units}-{mode}')],check=True)
  report['results'].append({'units':units,'mode':mode,'pages':len(pages),'entries':29,'rankOrderPreserved':True,'starsSeparated':True,'featureLabelsAdded':2,'allOtherBodyGlyphsAndTypePreserved':True,'originalEmbeddedImagesIdentical':29,'fontsEmbedded':embedded,'minimumFooterGapMm':min(p['footerClearanceMm'] for p in pages),'output':str(dest.relative_to(ROOT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 a4=PdfReader(TMP/f'{units}-a4.pdf');assert len(a4.pages)==r['a4']['pages']==6
report['a4ActualPdfCounts']={'imperial':6,'metric':6}
report['bothUnitsPixelIdentical']={mode:all((EV/f'imperial-{mode}-{i}.png').read_bytes()==(EV/f'metric-{mode}-{i}.png').read_bytes() for i in range(1,7)) for mode in ['strict','fit']}
assert all(report['bothUnitsPixelIdentical'].values())
for mode in ['strict','fit']:
 for i in range(1,7,2):
  left=Image.open(EV/f'imperial-{mode}-{i}.png').convert('RGB');right=Image.open(EV/f'imperial-{mode}-{i+1}.png').convert('RGB')
  spread=Image.new('RGB',(left.width*2+12,left.height),'#e4e7de');spread.paste(left,(0,0));spread.paste(right,(left.width+12,0));spread.save(EV/f'{mode}-spread-{105+i}-{106+i}.jpg',quality=91)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',24);w,h=370,480
canvas=Image.new('RGB',(6*w,1040),'#e4e7de');draw=ImageDraw.Draw(canvas)
for mode,y,title in [('strict',40,'Importance only: existing order within tied ranks'),('fit',560,'Importance plus fit: no rank reversals; three entries advance one page')]:
 draw.text((15,y-33),title,font=font,fill='#21452c')
 for i in range(1,7):canvas.paste(Image.open(EV/f'imperial-{mode}-{i}.png').convert('RGB').resize((w,h),Image.Resampling.LANCZOS),((i-1)*w,y))
canvas.save(EV/'comparison-overview.jpg',quality=92)
(EV/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'outputs':len(report['results']),'pageCounts':[x['pages'] for x in report['results']],'bodyAndArtPreserved':True,'bothUnitsPixelIdentical':report['bothUnitsPixelIdentical']}))
