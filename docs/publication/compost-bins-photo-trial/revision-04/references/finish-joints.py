import subprocess, json
from pathlib import Path
D=Path(__file__).parent
master=Path('generated_images/exec-7bf5817f-4e87-488b-a23d-9c340bf2745d.png')
cmd=['magick','-limit','thread','3',str(master),'-write','mpr:photo','+delete','mpr:photo']
faces=[]
def face(dst,src,tone=100):
    src=[tuple(v) for v in src];dst=[tuple(v) for v in dst]
    mapping=' '.join(f'{x},{y} {u:.3f},{v:.3f}' for (x,y),(u,v) in zip(src,dst))
    poly='polygon '+' '.join(f'{x:.3f},{y:.3f}' for x,y in dst)
    cmd.extend(['(','mpr:photo','-virtual-pixel','edge','-filter','Mitchell','-distort','Perspective',mapping])
    if tone!=100:cmd.extend(['-evaluate','multiply',str(tone/100)])
    cmd.extend(['(','-size','1254x1254','xc:black','-fill','white','-stroke','none','-draw',poly,'-alpha','off',')','-compose','CopyOpacity','-composite',')','-compose','Over','-composite'])
    faces.append([dst,src,tone])
def retain(poly):
    cmd.extend(['(','mpr:photo','(','-size','1254x1254','xc:black','-fill','white','-draw','polygon '+' '.join('%s,%s'%q for q in poly),'-alpha','off',')','-compose','CopyOpacity','-composite',')','-compose','Over','-composite'])
def make(side):
    if side=='L':
        x,y=269,379; xb,yb=333,1076; dx,dy=38,-69; dbx,dby=31,-39; sign=1
        wood=[[208,397],[248,397],[309,1037],[273,1037]]
        end=[[210,350],[274,350],[260,377],[195,377]]
        railtex=[[214,397],[241,397],[305,1030],[279,1030]]
    else:
        x,y=1112,378;xb,yb=1025,1074;dx,dy=-40,-69;dbx,dby=-31,-39;sign=-1
        wood=[[247,412],[211,412],[276,1046],[309,1046]]
        end=[[1107,350],[1166,350],[1189,375],[1123,375]]
        railtex=[[225,421],[251,421],[310,1021],[286,1021]]
    def pos(i,j,k):
        xx=x*(1-k)+xb*k;yy=y*(1-k)+yb*k
        return [xx+i*sign*(1-.10*k)+j*(dx*(1-k)+dbx*k),yy+j*(dy*(1-k)+dby*k)]
    def quad(*verts):return [pos(*v) for v in verts]
    # Photographic textures of the square structural stile, then the rear stop.
    face(quad((-81,0,0),(0,0,0),(0,0,1),(-81,0,1)),wood)
    face(quad((0,0,0),(0,1,0),(0,1,1),(0,0,1)),wood,76)
    face(quad((-81,1,0),(0,1,0),(0,0,0),(-81,0,0)),end,98)
    def bat(a,b):
        z=.009
        face(quad((31,a,z),(31,b,z),(31,b,1),(31,a,1)),railtex,77)
        face(quad((0,a,z),(31,a,z),(31,a,1),(0,a,1)),railtex,99 if a<.4 else 85)
        face(quad((0,b,z),(31,b,z),(31,a,z),(0,a,z)),end,107 if a<.4 else 96)
    bat(.65,.97)
    # The two board faces occlude the rear stop but go behind the front stop.
    if side=='L':
        retain([(296,622),(470,609),(469,746),(306,748)])
        retain([(317,815),(464,807),(465,1074),(331,1070)])
    else:
        retain([(847,598),(1083,588),(1066,724),(847,729)])
        retain([(845,805),(1053,805),(1029,1068),(845,1070)])
    bat(.035,.335)
    if side=='R':
        # Forearm lies physically ahead of the assembly.
        retain([(960+u,390+v) for u,v in [(0,142),(73,150),(90,146),(116,133),(120,126),(136,115),(151,101),(168,87),(191,73),(212,61),(235,46),(255,31),(274,15),(293,2),(293,177),(262,188),(235,193),(211,201),(191,210),(177,214),(164,209),(149,198),(127,205),(108,212),(88,222),(62,232),(36,239),(0,254)]])
for s in ['L','R']:make(s)
cmd.extend(['-alpha','off',str(D/'timber-joinery-master.png')])
subprocess.run(cmd,check=True)
(D/'faces.json').write_text(json.dumps(faces))

