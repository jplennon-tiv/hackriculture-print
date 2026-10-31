"""Check and assemble the requested complete Troubles section, preserving source text and artwork."""
from pathlib import Path
from collections import Counter
import hashlib,json,logging,subprocess
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];EV=ROOT/'docs/publication/troubles-rollout';TMP=ROOT/'tmp/pdfs/troubles-rollout';OUT=ROOT/'output/pdf/troubles-rollout'
assert not (EV/'APPROVAL.json').exists(), 'Approved Troubles proofs are frozen; use a new revision destination.'
OUT.mkdir(parents=True,exist_ok=True)
DOM=json.loads((EV/'CHECKS.json').read_text());BASE=json.loads((EV/'BASELINES.json').read_text())
assert len(DOM['results'])==28
# Only this runner's unapproved generated renders; leave references and masks alone.
for r in DOM['results']:
 for p in EV.glob(f'{r["key"]}-{r["units"]}-[0-9]*.png'):p.unlink()
for p in EV.glob('spread-[0-9]*.jpg'):p.unlink()
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

report={'status':'technical PDF checks; user review remains separate','results':[],'a4Counts':{},'combined':[]}
for r in DOM['results']:
 key=r['key'];units=r['units'];stem=f'{key}-{units}';pages=r['pages'];prior=next(x for x in BASE['results'] if x['key']==key and x['units']==units)
 baseline=inspect(TMP/f'{stem}-before.pdf',prior['before'])
 filename=TMP/f'{stem}.pdf';glyphs,art,embedded,labels=inspect(filename,pages)
 assert glyphs==baseline[0],f'Advice/type changed: {stem}: {glyphs-baseline[0]}, {baseline[0]-glyphs}'
 assert art==baseline[1],f'Artwork changed: {stem}'
 entries=[e for p in pages for e in p['entries']]
 assert len(entries)==sum(art.values()),f'Image/entry count: {stem}'
 writer=PdfWriter()
 for i,p in enumerate(PdfReader(filename).pages):
  p.mediabox=RectangleObject([0,0,185*72/25.4,240*72/25.4]);p.cropbox=p.mediabox;writer.add_page(p)
  writer.add_outline_item(f'{r["label"]} — {r["startPage"]+i}',i)
 writer.add_metadata({'/Title':f'{r["label"]} ({units})','/Subject':'31 October 2026 Troubles rollout. 185 × 240 mm trim review; not supplier output.'})
 dest=OUT/f'{stem}.pdf'
 with dest.open('wb') as f:writer.write(f)
 subprocess.run(['pdftoppm','-scale-to','1600','-png',str(dest),str(EV/stem)],check=True)
 a4=PdfReader(TMP/f'{stem}-a4.pdf');assert len(a4.pages)==prior['a4']['pages']
 report['a4Counts'][stem]=len(a4.pages)
 report['results'].append({'key':key,'units':units,'pages':len(pages),'entries':len(entries),'featureLabels':labels,'allBodyGlyphsAndTypePreserved':True,'originalEmbeddedImagesIdentical':sum(art.values()),'fontsEmbedded':embedded,'minimumFooterGapMm':min(p['footerClearanceMm'] for p in pages),'output':str(dest.relative_to(ROOT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 print(stem,len(pages),'PDF checks passed',flush=True)
 # Save incremental results for long reviews.
 (EV/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')

opener=ROOT/'output/pdf/troubles-header-refinement/troubles-revised.pdf'
for units in ['imperial','metric']:
 results=[r for r in DOM['results'] if r['units']==units];writer=PdfWriter();writer.add_page(PdfReader(opener).pages[0]);writer.add_outline_item('Vegetable Troubles — 99',0)
 for r in results:
  dest=OUT/f'{r["key"]}-{units}.pdf';offset=len(writer.pages);writer.add_outline_item(f'{r["label"]} — {r["startPage"]}',offset)
  for p in PdfReader(dest).pages:writer.add_page(p)
 assert len(writer.pages)==1+sum(len(r['pages']) for r in results)
 writer.add_metadata({'/Title':f'The Vegetable Guru — complete revised Troubles ({units})','/Subject':'Full 14-guide review with 24 selected features, 220 conditions, source artwork and advice retained. Includes existing revised section opener. Not the assembled book or supplier files.'})
 dest=OUT/f'vegetable-troubles-{units}.pdf'
 with dest.open('wb') as f:writer.write(f)
 report['combined'].append({'units':units,'pages':len(writer.pages),'firstFolio':99,'lastFolio':98+len(writer.pages),'output':str(dest.relative_to(ROOT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 labels=Counter(l for r in report['results'] if r['units']==units for l in r['featureLabels']);assert sum(labels.values())==24
 report.setdefault('ribbons',{})[units]=dict(labels)

report['bothUnitsPixelIdentical']={}
folios={}
for r in DOM['results']:
 if r['units']!='imperial':continue
 other=next(x for x in DOM['results'] if x['units']=='metric' and x['key']==r['key'])
 equal=len(r['pages'])==len(other['pages']) and all((EV/f'{r["key"]}-imperial-{i}.png').read_bytes()==(EV/f'{r["key"]}-metric-{i}.png').read_bytes() for i in range(1,len(r['pages'])+1))
 report['bothUnitsPixelIdentical'][r['key']]=equal
 for i,p in enumerate(r['pages'],1):folios[p['folio']]=EV/f'{r["key"]}-imperial-{i}.png'
 # A guide overview for navigation, supplementary to the actual page/spread review.
 thumbs=[Image.open(EV/f'{r["key"]}-imperial-{i}.png').convert('RGB') for i in range(1,len(r['pages'])+1)]
 canvas=Image.new('RGB',(370*len(thumbs),480),'#e4e7de')
 for i,img in enumerate(thumbs):canvas.paste(img.resize((370,480),Image.Resampling.LANCZOS),(370*i,0))
 canvas.save(EV/f'{r["key"]}-overview.jpg',quality=92)
for folio,p in folios.items():
 if folio%2 or folio+1 not in folios:continue
 left=Image.open(p).convert('RGB');right=Image.open(folios[folio+1]).convert('RGB');canvas=Image.new('RGB',(left.width+right.width+12,left.height),'#e4e7de');canvas.paste(left,(0,0));canvas.paste(right,(left.width+12,0));canvas.save(EV/f'spread-{folio}-{folio+1}.jpg',quality=94)
(EV/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'combined':report['combined'],'ribbons':report['ribbons'],'bothUnitsPixelIdentical':report['bothUnitsPixelIdentical']}))
