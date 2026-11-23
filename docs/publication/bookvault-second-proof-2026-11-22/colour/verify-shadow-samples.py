from pathlib import Path
from PIL import Image,ImageCms,ImageChops
from pypdf import PdfReader
import pypdf.filters
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=300000000
import json,hashlib,gc
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';I=R/'docs/publication/bookvault-second-proof-2026-11-22/interior';regions=json.loads((D/'SELECTIVE-PHOTO-BPC.json').read_text())['regions'];pdf=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Print-Shadow-Samples.pdf';r=PdfReader(pdf)
p=ImageCms.getOpenProfile(str(R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'));s=ImageCms.createProfile('sRGB');base=ImageCms.buildTransform(s,p,'RGB','CMYK',renderingIntent=1);bpc=ImageCms.buildTransform(s,p,'RGB','CMYK',renderingIntent=1,flags=ImageCms.Flags.BLACKPOINTCOMPENSATION);records=[]
for i,reg in enumerate(regions):
 raw=Image.open(I/'colour-work/retained-photo-inputs'/f"page-{reg['folio']}.png").convert('RGB');baseline=ImageCms.applyTransform(raw,base);image_objects=[ref.get_object() for ref in r.pages[i]['/Resources']['/XObject'].values() if ref.get_object().get('/Subtype')=='/Image'];ob=max(image_objects,key=lambda x:int(x['/Width'])*int(x['/Height']));assert str(ob['/ColorSpace'])=='/DeviceCMYK';actual=Image.frombytes('CMYK',(int(ob['/Width']),int(ob['/Height'])),ob.get_data())
 assert actual.mode=='CMYK' and actual.size==raw.size,(actual.mode,actual.size,raw.size)
 x0,y0,x1,y1=reg['pixelCentreBox600dpiPillow'];expected=ImageCms.applyTransform(raw.crop((x0,y0,x1,y1)),bpc);patchActual=actual.crop((x0,y0,x1,y1));assert ImageChops.difference(expected,patchActual).getbbox() is None
 outside=[(0,0,raw.width,y0),(0,y1,raw.width,raw.height),(0,y0,x0,y1),(x1,y0,raw.width,y1)];assert all(ImageChops.difference(actual.crop(bb),baseline.crop(bb)).getbbox() is None for bb in outside)
 diff=ImageChops.difference(actual,baseline);record={'folio':reg['folio'],'artSizePixels':list(raw.size),'selectedPixelBox':[x0,y0,x1,y1],'actualChangedBounds':diff.getbbox(),'outsideAllByteIdentical':True,'insideExactlyMatchesIndependentBpcTransform':True,'actualArtSha256':hashlib.sha256(actual.tobytes()).hexdigest()};records.append(record);print(record,flush=True)
 raw.close();baseline.close();actual.close();diff.close();gc.collect()
res={'pdf':str(pdf.relative_to(R)),'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'method':'Independent same-profile LittleCMS transforms of retained source sRGB art; compare actual PDF CMYK image samples, with full four-sided outside-region byte checks. Native text checked separately by production agent.','pages':records,'visualRenderDpi':150,'visualReview':'All three actual PDF pages inspected through explicit sRGB display and FOGRA39 default CMYK profiles; useful photo texture retained and no visible photo-boundary artefacts. Native glyph position approval is separate and withheld pending the root-reported layout check.'};(D/'ACTUAL-SHADOW-SAMPLE-CHECKS.json').write_text(json.dumps(res,indent=2)+'\n')
