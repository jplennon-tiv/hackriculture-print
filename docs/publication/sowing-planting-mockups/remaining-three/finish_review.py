"""Assemble the six checked crop proofs for this review."""
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.constants import PageLabelStyle

folder = Path(__file__).resolve().parent
base = folder.parent
root = folder.parents[3]
output = root / 'output/pdf/sowing-planting-mockups/remaining-three'
output.mkdir(exist_ok=True, parents=True)
crops = {'beetroot':'Beetroot', 'potato':'Potato', 'tomato_outdoor':'Outdoor tomato'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


records = {}
for unit in ('imperial','metric'):
    writer = PdfWriter()
    writer.page_layout = '/TwoPageLeft'
    writer.add_metadata({'/Title':f'Beetroot, Potato and Outdoor Tomato ({unit})'})
    links = []
    folios = []
    for crop, name in crops.items():
        report = json.loads((base / f'{crop}-revision/PDF-CHECKS.json').read_text())[unit]
        info = json.loads((base / f'{crop}-revision/CHECKS.json').read_text())
        path = root / report['pdf']
        assert sha(path) == report['sha256']
        assert len(info['folios']) == 2 and not info['omitted']
        start = len(writer.pages)
        writer.append(path, outline_item=name, import_outline=False)
        writer.set_page_label(start, start+1, style=PageLabelStyle.DECIMAL, start=info['folios'][0])
        links.append(report['seeAlsoBookPages'])
        folios.extend(str(n) for n in info['folios'])
    path = output / f'three-crop-review-{unit}.pdf'
    writer.write(path)
    pdf = PdfReader(path)
    assert len(pdf.pages) == 6 and pdf.page_labels == folios
    for i, expected in enumerate(links):
        annotations = pdf.pages[2*i+1]['/Annots']
        actions = [annotation.get_object()['/A'] for annotation in annotations]
        assert [action['/D'][0]+1 for action in actions] == expected
        for action in actions:
            assert action['/S'] == '/GoToR'
            assert (output / action['/F']).resolve() == root / 'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
    records[unit] = {'pdf':str(path.relative_to(root)), 'pages':len(pdf.pages), 'folios':folios, 'sha256':sha(path), 'seeAlsoBookPages':links}
(folder / 'PDF-CHECKS.json').write_text(json.dumps(records,indent=2) + '\n')
