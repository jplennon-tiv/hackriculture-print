from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageCms
from pypdf import PdfReader,overwrite_configuration
overwrite_configuration(maximum_declared_stream_length=400_000_000,zlib_maximum_output_length=400_000_000,stream_decoding_work_maximum_length=800_000_000)
import pypdf.filters
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=400_000_000
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';C=R/'docs/publication/bookvault-second-proof-2026-11-22/cover';report=json.loads((C/'COLOUR-CHECKS.json').read_text());pdf=R/report['output']['file'];assert hashlib.sha256(pdf.read_bytes()).hexdigest()==report['output']['sha256'];r=PdfReader(pdf);icc=R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc';embedded=r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data();assert embedded==icc.read_bytes()
obs=[]
def walk(res):
 for ref in res.get('/XObject',{}).values():
  ob=ref.get_object()
  if ob.get('/Subtype')=='/Image':obs.append(ob)
  elif ob.get('/Subtype')=='/Form':walk(ob.get('/Resources',res))
walk(r.pages[0]['/Resources']);assert len(obs)==1;ob=obs[0];assert str(ob['/ColorSpace'])=='/DeviceCMYK';a=np.frombuffer(ob.get_data(),np.uint8).reshape((int(ob['/Height']),int(ob['/Width']),4))
raw=Image.open(R/'output/pdf/bookvault-second-proof-2026-11-22/cover/cover-art-600dpi.png').convert('RGB');assert raw.size==(a.shape[1],a.shape[0]);p=ImageCms.getOpenProfile(str(icc));base=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),p,'RGB','CMYK',renderingIntent=1);bpc=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),p,'RGB','CMYK',renderingIntent=1,flags=8192)
regions=report['selective_photo_correction']['photos'];boxes=[x['rgb_raster_crop_px'] for x in regions];proofs=[]
for item,box in zip(regions,boxes):
 expected=np.asarray(ImageCms.applyTransform(raw.crop(tuple(box)),bpc));l,t,rr,b=box;assert np.array_equal(a[t:b,l:rr],expected);proofs.append({'photo':item['photo'],'pixelBox':box,'exactIndependentBpcMatch':True})
h1=hashlib.sha256();h2=hashlib.sha256();pixels=0
for top in range(0,raw.height,64):
 bottom=min(top+64,raw.height);baseline=np.asarray(ImageCms.applyTransform(raw.crop((0,top,raw.width,bottom)),base));actual=a[top:bottom];keep=np.ones(baseline.shape[:2],bool)
 for l,t,rr,b in boxes:
  if top<b and bottom>t:keep[max(0,t-top):min(bottom-top,b-top),l:rr]=False
 assert np.array_equal(baseline[keep],actual[keep]);h1.update(baseline[keep].tobytes());h2.update(actual[keep].tobytes());pixels+=int(keep.sum())
result={'file':str(pdf.relative_to(R)),'sha256':report['output']['sha256'],'bytes':pdf.stat().st_size,'profileSha256':hashlib.sha256(embedded).hexdigest(),'profileByteIdenticalToAcceptedFirstProof':True,'independentPhotoChecks':proofs,'outsidePhotoPixelsCompared':pixels,'outsidePhotoByteIdentical':True,'outsidePhotoBaselineSha256':h1.hexdigest(),'outsidePhotoActualSha256':h2.hexdigest(),'visualReview':{'wholeWrap':True,'renderDpi':150,'renderer':'Poppler with explicit sRGB display and FOGRA39 default CMYK','result':'Clear genuine vector lettering and native text; both corrected rear tiles retain useful shadow detail; no visible photo-boundary artefacts; front harvest and warm background retain intended contrast.'},'producerEvidence':{'genuineFontOutlineGroups':report['original_font_outline_groups'],'glyphGeometryDeltaPt':report['maximum_native_glyph_geometry_delta_pt'],'activeTransparency':report['inventory']['transparency'],'artRecomposition600Dpi':report['art_preservation_600dpi'],'measuredMaximumInkPercent':report['final_structural_check']['maximum_total_ink_percent']},'scope':'Production colour review complete for this exact cover. No physical colour guarantee, supplier upload approval or metadata approval.'};(D/'FINAL-COVER-COLOUR-CHECKS.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
