"""Save selected Version 6-2 and assemble the three saved fronts without redraws."""
from pathlib import Path
from io import BytesIO
import hashlib, json, shutil
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter, Transformation
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
VERSIONS = HERE.parent
NEW = VERSIONS / 'version-6-2'
SOURCE = ROOT / 'generated_images/exec-4634838f-b13c-46ce-8c7d-b17a058688bc.png'
OUTPUT = HERE / 'The-Vegetable-Guru-Versions-6-6-1-6-2.pdf'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n')

NEW.mkdir(exist_ok=True)
saved_image = NEW/'Version-6-2.png'
if saved_image.exists():
    assert sha(saved_image) == sha(SOURCE), 'Existing Version 6-2 differs; will not overwrite'
else:
    shutil.copyfile(SOURCE, saved_image)
saved_pdf = NEW/'Version-6-2.pdf'
if not saved_pdf.exists():
    c = canvas.Canvas(str(saved_pdf), pagesize=(185*mm, 240*mm), pageCompression=1)
    c.setTitle('The Vegetable Guru - Version 6-2')
    c.setAuthor('John Lennon')
    c.drawImage(str(saved_image), 0, 0, width=185*mm, height=240*mm)
    c.showPage(); c.save()
reader = PdfReader(saved_pdf, strict=True)
assert len(reader.pages) == 1
embedded = reader.pages[0].images[0].image.convert('RGB')
with Image.open(saved_image) as image:
    assert embedded.size == image.size
    assert embedded.tobytes() == image.convert('RGB').tobytes(), 'PDF image pixels differ'
    dims = list(image.size)
record = {
    'version':'6-2', 'date':'2026-11-16',
    'status':'Saved named design at John’s request; not production approval.',
    'user_request':"That's great - lets call this one 6-2. Can you create a PDF for me with 6, 6-1 and 6-2 together?",
    'front':str(saved_pdf.relative_to(ROOT)), 'image':str(saved_image.relative_to(ROOT)),
    'source_generation':str(SOURCE.relative_to(ROOT)),
    'base_version':'docs/publication/cover-versions/version-6-1/VERSION.json',
    'artwork_record':'docs/publication/edition-stickers/revision-05-youtube-cleanup/ARTWORK.json',
    'dimensions_mm':[185,240], 'image_px':dims,
    'design':'Red organic ribbon, small black-and-gold Traditional Measurements sticker inset at lower-left, and cleaned YouTube sticker edge and white face.',
    'files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [SOURCE,saved_image,saved_pdf]},
    'verification':'Saved PNG bytes exactly match selected generation; standalone PDF embeds exact RGB pixels.'
}
write_json(NEW/'VERSION.json',record)
write_json(NEW/'SAVED.json',{'date':'2026-11-16','user_request':record['user_request'],'status':record['status'],'source_generation':record['source_generation'],'sources':{str(p.relative_to(ROOT)):sha(p) for p in [saved_image,saved_pdf]}})

ids = ['6','6-1','6-2']
descriptions = {'6':'Original Version 6','6-1':'Red organic ribbon','6-2':'Ribbon and Traditional Measurements sticker'}
readers = {}; sources = {}
for n in ids:
    path = VERSIONS/f'version-{n}/Version-{n}.pdf'
    readers[n] = PdfReader(path, strict=True)
    assert len(readers[n].pages) == 1
    sources[n] = {'path':str(path.relative_to(ROOT)),'sha256':sha(path),'bytes':path.stat().st_size}

def page_base(width,height,title,subtitle=None):
    buf=BytesIO(); c=canvas.Canvas(buf,pagesize=(width*mm,height*mm))
    c.setFillColorRGB(1,1,1);c.rect(0,0,width*mm,height*mm,fill=1,stroke=0)
    c.setFillColorRGB(.06,.23,.12);c.setFont('Helvetica-Bold',16)
    c.drawString(12.5*mm,(height-15)*mm,title)
    if subtitle:
        c.setFont('Helvetica',10);c.setFillColorRGB(.30,.34,.30)
        c.drawString(12.5*mm,(height-23)*mm,subtitle)
    return buf,c

buf,c=page_base(297,210,'The Vegetable Guru','Front-cover comparison - Versions 6, 6-1 and 6-2')
placements={}
for i,n in enumerate(ids):
    x=10+i*94.5; y=49; width=88; height=width*240/185
    c.setFillColorRGB(.06,.23,.12);c.setFont('Helvetica-Bold',12)
    c.drawString(x*mm,(y+height+5)*mm,'Version '+n)
    c.setFont('Helvetica',8.5);c.setFillColorRGB(.3,.34,.3)
    captions={'6':['Original Version 6'],'6-1':['Adds the red organic ribbon'],'6-2':['Adds the Traditional Measurements sticker','and cleans the YouTube sticker']}[n]
    for line,text in enumerate(captions): c.drawString(x*mm,(y-6-line*4.5)*mm,text)
    placements[n]=[x,y,width,height]
c.showPage();c.save();overview=PdfReader(BytesIO(buf.getvalue())).pages[0]
for n,(x,y,width,height) in placements.items():
    p=readers[n].pages[0]
    overview.merge_transformed_page(p,Transformation().scale(width*mm/float(p.mediabox.width),height*mm/float(p.mediabox.height)).translate(x*mm,y*mm))
w=PdfWriter();w.add_page(overview);w.add_outline_item('Side-by-side comparison',0)
for index,n in enumerate(ids,1):
    buf,c=page_base(210,297,'Version '+n,descriptions[n]);c.showPage();c.save()
    page=PdfReader(BytesIO(buf.getvalue())).pages[0];p=readers[n].pages[0]
    page.merge_transformed_page(p,Transformation().scale(185*mm/float(p.mediabox.width),240*mm/float(p.mediabox.height)).translate(12.5*mm,18*mm))
    w.add_page(page);w.add_outline_item('Version '+n,index)
w.add_metadata({'/Title':'The Vegetable Guru - Versions 6, 6-1 and 6-2','/Author':'Prepared for John Lennon','/Subject':'Three saved front covers: overview and full-size individual pages.'})
w.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
with OUTPUT.open('wb') as f:w.write(f)
pdf=PdfReader(OUTPUT,strict=True);assert len(pdf.pages)==4
for n in ids:
    path=ROOT/sources[n]['path'];assert sha(path)==sources[n]['sha256']
for i,n in enumerate(ids,1):
    assert 'Version '+n in pdf.pages[i].extract_text()
    assert len(pdf.pages[i].images)==1
assert len(pdf.pages[0].images)==3
write_json(HERE/'COLLECTION.json',{'date':'2026-11-16','output':str(OUTPUT.relative_to(ROOT)),'sha256':sha(OUTPUT),'bytes':OUTPUT.stat().st_size,'pages':4,'overview':{'page':1,'dimensions_mm':[297,210],'placements_mm':placements},'individual_pages':{'pages':[2,3,4],'dimensions_mm':[210,297],'cover_dimensions_mm':[185,240]},'sources':sources,'preservation':'Existing PDFs reused directly; sources unchanged. New 6-2 PDF embeds selected PNG without pixel changes. No artwork regenerated or backs added.'})
write_json(HERE/'CHECKS.json',{'strict_pdf_parse':True,'pages':4,'overview_images':3,'individual_page_images':[1,1,1],'individual_labels':ids,'version_6_2_exact_rgb_embedding':True,'sources_preserved':True,'visual_review':'Pending rendered overview and Version 6-2 page inspection.'})
print(json.dumps({'standalone':str(saved_pdf),'comparison':str(OUTPUT),'pages':4,'bytes':OUTPUT.stat().st_size}))
