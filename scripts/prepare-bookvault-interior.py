"""Restore print artwork and extend native page edges without reflowing the book.

Only the current imperial reading proof is the content source. The older supplier
PDF supplies identified artwork streams, never its obsolete text or pagination.
"""
from pathlib import Path
import argparse, hashlib, io, json, logging, gc
import numpy as np
from PIL import Image
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from pypdf.generic import ContentStream, RectangleObject, NameObject, FloatObject, DecodedStreamObject, IndirectObject
import pypdf.filters

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/publication/bookvault-print-ready'
TMP = ROOT / 'tmp/pdfs/bookvault-print-ready'
MM = 72 / 25.4
W, H, B = 185 * MM, 240 * MM, 3 * MM
SOURCE = ROOT / 'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
ART = ROOT / 'output/pdf/book-preparation/compact-book-imperial-bookvault-flattened-review.pdf'
SHA = '93c5be45e8a790cb3a4f91aeac8b7910035cfa37a142dbf41b8444644f88f5bf'
ART_SHA = 'c612bf238e2661925dfef0a11c368075b2cc9f95481ded82017fdb262b2fa386'
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH = 120_000_000
logging.getLogger('pypdf').setLevel(logging.ERROR)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()


def mul(a, b):
    return [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3],
            a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]]


def extended_rect(rect, cm):
    """Extend only axis-aligned large page/header clipping and ground rectangles.

    The inner crop between the new header and reused body remains unchanged.
    Nothing is scaled; only the part outside trim can become newly visible.
    """
    a, b, c, d, tx, ty = cm
    if abs(b) > 1e-7 or abs(c) > 1e-7 or not a or not d:
        return None
    x, y, w, h = map(float, rect)
    xs = sorted([x*a+tx, (x+w)*a+tx])
    ys = sorted([y*d+ty, (y+h)*d+ty])
    if xs[1]-xs[0] < .85*W and ys[1]-ys[0] < .85*H:
        return None
    newx, newy = xs[:], ys[:]
    # Chromium rounds page boxes by less than one point.
    if abs(xs[0]) < 1: newx[0] = -B
    if abs(xs[1]-W) < 1: newx[1] = W+B
    if abs(ys[0]) < 1: newy[0] = -B
    if abs(ys[1]-H) < 1: newy[1] = H+B
    if newx == xs and newy == ys: return None
    xx = sorted([(v-tx)/a for v in newx])
    yy = sorted([(v-ty)/d for v in newy])
    return [FloatObject(xx[0]), FloatObject(yy[0]), FloatObject(xx[1]-xx[0]), FloatObject(yy[1]-yy[0])]


def extend_edges(page, reader):
    changes = []
    seen = set()
    def walk(obj, resources, cm):
        sig = (id(obj), tuple(round(v, 5) for v in cm))
        if sig in seen: return
        seen.add(sig)
        if not isinstance(obj, PageObject) and '/BBox' in obj:
            x0, y0, x1, y1 = map(float, obj['/BBox'])
            r = extended_rect([x0, y0, x1-x0, y1-y0], cm)
            if r:
                obj[NameObject('/BBox')] = RectangleObject([r[0], r[1], r[0]+r[2], r[1]+r[3]])
                changes.append('form-bbox')
        stream = obj.get_contents() if isinstance(obj, PageObject) else ContentStream(obj, reader)
        out, stack = [], []
        for index, (values, op) in enumerate(stream.operations):
            if op == b'q': stack.append(cm[:])
            elif op == b'Q': cm = stack.pop()
            elif op == b'cm': cm = mul(list(map(float, values)), cm)
            elif op == b're':
                # Rectangles used for clipping or a full-page background, never text.
                following = [o for _, o in stream.operations[index+1:index+4]]
                if any(o in (b'W', b'W*', b'f', b'f*') for o in following):
                    r = extended_rect(values, cm)
                    if r:
                        values = r
                        changes.append('clip-or-ground')
            elif op == b'Do':
                form = resources['/XObject'][values[0]].get_object()
                if form.get('/Subtype') == '/Form':
                    walk(form, form.get('/Resources', resources), mul(list(map(float, form.get('/Matrix', [1,0,0,1,0,0]))), cm))
            out.append((values, op))
        assert not stack
        stream.operations = out
        if isinstance(obj, PageObject): obj.replace_contents(stream)
        else: obj.set_data(stream.get_data())
    walk(page, page['/Resources'], [1,0,0,1,0,0])
    return len(changes)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--folios', default='all')
    args = parser.parse_args()
    folios = list(range(1,169)) if args.folios == 'all' else [int(x) for x in args.folios.split(',')]
    assert sha(SOURCE) == SHA and sha(ART) == ART_SHA
    DOC.mkdir(parents=True, exist_ok=True); TMP.mkdir(parents=True, exist_ok=True)
    source, artwork = PdfReader(SOURCE), PdfReader(ART)
    assert len(source.pages) == 172 and len(artwork.pages) == 148
    art_map = {}
    # No image decoding needed to index the original named page-art streams.
    for i, page in enumerate(artwork.pages):
        for name, ref in page.get('/Resources', {}).get('/XObject', {}).items():
            ob = ref.get_object()
            if str(name).startswith('/FormXob.') and ob.get('/Subtype') == '/Image':
                art_map[str(name)] = (i+1, ob)
    writer = PdfWriter(); records=[]; restored=0
    plan = json.loads((ROOT/'docs/publication/whole-book-order-preview/PAGE-MAP.json').read_text())
    for f in folios:
        # Independent page clone prevents changes leaking into an approved input.
        clone = PdfWriter(); page = clone.add_page(source.pages[f+1]); page.pop('/Annots', None)
        restored_here=[]
        for key in page.images.keys():
            name = key[-1] if isinstance(key, list) else key
            if str(name) not in art_map: continue
            current = page.images[key]
            if current.image.width > 2000: continue
            original_page, original = art_map[str(name)]
            # Name identity is supported by an independent visual pixel comparison.
            original_image = artwork.pages[original_page-1].images[str(name)].image.convert('RGB')
            original_image.thumbnail((1130,1454), Image.Resampling.LANCZOS)
            encoded=io.BytesIO();original_image.save(encoded,format='JPEG',quality=82,subsampling=0)
            expected=Image.open(io.BytesIO(encoded.getvalue()))
            actual=current.image.convert('RGB')
            assert actual.size == expected.size, (f, name)
            error=float(np.abs(np.asarray(actual,dtype=np.int16)-np.asarray(expected,dtype=np.int16)).mean())
            assert error < .15, ('Artwork identity mismatch',f,name,error)
            dest=current.indirect_reference.get_object()
            assert not any(isinstance(v,IndirectObject) for v in original.values()), 'Unexpected source image dependency'
            dest.clear();dest.update(original);dest._data=original._data;dest.decoded_self=None
            restored_here.append({'name':str(name),'originalPage':original_page,'meanScreenComparisonError':error,'pixels':[int(original['/Width']),int(original['/Height'])]})
            restored+=1
            actual.close();expected.close();original_image.close()
        extensions=extend_edges(page,clone)
        page.cropbox=RectangleObject([-B,-B,W+B,H+B])
        result=PageObject.create_blank_page(width=W+2*B,height=H+2*B)
        # Neutral ground covers only any residual rounding sliver; full source
        # background rectangles and edge artwork are extended above.
        # John requested cream intentional blanks, including the opening leaves.
        fill=DecodedStreamObject();fill.set_data(f'q 1 .9725490196 .9137254902 rg 0 0 {W+2*B} {H+2*B} re f Q'.encode())
        result[NameObject('/Contents')]=fill
        if plan[f+1]['kind'] != 'blank':
            result.merge_transformed_page(page,Transformation().translate(B,B))
        else:
            assert not page.extract_text().strip(), 'An intended blank has text'
        result.mediabox=RectangleObject([0,0,W+2*B,H+2*B]);result.cropbox=RectangleObject(result.mediabox)
        result.bleedbox=RectangleObject(result.mediabox);result.trimbox=RectangleObject([B,B,W+B,H+B])
        writer.add_page(result)
        records.append({'folio':f,'label':plan[f+1]['label'],'kind':plan[f+1]['kind'],'restoredArt':restored_here,'expandedEdgeObjects':extensions,'textRescaled':False})
        if f%10==0 or f==folios[-1]:print(f'Prepared folio {f}; restored {restored} original page-art images',flush=True)
        del clone,page,result;gc.collect()
    if args.folios=='all': assert restored==110,restored
    writer.add_metadata({'/Title':'The Vegetable Guru - Bookvault interior review','/Author':'John Lennon','/Subject':'Imperial; 168 pages; 185 x 240 mm trim, 3 mm bleed. Prepared for author review before proof order.'})
    writer.set_page_label(0,len(folios)-1,style='/D',start=folios[0])
    target=TMP/('interior-rgb.pdf' if args.folios=='all' else 'interior-sample-rgb.pdf')
    writer.write(target)
    receipt={'date':'2026-10-19','source':str(SOURCE.relative_to(ROOT)),'sourceSha256':SHA,'originalArtSource':str(ART.relative_to(ROOT)),'originalArtSha256':ART_SHA,'pdf':str(target.relative_to(ROOT)),'sha256':sha(target),'restoredPageArtImages':restored,'pages':records,'method':'Original native text and approved current page composition retained; 150 dpi screen artwork replaced by identified original 600 dpi image streams; boundary clipping and ground rectangles extended into 3 mm bleed without scaling content. Intentional blank pages use the same warm-cream ground at John’s request. No canonical or approved source edits.'}
    (DOC/('INTERIOR-PREPARATION.json' if args.folios=='all' else 'INTERIOR-SAMPLE.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    assert sha(SOURCE)==SHA and sha(ART)==ART_SHA
    print(target,flush=True)


if __name__=='__main__': main()
