"""Original-layout control, same outline conversion as the accepted 20mm file."""
from pathlib import Path
import hashlib, json, subprocess, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, FloatObject, NameObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-All-300dpi.pdf'
OUTPUT = ROOT / 'output/pdf/bookvault-isolation-2026-11-23/Vegetable-Guru-Interior-Original-Gutter-Outlined.pdf'
RAW = DOC / 'raw-Original-Gutter-Outlined.pdf'
ICC = ROOT / 'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DEFINITION = DOC.parent / 'supplier-compatibility/PDFX_def.ps'
EXPECTED = 'e63823a8d71b559622758918dc8809f460d5bc7a6426b00058cc1ecabca29a6f'
KEEP_FONTS = '--keep-fonts' in sys.argv
if KEEP_FONTS:
    OUTPUT = OUTPUT.with_name('Vegetable-Guru-Interior-Original-Gutter-GS-Native.pdf')
    RAW = DOC / 'raw-Original-Gutter-GS-Native.pdf'
PREFIX = 'ORIGINAL-GS-NATIVE' if KEEP_FONTS else 'ORIGINAL-OUTLINE'

def main():
    assert not RAW.exists() and not OUTPUT.exists(), 'Preserve existing diagnostics'
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    assert hashlib.file_digest(SOURCE.open('rb'),'sha256').hexdigest() == EXPECTED
    args = ['/opt/homebrew/bin/gs','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite',
            '-dPDFX=1','-dNoOutputFonts='+str(not KEEP_FONTS).lower(),'-r1200',
            '-dPDFACompatibilityPolicy=2','-sColorConversionStrategy=CMYK',
            '-dAutoRotatePages=/None','-dDownsampleColorImages=false',
            '-dDownsampleGrayImages=false','-dDownsampleMonoImages=false',
            '-dAutoFilterColorImages=false','-dAutoFilterGrayImages=false',
            '-dColorImageFilter=/FlateEncode','-dGrayImageFilter=/FlateEncode',
            '-dPassThroughJPEGImages=true','--permit-file-read='+str(ICC),
            '-sOutputFile='+str(RAW),str(DEFINITION),str(SOURCE)]
    (DOC/(PREFIX+'-COMMAND.json')).write_text(json.dumps(args,indent=2)+'\n')
    with (DOC/(PREFIX+'-LOG.txt')).open('w') as log:
        result = subprocess.run(args, stdout=log, stderr=subprocess.STDOUT)
    assert result.returncode == 0
    raw, source = PdfReader(RAW), PdfReader(SOURCE)
    writer = PdfWriter(clone_from=raw)
    assert len(raw.pages) == len(source.pages) == 174
    for page, ref in zip(writer.pages, source.pages):
        for key in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):
            page[NameObject(key)] = ArrayObject([FloatObject(float(v)) for v in ref[key]])
        page.pop('/ArtBox',None)
    writer.add_metadata({'/GTS_PDFXVersion':'PDF/X-1:2001',
                         '/GTS_PDFXConformance':'PDF/X-1a:2001',
                         '/Title':'The Vegetable Guru - original gutter '+('font-preserving GS' if KEEP_FONTS else 'outlined')+' control'})
    writer.write(OUTPUT)
    final=PdfReader(OUTPUT)
    assert all(a.get_contents().get_data()==b.get_contents().get_data() for a,b in zip(raw.pages,final.pages))
    report={'source':str(SOURCE.relative_to(ROOT)),'sourceSHA256':EXPECTED,
            'output':str(OUTPUT.relative_to(ROOT)), 'bytes':OUTPUT.stat().st_size,
            'sha256':hashlib.file_digest(OUTPUT.open('rb'),'sha256').hexdigest(),
            'pageCount':174,'status':'Built; verification pending',
            'keepFonts':KEEP_FONTS,
            'differenceFromAcceptedControl':'Original page geometry retained. Same conversion settings except NoOutputFonts=false for the font-preserving control; same raster inputs, original approx 17mm gutter and 8mm outer margin.'}
    (DOC/(PREFIX+'-BUILD.json')).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2),flush=True)

if __name__ == '__main__': main()
