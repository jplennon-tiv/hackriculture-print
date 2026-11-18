"""Package the settled rear from its PDF image streams and original crop sources."""
from base64 import b64encode
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse
import json
import shutil
from xml.etree import ElementTree as E
from zipfile import ZipFile,ZIP_DEFLATED

import pypdfium2 as pdfium
from PIL import Image,ImageChops
from pypdf import PdfReader,PdfWriter
from pypdf.generic import ArrayObject,ContentStream,DictionaryObject,NameObject,TextStringObject
from formats import ora,png,psd

HERE=Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'package.json').exists() and (p/'docs/handover').exists())
M=json.loads((HERE/'MANIFEST.json').read_text())
SOURCE=ROOT/'output/pdf/rear-cream-harvest/photo-grid-04/The-Vegetable-Guru-Garden-Photo-Grid-04.pdf'
OUT=ROOT/'output/cover-archives/protected-rear-04'
N=NameObject
PPM=16
DPI=PPM*25.4
SIZE=(185*PPM,240*PPM)
names=['Tomatoes','John and the tomato plant','Garlic bulbs','Courgette flower','Potato harvest','Radish in soil','Salad colander','Pea pod','Winter squash','Wheelbarrow','Drying onions','Red chilli tray','Potting up','Butterhead lettuce','John with tomatoes','Sweetcorn']
def digest(data):return sha256(data).hexdigest()

def split_pdf(which):
    reader=PdfReader(SOURCE)
    writer=PdfWriter()
    p=writer.add_page(reader.pages[0])
    stream=ContentStream(p['/Contents'],writer)
    # Preserve all transforms and graphics state. Only omit the photo or text
    # paint operations that do not belong to this view.
    ops=[]
    for args,op in stream.operations:
        if op==b'Do':
            if which=='footer' or (which=='board' and str(args[0])!='/Im1'):continue
        elif which=='board' and op in (b'Tj',b'TJ',b"'",b'"',b'f',b'f*',b'F'):continue
        ops.append((args,op))
    stream.operations=ops
    p.replace_contents(stream)
    b=BytesIO();writer.write(b);return b.getvalue()

def rendered(data,transparent=False):
    doc=pdfium.PdfDocument(data)
    # Avoid ceil rounding of the PDF page's four-decimal-point trim dimensions.
    bm=doc[0].render(scale=DPI/72-0.00001,fill_color=(0,0,0,0) if transparent else (255,255,255,255))
    im=bm.to_pil().copy().convert('RGBA' if transparent else 'RGB')
    assert im.size==SIZE
    return im

def locked_pdf(path):
    r=PdfReader(SOURCE); w=PdfWriter(); p=w.add_page(r.pages[0])
    content=ContentStream(p['/Contents'],w)
    props=DictionaryObject(); layers=ArrayObject(); new=[]
    for args,op in content.operations:
        if op==b'Do' and str(args[0])!='/Im1':
            i=len(layers);assert str(args[0])==M['photos'][i]['pdfObject']
            oc=DictionaryObject({N('/Type'):N('/OCG'),N('/Name'):TextStringObject(f'{i+1:02} {names[i]}')})
            ref=w._add_object(oc);key=N(f'/Photo{i+1:02}')
            props[key]=ref;layers.append(ref)
            new.extend([([N('/OC'),key],b'BDC'),(args,op),([],b'EMC')])
        else:new.append((args,op))
    assert len(layers)==16
    p['/Resources'][N('/Properties')]=props
    content.operations=new;p.replace_contents(content)
    config=DictionaryObject({N('/BaseState'):N('/ON'),N('/Order'):layers,N('/Locked'):layers,N('/ON'):layers})
    w.root_object[N('/OCProperties')]=DictionaryObject({N('/OCGs'):layers,N('/D'):config})
    w.add_metadata({'/Title':'The Vegetable Guru - protected rear cover 04','/Author':'John Lennon'})
    with path.open('wb') as f:w.write(f)

def locked_svg(path,board,footer,footer_box):
    ns='http://www.w3.org/2000/svg';ink='http://www.inkscape.org/namespaces/inkscape';sodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd'
    E.register_namespace('',ns);E.register_namespace('inkscape',ink);E.register_namespace('sodipodi',sodi)
    root=E.Element('{'+ns+'}svg',{'width':'185mm','height':'240mm','viewBox':'0 0 185 240'})
    def add(name,location,raw,mime,locked):
        attr={'{'+ink+'}groupmode':'layer','{'+ink+'}label':name}
        if locked:attr['{'+sodi+'}insensitive']='true'
        grp=E.SubElement(root,'{'+ns+'}g',attr)
        E.SubElement(grp,'{'+ns+'}image',dict(zip(['x','y','width','height'],map(str,location)))|
                     {'preserveAspectRatio':'none','href':'data:'+mime+';base64,'+b64encode(raw).decode()})
    add('Cream woodgrain',[0,0,185,240],png(board),'image/png',True)
    for name,m in zip(names,M['photos']):
        add(f"{m['number']:02} {name}",m['positionMm'],(HERE/m['file']).read_bytes(),'image/jpeg',True)
    x,y,r,b=footer_box
    add('Footer artwork',[v/PPM for v in (x,y,r-x,b-y)],png(footer),'image/png',False)
    path.write_bytes(E.tostring(root,encoding='utf-8',xml_declaration=True))

def build():
    parser=argparse.ArgumentParser()
    parser.add_argument('--destination',type=Path,default=OUT)
    out=parser.parse_args().destination
    file=out/'The-Vegetable-Guru-Protected-Rear-04.zip'
    out.mkdir(parents=True,exist_ok=True)
    if file.exists():
        raise FileExistsError('Protected master already exists; use a new --destination')
    source=SOURCE.read_bytes()
    assert digest(source)==M['settledProofSha256'], 'Use the frozen revision 04 review PDF'
    original=PdfReader(SOURCE).pages[0]['/Resources']['/XObject']
    for m in M['photos']:
        data=(HERE/m['file']).read_bytes()
        assert data==original[m['pdfObject']].get_data() and digest(data)==m['sha256']
        assert digest((ROOT/m['source']).read_bytes())==m['sourceSha256']
    with TemporaryDirectory(dir=out) as tmp:
        stage=Path(tmp)
        full=rendered(source); board=rendered(split_pdf('board'))
        footer=rendered(split_pdf('footer'),True)
        fb=footer.getchannel('A').getbbox(); footer=footer.crop(fb)
        assert fb[1]>170*PPM,fb
        assembled=board.copy()
        layers=[('Cream woodgrain',0,0,board,True)]
        for name,m in zip(names,M['photos']):
            x,y,w,h=[round(v*PPM) for v in m['positionMm']]
            # PDF matrix decimal rounding can extend an antialiased photo edge
            # by one device pixel. Measure its footprint inside the empty gutter.
            guard=(x-2,y-2,x+w+2,y+h+2)
            effect=ImageChops.difference(full.crop(guard),board.crop(guard)).getbbox()
            assert effect and 0<effect[0]<4 and 0<effect[1]<4
            actual=tuple(v+guard[j%2] for j,v in enumerate(effect))
            tile=full.crop(actual);x,y=actual[:2]
            layers.append((f"{m['number']:02} {name}",x,y,tile,True))
            assembled.paste(tile,(x,y))
        # Quantisation of translucent text edges can differ across PDF renderers.
        # Store the registered footer on its board for PSD/ORA so the composite
        # is exactly the settled proof while the PDF keeps the original live text.
        footer_band=full.crop(fb)
        layers.append(('Footer and barcode field',fb[0],fb[1],footer_band,False))
        assembled.paste(footer_band,fb[:2])
        error=ImageChops.difference(assembled,full).getbbox()
        assert error is None,('Outside selected layer bounds',error)
        base='Vegetable-Guru-Rear-04'
        psd(stage/(base+'.psd'),layers,assembled,DPI)
        ora(stage/(base+'.ora'),layers,assembled,DPI)
        board_object=original['/Im1']
        native_board=Image.frombytes('RGB',(board_object['/Width'],board_object['/Height']),board_object.get_data())
        locked_svg(stage/(base+'.svg'),native_board,footer,fb)
        locked_pdf(stage/(base+'.pdf'))
        assert not ImageChops.difference(rendered((stage/(base+'.pdf')).read_bytes()),full).getbbox()
        assert not ImageChops.difference(Image.open(stage/(base+'.psd')).convert('RGB'),full).getbbox()
        # Keep a complete, portable source backup; one exact copy per source.
        for m in M['photos']:
            for key,rel in [('file',m['file']),('source','source-files/'+m['source'])]:
                dst=stage/rel;dst.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile((HERE if key=='file' else ROOT)/m[key],dst)
        shutil.copyfile(HERE/'MANIFEST.json',stage/'MANIFEST.json')
        shutil.copyfile(HERE/'ARCHIVE-NOTES.md',stage/'README.md')
        shutil.copyfile(SOURCE,stage/'Settled-review-04.pdf')
        sums=[f"{digest(f.read_bytes())}  {f.relative_to(stage)}" for f in sorted(stage.rglob('*')) if f.is_file()]
        (stage/'SHA256SUMS.txt').write_text('\n'.join(sums)+'\n')
        with ZipFile(stage/'deliver.tmp','w',compression=ZIP_DEFLATED,compresslevel=6) as z:
            for f in sorted(stage.rglob('*')):
                if f.is_file() and f.name!='deliver.tmp':z.write(f,str(f.relative_to(stage)))
        with ZipFile(stage/'deliver.tmp') as z:assert z.testzip() is None
        # The same-filesystem hard link publishes atomically and refuses an
        # existing destination, including a simultaneous packaging attempt.
        file.hardlink_to(stage/'deliver.tmp')
        file.chmod(0o444)
        print(file,file.stat().st_size)
if __name__=='__main__':build()
