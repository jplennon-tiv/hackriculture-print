"""Build review copies from six preserved Chrome 4K frame captures. No source edits."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import base64, hashlib, html, json, re, sys

R = Path(__file__).resolve().parent

def embed_review_images(document):
    """Keep displayed images available when the HTML opens without sibling files."""
    def replace(match):
        source = match.group(2)
        if source.startswith('data:'):
            return match.group(0)
        image_path = (R / source).resolve()
        if not image_path.is_relative_to(R):
            raise ValueError(f'Review image outside study folder: {source}')
        encoded = base64.b64encode(image_path.read_bytes()).decode('ascii')
        return match.group(1) + 'data:image/jpeg;base64,' + encoded + match.group(3)
    return re.sub(r'(<img\b[^>]*\bsrc=")([^"]+)(")', replace, document)

# Repair/repackage the existing page without regenerating any image or manifest.
if '--embed-only' in sys.argv:
    review = R / 'REVIEW.html'
    review.write_text(embed_review_images(review.read_text()))
    print('Embedded all displayed review images; source and preview files untouched.')
    raise SystemExit(0)

(R / 'previews').mkdir(exist_ok=True)
FONT = '/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
PAPER, INK, MUTED, ACCENT = '#fff8e9', '#173e2c', '#526158', '#a44007'
choices = [
    ('T05', 'T05_05m16s042_4K.png', 316.041650, 'Offering the harvest',
     'First choice: direct eye contact, a gentle smile and the colander held towards the viewer.',
     'Strongest foreground fruit. Little space above the head for a large title.'),
    ('T02', 'T02_05m06s208_4K.png', 306.208318, 'Relaxed, front-facing',
     'A warm, open expression with the colander held comfortably at waist height.',
     'The tomatoes are smaller in the frame than T05; the expression is mid-speech.'),
    ('T04', 'T04_05m21s208_4K.png', 321.208318, 'A quieter portrait',
     'A more settled stance and clear eye contact, with the fruit slightly off-centre.',
     'Less immediate than the offered bowl; slightly open mouth.'),
    ('T03', 'T03_05m16s208_4K.png', 316.208318, 'Broader smile',
     'A nearby alternative to T05, with a broader smile and the bowl still prominent.',
     'Only about one sixth of a second later; retain as an expression alternative, not a distinct composition.'),
    ('T01', 'T01_05m01s208_4K.png', 301.208318, 'Turned slightly towards us',
     'A less square-on stance, with a good view of the colander and greenhouse planting.',
     'Head tilt and mid-speech expression are less composed than T05.'),
    ('T06', 'T06_04m41s042_4K.png', 281.041650, 'Picking among the plants',
     'A useful action alternative showing the growing context and the actual harvest.',
     'Face turned away and fruit much smaller. Better supporting imagery than the leading portrait.'),
]
records = []
for ident, filename, seconds, title, strength, limitation in choices:
    path = R / 'frames' / filename
    im = Image.open(path).convert('RGB')
    assert im.size == (3840, 2160), (filename, im.size)
    preview = im.copy(); preview.thumbnail((1600, 900))
    preview.save(R / 'previews' / f'{ident}.jpg', quality=94)
    # Exact 185:240 ratio, a consistent comparison crop; sources remain intact.
    box = (1190, 0, 2855, 2160)
    portrait = im.crop(box); portrait.thumbnail((740, 960))
    portrait.save(R / 'previews' / f'{ident}-portrait.jpg', quality=94)
    records.append(dict(id=ident, filename=f'frames/{filename}', playback_seconds=seconds,
                        title=title, strength=strength, limitation=limitation,
                        width=3840, height=2160, bytes=path.stat().st_size,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                        preview=f'previews/{ident}.jpg', portrait_preview=f'previews/{ident}-portrait.jpg',
                        portrait_crop_xyxy=list(box), status='unapproved source candidate'))

manifest = dict(date='2026-11-11', video_title='Garden Tomato Surplus? Make Passata!',
                video_url='https://www.youtube.com/watch?v=sIUbl3cKZsQ',
                studio_upload_filename='Garde Tomato Surplus - Oven Roasted Passata.mp4',
                capture_method='Chrome native Save Video Frame As, paused YouTube playback explicitly set to 2160p. Video DOM and saved PNG dimensions checked.',
                quality_note='These are decoded frames from the YouTube 4K stream, not the original camera files or a lossless source video. PNG preserves the captured pixels; YouTube compression and source focus remain.',
                timing_note='Times record player currentTime. Millisecond labels are navigation references, not independently measured source-video presentation timestamps.',
                scope='Targeted greenhouse harvest and front-facing colander sequence, approximately 4:41–5:26. Later kitchen material and the whole 19:32 video were not reviewed exhaustively in this pass.',
                edits='No retouching, generated content, sharpening, colour changes or upscaling. Separate review JPEGs are reduced; portrait previews crop only.',
                recommendation='T05 first, T02 second; T04 quieter alternative. All remain proposals.',
                candidates=records)
(R / 'FRAMES.json').write_text(json.dumps(manifest, indent=2)+'\n')

def font(size, bold=False): return ImageFont.truetype(BOLD if bold else FONT, size)
def sheet(title, subtitle, size):
    out = Image.new('RGB', size, PAPER); d = ImageDraw.Draw(out)
    d.text((30, 20), title, font=font(34, True), fill=INK)
    d.text((30, 66), subtitle, font=font(21), fill=MUTED)
    return out, d

out, d = sheet('Tomato harvest: three framing candidates',
               '185 × 240 proportions · crop studies only · unretouched 4K sources retained', (1500, 830))
for n, r in enumerate(records[:3]):
    x = 30+n*490; y = 110
    im = Image.open(R/r['portrait_preview']); im.thumbnail((450, 584))
    out.paste(im, (x, y))
    d.text((x, 709), f"{r['id']}  {r['title']}", font=font(22, True), fill=INK)
    d.text((x, 742), f"5:{r['playback_seconds']-300:06.3f}", font=font(20), fill=ACCENT)
d.text((30, 792), 'T05 is my first choice. A separate title area would keep lettering clear of the face and foliage.', font=font(20), fill=MUTED)
out.save(R/'Portrait-framing.jpg', quality=94)

out, d = sheet('Tomato harvest: all six captured frames',
               'Full landscape frames · reduced for review · click through the gallery for native PNGs', (1500, 815))
for n, r in enumerate(records):
    x=30+(n%3)*490; y=110+(n//3)*335
    im=Image.open(R/r['preview']); im.thumbnail((450,254)); out.paste(im,(x,y))
    d.text((x,y+266), f"{r['id']}  {r['title']}", font=font(21,True),fill=INK)
    m=int(r['playback_seconds']//60); sec=r['playback_seconds']%60
    d.text((x,y+295),f'{m}:{sec:06.3f} · 3840 × 2160 px',font=font(19),fill=MUTED)
out.save(R/'All-six-frames.jpg',quality=94)

cards=[]
for r in records:
    m=int(r['playback_seconds']//60); sec=r['playback_seconds']%60
    cards.append(f'''<article><h2>{r['id']} — {html.escape(r['title'])}</h2>
    <div class="compare"><img src="{r['preview']}" alt="{html.escape(r['title'])}: full frame">
    <img src="{r['portrait_preview']}" alt="{html.escape(r['title'])}: portrait crop"></div>
    <p>{html.escape(r['strength'])}</p><p class="muted">{html.escape(r['limitation'])}</p>
    <p><a href="{r['filename']}">Open native 4K PNG</a> · <a href="https://www.youtube.com/watch?v=sIUbl3cKZsQ&amp;t={int(r['playback_seconds'])}s">Video at {m}:{sec:06.3f}</a></p></article>''')
(R/'REVIEW.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tomato harvest framing study</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff8e9;color:#173e2c;font:17px/1.55 system-ui,sans-serif}main{max-width:1150px;margin:45px auto;padding:0 25px}h1{font-size:clamp(30px,4vw,48px);line-height:1.1}h2{font-size:25px}a{color:#a44007}header{max-width:940px}.muted{color:#526158}.label{letter-spacing:.12em;font-size:12px;font-weight:700}article{background:#fff;padding:26px;margin:28px 0}.compare{display:grid;grid-template-columns:2fr 1fr;gap:20px;align-items:start}.compare img{width:100%;height:auto}aside{padding:20px 25px;background:#e9eddf}.overview{width:100%;margin-top:20px}@media(max-width:650px){.compare{grid-template-columns:1fr}.compare img:last-child{max-width:320px}article{padding:16px}}
</style></head><body><main><header><p class="label">THE VEGETABLE GURU · 11 NOVEMBER 2026 · SOURCE STUDY</p><h1>The harvest has a face</h1><p><strong>T05 at about 5:16 is the strongest candidate:</strong> direct eye contact, a relaxed smile and red tomatoes offered towards the reader. T02 is the more relaxed alternative; T04 is a quieter portrait.</p><p>Six native 3840 × 2160 PNGs were captured from the YouTube 4K stream. These are unretouched source candidates, not an approved cover. The landscape views below preserve the complete frame; portrait previews show one consistent 185:240 crop.</p></header>
<img class="overview" src="Portrait-framing.jpg" alt="Three leading portrait framing studies">
<aside><strong>Layout implication:</strong> the plants frame the person and harvest well, but leave little quiet title space. Start with a cream title area above a photographic panel. A full-height 185 × 240 mm crop provides about 229 ppi before bleed. A 185 × 160 mm photo panel provides about 343 ppi from this source. Pixel counts do not remove video compression or focus softness. No typography or cover route has been approved.</aside>
<p><a href="All-six-frames.jpg">All six frames on one sheet</a> · <a href="FRAMES.json">Capture records and exact filenames</a> · <a href="../REVIEW.html">Earlier archive shortlist</a></p>
'''+''.join(cards)+'''<p class="muted">The original upload filename shown in YouTube Studio is “Garde Tomato Surplus - Oven Roasted Passata.mp4”. The original video was not downloaded. Current title, copy, G2/B5 references, production cover and interior remain untouched.</p></main></body></html>''')
review = R / 'REVIEW.html'
review.write_text(embed_review_images(review.read_text()))
print('Built six previews, six crop studies, two contact sheets, self-contained gallery and frame manifest.')
