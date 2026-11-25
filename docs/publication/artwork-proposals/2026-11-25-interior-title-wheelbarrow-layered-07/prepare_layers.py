"""Prepare the selected title page as seven independent native PDF layers."""
from pathlib import Path
import json,re,shutil,hashlib,subprocess,sys
from PIL import Image,ImageChops
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,DecodedStreamObject,DictionaryObject,ArrayObject,TextStringObject
HERE=Path(__file__).resolve().parent
BUNDLE=HERE/'Layered-Title-Page'
BUNDLE.mkdir(exist_ok=True)
sys.path.insert(0,str(BUNDLE))
from replace_background import replace,font_hashes
SOURCE=HERE.parent/'2026-11-25-interior-title-larger-white-text-06/Vegetable-Guru-Interior-Title-Larger-White-Text.pdf'
WORKSPACE=HERE.parents[4]
BACKGROUND=WORKSPACE/'generated_images/exec-b27ee073-4f40-4abe-a826-2a7749185ecc.png'
ORIGINAL=WORKSPACE/'generated_images/exec-2a5639c7-e18a-4e6e-8de3-c217246bb1cd.png'
FONTS=HERE.parent/'2026-11-24-section-opener-layered-masters-01/Fonts-Source'
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
NAMES={'BG':'01 Background photograph','SHADE':'02 Text contrast shading','OVAL':'03 Pale sage oval','TITLE':'04 Main title - native text','SUBTITLE':'05 Subtitle - native text','AUTHOR':'06 Author - native text','COPYRIGHT':'07 Edition and copyright - native text'}
FILES={'BG':'01-Background.pdf','SHADE':'02-Contrast-Shading.pdf','OVAL':'03-Pale-Sage-Oval.pdf','TITLE':'04-Title.pdf','SUBTITLE':'05-Subtitle.pdf','AUTHOR':'06-Author.pdf','COPYRIGHT':'07-Edition-Copyright.pdf'}
for name in ['Sources','layers','fonts-embedded','Fonts-Source']:(BUNDLE/name).mkdir(exist_ok=True)
shutil.copy2(SOURCE,BUNDLE/'Sources/Selected-Layout-Before-Image-Repair.pdf')
shutil.copyfile(ORIGINAL,BUNDLE/'Sources/Original-Background.png')
shutil.copyfile(BACKGROUND,BUNDLE/'Background.png')
shutil.copy2(HERE.parent/'2026-11-25-interior-title-larger-white-text-06/LAYOUT.json',BUNDLE/'Selected-Layout.json')
for name in ['Lilita.ttf','Nunito.ttf','Nunito-Bold.ttf']:shutil.copy2(FONTS/name,BUNDLE/'Fonts-Source'/name)
for f in FONTS.iterdir():
    if f.is_file() and f.suffix.lower() in ['.txt','.md']:shutil.copy2(f,BUNDLE/'Fonts-Source'/f.name)
working=HERE/'working-image-replaced.pdf'
if working.exists():working.unlink()
placement=replace(SOURCE,BACKGROUND,working)
reader=PdfReader(working);p=reader.pages[0];data=p.get_contents().get_data()
pat=re.compile(rb'/OC /TITLE BDC\s*(.*?)\s*EMC',re.S)
old=pat.search(data).group(1)
chunks=re.findall(rb'1 1 1 rg\s*BT.*?ET',old,re.S);assert len(chunks)==5
split=b'/OC /TITLE BDC\n'+b'\n'.join(chunks[:3])+b'\nEMC\n/OC /SUBTITLE BDC\n'+b'\n'.join(chunks[3:])+b'\nEMC'
data=pat.sub(lambda m:split,data)
writer=PdfWriter();writer.clone_document_from_reader(reader)
props=writer.pages[0]['/Resources']['/Properties']
props[NameObject('/TITLE')].get_object()[NameObject('/Name')]=TextStringObject(NAMES['TITLE'])
props[NameObject('/SUBTITLE')]=writer._add_object(DictionaryObject({NameObject('/Type'):NameObject('/OCG'),NameObject('/Name'):TextStringObject(NAMES['SUBTITLE'])}))
for key,name in NAMES.items():props[NameObject('/'+key)].get_object()[NameObject('/Name')]=TextStringObject(name)
def set_groups(w,keys):
    props=w.pages[0]['/Resources']['/Properties']
    refs=[props[NameObject('/'+k)] for k in keys]
    w.pages[0]['/Resources'][NameObject('/Properties')]=DictionaryObject({NameObject('/'+k):props[NameObject('/'+k)] for k in keys})
    w._root_object[NameObject('/OCProperties')]=DictionaryObject({NameObject('/OCGs'):ArrayObject(refs),NameObject('/D'):DictionaryObject({NameObject('/Order'):ArrayObject(refs),NameObject('/ON'):ArrayObject(refs),NameObject('/OFF'):ArrayObject(),NameObject('/BaseState'):NameObject('/ON')})})
    w._root_object[NameObject('/PageMode')]=NameObject('/UseOC')
def set_data(w,data):
    stream=DecodedStreamObject();stream.set_data(data)
    w.pages[0][NameObject('/Contents')]=w._add_object(stream.flate_encode())
set_data(writer,data);set_groups(writer,list(NAMES))
writer.add_metadata({'/Title':'The Vegetable Guru - Interior title layered master','/Author':'John Lennon','/Subject':'Selected D, Pale sage, Cropped sweep and 10% larger white text. Wheelbarrow repair 02 awaits review; seven independent layers.'})
master=BUNDLE/'Layered-Master.pdf'
writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True);writer.write(master)
master_reader=PdfReader(master);mp=master_reader.pages[0]
assert mp.extract_text()==p.extract_text()
assert font_hashes(mp)==font_hashes(p)
assert len(master_reader.trailer['/Root']['/OCProperties']['/OCGs'])==7
content=mp.get_contents().get_data()
layer=re.compile(rb'/OC /([A-Z]+) BDC\s*.*?\s*EMC',re.S)
assert len(list(layer.finditer(content)))==7
def component(keys,path):
    w=PdfWriter();w.clone_document_from_reader(master_reader)
    result=layer.sub(lambda m:m.group(0) if m.group(1).decode() in keys else b'',content)
    set_data(w,result);set_groups(w,keys)
    if 'BG' not in keys:
        xs=w.pages[0]['/Resources'].get('/XObject',{})
        for k in list(xs):
            if xs[k].get_object().get('/Subtype')=='/Image':del xs[k]
    w.add_metadata({'/Title':'The Vegetable Guru - '+', '.join(NAMES[k] for k in keys),'/Author':'John Lennon'})
    w.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True);w.write(path)
for key in NAMES:component([key],BUNDLE/'layers'/FILES[key])
component([k for k in NAMES if k!='BG'],BUNDLE/'Overlay-Native-Type.pdf')
overlay=PdfReader(BUNDLE/'Overlay-Native-Type.pdf')
assert overlay.pages[0].extract_text()==mp.extract_text()
assert not any(v.get_object().get('/Subtype')=='/Image' for v in overlay.pages[0]['/Resources'].get('/XObject',{}).values())
fonts=[]
for key,ref in mp['/Resources']['/Font'].items():
    f=ref.get_object();desc=f.get('/FontDescriptor')
    if not desc:continue
    desc=desc.get_object()
    for tag in ['/FontFile','/FontFile2','/FontFile3']:
        if tag in desc:
            name=str(key)[1:]+'-'+str(f['/BaseFont'])[1:]+'.ttf'
            (BUNDLE/'fonts-embedded'/name).write_bytes(desc[tag].get_object().get_data())
            fonts.append({'resource':str(key),'face':str(f['/BaseFont']),'file':'fonts-embedded/'+name})
(BUNDLE/'Page-Text.txt').write_text(mp.extract_text()+'\n')
(BUNDLE/'Image-Placement.json').write_text(json.dumps(placement,indent=2)+'\n')
# Recompose the independently saved background PDF with the native overlay.
w=PdfWriter();w.clone_document_from_reader(master_reader)
# Both exported components retain the exact master resource names. Concatenate
# their independent streams without merge_page's extra page-edge clipping path.
bg_data=PdfReader(BUNDLE/'layers/01-Background.pdf').pages[0].get_contents().get_data()
set_data(w,b'q\n'+bg_data+b'\nQ\nq\n'+overlay.pages[0].get_contents().get_data()+b'\nQ\n')
recombined=HERE/'working-recombined.pdf';w.write(recombined)
def render(pdf,png):
    subprocess.run([POPPLER,'-png','-singlefile','-scale-to','1300',str(pdf),str(png.with_suffix(''))],check=True,capture_output=True)
render(master,BUNDLE/'Preview.png')
render(working,HERE/'working-before-layer-split.png')
render(recombined,HERE/'working-recombined.png')
base=Image.open(BUNDLE/'Preview.png').convert('RGB')
for name in ['working-before-layer-split.png','working-recombined.png']:
    assert ImageChops.difference(base,Image.open(HERE/name).convert('RGB')).getbbox() is None,name
proof=HERE/'Vegetable-Guru-Interior-Title-Wheelbarrow-Review.pdf';shutil.copy2(master,proof)
shutil.copyfile(BUNDLE/'Preview.png',HERE/'Vegetable-Guru-Interior-Title-Wheelbarrow-Review.png')
record={'date':'2026-11-25','status':'selected_layout_preserved_repair_02_awaiting_review','layout_selected_by_user':True,'selected_layout':'D + colour 4 Pale sage + shape 6 Cropped sweep + white text enlarged 10%','background_source':str(BACKGROUND),'original_background':str(ORIGINAL),'rejected_repair_01':str(WORKSPACE/'generated_images/exec-bde216a9-af3e-4943-9e83-a5ff09dd8cf9.png'),'repair':'Wider U-shaped front frame loop based on original camera detail; curve in front of lower tyre. Repair 01 rejected by user; repair 02 prepared from original D.','layers':NAMES,'fonts':fonts,'placement':placement,'checks':{'copy_identical':True,'font_programs_identical':True,'seven_independent_layers':True,'layer_split_render_pixel_identical':True,'background_plus_overlay_render_pixel_identical':True,'overlay_has_no_photograph':True,'selected_geometry_preserved':True,'visual_review_performed':True},'background_change_note':'Generative repair; do not claim unedited photo areas are pixel-identical.','production_changed':False,'upscaling_performed':False,'production_ready':False}
(HERE/'MANIFEST.json').write_text(json.dumps(record,indent=2)+'\n')
(BUNDLE/'MANIFEST.json').write_text(json.dumps(record,indent=2)+'\n')
for f in [working,working.with_suffix('.json'),recombined,HERE/'working-before-layer-split.png',HERE/'working-recombined.png']:f.unlink()
print(json.dumps({'proof':str(proof),'layers':list(NAMES.values()),'ppi':placement['effective_ppi'],'minimum_300ppi':placement['minimum_pixels_at_300ppi'],'checks':'passed'}))
