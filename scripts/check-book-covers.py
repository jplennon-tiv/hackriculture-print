"""Inspect exact cover-panel PDFs and make disposable actual-PDF rasters."""
from pathlib import Path
from math import hypot
import datetime,hashlib,json,logging,subprocess
import pdfplumber
from pypdf import PdfReader

logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[1]
receipt=root/'docs/publication/book-preparation/COVER-CHECKS.json'
report=json.loads(receipt.read_text())
scratch=root/'tmp/pdfs/book-preparation/covers';scratch.mkdir(parents=True,exist_ok=True)

def embedded(resources,found,seen):
    resources=resources.get_object()
    for ref in resources.get('/Font',{}).get_object().values() if hasattr(resources.get('/Font',{}),'get_object') else []:
        font=ref.get_object()
        for c in font.get('/DescendantFonts',[font]):
            c=c.get_object();d=c.get('/FontDescriptor',{});d=d.get_object() if hasattr(d,'get_object') else d
            found[str(font.get('/BaseFont',font.get('/Subtype')))]=c.get('/Subtype')=='/Type3' or any(k in d for k in ['/FontFile','/FontFile2','/FontFile3'])
    for ref in resources.get('/XObject',{}).get_object().values() if hasattr(resources.get('/XObject',{}),'get_object') else []:
        if str(ref) in seen:continue
        seen.add(str(ref));x=ref.get_object()
        if '/Resources' in x:embedded(x['/Resources'],found,seen)

for item in report['results']:
    file=root/item['pdf'];assert hashlib.sha256(file.read_bytes()).hexdigest()==item['sha256']
    reader=PdfReader(file);assert len(reader.pages)==2
    fonts={};images=[]
    for number,page in enumerate(reader.pages,1):
        assert abs(float(page.mediabox.width)*25.4/72-191.35)<.001
        assert abs(float(page.mediabox.height)*25.4/72-246.35)<.001
        assert abs(float(page.trimbox.width)*25.4/72-185)<.001
        assert abs(float(page.trimbox.height)*25.4/72-240)<.001
        embedded(page['/Resources'],fonts,set())
        # Current cover raster art is referenced directly by each page. Use the
        # affine axes to measure printed size; rotation enlarges an AABB and
        # would produce a false low-resolution warning.
        expected={str(k) for k,ref in page['/Resources']['/XObject'].items() if ref.get_object().get('/Subtype')=='/Image'}
        seen=set()
        def before(op,args,cm,tm):
            if op!=b'Do' or str(args[0]) not in expected:return
            obj=page['/Resources']['/XObject'][args[0]];seen.add(str(args[0]))
            dpi=min(float(obj['/Width'])*72/hypot(cm[0],cm[1]),float(obj['/Height'])*72/hypot(cm[2],cm[3]))
            assert dpi>=299,(item['concept'],number,dpi)
            images.append({'panel':number,'resource':str(args[0]),'actualDpi':round(dpi,2)})
        page.extract_text(visitor_operand_before=before)
        assert expected==seen,'Unknown/nested raster placement needs separate resolution inspection'
    assert fonts and all(fonts.values())
    with pdfplumber.open(file) as pdf:minimum=min(c['size'] for page in pdf.pages for c in page.chars if c['text'].strip())
    assert minimum>=7
    subprocess.run(['pdftoppm','-scale-to','1400','-jpeg','-jpegopt','quality=92',str(file),str(scratch/('concept-'+item['concept']))],check=True)
    item.update(physical={'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'geometry':'Exact 185x240 mm trim with 3.175mm all-round bleed; separate panels, not a cover wrap','embeddedFonts':fonts,'minimumTextPt':minimum,'images':images},rasterDirectory=str(scratch.relative_to(root)))
receipt.write_text(json.dumps(report,indent=2)+'\n')
print('Both concepts: exact boxes, fonts, actual image resolution and rasters checked')
