"""Losslessly separate existing native PDF artwork; no image regeneration."""
from pathlib import Path
import copy, hashlib, json, math, shutil, subprocess
from PIL import Image, ImageChops
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, ContentStream, DecodedStreamObject, DictionaryObject, NameObject, TextStringObject

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
CASES=[
 {'key':'guides-007','title':'Vegetable Guides','folio':7,'folder':'2026-11-24-vegetable-guides-opener-11-selected-3-folio','pdf':'Vegetable-Guru-Selected-Opener-Page-7.pdf','photo':'2026-11-24-vegetable-guides-opener-09-design-continuity/assets/09-leeks-native.png','ops':676,'ranges':{'Background':(2,6),'Oval':(6,18),'Title':(18,44),'Contents':(44,661),'Folio':(662,676)}},
 {'key':'troubles-097','title':'Vegetable Troubles','folio':97,'folder':'2026-11-24-troubles-cabbage-more-holes-08','pdf':'Vegetable-Guru-Troubles-Cabbage-More-Holes-Page-97.pdf','photo':'2026-11-24-troubles-cabbage-more-holes-08/assets/red-cabbage-more-holes.png','ops':273,'ranges':{'Background':(1,5),'Oval':(5,16),'Title':(16,42),'Contents':(42,266),'Folio':(266,273)}},
 {'key':'techniques-145','title':'Growing Techniques','folio':145,'folder':'2026-11-24-growing-techniques-title5-oval6-11','pdf':'Vegetable-Guru-Growing-Techniques-Title5-Oval6-Page-145.pdf','photo':'2026-11-24-growing-techniques-planting-opener-08/assets/planting-option-07.png','ops':359,'ranges':{'Background':(1,5),'Oval':(5,17),'Title':(17,43),'Contents':(43,352),'Folio':(352,359)}},
]
PAINT={b'Do',b'Tj',b'TJ',b"'",b'"',b'f',b'F',b'f*',b'S',b's',b'B',b'B*',b'b',b'b*',b'sh'}
PATH_PAINT={b'f',b'F',b'f*',b'S',b's',b'B',b'B*',b'b',b'b*'}

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def image_hash(p):
 return [hashlib.sha256(o.get_object().get_data()).hexdigest() for o in p['/Resources'].get('/XObject',{}).values() if o.get_object().get('/Subtype')=='/Image']
def save_stream(page,operations,writer):
 stream=ContentStream(None,writer);stream.operations=operations
 encoded=DecodedStreamObject();encoded.set_data(stream.get_data());page[NameObject('/Contents')]=writer._add_object(encoded.flate_encode())
def write_component(reader,ops,case,names,path,ocg=False):
 writer=PdfWriter();page=writer.add_page(reader.pages[0]);ranges=case['ranges']
 if ocg:
  writer.pdf_header='%PDF-1.7'
  groups=[];props=DictionaryObject();starts={};ends={}
  for i,(name,(start,end)) in enumerate(ranges.items()):
   ref=writer._add_object(DictionaryObject({NameObject('/Type'):NameObject('/OCG'),NameObject('/Name'):TextStringObject(name)}))
   groups.append(ref);tag=NameObject('/L'+str(i));props[tag]=ref;starts[start]=tag;ends[end]=True
  page['/Resources'][NameObject('/Properties')]=props
  writer._root_object[NameObject('/OCProperties')]=DictionaryObject({NameObject('/OCGs'):ArrayObject(groups),NameObject('/D'):DictionaryObject({NameObject('/BaseState'):NameObject('/ON'),NameObject('/Order'):ArrayObject(groups),NameObject('/ON'):ArrayObject(groups),NameObject('/OFF'):ArrayObject(),NameObject('/Name'):TextStringObject('All five editable layers')})})
  writer._root_object[NameObject('/PageMode')]=NameObject('/UseOC')
  result=[]
  for i,op in enumerate(ops):
   if i in ends:result.append(([],b'EMC'))
   if i in starts:result.append(([NameObject('/OC'),starts[i]],b'BDC'))
   result.append(op)
  if len(ops) in ends:result.append(([],b'EMC'))
 else:
  result=[]
  for i,(args,op) in enumerate(ops):
   layer=next((n for n,(a,b) in ranges.items() if a<=i<b),None)
   if op in PAINT and layer not in names:
    if op in PATH_PAINT:result.append(([],b'n'))
   else:result.append((args,op))
  if 'Background' not in names:page['/Resources'].pop('/XObject',None)
 save_stream(page,result,writer)
 writer.add_metadata({'/Title':case['title']+' — '+('layered master' if ocg else ', '.join(names)),'/Author':'John Lennon','/Subject':'Trial artwork. Native text and vector overlays. Background resolution upgrade pending.'})
 writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True);writer.write(path)
 return PdfReader(path)
def render(pdf,out):
 subprocess.run([POPPLER,'-png','-singlefile','-cropbox','-scale-to','1600',str(pdf),str(out.with_suffix(''))],check=True,capture_output=True)

reports=[]
for case in CASES:
 dest=HERE/case['key'];(dest/'layers').mkdir(parents=True,exist_ok=True);(dest/'fonts-embedded').mkdir(exist_ok=True)
 source=ROOT/case['folder']/case['pdf'];reader=PdfReader(source);page=reader.pages[0];ops=page.get_contents().operations
 assert len(ops)==case['ops'],'Source changed; review layer boundaries'
 assert len(image_hash(page))==1
 assert all(any(a<=i<b for a,b in case['ranges'].values()) for i,(_,op) in enumerate(ops) if op in PAINT)
 master=dest/'Layered-Master.pdf';r=write_component(reader,ops,case,list(case['ranges']),master,True)
 assert r.pages[0].extract_text()==page.extract_text()
 assert image_hash(r.pages[0])==image_hash(page)
 assert [o.get_object()['/Name'] for o in r.trailer['/Root']['/OCProperties']['/OCGs']]==list(case['ranges'])
 for name in ['Oval','Title','Contents','Folio']:
  component=write_component(reader,ops,case,[name],dest/'layers'/f'{name}.pdf')
  assert not image_hash(component.pages[0])
 overlay=write_component(reader,ops,case,['Oval','Title','Contents','Folio'],dest/'Overlay-Native-Type.pdf')
 assert overlay.pages[0].extract_text()==page.extract_text()
 assert not image_hash(overlay.pages[0])
 photo=ROOT/case['photo'];shutil.copy2(photo,dest/'Background.png')
 embedded=next(o.get_object() for o in page['/Resources']['/XObject'].values() if o.get_object().get('/Subtype')=='/Image')
 im=Image.open(photo).convert('RGB');assert im.tobytes()==embedded.get_data()
 font_report=[]
 for key,ref in page['/Resources']['/Font'].items():
  f=ref.get_object();d=f['/FontDescriptor'].get_object();assert '/FontFile2' in d
  filename=key[1:]+'-'+str(f['/BaseFont'])[1:].replace('/','_')+'.ttf'
  (dest/'fonts-embedded'/filename).write_bytes(d['/FontFile2'].get_object().get_data())
  font_report.append({'resource':str(key),'basefont':str(f['/BaseFont']),'file':'fonts-embedded/'+filename,'format':'TrueType embedded subset; original exact glyphs'})
 doi=next(i for i,(_,op) in enumerate(ops) if op==b'Do');matrix=ops[doi-1][0];assert ops[doi-1][1]==b'cm'
 pw,ph=float(matrix[0]),float(matrix[3]);ppi=min(im.width*72/pw,im.height*72/ph)
 # Recomposition proves the clean background and transparent overlay are independent.
 recomposed=PdfWriter();bp=recomposed.add_page(page)
 bg_ops=[(a,op) if op not in PAINT or i in range(*case['ranges']['Background']) else ([],b'n') for i,(a,op) in enumerate(ops)]
 combined=[([],b'q')]+bg_ops+[([],b'Q'),([],b'q')]+overlay.pages[0].get_contents().operations+[([],b'Q')]
 save_stream(bp,combined,recomposed);tmp=Path('/tmp')/(case['key']+'-recomposed.pdf');recomposed.write(tmp)
 source_png=Path('/tmp')/(case['key']+'-source.png');recomposed_png=Path('/tmp')/(case['key']+'-recomposed.png')
 render(source,source_png);render(master,dest/'Preview.png');render(tmp,recomposed_png)
 original=Image.open(source_png).convert('RGB')
 assert ImageChops.difference(original,Image.open(dest/'Preview.png').convert('RGB')).getbbox() is None
 assert ImageChops.difference(original,Image.open(recomposed_png).convert('RGB')).getbbox() is None
 shutil.copy2(ROOT/case['folder']/'build.py',dest/'Original-Builder.py')
 shutil.copy2(ROOT/case['folder']/'MANIFEST.json',dest/'Original-Layout-Record.json')
 (dest/'Contents-Text.txt').write_text(page.extract_text())
 record={'section':case['title'],'folio':case['folio'],'source_pdf':str(source.resolve()),'source_sha256':sha(source),'master_sha256':sha(master),'background_sha256':sha(dest/'Background.png'),'source_pixels':list(im.size),'effective_ppi':ppi,'placement_matrix_pdf_points':[float(x) for x in matrix],'minimum_pixels_same_placement_300ppi':[math.ceil(pw/72*300),math.ceil(ph/72*300)],'layers':list(case['ranges']),'fonts':font_report,'checks':{'text_identical':True,'photo_pixels_identical':True,'layered_render_pixel_identical_at_1600px':True,'background_plus_overlay_render_pixel_identical_at_1600px':True,'overlay_contains_no_image_resources':True},'production_ready':False,'pending':'Growing Techniques background image fix unspecified; resolution upgrade deferred.'}
 (dest/'LAYERS.json').write_text(json.dumps(record,indent=2)+'\n');reports.append(record)
fonts=HERE/'Fonts-Source';fonts.mkdir(exist_ok=True)
for name in ['Lilita','Nunito','Nunito-Bold','Folio']:
 shutil.copy2(ROOT/'2026-11-24-growing-techniques-planting-opener-08/assets'/f'{name}.ttf',fonts/f'{name}.ttf')
(HERE/'MANIFEST.json').write_text(json.dumps({'date':'2026-11-24','status':'layered_trial_masters_preserved','sections':reports,'production_files_modified':False,'upscaling_performed':False},indent=2)+'\n')
print(json.dumps([{'section':x['section'],'ppi':round(x['effective_ppi'],2),'checks':'passed'} for x in reports],indent=2))
