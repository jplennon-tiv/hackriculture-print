"""Convert the separately normalised interior without resampling/recolouring."""
from pathlib import Path
import json
import subprocess

ROOT=Path(__file__).resolve().parents[5]
DOC=Path(__file__).resolve().parent
ICC=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
SOURCE=ROOT/'tmp/pdfs/bookvault-pdfx-retry/interior-normalised-fonts.pdf'
OUTPUT=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3.pdf'
DEFINITION=DOC.parent/'supplier-compatibility/PDFX_def.ps'
args=['/opt/homebrew/bin/gs','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite','-dPDFX=3',
      '-dPDFACompatibilityPolicy=2','-sColorConversionStrategy=CMYK',
      '-dAutoRotatePages=/None','-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false','-dDownsampleMonoImages=false',
      '-dAutoFilterColorImages=false','-dAutoFilterGrayImages=false',
      '-dColorImageFilter=/FlateEncode','-dGrayImageFilter=/FlateEncode',
      '-dPassThroughJPEGImages=true','-dCompressFonts=true','-dSubsetFonts=true',
      '--permit-file-read='+str(ICC),'-sOutputFile='+str(OUTPUT),str(DEFINITION),str(SOURCE)]
(DOC/'CONVERSION-COMMAND.json').write_text(json.dumps(args,indent=2)+'\n')
with (DOC/'CONVERSION-LOG.txt').open('w') as log:
    result=subprocess.run(args,stdout=log,stderr=subprocess.STDOUT)
print(json.dumps({'exitCode':result.returncode,'output':str(OUTPUT),
                  'bytes':OUTPUT.stat().st_size if OUTPUT.exists() else None}))
raise SystemExit(result.returncode)
