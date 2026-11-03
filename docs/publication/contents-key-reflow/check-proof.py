"""Check and render the isolated contents reflow; do not alter current book files."""
from pathlib import Path
import hashlib,json,logging,re,subprocess
from pypdf import PdfReader,PdfWriter
import pdfplumber
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[3]
folder=Path(__file__).resolve().parent
checks=json.loads((folder/'CHECKS.json').read_text())
logging.getLogger('pdfminer').setLevel(logging.ERROR)
mm=72/25.4
normal=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for p,h in {**checks['inputs'],**checks['implementation']}.items():assert digest(root/p)==h,p
results=[]
for result in checks['results']:
    pdf=root/result['pdf'];assert digest(pdf)==result['sha256']
    assert digest(root/result['html'])==result['htmlSha256']
    reader=PdfReader(pdf);assert len(reader.pages)==2
    count=0;trimmed=PdfWriter()
    with pdfplumber.open(pdf) as parsed:
        for page,view,dom in zip(reader.pages,parsed.pages,result['dom']):
            assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.mediabox,[0,0,191,246]))
            assert all(abs(float(x)/mm-y)<.01 for x,y in zip(page.trimbox,[3,3,188,243]))
            assert min(c['size'] for c in view.chars)>=7
            assert len(view.images)>=len(dom['images'])
            for block in dom['blocks']:
                box=((block['left']+2.7)*mm,(block['top']+2.7)*mm,(block['right']+3.3)*mm,(block['bottom']+3.3)*mm)
                region=view.filter(lambda o:o.get('object_type')!='char' or (box[0]<=(o['x0']+o['x1'])/2<=box[2] and box[1]<=(o['top']+o['bottom'])/2<=box[3]))
                text=region.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
                assert normal(block['text']) in normal(text),(dom['folio'],block['text'],text)
                count+=1
            for ref in page['/Resources']['/Font'].values():
                font=ref.get_object()
                if font.get('/Subtype')=='/Type3':assert font.get('/CharProcs') and font.get('/ToUnicode')
                else:
                    for child in font.get('/DescendantFonts',[font]):
                        desc=child.get_object()['/FontDescriptor'].get_object();assert any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3'])
            page.cropbox=page.trimbox;trimmed.add_page(page)
    trim=root/'tmp/pdfs/contents-key-reflow'/f"{result['units']}-trim.pdf";trimmed.write(trim)
    prefix=folder/result['units']
    subprocess.run(['pdftoppm','-cropbox','-r','150','-png',str(trim),str(prefix)],check=True,capture_output=True)
    images=[Image.open(folder/f"{result['units']}-{n}.png").convert('RGB') for n in [1,2]]
    spread=Image.new('RGB',(images[0].width*2+16,images[0].height),'#d9dfcf');spread.paste(images[0],(0,0));spread.paste(images[1],(images[0].width+16,0));spread.save(folder/f"{result['units']}-spread.png")
    # Page 4 must remain visually identical to the existing component, including units.
    source=Image.open(root/f"docs/publication/contents-update/{result['units']}-1.png").convert('RGB')
    assert source.size==images[0].size
    assert source.tobytes()==images[0].tobytes(),'Page 4 raster changed'
    results.append({'units':result['units'],'pages':2,'textBlocksVerified':count,'fontsEmbedded':True,'trimMm':[185,240],'page4PixelIdentical':True,'pdfSha256':result['sha256']})

before=Image.open(root/'docs/publication/contents-update/imperial-2.png').convert('RGB')
after=Image.open(folder/'imperial-2.png').convert('RGB')
canvas=Image.new('RGB',(before.width*2+24,before.height+44),'#d9dfcf')
canvas.paste(before,(0,44));canvas.paste(after,(before.width+24,44))
draw=ImageDraw.Draw(canvas);draw.text((20,15),'CURRENT BOOK',fill='#173e2c');draw.text((before.width+44,15),'PROPOSED: FOUR-COLUMN KEY',fill='#173e2c')
canvas.save(folder/'comparison.png')
(folder/'PDF-CHECKS.json').write_text(json.dumps({'status':'passed; visual inspection recorded separately','results':results},indent=2)+'\n')
print(json.dumps(results))
