"""Build the first review PDF from the garden media catalogue and attach its CSV."""
import csv
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps
from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CATALOGUE = HERE / 'Vegetable-Guru-Media-Catalogue.csv'
PDF = HERE / 'Vegetable-Guru-Media-Contact-Sheet-01.pdf'
FONTS = Path('/System/Library/Fonts/Supplemental')
for name, file in [('Title', 'Georgia Bold.ttf'), ('Text', 'Arial.ttf'), ('Bold', 'Arial Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / file)))

PAPER, INK, GREEN = '#FFFEFA', '#202A23', '#284F3C'
RUST, MUTED, LINE, MAT = '#87502D', '#4C5A50', '#D4DBD1', '#EEF0E9'
PW, PH = landscape(A4)
M = 26
SEP = 13
CELL = (PW - 2 * M - 2 * SEP) / 3
IMAGE_H = 134

sections = [
    ('From sowing to fruiting',
     'Three jobs on the plot, followed by flowers, pods and ripening fruit.',
     'Early growth', 'Seed in the drill, emerging seedlings and thinning would fill the gaps between these views.'),
    ('Harvesting and storing',
     'Freshly picked crops, followed by two photographs of getting onions ready to store.',
     'Onion sequence', 'VG11 and VG12 would make a useful pair. A close view of the first tie would complete the sequence.'),
]


def label(canvas, x, top, text, face='Text', size=10, colour=INK, right=False):
    canvas.setFont(face, size)
    canvas.setFillColor(HexColor(colour))
    draw = canvas.drawRightString if right else canvas.drawString
    draw(x, PH - top, text)


def rule(canvas, top):
    canvas.setStrokeColor(HexColor(LINE))
    canvas.setLineWidth(.6)
    canvas.line(M, PH - top, PW - M, PH - top)


def draw_item(canvas, item, x, top):
    path = ROOT / item['review_image']
    with Image.open(path) as raw:
        im = ImageOps.exif_transpose(raw).convert('RGB')
        im.thumbnail((1000, 700), Image.Resampling.LANCZOS)
    canvas.setFillColor(HexColor(MAT))
    canvas.rect(x, PH - top - IMAGE_H, CELL, IMAGE_H, stroke=0, fill=1)
    scale = min(CELL / im.width, IMAGE_H / im.height)
    width, height = im.width * scale, im.height * scale
    jpg = BytesIO()
    im.save(jpg, 'JPEG', quality=88, optimize=True)
    jpg.seek(0)
    canvas.drawImage(ImageReader(jpg), x + (CELL-width)/2, PH-top-(IMAGE_H+height)/2,
                     width=width, height=height)
    label(canvas, x, top + IMAGE_H + 16, item['id'], 'Bold', 9, RUST)
    label(canvas, x + 33, top + IMAGE_H + 16, item['title'], 'Bold', 12)
    pixels = f"{item['width_px']} × {item['height_px']}"
    medium = 'Photo' if item['media_type'] == 'Original photograph' else 'Camera frame'
    time = f"  ·  {item['timecode']}" if item['timecode'] else ''
    label(canvas, x, top + IMAGE_H + 31, f'{medium}  ·  {pixels}{time}', size=9, colour=MUTED)
    lines = []
    for word in item['notes'].split():
        if lines and pdfmetrics.stringWidth(lines[-1]+' '+word, 'Text', 9.4) <= CELL-2:
            lines[-1] += ' '+word
        else:
            lines.append(word)
    if len(lines) > 2:
        raise ValueError(f"Caption too long for {item['id']}")
    for n, line in enumerate(lines):
        label(canvas, x, top + IMAGE_H + 47 + n*12, line, size=9.4)


def build():
    rows = list(csv.DictReader(CATALOGUE.open(encoding='utf-8-sig')))
    pages = [[r for r in rows if r['sheet_page'] == str(p)] for p in (1, 2)]
    if any(len(group) != 6 for group in pages):
        raise ValueError('This edition uses six numbered entries per page.')
    buffer = BytesIO()
    pdf = Canvas(buffer, pagesize=(PW, PH), pageCompression=1)
    for i, ((title, sub, gap, gap_text), items) in enumerate(zip(sections, pages), 1):
        pdf.setFillColor(HexColor(PAPER))
        pdf.rect(0, 0, PW, PH, stroke=0, fill=1)
        label(pdf, M, 23, 'THE VEGETABLE GURU', 'Bold', 9.2, GREEN)
        label(pdf, PW-M, 23, 'PHOTO & VIDEO LIBRARY   /   CONTACT SHEET 01', 'Bold', 8.5, GREEN, True)
        rule(pdf, 32)
        label(pdf, M, 65, title, 'Title', 27, GREEN)
        label(pdf, M, 84, sub, size=11)
        for j, item in enumerate(items):
            draw_item(pdf, item, M+(j%3)*(CELL+SEP), 99+(j//3)*207)
        rule(pdf, 513)
        label(pdf, M, 534, gap, 'Bold', 10, RUST)
        label(pdf, M+103, 534, gap_text, size=10.1)
        rule(pdf, 555)
        label(pdf, M, 574, 'Frame times refer to the raw camera files. Quote the VG number when choosing an image.', size=9, colour=MUTED)
        label(pdf, PW-M, 574, f'18 November 2026    /    {i} of 2', 'Bold', 9, MUTED, True)
        pdf.showPage()
    pdf.save()
    buffer.seek(0)
    writer = PdfWriter()
    writer.append(PdfReader(buffer))
    for i, section in enumerate(sections):
        writer.add_outline_item(section[0], i)
    writer.add_attachment(CATALOGUE.name, CATALOGUE.read_bytes())
    writer.add_metadata({'/Title': 'The Vegetable Guru | Garden media contact sheet 01',
                         '/Subject': 'Twelve garden images for review, with the searchable source catalogue attached'})
    with PDF.open('wb') as stream:
        writer.write(stream)


if __name__ == '__main__':
    build()
