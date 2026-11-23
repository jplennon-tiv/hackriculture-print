"""Assemble corrected panels and move native spine lettering clear of leaf shadows."""
from pathlib import Path
from io import BytesIO
import hashlib,json,subprocess
import numpy as np
from PIL import Image
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import DictionaryObject,NameObject,RectangleObject,DecodedStreamObject
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import pypdfium2 as pdfium

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[4]
OUT=ROOT/'output/pdf/cover-print-resolution-review'
FRONT=OUT/'Vegetable-Guru-Front-Print-Resolution-Proposal.pdf'
REAR=OUT/'Vegetable-Guru-Rear-Print-Resolution-Proposal.pdf'
SELECTED=ROOT/'output/pdf/selected-gold-cover/The-Vegetable-Guru-Selected-Cover.pdf'
TYPE=ROOT/'tmp/cover-print-resolution/wrap-spine-type.pdf'
WIDTH,HEIGHT,SPINE=185*mm,240*mm,12.5*mm
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    TYPE.parent.mkdir(parents=True,exist_ok=True)
    result=subprocess.run(['swift','-module-cache-path','/tmp/veg-preview-swift-cache',str(HERE/'spine-type-clear.swift'),str(ROOT/'public/fonts'),str(TYPE),'12.5'],check=True,capture_output=True,text=True)
    type_geometry=json.loads(result.stdout)
    assert type_geometry[1]['ink_top_mm']-type_geometry[0]['ink_bottom_mm']>6
    assert type_geometry[1]['ink_bottom_mm']<155
    original=PdfReader(SELECTED).pages[0]
    images=original['/Resources']['/XObject']
    candidates=[v.get_object() for v in images.values() if v.get_object().get('/Width')==74 and v.get_object().get('/Height')==1430]
    assert len(candidates)==1;im=candidates[0];assert im['/ColorSpace']=='/DeviceRGB';assert im['/BitsPerComponent']==8
    native=im.get_data();grain=Image.frombytes('RGB',(74,1430),native)
    grain_file=HERE/'assets/retained-spine-grain-and-shadows.png';grain.save(grain_file)
    buf=BytesIO();c=canvas.Canvas(buf,pagesize=(SPINE,HEIGHT));c.drawImage(str(grain_file),0,0,SPINE,HEIGHT);c.save()
    spine=PdfReader(BytesIO(buf.getvalue())).pages[0];spine.merge_page(PdfReader(TYPE).pages[0])
    panels=[('Rear',PdfReader(REAR).pages[0],0),('Spine',spine,WIDTH),('Front',PdfReader(FRONT).pages[0],WIDTH+SPINE)]
    writer=PdfWriter();page=writer.add_blank_page(2*WIDTH+SPINE,HEIGHT);resources=DictionaryObject();xobjects=DictionaryObject();ops=[]
    for name,p,x in panels:
        form=DecodedStreamObject();data=p.get_contents().get_data();form.set_data(data)
        form.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/BBox'):RectangleObject(p.mediabox),NameObject('/Resources'):p['/Resources'].clone(writer)})
        if '/Group' in p:form[NameObject('/Group')]=p['/Group'].clone(writer)
        xobjects[NameObject('/'+name)]=writer._add_object(form)
        ops.append(f'q 1 0 0 1 {x:.9f} 0 cm /{name} Do Q')
        assert form.get_data()==data
    resources[NameObject('/XObject')]=xobjects;page[NameObject('/Resources')]=resources
    stream=DecodedStreamObject();stream.set_data(('\n'.join(ops)+'\n').encode());page[NameObject('/Contents')]=writer._add_object(stream)
    writer.add_metadata({'/Title':'The Vegetable Guru — corrected front, spine and rear proof','/Author':'John Lennon','/Subject':'Single trim-size design proof, 382.5 x 240 mm; provisional 12.5 mm spine. Not a supplier-ready cover.'})
    writer.compress_identical_objects();dest=OUT/'Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf';writer.write(dest)
    pdf=pdfium.PdfDocument(dest);pdf[0].render(scale=1.8).to_pil().save(OUT/'corrected-wrap-preview.png')
    # Native panel streams are kept whole; inspect cropped panel renders as well.
    scale=254/72
    full=pdf[0].render(scale=scale).to_pil().convert('RGB')
    full.save(ROOT/'tmp/cover-print-resolution/wrap-254dpi.png')
    full.crop((1850,400,1975,1950)).transpose(Image.Transpose.ROTATE_90).save(OUT/'spine-clearance-detail.png')
    comparisons={}
    def reference_on_same_viewport(source,x=0):
        # Use the same page viewport and pixel grid. PDFium interpolates images
        # differently when an isolated 185 mm page has a separately rounded bitmap.
        w=PdfWriter();p=w.add_blank_page(2*WIDTH+SPINE,HEIGHT)
        p.merge_transformed_page(PdfReader(source).pages[0],Transformation().translate(x,0))
        b=BytesIO();w.write(b);d=pdfium.PdfDocument(b.getvalue())
        return d[0].render(scale=scale).to_pil().convert('RGB')
    for name,source,x0,x1 in [('rear',REAR,0,1850),('front',FRONT,1975,3825)]:
        ref=reference_on_same_viewport(source,x0/10*mm).crop((x0,0,x1,2400))
        actual=full.crop((x0,0,x1,2400))
        # Sub-point PDF rounding can produce one antialiased edge row; compare the interior.
        a=np.asarray(actual)[2:-2,2:-2].astype(int);b=np.asarray(ref)[2:2398,2:1848].astype(int)
        delta=np.abs(a-b);comparisons[name]={'mean_channel_difference':float(delta.mean()),'maximum_channel_difference':int(delta.max())}
        assert delta.mean()<1,comparisons[name]
    old=reference_on_same_viewport(SELECTED)
    a=np.asarray(full)[2:2398,1852:1973].astype(int);b=np.asarray(old)[2:2398,1852:1973].astype(int)
    delta=np.abs(a-b);comparisons['spine_vs_original_positions']={'mean_channel_difference':float(delta.mean()),'maximum_channel_difference':int(delta.max()),'expected_change':'title shifted 10 mm upward; author shifted 18 mm upward'}
    before=pdfium.PdfDocument(OUT/'spine-position-before/Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf')[0].render(scale=scale).to_pil().convert('RGB')
    changed=np.any(np.asarray(full)!=np.asarray(before),axis=2)
    yy,xx=np.where(changed)
    assert xx.min()>=1850 and xx.max()<1975
    assert yy.min()>590 and yy.max()<1730
    assert Image.open(grain_file).tobytes()==native
    comparisons['revision_changed_pixel_bounds_at_254dpi']=[int(xx.min()),int(yy.min()),int(xx.max()),int(yy.max())]
    report={'date':'2026-11-22','status':'spine lettering clearance revision requested by John; design proof, not supplier approval','panels_mm':[185,12.5,185],'wrap_mm':[382.5,240],'spine_provisional':True,'native_panel_streams_preserved':True,'spine':'Original 74 x 1430 RGB background/shadows retained exactly; native Lilita One/Nunito Sans fonts, sizes and tracking retained; positions revised by spine-type-clear.swift','spine_background_decoded_sha256':hashlib.sha256(native).hexdigest(),'spine_type_geometry':type_geometry,'sources':[{'file':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in [FRONT,REAR,SELECTED,TYPE]],'panel_render_comparison_at_254dpi':comparisons,'output':{'file':str(dest.relative_to(ROOT)),'bytes':dest.stat().st_size,'sha256':sha(dest)},'limits':['Spine width remains provisional until final paper/page-count supplier specification.','Trim-only design proof; no supplier bleed or production conversion.','Earlier spine background sampling retained; new finer wood remains on front and rear.']}
    (HERE/'WRAP-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report['output'],indent=2));print(comparisons)

if __name__=='__main__':main()
