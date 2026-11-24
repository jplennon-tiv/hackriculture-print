"""Add only the requested folio to selected oval option 3. No book rebuild."""
from pathlib import Path
import io,json,hashlib,subprocess,copy
from pypdf import PdfReader,PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf.generic import RectangleObject

HERE=Path(__file__).resolve().parent;A=HERE/'assets';R=HERE/'renders';R.mkdir(exist_ok=True)
MM=72/25.4;W,H=191*MM,246*MM
pdfmetrics.registerFont(TTFont('Folio',str(A/'Folio.ttf')))
buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(W,H),initialFontName='Folio',initialFontSize=7.35,pageCompression=1)
c.setFillColorRGB(1,1,1);c.drawRightString(180*MM,11*MM,'7');c.showPage();c.save()
base=PdfReader(A/'selected-option-3.pdf');overlay=PdfReader(io.BytesIO(buf.getvalue()))
before=base.pages[0].extract_text();page=base.pages[0];page.merge_page(overlay.pages[0])
w=PdfWriter();w.add_page(page);w.add_metadata({'/Title':'Vegetable Guru - selected photographic opener - page 7','/Author':'John Lennon','/Subject':'Selected design with requested folio. Original image approximately 147 ppi; higher-resolution artwork still pending. Not a supplier upload.'})
out=HERE/'Vegetable-Guru-Selected-Opener-Page-7.pdf';w.write(out)
trim=PdfWriter();p=copy.copy(page);p.cropbox=RectangleObject([3*MM,3*MM,188*MM,243*MM]);trim.add_page(p);trim.write(R/'trim-preview.pdf')
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
with (R/'poppler.log').open('w') as log:subprocess.run([poppler,'-png','-singlefile','-cropbox','-scale-to','1500',str(R/'trim-preview.pdf'),str(HERE/'Vegetable-Guru-Selected-Opener-Page-7')],check=True,stderr=log)
after=PdfReader(out);assert after.pages[0].extract_text().splitlines()==before.splitlines()+['7']
def image_data(p):return [(v.get_object()['/Width'],v.get_object()['/Height'],hashlib.sha256(v.get_object().get_data()).hexdigest()) for v in p['/Resources']['/XObject'].values() if v.get_object().get('/Subtype')=='/Image']
assert image_data(PdfReader(A/'selected-option-3.pdf').pages[0])==image_data(after.pages[0])
manifest={'date':'2026-11-24','status':'Selected design completed with requested folio; artwork resolution requirement pending','selected_option':3,'folio':7,'folio_font':'Nunito Sans Bold','folio_size_pt':7.35,'folio_colour':'white','folio_right_mm_from_media':180,'folio_baseline_mm_from_media_bottom':11,'trim_mm':[185,240],'bleed_mm':3,'source_photo_pixels':[1105,1423],'source_effective_ppi':146.93,'minimum_300ppi_pixels':[2256,2906],'meets_300ppi':False,'exact_source_image_stream_preserved':True,'only_added_text':'7','no_book_integration':True,'output':{'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}}
(HERE/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest,indent=2))
