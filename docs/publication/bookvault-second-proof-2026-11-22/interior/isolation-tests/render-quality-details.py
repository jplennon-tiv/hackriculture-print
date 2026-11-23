"""Equal-scale details from the original production and diagnostic interiors."""
from pathlib import Path
import json
import sys
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont

DOC=Path(__file__).resolve().parent
ROOT=DOC.parents[4]
OUT=DOC/'quality'
BASE=ROOT/'output/pdf/header-placement-review-2026-11-23'
SAMPLES=[
 (2,'Contents lettering',(0.05,0.225,0.46,0.435)),
 (7,'Calendar key',(0.115,0.71,0.62,0.86)),
 (24,'Guide header',(0.02,0.0,0.99,0.255)),
 (25,'Sowing diagram',(0.105,0.373,0.50,0.465)),
 (67,'Fraction replacement',(0.13,0.37,0.53,0.59)),
 (98,'Troubles header',(0.02,0.0,0.99,0.245)),
 (146,'Organic diagram',(0.06,0.205,0.89,0.39)),
 (154,'Compost photograph',(0.115,0.20,0.70,0.435)),
 (162,'Insect mesh photograph',(0.33,0.255,0.57,0.35)),
 (167,'Greenhouse plan',(0.13,0.59,0.43,0.80))]

def main():
    a=pdfium.PdfDocument(BASE/'Vegetable-Guru-Interior-Corrected-Headers.pdf')
    b=pdfium.PdfDocument(BASE/'Vegetable-Guru-Interior-All-300dpi.pdf')
    font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',26)
    selected={int(n) for n in sys.argv[1:]}
    previous=OUT/'DETAILS.json'
    records={r['page']:r for r in json.loads(previous.read_text())} if previous.exists() else {}
    for n,label,box in SAMPLES:
        if selected and n not in selected:
            continue
        images=[]
        for name,doc in [('approved',a),('diagnostic',b)]:
            page=doc[n-1]
            im=page.render(scale=300/72).to_pil().convert('RGB')
            rect=tuple(round(v*(im.width if j%2==0 else im.height)) for j,v in enumerate(box))
            crop=im.crop(rect)
            crop.save(OUT/'details'/f'{n:03d}-{name}.png')
            images.append(crop)
            page.close()
        canvas=Image.new('RGB',(images[0].width*2+30,images[0].height+65),'white')
        draw=ImageDraw.Draw(canvas)
        draw.text((10,10),f'P{n}  Approved production master',font=font,fill='black')
        draw.text((images[0].width+20,10),'300 dpi diagnostic',font=font,fill='black')
        canvas.paste(images[0],(0,60));canvas.paste(images[1],(images[0].width+30,60))
        canvas.save(OUT/'details'/f'{n:03d}-comparison.jpg',quality=98,subsampling=0)
        records[n]={'page':n,'label':label,'fractionalCrop':box,'renderDpi':300,'pixelSize':list(images[0].size)}
        print('Detail',n,label,flush=True)
    (OUT/'DETAILS.json').write_text(json.dumps([records[n] for n,_,_ in SAMPLES],indent=2)+'\n')

if __name__=='__main__':main()
