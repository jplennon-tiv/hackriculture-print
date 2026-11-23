"""Approved quality restorations with original 17/8 mm geometry; printer copy only."""
from pathlib import Path
import hashlib, json, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, FloatObject, NameObject

DOC=Path(__file__).resolve().parent
ROOT=DOC.parents[4]
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Nunito-Fractions.pdf'
EXPECTED='a7af3c88d43d7671a7e4904269f30af350b9be9194ea2dd74c4ccc09b1435b12'
OUTPUT=ROOT/'output/pdf/bookvault-quality-restored-2026-11-23/Vegetable-Guru-Interior-Original-Margins.pdf'
RAW=DOC/'raw-outlined.pdf'
ICC=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DEFINITION=DOC.parent/'supplier-compatibility/PDFX_def.ps'

def digest(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()

def main():
    assert not RAW.exists() and not OUTPUT.exists(),'Do not overwrite an existing production candidate'
    assert digest(SOURCE)==EXPECTED,'Source changed'
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    args=['/opt/homebrew/bin/gs','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite',
          '-dPDFX=1','-dNoOutputFonts=true','-r1200','-dPDFACompatibilityPolicy=2',
          '-sColorConversionStrategy=CMYK','-dAutoRotatePages=/None',
          '-dDownsampleColorImages=false','-dDownsampleGrayImages=false','-dDownsampleMonoImages=false',
          '-dAutoFilterColorImages=false','-dAutoFilterGrayImages=false',
          '-dColorImageFilter=/FlateEncode','-dGrayImageFilter=/FlateEncode',
          '-dPassThroughJPEGImages=true','--permit-file-read='+str(ICC),
          '-sOutputFile='+str(RAW),str(DEFINITION),str(SOURCE)]
    (DOC/'COMMAND.json').write_text(json.dumps(args,indent=2)+'\n')
    with (DOC/'BUILD-LOG.txt').open('w') as log:
        result=subprocess.run(args,stdout=log,stderr=subprocess.STDOUT)
    assert result.returncode==0
    raw,source=PdfReader(RAW),PdfReader(SOURCE)
    assert len(raw.pages)==len(source.pages)==174
    writer=PdfWriter(clone_from=raw)
    for page,ref in zip(writer.pages,source.pages):
        for k in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):
            page[NameObject(k)]=ArrayObject([FloatObject(float(v)) for v in ref[k]])
        page.pop('/ArtBox',None)
    writer.add_metadata({'/GTS_PDFXVersion':'PDF/X-1:2001','/GTS_PDFXConformance':'PDF/X-1a:2001',
                         '/Title':'The Vegetable Guru - restored quality, original margins'})
    writer.write(OUTPUT)
    final=PdfReader(OUTPUT)
    assert all(a.get_contents().get_data()==b.get_contents().get_data() for a,b in zip(raw.pages,final.pages))
    report={'source':str(SOURCE.relative_to(ROOT)),'sourceSHA256':EXPECTED,
            'output':str(OUTPUT.relative_to(ROOT)),'bytes':OUTPUT.stat().st_size,'sha256':digest(OUTPUT),
            'pageCount':174,'status':'Built; verification pending','nominalMarginsMm':{'inside':17,'outside':8},
            'scale':1,'translationMm':0,'restored':['Approved SemiBold on title/contents','600 dpi on 47 fine-art pages and retained high-resolution bleed fragments'],
            'retained':['Approved header/colour corrections','5/8 fraction cleanup','300 dpi photographic page layers','FOGRA39 output profile'],
            'supplierConversion':'Same genuine vector-outline settings as both accepted controls; no additional image downsampling',
            'sourcePreserved':True}
    (DOC/'BUILD.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2),flush=True)

if __name__=='__main__':main()
