"""Render and compare exact approved pages and the smaller browsing derivative."""
from pathlib import Path
import json,math,re,logging
from collections import OrderedDict
import numpy as np
from PIL import Image,ImageDraw
import pypdfium2 as pdfium
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22'
M=json.loads((D/'SOURCES.json').read_text());C=json.loads((D/'NATIVE-CHECKS.json').read_text());P=json.loads((D/'READING-COPY.json').read_text())
assert P['sourceSHA256']==C['sha256'], 'Browsing copy is stale'
out=D/'pages';out.mkdir(exist_ok=True)
native=pdfium.PdfDocument(D/'integrated-native.pdf');review=pdfium.PdfDocument(R/P['readingCopy']);cache=OrderedDict()
def source(file):
 if file not in cache:
  if len(cache)>=3:_,old=cache.popitem(last=False);old.close()
  cache[file]=pdfium.PdfDocument(R/file)
 return cache[file]
def render(doc,i,scale=1):
 p=doc[i];b=p.render(scale=scale);im=b.to_pil().convert('RGB');b.close();p.close();return im
checks=[]
for i,row in enumerate(M['pages']):
 actual=render(native,i);small=render(review,i);a=np.asarray(actual,dtype=np.int16);b=np.asarray(small,dtype=np.int16)
 assert a.shape==b.shape
 diff=np.abs(a-b);mean=float(diff.mean());changed=float(np.mean(np.max(diff,axis=2)>20))
 assert mean<3 and changed<0.05,('Review derivative changes',i,mean,changed)
 item={'pdfPage':i+1,'folio':row['folio'],'reviewMeanChannelDifference':round(mean,4),'reviewFractionPixelsOver20':round(changed,6)}
 if 'cropXMM' not in row:
  expected=render(source(row['source']),row['sourcePage']-1);e=np.asarray(expected,dtype=np.int16);assert e.shape==a.shape
  delta=np.max(np.abs(a-e),axis=2);mask=np.zeros(delta.shape,dtype=bool)
  if row['folio'] in [2,156,164,170]:
   with pdfplumber.open(R/row['source']) as doc:
    sp=doc.pages[row['sourcePage']-1]
    if row['folio'] in [156,170]:
     boxes=[x for x in sp.images if x['name']==row['imageReplacement']['resource'].lstrip('/')];assert len(boxes)==1
     box=boxes[0]
    else:
     phrase='Imperial edition · [Edition and year]' if row['folio']==2 else 'The materials and their uses are shown schematically, not to scale.'
     boxes=sp.search(re.escape(phrase));assert len(boxes)==1,(row['folio'],boxes)
     box=boxes[0]
    x0=int(math.floor(box['x0']))-3;x1=int(math.ceil(box['x1']))+3;y0=int(math.floor(box['top']))-3;y1=int(math.ceil(box['bottom']))+3
    mask[max(0,y0):y1,max(0,x0):x1]=True
    item['authorisedChangeRectanglePt']=[x0,y0,x1,y1]
  outside=delta[~mask]
  item['sourcePixelsDifferentOutsideAuthorisedEdit']=int(np.count_nonzero(outside));item['sourceMaximumDifferenceOutsideAuthorisedEdit']=int(outside.max(initial=0))
  assert not np.any(outside),('Source rendering changed outside authorised edit',i,item)
 # Browser pages use the smaller PDF; the native comparison above has already passed.
 high=render(review,i,110/72);high.save(out/f'page-{i+1:03}.jpg',quality=89)
 checks.append(item)
 if (i+1)%20==0:print(f'Rendered and compared {i+1}/180 pages.',flush=True)
def contact(name,folios,cols=4,tilew=300,pdf_indices=False):
 indices=folios if pdf_indices else [f+1 for f in folios];h=round(tilew*240/185)+26
 sheet=Image.new('RGB',(cols*(tilew+10),math.ceil(len(indices)/cols)*(h+10)),'#e5e1d5');draw=ImageDraw.Draw(sheet)
 for j,idx in enumerate(indices):
  im=Image.open(out/f'page-{idx+1:03}.jpg');im.thumbnail((tilew,h-26));x=(j%cols)*(tilew+10);y=(j//cols)*(h+10)
  draw.text((x+5,y+6),f'Page {M["pages"][idx]["folio"]}' if M['pages'][idx]['folio'] else M['pages'][idx]['label'],fill='#173e2c');sheet.paste(im,(x,y+26))
 sheet.save(D/name,quality=92)
contact('openings-contact.jpg',[1,2,4,5,7,9,99,147],4,360)
contact('techniques-a-contact.jpg',list(range(148,160)),4,300)
contact('techniques-b-contact.jpg',list(range(160,172)),4,300)
contact('guide-openings-contact.jpg',list(range(10,98,2)),6,260)
contact('guide-practical-contact.jpg',list(range(11,98,2)),6,260)
contact('covers-and-index-contact.jpg',[0,179,173,174,175,176],3,340,True)
result={'date':'2026-11-22','nativeSHA256':C['sha256'],'readingCopySHA256':P['sha256'],'status':'All native/source and reading-copy pixel comparisons passed; visual inspection of rendered contacts pending','pagesRendered':180,'nativeSourceComparisons':178,'unchangedPixelsOutsideApprovedEdits':True,'nativeExactSourcePages':174,'reviewComparisonDPI':72,'browserRenderDPI':110,'maximumReviewMeanDifference':max(x['reviewMeanChannelDifference'] for x in checks),'checks':checks}
(D/'VISUAL-CHECKS.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='checks'}),flush=True)
