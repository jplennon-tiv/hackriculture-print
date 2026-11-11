"""Finish only the shortlisted review set, retaining approved P2 PDF objects."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
import json, logging, os, re, subprocess, tempfile, unicodedata, sys
from pathlib import Path
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.constants import PageLabelStyle
from pypdf.generic import NameObject, TextStringObject, RectangleObject
from PIL import Image, ImageDraw, ImageFont
logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[3]
base=root/'docs/publication/variety-additions'
out=root/'output/pdf/variety-additions'
mm=72/25.4
if (base/'APPROVAL.json').exists(): raise ValueError('Preserve approved set.')
checks=json.loads((base/'CHECKS.json').read_text())
def digest(p): return sha256(p.read_bytes()).hexdigest()
def norm(s): return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','')
def actions(page):
    return [a.get_object()['/A'] for a in page.get('/Annots',[]) if '/A' in a.get_object()]
def retarget(page,old_directory,new_directory):
    for a in actions(page):
        if a.get('/S')=='/GoToR':
            target=(old_directory/str(a['/F'])).resolve()
            assert target.exists(),target
            a[NameObject('/F')]=TextStringObject(os.path.relpath(target,new_directory))
def render(path,dest):
    with tempfile.TemporaryDirectory(dir=root/'tmp/variety-additions') as work:
        prefix=Path(work)/'page'
        subprocess.run(['pdftoppm','-scale-to','1350','-png',str(path),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        a,b=[Image.open(Path(work)/f'page-{n}.png').convert('RGB') for n in (1,2)]
        canvas=Image.new('RGB',(a.width+b.width+3,max(a.height,b.height)),(220,221,216))
        canvas.paste(a,(0,0));canvas.paste(b,(a.width+3,0));canvas.save(dest,quality=92)
        return sha256(b.tobytes()).hexdigest()
def process(c,u):
    s=c['units'][u];source=root/s['source']['pdf'];target=root/s['pdf']
    old=PdfReader(source);fresh=PdfReader(root/s['raw']);assert len(old.pages)==2 and len(fresh.pages)==1
    for prop in ('mediabox','cropbox','trimbox'):
        setattr(fresh.pages[0],prop,RectangleObject([0,0,185*mm,240*mm]))
    w=PdfWriter();w.add_page(fresh.pages[0]);w.add_page(old.pages[1]);retarget(w.pages[1],source.parent,target.parent)
    w.page_layout='/TwoPageLeft';w.set_page_label(0,1,style=PageLabelStyle.DECIMAL,start=c['folios'][0])
    w.add_metadata({'/Title':c['name']+' — extra varieties · '+u+' review'})
    w.write(target)
    final=PdfReader(target)
    assert len(final.pages)==2 and final.page_labels==list(map(str,c['folios']))
    for page in final.pages:
        assert abs(float(page.mediabox.width)/mm-185)<.25 and abs(float(page.mediabox.height)/mm-240)<.25
    assert final.pages[1].get_contents().get_data()==old.pages[1].get_contents().get_data()
    assert final.pages[1].extract_text()==old.pages[1].extract_text()
    assert [a['/D'] for a in actions(final.pages[1])]==[a['/D'] for a in actions(old.pages[1])]
    with pdfplumber.open(target) as pdf:
        for part in s['varieties']:
            l,t,r,b=part['box'];extracted=pdf.pages[0].crop((l-.2,t-.4,r+.2,b+.6)).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert norm(part['text']) in norm(extracted),(c['key'],u,part['text'],extracted)
        for i,folio in enumerate(c['folios']):
            assert str(folio) in (pdf.pages[i].crop((0,223*mm,185*mm,240*mm)).extract_text() or '')
    spread=base/'spreads'/f"{c['key']}-{u}.jpg"
    raster=render(target,spread)
    with tempfile.TemporaryDirectory(dir=root/'tmp/variety-additions') as work:
        prefix=Path(work)/'source'
        subprocess.run(['pdftoppm','-f','2','-l','2','-scale-to','1350','-png',str(source),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        original=Image.open(Path(work)/'source-2.png').convert('RGB')
        assert raster==sha256(original.tobytes()).hexdigest(),(c['key'],u,'P2 image changed')
    return {'crop':c['key'],'unit':u,'pdf':s['pdf'],'sha256':digest(target),'pages':2,'folios':c['folios'],'varietiesVerifiedAtPdfCoordinates':len(s['varieties']),'practicalPageContentExact':True,'practicalPageTextExact':True,'practicalPagePixelsExact':True,'linksRetargetedAndVerified':True,'spread':str(spread.relative_to(root))}
jobs=[(c,u) for c in checks['crops'] if not sys.argv[1:] or c['key'] in sys.argv[1:] for u in ('imperial','metric')]
with ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(lambda job:process(*job),jobs))
if sys.argv[1:]:
    old=json.loads((base/'PDF-CHECKS.json').read_text())['proofs']
    results=[r for r in old if r['crop'] not in sys.argv[1:]]+results
for r in results: print(r['crop'],r['unit'],'verified',flush=True)
jerusalem='docs/publication/sowing-rollout/revisions/artichoke_jerusalem_varieties'
entries=[{'key':'artichoke_jerusalem','name':'Artichoke, Jerusalem','folios':[12,13],'approved':True}]+checks['crops']
combined={}
for u in ('imperial','metric'):
    w=PdfWriter();path=out/f'vegetable-variety-additions-{u}.pdf'
    for i,c in enumerate(entries):
        p=root/(f'output/pdf/sowing-rollout/revisions/artichoke_jerusalem_varieties/artichoke_jerusalem-{u}.pdf' if c['key']=='artichoke_jerusalem' else c['units'][u]['pdf'])
        reader=PdfReader(p)
        for page in reader.pages:
            added=w.add_page(page);retarget(added,p.parent,path.parent)
        w.add_outline_item(c['name'],i*2)
        w.set_page_label(i*2,i*2+1,style=PageLabelStyle.DECIMAL,start=c['folios'][0])
    w.page_layout='/TwoPageLeft';w.add_metadata({'/Title':'The Vegetable Guru — variety additions · '+u+' review'})
    w.compress_identical_objects(remove_identicals=True,remove_orphans=True);w.write(path)
    final=PdfReader(path);assert len(final.pages)==26
    assert final.page_labels==[str(f) for c in entries for f in c['folios']]
    combined[u]={'pdf':str(path.relative_to(root)),'pages':26,'spreads':13,'sha256':digest(path)}
(base/'PDF-CHECKS.json').write_text(json.dumps({'date':'2026-11-10','status':'For review','combined':combined,'proofs':results},indent=2)+'\n')
# Actual PDF page-one contact sheets: six pages per sheet, for visual review.
for u in ('imperial','metric'):
    for group,start in enumerate(range(0,len(entries),6),1):
        selection=entries[start:start+6];canvas=Image.new('RGB',(1500,2*700),(240,241,237));draw=ImageDraw.Draw(canvas)
        for j,c in enumerate(selection):
            source=root/(f'{jerusalem}/spreads/artichoke_jerusalem-{u}.jpg' if c['key']=='artichoke_jerusalem' else f'docs/publication/variety-additions/spreads/{c["key"]}-{u}.jpg')
            im=Image.open(source);im=im.crop((0,0,(im.width-3)//2,im.height));im.thumbnail((485,655))
            x=(j%3)*500;y=(j//3)*700;canvas.paste(im,(x+5,y+25));draw.text((x+8,y+6),c['name']+' · '+u,fill=(28,62,55))
        canvas.save(base/f'contact-{u}-{group}.jpg',quality=90)
print('Combined review PDFs: 26 pages in each edition.')
