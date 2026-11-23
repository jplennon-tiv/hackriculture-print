"""Verify the combined diagnostic and actual page appearance before uploading."""
from pathlib import Path
from collections import Counter
import hashlib, importlib.util, json, multiprocessing as mp, subprocess
import numpy as np
from PIL import Image, ImageChops, ImageFilter, ImageDraw, ImageFont
import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
NATIVE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Gutter20-Native.pdf'
FINAL = NATIVE.with_name('Vegetable-Guru-Interior-Gutter20-Outlined.pdf')
ORIGINAL = NATIVE.with_name('Vegetable-Guru-Interior-All-300dpi.pdf')
POPPLER = Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin')
SELECTED = [1, 2, 3, 7, 24, 25, 61, 67, 90, 97, 98, 99, 145, 146, 157, 163, 167, 168, 170, 173]


def init():
    global before, after
    before = pdfium.PdfDocument(NATIVE); after = pdfium.PdfDocument(FINAL)


def compare(index):
    a, b = before[index], after[index]
    ai = a.render(scale=120/72).to_pil().convert('RGB')
    bi = b.render(scale=120/72).to_pil().convert('RGB')
    aa, bb = np.array(ai), np.array(bi)
    assert aa.shape == bb.shape
    difference = np.abs(aa.astype(np.int16) - bb.astype(np.int16))
    # A one-pixel tolerance isolates missing/displaced dark ink from normal
    # hinting and antialiasing changes when native text becomes vector curves.
    ink_a = np.min(aa, axis=2) < 100; ink_b = np.min(bb, axis=2) < 100
    dilate = lambda ink: np.asarray(Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
    lost = ink_a & ~dilate(ink_b); added = ink_b & ~dilate(ink_a)
    tp = b.get_textpage(); text_count = tp.count_chars(); tp.close()
    if index + 1 in SELECTED:
        ai.save(DOC / 'renders' / f'{index+1:03d}-native.jpg', quality=96)
        bi.save(DOC / 'renders' / f'{index+1:03d}-outlined.jpg', quality=96)
    thumb = bi.copy(); thumb.thumbnail((248, 320)); thumb.save(DOC / 'thumbnails' / f'{index+1:03d}.jpg', quality=94)
    result = {'folio': index+1, 'nativeTextCharactersInOutput': text_count,
              'meanAbsoluteChannelDifference': float(difference.mean()),
              'pixelsOver10': int(np.any(difference > 10, axis=2).sum()),
              'sourceDarkPixels': int(ink_a.sum()),
              'darkPixelsMissingBeyond1px': int(lost.sum()),
              'darkPixelsAddedBeyond1px': int(added.sum())}
    a.close(); b.close()
    return result


def main():
    for folder in ('renders', 'thumbnails', 'contacts'): (DOC/folder).mkdir(exist_ok=True)
    spec = importlib.util.spec_from_file_location('pdfx', DOC.parent/'pdfx-retry/verify-pdfx.py')
    helper = importlib.util.module_from_spec(spec); spec.loader.exec_module(helper)
    src, native, final = PdfReader(ORIGINAL), PdfReader(NATIVE), PdfReader(FINAL)
    checks = helper.preflight(final)
    assert not checks['issues'], checks['issues']
    assert not checks['fontTypes'], checks['fontTypes']
    assert not final.is_encrypted
    assert len(src.pages) == len(native.pages) == len(final.pages) == 174
    assert all(list(a[k]) == list(b[k]) for a,b in zip(src.pages,final.pages)
               for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'))
    assert checks['profileSHA256'] == 'c6b4b62f0726243742eced8b9669476a6be89e581f50a7600ed8b6fcbb9cdab8'
    print('Zero font resources; page boxes/profile/security/opacity checked', flush=True)
    images_before = helper.image_inventory(native); print('Native image pixels hashed', flush=True)
    images_after = helper.image_inventory(final); print('Outlined image pixels hashed', flush=True)
    assert images_before == images_after, (len(images_before),len(images_after),len(images_before.keys()-images_after.keys()))
    # The gutter stage must preserve all original artwork and font data too.
    def encoded_images(reader):
        seen=set(); out=[]
        def walk(res):
            for ref in res.get('/XObject',{}).values():
                ob=ref.get_object(); ident=ref.idnum
                if ident in seen: continue
                seen.add(ident)
                if ob.get('/Subtype')=='/Image': out.append((int(ob['/Width']),int(ob['/Height']),hashlib.sha256(ob._data).hexdigest()))
                elif ob.get('/Subtype')=='/Form': walk(ob.get('/Resources',{}))
        for page in reader.pages: walk(page['/Resources'])
        return sorted(out)
    assert encoded_images(src) == encoded_images(native)
    for tool, args, filename in [('pdffonts',[], 'PDFFONTS.txt'),('pdfimages',['-list'],'PDFIMAGES.txt'),('pdfinfo',['-box'],'PDFINFO.txt')]:
        result = subprocess.run([str(POPPLER/tool),*args,str(FINAL)],capture_output=True,text=True)
        (DOC/filename).write_text(result.stdout); (DOC/(filename+'.stderr')).write_text(result.stderr)
        assert result.returncode==0 and not result.stderr,(tool,result.stderr)
    assert len((DOC/'PDFFONTS.txt').read_text().splitlines())==2
    image_rows=[line.split() for line in (DOC/'PDFIMAGES.txt').read_text().splitlines()[2:]]
    dpi=Counter(f'{row[12]}x{row[13]}' for row in image_rows)
    assert all(int(row[12])>=300 and int(row[13])>=300 for row in image_rows)
    with mp.Pool(3,initializer=init) as pool:
        pages=[]
        for item in pool.imap(compare,range(174)):
            pages.append(item)
            if len(pages)%20==0: print('Compared actual pages',len(pages),flush=True)
    assert all(p['nativeTextCharactersInOutput']==0 for p in pages)
    # Independent rendering parser check over every page, not a conformance certificate.
    with (DOC/'GHOSTSCRIPT-CHECK.txt').open('w') as log:
        result=subprocess.run(['/opt/homebrew/bin/gs','-q','-dBATCH','-dNOPAUSE','-sDEVICE=nullpage',str(FINAL)],stdout=log,stderr=subprocess.STDOUT)
    assert result.returncode==0
    report={'source':str(ORIGINAL.relative_to(ROOT)), 'gutterNative':str(NATIVE.relative_to(ROOT)),
            'candidate':str(FINAL.relative_to(ROOT)), 'bytes':FINAL.stat().st_size,
            'sha256':hashlib.file_digest(FINAL.open('rb'),'sha256').hexdigest(),
            'pageCount':174,'pageBoxesExact':True,'encrypted':False,
            'preflight':checks,'fontResources':0,'extractedTextCharacters':0,
            'imageResources':len(images_after),'imagePlacements':len(image_rows),
            'effectiveDpiCounts':dict(dpi),'allImagePixelsAndDimensionsExactThroughOutlining':True,
            'allEncodedImageStreamsExactThroughGutterChange':True,
            'renderComparisonDpi':120,'maximumMeanChannelDifference':max(p['meanAbsoluteChannelDifference'] for p in pages),
            'totalDarkPixelsMissingBeyond1px':sum(p['darkPixelsMissingBeyond1px'] for p in pages),
            'totalDarkPixelsAddedBeyond1px':sum(p['darkPixelsAddedBeyond1px'] for p in pages),
            'ghostscriptNullpageExit':result.returncode,'pages':pages}
    (DOC/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='pages'},indent=2),flush=True)
    print('Largest outline render differences',json.dumps(sorted(pages,key=lambda p:p['darkPixelsMissingBeyond1px']+p['darkPixelsAddedBeyond1px'],reverse=True)[:8],indent=2),flush=True)

    # Paginated visual contacts and an exact six-page supplier-file excerpt.
    font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',17)
    for start in range(0,174,20):
        canvas=Image.new('RGB',(5*270,4*360),'#dddddd'); draw=ImageDraw.Draw(canvas)
        for slot,n in enumerate(range(start+1,min(start+21,175))):
            x=(slot%5)*270+10;y=(slot//5)*360+10
            canvas.paste(Image.open(DOC/'thumbnails'/f'{n:03d}.jpg'),(x,y+25));draw.text((x,y),str(n),font=font,fill='black')
        canvas.save(DOC/'contacts'/f'{start+1:03d}-{min(start+20,174):03d}.jpg',quality=95)
    proof=PdfWriter()
    for n in [1,24,25,98,99,170]:proof.add_page(final.pages[n-1])
    proof.write(FINAL.with_name('Vegetable-Guru-Gutter20-Outlined-Checks.pdf'))


if __name__=='__main__': main()
