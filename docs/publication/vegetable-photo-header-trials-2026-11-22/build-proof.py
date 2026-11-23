"""Six separate header proposals; retain installed book and all guide bodies."""
from pathlib import Path
import json,hashlib,copy,io
from collections import Counter
from pypdf import PdfReader,PdfWriter,PageObject,Transformation
from pypdf.generic import NameObject,DecodedStreamObject
from reportlab.pdfgen import canvas
import pypdfium2 as pdfium
import pdfplumber
import numpy as np
from PIL import Image,ImageDraw

D=Path(__file__).resolve().parent;R=D.parents[2]
O=R/'output/pdf/vegetable-photo-header-trials';O.mkdir(parents=True,exist_ok=True)
MM=72/25.4;W=185*MM;H=240*MM;HH=33*MM
A=json.loads((D/'ARTWORK.json').read_text());source=R/A['sourceBook']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(source)==A['sourceBookSHA256'],'Installed book changed; inspect before adapting.'
base=PdfReader(source);headers=PdfReader(D/'headers.pdf');out=PdfWriter();rows=[]
def clip(page,bottom,height):
    q=copy.copy(page);s=DecodedStreamObject();s.set_data(f'q 0 {bottom:.9f} {W:.9f} {height:.9f} re W n\n'.encode()+page.get_contents().get_data()+b'\nQ\n');q[NameObject('/Contents')]=s;q.pop('/Annots',None);return q
def detach(page):
    s=DecodedStreamObject();s.set_data(page.get_contents().get_data());page[NameObject('/Contents')]=out._add_object(s)
def original(crop):return base.pages[35 if crop=='carrot' else 57]
def header(crop,option):return original(crop) if option=='Original' else headers.pages['ABC'.index(option)*2+(0 if crop=='carrot' else 1)]
names={'Original':'Current illustrated header','A':'Familiar curved edge','B':'Framed garden photograph','C':'Wider garden view'}
for crop in ['carrot','kale']:
    buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(W,H));c.setFillColorRGB(1,248/255,233/255);c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColorRGB(23/255,62/255,44/255);c.setFont('Helvetica-Bold',17);c.drawString(22,H-31,crop.capitalize()+' - garden-photo header trials')
    c.setFont('Helvetica',8.5);c.drawString(22,H-47,'Original plus three proposals, shown at the actual 185 mm page width.')
    for j,option in enumerate(['Original','A','B','C']):
        top=85+j*142;c.setFont('Helvetica-Bold',9);c.drawString(22,H-top+11,option+' / '+names[option])
        c.setStrokeColorRGB(.83,.84,.75);c.setLineWidth(.4);c.line(22,H-top-101,W-22,H-top-101)
    c.setFont('Helvetica',8);c.drawString(22,28,'Generated garden scenes; proposals only. Complete page trials follow.');c.showPage();c.save();buf.seek(0)
    page=out.add_page(PdfReader(buf).pages[0]);detach(page)
    for j,option in enumerate(['Original','A','B','C']):page.merge_transformed_page(clip(header(crop,option),H-HH,HH),Transformation().translate(0,-(85+j*142)))
    out.add_outline_item(crop.capitalize()+' - compare Original / A / B / C',len(out.pages)-1)
for i,option in enumerate('ABC'):
  for k,crop in enumerate(['carrot','kale']):
    page=out.add_page(clip(original(crop),0,H));detach(page);page.merge_page(headers.pages[i*2+k]);page.pop('/Annots',None)
    out.add_outline_item(option+' - '+crop.capitalize()+' - '+names[option],len(out.pages)-1)
    rows.append({'option':option,'crop':crop,'pdfPage':len(out.pages),'originalPDFPage':36 if crop=='carrot' else 58})
out.add_metadata({'/Title':'The Vegetable Guru - Garden Photo Header Trials','/Author':'John Lennon','/Subject':'Proposals only: carrots and kale growing in soil; installed book unchanged'})
target=O/'Vegetable-Guru-Garden-Photo-Header-Trials.pdf';out.write(target)
def render(doc,i,scale=1.6):
    p=doc[i];bitmap=p.render(scale=scale);im=bitmap.to_pil().convert('RGB');bitmap.close();p.close();return im
doc=pdfium.PdfDocument(target);old=pdfium.PdfDocument(source);checks=[];renders=D/'pages';renders.mkdir(exist_ok=True)
for i in range(8):render(doc,i).save(renders/f'page-{i+1:02}.png')
with pdfplumber.open(target) as new,pdfplumber.open(source) as prior:
  for row in rows:
    pi=row['pdfPage']-1;oldpi=row['originalPDFPage']-1
    a=np.asarray(render(old,oldpi));b=np.asarray(render(doc,pi));cut=int(np.ceil(HH*1.6))+3
    count=int(np.count_nonzero(a[cut:]!=b[cut:]));assert count==0,('Body pixels changed',row,count)
    def chars(p):return Counter((x['text'],round(x['x0'],3),round(x['top'],3),round(x['size'],3),x['fontname']) for x in p.chars if x['top']>96)
    assert chars(new.pages[pi])==chars(prior.pages[oldpi]),('Body text changed',row)
    for s in ['DIFFICULTY','Fairly Easy','2/5','HARVEST SEASONS', 'Summer / Autumn' if row['crop']=='carrot' else 'Spring / Autumn / Winter']:
      assert s.replace(' ','') in ''.join(x['text'] for x in new.pages[pi].chars).replace(' ',''),('Header metadata missing',row,s)
    checks.append({**row,'bodyPixelsChanged':count,'bodyTextAndGeometryUnchanged':True,'headerMetadataPresent':True})
assert sha(source)==A['sourceBookSHA256']
sheet=Image.new('RGB',(1000,650),'#e6e1d5');draw=ImageDraw.Draw(sheet)
for k,crop in enumerate(['carrot','kale']):
    draw.text((k*500+16,12),crop.upper(),fill='#173e2c')
    for j,opt in enumerate(['Original','A','B','C']):
        pi=k if opt=='Original' else 2+'ABC'.index(opt)*2+k
        full=render(old,35 if k==0 else 57,2) if opt=='Original' else render(doc,pi,2)
        top=full.crop((0,0,full.width,int(HH*2)));top.thumbnail((490,250))
        y=38+j*140;draw.text((k*500+10,y),opt+' / '+names[opt],fill='#173e2c');sheet.paste(top,(k*500+5,y+25))
sheet=sheet.crop((0,0,1000,38+3*140+25+int(HH/W*490)+12));sheet.save(D/'Header-Comparison.jpg',quality=95)
result={'date':'2026-11-22','status':'Proposals; visual inspection pending','pdf':str(target.relative_to(R)),'sha256':sha(target),'bytes':target.stat().st_size,'pages':8,'trimMm':[185,240],'sourceBookUnchanged':True,'sourceSHA256':A['sourceBookSHA256'],'guideBodies':checks,'photos':json.loads((D/'HEADER-CHECKS.json').read_text()),'intentionalChanges':['A/B retain original native title, category and harvest-season icons/words.','C repositions native-font title/category/season words; small season icons are omitted in this proposal.','The rating remains Fairly Easy, two filled dots out of five, and 2/5 on all six trials.','Illustrated hero replaced only in the proposed header.']}
(D/'PROOF-CHECKS.json').write_text(json.dumps(result,indent=2)+'\n')
print('Created 8-page trial proof; all six guide bodies match the installed source exactly.')
