"""Build the trim-only design proof from the selected, independently layered front."""
import argparse
from base64 import b64decode
from copy import deepcopy
from io import BytesIO
from pathlib import Path
import shutil
import subprocess
from tempfile import TemporaryDirectory
from xml.etree import ElementTree as ET

import numpy as np
from PIL import Image, ImageFilter
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from lettering import layout, data_url

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
FRONT = HERE.parent/'original-harvest-light-study/Original-Harvest-Cast-Shadows.svg'
BACK = ROOT/'output/pdf/rear-cream-harvest/photo-grid-04/The-Vegetable-Guru-Garden-Photo-Grid-04.pdf'
OUT = ROOT/'output/pdf/front-spacing-and-spine'
SVG = 'http://www.w3.org/2000/svg'
INKSCAPE = 'http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('',SVG)
ET.register_namespace('inkscape',INKSCAPE)
PAL = [('sunshine','Sunshine yellow','#ffe22b','#103a21'),
       ('beetroot','Beetroot','#702546','#fff8e7'),
       ('forest','Forest green','#104c38','#fff8e7')]
W,H = 1100,1430

def item(root,id):
    return next(e for e in root.iter() if e.get('id')==id)

def layer_amount(root,path):
    backup=deepcopy(root)
    for e in list(backup):
        if e.tag==f'{{{SVG}}}g' and e.get('id') not in path: backup.remove(e)
    return backup

def bitmap(el):
    return Image.open(BytesIO(b64decode(el.get('href').partition(',')[2]))).convert('RGBA')

def render(root,name,folder):
    svgfile=folder/(name+'.svg')
    svgfile.write_bytes(ET.tostring(root,encoding='utf-8'))
    dest=folder/(name+'.png')
    subprocess.run(['node',str(HERE/'render.cjs'),str(svgfile),str(dest)],check=True)
    return Image.open(dest).convert('RGBA')

def flat_image(png):
    return ET.Element(f'{{{SVG}}}image',{'width':str(png.width),'height':str(png.height),'href':data_url(png)})

def subtree(root,groups):
    scene=layer_amount(root,[])
    for e in groups: scene.append(deepcopy(e))
    return scene

def spine_art(root,span,temp):
    board=np.asarray(render(layer_amount(root,['paper-colour','wood-grain']),'board',temp).convert('RGB'))
    # Both trim faces end on the same grain sample. A folded strip of adjacent
    # real grain meets both edges exactly, with a smooth turn in its centre.
    pos=span*.55*np.sin(np.linspace(0,np.pi,span))
    left=np.floor(pos).astype(int); f=(pos-left)[None,:,None]
    grain=np.rint(board[:,left]*(1-f)+board[:,left+1]*f).astype('uint8')
    groups=[item(root,k) for k in ['top-vegetables','bottom-vegetables']]
    old_casts=[e for g in groups for e in g if e.tag.endswith('}g')
               and (e.get('id','').endswith(('-wood','-on-board','-cast-shadow')))]
    old=np.asarray(render(subtree(root,old_casts),'existing-board-casts',temp)).astype(float)/255
    # Coordinates are relative to the front fold. The accepted projection goes
    # down and left. Offset raised fronds farther than the bodies of the crop.
    x=np.arange(-span,130); y=np.arange(H)
    projected=np.zeros((H,len(x)))
    for g in groups:
        photo=next(e for e in g if e.tag.endswith('}image'))
        pixels=render(subtree(root,[photo]),g.get('id')+'-cutout',temp)
        a=np.asarray(pixels.getchannel('A')).astype(float)/255
        if g is groups[0]:
            green=np.asarray(pixels)[:,:,:3].astype(float)
            greens=np.clip((green[:,:,1]-green[:,:,0]*.88)/21,0,1)
            sources=[(a*greens,78,69,3.8,.46),(a*(1-greens),59,50,5.0,.37)]
        else:
            sources=[(a,58,50,3.3,.49)]
        for mask,dx,dy,blur,opacity in sources:
            blurred=np.asarray(Image.fromarray(np.uint8(mask*255)).filter(ImageFilter.GaussianBlur(blur)))/255
            sx=x+dx
            valid=(sx>=0)&(sx<W)
            proj=np.zeros_like(projected)
            proj[dy:,valid]=blurred[:-dy,sx[valid]]*opacity
            projected=np.maximum(projected,proj)
    # Retain the existing shadow at the fold. Extrapolate its density and tone
    # only as far as a plausible cast, then merge with the leaf silhouettes.
    dist=np.arange(span-1,-1,-1)
    fall=np.exp(-(dist/17.)**1.6)
    rows=np.clip(y[:,None]-(dist[None,:]*.60).astype(int),0,H-1)
    col=np.minimum((dist*.24).astype(int),10)
    ext=old[rows,col[None,:]]
    base=ext[:,:,3]*fall
    target=projected[:,:span]
    extra=np.maximum(0,target-base)
    rgb=grain*(1-base[:,:,None])+ext[:,:,:3]*255*base[:,:,None]
    rgb=rgb*(1-extra[:,:,None])+np.array([62,47,28])*extra[:,:,None]
    # Feather the new cast into the front-side shadow. Its coverage follows the
    # same projected pixels on either side of the fold.
    existing=old[:,:130,3]
    opacity=np.maximum(0,projected[:,span:]-existing)
    fade=np.clip(1-np.arange(130)/80,0,1)
    strip=np.empty((H,130,4),dtype='uint8')
    strip[:,:,:3]=[62,47,28]
    strip[:,:,3]=np.uint8(opacity*fade*255)
    return Image.fromarray(np.uint8(np.clip(np.rint(rgb),0,255))),Image.fromarray(strip)

def prepare(temp,width):
    root=ET.parse(FRONT).getroot()
    title=item(root,'title')
    before=bitmap(title[0])
    svg,stats=layout(before.getchannel('A'))
    title.remove(title[0])
    outlines=ET.fromstring(f'<g xmlns="{SVG}">{svg}</g>')
    title.extend(list(outlines))
    (OUT/'Main-Title-Spaced.svg').write_text(f'<svg xmlns="{SVG}" viewBox="0 0 1100 1430">' + svg + '</svg>')
    title.set(f'{{{INKSCAPE}}}label','Main title · individually spaced lettering')
    span=round(width*W/185)
    spine,extension=spine_art(root,span,temp)
    spine.save(temp/'spine-grain-and-shadows.png')
    assert np.max(np.asarray(extension)[:,0,3])>15
    assert all(np.max(np.asarray(extension)[band,0,3])>15 for band in (slice(0,460),slice(850,H)))
    shadow=ET.Element(f'{{{SVG}}}g',{'id':'harvest-fold-casts',f'{{{INKSCAPE}}}groupmode':'layer',f'{{{INKSCAPE}}}label':'Harvest shadows at front fold'})
    shadow.append(flat_image(extension))
    root.insert(list(root).index(item(root,'top-vegetables')),shadow)
    # Keep the ribbon silhouette, original lettering alpha, and shadow intact.
    ribbon=item(root,'organic-ribbon')
    lettering=bitmap(ribbon[1]); bounds=lettering.getbbox(); alpha=lettering.getchannel('A').crop(bounds)
    ribbon.remove(ribbon[1])
    variants=[]
    for slug,label,paper,ink in PAL:
        ribbon[0].set('fill',paper)
        coloured=Image.new('RGBA',alpha.size,ink)
        coloured.putalpha(alpha)
        letters=flat_image(coloured)
        letters.attrib.update(x=str(bounds[0]),y=str(bounds[1]))
        ribbon.append(letters)
        render(root,slug,temp)
        if slug=='sunshine':
            shutil.copyfile(temp/(slug+'.svg'),OUT/'Front-Adjusted-Lettering.svg')
        variants.append((temp/(slug+'.png'),label))
        ribbon.remove(letters)
    before_art=render(ET.parse(FRONT).getroot(),'before',temp)
    current=np.asarray(Image.open(variants[0][0]).convert('RGB'))
    changed=np.any(current!=np.asarray(before_art.convert('RGB')),axis=2)
    allowed=np.zeros((H,W),dtype=bool)
    allowed[:250,:260]=True  # diagonal ribbon and antialiased edge
    allowed[350:752,100:1000]=True  # the three title rows
    allowed[:,:85]=True  # front-side shadow at fold
    assert not np.any(changed & ~allowed), 'Pixels changed outside the three intended regions'
    for art,_ in variants[1:]:
        delta=np.any(np.asarray(Image.open(art).convert('RGB'))!=current,axis=2)
        assert not delta[250:].any() and not delta[:,260:].any(), 'Ribbon options differ beyond the corner'
    print('Pair spacing in native artwork pixels:',stats)
    return variants

def review_page(c, variants, temp):
    w,h=297*mm,210*mm
    c.setPageSize((w,h))
    c.setFillColorRGB(.06,.22,.15)
    c.setFont('Helvetica-Bold',17)
    c.drawString(12*mm,194*mm,'Front cover details')
    c.setFont('Helvetica',10)
    c.drawString(12*mm,184*mm,'Ribbon colours on the selected harvest artwork')
    before=Image.open(temp/'before.png')
    topline=[(before,'Previous gold')]+[(Image.open(p),s) for p,s in variants]
    for i,(im,name) in enumerate(topline):
        x=(12+i*69)*mm
        crop=im.crop((0,0,345,245)).convert('RGB')
        c.drawImage(ImageReader(crop),x,130*mm,66*mm,66*245/345*mm)
        c.setFont('Helvetica-Bold',10)
        c.drawString(x,124*mm,name)
    c.setStrokeColorRGB(.85,.85,.8)
    c.line(12*mm,115*mm,285*mm,115*mm)
    c.setFont('Helvetica',10)
    c.drawString(12*mm,105*mm,'Main title spacing')
    for i,(im,label) in enumerate([(before,'Previous lettering'),(Image.open(variants[0][0]),'Re-spaced lettering')]):
        x=(12+i*139)*mm
        art=im.crop((78,336,1022,759)).convert('RGB')
        c.drawImage(ImageReader(art),x,36*mm,134*mm,134*423/944*mm)
        c.setFont('Helvetica-Bold',10)
        c.drawString(x,30*mm,label)
    c.showPage()

def build():
    parser=argparse.ArgumentParser()
    parser.add_argument('--spine-mm',type=float,default=12.5)
    args=parser.parse_args()
    width=args.spine_mm
    if not 6<=width<=30: parser.error('Expected a working spine width between 6 and 30 mm')
    OUT.mkdir(parents=True,exist_ok=True)
    with TemporaryDirectory(prefix='veg-guru-wrap-') as scratch:
        temp=Path(scratch)
        variants=prepare(temp,width)
        subprocess.run(['swift','-module-cache-path','/tmp/veg-preview-swift-cache',
                        str(HERE/'spine-type.swift'),str(ROOT/'public/fonts'),str(temp/'type.pdf'),str(width)],check=True)
        tube=PdfReader(temp/'type.pdf').pages[0]
        rear=PdfReader(BACK).pages[0]
        size=((370+width)*mm,240*mm)
        c=canvas.Canvas(str(temp/'faces.pdf'),pagesize=size)
        for art,_ in variants:
            c.drawImage(str(temp/'spine-grain-and-shadows.png'),185*mm,0,width*mm,240*mm)
            c.drawImage(str(art),(185+width)*mm,0,185*mm,240*mm)
            c.showPage()
        review_page(c,variants,temp)
        c.save()
        faces=PdfReader(temp/'faces.pdf')
        out=PdfWriter()
        for i,(_,name) in enumerate(variants):
            page=out.add_page(faces.pages[i])
            page.merge_page(rear)
            page.merge_transformed_page(tube,Transformation().translate(tx=185*mm))
            out.add_outline_item(name+' wrap',i)
        out.add_page(faces.pages[-1])
        out.add_outline_item('Ribbon and title comparisons',len(variants))
        out.add_metadata({'/Title':'The Vegetable Guru | Front lettering, ribbon colours and spine',
                          '/Author':'John Lennon','/Subject':f'Design review at trim with a provisional {width:g} mm spine.'})
        # The same rear panel and type belong on every proof. Share those streams.
        out.compress_identical_objects()
        with (OUT/'The-Vegetable-Guru-Front-and-Spine-Study.pdf').open('wb') as f:
            out.write(f)

if __name__=='__main__':
    build()
