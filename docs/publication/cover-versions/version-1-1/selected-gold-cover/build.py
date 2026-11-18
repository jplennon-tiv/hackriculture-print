"""Save the chosen ribbon on the accepted editable front and single wrap."""
from pathlib import Path
import runpy
import subprocess
from tempfile import TemporaryDirectory

import numpy as np
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject

HERE = Path(__file__).resolve().parent
study = runpy.run_path(str(HERE.parent/'ribbon-colour-study/build.py'))
source = study['MASTER'].read_text()
reference = study['PALETTE'][0]
assert reference == {'name':'Original gold','fill':'#F2CC35'}
assert source.count('fill="#ffe22b"') == 1
master = HERE/'The-Vegetable-Guru-Front.svg'
master.write_text(source.replace('fill="#ffe22b"', 'fill="#F2CC35"'))
with TemporaryDirectory(prefix='veg-selected-cover-') as tmp:
    photo = Path(tmp)/'front.png'
    subprocess.run(['node',str(study['RENDER']),str(master),str(photo)],check=True)
    prior = PdfReader(study['OLD_PDF']).pages[0]
    key, original = study['reference_front'](prior)
    rgb = np.asarray(Image.open(photo).convert('RGB'))
    changed = np.any(original != rgb,axis=2)
    assert changed.any() and not changed[241:].any() and not changed[:,255:].any()
    writer = PdfWriter()
    page = writer.add_page(prior)
    resources = DictionaryObject(page['/Resources'])
    images = DictionaryObject(resources['/XObject'])
    images[key] = study['front_object'](photo).clone(writer).indirect_reference
    resources[NameObject('/XObject')] = images
    page[NameObject('/Resources')] = resources
    writer.add_metadata({'/Title':'The Vegetable Guru — selected cover design', '/Author':'John Lennon',
                         '/Subject':'Design at trim. Original gold ribbon, 12.5 mm provisional spine, protected rear 04.'})
    writer.compress_identical_objects()
    dest = study['ROOT']/'output/pdf/selected-gold-cover'
    dest.mkdir(parents=True,exist_ok=True)
    with (dest/'The-Vegetable-Guru-Selected-Cover.pdf').open('wb') as f:writer.write(f)
