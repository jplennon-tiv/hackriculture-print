"""Keep the selected hand-drawn shapes, and open the three fused outlines."""
from io import BytesIO
from base64 import b64encode
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

INK = (7, 62, 40)
# Point inside each 96/255 ink core. The point order is the reading order.
ROWS = [('The', [(300,390),(340,390),(401,386)], [3,4]),
        ('Vegetable', [(196,550),(290,505),(447,515),(495,515),(590,500),
                       (702,532),(747,515),(847,505),(900,510)], [7,8,8,7,8,8,8,8]),
        ('Guru', [(279,663),(450,680),(600,674),(728,667)], [8,9,9])]

def data_url(image):
    buf = BytesIO()
    image.save(buf, format='PNG', optimize=True)
    return 'data:image/png;base64,' + b64encode(buf.getvalue()).decode()

def layout(alpha):
    a = np.asarray(alpha)
    core = np.where(a >= 96, 255, 0).astype('uint8')
    # At each original tangent remove a one-pixel bridge before labelling.
    core[493:531,469] = 0                  # g stem and next e
    core[478:488,560] = 0                  # e and t crossbar
    core[488:491,561] = 0
    core[491:493,562] = 0
    core[481:527,823] = 0                  # b bowl and l stem
    label = Image.fromarray(core).copy()
    n = 0
    for word,seeds,gaps in ROWS:
        for seed in seeds:
            n += 1
            assert label.getpixel(seed)==255, (word,seed,label.getpixel(seed))
            ImageDraw.floodfill(label,seed,n)
    labels = np.array(label)
    assert np.sum(labels==255)<45, (np.sum(labels==255), Image.fromarray(labels==255).getbbox())
    # Assign antialiased fringe pixels to the nearest shape, preserving the
    # exact original coverage everywhere except the restored contact edges.
    labels[labels==255]=0
    for _ in range(5):
        grow = np.array(Image.fromarray(labels).filter(ImageFilter.MaxFilter(3)))
        missing = (labels==0)&(a>0)
        labels[missing] = grow[missing]
    assert a[labels==0].max() < 96
    groups = []
    counts = []
    n = 0
    for word,seeds,gaps in ROWS:
        glyphs=[]
        for ch in word:
            n += 1
            m=np.where(labels==n,a,0).astype('uint8')
            if word=='Vegetable':
                # Restore a subpixel edge where two shapes shared solid ink.
                if n==6: m[496:527,469]=np.minimum(m[496:527,469],112)
                if n==7: m[499:526,470]=np.minimum(m[499:526,470],180)
            glyphs.append(m)
        positions=[0]
        for prev,nxt,target in zip(glyphs,glyphs[1:],gaps):
            p,q=prev>=128,nxt>=128
            rows=p.any(1)&q.any(1)
            right=p.shape[1]-np.argmax(p[rows,::-1],axis=1)
            left=np.argmax(q[rows],axis=1)
            positions.append(positions[-1]+target-int((left-right).min()))
        centre=int(round(positions[-1]/2))
        parts=[]
        for i,(ch,m,dx) in enumerate(zip(word,glyphs,positions)):
            mask=Image.fromarray(m)
            x,y,r,b=mask.getbbox()
            glyph=Image.new('RGBA',(r-x,b-y),INK)
            glyph.putalpha(mask.crop((x,y,r,b)))
            top = y + (5 if word=='Guru' else 0)
            parts.append(f'<image id="letter-{word}-{i+1}-{ch}" x="{x+dx-centre}" y="{top}" width="{r-x}" height="{b-y}" href="{data_url(glyph)}"/>')
        groups.append('<g aria-label="'+word+'">'+''.join(parts)+'</g>')
        counts.append((word,positions, gaps))
    return ''.join(groups),counts
