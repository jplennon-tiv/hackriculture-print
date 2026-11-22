"""Bind the current approved components without rebuilding any guide or artwork."""
from pathlib import Path
import hashlib,json,os
R=Path(__file__).resolve().parents[1]
D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22'
D.mkdir(parents=True,exist_ok=True)
def read(p):return json.loads((R/p).read_text())
def sha(p):
 with (R/p).open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def save(p,o):(D/p).write_text(json.dumps(o,indent=2,ensure_ascii=False)+'\n')
prior=read('docs/publication/whole-book-order-preview/CHECKS.json')
baseline='output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
assert sha(baseline)==prior['sha256']
backup=D/'before-book.pdf'
if not backup.exists():os.link(R/baseline,backup)
assert sha(str(backup.relative_to(R)))==prior['sha256']
for name in ['CHECKS.json','PAGE-MAP.json','COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json','VISUAL-REVIEW.json']:
 target=D/('before-'+name)
 if not target.exists():target.write_bytes((D.parent/name).read_bytes())
mapping=read('docs/publication/whole-book-order-preview/PAGE-MAP.json')
inputs={str(backup.relative_to(R)):prior['sha256']}
pages=[{**p,'source':str(backup.relative_to(R)),'sourcePage':i+1,'changes':[]} for i,p in enumerate(mapping)]
def bind(f,expected=None):
 h=sha(f)
 if expected:assert h==expected,(f,h,expected)
 inputs[f]=h;return h
def put(folio,pdf,page=1,approval=None,expected=None,change='Approved page replacement',**extra):
 bind(pdf,expected)
 if approval:bind(approval)
 target=pages[folio+1];target.update(source=pdf,sourcePage=page,approval=approval,changes=[change],**extra)
O='docs/publication/overnight-2026-11-19/openings/'
for folder,folios,source_pages in [('title-page-trials/mixed-size-variations',[1],[1]),('contents-no-category-colours/swapped-headers',[4,5],[1,2]),('page-7-thumbnail-review/two-thumbnail-proof',[7],[1]),('page-9-index-review/selected-thumbnails',[9],[1]),('page-99-layout-review',[99],[4]),('page-147-layout-review/selected-d2-folio',[147],[1])]:
 a=O+folder+'/APPROVAL.json';j=read(a);p=j['proof'];pdf=p if isinstance(p,str) else p.get('file',p.get('path'));h=j.get('sha256') if isinstance(p,str) else p['sha256']
 for folio,number in zip(folios,source_pages):put(folio,pdf,number,a,h)
pages[8]['label']='Introduction'
pages[10]['label']='Vegetable Guides'
T='docs/publication/overnight-2026-11-19/techniques/'
proof=T+'Vegetable-Guru-Growing-Techniques-Photographic-Proof.pdf';meta=read(T+'PDF-CHECKS.json');bind(T+'PDF-CHECKS.json')
for folio in range(148,172):put(folio,proof,folio-145,expected=meta['proof_sha256'],change='Approved photographic Techniques sources; retained functional diagrams')
for folder in ['page-149-square-review','page-150-crop-review','page-151-same-bed-review/camera-grounded-winter-review','page-152-trowel-review','page-153-whole-bed-review/no-dig-camera-redraw','page-168-watering-review/camera-redraw']:
 a=T+folder+'/APPROVAL.json';j=read(a);p=j['proof'];put(j['folio'],p['path'],p['pdf_page'],a,p['sha256'])
caption=T+'page-164-cover-review/CAPTION-DECISION.json';bind(caption);pages[165]['changes'].append('Remove approved redundant covering-material caption');pages[165]['captionDecision']=caption
cane=T+'page-170-171-greenhouse-review/cane-correction/APPROVAL.json';j=read(cane);bind(cane);bind(j['image']['file'],j['image']['sha256']);pages[171]['changes'].append('Install exact approved two-cane greenhouse image');pages[171]['imageReplacement']={**j['image'],'resource':'/X39','expectedPixels':[1448,965]};pages[171]['imageApproval']=cane
# Recover the exact approved panorama master instead of the reduced PDF thumbnail.
compost_record='docs/publication/compost-bins-photo-trial/revision-04/trial.json';cr=read(compost_record);bind(compost_record)
compost=next(x for x in cr['photos'] if x['file']=='01-three-bins-front-garden.png');compost_file='docs/publication/compost-bins-photo-trial/revision-04/'+compost['file'];bind(compost_file,compost['sha256'])
pages[157]['imageReplacement']={'file':compost_file,'sha256':compost['sha256'],'pixels':[3760,1256],'resource':'/X7','expectedPixels':[1120,374]};pages[157]['changes'].append('Restore the exact approved 3760-pixel compost panorama master in place of its reduced 1120-pixel proof image');pages[157]['imageSourceRecord']=compost_record
plan=read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json')
crops=[x for x in plan['editions']['imperial']['documents'] if x['type']=='vegetable']
variety='docs/publication/variety-additions/APPROVAL.json';va=read(variety);vk={x['key'] for x in va['crops']}
guides=[]
for crop in crops:
 key=crop['key'];folio=crop['startPage']
 if key in vk:a=variety
 elif key=='artichoke_jerusalem':a='docs/publication/sowing-rollout/revisions/artichoke_jerusalem_varieties/APPROVAL.json'
 elif key=='pea':a='docs/publication/sowing-rollout/revisions/pea_intro/APPROVAL.json'
 elif key in ['leek','potato','tomato_outdoor']:a=f'docs/publication/sowing-planting-mockups/{key}-revision/APPROVAL.json'
 else:a=f'docs/publication/sowing-rollout/revisions/{key}/APPROVAL.json'
 j=read(a);matches=[(p,h) for p,h in j['files'].items() if p.endswith('/'+key+'-imperial.pdf')]
 assert len(matches)==1,(key,a,matches)
 pdf,h=matches[0]
 for offset in range(2):put(folio+offset,pdf,offset+1,a,h,change='Latest approved November guide including approved variety additions where applicable',crop=key)
 guides.append({'key':key,'folios':[folio,folio+1],'approval':a,'pdf':pdf,'sha256':h})
assert len(guides)==44
# Carry the selected cover design into the screen reader only. No supplier geometry changes.
cover='output/pdf/selected-gold-cover/The-Vegetable-Guru-Selected-Cover.pdf';bind(cover)
for i,side,x in [(0,'Front',197.5),(179,'Back',0)]:pages[i].update(label=side+' cover — selected gold design',source=cover,sourcePage=1,cropXMM=x,changes=['Selected approved cover panel at trim; wrap and spine remain unchanged'])
pages[3]['changes']=['Remove measurement-edition prefix from publication details; retain metadata placeholder']
manifest={'date':'2026-11-22','authorisation':"Great - please make that pass now.",'scope':'Integrate current approved opening, photographic Techniques and November vegetable-guide derivatives into the traditional-measurements full-book review; preserve body illustrations, pagination and supplier files.','baseline':{'file':str(backup.relative_to(R)),'sha256':prior['sha256']},'trimMM':[185,240],'interiorPages':176,'pdfPages':180,'pages':pages,'guides':guides,'inputs':inputs,'output':'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','readingCopy':'output/pdf/whole-book-order-preview/Vegetable-Guru-Updated-Book-Review.pdf'}
save('SOURCES.json',manifest)
print(json.dumps({'pages':len(pages),'guidePairs':len(guides),'sourceFiles':len(inputs),'sourceBytes':sum((R/f).stat().st_size for f in inputs),'manifest':str((D/'SOURCES.json').relative_to(R))}))
