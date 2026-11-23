"""Re-export checked PDF/X-3 using Ghostscript's actual PDF/X-1a mode."""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[5]
DOC=Path(__file__).resolve().parent
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3-Optimised.pdf'
OUTPUT=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf'
ICC=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DEFINITION=DOC.parent/'supplier-compatibility/PDFX_def.ps'
assert hashlib.file_digest(SOURCE.open('rb'),'sha256').hexdigest()=='8e3f9a24cbcdbfe3b17009a940662a45c370307d7db07fe9483b43bf42e07d7c'
assert not OUTPUT.exists(),'Preserve any existing candidate; do not overwrite'
args=['/opt/homebrew/bin/gs','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite','-dPDFX=1',
      '-dPDFACompatibilityPolicy=2','-sColorConversionStrategy=CMYK',
      '-dAutoRotatePages=/None','-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false','-dDownsampleMonoImages=false',
      '-dAutoFilterColorImages=false','-dAutoFilterGrayImages=false',
      '-dColorImageFilter=/FlateEncode','-dGrayImageFilter=/FlateEncode',
      '-dPassThroughJPEGImages=true','-dCompressFonts=true','-dSubsetFonts=true',
      '--permit-file-read='+str(ICC),'-sOutputFile='+str(OUTPUT),str(DEFINITION),str(SOURCE)]
(DOC/'CONVERSION-COMMAND.json').write_text(json.dumps(args,indent=2)+'\n')
with (DOC/'CONVERSION-LOG.txt').open('w') as log:
    r=subprocess.run(args,stdout=log,stderr=subprocess.STDOUT)
print(json.dumps({'exitCode':r.returncode,'output':str(OUTPUT),'bytes':OUTPUT.stat().st_size if OUTPUT.exists() else None,'sha256':hashlib.file_digest(OUTPUT.open('rb'),'sha256').hexdigest() if OUTPUT.exists() else None}),flush=True)
raise SystemExit(r.returncode)
