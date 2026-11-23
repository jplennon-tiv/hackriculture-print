from pathlib import Path
from PIL import Image,ImageCms,ImageDraw,ImageFont
import json,numpy as np,subprocess
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';P=D/'intent-review';P.mkdir(exist_ok=True)
icc=R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc';s=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB'));(P/'sRGB.icc').write_bytes(s.tobytes())
target=ImageCms.getOpenProfile(str(icc)); transforms=[ImageCms.buildTransform(s,target,'RGB','CMYK',renderingIntent=1,flags=f) for f in [0,ImageCms.Flags.BLACKPOINTCOMPENSATION]]
back=ImageCms.buildTransform(target,s,'CMYK','RGB',renderingIntent=1)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',20);records=[]
source=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf'
exe='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
for f in [149,154,155,162,168]:
 out=P/f'folio-{f:03}-source';subprocess.run([exe,'-f',str(f),'-l',str(f),'-singlefile','-r','130','-png','-displayprofile',str(P/'sRGB.icc'),'-defaultrgbprofile',str(P/'sRGB.icc'),str(source),str(out)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 im=Image.open(out.with_suffix('.png')).convert('RGB');cms=[ImageCms.applyTransform(im,t) for t in transforms];screens=[ImageCms.applyTransform(c,back) for c in cms];arr=[np.asarray(x,dtype=np.int16) for x in screens];delta=np.abs(arr[0]-arr[1]);carr=np.asarray(cms[0],dtype=np.int16)
 record={'folio':f,'meanAbsRGBDifferenceBpcVsHistorical':float(delta.mean()),'maxRGBDifference':int(delta.max()),'fractionPixelsDifferenceOver8':float(np.any(delta>8,axis=2).mean()),'maxSampledInkPercentNoBpc':float(np.max(carr.sum(axis=2))*100/255)};records.append(record)
 tile=[]
 for x in [im]+screens:x=x.copy();x.thumbnail((410,540),Image.Resampling.LANCZOS);tile.append(x)
 sheet=Image.new('RGB',(1290,610),'#e2e2e2');dr=ImageDraw.Draw(sheet)
 for j,(x,label) in enumerate(zip(tile,['Source RGB','Historical relative / no BPC','Relative with BPC'])):sheet.paste(x,(16+j*430,50));dr.text((16+j*430,12),label,font=font,fill='#173e2c')
 sheet.save(P/f'folio-{f:03}-comparison.jpg',quality=95,subsampling=0);print(record,flush=True)
colours={'cream':[255,248,233],'ink':[23,62,44],'forest':[6,77,50],'orange':[255,120,31],'deepOrange':[164,64,7],'peach':[255,225,183],'lightGreen':[214,234,155]}
result={'method':'Source pages rendered with Poppler into explicit sRGB with embedded source ICC honoured; comparison is RGB→target CMYK relative colourimetric with/without BPC, then target CMYK→sRGB relative display conversion. No paper-white simulation. Not prediction of physical print. No source mutation.','lcmsVersion':ImageCms.core.littlecms_version,'pages':records,'palette':{}}
for name,rgb in colours.items():result['palette'][name]={'rgb':rgb,'cmykHistorical':list(ImageCms.applyTransform(Image.new('RGB',(1,1),tuple(rgb)),transforms[0]).getpixel((0,0))),'cmykBpc':list(ImageCms.applyTransform(Image.new('RGB',(1,1),tuple(rgb)),transforms[1]).getpixel((0,0)))}
(D/'INTENT-COMPARISON.json').write_text(json.dumps(result,indent=2)+'\n')
