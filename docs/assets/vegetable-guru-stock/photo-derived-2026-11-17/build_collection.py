"""Package the 30-photo-derived selection. Never alters master image bytes.

Run with the primary Python runtime (Pillow, numpy, reportlab, pypdf).
Generation is a separate operation; exact inputs and retained outputs are kept.
"""
from pathlib import Path
import copy, hashlib, io, json, shutil, zipfile
from xml.sax.saxutils import escape
import numpy as np
from PIL import Image, ImageOps
from reportlab.pdfgen import canvas
from reportlab import rl_config
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject

B = Path(__file__).resolve().parent
ROOT = B.parents[3]
OLD = B.parent/'photo-derived-2026-11'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
dump = lambda p, d: Path(p).write_text(json.dumps(d, indent=2, ensure_ascii=False)+'\n')
CREAM, GREEN, ACCENT = '#fbf8ed', '#173e2d', '#b84f20'
W, H = 841.8898, 595.2756
rl_config.useA85 = 0

# Titles, interpretation notes and suggested use; these are proposals, not page approval.
INFO = {
9: ('Plum tomato truss','Tall fruiting stem','One truss selected; background omitted and leaves simplified.','A narrow opening-page or margin illustration.'),
10: ('Broad bean pods','Plant detail','A branching group of pods selected; fine hairs and surplus foliage omitted.','A tall section-opening detail.'),
11: ('Green lettuce','Single leafy plant','The green head selected from a photograph containing several lettuces.','A compact corner or small introductory illustration.'),
12: ('Red lettuce','Single leafy plant','The red head selected from the same photograph; broad folds simplified.','A contrasting leafy corner or end-of-section image.'),
13: ('Courgette on the plant','Low plant detail','Fruit and connected stems selected; foliage reduced and obscured tips completed.','A wide section opener or growing-techniques page.'),
14: ('Runner bean flowers','Flowering stem','A natural flower cluster selected and turned upright; surplus leaves omitted.','Flowering and pollination topics; a narrow decorative detail.'),
15: ('Beetroot crown','Root and leaves','The crown and leaves selected from a video frame; background omitted.','A compact plant portrait or harvesting topic.'),
16: ('Butternut on the vine','Fruiting plant detail','The fruit and short connected vine retained; the hand and background omitted.','A wide growing or harvesting illustration.'),
17: ('Sweetcorn in its husk','Tall crop detail','The cob and its husk selected; hand and background omitted.','A tall section-opening or harvest illustration.'),
18: ('Green chilli branch','Narrow fruiting stem','Curving fruits and supporting branch selected; surplus foliage omitted.','A narrow margin or container-growing detail.'),
19: ('Tomatoes in a colander','Wide harvest group','The uneven harvest retained; metal and fruit simplified into broad planes.','An opening-page, storage or harvest illustration.'),
20: ('Pea harvest','Low harvest group','A loose selection of closed pods retained; background and surplus pods omitted.','A shallow footer or harvesting illustration.'),
21: ('Potatoes in the hands','Human harvest detail','Cupped hands and irregular potatoes retained; person, watch and background omitted.','A practical harvesting or introductory illustration.'),
22: ('Green tomato truss','Fruiting stem','Unripe fruits retained on their connected truss; background omitted.','A ripening or crop-care illustration.'),
23: ('Young plant rootball','Whole young plant','The rootball and plant retained; hand removed, roots simplified and clipped tips completed. Crop identity is unconfirmed.','A planting-out or raising-plants illustration.'),
24: ('Carrot harvest','Low root group','Five roots selected from the loose pile; topped stalks retained, background omitted.','A wide harvest or root-crop detail.'),
25: ('Home-grown leeks','Diagonal harvest group','Three overlapping leeks selected; bench and watering can omitted, clipped tops completed.','A wide corner or end-of-section illustration.'),
26: ('Fresh radishes','Root-and-leaf group','Five unequal roots selected with foliage; dirt and surplus roots omitted.','A colourful compact harvest illustration.'),
27: ('Asparagus growing','Tall spear group','Four unequal spears selected; grass, fence and soil omitted.','A tall margin or perennial-crop illustration.'),
28: ('Aubergines on the plant','Fruiting plant detail','The two short round fruits retained; foliage reduced and background omitted.','A compact fruiting-crop or greenhouse illustration.'),
29: ('Rhubarb crown','Leafy perennial detail','Five connected stalks selected; crown and leaves simplified, background omitted.','A broad section-opening illustration.'),
30: ('Chard growing','Leaf-and-stem group','Front leaves selected with one forward droop; bolting stalks and background omitted.','A leafy corner or growing-techniques illustration.'),
31: ('Broccoli head','Compact crop portrait','The head and short stem selected; flowerpot omitted, floret clusters simplified.','A small spot or section-ending illustration.'),
32: ('Cauliflower and section','Whole-and-cut crop pair','Unequal whole and cut heads retained; background omitted, curds simplified.','A wide introductory or kitchen-related illustration.'),
}

def stage_accepted():
    old = json.loads((OLD/'ARTWORK.json').read_text())
    old_sources = {x['id']:x for x in json.loads((OLD/'SOURCES.json').read_text())}
    out=[]; source_rows=[]
    for a in old['assets']:
        if a['status'] != 'accepted_by_John': continue
        a=copy.deepcopy(a)
        for rel in [a['asset_path'], a['source_path']]:
            dest=B/rel; dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(OLD/rel,dest)
        assert sha(B/a['asset_path'])==a['sha256']
        assert sha(B/a['source_path'])==a['source_sha256']
        for ref in a['direct_style_references']:
            dest=B/ref['retained_path']; dest.parent.mkdir(parents=True,exist_ok=True)
            if dest.exists(): assert sha(dest)==ref['sha256']
            else: shutil.copyfile(OLD/ref['retained_path'],dest)
        a['original_collection']='photo-derived-2026-11'
        a['selection_record']='ACCEPTED-SELECTION.json'
        s=copy.deepcopy(old_sources[a['id']]); s['retained_path']=a['source_path']
        s.update(creator='John Lennon',rights='User-owned photograph/video supplied for this project')
        a['source']=s; source_rows.append(s)
        recipe={'prompt':a['prompt'],'transparent_background':True,
                'referenced_image_paths':[str(OLD/a['source_path'])]+[str(OLD/r['retained_path']) for r in a['direct_style_references']]}
        dump(B/'recipes'/f"{a['id']}.json",recipe)
        out.append(a)
    shutil.copyfile(OLD/'SELECTION.json',B/'ACCEPTED-SELECTION.json')
    return out,source_rows

def measure(a):
    p=B/a['asset_path']; im=Image.open(p); im.verify(); im=Image.open(p)
    assert im.mode=='RGBA',p
    alpha=np.asarray(im.getchannel('A')); bbox=im.getchannel('A').point(lambda x:255 if x>128 else 0).getbbox()
    edge=int(max(alpha[0,:].max(),alpha[-1,:].max(),alpha[:,0].max(),alpha[:,-1].max()))
    a.update(sha256=sha(p),dimensions_px=list(im.size),mode=im.mode,
      alpha_range=[int(alpha.min()),int(alpha.max())],edge_alpha_max=edge,
      solid_bbox_alpha_gt_128=list(bbox),
      complete_solid_silhouette=bool(bbox and bbox[0]>0 and bbox[1]>0 and bbox[2]<im.width and bbox[3]<im.height),
      max_canvas_mm_at_300dpi=[round(x/300*25.4,1) for x in im.size],installed_in_book=False)
    assert a['complete_solid_silhouette'],p
    assert edge<16,(p,edge)
    assert a['alpha_range'][0]==0
    return a

def build_records():
    if not OLD.exists():
        # A downloaded collection rebuilds from its self-contained manifest.
        records=json.loads((B/'ARTWORK.json').read_text())['assets']
        for a in records:
            assert sha(B/a['asset_path'])==a['sha256']
            assert sha(B/a['source_path'])==a['source_sha256']
            for ref in a['direct_style_references']:assert sha(B/ref['retained_path'])==ref['sha256']
        return list(map(measure,records))
    assets,accepted_sources=stage_accepted()
    src=json.loads((B/'SOURCES.json').read_text())
    source_by_name={Path(s['retained_path']).name:s for s in src}
    for p in sorted((B/'assets').glob('*.png')):
        n=int(p.name[:2])
        if n<9: continue
        ident=p.stem; recipe=json.loads((B/'recipes'/f'{ident}.json').read_text())
        result_path=B/'recipes'/f'{ident}-result.json'
        if not result_path.exists():
            known={9:'exec-91cd5239-090f-42fe-a687-3acc4aa740d8.png',10:'exec-5685cbef-2d97-4da4-91ab-c691bfa06760.png'}
            dump(result_path,{'id':ident,'generated_original':str(ROOT/'generated_images'/known[n]),'source':Path(recipe['referenced_image_paths'][0]).name,'status':'proposed'})
        result=json.loads(result_path.read_text()); assert sha(result['generated_original'])==sha(p)
        s=copy.deepcopy(source_by_name[Path(recipe['referenced_image_paths'][0]).name])
        s['retained_path']='sources/'+Path(s['retained_path']).name
        assert sha(B/s['retained_path'])==s['sha256']
        title,kind,changes,use=INFO[n]
        refs=[]
        for path in recipe['referenced_image_paths'][1:]:
            ref=Path(path); assert ref.exists()
            refs.append({'original_path':'public/images/heroes/richer-a/'+ref.name,'retained_path':'style-references/'+ref.name,'sha256':sha(ref)})
        assets.append({'id':ident,'title':title,'kind':kind,'asset_path':'assets/'+p.name,
          'generated_original':result['generated_original'],'generation_job_id':result['id'],'source_id':s['source_id'],'source_path':s['retained_path'],
          'source_sha256':s['sha256'],'source':s,'prompt':recipe['prompt'],
          'direct_style_references':refs,'intentional_changes':changes,'proposed_use':use,
          'status':'candidate_for_John_review','installed_in_book':False})
    assets=sorted(map(measure,assets),key=lambda a:a['id'])
    assert len(assets)==30,len(assets)
    assert sum(a['status']=='accepted_by_John' for a in assets)==6
    manifest={'collection':'The Vegetable Guru: 30 photo-derived illustration choices','created':'2026-11-17',
      'scope':'Six accepted original masters plus 24 new candidates; no page installation or production approval.',
      'numbering':'01–04 and 07–08 retained verbatim. 05/06 remain excluded following John’s feedback. New choices are 09–32.',
      'source_mix':'John’s Photos library, mounted photo/video archives and nine openly licensed online photographs. Native local video frames were used instead of compressed channel copies.',
      'style':'Direct approved richer-a heroes. Each new illustration starts from its source photo and approved style references, never from a repeated redraw of a page.',
      'alpha_note':'Transparent original PNG bytes retained. Some near-transparent edge pixels have alpha 1–2; the substantial silhouette is fully contained. Hidden RGB can show a halo in viewers that ignore alpha.',
      'recreation':'Original source photographs/stills, exact generation requests and style references are retained. Generative reruns are not deterministic; the supplied PNG masters are the exact reusable results.',
      'assets':assets}
    dump(B/'ARTWORK.json',manifest)
    used={a['source_path']:a['source'] for a in assets}
    dump(B/'SOURCES-USED.json',list(used.values()))
    return assets

def paragraph(c,text,x,top,width,size=9,colour=GREEN):
    p=Paragraph(text,ParagraphStyle('p',fontName='Helvetica',fontSize=size,leading=size*1.35,textColor=HexColor(colour)))
    _,h=p.wrap(width,1000); p.drawOn(c,x,top-h); return h

def image_reader(path):
    # Prepared thumbnails are already oriented. Direct paths preserve JPEG compression.
    with Image.open(path) as im:size=im.size
    return ImageReader(str(path)),size

def fit_image(c,path,x,y,w,h):
    reader,(iw,ih)=image_reader(path); scale=min(w/iw,h/ih)
    c.drawImage(reader,x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale,mask='auto')

def page_base(c,heading,page,sub):
    c.setFillColor(HexColor(CREAM));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(HexColor(GREEN));c.setFont('Helvetica-Bold',22);c.drawString(32,H-40,heading)
    paragraph(c,sub,32,H-53,W-64,9)
    c.setFont('Helvetica',8);c.drawString(32,20,'THE VEGETABLE GURU  /  Photo-derived illustration selection  /  17 November 2026')
    c.drawRightString(W-32,20,str(page))

def build_pdf(assets):
    out=B/'Vegetable-Guru-Photo-Library-30-Preview.pdf'; raw=B/'review'/'preview-raw.pdf'
    c=canvas.Canvas(str(raw),pagesize=(W,H),pageCompression=1)
    c.setTitle('The Vegetable Guru — 30 photo-derived illustration choices')
    c.setAuthor('John Lennon / Hackriculture')
    for page,start in enumerate(range(0,30,3),1):
        page_base(c,'30 illustration choices',page,'Six previously accepted images + 24 new candidates. Original numbering retained; 05 and 06 are set aside.')
        for col,a in enumerate(assets[start:start+3]):
            x=32+col*264; cw=250
            c.setStrokeColor(HexColor('#dadbc9'));c.setLineWidth(.5)
            if col:c.line(x-7,53,x-7,H-86)
            c.setFillColor(HexColor(ACCENT));c.setFont('Helvetica-Bold',11)
            c.drawString(x,H-100,a['id'][:2])
            c.setFillColor(HexColor(GREEN));c.setFont('Helvetica-Bold',13);c.drawString(x+27,H-100,a['title'])
            status='Previously accepted' if a['status']=='accepted_by_John' else 'New candidate'
            paragraph(c,status+' · '+a['kind'],x,H-112,cw,8)
            fit_image(c,B/'review'/'thumbnails'/f"{a['id']}-art.jpg",x,231,cw,234)
            c.setFillColor(HexColor('#f0eee2'));c.roundRect(x,112,cw,100,4,fill=1,stroke=0)
            fit_image(c,B/'review'/'thumbnails'/f"{a['id']}-source.jpg",x+8,118,112,88)
            s=a['source']; online='source_page' in s
            source_kind=s.get('source_kind',s.get('source_type','')).lower()
            is_video='still' in source_kind or 'time_seconds' in s or 'timestamp_seconds' in s
            label='Online source' if online else ('Video source' if is_video else 'Photo source')
            paragraph(c,'<b>'+label+'</b><br/>'+escape(s.get('creator','John Lennon'))+'<br/>'+('CC0 / public domain' if online else 'John’s archive'),x+130,198,110,8)
            if online:
                c.linkURL(s['source_page'],(x,112,x+cw,212),relative=0,thickness=0)
            paragraph(c,escape(a['proposed_use']),x,98,cw,9)
        c.showPage()
    # Source and interpretation ledger: practical provenance, with clickable external credits.
    for group,start in enumerate(range(0,30,10),11):
        page_base(c,'Sources and drawing notes',group,'Source originals, prompts, style references and checks are included with the transparent PNG masters.')
        y=H-88
        for a in assets[start:start+10]:
            s=a['source']; line='<b>'+a['id'][:2]+' '+escape(a['title'])+'</b> — '+escape(s.get('creator','John Lennon'))
            if s.get('source_page'):line+=' · <link href="'+escape(s['source_page'])+'" color="#b84f20">source photograph</link> · CC0 / public domain'
            else:line+=' · John’s own photo/video archive'
            paragraph(c,line,32,y,W-64,10)
            paragraph(c,escape(a['intentional_changes']),32,y-15,W-64,8.5)
            y-=43
        c.showPage()
    c.save()
    # Small preview JPEGs keep the catalogue portable; original RGBA PNGs are separate.
    reader=PdfReader(raw);writer=PdfWriter();writer.append(reader)
    for pg in writer.pages:
        resources=pg.get('/Resources',{}).get('/XObject',{})
        for ref in resources.values():
            obj=ref.get_object()
            if obj.get('/Subtype')=='/Image':obj[NameObject('/Interpolate')]=BooleanObject(True)
    writer.add_metadata({'/Title':'The Vegetable Guru — 30 photo-derived illustration choices','/Author':'John Lennon / Hackriculture'})
    with out.open('wb') as f:writer.write(f)
    verify=PdfReader(out)
    assert len(verify.pages)==13
    texts='\n'.join(p.extract_text() for p in verify.pages)
    for a in assets:assert a['title'] in texts,a['title']
    return out

def build_zip(assets,pdf):
    paths={B/'ARTWORK.json',B/'SOURCES-USED.json',B/'ACCEPTED-SELECTION.json',B/'CHECKS.json',B/'README.md',B/'build_collection.py',B/'VISUAL-REVIEW.json',pdf}
    paths.update((B/'review'/'thumbnails').glob('*.jpg'))
    for a in assets:
        paths.add(B/a['asset_path']);paths.add(B/a['source_path']);paths.add(B/'recipes'/f"{a['id']}.json")
        result=B/'recipes'/f"{a['id']}-result.json"
        if result.exists():paths.add(result)
        for r in a['direct_style_references']:paths.add(B/r['retained_path'])
    ledger={str(p.relative_to(B)):sha(p) for p in sorted(paths)}
    dump(B/'SHA256.json',ledger);paths.add(B/'SHA256.json')
    out=B/'Vegetable-Guru-Photo-Library-30-Complete.zip'
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted(paths):z.write(p,'Vegetable-Guru-Photo-Library-30/'+str(p.relative_to(B)))
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
        for rel,digest in ledger.items():assert hashlib.sha256(z.read('Vegetable-Guru-Photo-Library-30/'+rel)).hexdigest()==digest
        assert len([n for n in z.namelist() if '/assets/' in n and n.endswith('.png')])==30
    return out

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--package',action='store_true');args=parser.parse_args()
    (B/'review').mkdir(exist_ok=True)
    assets=build_records();pdf=build_pdf(assets)
    checks={'created':'2026-11-17','asset_count':len(assets),'accepted_count':6,'new_candidates':24,
      'master_bytes_unchanged':True,'all_images_RGBA':True,'all_solid_silhouettes_contained':True,
      'source_and_style_hashes_checked':True,'preview_pdf_pages':13,'preview_text_check':True,
      'visual_review':'Pending final cream/dark and PDF inspection; see VISUAL-REVIEW.json when complete.',
      'no_book_pages_changed':True,'no_canonical_gardening_data_changed':True}
    if (B/'VISUAL-REVIEW.json').exists():checks['visual_review']=json.loads((B/'VISUAL-REVIEW.json').read_text())
    dump(B/'CHECKS.json',checks)
    if args.package:
        assert (B/'VISUAL-REVIEW.json').exists(),'Finish visual review before packaging'
        zip_path=build_zip(assets,pdf)
        dump(B/'PACKAGE-CHECKS.json',{'pdf_bytes':pdf.stat().st_size,'pdf_sha256':sha(pdf),'zip_bytes':zip_path.stat().st_size,'zip_sha256':sha(zip_path),'zip_crc_check':True,'all_archived_sha256_match':True,'png_masters':30})
        print(zip_path)
    print(pdf)
