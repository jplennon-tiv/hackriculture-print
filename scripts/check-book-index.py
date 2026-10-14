"""Verify and render only the new index proof; source books remain unchanged."""
from pathlib import Path
import io, json, hashlib, logging, re, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
import pdfplumber
from PIL import Image
logging.getLogger('pdfminer').setLevel(logging.ERROR)
root=Path(__file__).resolve().parents[1]
folder=root/'docs/publication/book-index'
checks=json.loads((folder/'CHECKS.json').read_text())
pdf=root/checks['pdf']['path'];mm=72/25.4
reader=PdfReader(io.BytesIO(pdf.read_bytes()));assert len(reader.pages)==checks['pages']
writer=PdfWriter()
for page in reader.pages:
    assert abs(float(page.mediabox.width)/mm-185)<.3 and abs(float(page.mediabox.height)/mm-240)<.3
    for box in ['mediabox','cropbox','trimbox']:setattr(page,box,RectangleObject([0,0,185*mm,240*mm]))
    writer.add_page(page)
writer.add_metadata({'/Title':'The Vegetable Guru - Index proposal','/Author':'John Lennon','/Subject':'Four-page index proof. Numeric references use the saved review book. T/C topic references await integration. Design and entries for review.'})
writer.write(pdf)
normal=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
verified=0
with pdfplumber.open(pdf) as document:
    for page,dom in zip(document.pages,checks['dom']):
        assert abs(page.width/mm-185)<.001 and abs(page.height/mm-240)<.001
        assert min(c['size'] for c in page.chars)>=7
        for block in dom['blocks']:
            box=(max(0,(block['left']-.3)*mm),max(0,(block['top']-.3)*mm),min(page.width,(block['right']+.3)*mm),min(page.height,(block['bottom']+.3)*mm))
            actual=page.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert normal(block['text']) in normal(actual),(dom['page'],block['text'],actual)
            verified+=1
fontnames=set()
for page in PdfReader(pdf).pages:
    for ref in page['/Resources']['/Font'].values():
        font=ref.get_object();fontnames.add(str(font.get('/BaseFont',font.get('/Subtype'))))
        if font.get('/Subtype')=='/Type3':assert font.get('/ToUnicode') and font.get('/CharProcs')
        else:
            for child in font.get('/DescendantFonts',[font]):
                descriptor=child.get_object()['/FontDescriptor'].get_object();assert any(k in descriptor for k in ['/FontFile','/FontFile2','/FontFile3'])
subprocess.run(['pdftoppm','-r','150','-png',str(pdf),str(folder/'index')],check=True,capture_output=True)
images=[Image.open(folder/f'index-{n}.png').convert('RGB') for n in range(1,checks['pages']+1)]
for start in [0,2]:
    pair=Image.new('RGB',(images[start].width*2+24,images[start].height),'#d9dfcf');pair.paste(images[start],(0,0));pair.paste(images[start+1],(images[start].width+24,0));pair.save(folder/f'pair-{start+1}-{start+2}.png')
checks['pdf']['sha256']=hashlib.sha256(pdf.read_bytes()).hexdigest()
checks.update(status='PDF checked; visual review pending',pdfTextBlocksVerified=verified,fontsEmbedded=sorted(fontnames),trimMm=[185,240],renderDpi=150)
(folder/'CHECKS.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pages':checks['pages'],'entries':checks['entries'],'textBlocksVerified':verified,'fontsEmbedded':sorted(fontnames)}))
