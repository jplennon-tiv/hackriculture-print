"""Verify exact preservation and inspect actual typography on pages 1–3."""
from pathlib import Path
import hashlib
import json
import math
import re
import runpy

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

DOC = Path(__file__).resolve().parent
ROOT = DOC.parents[4]
PLAN = json.loads((DOC / 'REPLACEMENT.json').read_text())
BEFORE, AFTER = ROOT / PLAN['source'], ROOT / PLAN['output']
fingerprint_factory = runpy.run_path(str(DOC.parent / 'font-inventory/verify-fractions.py'))['fingerprint_factory']
inventory = runpy.run_path(str(DOC.parent / 'font-inventory/compare-fonts.py'))['inventory']


def bounds(textpage, text, label):
    index = text.index(label)
    boxes = [textpage.get_charbox(i) for i in range(index, index + len(label))]
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def main():
    a, b = PdfReader(BEFORE), PdfReader(AFTER)
    da, db = pdfium.PdfDocument(BEFORE), pdfium.PdfDocument(AFTER)
    fa, fb = fingerprint_factory(), fingerprint_factory()
    assert len(a.pages) == len(b.pages) == 174
    checks = {'file': PLAN['output'], 'sha256': PLAN['sha256'], 'pages': 174,
              'metadataExact': dict(a.metadata) == dict(b.metadata),
              'outputIntentExact': fa(a.trailer['/Root']['/OutputIntents']) == fb(b.trailer['/Root']['/OutputIntents']),
              'pageChecks': []}
    assert checks['metadataExact'] and checks['outputIntentExact']
    details = []
    for folio, (pa, pb) in enumerate(zip(a.pages, b.pages), 1):
        row = {'folio': folio}
        row['boxesExact'] = all(list(pa[k]) == list(pb[k]) for k in ('/MediaBox', '/CropBox', '/TrimBox', '/BleedBox'))
        old, new = dict(pa['/Resources']), dict(pb['/Resources'])
        if folio <= 3:
            old['/Font'], new['/Font'] = dict(old['/Font']), dict(new['/Font'])
            del old['/Font']['/R20' if folio == 1 else '/R32']
            del new['/Font']['/VGBold']
        row['retainedResourcesExact'] = fa(old) == fb(new)
        assert row['boxesExact'] and row['retainedResourcesExact'], row
        xa, xb = da[folio - 1], db[folio - 1]
        ta, tb = xa.get_textpage(), xb.get_textpage()
        sa, sb = ta.get_text_range(), tb.get_text_range()
        row['textExact'] = sa == sb
        assert row['textExact'], (folio, sa, sb)
        if folio > 3:
            row['pageInstructionsExact'] = pa.get_contents().get_data() == pb.get_contents().get_data()
            assert row['pageInstructionsExact']
        else:
            scale = 300 / 72
            ia = xa.render(scale=scale).to_pil().convert('RGB')
            ib = xb.render(scale=scale).to_pil().convert('RGB')
            mask = np.zeros((ia.height, ia.width), dtype=bool)
            height = xa.get_size()[1]
            labels = [r['text'] for r in PLAN['changes'][folio - 1]['runs']]
            if folio == 2:
                i = labels.index('Cauli')
                assert labels[i:i+3] == ['Cauli', 'fl', 'ower']
                labels[i:i+3] = ['Cauliflower']
            row['textRegions'] = []
            for label in labels:
                oldbox, newbox = bounds(ta, sa, label), bounds(tb, sb, label)
                left, bottom = min(oldbox[0], newbox[0]) - 2, min(oldbox[1], newbox[1]) - 2
                right, top = max(oldbox[2], newbox[2]) + 2, max(oldbox[3], newbox[3]) + 2
                crop = (math.floor(left*scale), math.floor((height-top)*scale),
                        math.ceil(right*scale), math.ceil((height-bottom)*scale))
                mask[crop[1]:crop[3], crop[0]:crop[2]] = True
                region = {'text': label, 'beforeBounds': oldbox, 'afterBounds': newbox}
                if folio > 1:
                    match = re.search(re.escape(label) + r' (\d+)', sb)
                    assert match, (folio, label)
                    number_box = tb.get_charbox(match.start(1))
                    region['gapToPageReferencePoints'] = number_box[0] - newbox[2]
                    assert region['gapToPageReferencePoints'] > 2, region
                row['textRegions'].append(region)
            diff = np.any(np.asarray(ia) != np.asarray(ib), axis=2)
            row['pixelsChangedOutsideTargetTextAt300dpi'] = int(np.count_nonzero(diff & ~mask))
            assert row['pixelsChangedOutsideTargetTextAt300dpi'] == 0, row
            for label, im in (('before', ia), ('after', ib)):
                im.save(DOC / f'page-{folio}-{label}.jpg', quality=96)
            if folio == 1:
                box = row['textRegions'][0]
                left = min(box['beforeBounds'][0],box['afterBounds'][0])-8
                bottom = min(box['beforeBounds'][1],box['afterBounds'][1])-8
                right = max(box['beforeBounds'][2],box['afterBounds'][2])+8
                top = max(box['beforeBounds'][3],box['afterBounds'][3])+8
                crop = (int(left*scale),int((height-top)*scale),int(right*scale),int((height-bottom)*scale))
            else:
                crop = (90, int((height-530)*scale), int(253*scale), int((height-370)*scale))
            for label, im in (('before', ia), ('after', ib)):
                details.append((f'Page {folio} — {label}', im.crop(crop)))
        ta.close(); tb.close(); xa.close(); xb.close()
        checks['pageChecks'].append(row)
    _, inv = inventory(AFTER)
    semibold = [r for r in inv['resources'] if '_Sem' in r['name'] or 'SemiBold' in r['name']]
    bold = [r for r in inv['resources'] if r['name'] == 'NunitoSans12pt-Bold']
    assert not semibold and len(bold) == 1
    assert bold[0]['folios'] == [1,2,3] and bold[0]['embeddedPrograms'][0]['weightClass'] == 700
    checks['remainingSemiBoldResources'] = 0
    checks['newBoldFont'] = bold[0]
    checks['fiveEighthsFallbackResources'] = sum(r['mapsFiveEighths'] for r in inv['resources'])
    assert checks['fiveEighthsFallbackResources'] == 0
    checks['fontResources'] = inv['fontResources']
    proof = AFTER.with_name('Vegetable-Guru-Bold-Font-Checks.pdf')
    writer = PdfWriter()
    for p in b.pages[:3]: writer.add_page(p)
    writer.root_object[NameObject('/OutputIntents')] = b.trailer['/Root']['/OutputIntents'].clone(writer)
    writer.add_metadata({'/Title': 'The Vegetable Guru — Bold substitution, pages 1–3'})
    writer.write(proof)
    checks['proof'] = str(proof.relative_to(ROOT))
    pages = [db[n].render(scale=1.6).to_pil().convert('RGB') for n in (1,2)]
    spread = Image.new('RGB', (sum(p.width for p in pages)+16,max(p.height for p in pages)), '#ddd8ce')
    spread.paste(pages[0],(0,0)); spread.paste(pages[1],(pages[0].width+16,0))
    spread.save(DOC/'Contents-Bold-Spread.jpg',quality=96)
    width = max(im.width for _, im in details)
    contact = Image.new('RGB',(width,sum(im.height+28 for _,im in details)),'white')
    draw=ImageDraw.Draw(contact); y=0
    for label,im in details:
        draw.text((8,y+6),label,fill='black'); contact.paste(im,(0,y+28)); y+=im.height+28
    contact.save(DOC/'Bold-Before-After.jpg',quality=96)
    (DOC/'CHECKS.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({k:v for k,v in checks.items() if k!='pageChecks'},indent=2))


if __name__=='__main__': main()
