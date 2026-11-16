"""Make a source-preserving photographic shortlist, not a new cover design."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import hashlib, json, shutil, textwrap, zipfile

ROOT=Path(__file__).resolve().parent
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
pdfmetrics.registerFont(TTFont('Review',FONT))
pdfmetrics.registerFont(TTFont('ReviewBold',BOLD))
BG='#f8f5ec'; INK='#234a36'; GREY='#52645a'
native={x['id']:x for x in json.loads((ROOT/'NATIVE.json').read_text())}
archive={x['id']:x for x in json.loads((ROOT/'ARCHIVE-PHOTO-LEADS.json').read_text())}
specs=[
 dict(id='P01',native='P01',slug='tomato-trusses',title='Tomatoes on the vine',
      date='30 September 2026',priority='First choice for colour',crop=[0,260,3840,1796],
      strength='Red, orange and green fruit in a genuinely irregular arrangement. The strongest colour lead.',
      limit='Hard sunshine and greenhouse bars remain visible. Better in the deeper lower band.'),
 dict(id='P02',native='P02',slug='peas-on-the-plant',title='Peas on the plant',
      date='28 June 2026',priority='Strong growing detail',crop=[0,430,3840,1966],
      strength='Clear pods and curling tendrils; a strong sense of the crop actually growing.',
      limit='Mostly green, with support netting visible. Pair with a warmer harvest photograph.'),
 dict(id='P03',native='P03',slug='potatoes-in-hands',title='Freshly lifted potatoes',
      date='24 June 2026',priority='Strongest human detail',crop=[1500,1000,3840,1936],
      strength='Your hands, fresh potatoes and soil tell a complete gardening story. My favourite human detail.',
      limit='The wide crop removes most of the sheds and shirt lettering; some soil and clothing remain.'),
 dict(id='P04',archive='L031',slug='courgette-flower',title='Courgette flowers',
      date='15 July 2018',priority='Colour accent / reserve',crop=[0,250,5472,2439],
      strength='A bright yellow accent and natural crossing stems. Useful contrast to the green photographs.',
      limit='Strong sun loses detail in parts of the petals. The wide crop emphasises flowers over the fruit.'),
 dict(id='P05',native='P05',slug='green-tomato-truss',title='Green tomato truss',
      date='5 August 2026',priority='Quieter green alternative',crop=[0,250,3840,1786],
      strength='Good fruit texture and natural variations in size and angle; a quieter alternative to P01.',
      limit='The truss is vertical, so the strip crops its lowest fruit. It needs more depth than a very thin band.'),
 dict(id='P06',archive='N07251',slug='carrot-and-beetroot',title='Carrot and beetroot',
      date='10 August 2013',priority='Natural harvest / lower resolution',crop=[0,230,1600,870],
      strength='An unmistakably real harvest, with soil attached and vegetables resting naturally together.',
      limit='Retained review copy only: original drive is absent. 1600 pixels wide (~220 ppi at 185 mm); find the original before production.'),
]

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def stamp(sec): return f'{int(sec)//60:02d}:{sec%60:06.3f}'
selected=ROOT/'selected-stills'; selected.mkdir(exist_ok=True)
previews=ROOT/'previews';previews.mkdir(exist_ok=True)
rows=[]
for spec in specs:
 row=dict(spec)
 if 'native' in row:
  src=native[row['native']]; frame=src['frames'][0]; original=Path(frame['file'])
  row.update(kind='video still',source_id=src['sourceId'],source_path=src['path'],
    source_folder=src['shoot'],requested_seconds=frame['requestedSeconds'],
    raw_camera_time=stamp(frame['requestedSeconds']),source_basis='Camera filename date; raw camera seek time',
    treatment='Native decoded frame, no retouching, enhancement or upscaling')
 else:
  src=archive[row['archive']];original=Path(src['source_path'])
  row.update(kind='archive photograph',source_id=src['id'],source_path=str(original),
    source_folder=str(original.parent),source_basis='Original EXIF date, from retained photo inventory',
    treatment='Exact original JPEG bytes; no retouching, enhancement or upscaling')
  if original.exists():
   assert sha(original)==src['source_sha256']
   row['copy_status']='Exact original JPEG'
  else:
   original=ROOT.parent/'cover-photo-search'/src['preview']
   assert sha(original)==src['preview_sha256']
   row.update(copy_status='Retained review JPEG; original drive not currently mounted',
    treatment='Unretouched retained review JPEG, not the original bytes',original_sha256=src['source_sha256'])
 dest=selected/f"{row['id']}-{row['slug']}{original.suffix.lower()}"
 shutil.copyfile(original,dest)
 with Image.open(dest) as raw:
  im=ImageOps.exif_transpose(raw).convert('RGB'); row['width'],row['height']=im.size
  crop=im.crop(row['crop']);row['crop_width'],row['crop_height']=crop.size
  crop.thumbnail((1800,1200));crop.save(previews/f"{row['id']}-strip.jpg",quality=95)
  im.thumbnail((1800,1200));im.save(previews/f"{row['id']}-full.jpg",quality=94)
 source_file=Path(row['source_path'])
 row.update(file=dest.relative_to(ROOT).as_posix(),sha256=sha(dest),source_currently_available=source_file.exists(),
    source_size_bytes=source_file.stat().st_size if source_file.exists() else None,
    source_mtime_ns=source_file.stat().st_mtime_ns if source_file.exists() else None,
    proposed_crop_ppi_at_185mm=round(row['crop_width']/(185/25.4)),
    crop_status='Proposal for comparison only; not an approved placement')
 rows.append(row)

manifest={'date':'2026-11-15','status':'Unapproved source shortlist; Version 1 retained separately',
 'review':{'clips_sampled':52,'source_duration_minutes':301.4,'initial_frames':217,'targeted_followup_frames':83,
 'method':'Distributed sampling, then targeted follow-up and full-resolution inspection; not exhaustive playback',
 'coverage':'June, July, August and September 2026 gardening footage on Videos; earlier mounted-drive photo inventory reused',
 'online_limit':'Fresh YouTube/channel access was throttled. These selections come from local camera originals and archive photos.',
 'timestamp_note':'Times are seek positions in raw camera files, not timestamps in edited YouTube episodes.',
 'rejected_details':'The sweetcorn close-up resolved into a leaf rather than a recognisable cob. Lifted garlic was less effective as a narrow band. Neither is in the delivered selection.'},
 'recommendation':'Start with P01 for colour, P02 for the growing crop, and P03 for a human harvest detail. Test P01/P03 first; no new cover assembled.',
 'candidates':rows}
(ROOT/'SHORTLIST.json').write_text(json.dumps(manifest,indent=2)+'\n')

# A clear, readable contact sheet with proposed wide crops.
sheet=Image.new('RGB',(1800,1580),BG);d=ImageDraw.Draw(sheet)
def font(size,bold=False):return ImageFont.truetype(BOLD if bold else FONT,size)
d.text((40,25),'Real photographs for the cover',font=font(51,True),fill=INK)
d.text((40,92),'Four video stills + two earlier photo finds  |  15 November 2026',font=font(28),fill=GREY)
for i,row in enumerate(rows):
 x=40+(i%2)*880;y=160+(i//2)*440
 d.text((x,y),row['id']+'  '+row['title'],font=font(31,True),fill=INK)
 crop=Image.open(previews/f"{row['id']}-strip.jpg");crop=crop.resize((840,336),Image.Resampling.LANCZOS)
 sheet.paste(crop,(x,y+48))
 desc=row['date']+('  |  '+row['raw_camera_time']+' raw' if row['kind']=='video still' else ('  |  archive review copy' if row['id']=='P06' else '  |  archive photo'))
 d.text((x,y+395),desc,font=font(24),fill=GREY)
d.text((40,1500),'Proposed crops; no generated edits. P06 is a review copy; its original drive is absent.',font=font(25),fill=GREY)
sheet.save(ROOT/'Summer-Cover-Photo-Shortlist.png')

# Overview portrait page, then three landscape pages for original/crop comparison.
pdf=ROOT/'Summer-Cover-Photo-Shortlist.pdf'
c=canvas.Canvas(str(pdf),pagesize=(210*mm,297*mm));c.setTitle('The Vegetable Guru — real cover photograph shortlist')
c.setAuthor('Prepared for John Lennon')
H=297
def text(x,y,s,size=9,bold=False,color=INK):
 c.setFillColor(HexColor(color));c.setFont('ReviewBold' if bold else 'Review',size);c.drawString(x*mm,(H-y)*mm,s)
def para(x,y,s,width,size=8.3,leading=3.8):
 words=s.split();line='';yy=y
 for word in words:
  test=(line+' '+word).strip()
  if pdfmetrics.stringWidth(test,'Review',size)>width*mm and line:
   text(x,yy,line,size);yy+=leading;line=word
  else:line=test
 if line:text(x,yy,line,size)
 return yy+leading
def picture(file,x,y,w,h):
 c.drawImage(str(file),x*mm,(H-y-h)*mm,w*mm,h*mm,preserveAspectRatio=True,anchor='c')
def page_bg():
 c.setFillColor(HexColor(BG));c.rect(0,0,297*mm,297*mm,fill=1,stroke=0)
page_bg();text(14,18,'Real photographs for the cover',18,True)
text(14,27,'The Vegetable Guru  /  Source shortlist  /  15 November 2026',9,color=GREY)
para(14,37,'My starting choices: P01 for colour, P02 for the growing crop, and P03 for a human harvest detail. These are sources to try, not a new cover design.',182,9,4.3)
for i,row in enumerate(rows):
 x=14+(i%2)*94;y=58+(i//2)*62
 text(x,y,row['id']+'  '+row['title'],10,True)
 picture(previews/f"{row['id']}-strip.jpg",x,y+4,88,35.2)
 text(x,y+44,row['date'],8)
 text(x,y+49,row.get('raw_camera_time','Archive photograph')+(' raw camera file' if 'raw_camera_time' in row else ''),7.5,color=GREY)
para(14,250,'52 local clips sampled across 301 minutes of footage; 300 scouting frames inspected, followed by native-resolution checks. This was a sampled search, not continuous playback.',182,8.5,4.2)
para(14,265,'Four new video stills and two earlier photographs. Full images and proposed crops follow. P06 is a retained review copy: its original drive is absent. No enhancement or generated imagery.',182,8.5,4.2)
text(14,289,'Raw-file times differ from edited YouTube timings. Full paths are in the accompanying source manifest.',7.5,color=GREY)
c.showPage()
for page in range(3):
 H=210;c.setPageSize((297*mm,210*mm));page_bg()
 text(14,12,'Full image → proposed strip crop',14,True)
 text(229,12,f'The Vegetable Guru  /  {page+2} of 4',8,color=GREY)
 for col in range(2):
  row=rows[page*2+col];x=14+col*140
  text(x,25,row['id']+'  '+row['title'],13,True)
  src_label=row['date']+'  ·  '+(row['raw_camera_time']+' raw camera file' if 'raw_camera_time' in row else 'archive photograph')
  text(x,32,src_label,8.5,color=GREY)
  text(x,37,Path(row['source_path']).name,7.8,color=GREY)
  picture(previews/f"{row['id']}-full.jpg",x,40,129,72.6)
  text(x,117,'PROPOSED WIDE CROP',7.5,True,color=GREY)
  picture(previews/f"{row['id']}-strip.jpg",x,120,129,51.6)
  yy=para(x,178,row['strength'],129,8.3,3.8)
  yy=para(x,yy+1,row['limit'],129,8.3,3.8)
  assert yy<202,(row['id'],yy)
  text(x,205,f"Original: {row['width']} × {row['height']} px  |  Crop: ~{row['proposed_crop_ppi_at_185mm']} ppi at 185 mm wide",7.3,color=GREY)
 c.showPage()
c.save()

# Copy-readable source notes and original stills in one archive.
notes=['# Real cover photograph shortlist','',
 'Six unapproved candidates, saved 15 November 2026. The current generated front is separately frozen as Version 1.',
 'No image enhancement, retouching or upscaling has been applied. Video PNGs are native decoded frames. P04 is an exact original JPEG; P06 is a retained review copy because its original drive is not currently mounted.',
 'Times below refer to RAW CAMERA FILES, not edited YouTube episodes. Crop proposals do not change the originals.','']
for row in rows:
 notes += [f"## {row['id']} — {row['title']}",f"File: {row['file']}",f"Original source: {row['source_path']}",
  f"Date: {row['date']}; raw time: {row.get('raw_camera_time','not applicable')}",
  f"Dimensions: {row['width']} × {row['height']} px; SHA256: {row['sha256']}",row['treatment'],row['strength'],row['limit'],'']
(ROOT/'SOURCE-NOTES.md').write_text('\n'.join(notes)+'\n')
with zipfile.ZipFile(ROOT/'Cover-Photo-Shortlist-Stills.zip','w',zipfile.ZIP_DEFLATED,compresslevel=2) as z:
 for row in rows:z.write(ROOT/row['file'],row['file'])
 for name in ['SHORTLIST.json','SOURCE-NOTES.md','Summer-Cover-Photo-Shortlist.png','Summer-Cover-Photo-Shortlist.pdf']:
  z.write(ROOT/name,name)
checks={'pages':len(PdfReader(pdf).pages),'images':len(rows),'delivered_file_hashes_verified':all(sha(ROOT/r['file'])==r['sha256'] for r in rows),
 'available_original_sources':sum(Path(r['source_path']).is_file() for r in rows),
 'missing_originals_disclosed':[r['id'] for r in rows if not r['source_currently_available']],
 'all_crops_within_original':all(0<=r['crop'][0]<r['crop'][2]<=r['width'] and 0<=r['crop'][1]<r['crop'][3]<=r['height'] for r in rows),
 'pdf_contains_every_id':all(r['id'] in '\n'.join(p.extract_text() for p in PdfReader(pdf).pages) for r in rows),
 'pdf_visual_review':'Pending rendered-page inspection'}
assert checks['pages']==4 and all(v for k,v in checks.items() if isinstance(v,bool))
(ROOT/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps({'files':[{'name':p.name,'bytes':p.stat().st_size} for p in [pdf,ROOT/'Summer-Cover-Photo-Shortlist.png',ROOT/'Cover-Photo-Shortlist-Stills.zip']], 'checks':checks},indent=2))
