"""Build the offline photographic atlas from the local register and grouped viewpoints."""
from io import BytesIO
import json
import math
from pathlib import Path
from PIL import Image, ImageOps
from reportlab import rl_config
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

out = Path(__file__).resolve().parent
root = out.parent
font_dir = root.parents[1] / 'vegetable-guru-stock/allotment-handover-2026-11-19/atlas/source/fonts'
for face, file in [('Text', 'NotoSans-Regular.ttf'), ('Bold', 'NotoSans-Bold.ttf'), ('Display', 'NotoSerif-Regular.ttf')]:
    pdfmetrics.registerFont(TTFont(face, str(font_dir / file)))

areas = json.loads((out / 'areas.json').read_text())
rows = {r['id']: r for r in json.loads((root / 'sources.json').read_text())}
width, height = landscape(A4)
paper, ink, muted, accent = '#faf8f1', '#203d32', '#53675d', '#79442f'
rl_config.useA85 = 0
pdf = Canvas(str(out / 'Garden-and-Allotment-Viewpoints.pdf'), pagesize=(width, height), pageCompression=1)
pdf.setTitle('Garden and allotment viewpoints | The Vegetable Guru')
def text(x, y, message, size=10, face='Text', fill=ink):
    pdf.setFillColor(HexColor(fill))
    pdf.setFont(face, size)
    pdf.drawString(x, y, message)
def lines(x, y, message, wrap, size, leading, font='Text', colour=ink):
    for part in simpleSplit(message, font, size, wrap):
        text(x, y, part, size, font, colour)
        y -= leading
    return y
def image(key, x, y, w, h):
    with Image.open(root / rows[key]['file']) as original:
        im = ImageOps.exif_transpose(original).convert('RGB')
        im.thumbnail((900, 640), Image.Resampling.LANCZOS)
    stream = BytesIO()
    im.save(stream, 'JPEG', quality=80, optimize=True)
    stream.seek(0)
    scale = min(w / im.width, h / im.height)
    iw, ih = im.width * scale, im.height * scale
    pdf.setFillColor(HexColor('#ebece1'))
    pdf.rect(x, y, w, h, fill=1, stroke=0)
    pdf.drawImage(ImageReader(stream), x + (w-iw)/2, y+(h-ih)/2, iw, ih)
def base(number):
    pdf.setFillColor(HexColor(paper))
    pdf.rect(0, 0, width, height, stroke=0, fill=1)
    pdf.setStrokeColor(HexColor('#bdc8b9'))
    pdf.line(27, 25, width-27, 25)
    text(27, 11, 'THE VEGETABLE GURU    /    CAMERA REFERENCE    /    19 NOVEMBER 2026', 7.6, 'Bold', muted)
    pdf.setFillColor(HexColor(muted))
    pdf.setFont('Text', 8)
    pdf.drawRightString(width-27, 11, f'{number}  /  {total}')
def date_label(row):
    published = row.get('timebase') == 'published edit'
    label = ('Published '+row['published']) if published else row['captured'][:10]
    if 'seek_seconds' in row:
        t = int(row['seek_seconds'])
        label += f"   ·   {'Edit' if published else 'Camera'} {t//60:02}:{t%60:02}"
    return label
def chunks(keys):
    count = math.ceil(len(keys)/6)
    each, rem = divmod(len(keys), count)
    start = 0
    for i in range(count):
        end = start + each + (i < rem)
        yield keys[start:end]
        start = end
groups = [list(chunks(a['ids'])) for a in areas]
total = 1 + sum(map(len, groups))
base(1)
pdf.bookmarkPage('index')
text(28, height-31, 'THE VEGETABLE GURU    /    LOCATION PHOTOGRAPHY', 9, 'Bold', muted)
text(27, height-77, 'Garden and allotment viewpoints', 33, 'Display')
text(28, height-100, 'Choose the part of the site that will appear behind the work. Each picture carries its local reference ID.', 11)
page = 2
starts = []
for sections in groups:
    starts.append(page)
    page += len(sections)
for ix, (name, key, relevant) in enumerate([('Home garden', 'H24', list(range(7))), ('Allotment', 'A55', list(range(7,12)))]):
    x = 28 + ix*402
    image(key, x, 306, 382, 163)
    text(x, 277, name, 21, 'Display')
    for j, index in enumerate(relevant):
        y = 250 - j*23
        text(x, y, areas[index]['title'], 11)
        pdf.setFont('Bold', 10)
        pdf.drawRightString(x+378, y, str(starts[index]))
        pdf.linkRect('', f'g{index}', (x, y-4, x+380, y+13), relative=0, thickness=0)
text(430, 113, 'Reserved comparison angles', 10, 'Bold', accent)
pdf.linkRect('', 'g12', (430,108,810,126), relative=0, thickness=0)
text(430, 89, 'H09 and A03 are set aside for checking a new composition.', 9)
text(28, 46, 'The full-size local files and exact source times are listed in the offline reference board.', 9, 'Text', muted)
pdf.showPage()

page = 2
for i,(area,sections) in enumerate(zip(areas,groups)):
    for part,keys in enumerate(sections):
        base(page)
        if part==0:
            pdf.bookmarkPage(f'g{i}')
            pdf.addOutlineEntry(area['title'], f'g{i}')
        text(28,height-28,area['site'].upper(),9,'Bold',muted)
        text(27,height-62,area['title'],24,'Display')
        lines(28,height-84,area['note'],width-62,9.3,13)
        number_cols = 2 if len(keys)<=4 else 3
        gap=16
        tile=(width-56-gap*(number_cols-1))/number_cols
        for j,key in enumerate(keys):
            col, row = j%number_cols, j//number_cols
            x=28+col*(tile+gap)
            top=height-115-row*222
            r=rows[key]
            image(key,x,top-123,tile,123)
            text(x,top-137,f'{key}    /    {date_label(r)}',8,'Bold',muted)
            y=lines(x,top-154,r['title'],tile,10.5,13,'Bold')
            bottom=lines(x,y-1,r['note'],tile,8.3,10.8)
            if bottom+10 < (top-219):
                raise ValueError(f'{key} caption exceeds tile')
        pdf.linkRect('Contents','index',(22,4,340,24),relative=0,thickness=0)
        pdf.showPage()
        page+=1
pdf.save()
