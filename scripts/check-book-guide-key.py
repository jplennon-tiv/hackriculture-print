"""Check and render both actual one-page guide-key PDFs."""
from pathlib import Path
import hashlib, json, logging, re, subprocess
from pypdf import PdfReader, PdfWriter
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[1];folder=root/'docs/publication/guide-key'
checks=json.loads((folder/'CHECKS.json').read_text());mm=72/25.4
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
normal=lambda s:re.sub(r'\s+','',s)
for group in [checks['copyInputs'],checks['implementation']]:
    for p,h in group.items():assert digest(root/p)==h,p
for item in checks['protectedFiles']:assert digest(root/item['path'])==item['sha256'],item['path']
results=[]
for r in checks['results']:
    pdf=root/r['pdf'];assert digest(pdf)==r['sha256'];assert digest(root/r['html'])==r['htmlSha256']
    for p,h in r['assets'].items():assert digest(root/p)==h,p
    reader=PdfReader(pdf);assert len(reader.pages)==1
    page=reader.pages[0];dom=r['dom'][0]
    assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.mediabox,[0,0,191,246]))
    assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.trimbox,[3,3,188,243]))
    with pdfplumber.open(pdf) as parsed:
        view=parsed.pages[0];assert min(c['size'] for c in view.chars)>=7
        for b in dom['blocks']:
            box=((b['left']+2.7)*mm,(b['top']+2.7)*mm,(b['right']+3.3)*mm,(b['bottom']+3.3)*mm)
            actual=view.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert normal(b['text']) in normal(actual),(b['text'],actual)
    for ref in page['/Resources']['/Font'].values():
        font=ref.get_object()
        if font.get('/Subtype')=='/Type3':assert font.get('/CharProcs') and font.get('/ToUnicode')
        else:
            for child in font.get('/DescendantFonts',[font]):
                fd=child.get_object()['/FontDescriptor'].get_object();assert any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3'])
    trimmed=PdfWriter();page.cropbox=page.trimbox;trimmed.add_page(page)
    trim=root/'tmp/pdfs/guide-key'/f"{r['units']}-trim.pdf";trimmed.write(trim)
    subprocess.run(['pdftoppm','-cropbox','-singlefile','-r','160','-png',str(trim),str(folder/r['units'])],check=True,capture_output=True)
    results.append({'units':r['units'],'pages':1,'textBlocksVerified':len(dom['blocks']),'images':len(dom['images']),'fontsEmbedded':True,'pdfSha256':r['sha256'],'footerClearanceMm':dom['footerClearanceMm']})
(folder/'PDF-CHECKS.json').write_text(json.dumps({'status':'passed; visual review separate','results':results},indent=2)+'\n')
print(json.dumps(results))
