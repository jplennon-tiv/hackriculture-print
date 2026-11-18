from pathlib import Path as P
import base64,html,io,json
from PIL import Image,ImageOps
d=P(__file__).resolve().parent
rows=json.loads((d/'sources.json').read_text())
def card(r):
 im=ImageOps.exif_transpose(Image.open(d/r['file'])).convert('RGB');im.thumbnail((640,380),Image.Resampling.LANCZOS);out=io.BytesIO();im.save(out,'JPEG',quality=77,optimize=True)
 jpg=base64.b64encode(out.getvalue()).decode()
 date=r['captured'][:10];w,h=r['dimensions']
 time=f" · raw {int(r['seek_seconds']//60):02}:{r['seek_seconds']%60:06.3f}" if 'seek_seconds' in r else ''
 return f"""<figure><a href="{html.escape(r['file'])}"><img src="data:image/jpeg;base64,{jpg}" alt="{html.escape(r['title'])}"></a><figcaption><h3><small>{r['id']}</small> {html.escape(r['title'])}</h3><p>{html.escape(r['note'])}</p><p class="meta">{date} · {w} × {h}{time}</p></figcaption></figure>"""
def grid(kind,role):
 return '<div class="grid">'+''.join(card(r) for r in rows if r['role']==role and (kind is None or r['setting']==kind))+'</div>'
def motion():
 out=[]
 for r in json.loads((d/'motion-references.json').read_text()):
  poster=next(p['file'] for p in rows if p['id']=={'HM01':'H07','AM01':'A05'}[r['id']])
  out.append(f'<figure><video controls playsinline preload="none" poster="{html.escape(poster)}" style="width:100%;display:block"><source src="{html.escape(r["file"])}" type="video/mp4"></video><figcaption><h3>{r["id"]} {html.escape(r["title"])}</h3><p>{html.escape(r["note"])}</p><a href="{html.escape(r["file"])}">Open local clip</a> · 35 seconds</figcaption></figure>')
 return '<h2>Short drone clips</h2><div class="grid">'+''.join(out)+'</div>'

markup="""<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vegetable Guru · Location references</title><style>
*{box-sizing:border-box}body{margin:0;background:#fcfaf4;color:#202b23;font:16px/1.5 -apple-system,BlinkMacSystemFont,Arial,sans-serif}main{max-width:1260px;margin:auto;padding:28px clamp(20px,4vw,68px) 56px}header{border-bottom:2px solid #36543e;padding-bottom:16px}.brand{font-weight:700;font-size:.85rem;letter-spacing:.13em;color:#36543e;text-transform:uppercase;margin:0}h1,h2{font-family:Georgia,serif;color:#24432e}h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.05;margin:12px 0}h2{font-size:1.8rem;margin:30px 0 12px}header p,p{margin:.4em 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:22px 17px}figure{margin:0}img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#eceee6;display:block}h3{font-size:1.02rem;line-height:1.3;margin:.6em 0 .35em}small{color:#8d512f;margin-right:.25em}figcaption p{font-size:.93rem}.meta{color:#576256;font-size:.82rem}details{margin-top:30px;border-block:1px solid #c5d0bf;padding:12px 0}summary{cursor:pointer;font-weight:700;color:#24432e}details .grid{margin-top:16px}footer{margin-top:20px}a{color:#235b3c}</style>
<main><header><p class="brand">The Vegetable Guru</p><h1>Garden and allotment references</h1><p>Open a photograph for the full-resolution local file. Each camera frame has a seek time in the original clip.</p></header><h2>Home garden and greenhouses</h2>"""+grid('home garden','reference')+'<h2>The allotment</h2>'+grid('allotment','reference')+''+motion()+'<details><summary>Two comparison angles set aside for a later test</summary>'+grid(None,'comparison')+'</details><footer><a href="Vegetable-Guru-Location-Contact-Sheet.pdf">Location contact sheet (PDF)</a> · <a href="drone-index.csv">All seven drone clips</a> · <a href="motion-references.json">Excerpt sources</a> · <a href="sources.json">Source files, capture dates and checksums</a> · <a href="channel-crosscheck.csv">Channel comparison</a> · <a href="photo-date-screen.csv">Archive photograph dates</a></footer></main></html>'
(d/'index.html').write_text(markup)
