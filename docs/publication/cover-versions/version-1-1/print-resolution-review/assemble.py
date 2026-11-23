"""Keep rear photo streams and native copy; build a separate eight-page comparison."""
from pathlib import Path
from io import BytesIO
import copy,json,hashlib
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import DictionaryObject,NameObject,ArrayObject,FloatObject,DecodedStreamObject,RectangleObject,ContentStream
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import pypdfium2 as pdfium

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[4]
OUT=ROOT/'output/pdf/cover-print-resolution-review'
W,H=185*mm,240*mm
SELECTED=ROOT/'output/pdf/selected-gold-cover/The-Vegetable-Guru-Selected-Cover.pdf'
REAR=ROOT/'output/pdf/rear-cream-harvest/photo-grid-04/The-Vegetable-Guru-Garden-Photo-Grid-04.pdf'
FRONT=OUT/'Vegetable-Guru-Front-Print-Resolution-Proposal.pdf'
def sha(b):return hashlib.sha256(b).hexdigest()
def pagebuffer(size,draw):
    b=BytesIO();c=canvas.Canvas(b,pagesize=size);draw(c);c.save();return PdfReader(BytesIO(b.getvalue())).pages[0]

def wood(c):
    im=str(HERE/'assets/wood-restored.png')
    for x,y,sx,sy in [(0,H/2,1,1),(W,H/2,-1,1),(0,H/2,1,-1),(W,H/2,-1,-1)]:
        c.saveState();c.translate(x,y);c.scale(sx,sy);c.drawImage(im,0,0,W/2,H/2);c.restoreState()

def make_rear():
    src=PdfReader(REAR);w=PdfWriter();p=w.add_page(src.pages[0]);bg=pagebuffer((W,H),wood)
    form=DecodedStreamObject();form.set_data(bg.get_contents().get_data())
    form.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/BBox'):RectangleObject([0,0,W,H]),NameObject('/Matrix'):ArrayObject([FloatObject(1/W),FloatObject(0),FloatObject(0),FloatObject(1/H),FloatObject(0),FloatObject(0)]),NameObject('/Resources'):bg['/Resources'].clone(w)})
    p['/Resources']['/XObject'][NameObject('/Im1')]=w._add_object(form)
    photo_checks=[]
    for n in range(2,18):
        key=f'/Im{n}';old=src.pages[0]['/Resources']['/XObject'][key].get_object();new=p['/Resources']['/XObject'][key].get_object()
        assert old._data==new._data
        photo_checks.append({'photo':n-1,'sha256':sha(new._data),'native_jpeg_bytes_unchanged':True,'pixels':[new['/Width'],new['/Height']]})
    assert src.pages[0].get_contents().get_data()==p.get_contents().get_data()
    w.add_metadata({'/Title':'The Vegetable Guru — rear print-resolution proposal','/Author':'John Lennon','/Subject':'New fine wood texture. Protected photographs and native rear copy unchanged. Review only.'})
    dest=OUT/'Vegetable-Guru-Rear-Print-Resolution-Proposal.pdf';w.write(dest)
    return dest,photo_checks

def place(dst,src,rect,x,y,scale=1):
    p=copy.copy(src);p.cropbox=RectangleObject(rect)
    t=Transformation().translate(-rect[0],-rect[1]).scale(scale).translate(x,y)
    dst.merge_transformed_page(p,t,over=True)

def comparison():
    rear_dest,photos=make_rear()
    current=PdfReader(SELECTED).pages[0];front=PdfReader(FRONT).pages[0]
    old_rear=PdfReader(REAR).pages[0];new_rear=PdfReader(rear_dest).pages[0]
    offset=197.5*mm;doc=PdfWriter();a3=(420*mm,297*mm)
    dark='#073e28'
    def sheet(title,sub,foot,number):
        def draw(c):
            c.setFillColorRGB(.985,.981,.968);c.rect(0,0,*a3,fill=1,stroke=0)
            c.setFillColor(dark);c.setFont('Helvetica-Bold',18);c.drawString(17*mm,280*mm,title)
            c.setFont('Helvetica',9);c.drawString(17*mm,273*mm,sub)
            c.setFont('Helvetica-Bold',10);c.drawString(17*mm,263*mm,'CURRENT APPROVED COVER');c.drawString(218*mm,263*mm,'PRINT-RESOLUTION PROPOSAL')
            c.setFont('Helvetica',8);c.drawString(17*mm,8*mm,foot);c.drawRightString(403*mm,8*mm,str(number))
        return pagebuffer(a3,draw)
    p=sheet('Front cover | actual size','Both panels are 185 x 240 mm. Print at 100% on A3 landscape; do not select Fit.','Separate proposal for review. The approved cover and assembled book have not been replaced.',1)
    place(p,current,[offset,0,offset+W,H],17*mm,17*mm);place(p,front,[0,0,W,H],218*mm,17*mm);doc.add_page(p)
    p=sheet('Rear cover | actual size','The sixteen photographs and existing rear copy are unchanged. Only the wood background is revised.','New fine wood: about 302 dpi at placement. Protected rear photographs: about 350-468 dpi.',2)
    place(p,old_rear,[0,0,W,H],17*mm,17*mm);place(p,new_rear,[0,0,W,H],218*mm,17*mm);doc.add_page(p)
    def rect(x,y,w,h,off=0):return [off+x*W/1100,H-(y+h)*H/1430,off+(x+w)*W/1100,H-y*H/1430]
    specs=[
      ('Lettering | enlarged details','Clean Lilita One font outlines replace the rejected traces. Line clearance is adjusted for the native g descender.',[
          ('Main title at 3x',(220,445,315,170),3,160),('Subtitle and author at 2x',(285,758,530,205),2,55)],'Badge faces and gold ribbon are also vectors. Rear text remains native.',3),
      ('Vegetables | enlarged details','Larger retained originals are embedded separately, instead of flattening the complete front to 1100 pixels.',[
          ('Upper arrangement at 2x',(420,110,450,270),2,160),('Lower arrangement at 2x',(170,1050,450,270),2,49)],'Upper photograph: about 293 dpi. Lower photograph: about 240 dpi. No generative changes to the vegetables.',4),
      ('Badges and background | enlarged details','Clean Arial Bold font outlines and geometric symbols replace the rejected traces.',[
          ('YouTube badge at 2.5x',(765,980,285,290),2.5,132),('Measurements badge at 3x',(60,1195,190,195),3,24)],'All lettering is copied from actual font curves, without tracing raster edges.',5),
      ('Ribbon and small type | enlarged details','Check the clean counters and edges in the Organic ribbon and the smaller front lettering.',[
          ('Organic ribbon at 3x',(0,0,270,245),3,123),('Subtitle and author at 2x',(285,758,530,205),2,30)],'The final two pages are clean proposed panels. The approved cover and book remain unchanged.',6),
    ]
    for title,sub,rows,foot,num in specs:
        p=sheet(title,sub,foot,num)
        for label,box,scale,y in rows:
            label_y=y+(box[3]*H/1430/mm)*scale+4
            def drawlabel(c,label=label,label_y=label_y):
                c.setFont('Helvetica',9);c.setFillColor(dark);c.drawString(17*mm,label_y*mm,label);c.drawString(218*mm,label_y*mm,label)
            p.merge_page(pagebuffer(a3,drawlabel))
            place(p,current,rect(*box,off=offset),17*mm,y*mm,scale)
            place(p,front,rect(*box),218*mm,y*mm,scale)
        doc.add_page(p)
    doc.add_page(front);doc.add_page(new_rear)
    doc.add_metadata({'/Title':'The Vegetable Guru — cover print-resolution comparison','/Author':'John Lennon','/Subject':'Review proposal: actual-size panels, enlarged details and clean covers. Original design retained; no supplier approval.'})
    for i,title in enumerate(['Front at actual size','Rear at actual size','Vector lettering details','Vegetable detail','Badge detail','Ribbon and small type','Clean front proposal','Clean rear proposal']):doc.add_outline_item(title,i)
    doc.compress_identical_objects();dest=OUT/'Vegetable-Guru-Cover-Print-Resolution-Comparison.pdf';doc.write(dest)
    # Render the real comparison PDF for fit and visual inspection, not the SVG alone.
    pdf=pdfium.PdfDocument(dest)
    for i in range(len(pdf)):
        p=pdf[i];p.render(scale=1.3 if i<6 else 1.65).to_pil().save(OUT/f'comparison-{i+1:02d}.png')
    check={'date':'2026-11-22','revision':2,'status':'corrected native-font proposal awaiting John\u2019s review','pages':len(pdf),'approved_cover_sha256':sha(SELECTED.read_bytes()),'approved_front_svg_sha256':sha((HERE.parent/'selected-gold-cover/The-Vegetable-Guru-Front.svg').read_bytes()),'comparison':{'file':str(dest.relative_to(ROOT)),'sha256':sha(dest.read_bytes()),'bytes':dest.stat().st_size},'rear_photos':photos,'rear_content_stream_unchanged':True,'rear_font_resources_retained':True,'effective_source_dpi':{'old_flat_front':151,'upper_photo':293,'lower_photo':240,'new_wood':302,'rear_photos_range':[350,468]},'limitations':['Lower approved photo remains 240 dpi; no invented detail or simple resize claimed as recovery.','Soft legacy shadow masks retain their source sampling; they are not lettering or photographic-detail layers.','Wood uses four mirrored placements at finer grain scale.','Letterforms rebuilt with Lilita One and Arial Bold; the native g requires revised title line clearance. Badge faces and symbols use clean geometric outlines.','No final bleed, spine, colour conversion, supplier file or book integration.']}
    (HERE/'CHECKS.json').write_text(json.dumps(check,indent=2)+'\n');print(json.dumps(check['comparison'],indent=2))

if __name__=='__main__':comparison()
