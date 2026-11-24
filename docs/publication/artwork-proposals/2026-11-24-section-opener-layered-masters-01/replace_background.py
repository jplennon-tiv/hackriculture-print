"""Replace only a layered master PDF's background, preserving native overlays.

Usage: python3 replace_background.py MASTER.pdf NEW-BACKGROUND.png OUTPUT.pdf
Requires Pillow and pypdf. Writes a new file; refuses to overwrite existing files.
"""
from pathlib import Path
import argparse, hashlib, json, math
from PIL import Image, ImageOps
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject, NumberObject

def font_hashes(page):
 return sorted(hashlib.sha256(f.get_object()['/FontDescriptor'].get_object()['/FontFile2'].get_object().get_data()).hexdigest() for f in page['/Resources']['/Font'].values())

def replace(master,background,output,minimum_ppi=0):
 master,background,output=map(Path,(master,background,output))
 if output.exists():raise ValueError('Output already exists; choose a new filename to preserve earlier versions.')
 reader=PdfReader(master);assert len(reader.pages)==1
 page=reader.pages[0];original_text=page.extract_text();original_contents=page.get_contents().get_data();original_fonts=font_hashes(page)
 images=[(key,ref.get_object()) for key,ref in page['/Resources']['/XObject'].items() if ref.get_object().get('/Subtype')=='/Image']
 if len(images)!=1:raise ValueError('Expected exactly one separate background image.')
 key,old=images[0]
 im=ImageOps.exif_transpose(Image.open(background)).convert('RGB')
 ratio_delta=abs((im.width/im.height)/(int(old['/Width'])/int(old['/Height']))-1)
 if ratio_delta>0.001:raise ValueError('Aspect ratio differs by more than 0.1%; align the replacement to the original composition before replacing it.')
 ops=page.get_contents().operations;i=next(i for i,(a,o) in enumerate(ops) if o==b'Do' and a[0]==key)
 assert ops[i-1][1]==b'cm';matrix=list(map(float,ops[i-1][0]))
 width_pt=math.hypot(matrix[0],matrix[1]);height_pt=math.hypot(matrix[2],matrix[3])
 ppi=min(im.width*72/width_pt,im.height*72/height_pt)
 if ppi<minimum_ppi:raise ValueError(f'Effective resolution is {ppi:.2f} ppi, below {minimum_ppi:.2f}.')
 writer=PdfWriter();writer.clone_document_from_reader(reader)
 new=DecodedStreamObject()
 for k,v in {'/Type':NameObject('/XObject'),'/Subtype':NameObject('/Image'),'/ColorSpace':NameObject('/DeviceRGB'),'/BitsPerComponent':NumberObject(8),'/Width':NumberObject(im.width),'/Height':NumberObject(im.height)}.items():new[NameObject(k)]=v
 for k in ['/Intent','/Interpolate']:
  if k in old:new[NameObject(k)]=old[k]
 new.set_data(im.tobytes());writer.pages[0]['/Resources']['/XObject'][key]=writer._add_object(new.flate_encode())
 writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True);writer.write(output)
 result=PdfReader(output);p=result.pages[0]
 assert p.extract_text()==original_text
 assert p.get_contents().get_data()==original_contents
 assert font_hashes(p)==original_fonts
 assert len(result.trailer['/Root']['/OCProperties']['/OCGs'])==5
 assert p['/Resources']['/XObject'][key].get_object().get_data()==im.tobytes()
 record={'master':str(master),'background':str(background),'output':str(output),'pixels':[im.width,im.height],'effective_ppi':ppi,'placement_matrix_unchanged':True,'native_text_and_font_programs_unchanged':True,'five_layers_retained':True,'requires_visual_detail_review':True,'print_colour_preflight_pending':True}
 output.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n')
 return record

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('master');parser.add_argument('background');parser.add_argument('output');parser.add_argument('--minimum-ppi',type=float,default=0)
 a=parser.parse_args();print(json.dumps(replace(a.master,a.background,a.output,a.minimum_ppi),indent=2))
