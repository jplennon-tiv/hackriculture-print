"""Finish and verify only the 39 proposed crop spreads."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
import json
import logging
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unicodedata

import pdfplumber
from PIL import Image
from review_images import compress_art
from pypdf import PdfReader, PdfWriter
from pypdf.constants import PageLabelStyle
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, NumberObject, RectangleObject, TextStringObject

logging.getLogger('pdfminer').setLevel(logging.ERROR)
root = Path(__file__).resolve().parents[2]
base = root / 'docs/publication/sowing-rollout'
output = root / 'output/pdf/sowing-rollout'
if '--revision' in sys.argv:
    revision_key = sys.argv[sys.argv.index('--revision')+1]
    base = base / 'revisions' / revision_key
    output = output / 'revisions' / revision_key
book = root / 'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
tmp = root / 'tmp/sowing-rollout'
(base/'spreads').mkdir(exist_ok=True)
mm = 72/25.4
def normalized(s):
    return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','')
def digest(p):
    return sha256(p.read_bytes()).hexdigest()
def reference_action(file, target):
    return DictionaryObject({NameObject('/S'):NameObject('/GoToR'),NameObject('/F'):TextStringObject(file),NameObject('/D'):ArrayObject([NumberObject(target-1),NameObject('/Fit')])})
def check_actions(page, targets, directory):
    actions=[a.get_object()['/A'] for a in page.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Link']
    assert [a['/D'][0]+1 for a in actions]==targets
    assert all(a['/S']=='/GoToR' and (directory/a['/F']).resolve()==book for a in actions)
infos=sorted([json.loads(p.read_text()) for p in (base/'checks').glob('*.json')],key=lambda x:x['imperial']['folio'])
page_map=json.loads((root/'docs/publication/whole-book-order-preview/PAGE-MAP.json').read_text())
main=PdfReader(book)
for data in infos:
    info=data['imperial']; entry=next(p for p in page_map if p['folio']==info['folio']+1)
    original=main.pages[entry['pdfPage']-1]
    refs=[a.get_object().get('/Dest') for a in original.get('/Annots',[]) if a.get_object().get('/Dest')]
    assert [main.get_page_number(d[0].get_object())+1 for d in refs]==[l['pdfPage'] for l in info['links']],info['key']
def finish_one(info):
    key,unit=info['key'],info['unit']
    path=root/info['pdf']
    assert min(info['gaps'])>=3,(key,unit,info['gaps'])
    src=PdfReader(path); assert len(src.pages)==2
    w=PdfWriter()
    for page in src.pages:
        assert abs(float(page.mediabox.width)/mm-185)<.25 and abs(float(page.mediabox.height)/mm-240)<.25
        for prop in ('mediabox','cropbox','trimbox'):
            setattr(page,prop,RectangleObject([0,0,185*mm,240*mm]))
        w.add_page(page)
    targets=[l['pdfPage'] for l in info['links']]
    annotations=w.pages[1].get('/Annots',[])
    assert len(annotations)==len(targets),(key,unit,len(annotations),targets)
    for annot,target in zip(annotations,targets):
        a=annot.get_object()
        if a['/A']['/S']=='/URI':assert a['/A']['/URI'].endswith('#page='+str(target))
        a[NameObject('/A')]=reference_action(os.path.relpath(book,path.parent),target)
    w.page_layout='/TwoPageLeft'
    w.set_page_label(0,1,style=PageLabelStyle.DECIMAL,start=info['folio'])
    w.add_metadata({'/Title':info['name']+' · '+unit+' review'});w.write(path)
    with pdfplumber.open(path) as pdf:
        for i,parts in enumerate([info['actions']+info.get('additionalFacts',[])+info.get('varieties',[])+info.get('panelBlocks',[]),info['methods']+info.get('additionalPestCells',[])]):
            for part in parts:
                l,t,r,b=part['box']
                tx=pdf.pages[i].crop((l-.1,t-.35,r+.1,b+.55)).extract_text(x_tolerance=1,y_tolerance=2) or ''
                assert normalized(part['text']) in normalized(tx),(key,unit,part['text'],tx)
        assert str(info['folio']+1) in pdf.pages[1].crop((0,223*mm,185*mm,240*mm)).extract_text()
    check_actions(PdfReader(path).pages[1],targets,path.parent)
    img=base/'spreads'/f'{key}-{unit}.jpg'
    with tempfile.TemporaryDirectory(dir=tmp) as work:
        prefix=Path(work)/'p'
        subprocess.run(['pdftoppm','-scale-to','1350','-jpeg','-jpegopt','quality=90',str(path),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        a,b=[Image.open(Path(work)/f'p-{n}.jpg').convert('RGB') for n in (1,2)]
        spread=Image.new('RGB',(a.width+b.width+3,a.height),'#d1cbbf');spread.paste(a,(0,0));spread.paste(b,(a.width+3,0));spread.save(img,quality=90)
    return {'key':key,'unit':unit,'pdf':str(path.relative_to(root)),'sha256':digest(path),'gaps':info['gaps'],'retained':len(info['pests']),'omitted':info['trial']['removed'],'facts':len(info['actions']),'methods':len(info['methods']),'links':targets}
def combine(unit):
    seen=set()
    w=PdfWriter();w.page_layout='/TwoPageLeft'
    for pair in infos:
        info=pair[unit];start=len(w.pages);path=root/info['pdf']
        w.append(str(path),outline_item=info['name'],import_outline=False)
        for page in (w.pages[start],w.pages[start+1]):compress_art(page,seen)
        w.set_page_label(start,start+1,style=PageLabelStyle.DECIMAL,start=info['folio'])
        for a,l in zip(w.pages[start+1].get('/Annots',[]),info['links']):
            a.get_object()[NameObject('/A')]=reference_action(os.path.relpath(book,output),l['pdfPage'])
    w.add_metadata({'/Title':f'Vegetable guides · 39 revised spreads ({unit})'})
    w.compress_identical_objects()
    path=output/f'vegetable-guides-review-{unit}.pdf';w.write(path);r=PdfReader(path)
    assert len(r.pages)==78 and len(r.outline)==39
    assert r.page_labels==[str(p[unit]['folio']+n) for p in infos for n in (0,1)]
    for i,p in enumerate(infos):check_actions(r.pages[i*2+1],[l['pdfPage'] for l in p[unit]['links']],path.parent)
    return {'path':str(path.relative_to(root)),'pages':78,'crops':39,'sha256':digest(path)}
if __name__=='__main__':
    if (base/'APPROVAL.json').exists():raise ValueError('Use a separate revision after approval.')
    parser=argparse.ArgumentParser();parser.add_argument('keys',nargs='*');parser.add_argument('--combine',action='store_true');parser.add_argument('--revision');args=parser.parse_args()
    if args.revision and args.combine:raise ValueError('One-off revisions must not replace the full review books.')
    if args.combine:
        assert len(infos)==39
        records=[json.loads((base/'checks'/f"{p['imperial']['key']}.verified").read_text()) for p in infos]
        for rec in records:
            for result in rec:assert digest(root/result['pdf'])==result['sha256']
        outputs={u:combine(u) for u in ['imperial','metric']}
        (base/'PDF-CHECKS.json').write_text(json.dumps({'outputs':outputs,'proofs':records},indent=2)+'\n')
    else:
        def pairwork(pair):
            key=pair['imperial']['key']
            try:
                results=[finish_one(pair[u]) for u in ('imperial','metric')]
                (base/'checks'/f'{key}.verified').write_text(json.dumps(results,indent=2)+'\n')
                return key+' OK'
            except Exception as e:return key+' FAILED '+str(e)
        with ThreadPoolExecutor(max_workers=3) as pool:
            failed=False
            for status in pool.map(pairwork,[p for p in infos if not args.keys or p['imperial']['key'] in args.keys]):
                print(status,flush=True)
                failed |= ' FAILED ' in status
        if failed:raise SystemExit(1)
