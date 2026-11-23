"""Derive real top/right bleed from retained native paths; never change trim layout.

CLI prepares separate overlay/sample PDFs for explicitly named folios. No source
or production PDF is overwritten. Artwork remains at its original transform.
"""
from pathlib import Path
import argparse,hashlib,io,json,subprocess,zlib,copy,concurrent.futures,gc
import numpy as np
from PIL import Image,ImageCms
from pypdf import PdfReader,PdfWriter
from pypdf.generic import (NameObject,DecodedStreamObject,DictionaryObject,ArrayObject,
 FloatObject,NumberObject,ContentStream,RectangleObject)
ROOT=Path(__file__).resolve().parents[4];DOC=Path(__file__).resolve().parent
SOURCE=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
BASE=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf'
PROD=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf'
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
DISPLAY=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/interior/colour-work/render-sRGB.icc'
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
MM=72/25.4;B=3*MM;U=.2*MM;W=185*MM;H=240*MM;MW=W+2*B;MH=H+2*B
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
FLOATS=lambda vals:ArrayObject([FloatObject(v) for v in vals])

def expanded_native(master,baseline,folio,target):
 writer=PdfWriter();p=writer.add_page(master.pages[folio+1]);counts={'pageDeviceClips':0,'headerDeviceClips':0,'pointPageClips':0,'fullPageFormBBoxes':0,'fullPagePaintedRectangles':0,'fullPagePaintedPolygons':0};seen=set()
 def modify(stream,res):
  cs=ContentStream(stream,writer);ops=cs.operations
  for i,(v,op) in enumerate(ops):
   # Recover the real background too: original Chrome paper rectangles can
   # extend farther than the coloured page rectangle because of CSS rounding.
   # Extending clips alone exposes that white/grey underlay as a narrow fringe.
   if op==b're' and i+1<len(ops) and ops[i+1][1] in (b'f',b'f*',b'F'):
    x,y,w,h=map(float,v)
    if abs(x)<.01 and abs(y)<.01 and 698<=w<=701 and 906<=h<=909:
     extra=12.8 #40Chromium device units under the3.125CSS transform.
     ops[i]=(FLOATS([x,-extra,w+extra,h+extra]),op);counts['fullPagePaintedRectangles']+=1
   if op==b'm' and i+5<len(ops) and [o for _,o in ops[i:i+6]]==[b'm',b'l',b'l',b'l',b'h',b'f']:
    points=[tuple(map(float,ops[j][0])) for j in range(i,i+4)];xs=sorted(set(x for x,y in points));ys=sorted(set(y for x,y in points))
    if len(xs)==2 and len(ys)==2 and abs(xs[0])<.01 and abs(xs[1]-W)<1 and abs(ys[0])<1.5 and abs(ys[1]-H)<1:
     # Preserve lower/left edges and the original fill state; extend actual
     # native page backgrounds beyond the new top/right media boundaries.
     for j,(x,y) in zip(range(i,i+4),points):ops[j]=(FLOATS([W+B+1 if x==xs[1] else x,H+B+1 if y==ys[1] else y]),ops[j][1])
     counts['fullPagePaintedPolygons']+=1
   if op==b're' and i+1<len(ops) and ops[i+1][1] in (b'W',b'W*'):
    x,y,w,h=map(float,v);margin=40.0 #9.6pt at Chromium0.24 scale, >3mm requested.
    if abs(x)<.01 and abs(y)<.01 and 2182<=w<=2186 and 2831<=h<=2836:
     ops[i]=(FLOATS([x,-margin,w+margin,h+margin]),op);counts['pageDeviceClips']+=1
    elif 0<=x<250 and abs(y)<.01 and 2182<=x+w<=2186 and 250<=h<=600:
     # Preserve existing header bottom and left: extend only top/right.
     ops[i]=(FLOATS([x,-margin,w+margin,h+margin]),op);counts['headerDeviceClips']+=1
    elif abs(x)<.01 and abs(y)<.01 and abs(w-W)<.1 and abs(h-H)<.1:
     ops[i]=(FLOATS([0,0,w+B,h+B]),op);counts['pointPageClips']+=1
   if op==b'Do':
    ob=res['/XObject'][v[0]].get_object()
    if hasattr(ob,'get') and ob.get('/Subtype')=='/Form' and id(ob) not in seen:
     seen.add(id(ob));box=list(map(float,ob['/BBox']))
     if abs(box[0])<.01 and abs(box[1])<.01 and 2182<=box[2]<=2186 and 2831<=box[3]<=2836:
      ob[NameObject('/BBox')]=RectangleObject([0,-40,box[2]+40,box[3]]);counts['fullPageFormBBoxes']+=1
     rr=ob.get('/Resources',res).get_object();new=modify(ob,rr);ob.set_data(new.get_data())
  cs.operations=ops;new=DecodedStreamObject();new.set_data(cs.get_data());return new
 original=p.get_contents().get_data();new=modify(p.get_contents(),p['/Resources'])
 if 8<=folio<=94:
  assert counts['headerDeviceClips']>=1,(folio,'Unrecognised main-guide header clip structure',counts)
  assert counts['pageDeviceClips']>=1 and counts['fullPageFormBBoxes']>=1,(folio,'Unrecognised outer page structure',counts)
  assert counts['fullPagePaintedRectangles']>=1,(folio,'Missing full-page painted background',counts)
 else:
  assert 98<=folio<=144,(folio,'Not a supported opener or Troubles page')
  assert counts['fullPagePaintedPolygons']>=1,(folio,'Missing native full-page background path',counts)
 # Match this family's native edge/background, not a universal cream.
 ob=baseline.pages[folio-1]['/Resources']['/XObject']['/VG_BLEED_TOP'].get_object();a=np.frombuffer(ob.get_data(),np.uint8).reshape((int(ob['/Height']),int(ob['/Width']),3));rgb=a[-1,40].tolist()
 prefix=f'q {rgb[0]/255:.12f} {rgb[1]/255:.12f} {rgb[2]/255:.12f} rg 0 0 {MW:.12f} {MH:.12f} re f Q\nq 1 0 0 1 {B:.12f} {B:.12f} cm\n'.encode()
 st=DecodedStreamObject();st.set_data(prefix+new.get_data()+b'\nQ\n');p[NameObject('/Contents')]=writer._add_object(st)
 p.mediabox=RectangleObject([0,0,MW,MH]);p.cropbox=RectangleObject(p.mediabox);p.trimbox=RectangleObject([B,B,W+B,H+B]);p.bleedbox=RectangleObject(p.mediabox)
 writer.write(target);return {'folio':folio,'clipEdits':counts,'backgroundRGB':rgb,'sourcePage':folio+2,'sourceContentSHA256':hashlib.sha256(original).hexdigest(),'preserved':'All image/path transforms and existing header-bottom/left limits; edited only outer/top/right clipping, declared page/form bounds, and matching full-page background extents to cover historical white/grey canvas rounding.'}

def image_stream(img):
 stream=DecodedStreamObject();stream.set_data(img.tobytes());stream[NameObject('/Type')]=NameObject('/XObject');stream[NameObject('/Subtype')]=NameObject('/Image');stream[NameObject('/Width')]=NumberObject(img.width);stream[NameObject('/Height')]=NumberObject(img.height);stream[NameObject('/BitsPerComponent')]=NumberObject(8);stream[NameObject('/ColorSpace')]=NameObject('/DeviceCMYK');return stream.flate_encode()

def overlay(writer,full_cmyk):
 p=writer.add_blank_page(MW,MH);p.trimbox=RectangleObject([B,B,W+B,H+B]);p.bleedbox=RectangleObject(p.mediabox);p.cropbox=RectangleObject(p.mediabox)
 w,h=full_cmyk.size;n_top=int(np.ceil((B+U)*h/MH));n_right=int(np.ceil((B+U)*w/MW));top=full_cmyk.crop((0,0,w,n_top));right=full_cmyk.crop((w-n_right,0,w,h));objects=DictionaryObject();objects[NameObject('/Top')]=writer._add_object(image_stream(top));objects[NameObject('/Right')]=writer._add_object(image_stream(right));p[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):objects})
 # Raster crops keep exactly the full-page pixel grid. Strict PDF clipping
 # limits painting to bleed plus the already-synthetic0.2mm top/right repair.
 th=n_top*MH/h;rw=n_right*MW/w
 content=(f'q 0 {H+B-U:.12f} {MW:.12f} {B+U:.12f} re W n {MW:.12f} 0 0 {th:.12f} 0 {MH-th:.12f} cm /Top Do Q\n'
          f'q {W+B-U:.12f} {B:.12f} {B+U:.12f} {H-U:.12f} re W n {rw:.12f} 0 0 {MH:.12f} {MW-rw:.12f} 0 cm /Right Do Q\n').encode()
 st=DecodedStreamObject();st.set_data(content);p[NameObject('/Contents')]=writer._add_object(st);return p,{'fullRasterPixels':[w,h],'topStripPixels':[w,n_top],'rightStripPixels':[n_right,h],'syntheticTrimRepairMM':0.2,'topClipPoints':[0,H+B-U,MW,B+U],'rightClipPoints':[W+B-U,B,B+U,H-U]}

def attach_overlay(writer,source,overlay_page):
 p=writer.add_page(source);raw=p.get_contents().get_data();form=DecodedStreamObject();form.set_data(overlay_page.get_contents().get_data());form[NameObject('/Type')]=NameObject('/XObject');form[NameObject('/Subtype')]=NameObject('/Form');form[NameObject('/BBox')]=RectangleObject([0,0,MW,MH]);form[NameObject('/Resources')]=overlay_page['/Resources'].clone(writer)
 res=DictionaryObject(dict(p['/Resources']));xobs=DictionaryObject(dict(res.get('/XObject',{})));name=NameObject('/VG_TrueHeaderBleed');assert name not in xobs;xobs[name]=writer._add_object(form);res[NameObject('/XObject')]=xobs;p[NameObject('/Resources')]=res
 st=DecodedStreamObject();st.set_data(raw+b'\nq /VG_TrueHeaderBleed Do Q\n');p[NameObject('/Contents')]=writer._add_object(st);assert p.get_contents().get_data().startswith(raw);return p

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--folios',nargs='+',type=int,required=True);parser.add_argument('--label',default='sample');parser.add_argument('--overlay-only',action='store_true');parser.add_argument('--workers',type=int,default=1);args=parser.parse_args();work=DOC/('native-outward-'+args.label);work.mkdir(exist_ok=True)
 assert len(set(args.folios))==len(args.folios)
 assert sha(SOURCE)=='f87ea66a3dcd06314e518e627c54e574dabac31a31a3035aba69013ad8e1f682','Native master changed'
 assert sha(PROD)=='341ce74932cd81f6a8cc838b742ec7095e471d0ee7d9fcb7b247dd1b417e6b47','Production input changed'
 master=PdfReader(SOURCE);baseline=PdfReader(BASE);production=PdfReader(PROD);ow=PdfWriter();sw=PdfWriter();bw=PdfWriter();records=[]
 def convert(job):
  f,native,rec=job;prefix=native.with_suffix('')
  subprocess.run([POPPLER,'-r','600','-singlefile','-png','-displayprofile',str(DISPLAY),'-defaultrgbprofile',str(DISPLAY),str(native),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  transform=ImageCms.buildTransform(ImageCms.getOpenProfile(str(DISPLAY)),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
  rgb=Image.open(prefix.with_suffix('.png')).convert('RGB');cmyk=ImageCms.applyTransform(rgb,transform);one=PdfWriter();op,detail=overlay(one,cmyk);data=io.BytesIO();one.write(data);rec.update(detail);rec['expandedNativeSHA256']=sha(native);rec['expandedSRGBRasterSHA256']=sha(prefix.with_suffix('.png'));rgb.close();cmyk.close()
  if args.overlay_only:native.unlink();prefix.with_suffix('.png').unlink()
  return f,data.getvalue(),rec
 results={}
 # PDF parsing/cloning is serial; independent Poppler/LCMS workers own only
 # their small native page and image buffers. Readers are never shared across
 # concurrent mutation or lazy stream parsing.
 with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(4,args.workers))) as pool:
  pending=[]
  for f in args.folios:
   native=work/f'native-expanded-{f:03}.pdf';rec=expanded_native(master,baseline,f,native);pending.append(pool.submit(convert,(f,native,rec)))
  for future in concurrent.futures.as_completed(pending):
   f,data,rec=future.result();results[f]=(data,rec);print('Derived native outward strips',f,rec['clipEdits'],flush=True)
 for index,f in enumerate(args.folios):
  data,rec=results[f];one=PdfReader(io.BytesIO(data));op=ow.add_page(one.pages[0]);rec['overlayPage']=index+1;records.append(rec)
  if not args.overlay_only:attach_overlay(sw,production.pages[f-1],op);bw.add_page(production.pages[f-1])
 for w in ([ow] if args.overlay_only else [ow,sw,bw]):
  w.root_object[NameObject('/OutputIntents')]=production.trailer['/Root']['/OutputIntents'].clone(w);w.pdf_header='%PDF-1.4'
 out=ROOT/'output/pdf/header-placement-review-2026-11-23/bleed';out.mkdir(parents=True,exist_ok=True)
 opath=work/'Native-Outward-Bleed-Overlays.pdf';ow.write(opath);spath=None;before=None
 if not args.overlay_only:
  for index,f in enumerate(args.folios):sw.set_page_label(index,index,style='/D',start=f);bw.set_page_label(index,index,style='/D',start=f)
  spath=out/f'Vegetable-Guru-Native-Outward-Bleed-{args.label}.pdf';before=work/'Before-Header-Bleed.pdf';sw.write(spath);bw.write(before)
 manifest={'sourceMasterSHA256':sha(SOURCE),'sourceProductionSHA256':sha(PROD),'overlayPDF':str(opath.relative_to(ROOT)),'overlaySHA256':sha(opath),'samplePDF':str(spath.relative_to(ROOT)) if spath else None,'sampleSHA256':sha(spath) if spath else None,'beforePDF':str(before.relative_to(ROOT)) if before else None,'profileSHA256':sha(PROFILE),'method':'Retained native paths with outer/top/right clips and actual full-page painted backgrounds expanded, all transforms and header-bottom/left limits preserved. Poppler600dpi honours source ICCs into explicit sRGB, followed by original FOGRA39 relative1/noBPC. Only narrow opaque CMYK top/right raster strips are supplied, clipped to3mm bleed plus the previously synthesised0.2mm top/right edge-repair band. All underlying production streams stay byte-identical; no approved artwork is moved or rescaled, and allcontent farther inside the protectedtrim region is untouched.','reconstructibleInputs':'Full600dpi RGB rasters and expanded native derivation pages removed after strip extraction for overlay-only runs; hashes retained. Two selected samples remain separately.','pages':records}
 (work/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n');(work/'FOLIOS.json').write_text(json.dumps(args.folios)+'\n');print(opath,flush=True)
if __name__=='__main__':main()
