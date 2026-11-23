"""Separate cover-quality proposal. Never writes the approved cover or book."""
from pathlib import Path
import base64, json, hashlib, subprocess, xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageFilter
from trace import trace

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=ROOT/'output/pdf/cover-print-resolution-review'
ASSETS=HERE/'assets'
SVG='http://www.w3.org/2000/svg'
ET.register_namespace('',SVG)
SOURCE=HERE.parent/'selected-gold-cover/The-Vegetable-Guru-Front.svg'
ET.register_namespace('inkscape','http://www.inkscape.org/namespaces/inkscape')

def datauri(p):return 'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
def path(parent,d,fill,**kw):return ET.SubElement(parent,'{'+SVG+'}path',{'d':d,'fill':fill,'fill-rule':'evenodd',**kw})
def soft_mask(a,r=.65):return np.asarray(Image.fromarray(np.uint8(np.clip(a,0,1)*255)).filter(ImageFilter.GaussianBlur(r))).astype(float)/255

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    tree=ET.parse(SOURCE);root=tree.getroot();defs=root.find('{'+SVG+'}defs')
    blur=ET.SubElement(defs,'{'+SVG+'}filter',{'id':'ribbon-soft-shadow','x':'-20%','y':'-20%','width':'140%','height':'140%'})
    ET.SubElement(blur,'{'+SVG+'}feGaussianBlur',{'stdDeviation':'3'})
    for name,cols in [('youtube-paper',[('#ffffff','0'),('#f3f3f1','1')]),('weight-black',[('#242721','0'),('#090b09','1')])]:
        g=ET.SubElement(defs,'{'+SVG+'}linearGradient',{'id':name,'x1':'0','y1':'0','x2':'1','y2':'1'})
        for col,off in cols:ET.SubElement(g,'{'+SVG+'}stop',{'offset':off,'stop-color':col})
    parents={child:par for par in root.iter() for child in par}
    images=list(root.iter('{'+SVG+'}image'));records=[]
    for i,im in enumerate(images):
        if i==0:
            new=ASSETS/'wood-restored.png'
            if new.exists():
                par=parents[im];slot=list(par).index(im);wood=ET.Element('{'+SVG+'}g',{'id':'fine-wood-four-mirrored-tiles'})
                for transform in ['','translate(1100 0) scale(-1 1)','translate(0 1430) scale(1 -1)','translate(1100 1430) scale(-1 -1)']:
                    ET.SubElement(wood,'{'+SVG+'}image',{'width':'550','height':'715','preserveAspectRatio':'none','href':datauri(new),'transform':transform or 'translate(0 0)'})
                par.remove(im);par.insert(slot,wood)
            continue
        if i<12:continue
        src=Image.open(ASSETS/f'source-layer-{i:02d}.png').convert('RGBA')
        bbox=src.getbbox();crop=src.crop(bbox);a=np.array(crop).astype(float);alpha=a[:,:,3]/255
        par=parents[im];slot=list(par).index(im)
        g=ET.Element('{'+SVG+'}g',{'data-source-layer':str(i)})
        dx=float(im.get('x',0))+bbox[0];dy=float(im.get('y',0))+bbox[1]
        g.set('transform',f'translate({dx:g} {dy:g})')
        cnt=0
        if i<=30:
            colour=np.median(a[alpha>.8,:3],axis=0).astype(int)
            smooth=np.array(crop.getchannel('A').filter(ImageFilter.GaussianBlur(.45))).astype(float)/255
            d,n=trace(smooth,tolerance=.3);path(g,d,'#'+''.join(f'{c:02x}' for c in colour));cnt+=n
        else:
            yy,xx=np.indices(alpha.shape);rad=((xx-(crop.width-1)/2)/((crop.width-1)/2))**2+((yy-(crop.height-1)/2)/((crop.height-1)/2))**2
            if i==31:
                # Reconstruct the round paper edge; remove stray vegetable pixels from the old cutout.
                clean=np.clip((1-rad)*min(crop.size)/2+.5,0,1)
                d,n=trace(clean,tolerance=.3)
            else:d,n=trace(alpha,tolerance=.3)
            cnt+=n
            # Vector face; soft cast shadow remains a separate, non-lettering raster layer.
            shadow=ASSETS/f'badge-shadow-{i}.png'
            shadow_svg=f'<svg xmlns="{SVG}" width="{crop.width+32}" height="{crop.height+32}"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs><path transform="translate(17 20)" d="{d}" fill="#342b1d" opacity=".24" filter="url(#s)" fill-rule="evenodd"/></svg>'
            shadow_source=ASSETS/f'badge-shadow-{i}.svg';shadow_source.write_text(shadow_svg)
            subprocess.run(['/opt/homebrew/bin/rsvg-convert','-w',str((crop.width+32)*3),'-h',str((crop.height+32)*3),'-o',str(shadow),str(shadow_source)],check=True)
            ET.SubElement(g,'{'+SVG+'}image',{'x':'-16','y':'-16','width':str(crop.width+32),'height':str(crop.height+32),'href':datauri(shadow)})
            ellipse={'cx':str((crop.width-1)/2),'cy':str((crop.height-1)/2),'rx':str((crop.width-1)/2),'ry':str((crop.height-1)/2)}
            ET.SubElement(g,'{'+SVG+'}ellipse',{**ellipse,'fill':'#1b1c16','transform':'translate(0 1.3)'})
            ET.SubElement(g,'{'+SVG+'}ellipse',{**ellipse,'fill':'url(#youtube-paper)' if i==31 else 'url(#weight-black)'})
            r,gr,b=a[:,:,0],a[:,:,1],a[:,:,2]
            if i==31:
                # Colour separation follows the exact approved letter and play-icon shapes.
                green=np.clip((gr-np.maximum(r,b)-6)/35,0,1)*alpha
                green*=rad<.88**2
                red=np.clip((r-np.maximum(gr,b)-25)/130,0,1)*alpha
                for mask,col in [(green,'#07520b'),(red,'#ff0800')]:
                    dd,nn=trace(soft_mask(mask),min_area=.8,tolerance=.4);path(g,dd,col);cnt+=nn
                # The white play triangle is the enclosed hole in the red contour.
                # A fine dark rim carries the approved circular sticker outline.
                ET.SubElement(g,'{'+SVG+'}ellipse',{**ellipse,'fill':'none','stroke':'#aaa99e','stroke-width':'.45'})
            else:
                yellow=np.clip((np.minimum(r,gr)-b-28)/100,0,1)*alpha
                yellow*=rad<.91**2
                dd,nn=trace(soft_mask(yellow,.55),min_area=.6,tolerance=.35);path(g,dd,'#f5d13c');cnt+=nn
                ET.SubElement(g,'{'+SVG+'}ellipse',{'cx':ellipse['cx'],'cy':ellipse['cy'],'rx':str(float(ellipse['rx'])-2.5),'ry':str(float(ellipse['ry'])-2.5),'fill':'none','stroke':'#f5d13c','stroke-width':'2.8'})
        par.remove(im);par.insert(slot,g)
        records.append({'layer':i,'contours':cnt,'source_bbox':bbox,'translation':[dx,dy]})
    # The gold ribbon's filter would flatten its otherwise native path: separate its shadow.
    ribbon=root.find(".//*[@id='organic-ribbon']")
    shape=list(ribbon)[0];shape.attrib.pop('filter',None)
    cast=ET.Element('{'+SVG+'}path',{'d':shape.get('d'),'fill':'#342b1d','opacity':'.24','transform':'translate(1 4)','filter':'url(#ribbon-soft-shadow)'})
    ribbon.insert(0,cast)
    dest=HERE/'Vegetable-Guru-Front-Print-Resolution-Proposal.svg'
    tree.write(dest,encoding='unicode',xml_declaration=True)
    subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-f','pdf','-o',str(OUT/'Vegetable-Guru-Front-Print-Resolution-Proposal.pdf'),str(dest)],check=True)
    subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-w','1100','-h','1430','-o',str(OUT/'front-proposal-preview.png'),str(dest)],check=True)
    (HERE/'VECTOR-CONVERSION.json').write_text(json.dumps({'status':'proposal for visual review','method':'sub-pixel alpha/colour contours; cubic outlines; exact existing positions; no font substitution','source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'layers':records},indent=2)+'\n')
    print(dest);print('Vector contours',sum(r['contours'] for r in records))

if __name__=='__main__':main()
