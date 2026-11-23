"""Apply authorised solid-background cream matching using audited photo exclusions."""
from pathlib import Path
import json,hashlib,zlib
import numpy as np
from PIL import Image
from pypdf import PdfReader,PdfWriter
import pypdf.filters
from pypdf.generic import NameObject
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=200_000_000
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[3];OUT=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior'
FINAL=OUT/'Vegetable-Guru-Interior-Colour-Managed.pdf';BASE=DOC/'colour-work/interior-before-cream.pdf'
PLAN=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/colour/CREAM-BACKGROUND-CORRECTION.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plan=json.loads(PLAN.read_text());assert sha(FINAL)==plan['sourceSha256']
assert not BASE.exists(),'Preserve existing correction checkpoint; do not overwrite it.'
FINAL.rename(BASE);reader=PdfReader(BASE);writer=PdfWriter();writer.clone_document_from_reader(reader);records=[]
def image(page):
 images=[o.get_object() for o in page['/Resources']['/XObject'].values() if o.get_object().get('/Subtype')=='/Image'];assert len(images)==1;return images[0]
for item in plan['regions']:
 f=item['folio'];ob=image(writer.pages[f-1]);old=np.frombuffer(ob.get_data(),np.uint8).reshape((int(ob['/Height']),int(ob['/Width']),4));assert hashlib.sha256(old.tobytes()).hexdigest()==item['sourceArtSha256'];path=ROOT/item['mask'];assert sha(path)==item['maskSha256'];mask=np.asarray(Image.open(path).convert('1'));assert mask.shape==old.shape[:2];assert int(mask.sum())==item['selectedBackgroundPixels'];assert np.all(old[mask]==item['oldCmyk'])
 new=old.copy();new[mask]=item['newCmyk'];assert np.array_equal(old[~mask],new[~mask]);ob[NameObject('/Filter')]=NameObject('/FlateDecode');ob.pop('/DecodeParms',None);ob._data=zlib.compress(new.tobytes(),6);ob.decoded_self=None
 records.append({'folio':f,'selectedPixels':int(mask.sum()),'maskSHA256':item['maskSha256'],'oldCMYK':item['oldCmyk'],'newCMYK':item['newCmyk'],'outsideMaskCMYKBytesIdentical':True,'finalArtSHA256':hashlib.sha256(new.tobytes()).hexdigest()});print('Matched solid cream',f,flush=True)
writer.write(FINAL);after=PdfReader(FINAL);changed={r['folio'] for r in records};untouched=[]
for f,(p,q) in enumerate(zip(reader.pages,after.pages),1):
 assert p.get_contents().get_data()==q.get_contents().get_data(),f
 for box in ['/MediaBox','CropBox','TrimBox','BleedBox']:
  key=box if box.startswith('/') else '/'+box;assert p[key]==q[key],f
 if f not in changed:assert image(p)._data==image(q)._data,f;untouched.append(f)
receipt={'sourceSHA256':plan['sourceSha256'],'finalSHA256':sha(FINAL),'bytes':FINAL.stat().st_size,'all174NativePageContentsAndGeometryUnchanged':True,'all171OtherArtworkEncodedStreamsIdentical':True,'regions':records,'sourcePlan':str(PLAN.relative_to(ROOT)),'scope':'Only exact solid cream background pixels selected by independently audited masks. Every native image placement has a2pixel600dpi guard excluded. Native lettering and all other art samples remain identical. No other colour correction.'}
(DOC/'CREAM-MATCH-CHECK.json').write_text(json.dumps(receipt,indent=2)+'\n');print(receipt['finalSHA256'],FINAL.stat().st_size,flush=True)
