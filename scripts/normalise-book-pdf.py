"""Exact production boxes for Chromium's sub-millimetre paper-size rounding.

No rescaling or rasterisation. The render already contains real bleed artwork.
Input PDF on stdin, normalised PDF on stdout; individual physical parity required.
"""
import argparse, io, sys
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject

p=argparse.ArgumentParser()
p.add_argument('--supplier',choices=['kdp','bookvault'],required=True)
p.add_argument('--start-page',type=int,required=True)
a=p.parse_args()
mm=72/25.4
bleed=3.175 if a.supplier=='kdp' else 3
width=188.175 if a.supplier=='kdp' else 191
height=240+2*bleed
reader=PdfReader(io.BytesIO(sys.stdin.buffer.read()))
writer=PdfWriter()
for index,page in enumerate(reader.pages):
    old_w,old_h=float(page.mediabox.width),float(page.mediabox.height)
    assert abs(old_w-width*mm)<1 and abs(old_h-height*mm)<1, 'Unexpected source geometry'
    page.add_transformation(Transformation().translate(0,height*mm-old_h))
    left=bleed if a.supplier=='bookvault' or (a.start_page+index)%2==0 else 0
    page.mediabox=RectangleObject([0,0,width*mm,height*mm])
    page.cropbox=RectangleObject(page.mediabox)
    page.bleedbox=RectangleObject(page.mediabox)
    page.trimbox=RectangleObject([left*mm,bleed*mm,(left+185)*mm,(bleed+240)*mm])
    writer.add_page(page)
writer.add_metadata({'/Title':'Compact gardening book — production review draft','/Subject':'Unapproved local production preparation; not a published or ordered proof'})
output=io.BytesIO()
writer.write(output)
sys.stdout.buffer.write(output.getvalue())
