"""Reconstruct cover lettering from genuine typeface curves, never pixel contours."""
from pathlib import Path
import json,hashlib,subprocess,math,xml.etree.ElementTree as ET
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[4]
OUT=ROOT/'output/pdf/cover-print-resolution-review'
TMP=ROOT/'tmp/cover-print-resolution/fonts'
NS='http://www.w3.org/2000/svg';TAG='{'+NS+'}'
ET.register_namespace('',NS);ET.register_namespace('inkscape','http://www.inkscape.org/namespaces/inkscape')

def fonts():
    TMP.mkdir(parents=True,exist_ok=True)
    binary=TMP/'font_outlines'
    subprocess.run(['clang',str(HERE/'font_outlines.c'),'-I/opt/homebrew/opt/freetype/include/freetype2','-L/opt/homebrew/opt/freetype/lib','-lfreetype','-o',str(binary)],check=True)
    sources={'lilita':ROOT/'public/fonts/richer-a-1.woff2','arial':'/System/Library/Fonts/Supplemental/Arial Bold.ttf'}
    data={}
    for name,file in sources.items():
        data[name]=json.loads(subprocess.check_output([str(binary),str(file)]))
    return data,sources

def run(parent,text,font):
    g=ET.SubElement(parent,TAG+'g',{'aria-label':text,'data-type-source':'font-outline'})
    x=0;bounds=[]
    for char in text:
        item=font['glyphs'][str(ord(char))];b=item['bbox']
        if item['path']:
            ET.SubElement(g,TAG+'path',{'d':item['path'],'transform':f'translate({x} 0)'})
            bounds.append((x+b[0],b[1],x+b[2],b[3]))
        x+=item['advance']
    b=[min(b[0] for b in bounds),min(b[1] for b in bounds),max(b[2] for b in bounds),max(b[3] for b in bounds)]
    return g,b

def fit(parent,text,font,box,fill):
    x,y,w,h=box;g,b=run(parent,text,font);sx=w/(b[2]-b[0]);sy=h/(b[3]-b[1])
    g.set('transform',f'matrix({sx:.9f} 0 0 {-sy:.9f} {x-sx*b[0]:.9f} {y+sy*b[3]:.9f})')
    g.set('fill',fill);return g

def arc(parent,text,font,size,radius,cx,cy,bottom=False):
    scale=size/font['units_per_em'];advance=[font['glyphs'][str(ord(c))]['advance']*scale for c in text];total=sum(advance)
    cursor=-total/2
    g=ET.SubElement(parent,TAG+'g',{'aria-label':text,'data-type-source':'font-outline','fill':'#f5d13c'})
    for ch,adv in zip(text,advance):
        delta=(cursor+adv/2)/radius
        a=(math.pi/2-delta) if bottom else (-math.pi/2+delta)
        rotation=math.degrees(a)-90 if bottom else math.degrees(a)+90
        x=cx+radius*math.cos(a);y=cy+radius*math.sin(a)
        item=font['glyphs'][str(ord(ch))]
        t=f'translate({x:.6f} {y:.6f}) rotate({rotation:.6f}) scale({scale:.9f} {-scale:.9f}) translate({-item["advance"]/2} 0)'
        ET.SubElement(g,TAG+'path',{'d':item['path'],'transform':t});cursor+=adv

def main():
    f,sourcefonts=fonts();tree=ET.parse(HERE/'rejected-trace-v1/Vegetable-Guru-Front-Print-Resolution-Proposal.svg');root=tree.getroot()
    layers=json.loads((HERE/'SOURCE-LAYERS.json').read_text());records=[]
    for i in range(12,33):
        g=root.find(f".//*[@data-source-layer='{i}']")
        if i<=30:
            for child in list(g):g.remove(child)
        else:
            for child in list(g):
                if child.tag not in [TAG+'image',TAG+'ellipse']:g.remove(child)
        g.set('data-type-reconstruction','native-font-curves')
        if i<28:
            char=layers[i]['attrs']['id'].rsplit('-',1)[-1]
            im=Image.open(HERE/'assets'/f'source-layer-{i:02d}.png');bb=im.getbbox()
            width,height=bb[2]-bb[0],bb[3]-bb[1]
            x=float(layers[i]['attrs'].get('x',0))+bb[0];y=float(layers[i]['attrs'].get('y',0))+bb[1]
            if 15<=i<=23:y-=14
            elif i>=24:
                y=590+(y-582)*160/168;height*=160/168
            g.set('transform',f'translate({x:.6f} {y:.6f})')
            fit(g,char,f['lilita'],(0,0,width,height),'#073e28')
            records.append({'element':layers[i]['attrs']['id'],'font':'Lilita One','position':'accepted horizontal boxes; revised line clearance for native g descender','box':[x,y,width,height]})
        elif i==28:
            # The g descenders and the dots on the following line overlap vertically in the approved layout.
            g.set('transform','translate(0 0)')
            fit(g,'Your at-a-glance',f['lilita'],(328,764,442,57),'#073e28')
            fit(g,'growing companion',f['lilita'],(295,809,507,57),'#073e28')
        elif i==29:
            g.set('transform','translate(0 0)');fit(g,'John Lennon',f['lilita'],(328,895,437,57),'#073e28')
        elif i==30:
            # Map the original ribbon's oriented ink bounds; retain the strip and its angle.
            a=np.asarray(Image.open(HERE/'assets/source-layer-30.png').getchannel('A'))
            yy,xx=np.where(a>128);x=xx+24.5;y=yy+8.5;angle=-math.degrees(math.atan2(143,153));rad=math.radians(angle)
            u=np.cos(rad)*x+np.sin(rad)*y;v=-np.sin(rad)*x+np.cos(rad)*y
            g.set('transform',f'rotate({angle:.9f})')
            fit(g,'100% Organic',f['arial'],(float(u.min()),float(v.min()),float(u.max()-u.min()),float(v.max()-v.min())),'#103a21')
            records.append({'element':'organic-ribbon','font':'Arial Bold','angle_degrees':angle})
        elif i==31:
            typegroup=ET.SubElement(g,TAG+'g',{'transform':'rotate(4.5 135 140)'})
            ET.SubElement(typegroup,TAG+'rect',{'x':'89','y':'32','width':'86','height':'58','rx':'16','fill':'#ff0800'})
            ET.SubElement(typegroup,TAG+'path',{'d':'M121 46 L121 77 L148 61.5 Z','fill':'white'})
            for text,box in [('As seen on',(45,95,180,31)),('YouTube',(54,132,163,35)),('@Hackriculture',(28,172,213,30))]:fit(typegroup,text,f['arial'],box,'#07520b')
            records.append({'element':'youtube-sticker','font':'Arial Bold','angle_degrees':4.5})
        else:
            # Smooth vector geometry replaces the traced weight symbol as well as its lettering.
            d='M84 38 H104 Q111 38 111 45 V48 Q111 55 104 55 H84 Q77 55 77 48 V45 Q77 38 84 38 Z M85 55 C85 61 80 64 73 64 H62 Q58 64 56 70 L36 122 Q33 131 43 131 H137 Q146 131 143 122 L123 70 Q121 64 116 64 H111 C104 64 100 61 100 55'
            ET.SubElement(g,TAG+'path',{'d':d,'fill':'none','stroke':'#f5d13c','stroke-width':'3.2','stroke-linecap':'round','stroke-linejoin':'round'})
            for text,box in [('lb',(57,75,25,22)),('oz',(99,80,23,17)),('ft',(57,100,24,23)),('in',(103,100,25,23))]:fit(g,text,f['arial'],box,'#f5d13c')
            for y in [88,112]:ET.SubElement(g,TAG+'circle',{'cx':'91','cy':str(y),'r':'2.2','fill':'#f5d13c'})
            arc(g,'TRADITIONAL',f['arial'],22,67,91,92)
            arc(g,'MEASUREMENTS',f['arial'],19,82,91,92,True)
            records.append({'element':'measurements-sticker','font':'Arial Bold','curved_labels':'each glyph uses original font curves, rotated on circular baselines'})
    dest=HERE/'Vegetable-Guru-Front-Print-Resolution-Proposal.svg';tree.write(dest,encoding='unicode',xml_declaration=True)
    subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-f','pdf','-o',str(OUT/'Vegetable-Guru-Front-Print-Resolution-Proposal.pdf'),str(dest)],check=True)
    subprocess.run(['/opt/homebrew/bin/rsvg-convert','--unlimited','-w','1100','-h','1430','-o',str(OUT/'front-proposal-preview.png'),str(dest)],check=True)
    record={'revision':2,'status':'corrected proposal awaiting review','reason':'John rejected raster-derived vector curves as melted/notched','method':'FreeType loads the bundled Lilita One and system Arial Bold; font quadratic/cubic outlines are copied without tracing or smoothing. Placement uses the approved letter/text regions.','fonts':{k:{'file':str(v),'sha256':hashlib.sha256(Path(v).read_bytes()).hexdigest()} for k,v in sourcefonts.items()},'elements':records,'unchanged':'Photographs, wood treatment, rear panel and overall composition from the preceding quality proposal.','design_limit':'Clean native letterforms deliberately replace the original generated raster letterforms; exact appearance requires John\u2019s review.'}
    (HERE/'VECTOR-CONVERSION.json').write_text(json.dumps(record,indent=2)+'\n');print('Native font outline front built.')

if __name__=='__main__':main()
