"""Physical PDF checks and disposable contact sheets for the authorised book review."""
from pathlib import Path
import argparse, hashlib, json, subprocess, logging
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
evidence = root / 'docs/publication/book-preparation'
scratch = root / 'tmp/pdfs/book-preparation/review'
scratch.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--only', help='comma-separated record keys')
parser.add_argument('--units', default='imperial,metric')
parser.add_argument('--render', action='store_true')
parser.add_argument('--supplier', choices=['kdp','bookvault'])
parser.add_argument('--openings', action='store_true', help='Check the separate draft opening PDFs')
args = parser.parse_args()
if args.openings:
    args.supplier=args.supplier or 'kdp'
    suffix='-BOOKVAULT' if args.supplier=='bookvault' else ''
    opening=json.loads((evidence/f'OPENING-CHECKS{suffix}.json').read_text())
    checks={'currentSignature':'openings','results':[{**v,'id':v['units']+'/opening','key':'opening','label':'Draft opening pages','startPage':1,'physicalPages':v['pages'],'status':'ok','signature':'openings'} for v in opening['results']]}
else:
    checks = json.loads((evidence / (f'PRODUCTION-{args.supplier.upper()}.json' if args.supplier else 'INTERIOR-CHECKS.json')).read_text())
target = evidence / (f'PDF-OPENINGS{suffix}.json' if args.openings else f'PDF-{args.supplier.upper()}.json' if args.supplier else 'PDF-CHECKS.json')
if args.supplier:
    scratch = scratch / args.supplier
    scratch.mkdir(exist_ok=True)
report = json.loads(target.read_text()) if target.exists() else {'results': []}

def embedded_fonts(resources, found, seen):
    resources = resources.get_object()
    for ref in resources.get('/Font', {}).get_object().values() if hasattr(resources.get('/Font', {}), 'get_object') else resources.get('/Font', {}).values():
        font = ref.get_object()
        for child in font.get('/DescendantFonts', [font]):
            child = child.get_object()
            descriptor = child.get('/FontDescriptor', {})
            if hasattr(descriptor, 'get_object'): descriptor = descriptor.get_object()
            name = str(font.get('/BaseFont') or font.get('/Subtype'))
            found[name] = child.get('/Subtype') == '/Type3' or any(k in descriptor for k in ['/FontFile', '/FontFile2', '/FontFile3'])
    forms = resources.get('/XObject', {})
    if hasattr(forms, 'get_object'): forms = forms.get_object()
    for ref in forms.values():
        key = str(ref)
        if key in seen: continue
        seen.add(key)
        obj = ref.get_object()
        if '/Resources' in obj: embedded_fonts(obj['/Resources'], found, seen)

def transparency_inventory(resources, seen=None):
    """Report PDF transparency resources separately from geometry/fit success."""
    seen=set() if seen is None else seen
    counts={'softMasks':0,'nonOpaqueAlpha':0,'nonNormalBlendModes':0,'transparencyGroups':0}
    resources=resources.get_object()
    for state in resources.get('/ExtGState',{}).get_object().values() if hasattr(resources.get('/ExtGState',{}),'get_object') else resources.get('/ExtGState',{}).values():
        state=state.get_object()
        counts['softMasks']+=int(state.get('/SMask','/None')!='/None')
        counts['nonOpaqueAlpha']+=int(float(state.get('/ca',1))<1 or float(state.get('/CA',1))<1)
        counts['nonNormalBlendModes']+=int(state.get('/BM','/Normal') not in ['/Normal','/Compatible'])
    objects=resources.get('/XObject',{});objects=objects.get_object() if hasattr(objects,'get_object') else objects
    for ref in objects.values():
        key=str(ref)
        if key in seen:continue
        seen.add(key);obj=ref.get_object()
        counts['softMasks']+=int('/SMask' in obj)
        counts['transparencyGroups']+=int(obj.get('/Group',{}).get('/S')=='/Transparency')
        if '/Resources' in obj:
            for k,v in transparency_inventory(obj['/Resources'],seen).items():counts[k]+=v
    return counts

for item in checks['results']:
    if item['status'] != 'ok' or item['signature'] != checks['currentSignature']: continue
    if args.only and item['key'] not in args.only.split(','): continue
    if item['units'] not in args.units.split(','): continue
    file = root / item['pdf']
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    assert digest == item['sha256'], (file, 'PDF changed')
    reader = PdfReader(file)
    assert len(reader.pages) == item['physicalPages']
    sizes, fonts = [], {}
    for page in reader.pages:
        sizes.append([round(float(page.mediabox.width)*25.4/72, 3), round(float(page.mediabox.height)*25.4/72, 3)])
        embedded_fonts(page['/Resources'], fonts, set())
    assert fonts and all(fonts.values()), (item['id'], fonts)
    expected = (188.175,246.35) if args.supplier=='kdp' else (191,246) if args.supplier=='bookvault' else (185,240)
    tolerance = .002 if args.supplier else .3
    assert all(abs(w-expected[0])<tolerance and abs(h-expected[1])<tolerance for w,h in sizes), (item['id'], sizes)
    entry = {'id': item['id'], 'sha256': digest, 'pages': len(reader.pages), 'sizesMm': sizes, 'embeddedFonts': fonts, 'status': 'passed', 'productionGeometry': 'Chromium rounding; exact supplier trim/bleed still pending'}
    if args.supplier:
        trim=[]
        for index,page in enumerate(reader.pages):
            box=page.trimbox
            assert abs(float(box.width)*25.4/72-185)<.001 and abs(float(box.height)*25.4/72-240)<.001
            bleed=3.175 if args.supplier=='kdp' else 3
            left=bleed if args.supplier=='bookvault' or (item['startPage']+index)%2==0 else 0
            assert abs(float(box.left)*25.4/72-left)<.001
            trim.append([round(float(x)*25.4/72,3) for x in box])
        entry.update(productionGeometry='Exact MediaBox, TrimBox, BleedBox; correctly mirrored outside bleed; no content scaling',trimBoxesMm=trim,startPage=item['startPage'])
        image_checks=[];thin_strokes=[]
        with pdfplumber.open(file) as physical:
            min_type=min(c['size'] for page in physical.pages for c in page.chars if c['text'].strip())
            assert min_type>=6.99,(item['id'],'Physical font below 7 pt',min_type)
            for index,page in enumerate(physical.pages):
                for kind,objects in [('line',page.lines),('rect',page.rects),('curve',page.curves)]:
                    for obj in objects:
                        if obj.get('stroke') and obj.get('linewidth',0)<.749:
                            thin_strokes.append({'page':index+1,'kind':kind,'widthPt':obj.get('linewidth',0),'bounds':[round(obj[k],2) for k in ['x0','top','x1','bottom']]})
                for img in page.images:
                    if img.get('imagemask') or not img.get('srcsize'):continue
                    # Axis-aligned bounding box is conservative for tilted art.
                    dpi=min(img['srcsize'][0]*72/img['width'],img['srcsize'][1]*72/img['height'])
                    image_checks.append({'page':index+1,'name':img['name'],'sourcePixels':list(img['srcsize']),'conservativeDpi':round(dpi,1)})
        entry.update(minPhysicalTypePt=round(min_type,4),imageResolution=image_checks,lowResolutionCandidates=[i for i in image_checks if i['conservativeDpi']<299])
        transparency=[{'page':i+1,**transparency_inventory(p['/Resources'])} for i,p in enumerate(reader.pages)]
        entry['submissionPreflight']={'transparency':transparency,'flatteningRequired':any(any(p[k] for k in ['softMasks','nonOpaqueAlpha','nonNormalBlendModes','transparencyGroups']) for p in transparency),'strokesBelow075Pt':thin_strokes,'scope':'Resource inventory and extracted stroked paths; distinct from geometry success. Filled thin shapes and supplier PDF-standard validation need separate review.'}
    if args.render:
        stem = item['units']+'-'+file.stem
        folder = scratch / stem
        folder.mkdir(exist_ok=True)
        for old in folder.glob('page-*.jpg'): old.unlink()
        subprocess.run(['pdftoppm', '-scale-to', '1150', '-jpeg', '-jpegopt', 'quality=90', str(file), str(folder / 'page')], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        pages = sorted(folder.glob('page-*.jpg'))
        assert len(pages)==len(reader.pages)
        contact = Image.new('RGB', (650*len(pages), 884), '#dddddd')
        draw = ImageDraw.Draw(contact)
        for n,p in enumerate(pages):
            with Image.open(p) as img: contact.paste(ImageOps.contain(img.convert('RGB'), (650, 850)), (650*n, 28))
            draw.text((650*n+8, 8), f"{item['label']} | {item['units']} | {n+1}", fill='black')
        image = scratch / (stem+'.jpg')
        contact.save(image, quality=92)
        entry['contactSheet'] = str(image.relative_to(root))
    report['results'] = [r for r in report['results'] if r['id'] != item['id']]
    report['results'].append(entry)
    target.write_text(json.dumps(report, indent=2)+'\n')
    print(item['id'], len(reader.pages), 'physical checks passed', flush=True)
