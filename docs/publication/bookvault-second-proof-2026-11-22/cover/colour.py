"""Flatten cover artwork through FOGRA39, retaining actual font curves and text.

The approved SVG explicitly tags font-outline groups. Those original curves
are split from artwork before flattening; no raster-letter tracing is involved.
"""
from pathlib import Path
from io import BytesIO
import xml.etree.ElementTree as ET
import copy, hashlib, json, subprocess, logging
from collections import Counter
from PIL import Image, ImageCms
from pypdf import PdfReader, PdfWriter, overwrite_configuration
from pypdf.generic import (ContentStream,NameObject,DecodedStreamObject,DictionaryObject,
                          ArrayObject,FloatObject,NumberObject,TextStringObject,RectangleObject)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab import rl_config
import pypdfium2 as pdfium
import numpy as np
import pdfplumber
import build

logging.getLogger('pypdf').setLevel(logging.ERROR)
# A known 600 dpi wrap is about 54 million pixels; its four-channel stream is
# legitimately larger than pypdf's generic 75 MB default for untrusted PDFs.
overwrite_configuration(maximum_declared_stream_length=400_000_000,zlib_maximum_output_length=400_000_000,stream_decoding_work_maximum_length=800_000_000)
rl_config.useA85=0
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3];OUT=build.OUT
SOURCE=OUT/'Vegetable-Guru-Second-Proof-Cover.pdf'
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
SRGB='/opt/homebrew/share/ghostscript/iccprofiles/srgb.icc'
TEXT={b'Tj',b'TJ',b"'",b'"'};PAINT={b'S',b's',b'f',b'F',b'f*',b'B',b'B*',b'b',b'b*'}
TRANSFORM=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
CACHE={}
PROFILE_TRANSFORMS={}

def cmyk(vals,source_profile=None):
    profile_key=hashlib.sha256(source_profile).hexdigest() if source_profile else 'default-sRGB'
    key=(profile_key,tuple(round(float(v)*255) for v in vals))
    if key not in CACHE:
        transform=TRANSFORM
        if source_profile:
            if profile_key not in PROFILE_TRANSFORMS:
                PROFILE_TRANSFORMS[profile_key]=ImageCms.buildTransform(ImageCms.ImageCmsProfile(BytesIO(source_profile)),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
            transform=PROFILE_TRANSFORMS[profile_key]
        value=ImageCms.applyTransform(Image.new('RGB',(1,1),key[1]),transform).getpixel((0,0))
        CACHE[key]=[FloatObject(x/255) for x in value]
    return CACHE[key]

def resolve(ob):return ob.get_object() if hasattr(ob,'get_object') else ob

def split_front_svg():
    source=build.SOURCE_DIR/'Vegetable-Guru-Front-Print-Resolution-Proposal.svg'
    tree=ET.parse(source);root=tree.getroot();art=copy.deepcopy(root);typ=copy.deepcopy(root)
    def is_type(e):return e.get('data-type-source')=='font-outline'
    count=sum(is_type(e) for e in root.iter())
    assert count>20,count
    def remove_type(e):
        for child in list(e):
            if is_type(child):e.remove(child)
            else:remove_type(child)
    def retain_type(e):
        if is_type(e):return True
        kept=False
        for child in list(e):
            if retain_type(child):kept=True
            else:e.remove(child)
        return kept
    remove_type(art);assert retain_type(typ)
    original_groups=[ET.tostring(e) for e in root.iter() if is_type(e)]
    retained_groups=[ET.tostring(e) for e in typ.iter() if is_type(e)]
    assert original_groups==retained_groups, 'Actual font-outline groups changed'
    group_hash=hashlib.sha256(b'\n'.join(original_groups)).hexdigest()
    outputs=[]
    for name,e in [('art',art),('type',typ)]:
        svg=HERE/f'front-{name}.svg';pdf=OUT/f'front-{name}.pdf'
        ET.ElementTree(e).write(svg,encoding='unicode',xml_declaration=True)
        subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-f','pdf','-o',str(pdf),str(svg)],check=True)
        outputs.append(pdf)
    return outputs,count,group_hash

def components(name,res):
    name=str(name)
    if name in ('/DeviceRGB','/RGB'):return (3,None)
    if name in ('/DeviceGray','/G'):return (1,None)
    if name in ('/DeviceCMYK','/CMYK'):return (4,None)
    value=resolve(resolve(res.get('/ColorSpace',{}))[NameObject(name)])
    if isinstance(value,list) and value[0]=='/ICCBased':return (int(resolve(value[1])['/N']),resolve(value[1]).get_data())
    if isinstance(value,str):return components(value,res)
    raise ValueError(('Unsupported type colour space',name,value))

def make_layer(mode, front_pdf, convert=False):
    reader=PdfReader(SOURCE);page=reader.pages[0]
    front=page['/Resources']['/XObject']['/ApprovedTrim'].get_object()['/Resources']['/XObject']['/Front'].get_object()
    fp=PdfReader(front_pdf).pages[0]
    front.set_data(fp.get_contents().get_data());front[NameObject('/Resources')]=fp['/Resources']
    if mode=='art' and '/Group' in fp:front[NameObject('/Group')]=fp['/Group']
    else:front.pop('/Group',None)
    seen=set();native_runs=0;front_paths=0
    def process(stream,res,front_type=False):
        nonlocal native_runs,front_paths
        out=[];contents=ContentStream(stream,reader);state={'fill':(3,None),'stroke':(3,None)};stack=[]
        for vals,op in contents.operations:
            if op==b'q':stack.append(state.copy())
            elif op==b'Q':state=stack.pop()
            if op in TEXT:
                native_runs+=1
                if mode=='art':continue
            if op==b'Do':
                ob=res['/XObject'][vals[0]].get_object()
                if ob.get('/Subtype')=='/Form' and id(ob) not in seen:
                    seen.add(id(ob)); rr=resolve(ob.get('/Resources',res))
                    keep_paths=front_type or ob is front
                    ob.set_data(process(ob,rr,keep_paths))
                    if mode=='type':ob.pop('/Group',None)
                if mode=='type' and ob.get('/Subtype')!='/Form':continue
            if mode=='type':
                if op in PAINT:
                    if not front_type:out.append(([],b'n'));continue
                    front_paths+=1
                if op==b'sh':continue
                if op in (b'cs',b'CS'):
                    state['fill' if op==b'cs' else 'stroke']=components(vals[0],res)
                    if convert:continue
                if convert:
                    if op in (b'rg',b'RG'):
                        state['fill' if op==b'rg' else 'stroke']=(3,None)
                        vals=cmyk(vals);op=b'k' if op==b'rg' else b'K'
                    elif op in (b'sc',b'scn',b'SC',b'SCN'):
                        key='fill' if op in (b'sc',b'scn') else 'stroke'
                        n,source_profile=state[key]
                        if n==3:vals=cmyk(vals,source_profile)
                        elif n==1:vals=[FloatObject(0),FloatObject(0),FloatObject(0),FloatObject(1-float(vals[0]))]
                        elif n!=4:raise ValueError(n)
                        op=b'k' if key=='fill' else b'K'
                    elif op in (b'g',b'G'):
                        vals=[FloatObject(0),FloatObject(0),FloatObject(0),FloatObject(1-float(vals[0]))]
                        op=b'k' if op==b'g' else b'K'
            out.append((vals,op))
        assert not stack
        contents.operations=out
        return contents.get_data()
    data=process(page.get_contents(),page['/Resources'])
    stream=DecodedStreamObject();stream.set_data(data);page[NameObject('/Contents')]=stream
    def clean(res,seen=None):
        seen=set() if seen is None else seen;res=resolve(res)
        if id(res) in seen:return
        seen.add(id(res));xobjects=resolve(res.get('/XObject',{}))
        for key,ref in list(xobjects.items()):
            x=ref.get_object()
            if x.get('/Subtype')!='/Form':del xobjects[key]
            elif '/Resources' in x:clean(x['/Resources'],seen)
        for key in ['/Shading','/Pattern']:res.pop(key,None)
        if convert:res.pop('/ColorSpace',None)
        for ref in resolve(res.get('/ExtGState',{})).values():
            state=ref.get_object()
            for key in ['/SMask','/ca','/CA','/BM']:state.pop(key,None)
    if mode=='type':clean(page['/Resources']);page.pop('/Group',None)
    writer=PdfWriter();writer.add_page(page)
    dest=OUT/f'cover-{mode}{"-cmyk" if convert else "-rgb"}.pdf';writer.write(dest)
    return dest,{'native_text_runs':native_runs,'front_font_path_paints':front_paths}

def raster_page(path,prefix,dpi):
    subprocess.run([POPPLER,'-f','1','-singlefile','-r',str(dpi),'-png','-displayprofile',SRGB,'-defaultrgbprofile',SRGB,str(path),str(prefix)],check=True,stderr=subprocess.DEVNULL)
    return prefix.with_suffix('.png')

def combine_art_type(art_image,type_pdf,output,profile=True):
    source=PdfReader(SOURCE).pages[0];size=tuple(map(float,(source.mediabox.width,source.mediabox.height)))
    # Poppler rounds raster dimensions upward. Keep the true 600 dpi sampling
    # and top-left registration; stretching the rounded raster to MediaBox
    # would introduce a subpixel displacement across the wrap.
    raster_width=art_image.width*72/600;raster_height=art_image.height*72/600
    buf=BytesIO();c=canvas.Canvas(buf,pagesize=size)
    c.drawImage(ImageReader(art_image),0,size[1]-raster_height,raster_width,raster_height);c.save()
    page=PdfReader(BytesIO(buf.getvalue())).pages[0];content=page.get_contents();inside=False;keep=[]
    for vals,op in content.operations:
        if op==b'BT':inside=True;continue
        if op==b'ET':inside=False;continue
        if not inside:keep.append((vals,op))
    content.operations=keep;page[NameObject('/Contents')]=content;page['/Resources'].pop('/Font',None)
    page.merge_page(PdfReader(type_pdf).pages[0])
    for box in ['/MediaBox','/CropBox','/TrimBox','/BleedBox']:page[NameObject(box)]=source[box]
    writer=PdfWriter();writer.add_page(page)
    if profile:
        icc=DecodedStreamObject();icc.set_data(PROFILE.read_bytes());icc[NameObject('/N')]=NumberObject(4)
        intent=DictionaryObject({NameObject('/Type'):NameObject('/OutputIntent'),NameObject('/S'):NameObject('/GTS_PDFX'),
                NameObject('/OutputConditionIdentifier'):TextStringObject('FOGRA39'),NameObject('/Info'):TextStringObject('ISO Coated v2 300% (ECI)'),
                NameObject('/RegistryName'):TextStringObject('http://www.color.org'),NameObject('/DestOutputProfile'):writer._add_object(icc)})
        writer.root_object[NameObject('/OutputIntents')]=ArrayObject([writer._add_object(intent)])
    writer.add_metadata({'/Title':'The Vegetable Guru — second-proof CMYK cover','/Author':'John Lennon',
        '/Subject':'FOGRA39; flattened 600 dpi artwork; genuine vector front lettering and native rear/spine text retained. No PDF/X certification claim.'})
    writer.pdf_header='%PDF-1.4';writer.write(output)

def inventory(path):
    reader=PdfReader(path);fonts=build.snapshot_fonts(reader.pages[0]['/Resources']);ops=Counter();images=[];alpha=[];seen=set()
    def scan(stream,res):
        for vals,op in ContentStream(stream,reader).operations:ops[op.decode('latin1')]+=1
        for ref in resolve(res.get('/ExtGState',{})).values():
            state=ref.get_object()
            if state.get('/SMask','/None')!='/None' or state.get('/ca',1)!=1 or state.get('/CA',1)!=1 or state.get('/BM','/Normal')!='/Normal':alpha.append(str(state))
        for ref in resolve(res.get('/XObject',{})).values():
            obj=ref.get_object()
            if id(obj) in seen:continue
            seen.add(id(obj))
            if '/SMask' in obj or '/Group' in obj:alpha.append('mask/group')
            if obj.get('/Subtype')=='/Image':images.append({'pixels':[int(obj['/Width']),int(obj['/Height'])],'space':str(obj.get('/ColorSpace'))})
            elif obj.get('/Subtype')=='/Form':scan(obj,resolve(obj.get('/Resources',res)))
    scan(reader.pages[0].get_contents(),reader.pages[0]['/Resources'])
    return {'fonts':fonts,'operations':dict(ops),'images':images,'transparency':alpha}

def outside_hash(image,boxes):
    digest=hashlib.sha256()
    ys=sorted({0,image.height,*[b[1] for b in boxes],*[b[3] for b in boxes]})
    for y0,y1 in zip(ys,ys[1:]):
        excluded=sorted((b[0],b[2]) for b in boxes if b[1]<=y0 and b[3]>=y1)
        x0=0
        for left,right in excluded+[(image.width,image.width)]:
            if x0<left:digest.update(image.crop((x0,y0,left,y1)).tobytes())
            x0=max(x0,right)
    return digest.hexdigest()

def selective_bpc(rgb,converted):
    items=json.loads((HERE/'SELECTIVE-BPC-PHOTOS.json').read_text())
    boxes=[x['rgb_raster_crop_px'] for x in items]
    before=outside_hash(converted,boxes)
    transform=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1,flags=8192)
    for box in boxes:converted.paste(ImageCms.applyTransform(rgb.crop(box),transform),(box[0],box[1]))
    after=outside_hash(converted,boxes);assert before==after
    return {'photos':items,'intent':1,'black_point_compensation':True,'flags':8192,
            'outside_regions_cmyk_bytes_exact':True,'outside_regions_cmyk_sha256':before,
            'basis':'Independent colour review confirms preserved shadow separation in the colander clothing and kneeling-John ground/pot; all other artwork retains historical no-BPC conversion.'}

def type_geometry(path):
    reader=PdfReader(path);items=[]
    colour_ops={b'cs',b'CS',b'rg',b'RG',b'g',b'G',b'k',b'K',b'sc',b'SC',b'scn',b'SCN'}
    def scan(stream,res,name):
        contents=ContentStream(stream,reader)
        contents.operations=[(v,o) for v,o in contents.operations if o not in colour_ops]
        items.append(name.encode()+b'\n'+contents.get_data())
        for k,ref in sorted(resolve(res.get('/XObject',{})).items()):
            ob=ref.get_object()
            if ob.get('/Subtype')=='/Form':scan(ob,resolve(ob.get('/Resources',res)),name+'/'+k)
    scan(reader.pages[0].get_contents(),reader.pages[0]['/Resources'],'page')
    return hashlib.sha256(b'\n'.join(items)).hexdigest()

def main():
    assert build.sha(PROFILE)=='c6b4b62f0726243742eced8b9669476a6be89e581f50a7600ed8b6fcbb9cdab8'
    (front_art,front_type),font_groups,font_group_hash=split_front_svg()
    art,art_stats=make_layer('art',front_art)
    typ_rgb,type_stats=make_layer('type',front_type)
    typ_cmyk,cmyk_stats=make_layer('type',front_type,True)
    assert art_stats['native_text_runs']==type_stats['native_text_runs']==cmyk_stats['native_text_runs']
    assert type_stats['front_font_path_paints']==cmyk_stats['front_font_path_paints']>100
    geometry_hash=type_geometry(typ_rgb);assert geometry_hash==type_geometry(typ_cmyk)
    print('Split original font curves and native text from artwork.',flush=True)
    cache_key={'raster_pipeline_version':2,'native_source_sha256':build.sha(SOURCE),'front_art_svg_sha256':build.sha(HERE/'front-art.svg')}
    cache_path=HERE/'ART-RASTER-CACHE.json';raster=OUT/'cover-art-600dpi.png'
    cache=json.loads(cache_path.read_text()) if cache_path.exists() else {}
    if cache.get('key')!=cache_key or not raster.exists() or build.sha(raster)!=cache.get('png_sha256'):
        raster=raster_page(art,OUT/'cover-art-600dpi',600)
        cache_path.write_text(json.dumps({'key':cache_key,'png_sha256':build.sha(raster),'method':'Poppler 600 dpi with explicit sRGB display/default RGB'},indent=2)+'\n')
    print('600 dpi artwork is ready.',flush=True)
    rgb=Image.open(raster).convert('RGB')
    recombined=OUT/'cover-recombined-rgb-check.pdf';combine_art_type(rgb,typ_rgb,recombined,False)
    print('RGB recomposition assembled.',flush=True)
    converted=ImageCms.applyTransform(rgb,TRANSFORM)
    selective=selective_bpc(rgb,converted)
    dest=OUT/'Vegetable-Guru-Second-Proof-Cover-CMYK.pdf'
    combine_art_type(converted,typ_cmyk,dest)
    print('CMYK cover assembled.',flush=True)
    rgb.close();converted.close()
    inv=inventory(dest)
    assert not inv['transparency'],inv['transparency']
    assert not any(x in inv['operations'] for x in ['rg','RG','sc','scn','SC','SCN','cs','CS']),inv['operations']
    assert all(f['embedded'] for f in inv['fonts'])
    assert len(inv['images'])==1 and inv['images'][0]['space']=='/DeviceCMYK'
    assert inv['operations'].get('c',0)>1000,inv['operations']
    with pdfplumber.open(SOURCE) as src,pdfplumber.open(dest) as after:
        a=src.pages[0].chars;b=after.pages[0].chars;glyph_count=len(a)
        assert len(a)==len(b),(len(a),len(b))
        maximum=0
        for c,d in zip(a,b):
            assert c['text']==d['text'] and c['fontname']==d['fontname'],(c,d)
            maximum=max(maximum,*(abs(c[k]-d[k]) for k in ['x0','x1','top','bottom','size']))
        assert maximum<0.0001,maximum
    # Colour-managed views use Poppler explicitly set to the actual output profile.
    subprocess.run([POPPLER,'-f','1','-singlefile','-r','127','-png','-displayprofile',SRGB,'-defaultcmykprofile',str(PROFILE),str(dest),str(OUT/'Vegetable-Guru-Second-Proof-Cover-CMYK-Preview')],check=True,stderr=subprocess.DEVNULL)
    source_preview=raster_page(SOURCE,OUT/'cover-native-comparison',254)
    recomposed_preview=raster_page(recombined,OUT/'cover-recombined-comparison',254)
    a=np.asarray(Image.open(source_preview).convert('RGB')).astype(int);b=np.asarray(Image.open(recomposed_preview).convert('RGB')).astype(int)
    delta=np.abs(a-b)
    report={'date':'2026-11-22','status':'CMYK derivative built; visual review pending','source':str(SOURCE.relative_to(ROOT)),
            'source_sha256':build.sha(SOURCE),'output':{'file':str(dest.relative_to(ROOT)),'sha256':build.sha(dest),'bytes':dest.stat().st_size},
            'profile':{'name':'ISO Coated v2 300% (ECI), FOGRA39','sha256':build.sha(PROFILE),'intent':'relative colorimetric (1)','black_point_compensation':'off except two documented rear photographs'},
            'selective_photo_correction':selective,
            'method':'Poppler composites non-type artwork at 600 dpi with sRGB display/default RGB profile; LittleCMS performs genuine FOGRA39 conversion. Original tagged SVG font-outline groups remain vector paths; native rear/spine glyphs preserved. All type colours use the same LittleCMS transform.',
            'original_font_outline_groups':font_groups,'exact_retained_font_group_sha256':font_group_hash,'rgb_and_cmyk_type_geometry_sha256':geometry_hash,'type_statistics':type_stats,'glyph_count':glyph_count,
            'maximum_native_glyph_geometry_delta_pt':maximum,'inventory':inv,
            'rgb_recomposition_check_254dpi':{'mean_channel_difference':float(delta.mean()),'maximum_channel_difference':int(delta.max()),'p99_channel_difference':float(np.percentile(delta,99))},
            'limitations':['Raster artwork remains limited by original source resolution; 600 dpi flattening does not invent photographic detail.','No PDF/X conformance certification claim.','Template exact local MediaBox comparison and metadata decisions remain as recorded for the native master.']}
    (HERE/'COLOUR-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'output':report['output'],'type_statistics':type_stats,'recomposition':report['rgb_recomposition_check_254dpi']},indent=2))

if __name__=='__main__':main()
