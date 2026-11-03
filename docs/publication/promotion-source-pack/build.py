"""Render selected current-book pages for the separate promotional-slide task."""
from pathlib import Path
import hashlib,json,subprocess
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[3]
DOC=ROOT/'docs/publication/whole-book-order-preview'
OUT=ROOT/'output/promotion-source-pack';OUT.mkdir(parents=True,exist_ok=True)
checks=json.loads((DOC/'CHECKS.json').read_text());pdf=ROOT/checks['pdf']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(pdf)==checks['sha256']
page_map=json.loads((DOC/'PAGE-MAP.json').read_text())
chosen=[1,6,7,11,38,39,96,97,108,109,154,166,167,168,169]
rows=[];tiles=[]
for number in chosen:
 row=next(p for p in page_map if p['pdfPage']==number)
 stem='front-cover' if number==1 else f"book-page-{row['folio']:03}"
 path=OUT/(stem+'.png')
 subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-f',str(number),'-l',str(number),'-singlefile','-cropbox','-r','300','-png',str(pdf),str(OUT/stem)],check=True,capture_output=True)
 with Image.open(path) as im:
  assert im.width>2100 and im.height>2800
  rows.append({'folio':row['folio'],'pdfPage':number,'label':row['label'],'path':str(path.relative_to(ROOT)),'sizePx':list(im.size),'sha256':sha(path)})
  tile=Image.new('RGB',(300,420),'#fff8e9');preview=im.convert('RGB');preview.thumbnail((300,389));tile.paste(preview,(0,25));ImageDraw.Draw(tile).text((5,5),stem,fill='#173e2c');tiles.append(tile)
canvas=Image.new('RGB',(1500,1260),'#fff8e9')
for i,tile in enumerate(tiles):canvas.paste(tile,((i%5)*300,(i//5)*420))
canvas.save(OUT/'contact.jpg',quality=88)
manifest={'date':'2026-11-02','purpose':'Source pages for a separate promotional YouTube slide task; no slide designs or publishing performed.','book':{'pdf':checks['pdf'],'sha256':checks['sha256'],'interiorPages':checks['interiorPages'],'pdfPages':checks['pdfPages'],'units':'imperial'},'renderDpi':300,'pages':rows,'contact':'output/promotion-source-pack/contact.jpg','artworkRegistry':'docs/assets/README.md','heroMap':'src/print/heroArtwork.json','stockRegistry':'docs/assets/vegetable-guru-stock/ARTWORK.json','designSystem':'docs/BOOK-DESIGN-SYSTEM.md','handover':'docs/handover/PROMOTIONAL-SLIDES.md','limits':['Images are faithful PDF renders, not higher-detail replacements for embedded artwork. Use original art for large isolated illustrations.','No pending crop edits are included.','No sale availability, ISBN, confirmed price or purchase link implied.']}
assert sha(pdf)==checks['sha256']
(Path(__file__).parent/'MANIFEST.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'pages':len(rows),'dpi':300,'manifest':'docs/publication/promotion-source-pack/MANIFEST.json'}))
