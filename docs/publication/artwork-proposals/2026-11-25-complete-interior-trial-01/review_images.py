"""Fast bounded image recompression for this verified review PDF."""
import base64,io,struct,zlib
from PIL import Image
from pypdf.generic import EncodedStreamObject,NameObject,NumberObject,ArrayObject

def image_objects(resources):
 xs=resources.get("/XObject",{})
 if hasattr(xs,"get_object"):xs=xs.get_object()
 for ref in xs.values():
  obj=ref.get_object()
  if obj.get("/Subtype")=="/Image":yield ref,obj
  elif obj.get("/Subtype")=="/Form":yield from image_objects(obj.get("/Resources",{}))

def decode_image(obj):
 cs=str(obj.get("/ColorSpace"));mode={"/DeviceRGB":"RGB","/DeviceCMYK":"CMYK","/DeviceGray":"L"}.get(cs)
 if not mode or obj.get("/BitsPerComponent")!=8 or "/SMask" in obj or "/Mask" in obj:return None
 size=(int(obj["/Width"]),int(obj["/Height"]))
 if size[0]*size[1]*len(mode)>160*1024*1024:raise ValueError("Unexpected source image dimensions")
 filt=obj.get("/Filter");pars=obj.get("/DecodeParms",{})
 if str(filt)=="/FlateDecode" and pars.get("/Predictor")==15 and pars.get("/Colors",1)==len(mode) and pars.get("/Columns")==size[0]:
  # PDF PNG prediction uses PNG scanline filters. Let libpng decode them in C.
  def chunk(kind,data):return struct.pack(">I",len(data))+kind+data+struct.pack(">I",zlib.crc32(kind+data)&0xffffffff)
  colour={"RGB":2,"CMYK":6,"L":0}[mode]
  png=b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack(">IIBBBBB",*size,8,colour,0,0,0))+chunk(b"IDAT",obj._data)+chunk(b"IEND",b"")
  decoded=Image.open(io.BytesIO(png));decoded.load()
  im=Image.frombytes(mode,size,decoded.tobytes()) if mode=="CMYK" else decoded
 elif str(filt)=="/DCTDecode":
  im=Image.open(io.BytesIO(obj._data));im.load();return im
 else:
  im=Image.frombytes(mode,size,obj.get_data())
 if obj.get("/Decode")==[1,0]*len(mode):im=im.point([255-i for i in range(256)]*len(mode))
 elif obj.get("/Decode") not in [None,[0,1]*len(mode)]:raise ValueError("Unexpected decode array")
 return im

def recompress(writer,replaced_folios):
 seen=set();records=[]
 for n,pg in enumerate(writer.pages,1):
  for ref,obj in list(image_objects(pg["/Resources"])):
   if ref.idnum in seen:continue
   seen.add(ref.idnum)
   if min(int(obj["/Width"]),int(obj["/Height"]))<200:continue
   im=decode_image(obj)
   if im is None:continue
   original=im.size
   if n not in replaced_folios and max(im.size)>2906:im.thumbnail((2906,2906),Image.Resampling.LANCZOS)
   b=io.BytesIO();im.save(b,format="JPEG",quality=94,subsampling=0,optimize=True)
   new=EncodedStreamObject();new._data=b.getvalue()
   for k,v in obj.items():
    if k not in ["/Length","/Filter","/DecodeParms","/Decode","/Width","/Height"]:new[k]=v
   new[NameObject("/Filter")]=NameObject("/DCTDecode")
   new[NameObject("/Width")]=NumberObject(im.width);new[NameObject("/Height")]=NumberObject(im.height)
   if im.mode=="CMYK":new[NameObject("/Decode")]=ArrayObject([NumberObject(x) for x in [1,0]*4])
   writer._objects[ref.idnum-1]=new;new.indirect_reference=ref
   records.append({"folio":n,"original_pixels":list(original),"review_pixels":list(im.size),"mode":im.mode,"quality":94,"new_page":n in replaced_folios})
  if n%20==0:print("Optimised",n,"of 174 pages",flush=True)
 return records

