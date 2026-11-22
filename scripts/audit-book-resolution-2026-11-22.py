"""Read-only placed-resolution inventory of the native, approved-art assembly."""
from pathlib import Path
import json,math,logging
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22'
m=json.loads((D/'SOURCES.json').read_text());rows=[];page_rows=[]
with pdfplumber.open(D/'integrated-native.pdf') as doc:
 for i,p in enumerate(doc.pages):
  visible=[]
  for im in p.images:
   x0,x1,top,bottom=im['x0'],im['x1'],im['top'],im['bottom']
   overlap_w=max(0,min(x1,p.width)-max(x0,0));overlap_h=max(0,min(bottom,p.height)-max(top,0))
   if overlap_w<1 or overlap_h<1:continue
   sw,sh=im['srcsize'];w,h=abs(im['width']),abs(im['height'])
   if not w or not h:continue
   row={'pdfPage':i+1,'folio':m['pages'][i]['folio'],'label':m['pages'][i]['label'],'name':im.get('name'),'pixels':[sw,sh],'placedMM':[round(w*25.4/72,2),round(h*25.4/72,2)],'dpi':[round(sw*72/w,1),round(sh*72/h,1)],'visibleAreaMM2':round(overlap_w*overlap_h*(25.4/72)**2,1)}
   row['minimumDPI']=min(row['dpi']);row['source']=m['pages'][i]['source'];rows.append(row);visible.append(row)
  page_rows.append({'pdfPage':i+1,'folio':m['pages'][i]['folio'],'visibleImagePlacements':len(visible),'lowestDPI':min([x['minimumDPI'] for x in visible],default=None)})
  p.close()
  if (i+1)%30==0:print(f'Inventoried image placements on {i+1}/180 pages.',flush=True)
low=[x for x in rows if x['minimumDPI']<200 and x['visibleAreaMM2']>=100]
result={'date':'2026-11-22','nativeSHA256':json.loads((D/'NATIVE-CHECKS.json').read_text())['sha256'],'status':'Placed-resolution check complete; flags are review findings, not automatic rejection or supplier approval','source':'docs/publication/whole-book-order-preview/integration-2026-11-22/integrated-native.pdf','scope':'Native source pixels and final physical placements; no upscaling, image replacement or supplier transformation','reviewThresholdDPI':200,'minimumVisibleAreaMM2':100,'placementCount':len(rows),'flaggedPlacements':low,'pages':page_rows,'placements':rows}
(D/'IMAGE-RESOLUTION.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'imagePlacements':len(rows),'flags':low},ensure_ascii=False),flush=True)
