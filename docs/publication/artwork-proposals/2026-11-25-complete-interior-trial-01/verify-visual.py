from pathlib import Path
import subprocess,json,math
from PIL import Image,ImageDraw,ImageFont
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import RectangleObject,NameObject,ArrayObject,DictionaryObject
import numpy as np
ROOT=Path("/Users/johnlennon/Documents/web_site/hackriculture-print")
D=ROOT/"docs/publication/artwork-proposals/2026-11-25-complete-interior-trial-01"
PDF=ROOT/"output/pdf/photorealistic-trial-2026-11-25/Vegetable-Guru-Photorealistic-Trial-Complete-Interior.pdf"
TMP=Path("/tmp/vg-complete-interior-checks");TMP.mkdir(exist_ok=True)
BIN="/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
W,H=185*72/25.4,240*72/25.4
r=subprocess.run([BIN,"-scale-to","420","-jpeg","-jpegopt","quality=85",str(PDF),str(TMP/"page")],capture_output=True,text=True)
assert r.returncode==0,r.stderr
imgs=sorted(TMP.glob("page-*.jpg"));assert len(imgs)==174,len(imgs)
font=ImageFont.load_default(size=16)
sheets=[]
for offset in range(0,174,30):
 chunk=imgs[offset:offset+30];sheet=Image.new("RGB",(1080,1320),"#e8e5dd");draw=ImageDraw.Draw(sheet)
 for k,file in enumerate(chunk):
  im=Image.open(file);im.thumbnail((166,235))
  col,row=k%6,k//6;x=col*180+7;y=row*264+7
  sheet.paste(im,(x+(166-im.width)//2,y));draw.text((x,y+238),str(offset+k+1),fill="#173e2c",font=font)
 dst=TMP/f"overview-{offset//30+1}.jpg";sheet.save(dst,quality=92);sheets.append(str(dst))
print(json.dumps({"overview_sheets":sheets}),flush=True)
# Compare every replacement with the exact accepted master at its trim box.
mapping=json.loads((D/"PAGE-MAP.json").read_text());new=[v for v in mapping if v["replaced"]]
refs=PdfWriter();groups=[]
for v in new:
 doc=PdfReader(ROOT/v["source"]);p=refs.add_page(doc.pages[v["source_page"]-1]);box=list(map(float,p.trimbox))
 if box[0] or box[1]:p.add_transformation(Transformation().translate(tx=-box[0],ty=-box[1]))
 for k in ["/MediaBox","/CropBox","/TrimBox","/BleedBox"]:p[NameObject(k)]=RectangleObject([0,0,W,H])
 for group in doc.trailer["/Root"].get("/OCProperties",{}).get("/OCGs",[]):groups.append(group.clone(refs))
if groups:
 a=ArrayObject(groups);refs._root_object[NameObject("/OCProperties")]=DictionaryObject({NameObject("/OCGs"):a,NameObject("/D"):DictionaryObject({NameObject("/ON"):a,NameObject("/Order"):a})})
ref_path=TMP/"accepted-replacements.pdf";refs.write(ref_path)
result=[]
for i,v in enumerate(new):
 out1=TMP/f"source-{v['folio']}";out2=TMP/f"trial-{v['folio']}"
 for path,page,out in [(ref_path,i+1,out1),(PDF,v["folio"],out2)]:
  run=subprocess.run([BIN,"-f",str(page),"-l",str(page),"-singlefile","-scale-to","1200","-png",str(path),str(out)],capture_output=True,text=True)
  assert run.returncode==0,run.stderr
 a=np.asarray(Image.open(str(out1)+".png").convert("RGB"),dtype=np.int16);b=np.asarray(Image.open(str(out2)+".png").convert("RGB"),dtype=np.int16)
 diff=np.abs(a-b);assert a.shape==b.shape
 result.append({"folio":v["folio"],"mean_channel_difference":float(diff.mean()),"percent_pixels_channel_diff_over_24":float((diff.max(axis=2)>24).mean()*100)})
 print("Compared accepted page",v["folio"],"mean difference",round(diff.mean(),3),flush=True)
sheet=Image.new("RGB",(1200,810),"#e8e5dd");draw=ImageDraw.Draw(sheet)
for i,v in enumerate(new):
 im=Image.open(TMP/f"trial-{v['folio']}.png");im.thumbnail((275,360));x=(i%4)*300+12;y=(i//4)*405+10
 sheet.paste(im,(x+(275-im.width)//2,y));draw.text((x,y+369),"Page "+str(v["folio"]),fill="#173e2c",font=font)
sheet.save(TMP/"new-pages.jpg",quality=95)
checks=json.loads((D/"CHECKS.json").read_text());checks.update(all_174_pages_rendered=True,replacement_render_comparison=result,overview_sheets=sheets,visual_review_status="contact sheets and replacement comparisons prepared")
(D/"CHECKS.json").write_text(json.dumps(checks,indent=2)+"\n")
print(json.dumps({"new_pages":str(TMP/"new-pages.jpg"),"comparison":result}),flush=True)

