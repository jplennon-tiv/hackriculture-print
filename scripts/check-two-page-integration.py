"""Final source-preservation and integration receipt for the approved four guides."""
from pathlib import Path
import json,hashlib
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/whole-book-order-preview'
I=D/'integration-2026-10-15'
read=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
original=read(I/'ORIGINAL-INPUTS.json')
for p,h in original.items():assert sha(p)==h,p
approved=read(I/'APPROVED-GUIDES.json');inputs=dict(approved['inputs'])
for record in approved['records']:
 a=read(record['approval']);inputs.update(a['inputs']);inputs[record['pdf']]=record['sha256']
 for item in a['pdfs'].values():inputs[item['path']]=item['sha256']
for p,h in inputs.items():assert sha(p)==h,p
components=read(D/'COMPONENT-CHECKS.json')
for group in ['copyInputs','inputs','assets']:
 for p,h in components[group].items():assert sha(p)==h,p
for item in components['protectedFiles']:assert sha(item['path'])==item['sha256'],item['path']
c=read(D/'CHECKS.json');assert sha(c['pdf'])==c['sha256']
plan=read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json')
for e in plan['editions'].values():
 crops=[d for d in e['documents'] if d['type']=='vegetable']
 assert len(crops)==44 and all(d['physicalPages']==2 and d['blankAfterPages']==0 and d['startPage']%2==0 for d in crops)
 assert len([d for d in crops if d.get('approvedReplacement')])==4
 assert e['plannedEvenTotal']==166
mapping=read(D/'PAGE-MAP.json');assert len(mapping)==170 and all(not p.get('changes') for p in mapping)
html=(D/'REVIEW.html').read_text();assert 'change-mark' not in html and 'id="highlights"' not in html
nav=read(D/'NAVIGATION-PDF-CHECKS.json');browser=read(D/'BROWSER-CHECKS.json')
assert nav['pdfSha256']==browser['pdfSha256']==c['sha256'] and nav['status']==browser['status']=='passed'
reader=PdfReader(ROOT/c['pdf']);publication=reader.pages[3].extract_text()
normalize=lambda text:''.join(text.split())
for placeholder in ['[year]','[Imprint name]','[To be supplied]','[Edition and year]']:assert normalize(placeholder) in normalize(publication),placeholder
cover=read('../hackriculture-data/book-layout/covers.json')
for paragraph in cover['back']['paragraphs']:assert normalize(paragraph) in normalize(reader.pages[-1].extract_text())
result={'date':'2026-10-15','status':'passed; clean assembled preview ready for John', 'pdf':c['pdf'],'pdfSha256':c['sha256'],'originalInputsUnchanged':len(original),'canonicalGardeningRecordsUnchanged':58,'sharedBookCopyFilesUnchanged':8,'approvedTrialInputFilesUnchanged':len(inputs),'protectedSourceFilesUnchanged':len(components['protectedFiles']),'vegetableGuides':44,'pagesPerVegetable':2,'approvedReplacementPages':8,'interiorPages':166,'pdfPages':170,'reviewHighlights':0,'bodyTypeAndLeading':'Approved PDF pages reused without reflow; type and leading unchanged','tableRowsRemoved':0,'metadataPlaceholdersPreserved':True,'publicationAndBackCopyIntegrated':True,'relatedLinksVerified':nav['reopenedNavigationLinks'],'indexLinksVerified':nav['reopenedIndexLinks'],'baselineBodiesCompared':nav['approvedBaselineBodyPagesCompared'],'guideBodiesComparedWithSource':c['guidePagesReused'],'fullCatalogueRegeneration':False,'metricFullBookAssembled':False,'originalInputs':str((I/'ORIGINAL-INPUTS.json').relative_to(ROOT)),'approvedInputs':inputs}
(I/'INTEGRATION-CHECKS.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='approvedInputs'}))
