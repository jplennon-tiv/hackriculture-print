"""Install the exact approved page 7 without re-rendering any other book page."""
from pathlib import Path
import hashlib,json,os,re,sys
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject
R=Path(__file__).resolve().parents[1]
D=R/'docs/publication/whole-book-order-preview'
A=R/'docs/publication/introduction-revision/APPROVAL.json'
OUT=R/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
sha=lambda p:hashlib.file_digest(open(p,'rb'),'sha256').hexdigest()
j=lambda p:json.loads(p.read_text())
def save(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
approval=j(A)
for f in approval['files']:assert sha(R/f['path'])==f['sha256'],f['path']
source=R/approval['frozenReference']/'Introduction.pdf'
replacement=PdfReader(source).pages[0]
reader=PdfReader(OUT)
assert len(reader.pages)==180
index=approval['pdfPage']-1
def stream(p):
 contents=p.get_contents()
 return contents.get_data() if contents is not None else b''
if hashlib.sha256(stream(reader.pages[index])).digest()==hashlib.sha256(stream(replacement)).digest():
 print('Approved introduction already installed.');sys.exit(0)
assert 'Introduction' in reader.pages[index].extract_text()
previous=j(D/'CHECKS.json');before_hash=sha(OUT)
assert before_hash==previous['sha256'],'Current PDF differs from recorded baseline'
I=D/'integration-2026-11-15-introduction';I.mkdir(exist_ok=True)
backup=I/('before-'+before_hash[:12]+'.pdf')
if not backup.exists():os.link(OUT,backup)
for name in ['CHECKS.json','PAGE-MAP.json','COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json','VISUAL-REVIEW.json']:
 dest=I/('before-'+name)
 if not dest.exists():dest.write_bytes((D/name).read_bytes())
old_proof=j(R/previous['integrationReceipt'])
def links(doc):
 ids={p.indirect_reference.idnum:i for i,p in enumerate(doc.pages)};out=[]
 for i,p in enumerate(doc.pages):
  for ref in p.get('/Annots',[]):
   a=ref.get_object();assert '/A' not in a
   dest=a['/Dest'];out.append((i,ids[dest[0].idnum],str(list(dest[1:])),str(a.get('/Rect'))))
 return out
def outlines(doc,items=None):
 out=[]
 for item in doc.outline if items is None else items:
  if isinstance(item,list):out.extend(outlines(doc,item))
  else:out.append((item.title,doc.get_destination_page_number(item)))
 return out
before_links=links(reader);before_outline=outlines(reader)
writer=PdfWriter(clone_from=reader)
target=writer.pages[index]
assert not target.get('/Annots'),'Unexpected annotations on old introduction'
# Keep the existing page object and its identity: links and outline destinations survive.
for key in ['/Resources','/Contents','/MediaBox','/CropBox','/TrimBox','/BleedBox','/ArtBox','/Rotate','/Group']:
 if key in replacement:target[NameObject(key)]=replacement.raw_get(key).clone(writer)
 elif key in target:del target[key]
candidate=OUT.with_name('introduction-install-candidate.pdf')
with open(candidate,'wb') as f:writer.write(f)
result=PdfReader(candidate)
assert len(result.pages)==len(reader.pages)
for i,(a,b) in enumerate(zip(reader.pages,result.pages)):
 if i==index:
  assert all(abs(float(x)-float(y))<0.01 for x,y in zip(a.mediabox,b.mediabox))
 else:
  assert list(a.mediabox)==list(b.mediabox)
 if i!=index:
  assert stream(a)==stream(b),f'Page {i+1} content changed'
  assert a.extract_text()==b.extract_text(),f'Page {i+1} text changed'
assert stream(result.pages[index])==stream(replacement)
assert result.pages[index].extract_text()==replacement.extract_text()
assert links(result)==before_links
assert outlines(result)==before_outline
receipt={'date':'2026-11-15','status':'Approved introduction installed','pdfSha256':sha(candidate),'approval':str(A.relative_to(R)),'replacementPdf':str(source.relative_to(R)),'replacementSha256':sha(source),'inputPdfSha256':before_hash,'previousPdf':str(backup.relative_to(R)),'previousIntegrationReceipt':previous['integrationReceipt'],'pdfPages':180,'interiorPages':176,'replacedPdfPage':9,'replacedFolio':7,'unchangedPagesContentAndTextVerified':179,'allInternalLinksUnchanged':len(before_links),'outlineDestinationsUnchanged':len(before_outline),'allLinks':old_proof['allLinks'],'guidesReexported':0,'pending':'The retained contents/bookmark descriptor still says why grow your own; refresh that descriptive subtitle with the next authorised contents update. Page-7 destination is unchanged.'}
os.replace(candidate,OUT)
save(I/'INTEGRATION-CHECKS.json',receipt)
current=dict(previous);current.update({'date':'2026-11-15','status':'Approved personal introduction installed at page 7; other 179 pages retained','sha256':receipt['pdfSha256'],'bytes':OUT.stat().st_size,'integrationReceipt':str((I/'INTEGRATION-CHECKS.json').relative_to(R)),'introductionApproval':str(A.relative_to(R)),'previousFullAssemblyChecks':str((I/'before-CHECKS.json').relative_to(R))})
save(D/'CHECKS.json',current)
pages=j(D/'PAGE-MAP.json');pages[index].update({'label':'Introduction','kind':'introduction','source':str(source.relative_to(R)),'sourcePage':1,'approval':str(A.relative_to(R))});save(D/'PAGE-MAP.json',pages)
for name in ['COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json']:
 d=j(D/name);d.update({'date':'2026-11-15','pdfSha256':receipt['pdfSha256'],'introductionApproval':str(A.relative_to(R)),'introductionIntegration':str((I/'INTEGRATION-CHECKS.json').relative_to(R))})
 if 'firstLeaves' in d:d['firstLeaves']=pages[:11]
 if name=='COMPONENT-CHECKS.json':d['integrationReceipt']=str((I/'INTEGRATION-CHECKS.json').relative_to(R))
 save(D/name,d)
print(json.dumps({k:v for k,v in receipt.items() if k!='allLinks'},indent=2))
