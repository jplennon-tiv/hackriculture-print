from pathlib import Path
import hashlib,json,subprocess,gc
from PIL import Image,ImageDraw,ImageFont
import numpy as np
from pypdf import PdfReader,overwrite_configuration
overwrite_configuration(maximum_declared_stream_length=400_000_000,zlib_maximum_output_length=400_000_000,stream_decoding_work_maximum_length=800_000_000)
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';P=D/'production';I=R/'docs/publication/bookvault-second-proof-2026-11-22/interior/colour-work'
final=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf'
before=I/'interior-before-cream.pdf';plan=json.loads((D/'CREAM-BACKGROUND-CORRECTION.json').read_text());assert hashlib.sha256(before.read_bytes()).hexdigest()==plan['sourceSha256']
src=PdfReader(before);dst=PdfReader(final);checks=[]
def art(page):
 return next(x.get_object() for x in page['/Resources']['/XObject'].values() if x.get_object().get('/Subtype')=='/Image')
for rec in plan['regions']:
 f=rec['folio'];x=art(src.pages[f-1]);y=art(dst.pages[f-1]);a=x.get_data();b=y.get_data();assert hashlib.sha256(a).hexdigest()==rec['sourceArtSha256']
 aa=np.frombuffer(a,np.uint8).reshape(rec['sourceSize'][1],rec['sourceSize'][0],4);bb=np.frombuffer(b,np.uint8).reshape(aa.shape);mask=np.array(Image.open(R/rec['mask']).convert('L'))>0
 assert int(mask.sum())==rec['selectedBackgroundPixels'];assert np.all(aa[mask]==rec['oldCmyk']);assert np.all(bb[mask]==rec['newCmyk']);assert np.array_equal(aa[~mask],bb[~mask])
 assert src.pages[f-1].get_contents().get_data()==dst.pages[f-1].get_contents().get_data()
 for ex in rec['photoExclusions']:
  l,t,r,bot=ex['excludedRasterBoxWith2pxGuard'];assert not mask[t:bot,l:r].any()
 checks.append({'folio':f,'selectedPixels':int(mask.sum()),'exactTargetCmyk':rec['newCmyk'],'allOutsidePixelsByteIdentical':True,'allPhotoPlacementsExcluded':True,'nativeContentBytesIdentical':True,'finalArtSha256':hashlib.sha256(b).hexdigest()})
 del a,b,aa,bb,mask;x.decoded_self=None;y.decoded_self=None;gc.collect()
(D/'FINAL-CREAM-INDEPENDENT-CHECKS.json').write_text(json.dumps({'finalSha256':hashlib.sha256(final.read_bytes()).hexdigest(),'checks':checks},indent=2)+'\n')
exe='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm';common=['-displayprofile',str(D/'intent-review/sRGB.icc'),'-defaultcmykprofile',str(R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc')]
for f in [7,97,145]:
 for dpi,fmt,folder in [(72,'jpeg','pages'),(150,'png','detail')]:
  subprocess.run([exe,'-f',str(f),'-l',str(f),'-singlefile','-r',str(dpi),'-'+fmt,*common,str(final),str(P/folder/f'folio-{f:03}')],check=True,stderr=subprocess.DEVNULL)
for f in [154,155,168]:
 subprocess.run([exe,'-f',str(f),'-l',str(f),'-singlefile','-r','150','-png',*common,str(I/'interior-cmyk-no-bpc.pdf'),str(P/'detail'/f'before-photo-{f:03}')],check=True,stderr=subprocess.DEVNULL)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',22);small=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',17)
for start in [1,97,145]:
 sheet=Image.new('RGB',(1320,1800),'#e2e2e2');dr=ImageDraw.Draw(sheet);dr.text((24,16),f'Final CMYK folios {start}-{min(start+15,174)} | FOGRA39 to sRGB display',font=font,fill='#173e2c')
 for j,f in enumerate(range(start,min(start+16,175))):
  im=Image.open(P/'pages'/f'folio-{f:03}.jpg');im.thumbnail((300,389),Image.Resampling.LANCZOS);xx=24+j%4*324;yy=64+j//4*431;sheet.paste(im,(xx,yy));dr.text((xx,yy+392),f'P{f}',font=small,fill='#173e2c')
 sheet.save(P/'contacts'/f'contact-{start:03}.jpg',quality=94,subsampling=0)
receipt=json.loads((D/'PRODUCTION-RENDER-CHECKS.json').read_text());receipt['interiorSha256']=hashlib.sha256(final.read_bytes()).hexdigest();receipt['refreshedAfterCreamCorrection']=[7,97,145];receipt['unchangedOtherPagesEvidence']='../interior/CREAM-MATCH-CHECK.json';(D/'PRODUCTION-RENDER-CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n');print('Final cream bytes independently verified and refreshed views rendered.')
