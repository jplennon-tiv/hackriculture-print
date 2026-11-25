"""Compare previously liked pictures, excluding adopted image families.
Contact-sheet layout only. No generation, retouching or image upscaling.
"""
from pathlib import Path
import json,hashlib
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
BASE=HERE.parent
FONT=BASE/"2026-11-24-section-opener-layered-masters-01/Fonts-Source"
for key,name in [("Title","Lilita.ttf"),("Body","Nunito.ttf"),("Bold","Nunito-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(key,str(FONT/name)))
MM=72/25.4;W=297*MM;H=350*MM;PAPER="#FFF8E9";INK="#173E2C"
PANELS=HERE/"panels";PANELS.mkdir(parents=True,exist_ok=True)
short=BASE/"2026-11-24-vegetable-guides-opener-05-shortlist"
short_record=json.loads((short/"ARTWORK.json").read_text())
items=[]
names={20:("A","Chard","Guides favourite 20","Colourful stems and broad leaves."),
25:("B","Aubergine","Guides favourite 25","Purple fruit, flower and foliage."),
7:("C","Courgette","Guides favourite 7","Fruit and flower at soil level."),
16:("D","John tending the bed","Guides favourite 16","Crouching beside the courgettes.")}
for n,(letter,title,ref,note) in names.items():
    row=next(x for x in short_record["candidates"] if x["number"]==n)
    source=short/row["panel_file"]
    assert hashlib.sha256(source.read_bytes()).hexdigest()==row["panel_sha256"]
    im=Image.open(source)
    out=PANELS/f"{letter}-{title.replace(' ','-')}.png"
    im.save(out)
    assert Image.open(out).tobytes()==im.tobytes()
    items.append({"id":letter,"title":title,"original_reference":ref,"note":note,"source":str(source),
        "source_sha256":row["panel_sha256"],"panel_file":str(out.relative_to(HERE)),
        "kind":"generated photographic concept","selection_evidence":str((short/"ARTWORK.json").relative_to(ROOT)),
        "usage":"Not adopted in the selected new opening pages; distinct from the older chard/title/contents photographs." if n==20 else "Not adopted in the selected new opening pages."})
layout=json.loads((BASE/"2026-11-25-interior-title-d-e-lettering-03/LAYOUT.json").read_text())
esource=Path(layout["E_background"]);im=Image.open(esource).crop(layout["E_clip_pixels"]);efile=PANELS/"E-Garden-scene.png";im.save(efile)
items.append({"id":"E","title":"Garden scene","original_reference":"Interior-title candidate E",
"note":"Courgette beds; John in the distance.","source":str(esource),"source_sha256":hashlib.sha256(esource.read_bytes()).hexdigest(),
"crop_pixels":layout["E_clip_pixels"],"panel_file":str(efile.relative_to(HERE)),"kind":"generated photographic concept",
"selection_evidence":"docs/publication/artwork-proposals/2026-11-25-interior-title-developed-contact-02/RESULT.json",
"usage":"John shortlisted D and E, then selected D. E was tested with lettering but not adopted."})
fsource=BASE/"2026-11-25-interior-title-video-scout-01/stills/16-00317.501.png"
im=Image.open(fsource);im.thumbnail((1200,1200));ffile=PANELS/"F-Climbing-beans.jpg";im.save(ffile,quality=95,subsampling=0)
items.append({"id":"F","title":"Climbing beans","original_reference":"Camera shortlist 16",
"note":"Full camera frame; garden-only view.","source":str(fsource),"source_sha256":hashlib.sha256(fsource.read_bytes()).hexdigest(),
"panel_file":str(ffile.relative_to(HERE)),"kind":"original video still",
"selection_evidence":"John's camera shortlist 02 / 07 / 09 / 13 / 16; recorded in interior-title-developed-contact-02/README.md.",
"usage":"Liked original camera seed. Shown in rejected contents header option 1, not used in an accepted page."})
def label(c,x,y,text,font="Body",size=10,color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x*MM,H-y*MM,text)
out=HERE/"Vegetable-Guru-Unused-Favourites.pdf"
c=canvas.Canvas(str(out),pagesize=(W,H),pageCompression=1,invariant=1)
c.setTitle("The Vegetable Guru — unused favourites for Contents");c.setAuthor("John Lennon")
c.setFillColor(HexColor(PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
label(c,12,17,"Unused favourites",font="Title",size=25)
label(c,12,26,"Six earlier choices to consider for the selected outer-corner contents layout.",size=10.5)
label(c,12,33,"Original references are retained below each picture. No new artwork has been generated.",size=9)
for i,item in enumerate(items):
    x=12+(i%3)*93;y=43+(i//3)*150
    c.setFillColor(HexColor("#F4EFDF"));c.roundRect(x*MM,H-(y+115)*MM,87*MM,115*MM,2*MM,fill=1,stroke=0)
    im=Image.open(HERE/item["panel_file"]);scale=min(87/im.width,115/im.height);iw,ih=im.width*scale,im.height*scale
    c.drawImage(ImageReader(str(HERE/item["panel_file"])),(x+(87-iw)/2)*MM,H-(y+(115-ih)/2+ih)*MM,iw*MM,ih*MM)
    label(c,x,y+122,f'{item["id"]}  {item["title"]}',font="Bold",size=12)
    label(c,x,y+128,item["original_reference"],font="Bold",size=9)
    label(c,x,y+134,item["note"],size=8.5)
label(c,12,338,"F was seen in the discarded header trial. These six are not used in the accepted new opening pages.",size=8.4)
label(c,12,344,"Selection thumbnails: develop the chosen pictures separately before preparing print artwork.",size=8.4)
c.showPage();c.save()
record={"date":"2026-11-25","status":"image choice pending; contents layout option 3 selected",
"contact_sheet":"Vegetable-Guru-Unused-Favourites.pdf","items":items,
"excluded":[
{"reference":"Guides favourite 9","reason":"Leek scene already used for the selected Guides divider."},
{"reference":"Guides favourite 21","reason":"Red cabbage developed into the selected Troubles divider."},
{"reference":"Earlier courgette 05 (22 November)","reason":"Already used on the earlier approved title page; excluded after checking its source hash in mixed-size-variations/APPROVAL.json."},
{"reference":"Troubles tomato C","reason":"Colour was liked, but the image was subsequently set aside as too focal. Not promoted back into the active favourites without a new request."}
],
"preference_evidence":"User: options 3 it is now. I don't want to reuse existing pictures.",
"generation_performed":False,"production_files_changed":False}
for item in items:
    p=HERE/item["panel_file"];item["panel_sha256"]=hashlib.sha256(p.read_bytes()).hexdigest()
(HERE/"CANDIDATES.json").write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n")
t=PdfReader(out).pages[0].extract_text()
for item in items:assert item["title"] in t
print(json.dumps({"pdf":str(out),"bytes":out.stat().st_size,"candidates":len(items)}))

