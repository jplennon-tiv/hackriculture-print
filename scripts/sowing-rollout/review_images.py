"""Compress large RGB illustrations in the review bundle, retaining native text and alpha."""
from io import BytesIO
from PIL import Image
from pypdf.generic import NameObject, StreamObject

def compress_art(page, seen):
    def walk(resources):
        for ref in resources.get('/XObject',{}).get_object().values() if '/XObject' in resources else []:
            obj=ref.get_object()
            identity=obj.indirect_reference.idnum
            if identity in seen:continue
            seen.add(identity)
            if obj.get('/Subtype')=='/Form':
                if '/Resources' in obj:walk(obj['/Resources'])
                continue
            if obj.get('/Subtype')!='/Image' or obj.get('/Filter')!='/FlateDecode' or obj.get('/BitsPerComponent')!=8 or '/DecodeParms' in obj:continue
            w,h=int(obj['/Width']),int(obj['/Height'])
            if w*h<150000:continue
            cs=obj.get('/ColorSpace')
            rgb=cs=='/DeviceRGB' or (isinstance(cs,list) and cs[0]=='/ICCBased' and cs[1].get_object().get('/N')==3)
            if not rgb:continue
            pixels=obj.get_data()
            if len(pixels)!=w*h*3:continue
            buf=BytesIO();Image.frombytes('RGB',(w,h),pixels).save(buf,'JPEG',quality=88,subsampling=0,optimize=True)
            StreamObject.set_data(obj,buf.getvalue())
            obj[NameObject('/Filter')]=NameObject('/DCTDecode')
            obj.decoded_self=None
    walk(page['/Resources'])
