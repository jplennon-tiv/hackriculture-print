"""Three exact-type contents spread trials. Run build-native-contents.swift first."""
from pathlib import Path
import io,json,hashlib,re,copy,unicodedata
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import DictionaryObject,NameObject,TextStringObject,ArrayObject,DecodedStreamObject
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
MM=72/25.4; PW=185*MM;PH=240*MM
SW=386*MM;SH=257*MM
INK="#173E2C";PAPER="#FFF8E9"
FONT=ROOT/"docs/publication/artwork-proposals/2026-11-24-section-opener-layered-masters-01/Fonts-Source"
for key,name in [("Title","Lilita.ttf"),("Body","Nunito.ttf"),("Bold","Nunito-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(key,str(FONT/name)))
PROPOSALS=ROOT/"docs/publication/artwork-proposals"
SOURCES={
"leeks":PROPOSALS/"2026-11-24-section-opener-layered-masters-01/guides-007/Background.png",
"cabbage":PROPOSALS/"2026-11-24-section-opener-layered-masters-01/troubles-097/Background.png",
"planting":PROPOSALS/"2026-11-24-growing-techniques-jeans-12/assets/Background-Old-Jeans.png",
"garden13":PROPOSALS/"2026-11-25-interior-title-video-scout-01/stills/13-00238.505.png",
"garden16":PROPOSALS/"2026-11-25-interior-title-video-scout-01/stills/16-00317.501.png"
}
ASSETS=HERE/"review-assets";ASSETS.mkdir(exist_ok=True)
for key in ["garden13","garden16"]:
    im=Image.open(SOURCES[key]).convert("RGB");im.thumbnail((2800,2800))
    im.save(ASSETS/(key+".jpg"),quality=95,subsampling=0)
def asset(key):return ASSETS/(key+".jpg") if key.startswith("garden") else SOURCES[key]
PLACEMENTS=[]
def path(c,commands):
    p=c.beginPath()
    for a in commands:
        if a[0]=="M":p.moveTo(a[1]*MM,PH-a[2]*MM)
        elif a[0]=="L":p.lineTo(a[1]*MM,PH-a[2]*MM)
        else:p.curveTo(a[1]*MM,PH-a[2]*MM,a[3]*MM,PH-a[4]*MM,a[5]*MM,PH-a[6]*MM)
    p.close();return p
def mirror(commands):
    return [tuple([a[0]]+[185-v if i%2 else v for i,v in enumerate(a[1:],1)]) for a in commands]
def photo(c,key,commands,box,focus,variant,folio):
    x,y,w,h=box
    im=Image.open(asset(key));s=max(w/im.width,h/im.height)
    dw,dh=im.width*s,im.height*s
    dx=x-(dw-w)*focus[0];dy=y-(dh-h)*focus[1]
    c.saveState();c.setFillAlpha(1);c.clipPath(path(c,commands),stroke=0,fill=0)
    c.drawImage(ImageReader(str(asset(key))),dx*MM,PH-(dy+dh)*MM,dw*MM,dh*MM)
    c.restoreState()
    PLACEMENTS.append({"variant":variant,"folio":folio,"source":key,"clip":commands,"image_box_mm":[dx,dy,dw,dh],"effective_ppi":round(im.width/dw*25.4,1)})
band=[("M",0,0),("L",185,0),("L",185,21),
      ("C",150,31,111,22,76,26),("C",44,30,19,36,0,30)]
leaf=[("M",101,-13),("C",128,-18,179,-10,199,11),
      ("C",208,23,183,44,149,45),("C",112,49,68,37,67,20),("C",66,6,80,-8,101,-13)]
cabb=[("M",127,-9),("C",150,-15,189,-7,203,12),
      ("C",211,28,185,43,160,44),("C",131,47,94,35,94,20),("C",94,7,110,-4,127,-9)]
plant=[("M",30,163),("C",46,158,77,162,87,176),
       ("C",98,190,95,208,81,216),("C",65,225,36,224,23,211),
       ("C",12,200,12,175,30,163)]
corner=[("M",-25,-18),("C",-12,-38,28,-26,51,-5),
        ("C",75,18,60,42,37,44),("C",10,47,-27,25,-25,-18)]
NAMES=["Curved photographic headers","Three section photographs","Outer-corner ovals"]
DESCRIPTIONS=["Two shallow garden panoramas; open cream headings",
              "Leeks, damaged cabbage and planting, echoing the dividers",
              "Small opposing photo ovals; a quieter introduction-style treatment"]
for variant in range(1,4):
    p=HERE/f"option-{variant}";p.mkdir(exist_ok=True)
    c=canvas.Canvas(str(p/"Photographs.pdf"),pagesize=(PW,PH),pageCompression=1,invariant=1)
    for i in range(2):
        folio=i+2
        if variant==1:
            photo(c,["garden13","garden16"][i],band if i==0 else mirror(band),[0,0,185,35],[.5,.57 if i==0 else .62],variant,folio)
        elif variant==2:
            if i==0:photo(c,"leeks",leaf,[65,-10,135,58],[.5,.55],variant,folio)
            else:
                photo(c,"cabbage",cabb,[92,-8,110,54],[.5,.52],variant,folio)
                photo(c,"planting",plant,[15,160,81,63],[.5,0],variant,folio)
        else:
            photo(c,["leeks","cabbage"][i],corner if i==0 else mirror(corner),
                  [-27,-25,95,75] if i==0 else [117,-25,95,75],[.5,.5],variant,folio)
        c.showPage()
    c.save()
    c=canvas.Canvas(str(p/"Headings.pdf"),pagesize=(PW,PH),pageCompression=1,invariant=1)
    for i in range(2):
        left=8 if i==0 else 17
        x,y=(left,44.2) if variant==1 else ((85 if i==0 else left,30) if variant==3 else (left,30))
        c.setFillColor(HexColor(INK));c.setFont("Title",25.5);c.drawString(x*MM,PH-y*MM,"Contents")
        c.showPage()
    c.save()

def page_pdf(fn,size):
    b=io.BytesIO();c=canvas.Canvas(b,pagesize=size,pageCompression=1,invariant=1);fn(c);c.showPage();c.save()
    return PdfReader(b).pages[0]
def sheet(c):
    c.setFillColor(HexColor("#EAE7DE"));c.rect(0,0,SW,SH,fill=1,stroke=0)
    c.setFillColor(HexColor(PAPER))
    for x in [5,196]:c.rect(x*MM,5*MM,PW,PH,fill=1,stroke=0)
def label(c,n):
    c.setFillColor(HexColor(INK));c.setFont("Bold",11)
    c.drawString(5*MM,SH-7.7*MM,f"{n}  /  {NAMES[n-1]}")
    c.setFont("Body",8.5);c.drawRightString(SW-5*MM,SH-7.5*MM,DESCRIPTIONS[n-1])
writer=PdfWriter();groups={}
for key,title in [("paper","Paper"),("photos","Photographs"),("contents","Contents and folios"),("headings","Contents headings"),("labels","Review labels")]:
    groups[key]=writer._add_object(DictionaryObject({NameObject("/Type"):NameObject("/OCG"),NameObject("/Name"):TextStringObject(title)}))
def merge(target,page,key,dx=0,dy=0):
    resource=page["/Resources"]
    resource[NameObject("/Properties")]=DictionaryObject({NameObject("/VGC_"+key):groups[key]})
    s=DecodedStreamObject()
    s.set_data(b"q\n/OC /VGC_"+key.encode()+b" BDC\n"+page.get_contents().get_data()+b"\nEMC\nQ\n")
    page[NameObject("/Contents")]=s
    target.merge_transformed_page(page,Transformation().translate(tx=dx,ty=dy))
for n in range(1,4):
    target=writer.add_blank_page(SW,SH)
    merge(target,page_pdf(sheet,(SW,SH)),"paper")
    photos=PdfReader(HERE/f"option-{n}/Photographs.pdf")
    body=PdfReader(HERE/"Native-Contents.pdf")
    headings=PdfReader(HERE/f"option-{n}/Headings.pdf")
    for i,x in enumerate([5,196]):
        merge(target,photos.pages[i],"photos",x*MM,5*MM)
        merge(target,body.pages[i],"contents",x*MM,5*MM)
        merge(target,headings.pages[i],"headings",x*MM,5*MM)
    merge(target,page_pdf(lambda c:label(c,n),(SW,SH)),"labels")
a=ArrayObject(list(groups.values()))
writer._root_object[NameObject("/OCProperties")]=DictionaryObject({NameObject("/OCGs"):a,NameObject("/D"):DictionaryObject({NameObject("/Order"):a,NameObject("/ON"):a,NameObject("/BaseState"):NameObject("/ON")})})
writer.add_metadata({"/Title":"The Vegetable Guru — three contents layouts","/Author":"John Lennon","/Subject":"Three facing-page proposals, each retaining all 84 contents entries and current folios."})
OUT=HERE/"Vegetable-Guru-Contents-Three-Layouts.pdf"
with open(OUT,"wb") as f:writer.write(f)
source=json.loads((HERE/"CONTENTS.json").read_text())
base=PdfReader(HERE/"Native-Contents.pdf")
current=PdfReader(ROOT/"output/pdf/whole-book-order-preview/Vegetable-Guru-Updated-Book-Review.pdf")
def norm(s):return " ".join(unicodedata.normalize("NFKC",s).split())
checks=[]
for i,pg in enumerate(source["pages"]):
    produced=norm(base.pages[i].extract_text())
    installed=norm(current.pages[i+3].extract_text())
    for item in pg["entries"]:
        pattern=re.escape(item["label"])+r"\s+"+str(item["folio"])+r"(?=\s|$)"
        assert re.search(pattern,produced),(item,"missing generated")
        assert re.search(pattern,installed),(item,"mismatch installed")
    checks.append({"folio":pg["folio"],"entries":len(pg["entries"]),"all_labels_and_folios_match_current_installed_book":True})
proof=PdfReader(OUT)
for n,pg in enumerate(proof.pages):
    actual=norm(pg.extract_text())
    for page in source["pages"]:
        for item in page["entries"]:
            assert re.search(re.escape(item["label"])+r"\s+"+str(item["folio"])+r"(?=\s|$)",actual), (n,item)
    assert actual.count("Contents")==2+(1 if "Contents" in NAMES[n] else 0)
fonts=[]
for pg in proof.pages:
    for ref in pg["/Resources"].get("/Font",{}).values():
        f=ref.get_object()
        if f.get("/BaseFont")=="/Helvetica":continue
        desc=f.get("/FontDescriptor")
        if desc:
            assert any(k in desc.get_object() for k in ["/FontFile","/FontFile2","/FontFile3"])
        fonts.append(str(f.get("/BaseFont")))
evidence={"date":"2026-11-25","status":"three proposals for review","spread_count":3,"folios":[2,3],"native_text":True,
"body_size_pt":10.5,"entry_count_each_spread":84,"match_current_book":checks,"pdf_layers":list(groups),
"fonts":sorted(set(fonts)),"image_placements":PLACEMENTS,"sources":{k:{"path":str(v.relative_to(ROOT)),"sha256":hashlib.sha256(v.read_bytes()).hexdigest()} for k,v in SOURCES.items()},
"production_files_changed":False,"new_generation_or_paid_upscaling":False}
(HERE/"REVIEW.json").write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"pdf":str(OUT),"bytes":OUT.stat().st_size,"spreads":3,"entries_each":84,"matched_installed":True}))

