"""Make a separately preserved font-free PDF/X diagnostic from the gutter copy."""
from pathlib import Path
import hashlib, json, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, FloatObject, NameObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
SOURCE = ROOT / 'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Gutter20-Native.pdf'
OUTPUT = SOURCE.with_name('Vegetable-Guru-Interior-Gutter20-Outlined.pdf')
RAW = DOC / 'raw-Gutter20-Outlined.pdf'
ICC = ROOT / 'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DEFINITION = DOC.parent / 'supplier-compatibility/PDFX_def.ps'
EXPECTED = '2b9f5974699d120c7b2120151e60c15c838267d9cfe0dd13dde7eaa97ba6fb1e'


def main():
    assert not RAW.exists() and not OUTPUT.exists(), 'Preserve existing diagnostic files'
    assert hashlib.file_digest(SOURCE.open('rb'), 'sha256').hexdigest() == EXPECTED
    args = ['/opt/homebrew/bin/gs', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite',
            '-dPDFX=1', '-dNoOutputFonts=true', '-r1200',
            '-dPDFACompatibilityPolicy=2', '-sColorConversionStrategy=CMYK',
            '-dAutoRotatePages=/None', '-dDownsampleColorImages=false',
            '-dDownsampleGrayImages=false', '-dDownsampleMonoImages=false',
            '-dAutoFilterColorImages=false', '-dAutoFilterGrayImages=false',
            '-dColorImageFilter=/FlateEncode', '-dGrayImageFilter=/FlateEncode',
            '-dPassThroughJPEGImages=true', '--permit-file-read=' + str(ICC),
            '-sOutputFile=' + str(RAW), str(DEFINITION), str(SOURCE)]
    (DOC / 'OUTLINE-COMMAND.json').write_text(json.dumps(args, indent=2) + '\n')
    with (DOC / 'OUTLINE-LOG.txt').open('w') as log:
        result = subprocess.run(args, stdout=log, stderr=subprocess.STDOUT)
    assert result.returncode == 0, result.returncode
    raw = PdfReader(RAW); original = PdfReader(SOURCE); writer = PdfWriter(clone_from=raw)
    assert len(raw.pages) == len(original.pages) == 174
    for page, reference in zip(writer.pages, original.pages):
        for key in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox'):
            page[NameObject(key)] = ArrayObject([FloatObject(float(v)) for v in reference[key]])
        page.pop('/ArtBox', None)
    writer.add_metadata({'/GTS_PDFXVersion': 'PDF/X-1:2001',
                         '/GTS_PDFXConformance': 'PDF/X-1a:2001',
                         '/Title': 'The Vegetable Guru - 20 mm gutter outlined supplier test'})
    writer.write(OUTPUT)
    final = PdfReader(OUTPUT)
    assert all(a.get_contents().get_data() == b.get_contents().get_data() for a,b in zip(raw.pages, final.pages))
    assert all(list(a[k]) == list(b[k]) for a,b in zip(original.pages, final.pages) for k in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox'))
    report = {'source': str(SOURCE.relative_to(ROOT)), 'sourceSHA256': EXPECTED,
              'raw': str(RAW.relative_to(ROOT)), 'output': str(OUTPUT.relative_to(ROOT)),
              'outputBytes': OUTPUT.stat().st_size,
              'outputSHA256': hashlib.file_digest(OUTPUT.open('rb'), 'sha256').hexdigest(),
              'pageCount': 174, 'pageBoxesExact': True,
              'method': 'Ghostscript PDF/X-1 mode with NoOutputFonts; text emitted from existing glyph instructions, not raster traced. Restore exact prior page boxes and standard 2001 identification pair without editing converter page instructions.',
              'status': 'Built; independent resource and visual verification pending'}
    (DOC / 'OUTLINE-RESULT.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2), flush=True)


if __name__ == '__main__': main()
