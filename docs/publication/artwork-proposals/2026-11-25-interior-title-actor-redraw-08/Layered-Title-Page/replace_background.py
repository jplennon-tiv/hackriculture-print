"""Replace only a layered title-page background; never flatten native text.
Usage: python3 replace_background.py MASTER.pdf NEW-IMAGE.png OUTPUT.pdf
Dependencies: Pillow, pypdf. Add --minimum-ppi 300 for the pre-print check.
"""
from pathlib import Path
import argparse,hashlib,json,math
from PIL import Image,ImageOps
from pypdf import PdfReader,PdfWriter
from pypdf.generic import DecodedStreamObject,NameObject,NumberObject
def font_hashes(page):
    result={}
    for k,ref in page['/Resources'].get('/Font',{}).items():
        f=ref.get_object();d=f.get('/FontDescriptor')
        if not d:continue
        d=d.get_object()
        for tag in ['/FontFile','/FontFile2','/FontFile3']:
            if tag in d:result[str(k)]=hashlib.sha256(d[tag].get_object().get_data()).hexdigest()
    return result
def replace(master,background,output,minimum_ppi=0):
    master,background,output=map(Path,(master,background,output))
    if output.exists():raise ValueError('Choose a new output filename; existing files are preserved.')
    reader=PdfReader(master);assert len(reader.pages)==1
    p=reader.pages[0]
    images=[(k,v.get_object()) for k,v in p['/Resources']['/XObject'].items() if v.get_object().get('/Subtype')=='/Image']
    if len(images)!=1:raise ValueError('Expected one independent background image.')
    key,old=images[0];im=ImageOps.exif_transpose(Image.open(background)).convert('RGB')
    if abs((im.width/im.height)/(int(old['/Width'])/int(old['/Height']))-1)>.001:
        raise ValueError('Aspect ratio differs by more than 0.1%; review framing before replacement.')
    ops=p.get_contents().operations
    i=next(i for i,(a,o) in enumerate(ops) if o==b'Do' and a[0]==key)
    assert ops[i-1][1]==b'cm'
    matrix=list(map(float,ops[i-1][0]));wp=math.hypot(matrix[0],matrix[1]);hp=math.hypot(matrix[2],matrix[3])
    ppi=min(im.width*72/wp,im.height*72/hp)
    if ppi<minimum_ppi:raise ValueError(f'Effective resolution {ppi:.2f} ppi is below {minimum_ppi}.')
    writer=PdfWriter();writer.clone_document_from_reader(reader)
    new=DecodedStreamObject();new.set_data(im.tobytes())
    for k,v in {'/Type':NameObject('/XObject'),'/Subtype':NameObject('/Image'),'/ColorSpace':NameObject('/DeviceRGB'),'/BitsPerComponent':NumberObject(8),'/Width':NumberObject(im.width),'/Height':NumberObject(im.height)}.items():new[NameObject(k)]=v
    for k in ['/Intent','/Interpolate']:
        if k in old:new[NameObject(k)]=old[k]
    writer.pages[0]['/Resources']['/XObject'][key]=writer._add_object(new.flate_encode())
    writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
    writer.write(output)
    check=PdfReader(output);cp=check.pages[0]
    assert cp.get_contents().get_data()==p.get_contents().get_data()
    assert cp.extract_text()==p.extract_text()
    assert font_hashes(cp)==font_hashes(p)
    assert [x.get_object()['/Name'] for x in check.trailer['/Root']['/OCProperties']['/OCGs']]==[x.get_object()['/Name'] for x in reader.trailer['/Root']['/OCProperties']['/OCGs']]
    assert cp['/Resources']['/XObject'][key].get_object().get_data()==im.tobytes()
    record={'source':str(master),'background':str(background),'output':str(output),'pixels':list(im.size),'effective_ppi':ppi,'placement_matrix':matrix,'minimum_pixels_at_300ppi':[math.ceil(wp/72*300),math.ceil(hp/72*300)],'content_and_fonts_unchanged':True,'layer_names_unchanged':True}
    output.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n')
    return record
if __name__=='__main__':
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('master');a.add_argument('background');a.add_argument('output');a.add_argument('--minimum-ppi',type=float,default=0)
    x=a.parse_args();print(json.dumps(replace(x.master,x.background,x.output,x.minimum_ppi),indent=2))
