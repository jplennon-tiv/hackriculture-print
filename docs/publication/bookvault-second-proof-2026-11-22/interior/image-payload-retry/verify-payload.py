from pathlib import Path
from collections import Counter
import hashlib,importlib.util,json,multiprocessing as mp
import numpy as np
import pypdfium2 as pdfium
from pypdf import PdfReader
from pypdf.generic import StreamObject
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[4]
spec=importlib.util.spec_from_file_location('reduce_payload',DOC/'reduce-image-payload.py');reduce=importlib.util.module_from_spec(spec);spec.loader.exec_module(reduce)
SOURCE=reduce.SOURCE;OUTPUT=reduce.OUTPUT
SELECTED={1,7,9,24,98,110,146,150,154,162,163,167,168,170,173}

def sha(b):return hashlib.sha256(b).hexdigest()
def nonimage_streams(reader):
    seen=set();out=Counter()
    def walk(o):
        if hasattr(o,'idnum'):
            key=(o.idnum,o.generation)
            if key in seen:return
            seen.add(key);o=o.get_object()
        if isinstance(o,dict):
            if isinstance(o,StreamObject) and o.get('/Subtype')!='/Image':
                out[sha(o.get_data())]+=1
            for k,v in o.items():
                if k!='/Parent':walk(v)
        elif isinstance(o,list):
            for v in o:walk(v)
    walk(reader.trailer['/Root']);return out

def init():
    global before,after
    before=pdfium.PdfDocument(str(SOURCE));after=pdfium.PdfDocument(str(OUTPUT))

def compare(n):
    a,b=before[n-1],after[n-1];ta,tb=a.get_textpage(),b.get_textpage()
    exact=ta.get_text_range()==tb.get_text_range();ca,cb=ta.count_chars(),tb.count_chars()
    assert ca==cb and exact,('text changed',n)
    # Fonts/page instructions are verified byte-for-byte separately. All text
    # character positions additionally agree in the PDFium representation.
    geometry=max((max(abs(x-y) for x,y in zip(ta.get_charbox(j),tb.get_charbox(j))) for j in range(ca)),default=0)
    ai=a.render(scale=150/72).to_pil().convert('RGB');bi=b.render(scale=150/72).to_pil().convert('RGB')
    aa,bb=np.asarray(ai),np.asarray(bi);delta=np.abs(aa.astype(np.int16)-bb.astype(np.int16));assert aa.shape==bb.shape
    result={'folio':n,'textExact':exact,'characters':ca,'maximumGlyphBoxDifferencePoints':geometry,'renderMeanAbsoluteChannelDifference':float(delta.mean()),'pixelsChanged':int(np.any(delta,axis=2).sum()),'pixelsOver10':int(np.any(delta>10,axis=2).sum()),'pixels':ai.width*ai.height}
    if n in SELECTED:
        for label,page in [('source',a),('optimised',b)]:
            page.render(scale=300/72).to_pil().convert('RGB').save(DOC/f'{n:03d}-{label}.jpg',quality=97)
    bi.thumbnail((185,240));bi.save(DOC/'thumbnails'/f'{n:03d}.jpg',quality=90)
    ta.close();tb.close();a.close();b.close();return result

if __name__=='__main__':
    (DOC/'thumbnails').mkdir(exist_ok=True)
    r,s=PdfReader(SOURCE),PdfReader(OUTPUT);report=json.loads((DOC/'IMAGE-PAYLOAD-CHANGES.json').read_text())
    checks={'source':report['source'],'candidate':report['output'],'candidateBytes':OUTPUT.stat().st_size,'candidateSHA256':hashlib.file_digest(OUTPUT.open('rb'),'sha256').hexdigest(),'preflight':reduce.helpers.preflight(s)}
    assert len(r.pages)==len(s.pages)==174
    checks['pageCount']=174;checks['exactPageBoxes']=all(list(a[k])==list(b[k]) for a,b in zip(r.pages,s.pages) for k in ('/MediaBox','/TrimBox','/BleedBox'))
    checks['allPageInstructionsExact']=all(a.get_contents().get_data()==b.get_contents().get_data() for a,b in zip(r.pages,s.pages))
    checks['allNonImageStreamsExact']=nonimage_streams(r)==nonimage_streams(s)
    checks['metadataExact']=dict(r.metadata)==dict(s.metadata)
    checks['sourceProfileSHA256']=sha(r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data())
    assert checks['exactPageBoxes'] and checks['allPageInstructionsExact'] and checks['allNonImageStreamsExact'] and checks['metadataExact']
    assert not checks['preflight']['issues'] and checks['preflight']['profileSHA256']==checks['sourceProfileSHA256']
    print('All non-image streams, page instructions, geometry, metadata and profile exact',flush=True)
    images,pages=reduce.resources(s)
    by_use={(tuple(sorted(pages[i])),int(o['/Width']),int(o['/Height'])):o for i,o in images.items()}
    for change in report['changes']:
        o=by_use[(tuple(change['folios']),*change['outputDimensions'])]
        assert sha(reduce.helpers.image_bytes(o))==change['resampledPixelsSHA256']
        assert str(o['/ColorSpace'])=='/DeviceCMYK' and o['/BitsPerComponent']==8
    for old in report['preservedImages']:
        o=by_use[(tuple(old['folios']),*old['dimensions'])]
        assert sha(o._data)==old['encodedSHA256']
    checks['changedImagesVerified']=len(report['changes']);checks['unchangedImageStreamsExact']=len(report['preservedImages'])
    print('Every image checked against retained or exact resampled bytes',flush=True)
    results=[]
    with mp.Pool(3,initializer=init) as pool:
        for row in pool.imap(compare,range(1,175)):
            results.append(row)
            if len(results)%25==0:print('Pages rendered and text geometry checked:',len(results),flush=True)
    checks['pages']=results
    checks['allTextExact']=all(p['textExact'] for p in results)
    checks['maximumGlyphBoxDifferencePoints']=max(p['maximumGlyphBoxDifferencePoints'] for p in results)
    checks['preserved600dpiPagesPixelIdenticalAt150dpi']=all(p['pixelsChanged']==0 for p in results if p['folio'] in reduce.KEEP_600)
    assert checks['maximumGlyphBoxDifferencePoints']==0 and checks['preserved600dpiPagesPixelIdenticalAt150dpi']
    (DOC/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
    print(json.dumps({k:v for k,v in checks.items() if k!='pages'},indent=2),flush=True)
