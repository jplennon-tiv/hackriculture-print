from pathlib import Path
from PIL import Image,ImageCms,ImageDraw,ImageFont
import numpy as np,json
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';P=D/'intent-review';s=ImageCms.ImageCmsProfile(str(P/'sRGB.icc'));p=ImageCms.getOpenProfile(str(R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'))
t=[ImageCms.buildTransform(s,p,'RGB','CMYK',renderingIntent=1,flags=f) for f in [0,ImageCms.Flags.BLACKPOINTCOMPENSATION]];back=ImageCms.buildTransform(p,s,'CMYK','RGB',renderingIntent=1)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',23)
areas=[(154,'dark-compost-lid',(355,242,562,350)),(155,'compost-lid',(240,277,435,408)),(168,'raised-bed-shadows',(66,678,437,878)),(162,'pale-mesh',(355,318,580,442))]
records=[]
for folio,name,box in areas:
 im=Image.open(P/f'folio-{folio:03}-source.png').convert('RGB');ims=[im]+[ImageCms.applyTransform(ImageCms.applyTransform(im,x),back) for x in t];ims=[x.crop(box) for x in ims]
 w,h=ims[0].size;scale=2;sheet=Image.new('RGB',(w*scale*3+60,h*scale+80),'#e2e2e2');dr=ImageDraw.Draw(sheet)
 for i,(x,label) in enumerate(zip(ims,['Source RGB','Historical relative','Relative + BPC'])):sheet.paste(x.resize((w*scale,h*scale),Image.Resampling.NEAREST),(20+i*w*scale,65));dr.text((20+i*w*scale,15),label,font=font,fill='#173e2c')
 sheet.save(P/f'{name}-comparison.png')
 a=[np.asarray(x,dtype=float) for x in ims];lum=[x@np.array([.2126,.7152,.0722]) for x in a]
 records.append({'folio':folio,'name':name,'boxPxAt130Dpi':box,'percentileLuminance':[[float(v) for v in np.percentile(y,[1,5,10,50,90])] for y in lum]})
(D/'SHADOW-DETAIL-STUDY.json').write_text(json.dumps(records,indent=2)+'\n')
