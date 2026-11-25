"""Assemble the accepted photorealistic interior trial, without changing production files."""
from pathlib import Path
import hashlib,json,re,unicodedata,time
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import NameObject,TextStringObject,DictionaryObject,ArrayObject,NumberObject,RectangleObject
from pypdf.annotations import Link
from PIL import Image
from pypdf import overwrite_configuration
# Verified 600-ppi CMYK source grids decode to about 105 MB each.
overwrite_configuration(zlib_maximum_output_length=160*1024*1024,image_maximum_buffer_size=160*1024*1024)

ROOT=Path("/Users/johnlennon/Documents/web_site/hackriculture-print")
DOC=ROOT/"docs/publication/artwork-proposals/2026-11-25-complete-interior-trial-01"
OUTDIR=ROOT/"output/pdf/photorealistic-trial-2026-11-25"
OUT=OUTDIR/"Vegetable-Guru-Photorealistic-Trial-Complete-Interior.pdf"
BASE=ROOT/"output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf"
ORDERED=ROOT/"output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Interior-Original-Margins.pdf"
READING=ROOT/"output/pdf/whole-book-order-preview/Vegetable-Guru-Updated-Book-Review.pdf"
ART=ROOT/"docs/publication/artwork-proposals"
MM=72/25.4;W=185*MM;H=240*MM
SOURCES={
1:("2026-11-25-interior-title-actor-redraw-08/Layered-Title-Page/Layered-Master.pdf",0),
2:("2026-11-25-contents-balanced-corners-06/Layered-Pages-2-3.pdf",0),
3:("2026-11-25-contents-balanced-corners-06/Layered-Pages-2-3.pdf",1),
5:("2026-11-25-introduction-oval-layout-01/Vegetable-Guru-Introduction-Oval-Trial.pdf",0),
7:("2026-11-24-section-opener-layered-masters-01/guides-007/Layered-Master.pdf",0),
97:("2026-11-24-section-opener-layered-masters-01/troubles-097/Layered-Master.pdf",0),
145:("2026-11-24-growing-techniques-jeans-12/Vegetable-Guru-Growing-Techniques-Jeans-Page-145.pdf",0),
}
def sha(p):
 with Path(p).open("rb") as f:return hashlib.file_digest(f,"sha256").hexdigest()
def norm(s):return " ".join(unicodedata.normalize("NFKC",s).split())
def save(n,v):(DOC/n).write_text(json.dumps(v,indent=2,ensure_ascii=False)+"\n")
DOC.mkdir(parents=True,exist_ok=True);OUTDIR.mkdir(parents=True,exist_ok=True)
assert not OUT.exists(),"Refuse to overwrite an existing full trial."
assert sha(BASE)=="a7af3c88d43d7671a7e4904269f30af350b9be9194ea2dd74c4ccc09b1435b12"
ordered_hash=sha(ORDERED);assert ordered_hash=="3a71d0011d7d12f29a13ce35f94f0068b5e3cc798d24a68a5a4d6cf07903fb59"
base=PdfReader(BASE);assert len(base.pages)==174
readers={BASE:base}; writer=PdfWriter()
records=[];expected_text=[];groups=[];grouped=set()
for folio in range(1,175):
 if folio in SOURCES:
  rel,index=SOURCES[folio];source=ART/rel
  if source not in readers:readers[source]=PdfReader(source)
  doc=readers[source];pg=doc.pages[index]
 else:source=BASE;index=folio-1;doc=base;pg=base.pages[index]
 text=norm(pg.extract_text());expected_text.append(text)
 box=list(map(float,pg.trimbox));assert abs(box[2]-box[0]-W)<0.02 and abs(box[3]-box[1]-H)<0.02
 target=writer.add_page(pg);target.pop("/Annots",None)
 if abs(box[0])+abs(box[1])>0.000001:
  target.add_transformation(Transformation().translate(tx=-box[0],ty=-box[1]))
 for k in ["/MediaBox","/CropBox","/TrimBox","/BleedBox"]:
  target[NameObject(k)]=RectangleObject([0,0,W,H])
 target.pop("/ArtBox",None)
 if source not in grouped:
  for g in doc.trailer["/Root"].get("/OCProperties",{}).get("/OCGs",[]):
   cloned=g.clone(writer);d=cloned.get_object()
   prefix="Pages 2–3" if folio==2 else f"Page {folio}"
   d[NameObject("/Name")]=TextStringObject(prefix+" · "+str(d.get("/Name","Layer")))
   groups.append(cloned)
  grouped.add(source)
 records.append({"folio":folio,"pdf_page":folio,"source":str(source.relative_to(ROOT)),"source_page":index+1,"replaced":folio in SOURCES,"trim_origin_points":box[:2],"native_text_sha256":hashlib.sha256(text.encode()).hexdigest()})
 if folio%30==0:print("Assembled",folio,"pages",flush=True)
assert len(writer.pages)==174
if groups:
 a=ArrayObject(groups)
 writer._root_object[NameObject("/OCProperties")]=DictionaryObject({NameObject("/OCGs"):a,NameObject("/D"):DictionaryObject({NameObject("/Order"):a,NameObject("/ON"):a,NameObject("/BaseState"):NameObject("/ON")})})
# Preserve the prepress CMYK output profile while keeping new RGB artwork native.
if "/OutputIntents" in base.trailer["/Root"]:
 writer._root_object[NameObject("/OutputIntents")]=base.trailer["/Root"]["/OutputIntents"].clone(writer)
writer.page_layout="/TwoPageRight"
writer._root_object[NameObject("/PageMode")]=NameObject("/UseOutlines")
writer.set_page_label(0,173,style="/D",start=1)
writer.add_metadata({"/Title":"The Vegetable Guru — Photorealistic Trial — Complete Interior","/Author":"John Lennon","/Subject":"174-page Traditional measurements review edition. Accepted photographic opening pages. Trial resolution; not a printer upload.","/Keywords":"photorealistic trial, complete interior, 25 November 2026"})
# Restore reading navigation on unchanged pages, remapped from the 178-page reading edition.
old=PdfReader(READING);old_ids={p.indirect_reference.idnum:i for i,p in enumerate(old.pages)}
links=[]
for idx,p in enumerate(old.pages):
 folio=idx-1
 if not 1<=folio<=174 or folio in SOURCES:continue
 for a in p.get("/Annots",[]):
  a=a.get_object()
  if a.get("/Subtype")!="/Link":continue
  rect=list(map(float,a["/Rect"]));dest=a.get("/Dest")
  if dest is None and a.get("/A",{}).get("/S")=="/GoTo":dest=a["/A"].get("/D")
  if dest is not None:
   target=old_ids[dest[0].idnum]-1
   if 1<=target<=174:
    writer.add_annotation(folio-1,Link(rect=rect,target_page_index=target-1))
    links.append({"source":folio,"target":target,"kind":"retained"})
  elif a.get("/A",{}).get("/S")=="/URI":
   uri=str(a["/A"]["/URI"])
   writer.add_annotation(folio-1,Link(rect=rect,url=uri))
   links.append({"source":folio,"uri":uri,"kind":"external retained"})
# All 84 contents entries become live links using the exact layout's measured row boxes.
layout=json.loads((ART/"2026-11-25-contents-balanced-corners-06/CHECKS.json").read_text())
for row in layout["entries"]:
 x,y,w,h=[row[k] for k in ["xMM","yMM","widthMM","heightMM"]]
 rect=[x*MM,H-(y+h)*MM,(x+w)*MM,H-y*MM]
 writer.add_annotation(row["page"]-1,Link(rect=rect,target_page_index=row["destination"]-1))
 links.append({"source":row["page"],"target":row["destination"],"kind":"new contents","label":row["label"]})
toc=json.loads((ART/"2026-11-25-contents-balanced-corners-06/CONTENTS.json").read_text())
writer.add_outline_item("Title and copyright",0)
writer.add_outline_item("Contents",1)
parent=None;bookmark_count=2
for p in toc["pages"]:
 for row in p["entries"]:
  label,folio=row["label"],row["folio"]
  if label in ["Vegetable Guides","Vegetable Troubles","Growing Techniques"]:
   parent=writer.add_outline_item(label,folio-1)
  elif label in ["Introduction","Index"]:
   writer.add_outline_item(label,folio-1);parent=None
  else:writer.add_outline_item(label,folio-1,parent=parent)
  bookmark_count+=1
print("Native text and navigation assembled; optimising review images.",flush=True)
# A review derivative: preserve native text/vector layers and image geometry.
# Body artwork is limited to its existing 300-ppi photographic grid; accepted new artwork is not resampled.
from review_images import recompress
image_records=recompress(writer,set(SOURCES))
writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
writer.write(OUT)
final=PdfReader(OUT)
assert len(final.pages)==174
text_checks=[]
for i,p in enumerate(final.pages):
 assert abs(float(p.mediabox.width)-W)<0.001 and abs(float(p.mediabox.height)-H)<0.001
 assert norm(p.extract_text())==expected_text[i],f"Native text changed on folio {i+1}"
 text_checks.append({"folio":i+1,"text_identical_to_component":True})
ids={p.indirect_reference.idnum:i+1 for i,p in enumerate(final.pages)}
link_count=0
for p in final.pages:
 for a in p.get("/Annots",[]):
  a=a.get_object();dest=a.get("/Dest")
  if dest is None and a.get("/A",{}).get("/S")=="/GoTo":dest=a["/A"].get("/D")
  if dest is not None:assert 1<=ids[dest[0].idnum]<=174
  link_count+=1
assert link_count==len(links)
assert len(final.trailer["/Root"]["/OCProperties"]["/OCGs"])==len(groups)==33
for folio in [4,6,96,174]:assert not norm(final.pages[folio-1].extract_text())
assert sha(ORDERED)==ordered_hash
save("PAGE-MAP.json",records)
save("NAVIGATION.json",{"links":links,"bookmark_count":bookmark_count,"count":len(links)})
save("IMAGE-REVIEW.json",image_records)
checks={"date":"2026-11-25","status":"assembled; visual checks pending","pdf":str(OUT.relative_to(ROOT)),"page_count":174,"trim_mm":[185,240],"pdf_page_equals_interior_folio":True,"replaced_folios":sorted(SOURCES),"unchanged_content_pages":167,"native_text_verified_pages":174,"contents_entries_verified":84,"live_links":link_count,"bookmarks":bookmark_count,"independent_layer_groups":len(groups),"blank_folios":[4,6,96,174],"ordered_interior_sha256_unchanged":ordered_hash,"trial_resolution":"Review image compression; accepted new images not resampled. Remaining body image grids limited to 2906 px (about 300 ppi on a full bleed page). Original masters retained.","new_image_upscaling_performed":False,"bytes":OUT.stat().st_size,"sha256":sha(OUT),"sources":[{"path":str(p.relative_to(ROOT)),"sha256":sha(p)} for p in readers],"text_checks":text_checks}
save("CHECKS.json",checks)
print(json.dumps({k:checks[k] for k in ["pdf","page_count","bytes","live_links","bookmarks","independent_layer_groups","sha256"]}),flush=True)

