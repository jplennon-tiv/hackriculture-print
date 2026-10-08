"""Prepare a separate flattened-art PDF while retaining native vector text.

Artwork is composited at 600 dpi, not byte/pixel-identical to the source images.
Text strings, fonts, colours, glyph positions and all page boxes must match.
Reject unsupported transparent/clipping text. Compare every 300-dpi page raster
before replacing the destination. This is not PDF/X or supplier approval.
"""
from pathlib import Path
import argparse,io,json,hashlib,subprocess,tempfile,datetime,logging,shutil
import numpy as np,pdfplumber
from PIL import Image
logging.getLogger('pdfminer').setLevel(logging.ERROR)
from pypdf import PdfReader,PdfWriter
from pypdf.generic import ContentStream,NameObject,DecodedStreamObject,DictionaryObject
from reportlab.pdfgen import canvas

p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');p.add_argument('--keep-rasters',action='store_true');args=p.parse_args()
source=Path(args.input).resolve();target=Path(args.output).resolve()
assert source!=target,'Never overwrite the source PDF'
target.parent.mkdir(parents=True,exist_ok=True)
scratch=Path(tempfile.mkdtemp(prefix=target.stem+'-',dir=target.parent))
working=scratch/'candidate.pdf'
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
def resolved(value):
    return value.get_object() if hasattr(value,'get_object') else value

TEXT={b'Tj',b'TJ',b"'",b'"'};PAINT={b'S',b's',b'f',b'F',b'f*',b'B',b'B*',b'b',b'b*'}


def check_original_text():
    """Audit effective inherited graphics state before any resource mutation."""
    r=PdfReader(source);runs=0
    def walk(stream,res,inherited,ancestors=()):
        nonlocal runs
        state=inherited.copy();stack=[]
        for values,op in ContentStream(stream,r).operations:
            if op==b'q':stack.append(state.copy())
            elif op==b'Q':state=stack.pop()
            elif op==b'gs':
                gs=resolved(res.get('/ExtGState',{}))[values[0]].get_object()
                for key,field in (('/ca','ca'),('/CA','CA'),('/BM','bm'),('/SMask','mask')):
                    if key in gs:state[field]=gs[key]
            elif op==b'Tr':state['tr']=int(values[0])
            elif op in TEXT:
                assert state['tr']==0 and float(state['ca'])==1 and float(state['CA'])==1 and str(state['bm']) in ('/Normal','/Compatible') and str(state['mask'])=='/None',('Unsupported effective text state',state)
                runs+=1
            elif op==b'Do':
                ob=res['/XObject'][values[0]].get_object()
                if ob.get('/Subtype')=='/Form':
                    assert id(ob) not in ancestors,'Recursive form'
                    walk(ob,ob.get('/Resources',res).get_object(),state,ancestors+(id(ob),))
        assert not stack,'Unbalanced graphics stack'
    for page in r.pages:walk(page.get_contents(),page['/Resources'].get_object(),{'ca':1,'CA':1,'bm':'/Normal','mask':'/None','tr':0})
    return runs

effective_text_runs=check_original_text()

def layer(mode):
    r=PdfReader(source);seen=set();text_runs=0
    def transform(stream,res):
        nonlocal text_runs
        ops=[]
        content=ContentStream(stream,r)
        for values,op in content.operations:
            if op in TEXT:
                text_runs+=1
                if mode=='art':continue
            if mode=='text':
                if op in PAINT:ops.append(([],b'n'));continue
                if op==b'sh':continue
                if op==b'Do' and res['/XObject'][values[0]].get_object().get('/Subtype')!='/Form':continue
                if op==b'INLINE IMAGE':raise ValueError('Unexpected inline image')
            ops.append((values,op))
        content.operations=ops
        obj=DecodedStreamObject();obj.set_data(content.get_data());return obj
    def resources(res):
        res=res.get_object()
        xobs=resolved(res.get('/XObject',{}))
        for name,ref in list(xobs.items()):
            ob=ref.get_object();key=id(ob)
            if mode=='text' and ob.get('/Subtype')!='/Form':del xobs[name];continue
            if key in seen:continue
            seen.add(key)
            if ob.get('/Subtype')=='/Form':
                rr=ob.get('/Resources',res).get_object()
                content=transform(ob,rr)
                ob.set_data(content.get_data())
                if mode=='text':ob.pop('/Group',None)
                resources(rr)
        if mode=='text':
            for ref in resolved(res.get('/ExtGState',{})).values():
                state=ref.get_object()
                for k in ('/SMask','/ca','/CA','/BM'):state.pop(k,None)
    w=PdfWriter()
    for page in r.pages:
        res=page['/Resources'].get_object()
        page[NameObject('/Contents')]=transform(page.get_contents(),res)
        resources(res)
        if mode=='text':page.pop('/Group',None)
        w.add_page(page)
    file=scratch/f'{mode}.pdf'
    with file.open('wb') as out:w.write(out)
    return file,text_runs

art,art_runs=layer('art');text,text_runs=layer('text');assert art_runs==text_runs
subprocess.run(['pdftoppm','-r','600','-png',str(art),str(scratch/'art')],check=True)
reader=PdfReader(source);texts=PdfReader(text);writer=PdfWriter();images=sorted(scratch.glob('art-*.png'))
assert len(images)==len(reader.pages)
for page,words,img in zip(reader.pages,texts.pages,images):
    data=io.BytesIO();size=(float(page.mediabox.width),float(page.mediabox.height))
    c=canvas.Canvas(data,pagesize=size,pageCompression=1)
    c.drawImage(str(img),0,0,width=size[0],height=size[1],mask=None);c.showPage();c.save()
    base=PdfReader(io.BytesIO(data.getvalue())).pages[0]
    # ReportLab emits an unused default Helvetica selection even without text.
    # Remove that empty text object and its unembedded font resource.
    content=base.get_contents();ops=[];inside=False
    for values,op in content.operations:
        if op==b'BT':inside=True;continue
        if op==b'ET':inside=False;continue
        if inside:
            assert op not in TEXT,'Unexpected text in artwork wrapper'
            continue
        ops.append((values,op))
    content.operations=ops;base[NameObject('/Contents')]=content
    base['/Resources'].pop('/Font',None)
    base.merge_page(words)
    for box in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):base[NameObject(box)]=page[box]
    writer.add_page(base)
writer.metadata=None
with working.open('wb') as out:writer.write(out)
final=PdfReader(working)
assert len(final.pages)==len(reader.pages)
for a,b in zip(reader.pages,final.pages):assert a.extract_text()==b.extract_text(),'Text changed'

def inspect_resources(resources,seen=None):
    seen=set() if seen is None else seen
    fonts={};problems=[];res=resources.get_object()
    for name,ref in resolved(res.get('/Font',{})).items():
        font=ref.get_object()
        for child in font.get('/DescendantFonts',[font]):
            child=child.get_object();fd=resolved(child.get('/FontDescriptor',{}))
            fonts[str(font.get('/BaseFont') or font.get('/Subtype'))]=child.get('/Subtype')=='/Type3' or any(k in fd for k in ('/FontFile','/FontFile2','/FontFile3'))
    for ref in resolved(res.get('/ExtGState',{})).values():
        state=ref.get_object()
        if state.get('/SMask','/None')!='/None' or float(state.get('/ca',1))!=1 or float(state.get('/CA',1))!=1 or state.get('/BM','/Normal') not in ('/Normal','/Compatible'):problems.append('Transparent graphics state')
    for ref in resolved(res.get('/XObject',{})).values():
        ob=ref.get_object()
        if id(ob) in seen:continue
        seen.add(id(ob))
        if '/SMask' in ob or ob.get('/Group',{}).get('/S')=='/Transparency':problems.append('Transparent image/form')
        if '/Resources' in ob:
            fs,ps=inspect_resources(ob['/Resources'],seen);fonts.update(fs);problems+=ps
    return fonts,problems

for label,file in [('source',source),('flattened',working)]:
    subprocess.run(['pdftoppm','-r','300','-png',str(file),str(scratch/label)],check=True,timeout=300,stderr=subprocess.DEVNULL)
pages=[]
with pdfplumber.open(source) as a,pdfplumber.open(working) as b:
    for i,(original,flat) in enumerate(zip(a.pages,b.pages)):
        assert len(original.chars)==len(flat.chars),'Glyph count changed'
        delta=0
        for c,d in zip(original.chars,flat.chars):
            assert c['text']==d['text'] and c['fontname']==d['fontname'],'Glyph/font changed'
            assert c['non_stroking_color']==d['non_stroking_color'],'Text colour changed'
            delta=max(delta,*(abs(c[k]-d[k]) for k in ('x0','x1','top','bottom','size')))
        assert delta<.00001,('Text moved',delta)
        for box in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):assert reader.pages[i][box]==final.pages[i][box],'Box changed'
        fonts,problems=inspect_resources(final.pages[i]['/Resources'])
        assert all(fonts.values()),('Unembedded fonts',fonts)
        assert not problems,problems
        left=sorted(scratch.glob('source-*.png'))[i];right=sorted(scratch.glob('flattened-*.png'))[i]
        with Image.open(left) as aa,Image.open(right) as bb:
            assert aa.size==bb.size
            difference=np.abs(np.asarray(aa.convert('RGB'),dtype=np.int16)-np.asarray(bb.convert('RGB'),dtype=np.int16))
        mean=float(difference.mean());fraction=float(np.mean(difference.max(axis=2)>32))
        # Engineering alert thresholds, not a claim of perceptual equivalence.
        assert mean<1.0 and fraction<.015,('Raster difference needs review',i+1,mean,fraction)
        image=flat.images[0]
        dpi=min(image['srcsize'][0]*72/image['width'],image['srcsize'][1]*72/image['height'])
        assert dpi>=599
        pages.append({'page':i+1,'glyphs':len(flat.chars),'maximumTextGeometryDeltaPt':delta,'fontsEmbedded':fonts,'transparencyIssues':problems,'artDpi':round(dpi,3),'meanAbsoluteChannelErrorAt300Dpi':mean,'fractionPixelsOver32At300Dpi':fraction})
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash,'Source changed during preparation'
digest=hashlib.sha256(working.read_bytes()).hexdigest()
receipt={'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'Physical and raster comparison checks passed; actual-PDF visual review is separate. Not supplier approval.','source':str(source),'sourceSha256':source_hash,'pdf':str(target),'sha256':digest,'bytes':working.stat().st_size,'pageCount':len(final.pages),'method':'Original vector text retained. All non-text artwork composited into opaque RGB at 600 dpi and losslessly encoded; no JPEG compression. This resamples graphics and is not pixel-identical to original artwork. No PDF/X or CMYK claim.','implementationSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'effectiveTextRuns':effective_text_runs,'pages':pages}
working.replace(target)
target.with_suffix('.checks.json').write_text(json.dumps(receipt,indent=2)+'\n')
if args.keep_rasters:
    for file in scratch.glob('flattened-*.png'):file.replace(target.parent/(target.stem+'-'+file.name))
shutil.rmtree(scratch)
print(json.dumps({k:receipt[k] for k in ('pdf','sha256','bytes','pageCount','effectiveTextRuns')}),flush=True)
