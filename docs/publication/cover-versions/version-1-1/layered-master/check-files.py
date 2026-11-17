"""Read-only component and delivery checks; writes only CHECKS.json."""
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
import numpy as np
import json, hashlib, zipfile
import xml.etree.ElementTree as ET

HERE=Path(__file__).resolve().parent
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
source=np.array(Image.open(HERE/'sources/repaired-cover.png').convert('RGB'))
y,x=np.mgrid[:1430,:1100]
diagonal=y+x*239/254
hidden=((x<280)&(y<260)&(diagonal>139)&(diagonal<245))|(((x-905)**2/141**2+(y-1124)**2/149**2)<1)|(((x-155)**2/101**2+(y-1292)**2/105**2)<1)
checks={}
for name in ['top','bottom']:
    a=np.array(Image.open(HERE/f'assets/{name}-vegetables.png').convert('RGBA'))
    protected=(a[:,:,3]>0)&~hidden
    changed=np.any(a[:,:,:3]!=source,axis=2)&protected
    assert not changed.any()
    checks[name]={'protected_nontransparent_pixels':int(protected.sum()),'changed_RGB_pixels':int(changed.sum()),'alpha_zero_pixels':int((a[:,:,3]==0).sum())}
svg=ET.parse(HERE/'Vegetable-Guru-Layered-Master.svg').getroot()
groups=svg.findall('{http://www.w3.org/2000/svg}g')
assert len(groups)==10
bottom=next(g for g in groups if g.attrib['id']=='bottom-vegetables')
assert all('filter' not in e.attrib for e in bottom.iter())
checks['layers']=10
checks['bottom_layer_drop_shadow']=False
checks['original_sources']={p.name:digest(p) for p in sorted((HERE/'sources').glob('*.png'))}
preview=np.array(Image.open(HERE/'Layered-Master-Preview.png').convert('RGB')).astype('int16')
checks['PSD']={}
for name,file in [('composite','/tmp/vg-psd-composite-reopened.png'),('independently_recomposited_layers','/tmp/vg-psd-layers-reopened.png')]:
    other=np.array(Image.open(file).convert('RGB')).astype('int16')
    diff=np.abs(preview-other)
    checks['PSD'][name]={'maximum_channel_difference':int(diff.max()),'mean_channel_difference':float(diff.mean()),'pixels_over_3':int(np.any(diff>3,axis=2).sum())}
    assert diff.max()<=2
pdf=PdfReader(HERE/'Layered-Master-Preview.pdf'); assert len(pdf.pages)==1
page=pdf.pages[0]
images=[o.get_object() for o in page['/Resources']['/XObject'].values() if o.get_object().get('/Subtype')=='/Image']
assert len(images)==1
expected=preview.astype('uint8').tobytes()
assert images[0].get_data()==expected
checks['PDF']={'pages':1,'trim_mm':[round(float(page.mediabox.width)*25.4/72,3),round(float(page.mediabox.height)*25.4/72,3)],'embedded_RGB_matches_preview':True}
with zipfile.ZipFile(HERE/'Vegetable-Guru-Layered-Master.ora') as z:
    assert z.testzip() is None
    stack=ET.fromstring(z.read('stack.xml')).find('stack')
    assert len(stack)==10
    assert stack[-1].attrib['name'].startswith('01 ')
    checks['OpenRaster']={'layers':len(stack),'crc_pass':True,'order':'top-to-bottom; paper last'}
checks['visual_review']='Cream composition, dark-background matte diagnostic and independently reopened PSD layer composite inspected at full size. Lower cast shadow removed. Fine natural roots/skin markings retained. Pale source edge fringe remains relevant only for future dark backgrounds.'
checks['limitations']=['Lettering is raster graphic artwork, not live text.','Native 1100 x 1430; no increased photographic resolution.','PSD decoded independently, not interactively opened in Photoshop or Affinity.','New layer construction awaits user design review.']
(HERE/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps({'passed':True,'layers':10,'RGB_pixels_changed':0,'PDF_pages':1,'PSD_difference_max':checks['PSD']['independently_recomposited_layers']['maximum_channel_difference']}))
