"""Adapt the exact approved panels to a measured Bookvault template.

The trim artwork remains native. Only the 3 mm outer bleed strips are rendered
at 600 dpi: original front geometry extends into bleed, while rear/spine
wood edges reflect outward, retaining the exact colours at the trim.
No colour conversion, resampling of in-trim photographs or text tracing occurs.
"""
from pathlib import Path
from io import BytesIO
import argparse, hashlib, json, subprocess, copy, xml.etree.ElementTree as ET
import numpy as np
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject, RectangleObject, DecodedStreamObject, ContentStream
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
import pypdfium2 as pdfium

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUT = ROOT / 'output/pdf/bookvault-second-proof-2026-11-22/cover'
SOURCE_DIR = ROOT / 'docs/publication/cover-versions/version-1-1/print-resolution-review'
SOURCE_OUT = ROOT / 'output/pdf/cover-print-resolution-review'
FRONT = SOURCE_OUT / 'Vegetable-Guru-Front-Print-Resolution-Proposal.pdf'
REAR = SOURCE_OUT / 'Vegetable-Guru-Rear-Print-Resolution-Proposal.pdf'
APPROVED = SOURCE_OUT / 'Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf'
GRAIN = SOURCE_DIR / 'assets/retained-spine-grain-and-shadows.png'
W, H, BLEED = 185*mm, 240*mm, 3*mm
EXPECTED = {
    FRONT: '0e43eff8b027ddd78592f2026afb49d721fb1093672a2f503c73a6382e4c062b',
    REAR: '8ca5faa9c2a359a11f31b31949bb55d7e9ae2ff9d7facc18a6c8c77adb2db077',
    APPROVED: '5b1f446d33b80c5e4f4f7f340f6b772aa6c016f74ca6d41f4587391eeecdbf2b',
}

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def form(writer, page):
    f = DecodedStreamObject()
    f.set_data(page.get_contents().get_data())
    f.update({NameObject('/Type'): NameObject('/XObject'), NameObject('/Subtype'): NameObject('/Form'),
              NameObject('/BBox'): RectangleObject(page.mediabox),
              NameObject('/Resources'): page['/Resources'].clone(writer)})
    if '/Group' in page:
        f[NameObject('/Group')] = page['/Group'].clone(writer)
    return writer._add_object(f)

def install_stream(writer, page, data):
    s = DecodedStreamObject(); s.set_data(data)
    page[NameObject('/Contents')] = writer._add_object(s)

def render(path, dpi):
    doc = pdfium.PdfDocument(str(path))
    image = doc[0].render(scale=dpi/72).to_pil().convert('RGB')
    doc.close()
    return image

def front_bleed_source():
    """Extend existing SVG geometry; do not reflect lettering or vegetables.

    The source's preserveAspectRatio=meet gives a small horizontal offset.
    Express the larger viewport at that exact same physical scale so positions
    inside trim stay identical. The original PDF is still used inside trim.
    """
    ns='http://www.w3.org/2000/svg'; tag='{'+ns+'}'
    ET.register_namespace('',ns)
    tree=ET.parse(SOURCE_DIR/'Vegetable-Guru-Front-Print-Resolution-Proposal.svg')
    root=tree.getroot()
    unit_mm=240/1430; offset_mm=(185-1100*unit_mm)/2
    xmin=-(3+offset_mm)/unit_mm;ymin=-3/unit_mm
    width=191/unit_mm;height=246/unit_mm
    root.set('width','191mm');root.set('height','246mm')
    root.set('viewBox',f'{xmin:.12f} {ymin:.12f} {width:.12f} {height:.12f}')
    paper=root.find(f".//*[@id='paper-colour']/{tag}rect")
    paper.attrib.update({'x':str(xmin),'y':str(ymin),'width':str(width),'height':str(height)})
    wood=root.find(".//*[@id='fine-wood-four-mirrored-tiles']")
    base=wood.find(tag+'image');base.set('id','wood-bleed-reference')
    # Continue the existing mirrored texture tile grid outside its original bounds.
    for row in range(-1,3):
        for col in range(-1,3):
            if row in [0,1] and col in [0,1]:continue
            sx=-1 if col%2 else 1;sy=-1 if row%2 else 1
            x=(col+(1 if sx<0 else 0))*550;y=(row+(1 if sy<0 else 0))*715
            ET.SubElement(wood,tag+'use',{'href':'#wood-bleed-reference','transform':f'translate({x} {y}) scale({sx} {sy})'})
    extended_ribbon=f'M{xmin} {143-143/153*xmin} L{(143-ymin)*153/143} {ymin} H{(239-ymin)*254/239} L{xmin} {239-239/254*xmin} Z'
    changed=0
    for path in root.findall('.//'+tag+'path'):
        if path.get('d')=='M0 143 L153 0 H254 L0 239 Z':
            path.set('d',extended_ribbon);changed+=1
    assert changed==2,changed
    svg=HERE/'front-bleed-source.svg';tree.write(svg,encoding='unicode',xml_declaration=True)
    pdf=OUT/'front-bleed-source.pdf'
    subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-f','pdf','-o',str(pdf),str(svg)],check=True)
    return pdf,svg

def snapshot_fonts(resources, location='page', seen=None):
    if seen is None: seen=set()
    resources = resources.get_object()
    found=[]
    font_resources=resources.get('/Font', {})
    font_resources=font_resources.get_object() if hasattr(font_resources,'get_object') else font_resources
    for key, obj in font_resources.items():
        f=obj.get_object()
        descendants=f.get('/DescendantFonts', [f])
        for d in descendants:
            d=d.get_object(); descriptor=d.get('/FontDescriptor', {})
            descriptor=descriptor.get_object() if hasattr(descriptor, 'get_object') else descriptor
            embedded=any(k in descriptor for k in ['/FontFile','/FontFile2','/FontFile3']) or d.get('/Subtype')=='/Type3'
            found.append({'location':location+'/'+key, 'font':str(d.get('/BaseFont',f.get('/BaseFont'))), 'embedded':embedded})
    xobjects=resources.get('/XObject', {})
    xobjects=xobjects.get_object() if hasattr(xobjects,'get_object') else xobjects
    for key, obj in xobjects.items():
        obj=obj.get_object()
        if obj.get('/Subtype')=='/Form' and id(obj) not in seen:
            seen.add(id(obj)); found.extend(snapshot_fonts(obj.get('/Resources', resources), location+'/'+key, seen))
    return found

def remove_unused_background_font(page, reader):
    """Drop ReportLab's empty text setup in the rear's wood-only form.

    This is not visible lettering. It has no Tj/TJ operators and only declares
    an unused unembedded Helvetica resource, which otherwise confuses preflight.
    """
    background=page['/Resources']['/XObject']['/Im1'].get_object()
    contents=ContentStream(background,reader)
    assert not any(op in [b'Tj',b'TJ',b"'",b'"'] for _,op in contents.operations)
    assert str(background['/Resources']['/Font']['/F1'].get_object()['/BaseFont'])=='/Helvetica'
    raw=background.get_data();empty=b'BT /F1 12 Tf 14.4 TL ET'
    assert raw.count(empty)==1
    background.set_data(raw.replace(empty,b''))
    background['/Resources'].pop('/Font',None)

def main():
    parser=argparse.ArgumentParser()
    mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--template', help='Downloaded current supplier cover template')
    mode.add_argument('--geometry-record', help='Explicit supplier-issued geometry provenance when template bytes are unavailable')
    args=parser.parse_args()
    for path, expected in EXPECTED.items(): assert sha(path)==expected,(path,'unrecognised approved source')
    if args.template:
        template=Path(args.template).resolve()
        assert template.is_file(),template
        tp=PdfReader(template).pages[0]
        media_w, media_h=map(float,(tp.mediabox.width,tp.mediabox.height))
        template_record={'file':str(template.relative_to(ROOT)),'sha256':sha(template),'media_mm':[media_w/mm,media_h/mm],
                         'local_template_mediabox_verified':True}
    else:
        geometry_path=Path(args.geometry_record).resolve()
        provenance=json.loads(geometry_path.read_text())
        assert provenance['source_url'].startswith('https://bookvault-template.s3.eu-west-1.amazonaws.com/v4_PerfectBound_Cover_240_185_')
        assert str(provenance['spine_mm']) in provenance['source_url']
        media_w=(370+provenance['spine_mm']+6)*mm;media_h=246*mm
        template_record={'geometry_record':str(geometry_path.relative_to(ROOT)),'geometry_record_sha256':sha(geometry_path),
                         'source_url':provenance['source_url'],'media_mm':[media_w/mm,media_h/mm],
                         'local_template_mediabox_verified':False,
                         'basis':'Exact spine value in fresh supplier-generated template URL; browser-visible printed measurements rounded. Local template bytes unavailable.'}
    assert abs(media_h/mm-246)<0.015,media_h/mm
    spine=media_w-2*W-2*BLEED
    assert 10<spine/mm<16,spine/mm
    OUT.mkdir(parents=True,exist_ok=True)
    type_path=OUT/'spine-type.pdf'
    result=subprocess.run(['swift','-module-cache-path','/tmp/vegetable-guru-swift-cache',
                           str(SOURCE_DIR/'spine-type-clear.swift'),str(ROOT/'public/fonts'),
                           str(type_path),str(spine/mm)],check=True,capture_output=True,text=True)
    geometry=json.loads(result.stdout)
    assert geometry[1]['ink_bottom_mm']<155
    assert geometry[1]['ink_top_mm']-geometry[0]['ink_bottom_mm']>6
    b=BytesIO(); c=canvas.Canvas(b,pagesize=(spine,H)); c.drawImage(str(GRAIN),0,0,spine,H); c.save()
    spine_page=PdfReader(BytesIO(b.getvalue())).pages[0]
    content=spine_page.get_contents(); inside=False; operations=[]
    for values,operator in content.operations:
        if operator==b'BT':inside=True;continue
        if operator==b'ET':inside=False;continue
        if not inside:operations.append((values,operator))
    content.operations=operations;spine_page[NameObject('/Contents')]=content
    spine_page['/Resources'].pop('/Font',None)
    spine_page.merge_page(PdfReader(type_path).pages[0])
    rear_reader=PdfReader(REAR); rear_page=rear_reader.pages[0]
    remove_unused_background_font(rear_page,rear_reader)
    panels=[('Rear',rear_page,0),('Spine',spine_page,W),('Front',PdfReader(FRONT).pages[0],W+spine)]
    trim_writer=PdfWriter(); trim=trim_writer.add_blank_page(2*W+spine,H)
    xobs=DictionaryObject(); ops=[]
    for name, p, x in panels:
        xobs[NameObject('/'+name)] = form(trim_writer,p)
        ops.append(f'q 1 0 0 1 {x:.10f} 0 cm /{name} Do Q')
    trim[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):xobs})
    install_stream(trim_writer,trim,('\n'.join(ops)+'\n').encode())
    trim_writer.add_metadata({'/Title':'The Vegetable Guru — second-proof cover at trim','/Author':'John Lennon'})
    trim_path=OUT/'Vegetable-Guru-Second-Proof-Cover-Trim.pdf'; trim_writer.write(trim_path)

    # Rendering only supplies the narrow external bleed strips. All in-trim art
    # remains the original native PDF forms, including genuine font outlines.
    edge_source=render(trim_path,600)
    px_w,px_h=edge_source.size
    bx=round(BLEED/(2*W+spine)*px_w); by=round(BLEED/H*px_h)
    boxes={
        'bottom':((0,px_h-by,px_w,px_h),Image.Transpose.FLIP_TOP_BOTTOM,(BLEED,0,2*W+spine,BLEED)),
        'top':((0,0,px_w,by),Image.Transpose.FLIP_TOP_BOTTOM,(BLEED,BLEED+H,2*W+spine,BLEED)),
        'left':((0,0,bx,px_h),Image.Transpose.FLIP_LEFT_RIGHT,(0,BLEED,BLEED,H)),
        'right':((px_w-bx,0,px_w,px_h),Image.Transpose.FLIP_LEFT_RIGHT,(BLEED+2*W+spine,BLEED,BLEED,H)),
        'bottom-left':((0,px_h-by,bx,px_h),Image.Transpose.ROTATE_180,(0,0,BLEED,BLEED)),
        'bottom-right':((px_w-bx,px_h-by,px_w,px_h),Image.Transpose.ROTATE_180,(BLEED+2*W+spine,0,BLEED,BLEED)),
        'top-left':((0,0,bx,by),Image.Transpose.ROTATE_180,(0,BLEED+H,BLEED,BLEED)),
        'top-right':((px_w-bx,0,px_w,by),Image.Transpose.ROTATE_180,(BLEED+2*W+spine,BLEED+H,BLEED,BLEED)),
    }
    buf=BytesIO(); c=canvas.Canvas(buf,pagesize=(media_w,media_h)); bleed_records=[]
    for name,(box,flip,rect) in boxes.items():
        im=edge_source.crop(box).transpose(flip)
        c.drawImage(ImageReader(im),*rect)
        bleed_records.append({'edge':name,'pixels':list(im.size),'placement_mm':[v/mm for v in rect]})
    # Replace the front part of those provisional strips with genuine extended
    # source geometry, so diagonal ribbon/glyph shapes continue through trim.
    extended_pdf,extended_svg=front_bleed_source()
    front_ext=render(extended_pdf,600)
    sx=front_ext.width/191;sy=front_ext.height/246
    def crop_mm(x,y,w,h):
        return front_ext.crop((round(x*sx),round(y*sy),round((x+w)*sx),round((y+h)*sy)))
    front_x=BLEED+W+spine
    front_strips=[('front-top',crop_mm(3,0,185,3),(front_x,H+BLEED,W,BLEED)),
                  ('front-bottom',crop_mm(3,243,185,3),(front_x,0,W,BLEED)),
                  ('front-right-and-corners',crop_mm(188,0,3,246),(media_w-BLEED,0,BLEED,media_h))]
    for name,im,rect in front_strips:
        c.drawImage(ImageReader(im),*rect)
        bleed_records.append({'edge':name,'method':'extended approved SVG geometry','pixels':list(im.size),'placement_mm':[v/mm for v in rect]})
    front_ext.close()
    c.save(); edge_source.close()
    bleed_page=PdfReader(BytesIO(buf.getvalue())).pages[0]
    # Strip ReportLab's unused default text/font setup from the bleed-only page.
    cs=bleed_page.get_contents(); inside=False; keep=[]
    for values,operator in cs.operations:
        if operator==b'BT': inside=True; continue
        if operator==b'ET': inside=False; continue
        if not inside:keep.append((values,operator))
    cs.operations=keep
    bleed_page[NameObject('/Contents')]=cs
    bleed_page['/Resources'].pop('/Font',None)
    writer=PdfWriter(); page=writer.add_page(bleed_page)
    page['/Resources']['/XObject'][NameObject('/ApprovedTrim')]=form(writer,PdfReader(trim_path).pages[0])
    data=page.get_contents().get_data()+f'\nq 1 0 0 1 {BLEED:.10f} {BLEED:.10f} cm /ApprovedTrim Do Q\n'.encode()
    install_stream(writer,page,data)
    page[NameObject('/MediaBox')]=RectangleObject([0,0,media_w,media_h])
    page[NameObject('/CropBox')]=RectangleObject([0,0,media_w,media_h])
    page[NameObject('/BleedBox')]=RectangleObject([0,0,media_w,media_h])
    page[NameObject('/TrimBox')]=RectangleObject([BLEED,BLEED,media_w-BLEED,media_h-BLEED])
    writer.add_metadata({'/Title':'The Vegetable Guru — second-proof cover with bleed','/Author':'John Lennon',
                         '/Subject':'Native RGB production-preparation master; supplier-template geometry; 3 mm outer bleed. Metadata and final preflight pending.'})
    dest=OUT/'Vegetable-Guru-Second-Proof-Cover.pdf'
    writer.write(dest)
    final=PdfReader(dest).pages[0]
    final_trim=final['/Resources']['/XObject']['/ApprovedTrim'].get_object()
    source_preservation={}
    for name,path in [('Rear',REAR),('Front',FRONT)]:
        ob=final_trim['/Resources']['/XObject']['/'+name].get_object()
        data=PdfReader(path).pages[0].get_contents().get_data()
        assert ob.get_data()==data,name
        source_preservation[name]={'native_content_stream_exact':True,'sha256':hashlib.sha256(data).hexdigest()}
    rear=final_trim['/Resources']['/XObject']['/Rear'].get_object()
    rear_source=PdfReader(REAR).pages[0]
    protected=[]
    for i in range(2,18):
        old=rear_source['/Resources']['/XObject'][f'/Im{i}'].get_object()
        new=rear['/Resources']['/XObject'][f'/Im{i}'].get_object()
        assert old._data==new._data
        protected.append({'photo':i-1,'encoded_jpeg_sha256':hashlib.sha256(new._data).hexdigest(),'exact':True})
    fonts=snapshot_fonts(final['/Resources'])
    assert all(f['embedded'] for f in fonts),fonts
    # The outer raster strips add no duplicate hidden text to extraction.
    assert final.extract_text()==PdfReader(trim_path).pages[0].extract_text()
    preview=render(dest,127);preview.save(OUT/'Vegetable-Guru-Second-Proof-Cover-Preview.png')
    detail=render(dest,254)
    x0=round((3+185)*10);x1=round((3+185+spine/mm)*10)
    detail.crop((x0,30,x1,2430)).transpose(Image.Transpose.ROTATE_90).save(HERE/'spine-detail.png')
    detail.crop((x1-50,0,min(detail.width,x1+650),350)).save(HERE/'front-ribbon-bleed-detail.png')
    detail.close()
    # Compare using identical media coordinates to remove image sampling-grid effects.
    ref_inner_writer=PdfWriter();inner=ref_inner_writer.add_blank_page(2*W+spine,H)
    # Re-read the unmodified approved rear for this visual reference; this also
    # proves that removing its unused background font had no visual effect.
    reference_parts=[('Rear',PdfReader(REAR).pages[0],0),('Spine',spine_page,W),('Front',PdfReader(FRONT).pages[0],W+spine)]
    ref_xobjects=DictionaryObject();ref_ops=[]
    for name,p,x in reference_parts:
        ref_xobjects[NameObject('/'+name)]=form(ref_inner_writer,p)
        ref_ops.append(f'q 1 0 0 1 {x:.10f} 0 cm /{name} Do Q')
    inner[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):ref_xobjects})
    install_stream(ref_inner_writer,inner,('\n'.join(ref_ops)+'\n').encode())
    innerbuf=BytesIO();ref_inner_writer.write(innerbuf)
    ref_writer=PdfWriter();rp=ref_writer.add_blank_page(media_w,media_h)
    rp[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):DictionaryObject({NameObject('/Reference'):form(ref_writer,PdfReader(BytesIO(innerbuf.getvalue())).pages[0])})})
    install_stream(ref_writer,rp,f'q 1 0 0 1 {BLEED:.10f} {BLEED:.10f} cm /Reference Do Q'.encode())
    refbuf=BytesIO();ref_writer.write(refbuf)
    d=pdfium.PdfDocument(refbuf.getvalue());reference=d[0].render(scale=254/72).to_pil().convert('RGB')
    actual=render(dest,254)
    a=np.asarray(actual)[32:2428,32:-32].astype(int);b=np.asarray(reference)[32:2428,32:-32].astype(int)
    delta=np.abs(a-b);assert delta.max()==0,(delta.mean(),delta.max())
    report={'date':'2026-11-22','status':'Native cover prepared; visual review and stage-5 production preflight pending',
            'template':template_record,
            'spine_mm':spine/mm,'panels_mm':[185,spine/mm,185],'bleed_mm':3,
            'spine_type':geometry,'source_preservation':source_preservation,'protected_rear_photographs':protected,
            'nonvisual_cleanup':'Removed only the empty BT/ET default Helvetica setup and unused unembedded font resource from the rear wood-background form. No drawn text, photographs or outer rear content changed.',
            'embedded_fonts':fonts,'trim_pixel_comparison_254dpi':{'reference':'Unmodified approved front/rear PDFs positioned on the same viewport, plus the adapted spine. Includes verification that removal of unused background font changes no visible pixels.','maximum_channel_difference':int(delta.max()),'mean_channel_difference':float(delta.mean())},
            'bleed_method':'Only external 3 mm strips. Front: existing SVG geometry extended beyond trim at the original physical scale, with continued wood tiles and extended Organic ribbon polygon; real font paths and photograph bounds retained. Rear and spine wood-only edges: exact edge artwork reflected outward. Strips rendered at 600 dpi. Native approved trim artwork unchanged; no empty padding, whole-cover stretch, image generation or hidden duplicated text.',
            'front_bleed_geometry':{'svg':str(extended_svg.relative_to(ROOT)),'svg_sha256':sha(extended_svg),'pdf':str(extended_pdf.relative_to(ROOT)),'pdf_sha256':sha(extended_pdf)},
            'bleed_strips':bleed_records,'sources':[{'file':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in [FRONT,REAR,APPROVED,GRAIN]],
            'output':{'file':str(dest.relative_to(ROOT)),'bytes':dest.stat().st_size,'sha256':sha(dest)},
            'limits':['Native RGB with existing transparency; no CMYK/PDF-X conversion or conformance claim.','Copyright/ISBN/price decisions and final supplier preflight remain later stages.','The provisional spine background is rescaled only horizontally to the supplier width; all type retains its approved physical size and vertical position.','Front bleed extends original SVG geometry; only rear/spine wood-only edges use reflection. No invented image content.']}
    if not template_record['local_template_mediabox_verified']:
        report['limits'].append('Downloaded template bytes and exact MediaBox comparison remain pending; dimensions follow the fresh supplier-issued URL, not a guessed spine.')
    (HERE/'CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'output':report['output'],'spine_mm':spine/mm,'fonts':len(fonts),'trim_pixel_difference':int(delta.max())},indent=2))

if __name__=='__main__':main()
