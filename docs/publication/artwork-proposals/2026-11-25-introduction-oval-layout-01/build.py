"""Rebuild the experimental Introduction from the two approved camera images.
Native fonts, independent photo layers and vector clipping paths; no flattening.
Run with the project Python runtime (Pillow, ReportLab, pypdf).
"""
from pathlib import Path
import hashlib, json, math, shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (DictionaryObject, NameObject, TextStringObject,
                          ArrayObject, DecodedStreamObject)
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
MM = 72 / 25.4
W, H = 185 * MM, 240 * MM
INK = "#173E2C"
PAPER = "#FFF8E9"
STEM = "Vegetable-Guru-Introduction-Oval-Trial"
FONTS = ROOT / "docs/publication/artwork-proposals/2026-11-24-section-opener-layered-masters-01/Fonts-Source"
SOURCES = {
    "tomatoes": ROOT / "docs/assets/vegetable-guru-stock/john-gardening-2026-11-17/sources/T05_05m16s042_4K.png",
    "garden1991": ROOT / "docs/publication/introduction-revision/assets/garden-1991-restored.png"
}
for name, filename in [("Body","Nunito.ttf"),("Bold","Nunito-Bold.ttf"),("Title","Lilita.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))
LAYERS = HERE / "layers"
LAYERS.mkdir(parents=True, exist_ok=True)
# All shape coordinates in mm from page top-left. Smooth, asymmetric ovals.
SHAPES = {
    "tomatoes": [
        ("M",130,-16),
        ("C",105,-8,100,16,105,43),
        ("C",111,77,150,102,183,100),
        ("C",216,98,232,52,216,11),
        ("C",200,-24,155,-34,130,-16)
    ],
    "garden1991": [
        ("M",-10,167),
        ("C",24,159,69,169,85,195),
        ("C",98,221,89,242,63,250),
        ("C",24,268,-30,260,-39,226),
        ("C",-48,194,-38,178,-10,167)
    ]
}
PLACEMENTS = {
    "tomatoes": {"x":62,"y":-4,"width":174.2222222,"height":98},
    "garden1991": {"x":-12,"y":171,"width":115,"height":115*1034/1520}
}
SHAPES["tomatoes"] = [tuple([p[0]]+[v if i%2==1 else v*0.92 for i,v in enumerate(p[1:],1)]) for p in SHAPES["tomatoes"]]
SHAPES["garden1991"] = [tuple([p[0]]+[v if i%2==1 else v+8 for i,v in enumerate(p[1:],1)]) for p in SHAPES["garden1991"]]
CAPTIONS = [
    {"lines":["Still from the author’s","YouTube channel 2026"],"x":122,"top":95,"width":55,"size":8.25,"leading":10.5},
    {"lines":["The author’s first","food garden, 1991."],"x":103,"top":216,"width":74,"size":8.25,"leading":10.5}
]
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def draw_text(c, x, baseline, value, font="Body", size=10.5, color=INK):
    c.setFillColor(HexColor(color)); c.setFont(font,size)
    c.drawString(x*MM, H-baseline*MM, value)
def draw_path(c, cmds):
    p=c.beginPath()
    for cmd in cmds:
        if cmd[0]=="M": p.moveTo(cmd[1]*MM,H-cmd[2]*MM)
        else: p.curveTo(cmd[1]*MM,H-cmd[2]*MM,cmd[3]*MM,H-cmd[4]*MM,cmd[5]*MM,H-cmd[6]*MM)
    p.close()
    return p
def polygon(cmds):
    pts=[]; last=None
    for cmd in cmds:
        if cmd[0]=="M": last=(cmd[1],cmd[2]);pts.append(last)
        else:
            a=last;b=(cmd[1],cmd[2]);d=(cmd[3],cmd[4]);e=(cmd[5],cmd[6])
            for i in range(1,301):
                t=i/300;s=1-t
                pts.append((s*s*s*a[0]+3*s*s*t*b[0]+3*s*t*t*d[0]+t*t*t*e[0],
                            s*s*s*a[1]+3*s*s*t*b[1]+3*s*t*t*d[1]+t*t*t*e[1]))
            last=e
    return pts
POLYGONS={k:polygon(v) for k,v in SHAPES.items()}
def intersections(poly,y):
    xs=[]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        if (a[1] <= y < b[1]) or (b[1] <= y < a[1]):
            xs.append(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))
    return xs
def wrap_bounds(baseline, size):
    # The safety envelope includes glyph ascenders/descenders plus 4 mm clearance.
    asc=pdfmetrics.getAscent("Body",size)/MM
    desc=-pdfmetrics.getDescent("Body",size)/MM
    left,right=17,177
    ys=[baseline-asc-4+i*(asc+desc+8)/60 for i in range(61)]
    for key in SHAPES:
        vals=[x for y in ys for x in intersections(POLYGONS[key],y)]
        if not vals: continue
        if key=="tomatoes":right=min(right,min(vals)-4)
        else:left=max(left,max(vals)+4)
    for cap in CAPTIONS:
        capbottom=cap["top"]+len(cap["lines"])*cap["leading"]/MM
        if baseline+desc+2 > cap["top"] and baseline-asc-2 < capbottom:
            right=min(right,cap["x"]-5)
    return left,right
text=(ROOT/"docs/publication/introduction-revision/introduction.txt").read_text().strip()
paragraphs=text.split("\n\n")
LINES=[]
baseline=43
size=10.5;leading=14.5/MM;para_gap=8/MM
for pi,para in enumerate(paragraphs):
    font="Bold" if pi==len(paragraphs)-1 else "Body"
    words=para.split(); idx=0
    while idx < len(words):
        left,right=wrap_bounds(baseline,size)
        avail=(right-left)*MM
        assert avail > 32*MM, (pi,baseline,left,right)
        line=words[idx];end=idx+1
        while end<len(words) and pdfmetrics.stringWidth(line+" "+words[end],font,size) <= avail:
            line+=" "+words[end];end+=1
        LINES.append({"paragraph":pi,"text":line,"x":left,"right":right,"baseline":baseline,
                      "font":font,"size":size,"width":pdfmetrics.stringWidth(line,font,size)/MM})
        idx=end;baseline+=leading
    baseline+=para_gap
# Avoid isolated last words without changing copy, font size or the curve wrap.
for pi in range(len(paragraphs)-1):
    lines=[line for line in LINES if line["paragraph"]==pi]
    if len(lines)<2:continue
    prev,last=lines[-2:]
    while last["width"] < (last["right"]-last["x"])*0.45:
        words=prev["text"].split()
        if len(words)<3:break
        a=" ".join(words[:-1]);b=words[-1]+" "+last["text"]
        aw=pdfmetrics.stringWidth(a,prev["font"],size)/MM
        bw=pdfmetrics.stringWidth(b,last["font"],size)/MM
        if aw < (prev["right"]-prev["x"])*0.55 or bw > last["right"]-last["x"]:break
        prev.update(text=a,width=aw);last.update(text=b,width=bw)
signoff=[line for line in LINES if line["paragraph"]==len(paragraphs)-1]
assert len(signoff)==2
signoff_x=max(line["x"] for line in signoff)
for line,value in zip(signoff,["John Lennon — Cornwall, England,","November 2026."]):
    line.update(text=value,x=signoff_x,width=pdfmetrics.stringWidth(value,"Bold",size)/MM)
assert LINES[-1]["baseline"] < 213, ("Body too long", LINES[-1])
for pi,para in enumerate(paragraphs):
    assert " ".join(x["text"] for x in LINES if x["paragraph"]==pi) == " ".join(para.split())

def paper(c):
    c.setFillColor(HexColor(PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
def photo(c,key):
    c.saveState();c.setFillAlpha(1);c.setStrokeAlpha(1)
    c.clipPath(draw_path(c,SHAPES[key]),stroke=0,fill=0)
    v=PLACEMENTS[key]
    c.drawImage(ImageReader(str(SOURCES[key])),v["x"]*MM,H-(v["y"]+v["height"])*MM,
                v["width"]*MM,v["height"]*MM)
    c.restoreState()
def heading(c):
    draw_text(c,17,18.2,"A WORD FROM THE AUTHOR","Bold",7.35)
    draw_text(c,17,33.2,"Introduction","Title",32.25)
def body(c):
    for line in LINES:
        draw_text(c,line["x"],line["baseline"],line["text"],line["font"],line["size"])
def captions(c):
    for cap in CAPTIONS:
        for i,line in enumerate(cap["lines"]):
            draw_text(c,cap["x"],cap["top"]+2.5+i*cap["leading"]/MM,line,size=cap["size"])
def folio(c):
    # Bottom-left photograph occupies the usual running-footer position.
    # Keep just the original printed folio in the clear lower-right corner.
    draw_text(c,174.8,231.0,"5","Bold",7.35)
drawers=[
    ("Paper",paper),
    ("Tomato portrait",lambda c:photo(c,"tomatoes")),
    ("1991 garden",lambda c:photo(c,"garden1991")),
    ("Heading",heading),
    ("Introduction and sign-off",body),
    ("Photo captions",captions),
    ("Folio",folio)
]
layerfiles=[]
for idx,(name,fn) in enumerate(drawers):
    out=LAYERS/f"{idx+1:02}-{name.replace(' ','-')}.pdf"
    c=canvas.Canvas(str(out),pagesize=(W,H),pageCompression=1,invariant=1)
    c.setTitle("Introduction — "+name);fn(c);c.showPage();c.save()
    layerfiles.append(out)

def merge_layers(output, indexes):
    writer=PdfWriter()
    target=writer.add_blank_page(W,H)
    groups=[]
    for idx in indexes:
        r=PdfReader(str(layerfiles[idx]));page=r.pages[0]
        name=drawers[idx][0];key=NameObject(f"/VGIntroLayer{idx+1}")
        ocg=writer._add_object(DictionaryObject({NameObject("/Type"):NameObject("/OCG"),NameObject("/Name"):TextStringObject(name)}))
        groups.append(ocg)
        res=page["/Resources"]
        res[NameObject("/Properties")]=DictionaryObject({key:ocg})
        stream=DecodedStreamObject()
        stream.set_data(b"q\n/OC "+str(key).encode()+b" BDC\n"+page.get_contents().get_data()+b"\nEMC\nQ\n")
        page[NameObject("/Contents")]=stream
        target.merge_page(page)
    a=ArrayObject(groups)
    writer._root_object[NameObject("/OCProperties")]=DictionaryObject({
        NameObject("/OCGs"):a,
        NameObject("/D"):DictionaryObject({NameObject("/Name"):TextStringObject("Introduction layers"),
        NameObject("/Order"):a,NameObject("/ON"):a,NameObject("/BaseState"):NameObject("/ON")})})
    writer.add_metadata({"/Title":"The Vegetable Guru — Introduction — two-photo oval trial",
                         "/Author":"John Lennon","/Subject":"Experimental folio 5. Native text and independent photo layers."})
    with open(output,"wb") as f:writer.write(f)

merge_layers(HERE/(STEM+".pdf"),range(len(drawers)))
merge_layers(HERE/"Overlay-Native-Type.pdf",[3,4,5,6])
(HERE/"Introduction-Text.txt").write_text(text+"\n")
layout={"trim_mm":[185,240],"folio":5,"status":"proposal for review",
        "paper":PAPER,"ink":INK,"body":{"font":"Nunito Sans","size_pt":10.5,"leading_pt":14.5,"paragraph_gap_pt":8},
        "heading":{"font":"Lilita One","size_pt":32.25},
        "photo_opacity":1,"shapes_mm_from_top_left":SHAPES,"image_placements_mm":PLACEMENTS,
        "captions":CAPTIONS,"lines":LINES,"layers":[x[0] for x in drawers],
        "sources":{}}
for key,path in SOURCES.items():
    im=Image.open(path);v=PLACEMENTS[key]
    layout["sources"][key]={"path":str(path.relative_to(ROOT)),"sha256":sha(path),"pixels":list(im.size),
                           "effective_ppi":round(im.width/(v["width"]/25.4),1)}
(HERE/"Layout.json").write_text(json.dumps(layout,indent=2,ensure_ascii=False)+"\n")
check=PdfReader(HERE/(STEM+".pdf"))
actual=" ".join(check.pages[0].extract_text().split())
assert " ".join(text.split()) in actual
for cap in CAPTIONS:assert " ".join(cap["lines"]) in actual
assert len(check.pages[0].images)==2
assert len(check.trailer["/Root"]["/OCProperties"]["/OCGs"])==7
assert len(PdfReader(HERE/"Overlay-Native-Type.pdf").pages[0].images)==0
fonts=[]
for ref in check.pages[0]["/Resources"]["/Font"].values():
    f=ref.get_object()
    if f.get("/Subtype")=="/Type1" and f.get("/BaseFont")=="/Helvetica":continue
    assert "/FontDescriptor" in f
    desc=f["/FontDescriptor"].get_object()
    assert any(k in desc for k in ["/FontFile","/FontFile2","/FontFile3"])
    fonts.append(str(f["/BaseFont"]))
checks={"page_count":len(check.pages),"trim_mm":[185,240],"full_copy_verified":True,
        "captions_verified":True,"image_count":len(check.pages[0].images),
        "layer_count":7,"overlay_image_count":0,"native_embedded_fonts":sorted(set(fonts)),
        "last_body_baseline_mm":LINES[-1]["baseline"],"body_line_count":len(LINES)}
(HERE/"CHECKS.json").write_text(json.dumps(checks,indent=2)+"\n")
print(json.dumps(checks,indent=2))

