"""Retain genuine GS conversion, then restore exact page geometry and X-1a IDs."""
from pathlib import Path
from collections import Counter
import hashlib,json
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,ArrayObject,FloatObject,StreamObject
ROOT=Path(__file__).resolve().parents[5];DOC=Path(__file__).resolve().parent
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3-Optimised.pdf'
FINAL=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf'
RAW=DOC/'raw-Ghostscript-PDFX1a.pdf'
assert not RAW.exists(),'Preserve existing raw conversion'
raw=PdfReader(FINAL);assert str(raw.metadata['/GTS_PDFXVersion'])=='PDF/X-1a:2001'
assert all('/TrimBox' not in p and '/ArtBox' in p for p in raw.pages)
rawhash=hashlib.file_digest(FINAL.open('rb'),'sha256').hexdigest();FINAL.rename(RAW)
raw=PdfReader(RAW);source=PdfReader(SOURCE);writer=PdfWriter(clone_from=raw)
for page,ref in zip(writer.pages,source.pages):
 for k in ['/MediaBox','/CropBox','/TrimBox','/BleedBox']:
  page[NameObject(k)]=ArrayObject([FloatObject(float(v)) for v in ref[k]])
 page.pop('/ArtBox',None)
writer.add_metadata({'/GTS_PDFXVersion':'PDF/X-1:2001','/GTS_PDFXConformance':'PDF/X-1a:2001'})
with FINAL.open('wb') as f:writer.write(f)
can=PdfReader(FINAL)
assert all(a.get_contents().get_data()==b.get_contents().get_data() for a,b in zip(raw.pages,can.pages))
assert all(list(a[k])==list(b[k]) for a,b in zip(source.pages,can.pages) for k in ['/MediaBox','/CropBox','/TrimBox','/BleedBox'])
report={'raw':str(RAW.relative_to(ROOT)),'rawSHA256':rawhash,'candidate':str(FINAL.relative_to(ROOT)),'candidateSHA256':hashlib.file_digest(FINAL.open('rb'),'sha256').hexdigest(),'candidateBytes':FINAL.stat().st_size,'pageInstructionsUnchangedFromRawConversion':True,'allFourPageBoxesExactFromSource':True,'identification':{'GTS_PDFXVersion':'PDF/X-1:2001','GTS_PDFXConformance':'PDF/X-1a:2001'},'reason':'Ghostscript PDF/X-1 mode emitted only a full-page ArtBox and no explicit TrimBox/BleedBox, and omitted the separate 2001 conformance key. Restore exact checked print geometry, remove ArtBox (mutually exclusive with TrimBox) and set the specific 2001 identification pair. No page instructions, fonts, artwork or profile are edited.','sources':['https://www.pwg.org/archives/sm/2003/000557.html','https://pdfa.org/twenty-years-of-pdf-x-part-ii/','https://wwws.loc.gov/preservation/digital/formats/fdd/fdd000124.shtml']}
(DOC/'GEOMETRY-IDENTIFICATION-REPAIR.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
