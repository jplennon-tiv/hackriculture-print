"""Normalise the screen proof's trim box, verify its copy/fonts, and render it."""
from pathlib import Path
import hashlib
import io
import json
import logging
import subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
import pdfplumber

logging.getLogger('pdfminer').setLevel(logging.ERROR)
folder = Path(__file__).resolve().parent
root = folder.parents[2]
checks = json.loads((folder / 'CHECKS.json').read_text())
source = root / checks['pdf']['path']
reader = PdfReader(io.BytesIO(source.read_bytes()))
assert len(reader.pages) == 1
page = reader.pages[0]
mm = 72 / 25.4
size = [float(page.mediabox.width) / mm, float(page.mediabox.height) / mm]
assert all(abs(a-b) < .3 for a,b in zip(size,[185,240])), size
# Chromium rounds paper dimensions. Set exact trim without scaling its content.
if any(abs(a-b) > .001 for a,b in zip(size,[185,240])):
    for name in ['mediabox', 'cropbox', 'trimbox']:
        setattr(page, name, RectangleObject([0,0,185*mm,240*mm]))
    writer = PdfWriter()
    writer.add_page(page)
    with source.open('wb') as output:
        writer.write(output)
reader = PdfReader(source)
page = reader.pages[0]
fontnames = []
for ref in page['/Resources']['/Font'].values():
    font = ref.get_object()
    if font.get('/Subtype') == '/Type3':
        assert all(len(x.get_object().get_data()) > 0 for x in font['/CharProcs'].values())
    else:
        for descendant in font.get('/DescendantFonts', [font]):
            descriptor = descendant.get_object()['/FontDescriptor'].get_object()
            assert any(k in descriptor for k in ['/FontFile','/FontFile2','/FontFile3'])
    fontnames.append(str(font.get('/BaseFont')))
with pdfplumber.open(source) as doc:
    text = ' '.join(doc.pages[0].extract_text().split())
    bio = json.loads((folder/'SAVE-RECEIPT.json').read_text())['bio']
    assert ' '.join(bio.split()) in text
    assert 'John Lennon · hackriculture' in text
    assert '[Author name]' not in text
    assert 'IMPERIAL · 3' in text
    minpt = min(c['size'] for c in doc.pages[0].chars)
    assert minpt >= 7
subprocess.run(['pdftoppm','-r','160','-singlefile','-png',str(source),str(folder/'welcome-preview')],check=True,capture_output=True)
panel = checks['results'][0]['authorPanelMm']
# Render the author section directly from the checked PDF for the focused view.
x,y,w,h = [round(v*180/25.4) for v in [panel['x']-4,panel['y']-4,panel['width']+8,panel['height']+8]]
subprocess.run(['pdftoppm','-r','180','-singlefile','-png','-x',str(x),'-y',str(y),'-W',str(w),'-H',str(h),str(source),str(folder/'author-panel-preview')],check=True,capture_output=True)
checks['pdf']['sha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
checks['pdfChecks'] = {'pages':1,'trimMm':[185,240],'browserPaperRoundingCorrectedWithoutScaling':True,'completeBiography':True,'authorNamePresent':True,'fontsEmbedded':fontnames,'minimumTextPt':round(minpt,3),'actualPdfRendered':True}
(folder/'CHECKS.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(checks['pdfChecks'],indent=2))
