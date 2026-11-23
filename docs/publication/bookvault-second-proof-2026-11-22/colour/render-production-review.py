from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image,ImageDraw,ImageFont
from pypdf import PdfReader
import subprocess,json,hashlib,argparse
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';P=D/'production';P.mkdir(exist_ok=True);(P/'pages').mkdir(exist_ok=True);(P/'contacts').mkdir(exist_ok=True);(P/'detail').mkdir(exist_ok=True)
arg=argparse.ArgumentParser();arg.add_argument('--interior',required=True);arg.add_argument('--cover',required=True);a=arg.parse_args();interior=R/a.interior;cover=R/a.cover
exe='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm';srgb=D/'intent-review/sRGB.icc';cmyk=R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc';common=['-displayprofile',str(srgb),'-defaultcmykprofile',str(cmyk)]
r=PdfReader(interior);assert len(r.pages)==174
profile=r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data();assert profile==cmyk.read_bytes()
def render_range(ab):
 lo,hi=ab;subprocess.run([exe,'-f',str(lo),'-l',str(hi),'-r','72','-jpeg','-jpegopt','quality=93',*common,str(interior),str(P/'pages'/'folio')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);print('Rendered CMYK folios',lo,hi,flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(render_range,[(1,58),(59,116),(117,174)]))
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',22);small=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',17)
for start in range(1,175,16):
 sheet=Image.new('RGB',(1320,1800),'#e2e2e2');dr=ImageDraw.Draw(sheet);dr.text((24,16),f'Final CMYK folios {start}-{min(start+15,174)} | FOGRA39 to sRGB display',font=font,fill='#173e2c')
 for j,f in enumerate(range(start,min(start+16,175))):
  im=Image.open(P/'pages'/f'folio-{f:03}.jpg');im.thumbnail((300,389),Image.Resampling.LANCZOS);x=24+j%4*324;y=64+j//4*431;sheet.paste(im,(x,y));dr.text((x,y+392),f'P{f}',font=small,fill='#173e2c')
 sheet.save(P/'contacts'/f'contact-{start:03}.jpg',quality=94,subsampling=0)
selected=[1,4,5,6,7,34,56,86,96,97,117,133,145,149,154,155,162,168,169,174]
def detail(f):
 subprocess.run([exe,'-f',str(f),'-l',str(f),'-singlefile','-r','150','-png',*common,str(interior),str(P/'detail'/f'folio-{f:03}')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(detail,selected))
subprocess.run([exe,'-singlefile','-r','150','-png',*common,str(cover),str(P/'detail'/'cover')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
record={'interior':str(interior.relative_to(R)),'interiorSha256':hashlib.sha256(interior.read_bytes()).hexdigest(),'cover':str(cover.relative_to(R)),'coverSha256':hashlib.sha256(cover.read_bytes()).hexdigest(),'interiorFolios':174,'allPageDpi':72,'detailDpi':150,'detailFolios':selected,'displayProfile':str(srgb.relative_to(R)),'defaultCmykProfile':str(cmyk.relative_to(R)),'intentProfileMatchesAcceptedFirstProof':True,'status':'Rendered; inspect all contact sheets and selected actual-PDF detail before finalising.'}
(D/'PRODUCTION-RENDER-CHECKS.json').write_text(json.dumps(record,indent=2)+'\n');print('Production renders complete',flush=True)
