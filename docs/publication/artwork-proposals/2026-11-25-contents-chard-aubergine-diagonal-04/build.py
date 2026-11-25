"""Selected A/B photographs in diagonally opposite contents corners."""
from pathlib import Path
import io,json,hashlib,re,unicodedata,shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import DictionaryObject,NameObject,TextStringObject,ArrayObject,DecodedStreamObject
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
PRIOR=HERE.parent/"2026-11-25-contents-three-layouts-01"
MM=72/25.4;PW=185*MM;PH=240*MM;SW=386*MM;SH=257*MM
PAPER="#FFF8E9";INK="#173E2C"
FONT=HERE.parent/"2026-11-24-section-opener-layered-masters-01/Fonts-Source"
for key,name in [("Title","Lilita.ttf"),("Body","Nunito.ttf"),("Bold","Nunito-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(key,str(FONT/name)))
SOURCES=[
HERE.parent/"2026-11-24-vegetable-guides-opener-05-shortlist/selected-panels/20.png",
HERE.parent/"2026-11-24-vegetable-guides-opener-05-shortlist/selected-panels/25.png"
]
CORNER=[("M",-25,-18),("C",-12,-38,28,-26,51,-5),
        ("C",75,18,60,42,37,44),("C",10,47,-27,25,-25,-18)]
SHAPES=[CORNER,[tuple([a[0]]+[185-v if i%2 else 240-v for i,v in enumerate(a[1:],1)]) for a in CORNER]]
BOXES=[(-27,-47,95,95*529/422),(119,158,82,82*531/425)]
LAYERS=HERE/"layers";LAYERS.mkdir(parents=True,exist_ok=True)
shutil.copyfile(HERE/"Native-Contents.pdf",LAYERS/"03-Contents-and-folios.pdf")
shutil.copyfile(PRIOR/"option-3/Headings.pdf",LAYERS/"04-Contents-headings.pdf")
shutil.copyfile(PRIOR/"CONTENTS.json",HERE/"CONTENTS.json")
def path(c,cmds):
    p=c.beginPath()
    for a in cmds:
        if a[0]=="M":p.moveTo(a[1]*MM,PH-a[2]*MM)
        else:p.curveTo(a[1]*MM,PH-a[2]*MM,a[3]*MM,PH-a[4]*MM,a[5]*MM,PH-a[6]*MM)
    p.close();return p
def paint(c,i,kind):
    if kind=="paper":
        c.setFillColor(HexColor(PAPER));c.rect(0,0,PW,PH,fill=1,stroke=0)
    elif kind=="photos":
        c.saveState();c.setFillAlpha(1);c.clipPath(path(c,SHAPES[i]),stroke=0,fill=0)
        x,y,w,h=BOXES[i]
        c.drawImage(ImageReader(str(SOURCES[i])),x*MM,PH-(y+h)*MM,w*MM,h*MM)
        c.restoreState()
FILES={"paper":"01-Paper.pdf","photos":"02-Photographs.pdf",
       "contents":"03-Contents-and-folios.pdf","headings":"04-Contents-headings.pdf"}
for kind,name in FILES.items():
    if kind in ("contents","headings"):continue
    c=canvas.Canvas(str(LAYERS/name),pagesize=(PW,PH),pageCompression=1,invariant=1)
    for i in range(2):paint(c,i,kind);c.showPage()
    c.save()

def memory_page(fn,size):
    b=io.BytesIO();c=canvas.Canvas(b,pagesize=size,pageCompression=1,invariant=1)
    fn(c);c.showPage();c.save();return PdfReader(b).pages[0]
def surround(c):
    c.setFillColor(HexColor("#EAE7DE"));c.rect(0,0,SW,SH,stroke=0,fill=1)
def review_label(c):
    c.setFillColor(HexColor(INK));c.setFont("Bold",11)
    c.drawString(5*MM,SH-7.7*MM,"Contents · chard and aubergine")
    c.setFont("Body",8.5)
    c.drawRightString(SW-5*MM,SH-7.5*MM,"Selected option 3 · top-left and bottom-right photographs")
def assemble(out,spread):
    writer=PdfWriter();groups={}
    labels={"paper":"Paper","photos":"Photographs","contents":"Contents and folios","headings":"Contents headings"}
    if spread:labels.update(surround="Review surround",labels="Review label")
    for key,title in labels.items():
        groups[key]=writer._add_object(DictionaryObject({NameObject("/Type"):NameObject("/OCG"),NameObject("/Name"):TextStringObject(title)}))
    def merge(target,page,key,dx=0,dy=0):
        page["/Resources"][NameObject("/Properties")]=DictionaryObject({NameObject("/VGO_"+key):groups[key]})
        s=DecodedStreamObject();s.set_data(b"q\n/OC /VGO_"+key.encode()+b" BDC\n"+page.get_contents().get_data()+b"\nEMC\nQ\n")
        page[NameObject("/Contents")]=s
        target.merge_transformed_page(page,Transformation().translate(tx=dx,ty=dy))
    if spread:
        target=writer.add_blank_page(SW,SH)
        merge(target,memory_page(surround,(SW,SH)),"surround")
    for i in range(2):
        if not spread:target=writer.add_blank_page(PW,PH)
        x=(5 if i==0 else 196)*MM if spread else 0
        y=5*MM if spread else 0
        for key,name in FILES.items():
            merge(target,PdfReader(LAYERS/name).pages[i],key,x,y)
    if spread:
        merge(target,memory_page(review_label,(SW,SH)),"labels")
        # Also provide the two actual book pages for comfortable individual review.
        for i in range(2):
            target=writer.add_blank_page(PW,PH)
            for key,name in FILES.items():
                merge(target,PdfReader(LAYERS/name).pages[i],key)
    a=ArrayObject(list(groups.values()))
    writer._root_object[NameObject("/OCProperties")]=DictionaryObject({NameObject("/OCGs"):a,NameObject("/D"):DictionaryObject({NameObject("/Order"):a,NameObject("/ON"):a,NameObject("/BaseState"):NameObject("/ON")})})
    writer.add_metadata({"/Title":"The Vegetable Guru — Contents — chard and aubergine","/Author":"John Lennon","/Subject":"Selected photographs A and B in opposite corners. Native text and independent photo layers."})
    with open(out,"wb") as f:writer.write(f)
OUT=HERE/"Vegetable-Guru-Contents-Chard-Aubergine.pdf"
MASTER=HERE/"Layered-Pages-2-3.pdf"
assemble(OUT,True);assemble(MASTER,False)
src=json.loads((HERE/"CONTENTS.json").read_text())
def norm(s):return " ".join(unicodedata.normalize("NFKC",s).split())
actual=norm(PdfReader(OUT).pages[0].extract_text())
for p in src["pages"]:
    for row in p["entries"]:
        assert re.search(re.escape(row["label"])+r"\s+"+str(row["folio"])+r"(?=\s|$)",actual),row
assert hashlib.sha256((LAYERS/FILES["headings"]).read_bytes()).digest()==hashlib.sha256((PRIOR/"option-3/Headings.pdf").read_bytes()).digest()
old_checks=json.loads((PRIOR/"CHECKS.json").read_text())
new_checks=json.loads((HERE/"CHECKS.json").read_text())
for before,after in zip(old_checks["entries"],new_checks["entries"]):
    for key in ["label","destination","xMM","widthMM","heightMM","kind"]:assert before[key]==after[key],(key,before,after)
    assert abs(after["yMM"]-before["yMM"]+(14 if before["page"]==3 else 0))<1e-6,(before,after)
for i,pg in enumerate(PdfReader(MASTER).pages):
    assert len(pg.images)==1
    assert pg.images[0].image.convert("RGB").tobytes()==Image.open(SOURCES[i]).convert("RGB").tobytes()

assert len(PdfReader(MASTER).pages)==2
assert len(PdfReader(OUT).pages)==3
for i,page in enumerate(src["pages"]):
    text=norm(PdfReader(OUT).pages[i+1].extract_text())
    for row in page["entries"]:
        assert re.search(re.escape(row["label"])+r"\s+"+str(row["folio"])+r"(?=\s|$)",text),row
assert all(len(p.images)==0 for p in PdfReader(LAYERS/FILES["contents"]).pages)
checks={"date":"2026-11-25","status":"proposal for review","photos":2,"photo_opacity":1,"cream_wash":False,
"body_size_pt":10.5,"contents_labels_and_page_references_verified":84,"row_labels_destinations_widths_heights_fonts_unchanged":True,"right_page_body_shift_mm":-14,"folio_3_white_over_photo":True,
"contents_component_has_no_images":True,"folios":[2,3],"trim_mm":[185,240],
"layers":list(FILES),"image_placements":[{"source":str(f.relative_to(ROOT)),"sha256":hashlib.sha256(f.read_bytes()).hexdigest(),
"box_mm":BOXES[i],"clip":SHAPES[i],"effective_ppi":round(Image.open(f).width/BOXES[i][2]*25.4,1)} for i,f in enumerate(SOURCES)],
"selected_images":{"A":"Chard, Guides favourite 20","B":"Aubergine, Guides favourite 25"},"selected_layout":"Option 3, modified to top left / bottom right"}
(HERE/"REVIEW.json").write_text(json.dumps(checks,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"pdf":str(OUT),"bytes":OUT.stat().st_size,"all_84_entries_verified":True,"photos":"A top left; B bottom right"}))

