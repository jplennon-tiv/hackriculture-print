"""Native title/season specimens without hidden full-page body text."""
from pathlib import Path
import runpy,json
import pdfplumber
from pypdf import PdfReader,PdfWriter
D=Path(__file__).resolve().parent;R=D.parents[2]
m=runpy.run_path(str(R/'scripts/interior-six-fixes.py'));S=m['D'];u=m['u'];u.CODECS.clear();u.ENCODINGS.clear()
records=u.read(S/'TEXT-MAP.json');plan=u.read(S/'SIMPLE-PLAN.json');pdf=PdfReader(S/'before-reading.pdf');w=PdfWriter();paint=m['Painter'](pdf,w,records)
with pdfplumber.open(S/'before-reading.pdf') as pl:
  for pi in [35,57]:
    page=w.add_blank_page(width=185*m['MM'],height=m['H']);paint.rect(0,0,185*m['MM'],33*m['MM'],(1,248/255,233/255))
    selected={i:r for i,r in enumerate(records) if r['page']==pi and r.get('chars') and r['bbox'][1]<96}
    for i,r in selected.items():
      if i not in plan['remove']:paint.chars(i)
    for move in plan['moves']:
      if move['ref'] in selected:paint.chars(move['ref'],move['dx'],move['dy'])
    for im in pl.pages[pi].images:
      if im['top']<95 and im['x1']<293:paint.image(pi,im)
    paint.finish(page)
w.write(D/'native-header-sources.pdf')
print('Saved native current header words and season icons, without body text.')
