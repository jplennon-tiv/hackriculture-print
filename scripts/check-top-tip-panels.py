"""Check and render only the five panel comparisons, preserving all source copy."""
from pathlib import Path
from collections import Counter
import json, subprocess, logging, re, hashlib, sys
import pdfplumber
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
overlap='--overlap' in sys.argv
D=ROOT/'docs/publication/top-tip-panels'
if overlap:D=D/'overlap'
M=json.loads((D/'CHECKS.json').read_text())
IMAGES=D/'images';IMAGES.mkdir(exist_ok=True)
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
normal=lambda s:re.sub(r'\s+',' ',s).strip()
baseline={};checks=[];embedded_fonts=set()
def check_fonts(resources):
    for ref in resources.get('/Font',{}).values():
        font=ref.get_object()
        if font.get('/Subtype')=='/Type3':
            assert font.get('/CharProcs'),'Type3 font has no glyphs'
            embedded_fonts.add('Type3')
        else:
            for ref in font.get('/DescendantFonts',[font]):
                child=ref.get_object();descriptor=child.get('/FontDescriptor')
                assert descriptor and any(k in descriptor.get_object() for k in ['/FontFile','/FontFile2','/FontFile3']), 'Font is not embedded'
                embedded_fonts.add(str(child.get('/BaseFont')))
    for ref in resources.get('/XObject',{}).values():
        child=ref.get_object()
        if child.get('/Resources'):check_fonts(child['/Resources'])
for proof in M['results']:
    name=proof['variant']+'-'+proof['units'];p=ROOT/proof['pdf']
    for page in PdfReader(p).pages:check_fonts(page['/Resources'])
    subprocess.run([POPPLER,'-r','140','-png',str(p),str(IMAGES/name)],check=True)
    with pdfplumber.open(p) as pdf:
        assert len(pdf.pages)==5
        for i,page in enumerate(pdf.pages):
            if proof['variant']=='baseline':
                baseline[(proof['units'],i)]={'text':normal(page.extract_text(x_tolerance=1)),'types':Counter((c['text'],round(c['size'],2)) for c in page.chars)}
            else:
                badge=proof['checks'][i]['badgeMm'];mm=72/25.4
                def keep(obj):
                    return not (obj['object_type']=='char' and badge['left']*mm-1<=obj['x0']<=(badge['left']+badge['width'])*mm+1 and badge['top']*mm-1<=obj['top']<=(badge['top']+badge['height'])*mm+1)
                filtered=page.filter(keep);old=baseline[(proof['units'],i)]
                assert Counter((c['text'],round(c['size'],2)) for c in filtered.chars)==old['types'],(name,i,'body glyphs/type changed')
                assert normal(filtered.extract_text(x_tolerance=1))==old['text'],(name,i,'body text changed')
            im=Image.open(IMAGES/f'{name}-{i+1}.png');box=proof['checks'][i]['panelMm'];scale=im.width/185
            area=(max(0,int((box['left']-1)*scale)),max(0,int((box['top']-4)*scale)),min(im.width,int((box['left']+box['width']+4)*scale)),min(im.height,int((box['top']+box['height']+2)*scale)))
            im.crop(area).save(IMAGES/f'{name}-{i+1}-panel.png')
        checks.append({'variant':proof['variant'],'units':proof['units'],'pdf':proof['pdf'],'sha256':proof['sha256'],'pages':5,'bodyCopyAndTypePreserved':True})
book=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
with pdfplumber.open(book) as current:
    for i,p in enumerate(M['panels']):
        assert normal(current.pages[p['folio']+1].extract_text(x_tolerance=1))==baseline[('imperial',i)]['text'],(p['folio'],'baseline differs from current book')
(D/'PDF-CHECKS.json').write_text(json.dumps({'status':'passed','baselineMatchesCurrentBookText':True,'baselineCurrentBookSha256':hashlib.sha256(book.read_bytes()).hexdigest(),'proofs':checks,'embeddedFonts':sorted(embedded_fonts)},indent=2)+'\n')
comparison=PdfWriter()
for variant,label in ([('ribbon','Refined overlapping ribbon')] if overlap else [('ribbon','A — Ribbon'),('splash','B — Splash')]):
    start=len(comparison.pages)
    comparison.append(ROOT/f'output/pdf/top-tip-panels/{"overlap/" if overlap else ""}{variant}-imperial.pdf')
    parent=comparison.add_outline_item(label,start)
    for i,panel in enumerate(M['panels']):comparison.add_outline_item(str(panel['folio']),start+i,parent=parent)
comparison.add_metadata({'/Title':'The Vegetable Guru — Top tip panel proposals','/Author':'John Lennon'})
comparison.write(ROOT/f'output/pdf/top-tip-panels/{"overlap/" if overlap else ""}top-tip-comparison.pdf')
tiles=[]
font_path=Path('/System/Library/Fonts/Supplemental/Arial.ttf')
font=ImageFont.truetype(str(font_path),24) if font_path.exists() else ImageFont.load_default()
for name,label in ([('baseline','Original panel'),('ribbon','Refined ribbon - overlapping the edges')] if overlap else [('baseline','Original'),('ribbon','A - Ribbon'),('splash','B - Splash')]):
    im=Image.open(IMAGES/f'{name}-imperial-1-panel.png').convert('RGB');im.thumbnail((1050,320))
    tile=Image.new('RGB',(1090,im.height+62),'#fff8e9');ImageDraw.Draw(tile).text((20,8),label,font=font,fill='#173e2c');tile.paste(im,(20,42));tiles.append(tile)
canvas=Image.new('RGB',(1090,sum(t.height for t in tiles)+20*(len(tiles)-1)),'#d9dfcf');y=0
for tile in tiles:canvas.paste(tile,(0,y));y+=tile.height+20
canvas.save(D/'comparison.png')
print(json.dumps({'proofs':len(checks),'pagesPerProof':5,'currentBookTextMatches':True}))
