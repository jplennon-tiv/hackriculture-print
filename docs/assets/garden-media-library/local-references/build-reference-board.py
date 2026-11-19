from pathlib import Path as P
import base64,html,io,json
from PIL import Image,ImageOps
d=P(__file__).resolve().parent
rows=json.loads((d/'sources.json').read_text())
def card(r):
 im=ImageOps.exif_transpose(Image.open(d/r['file'])).convert('RGB');im.thumbnail((640,380),Image.Resampling.LANCZOS);out=io.BytesIO();im.save(out,'JPEG',quality=77,optimize=True)
 jpg=base64.b64encode(out.getvalue()).decode()
 published=r.get('timebase')=='published edit'
 date=('Published '+r['published']) if published else r['captured'][:10]
 clock='published edit' if published else 'camera'
 w,h=r['dimensions']
 time=f" · {clock} {int(r['seek_seconds']//60):02}:{r['seek_seconds']%60:06.3f}" if 'seek_seconds' in r else ''
 return f"""<figure><a href="{html.escape(r['file'])}"><img src="data:image/jpeg;base64,{jpg}" alt="{html.escape(r['title'])}"></a><figcaption><h3><small>{r['id']}</small> {html.escape(r['title'])}</h3><p>{html.escape(r['note'])}</p><p class="meta">{date} · {w} × {h}{time}</p></figcaption></figure>"""
def atlas():
 areas=json.loads((d/'viewpoint-atlas/areas.json').read_text())
 by_id={r['id']:r for r in rows}
 nav={};sections=[]
 for i,area in enumerate(areas):
  name=html.escape(area['title'])
  site=html.escape(area['site'].capitalize())
  nav.setdefault(site,[]).append(f'<a href="#area-{i}">{name}</a>')
  entries=''.join(card(by_id[key]) for key in area['ids'])
  sections.append(f'<section id="area-{i}"><h2>{name}</h2><p class="brand">{site}</p><p>{html.escape(area["note"])}</p><div class="grid">{entries}</div><p><a href="#areas">Back to viewpoints</a></p></section>')
 navigation=''.join(f'<p><strong>{site}</strong> &nbsp;{" · ".join(links)}</p>' for site,links in nav.items())
 return '<nav id="areas" aria-label="Viewpoints">'+navigation+'</nav>'+''.join(sections)

def motion():
 out=[]
 for r in json.loads((d/'motion-references.json').read_text()):
  poster=next(p['file'] for p in rows if p['id']=={'HM01':'H07','AM01':'A05'}[r['id']])
  out.append(f'<figure><video controls playsinline preload="none" poster="{html.escape(poster)}" style="width:100%;display:block"><source src="{html.escape(r["file"])}" type="video/mp4"></video><figcaption><h3>{r["id"]} {html.escape(r["title"])}</h3><p>{html.escape(r["note"])}</p><a href="{html.escape(r["file"])}">Open local clip</a> · 35 seconds</figcaption></figure>')
 return '<h2>Short drone clips</h2><div class="grid">'+''.join(out)+'</div>'

markup="""<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vegetable Guru · Location references</title><style>
*{box-sizing:border-box}body{margin:0;background:#fcfaf4;color:#202b23;font:16px/1.5 -apple-system,BlinkMacSystemFont,Arial,sans-serif}main{max-width:1260px;margin:auto;padding:28px clamp(20px,4vw,68px) 56px}header{border-bottom:2px solid #36543e;padding-bottom:16px}.brand{font-weight:700;font-size:.85rem;letter-spacing:.13em;color:#36543e;text-transform:uppercase;margin:0}h1,h2{font-family:Georgia,serif;color:#24432e}h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.05;margin:12px 0}h2{font-size:1.8rem;margin:30px 0 12px}header p,p{margin:.4em 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:22px 17px}figure{margin:0}img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#eceee6;display:block}h3{font-size:1.02rem;line-height:1.3;margin:.6em 0 .35em}small{color:#8d512f;margin-right:.25em}figcaption p{font-size:.93rem}.meta{color:#576256;font-size:.82rem}nav{margin:20px 0;line-height:1.9;max-width:1000px}section>p{max-width:780px}details{margin-top:30px;border-block:1px solid #c5d0bf;padding:12px 0}summary{cursor:pointer;font-weight:700;color:#24432e}details .grid{margin-top:16px}footer{margin-top:20px}a{color:#235b3c}</style>
<main><header><p class="brand">The Vegetable Guru</p><h1>Garden and allotment viewpoints</h1><p>Choose a part of the garden or allotment. Select a photograph to open the local image at full size.</p><p><a href="viewpoint-atlas/Garden-and-Allotment-Viewpoints.pdf">Illustrated atlas (PDF)</a> · <a href="viewpoint-atlas/README.md">Coverage and source notes</a></p></header>"""+atlas()+motion()+'<footer><a href="Vegetable-Guru-Location-Contact-Sheet.pdf">Location contact sheet (PDF)</a> · <a href="drone-index.csv">All seven drone clips</a> · <a href="motion-references.json">Excerpt sources</a> · <a href="sources.json">Source files, capture dates and checksums</a> · <a href="channel-crosscheck.csv">Channel comparison</a> · <a href="photo-date-screen.csv">Archive photograph dates</a></footer></main></html>'
(d/'index.html').write_text(markup)
