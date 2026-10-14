"""Verify and render only the updated contents PDFs, including every printed row."""
from pathlib import Path
import hashlib, json, logging, re, subprocess
from pypdf import PdfReader, PdfWriter
import pdfplumber
from PIL import Image
logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[1];folder=root/'docs/publication/contents-update'
checks=json.loads((folder/'CHECKS.json').read_text()); mm=72/25.4
normal=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for p,h in checks['copyInputs'].items():assert digest(root/p)==h,p
for p,h in checks['implementation'].items():assert digest(root/p)==h,p
assert digest(folder/'ASSEMBLY-PROPOSAL.json')==checks['assemblyProposalSha256']
for item in checks['protectedFiles']:assert digest(root/item['path'])==item['sha256'],item['path']
results=[]
for result in checks['results']:
    pdf=root/result['pdf'];assert digest(pdf)==result['sha256']
    assert digest(root/result['html'])==result['htmlSha256']
    reader=PdfReader(pdf);assert len(reader.pages)==3
    trimmed=PdfWriter();blocks=0
    with pdfplumber.open(pdf) as parsed:
        for page,view,dom in zip(reader.pages,parsed.pages,result['dom']):
            assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.mediabox,[0,0,191,246]))
            assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.trimbox,[3,3,188,243]))
            assert min(c['size'] for c in view.chars)>=7
            for block in dom['blocks']:
                # DOM positions are measured from trim; production adds 3 mm bleed.
                box=((block['left']+2.7)*mm,(block['top']+2.7)*mm,(block['right']+3.3)*mm,(block['bottom']+3.3)*mm)
                actual=view.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
                assert normal(block['text']) in normal(actual),(dom['folio'],block['text'],actual)
                blocks+=1
            for ref in page['/Resources']['/Font'].values():
                font=ref.get_object()
                if font.get('/Subtype')=='/Type3':assert font.get('/CharProcs') and font.get('/ToUnicode')
                else:
                    for child in font.get('/DescendantFonts',[font]):
                        d=child.get_object()['/FontDescriptor'].get_object();assert any(k in d for k in ['/FontFile','/FontFile2','/FontFile3'])
            page.cropbox=page.trimbox;trimmed.add_page(page)
    trim=root/'tmp/pdfs/contents-update'/f"{result['units']}-trim.pdf";trimmed.write(trim)
    prefix=folder/result['units']
    subprocess.run(['pdftoppm','-cropbox','-r','150','-png',str(trim),str(prefix)],check=True,capture_output=True)
    images=[Image.open(folder/f"{result['units']}-{n}.png").convert('RGB') for n in [1,2]]
    pair=Image.new('RGB',(images[0].width*2+16,images[0].height),'#d9dfcf');pair.paste(images[0],(0,0));pair.paste(images[1],(images[0].width+16,0));pair.save(folder/f"{result['units']}-spread-4-5.png")
    results.append({'units':result['units'],'pages':3,'textBlocksVerified':blocks,'references':len(result['references']),'fontsEmbedded':True,'trimMm':[185,240],'bleedMm':3,'pdfSha256':result['sha256']})
(folder/'PDF-CHECKS.json').write_text(json.dumps({'status':'passed; visual review recorded separately','results':results},indent=2)+'\n')
print(json.dumps(results))
