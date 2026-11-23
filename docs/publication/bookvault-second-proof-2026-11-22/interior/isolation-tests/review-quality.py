"""Audit upload-workaround changes against the approved corrected-header PDF.

This writes evidence only; it never modifies production PDFs or source artwork.
"""
from pathlib import Path
from collections import Counter
import hashlib, json, multiprocessing as mp, re, unicodedata
import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pypdf import PdfReader

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf'
CANDIDATE = SOURCE.with_name('Vegetable-Guru-Interior-All-300dpi.pdf')
OUT = DOC / 'quality'
SELECTED = [1, 2, 3, 7, 24, 25, 61, 67, 98, 104, 146, 154, 162, 163, 167, 168, 170]


def normalise(s):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', s).replace('⁄', '/'))


def init():
    global before, after
    before = pdfium.PdfDocument(SOURCE)
    after = pdfium.PdfDocument(CANDIDATE)


def compare(index):
    a, b = before[index], after[index]
    at, bt = a.get_textpage(), b.get_textpage()
    atext, btext = at.get_text_range(), bt.get_text_range()
    words = lambda s: Counter(re.findall(r'\w+', unicodedata.normalize('NFKC', s).lower()))
    ai = a.render(scale=120/72).to_pil().convert('RGB')
    bi = b.render(scale=120/72).to_pil().convert('RGB')
    aa, bb = np.asarray(ai), np.asarray(bi)
    assert aa.shape == bb.shape
    diff = np.abs(aa.astype(np.int16) - bb.astype(np.int16))
    ink_a, ink_b = np.min(aa, axis=2) < 100, np.min(bb, axis=2) < 100
    expand = lambda mask: np.asarray(Image.fromarray(mask.astype('uint8')*255).filter(ImageFilter.MaxFilter(3))) > 0
    result = {'page': index+1, 'textEqualNormalised': normalise(atext) == normalise(btext),
              'sourceCharacters': at.count_chars(), 'candidateCharacters': bt.count_chars(),
              'sourceOnlyWords': dict(words(atext)-words(btext)),
              'candidateOnlyWords': dict(words(btext)-words(atext)),
              'meanChannelDifference': float(diff.mean()),
              'fractionPixelsDifferenceOver10': float(np.any(diff > 10, axis=2).mean()),
              'missingDarkPixelsBeyond1px': int((ink_a & ~expand(ink_b)).sum()),
              'addedDarkPixelsBeyond1px': int((ink_b & ~expand(ink_a)).sum())}
    if not result['textEqualNormalised']:
        (OUT/'text'/f'{index+1:03d}-source.txt').write_text(atext)
        (OUT/'text'/f'{index+1:03d}-candidate.txt').write_text(btext)
    if index+1 in SELECTED:
        for label, image in [('source', ai), ('candidate', bi)]:
            image.save(OUT/'renders'/f'{index+1:03d}-{label}.png')
    bi.thumbnail((250, 322))
    bi.save(OUT/'thumbnails'/f'{index+1:03d}.jpg', quality=94)
    at.close(); bt.close(); a.close(); b.close()
    return result


def main():
    for name in ('text', 'renders', 'thumbnails', 'details', 'contacts'):
        (OUT/name).mkdir(parents=True, exist_ok=True)
    source, candidate = PdfReader(SOURCE), PdfReader(CANDIDATE)
    assert len(source.pages) == len(candidate.pages) == 174
    page_boxes = ['MediaBox', 'CropBox', 'TrimBox', 'BleedBox']
    box_delta = max(abs(float(x)-float(y)) for a,b in zip(source.pages,candidate.pages)
                    for key in page_boxes for x,y in zip(a['/'+key],b['/'+key]))
    profile = lambda reader: reader.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data()
    with mp.Pool(3, initializer=init) as pool:
        pages = []
        for p in pool.imap(compare, range(174)):
            pages.append(p)
            if len(pages)%20 == 0: print('Compared', len(pages), 'pages', flush=True)
    report = {'source': str(SOURCE.relative_to(ROOT)), 'candidate': str(CANDIDATE.relative_to(ROOT)),
              'sourceSHA256': hashlib.file_digest(SOURCE.open('rb'),'sha256').hexdigest(),
              'candidateSHA256': hashlib.file_digest(CANDIDATE.open('rb'),'sha256').hexdigest(),
              'pageCount':174, 'comparisonDpi':120, 'maxPageBoxDifferencePoints':box_delta,
              'outputProfileBytesEqual':profile(source)==profile(candidate),
              'normalisedTextMismatches':[p['page'] for p in pages if not p['textEqualNormalised']],
              'pages': pages,
              'limitations': 'Image resampling and font hinting change pixels. Whole-page checks flag changes; actual detail review is separately recorded. No claim of certified PDF/X validation or physical print equivalence.'}
    (OUT/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='pages'},indent=2),flush=True)
    print('Largest changes',json.dumps(sorted(pages,key=lambda p:p['meanChannelDifference'],reverse=True)[:12],indent=2),flush=True)
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
    for start in range(0,174,20):
        canvas=Image.new('RGB',(1350,1440),'#dedede'); draw=ImageDraw.Draw(canvas)
        for slot,n in enumerate(range(start+1,min(start+21,175))):
            x=(slot%5)*270+10; y=(slot//5)*360+10
            draw.text((x,y),str(n),fill='black',font=font)
            canvas.paste(Image.open(OUT/'thumbnails'/f'{n:03d}.jpg'),(x,y+25))
        canvas.save(OUT/'contacts'/f'{start+1:03d}-{min(start+20,174):03d}.jpg',quality=94)


if __name__ == '__main__':
    main()
