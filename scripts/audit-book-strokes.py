"""Read-only line-weight audit in final PDF points, including the drawing CTM.

pdfplumber/pdfminer expose raw line widths. Small SVG icons can transform those
widths substantially, so they are not physical-point measurements by themselves.
This inventory is not supplier validation or permission to thicken illustrations.
"""
import argparse, hashlib, json, math, logging
from pathlib import Path
from pdfminer.pdfdevice import PDFDevice
from pdfminer.pdfinterp import PDFPageInterpreter, PDFResourceManager
from pdfminer.pdfpage import PDFPage
from pdfminer.pdftypes import dict_value, resolve1
from pdfminer.psparser import literal_name
from pdfminer.utils import apply_matrix_pt
logging.getLogger('pdfminer').setLevel(logging.ERROR)

root=Path(__file__).resolve().parents[1]
evidence=root/'docs/publication/book-preparation'
parser=argparse.ArgumentParser()
parser.add_argument('--supplier',choices=['kdp','bookvault'],default='kdp')
parser.add_argument('--only')
args=parser.parse_args()

class StrokeInterpreter(PDFPageInterpreter):
    # pdfminer leaves `gs` unimplemented. Chromium puts SVG stroke width in
    # ExtGState /LW, so the raw zero otherwise reported is not a hairline.
    def do_gs(self,name):
        states=dict_value(self.resources.get('ExtGState',{}))
        state=dict_value(states.get(literal_name(name),{}))
        if 'LW' in state:self.graphicstate.linewidth=float(resolve1(state['LW']))

class Audit(PDFDevice):
    def __init__(self,manager):
        super().__init__(manager)
        self.page=0;self.strokes=[];self.thin_fills=[]

    def paint_path(self,gstate,stroke,fill,evenodd,path):
        if not path:return
        a,b,c,d,_,_=self.ctm
        # Singular values bound all possible normal widths of a curved path.
        trace=a*a+b*b+c*c+d*d;det=a*d-b*c
        delta=math.sqrt(max(0,trace*trace-4*det*det))
        low=math.sqrt(max(0,(trace-delta)/2));high=math.sqrt(max(0,(trace+delta)/2))
        pts=[apply_matrix_pt(self.ctm,p[-2:]) for p in path if len(p)>=3]
        if not pts:return
        bounds=[round(v,3) for v in [min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts),max(y for x,y in pts)]]
        if stroke:
            raw=abs(gstate.linewidth)
            self.strokes.append({'page':self.page,'rawWidth':raw,'minPt':round(raw*low,5),'maxPt':round(raw*high,5),'boundsPt':bounds})
        # Detect straight filled rectangle rules as well as stroked ones.
        # Excludes small dots. Other filled shapes need a separate visual audit.
        shape=''.join(p[0] for p in path)
        if fill and shape in ('mlllh','mllll') and len(pts)>=4:
            p0,p1,p2,p3=pts[:4]
            u=(p1[0]-p0[0],p1[1]-p0[1]);v=(p3[0]-p0[0],p3[1]-p0[1])
            lu=math.hypot(*u);lv=math.hypot(*v)
            if min(lu,lv)>0 and abs(u[0]*v[0]+u[1]*v[1])<1e-4*lu*lv and min(lu,lv)<.749 and max(lu,lv)>=8:
                self.thin_fills.append({'page':self.page,'widthPt':round(min(lu,lv),5),'lengthPt':round(max(lu,lv),5),'boundsPt':bounds})

receipt=json.loads((evidence/f'PRODUCTION-{args.supplier.upper()}.json').read_text())
results=[]
for item in receipt['results']:
    if item['status']!='ok' or item['signature']!=receipt['currentSignature']:continue
    if args.only and item['key'] not in args.only.split(','):continue
    file=root/item['pdf'];digest=hashlib.sha256(file.read_bytes()).hexdigest()
    assert digest==item['sha256'],item['id']
    manager=PDFResourceManager();device=Audit(manager);interpreter=StrokeInterpreter(manager,device)
    with file.open('rb') as stream:
        for i,page in enumerate(PDFPage.get_pages(stream)):
            device.page=i+1;interpreter.process_page(page)
    thin=[s for s in device.strokes if s['minPt']<.749]
    results.append({'id':item['id'],'sha256':digest,'strokedPaths':len(device.strokes),'minimumStrokePt':min((s['minPt'] for s in device.strokes),default=None),'thinStrokeCandidates':thin,'thinFilledRectangleCandidates':device.thin_fills})
report={'supplier':args.supplier,'scope':'Final-space stroke bounds from full drawing CTM; includes SVG/form transforms. Thin curves are candidates, not proof of a visible defect. Filled straight rectangles >=8 pt long included; other filled art, clipping and hidden paths not evaluated. No PDF modified.','results':results}
target=evidence/f'STROKE-AUDIT-{args.supplier.upper()}.json'
target.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'files':len(results),'withThinStrokes':sum(bool(r['thinStrokeCandidates']) for r in results),'withThinFilledRules':sum(bool(r['thinFilledRectangleCandidates']) for r in results),'minimumPt':min(r['minimumStrokePt'] for r in results if r['minimumStrokePt'] is not None),'evidence':str(target.relative_to(root))}))
