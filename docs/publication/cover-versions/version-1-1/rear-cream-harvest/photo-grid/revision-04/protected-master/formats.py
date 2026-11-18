"""Lossless, bounded PSD/OpenRaster layers for the registered rear-cover artwork."""
from io import BytesIO
from struct import pack
from xml.etree import ElementTree as E
from zipfile import ZipFile, ZIP_STORED
import zlib

def png(image):
    out=BytesIO()
    image.save(out,'PNG')
    return out.getvalue()

def psd(path, layers, composite, ppi):
    u16=lambda n:pack('>H',n)
    u32=lambda n:pack('>I',n)
    sized=lambda b:u32(len(b))+b
    records=[]; channels=[]
    for name,x,y,im,locked in reversed(layers):
        w,h=im.size; planes=[]
        rgb=im.convert('RGBA')
        for i,band in enumerate(rgb.split()):
            data=u16(2)+zlib.compress(band.tobytes(),6)
            planes.append(pack('>hI',i if i<3 else -1,len(data)))
            channels.append(data)
        text=name.encode('ascii','replace')[:255]
        label=bytes([len(text)])+text
        extra=bytes(8)+label+bytes((-len(label))%4)
        if locked:
            extra+=b'8BIMlspf'+u32(4)+u32(7)
        rec=pack('>iiiiH',y,x,y+h,x+w,4)+b''.join(planes)
        rec+=b'8BIMnorm'+bytes([255,0,int(locked),0])+sized(extra)
        records.append(rec)
    layers_data=pack('>h',len(layers))+b''.join(records+channels)
    layers_data+=bytes(len(layers_data)%2)
    res=pack('>IHHIHH',round(ppi*65536),1,1,round(ppi*65536),1,1)
    resources=b'8BIM'+u16(1005)+bytes(2)+sized(res)
    w,h=composite.size
    with path.open('wb') as f:
        f.write(b'8BPS'+u16(1)+bytes(6)+pack('>HIIHH',3,h,w,8,3))
        f.write(u32(0)+sized(resources)+sized(sized(layers_data)+u32(0))+u16(0))
        for band in composite.convert('RGB').split():f.write(band.tobytes())

def ora(path,layers,composite,ppi):
    w,h=composite.size
    root=E.Element('image',{'version':'0.0.5','w':str(w),'h':str(h),'xres':str(ppi),'yres':str(ppi),'name':'The Vegetable Guru - rear 04'})
    stack=E.SubElement(root,'stack')
    with ZipFile(path,'w',compression=ZIP_STORED) as z:
        z.writestr('mimetype','image/openraster')
        for i,(name,x,y,im,locked) in enumerate(reversed(layers)):
            src=f'data/{i:02}.png'
            E.SubElement(stack,'layer',{'name':name,'x':str(x),'y':str(y),'src':src,'edit-locked':str(locked).lower(),'composite-op':'svg:src-over','visibility':'visible','opacity':'1.0'})
            z.writestr(src,png(im))
        z.writestr('stack.xml',E.tostring(root,encoding='utf-8',xml_declaration=True))
        z.writestr('mergedimage.png',png(composite.convert('RGB')))
        thumb=composite.copy();thumb.thumbnail((256,256))
        z.writestr('Thumbnails/thumbnail.png',png(thumb))
