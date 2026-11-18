"""Recolour the editable ribbon fill on the accepted lettering and spine layout."""
import json
import subprocess
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from xml.etree import ElementTree as ET

import numpy as np
from PIL import Image, ImageColor
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PREVIOUS = ROOT/'output/pdf/front-spacing-and-spine'
OUT = ROOT/'output/pdf/ribbon-colour-study'
PALETTE = json.loads((HERE/'palette.json').read_text())
RENDER = HERE.parent/'front-spacing-and-spine/render.cjs'
MASTER = PREVIOUS/'Front-Adjusted-Lettering.svg'
OLD_PDF = PREVIOUS/'The-Vegetable-Guru-Front-and-Spine-Study.pdf'
SVG = '{http://www.w3.org/2000/svg}'

def lightness(colour):
    rgb = np.array(ImageColor.getrgb(colour))/255
    linear = np.where(rgb <= .04045, rgb/12.92, ((rgb+.055)/1.055)**2.4)
    y = linear @ [.2126,.7152,.0722]
    return 116*np.cbrt(y)-16 if y>(6/29)**3 else (29/3)**3*y

def reference_front(page):
    pool = page['/Resources']['/XObject']
    # The native front and the rear wood have the same dimensions; distinguish
    # the front's RGB colour space before checking the actual rendered pixels.
    candidates = [key for key,obj in pool.items() if
        (obj.get_object().get('/Width'),obj.get_object().get('/Height'),
         obj.get_object().get('/ColorSpace')) == (1100,1430,'/DeviceRGB')]
    assert len(candidates)==1
    key = candidates[0]
    return key, np.frombuffer(pool[key].get_data(),dtype='uint8').reshape(1430,1100,3)

def comparison(frames, destination):
    c = Canvas(str(destination),pagesize=(297*mm,210*mm),pageCompression=1)
    c.setFillColorRGB(.027,.243,.157)
    c.setFont('Helvetica-Bold',20)
    c.drawString(13*mm,192*mm,'The Organic ribbon')
    c.setFont('Helvetica',11)
    c.drawString(13*mm,183.7*mm,'Five colours matched to the lightness of the original gold.')
    width=85*mm
    height=width*277/380
    for i,(entry,path) in enumerate(zip(PALETTE,frames)):
        x=(13+(i%3)*93)*mm
        top=(176-(i//3)*80)*mm
        with Image.open(path) as image:
            crop=image.crop((0,0,380,277)).convert('RGB')
            c.drawImage(ImageReader(crop),x,top-height,width,height)
        c.setFont('Helvetica-Bold',12.5)
        baseline=top-height-5.7*mm
        c.drawString(x,baseline,entry['name'])
        c.setFont('Helvetica',9)
        c.drawRightString(x+width,baseline,'Reference' if i==0 else f'Wrap · p. {i+1}')
    c.showPage()
    c.save()

def front_object(image):
    # Use the standard PDF image encoder, keeping the native ribbon and masks
    # exactly as rendered, with lossless compression.
    buf=BytesIO()
    c=Canvas(buf,pagesize=(185*mm,240*mm),pageCompression=1)
    with Image.open(image) as im: c.drawImage(ImageReader(im.convert('RGB')),0,0,185*mm,240*mm)
    c.showPage()
    c.save()
    pdf=PdfReader(buf)
    images=pdf.pages[0]['/Resources']['/XObject']
    assert len(images)==1
    return next(iter(images.values())).get_object()

def build():
    OUT.mkdir(parents=True,exist_ok=True)
    previous=PdfReader(OLD_PDF)
    baseline=previous.pages[0]
    key, original=reference_front(baseline)
    source=MASTER.read_text()
    root=ET.fromstring(source)
    ribbon=root.find(f".//{SVG}g[@id='organic-ribbon']/{SVG}path")
    old=f'fill="{ribbon.get("fill")}"'
    # Only the ribbon fill has this exact colour in the selected master.
    assert source.count(old)==1
    first=PALETTE[0]['fill']
    with TemporaryDirectory(prefix='veg-guru-ribbon-') as scratch:
        temp=Path(scratch)
        work=temp/'variant.svg'
        frames=[]
        for i,entry in enumerate(PALETTE):
            fill=entry['fill']
            assert abs(lightness(fill)-lightness(first))<.05
            work.write_text(source.replace(old,f'fill="{fill}"',1))
            file=temp/f'ribbon-{i}.png'
            subprocess.run(['node',str(RENDER),str(work),str(file)],check=True)
            with Image.open(file) as im:
                pixels=np.array(im.convert('RGB'))
            changed=np.any(pixels!=original,axis=2)
            assert changed[:241,:255].any() and not changed[241:].any() and not changed[:,255:].any()
            assert np.sum(np.all(pixels[:241,:255]==ImageColor.getrgb(fill),axis=2))>8000
            frames.append(file)
        index=temp/'comparison.pdf'
        comparison(frames,index)
        writer=PdfWriter()
        writer.add_page(PdfReader(index).pages[0])
        writer.add_outline_item('Ribbon colours side by side',0)
        for i,file in enumerate(frames[1:],1):
            page=writer.add_page(baseline)
            # Only substitute the front image. The exact preceding page content,
            # draw matrices, spine image, type and the entire rear are reused.
            resources=DictionaryObject(page['/Resources'])
            images=DictionaryObject(resources['/XObject'])
            images[key]=front_object(file).clone(writer).indirect_reference
            resources[NameObject('/XObject')]=images
            page[NameObject('/Resources')]=resources
            writer.add_outline_item(PALETTE[i]['name'],i)
        writer.add_metadata({'/Title':'The Vegetable Guru | The Organic ribbon','/Author':'John Lennon'})
        writer.compress_identical_objects()
        with (OUT/'The-Vegetable-Guru-Ribbon-Colours.pdf').open('wb') as dest: writer.write(dest)

if __name__=='__main__':
    build()
