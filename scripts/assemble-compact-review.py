"""Assemble the measured, explicitly unapproved compact review book.

Uses exact source-PDF hashes and physical folios. Never touches an account,
canonical gardening data, production approval or the frozen reference proofs.
"""
from pathlib import Path
import hashlib,json,datetime,re,zlib,argparse
import numpy as np
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject,DecodedStreamObject,NameObject,DictionaryObject,NumberObject

root=Path(__file__).resolve().parents[1]
evidence=root/'docs/publication/book-preparation'
parser=argparse.ArgumentParser();parser.add_argument('--supplier',choices=['kdp','bookvault'],default='kdp');parser.add_argument('--flattened',action='store_true');args=parser.parse_args()
supplier=args.supplier;suffix='-BOOKVAULT' if supplier=='bookvault' else ''
bleed=3 if supplier=='bookvault' else 3.175
media_width=191 if supplier=='bookvault' else 188.175
media_height=240+2*bleed
trim_left=lambda folio:bleed if supplier=='bookvault' or folio%2==0 else 0
plan=json.loads((evidence/f'ASSEMBLY-PLAN{suffix}.json').read_text())
openings=json.loads((evidence/f'OPENING-CHECKS{suffix}.json').read_text())
physical=json.loads((evidence/f'PDF-{supplier.upper()}.json').read_text())
opening_physical=json.loads((evidence/f'PDF-OPENINGS{suffix}.json').read_text())
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert openings.get('assemblyPlanSha256')==digest(evidence/f'ASSEMBLY-PLAN{suffix}.json'),'Regenerate opening contents from the current assembly plan'
flattened=json.loads((evidence/f'FLATTENED-{supplier.upper()}.json').read_text()) if args.flattened else None
if flattened:assert flattened['currentSignature']==digest(root/'scripts/flatten-book-pdf.py'),'Stale flattening implementation'
receipt_name=f'ASSEMBLY-FLATTENED-{supplier.upper()}.json' if args.flattened else f'ASSEMBLY-CHECKS{suffix}.json'

def add_blank(writer,folio):
    """An explicit unprinted page, counted in the plan and physical geometry."""
    assert len(writer.pages)+1==folio
    mm=72/25.4;w,h=media_width*mm,media_height*mm;left=trim_left(folio)
    blank=writer.add_blank_page(w,h)
    blank.trimbox=RectangleObject([left*mm,bleed*mm,(left+185)*mm,(240+bleed)*mm])
    blank.cropbox=RectangleObject(blank.mediabox);blank.bleedbox=RectangleObject(blank.mediabox)
    paint=DecodedStreamObject();paint.set_data(f'q 1 0.97255 0.91373 rg 0 0 {w} {h} re f Q'.encode())
    # PDF streams must be indirect objects. A direct stream can pass in-memory
    # page-count checks but corrupt page traversal in Poppler after writing.
    blank[NameObject('/Contents')]=writer._add_object(paint)

def optimise_losslessly(writer):
    """Add reversible PNG row prediction to unpredicted 8-bit image streams.

    Chromium's raw Flate images dominate this illustrated book's size. This
    changes their encoding only: pixel dimensions, samples, masks, colour
    profiles and placement stay intact. Unknown encodings are left untouched.
    """
    savings=count=0
    for obj in writer._objects:
        if not hasattr(obj,'_data') or obj.get('/Subtype')!='/Image':continue
        if obj.get('/Filter')!='/FlateDecode' or obj.get('/DecodeParms') or obj.get('/BitsPerComponent')!=8:continue
        width,height=int(obj['/Width']),int(obj['/Height'])
        raw=zlib.decompress(obj._data)
        channels,remainder=divmod(len(raw),width*height)
        if remainder or channels not in (1,3,4):continue
        pixels=np.frombuffer(raw,dtype=np.uint8).reshape(height,width*channels)
        predicted=np.empty((height,width*channels+1),dtype=np.uint8)
        predicted[:,0]=2 # PNG Up: current row minus previous row, modulo 256.
        predicted[:,1:]=pixels
        predicted[1:,1:]=pixels[1:]-pixels[:-1]
        encoded=zlib.compress(predicted.tobytes(),6)
        if len(encoded)>=len(obj._data):continue
        restored=np.cumsum(predicted[:,1:],axis=0,dtype=np.uint32).astype(np.uint8).tobytes()
        assert restored==raw,'Lossless predictor failed its sample-byte round trip'
        savings+=len(obj._data)-len(encoded);count+=1
        obj._data=encoded;obj.decoded_self=None
        obj[NameObject('/DecodeParms')]=DictionaryObject({NameObject('/Predictor'):NumberObject(15),NameObject('/Colors'):NumberObject(channels),NameObject('/BitsPerComponent'):NumberObject(8),NameObject('/Columns'):NumberObject(width)})
    return {'reencodedImages':count,'streamBytesSaved':savings,'pixelRoundTrip':'Every changed stream checked byte-for-byte; no resampling or colour conversion'}
report={'status':'Local review drafts only — deliberate publication placeholders; cover and remaining visual/production checks pending',
        'supplier':supplier,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceRevision':plan['sourceRevision'],
        'implementationSignature':plan['implementationSignature'],'results':[]}
for units,edition in plan['editions'].items():
    opening=next(v for v in openings['results'] if v['units']==units)
    assert any(v['id']==units+'/opening' and v['sha256']==opening['sha256'] and v['status']=='passed' for v in opening_physical['results'])
    writer=PdfWriter();sources=[]
    for item in [{'pdf':opening['pdf'],'sha256':opening['sha256'],'physicalPages':7,'startPage':1,'id':units+'/opening'},*edition['documents']]:
        pdf=root/item['pdf'];assert digest(pdf)==item['sha256'],pdf
        if item['id']!=units+'/opening':
            assert any(v['id']==item['id'] and v['sha256']==item['sha256'] and v['status']=='passed' for v in physical['results']),item['id']
        if args.flattened:
            row=next((v for v in flattened['results'] if v['id']==item['id']),None)
            assert row and row['status']=='checked' and row['signature']==flattened['currentSignature'] and row['sourceSha256']==item['sha256'],('Missing/stale derivative',item['id'])
            checked=json.loads((root/row['physicalReceipt']).read_text())
            assert checked['sourceSha256']==item['sha256'] and checked['sha256']==row['sha256'] and checked['pageCount']==item['physicalPages']
            assert checked['implementationSha256']==flattened['currentSignature']
            assert all(not p['transparencyIssues'] and all(p['fontsEmbedded'].values()) for p in checked['pages'])
            item={**item,'originalPdfSha256':item['sha256'],'pdf':row['pdf'],'sha256':row['sha256']}
            pdf=root/item['pdf'];assert digest(pdf)==item['sha256'],pdf
        reader=PdfReader(pdf)
        assert len(reader.pages)==item['physicalPages'] and len(writer.pages)+1==item['startPage']
        for offset,page in enumerate(reader.pages):
            folio=item['startPage']+offset
            compact_text=re.sub(r'\s+','',page.extract_text())
            assert re.search(rf'{units.upper()}·{folio}(?!\d)',compact_text),(item['id'],folio,'missing physical folio')
        writer.append(reader,import_outline=False)
        sources.append({k:item[k] for k in ['id','pdf','sha256','startPage','physicalPages',*(['originalPdfSha256'] if args.flattened else [])]})
        for folio in item.get('blankFoliosAfter',[]):add_blank(writer,folio)
    assert len(writer.pages)==edition['lastContentPage']
    if edition['endBlankPages']:
        add_blank(writer,len(writer.pages)+1)
    assert len(writer.pages)==edition['plannedEvenTotal']
    for index,page in enumerate(writer.pages):
        assert abs(float(page.mediabox.width)*25.4/72-media_width)<.001
        assert abs(float(page.mediabox.height)*25.4/72-media_height)<.001
        assert abs(float(page.trimbox.width)*25.4/72-185)<.001
        assert abs(float(page.trimbox.height)*25.4/72-240)<.001
        assert abs(float(page.trimbox.left)*25.4/72-trim_left(index+1))<.001
        if '/Annots' in page:del page['/Annots']
    writer.add_metadata({'/Title':f'Vegetable growing — compact {units} review draft','/Subject':'Unapproved draft. Publication placeholders remain. Not for upload, sale or proof ordering.'})
    if args.flattened:writer.metadata=None
    # Individual browser exports repeat common font/icon/illustration objects.
    # Share byte-identical objects without resampling artwork or changing pages.
    # The flattened 600-dpi full-page images can exceed pypdf's per-stream
    # decompression guard during deduplication. Keep those verified encoded
    # streams intact; do not disable the library's safety limit.
    if not args.flattened:
        writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
    optimisation=optimise_losslessly(writer)
    optimisation['objectDeduplication']='Skipped for full-page flattened artwork; encoded streams retained' if args.flattened else 'Byte-identical objects shared'
    output=root/f'output/pdf/book-preparation/compact-book-{units}{"-bookvault" if supplier=="bookvault" else ""}{"-flattened" if args.flattened else ""}-review.pdf'
    pending=output.with_suffix('.pending.pdf')
    writer.write(pending)
    check=PdfReader(pending);assert len(check.pages)==edition['plannedEvenTotal']
    blank_folios={p for d in edition['documents'] for p in d.get('blankFoliosAfter',[])}
    if edition['endBlankPages']:blank_folios.add(len(check.pages))
    for folio,page in enumerate(check.pages,1):
        assert abs(float(page.mediabox.width)*25.4/72-media_width)<.001
        assert abs(float(page.mediabox.height)*25.4/72-media_height)<.001
        # Parse every saved content stream, including deliberately unprinted pages.
        assert page.get_contents() is not None
        compact_text=re.sub(r'\s+','',page.extract_text())
        if folio in blank_folios:assert not compact_text,(folio,'blank contains text')
        else:assert re.search(rf'{units.upper()}·{folio}(?!\d)',compact_text),(folio,'saved folio missing')
    pending.replace(output)
    report['results'].append({'units':units,'pdf':str(output.relative_to(root)),'sha256':digest(output),'pages':len(check.pages),
                              'bytes':output.stat().st_size,'guidePages':edition['vegetablePages']+edition['troublePages'],
                              'openingPages':7,'blankEndPages':edition['endBlankPages'],'folioAndGeometryChecks':'passed for every physical page',
                              'interstitialBlankPages':edition.get('interstitialBlankPages',0),'blankFolios':[p for d in edition['documents'] for p in d.get('blankFoliosAfter',[])],'facingPagePolicy':edition['facingPagePolicy'],
                              'optimisation':optimisation,
                              'sources':sources,'visualReview':'Consult VISUAL-PRODUCTION.json for KDP; BOOKVAULT-ADAPTATION.json for Bookvault. Assembly viewing is separate from source-page review.'})
    if args.flattened:
        report['flatteningSignature']=flattened['currentSignature']
        report['derivativeQualification']='Artwork composited to opaque RGB at600dpi; native vector text retained. Not pixel-identical to original graphics, not PDF/X or supplier-approved. Publishing placeholders and fine-line decisions remain.'
        report['results'][-1]['visualReview']='Representative derivative source pages in FLATTENED-VISUAL.json; assembled derivative review is separate.'
    (evidence/receipt_name).write_text(json.dumps(report,indent=2)+'\n')
    print(units,len(check.pages),'review pages',output.stat().st_size,'bytes',flush=True)
