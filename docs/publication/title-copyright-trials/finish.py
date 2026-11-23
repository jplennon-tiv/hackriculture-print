"""Add a labelled overview to four native, actual-size title-page proposals."""
from pathlib import Path
from io import BytesIO
import json, hashlib
from pypdf import PdfReader, PdfWriter, Transformation
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'output/pdf/title-copyright-trials'
SOURCE = OUT / 'Vegetable-Guru-Title-Copyright-Layouts.pdf'
DEST = OUT / 'Vegetable-Guru-Title-Copyright-Design-Trials.pdf'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    spec=json.loads((HERE/'VARIANTS.json').read_text())
    checks=json.loads((HERE/'CHECKS.json').read_text())
    src=PdfReader(SOURCE)
    b=BytesIO();c=canvas.Canvas(b,pagesize=(297*mm,420*mm))
    c.setFillColor('#ede9dc');c.rect(0,0,297*mm,420*mm,fill=1,stroke=0)
    c.setFillColor('#173e2c');c.setFont('Helvetica-Bold',23)
    c.drawString(15*mm,403*mm,'The Vegetable Guru')
    c.setFont('Helvetica',12);c.drawString(15*mm,394*mm,'Combined title and copyright page | Four layout trials')
    positions=[(15,216),(156,216),(15,27),(156,27)]
    descriptions=['Four photographs; closest to the approved layout.', 'Two photographs; a simpler, quieter opening.', 'Three photographs above the title.', 'Three photographs in a loose side column.']
    for i,(v,(x,y)) in enumerate(zip(spec['variants'],positions)):
        c.setFont('Helvetica-Bold',12);c.drawString(x*mm,(y+168)*mm,v['id']+'  '+v['title'])
        c.setFont('Helvetica',8.2);c.drawString(x*mm,(y-5)*mm,descriptions[i])
        c.setStrokeColor('#c9c4b7');c.setLineWidth(.5);c.rect(x*mm,y*mm,125*mm,125/185*240*mm,fill=0,stroke=1)
    c.setFont('Helvetica',8)
    c.drawString(15*mm,10*mm,'A–D follow at actual 185 × 240 mm size. Copyright year and ISBN remain placeholders. Separate proposals.')
    c.save();overview=PdfReader(BytesIO(b.getvalue())).pages[0]
    for i,(x,y) in enumerate(positions):
        overview.merge_transformed_page(src.pages[i],Transformation().scale(125/185).translate(x*mm,y*mm))
    writer=PdfWriter();writer.add_page(overview)
    writer.add_outline_item('Compare A–D',0)
    for i,v in enumerate(spec['variants']):
        writer.add_page(src.pages[i]);writer.add_outline_item(v['id']+' — '+v['title'],i+1)
    writer.add_metadata({'/Title':'The Vegetable Guru — title and copyright design trials','/Author':'John Lennon','/Subject':'Four standalone proposals: existing title artwork and wording plus core copyright and ISBN. No book pagination changes.'})
    writer.compress_identical_objects();writer.write(DEST)
    final=PdfReader(DEST);assert len(final.pages)==5
    texts=[]
    expected=' '.join(spec['text']['copyrightLines'])
    for p in final.pages[1:]:
        plain=' '.join(p.extract_text().split());texts.append(plain)
        assert expected in plain
        assert all(s not in plain for s in ['AI assistance','UK growing','Sources','HACKRICULTURE','[Imprint name]'])
        assert abs(float(p.mediabox.width)/mm-185)<.01 and abs(float(p.mediabox.height)/mm-240)<.01
    assert len(set(texts))==1
    doc=pdfium.PdfDocument(DEST)
    doc[0].render(scale=1.4).to_pil().save(HERE/'comparison-preview.png')
    for i,v in enumerate(spec['variants']):
        doc[i+1].render(scale=2.2).to_pil().save(HERE/(v['id']+'-final.png'))
    for a in spec['assets'].values(): assert sha(ROOT/a['file'])==a['sha256']
    review={'date':'2026-11-22','status':'Proposals; final visual inspection pending','pdf':{'file':str(DEST.relative_to(ROOT)),'sha256':sha(DEST),'bytes':DEST.stat().st_size,'pages':5,'page1':'Labelled A3 overview','pages2to5':'A–D at 185 × 240 mm'},'all_expected_copy_verified':True,'same_copy_on_all_four':True,'all_requested_omissions_verified':True,'all_artwork_source_hashes_verified':True,'minimum_placed_image_dpi':min(p['effectiveDPI'] for v in checks['variants'] for p in v['pictures']),'geometry_checks':str((HERE/'CHECKS.json').relative_to(ROOT)),'scope':'Traditional measurements title-page trials only; original approval and book assembly preserved.'}
    (HERE/'REVIEW.json').write_text(json.dumps(review,indent=2)+'\n')
    print(json.dumps(review,indent=2))

if __name__=='__main__':main()
