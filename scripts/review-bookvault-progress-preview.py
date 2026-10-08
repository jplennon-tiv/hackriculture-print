"""Render a small, representative selection from the assembled screen PDF."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/publication/bookvault-progress-preview'
receipt=json.loads((DOC/'CHECKS.json').read_text())
PDF=ROOT/receipt['pdf']
images=DOC/'pages'
images.mkdir(exist_ok=True)
samples={'front':1,'back':152,**{f'folio-{n}':n+2 for n in [1,2,3,4,5,6,7,14,15,40,41,116,117]}}

def render(item):
    name,page=item
    subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-r','130','-jpeg','-jpegopt','quality=88','-cropbox',str(PDF),str(images/name)],check=True,capture_output=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(render,samples.items()))

pdf_link='../../../'+receipt['pdf']
def sheet(name,label):
    return f'<figure><a href="{pdf_link}#page={samples[name]}"><img src="pages/{name}.jpg" alt="{label}" loading="lazy"></a><figcaption>{label}</figcaption></figure>'
def spread(title,folios,note):
    return f'<section><h2>{title}</h2><p>{note}</p><div class="spread">'+''.join(sheet(f'folio-{n}',f'Interior page {n}') for n in folios)+'</div></section>'

html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Vegetable Guru — progress preview</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#e7e9dc;color:#173e2c;font:16px/1.55 system-ui,sans-serif}}main{{max-width:1180px;margin:auto;padding:36px 24px 70px}}header{{max-width:900px}}.eyebrow{{font-size:12px;letter-spacing:1.8px;font-weight:800}}h1{{font:700 clamp(34px,5vw,56px)/1.06 Georgia,serif;margin:14px 0}}h2{{font:700 28px/1.2 Georgia,serif;margin:0 0 10px}}h3{{font-size:17px;margin:0 0 6px}}p{{margin:10px 0 18px}}a{{color:inherit}}.button{{display:inline-block;padding:13px 20px;margin:4px 0 8px;background:#173e2c;color:#fff8e9;text-decoration:none;border-radius:5px;font-weight:700}}.small{{font-size:13px;color:#4e604e}}.status{{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:25px 0}}.status article,.next{{background:#fff8e9;padding:22px;border-radius:5px}}.status p{{font-size:14px;margin:0}}section{{margin-top:40px}}.spread{{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}}figure{{margin:0;min-width:0}}figure img{{display:block;width:100%;box-shadow:0 3px 12px #173e2c1c}}figcaption{{font-size:12px;margin:8px 0;color:#4e604e}}.single{{max-width:560px;margin:auto}}.next li{{margin:12px 0}}.next ol{{padding-left:23px}}details{{margin-top:30px;padding-top:20px;border-top:1px solid #b5bea9}}summary{{cursor:pointer;font-weight:700}}footer{{margin-top:35px;font-size:13px}}@media(max-width:650px){{main{{padding:25px 12px}}.status{{grid-template-columns:1fr}}.spread{{gap:5px}}}}
</style></head><body><main><header><div class="eyebrow">MORNING REVIEW · 7 OCTOBER 2026</div><h1>The Vegetable Guru</h1><p>Your at-a-glance growing companion</p><p><b>185 × 240 mm paperback · Bookvault · £17.50 working cover price</b></p><p>A rough look at the book so far: selected covers, the latest opening-page illustrations and the complete prepared collection. Use it to judge the overall feel and choose the next stage.</p><a class="button" href="{pdf_link}">Open the full book preview · {receipt['bytes']/1024**2:.1f} MB</a><p class="small">Imperial edition · 148 interior pages, plus front/back covers and two blank inside covers (152 PDF pages). Bookmarks jump to every guide. For facing pages, use two-page view with a separate cover. PDF page numbers are two higher than the printed interior folios.</p></header>
<div class="status"><article><h3>Covers together</h3><p>Selected G2 front and preferred B5 back. These remain concept artwork; exact page snippets, finished copy, barcode and spine come later.</p></article><article><h3>Opening pages together</h3><p>Title, publication and welcome drafts, followed by the approved contents/how-to design. Six new stock illustrations are tried in place; this allocation is for review.</p></article><article><h3>Complete interior</h3><p>44 growing guides and 14 Troubles groups, covering 220 conditions. Existing guide PDFs reused, with their current folios and facing-page arrangement.</p></article></div>
<section class="next"><h2>Suggested next decisions</h2><ol><li><b>Opening pages and illustrations.</b> Review pages 1–7 as a sequence, especially the paired headers and the author-image replacement.</li><li><b>Real words.</b> Agree the welcome, author introduction and back-cover blurb. Supply author/imprint, edition, rights and ISBN details. Lipsum and bracketed placeholders are still visible.</li><li><b>Blanks and inside covers.</b> Four blank interior pages (15, 69, 87 and 91) keep vegetable opening pairs facing. Decide whether to retain them blank or use them for notes. Inside covers are also blank placeholders.</li><li><b>Finish the chosen covers.</b> Develop G2/B5 with editable type and exact torn page crops. B5’s current fragments are generated visual suggestions.</li><li><b>Move towards a physical proof.</b> Confirm paper/stock, check final pagination and costs, resolve the Bookvault spine/template discrepancy, then make the production wrap and check the print files.</li></ol><p class="small">This is a screen preview, not an upload-ready Bookvault file. Artwork is reduced for easy browsing; native interior text stays sharp. No new artwork generation or guide layout run was needed.</p></section>
<section><h2>The covers</h2><p>G2’s cream centre and vegetable grid, paired with B5’s dark green collage. Shown as separate covers; there is no production spine yet.</p><div class="spread">{sheet('front','Front · G2 Cream centre')}{sheet('back','Back · B5 Off-centre collage')}</div></section>
<section><h2>The opening</h2><p>The title page echoes the cover colours and crops. Author and imprint details remain placeholders.</p><div class="single">{sheet('folio-1','Interior page 1 · Title')}</div></section>
{spread('Publication and welcome',[2,3],'Lipsum copy is retained. The welcome uses H3 summer harvest, with S1 beans and blossom beside the author block.')}
{spread('Contents',[4,5],'Approved content and layout, with H1/H2 roots illustrations tried as a related pair. All 58 guide references retain the current folios.')}
{spread('How to use the book',[6,7],'The approved explanations and examples remain. H5 growing starts and H6 gathering the harvest replace the repeated header image.')}
{spread('A growing-guide spread',[40,41],'Kale, from the existing Bookvault interior. The full PDF includes every crop, including the longer three-page guides.')}
{spread('Troubleshooting',[116,117],'The first two pages of Carrot and Parsnip Troubles, from the existing Bookvault interior. All 14 groups are included in the full PDF.')}
<details><summary>See an example of the facing-page blank</summary>{spread('Carrot continuation and blank',[14,15],'The three-page Carrot guide ends on page 14. Blank page 15 allows the next crop to open on the left with its second page opposite.')}</details>
<footer><p>Prepared from the existing project files. Approved sources and previous production-sized PDFs are preserved. <a href="CHECKS.json">Assembly checks</a> · <a href="OPENING-CHECKS.json">Opening-page sources and checks</a> · <a href="../vegetable-guru-entry-pages/REVIEW.html">Approved contents/how-to references</a> · <a href="../../assets/vegetable-guru-stock/REVIEW.html">Illustration stock</a></p></footer></main></body></html>'''
(DOC/'REVIEW.html').write_text(html)
print(json.dumps({'samplePagesRendered':len(samples),'review':str((DOC/'REVIEW.html').relative_to(ROOT))}))
