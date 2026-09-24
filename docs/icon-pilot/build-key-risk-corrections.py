"""Build review from verified live assignments; never changes canonical data."""
import json,hashlib,html,pathlib
root=pathlib.Path(__file__).resolve().parents[2];out=root/'docs/icon-pilot';e=html.escape
before=json.loads((out/'KEY-RISK-ASSIGNMENTS-INVENTORY.json').read_text());after=json.loads((out/'KEY-RISK-CORRECTED-INVENTORY.json').read_text());old={x['key']:x for x in before['crops']};prompts=json.loads((out/'KEY-RISK-CORRECTION-PROMPTS.json').read_text())
icons=[]
for p in prompts:
 path=root/('public'+p['png']);assert path.exists(),path
 provenance=json.loads((out/'assignment-generation'/f"{p['key']}.json").read_text())
 icons.append({**p,'status':'installed; visual review pending','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source':provenance['source']})
(out/'KEY-RISK-CORRECTIONS-MANIFEST.json').write_text(json.dumps({'status':'user-authorised corrections installed; new artwork awaits visual approval','icons':icons},indent=2)+'\n')
changed=[]
for c in after['crops']:
 prior=old[c['key']]
 if [(r['label'],r['text'],r['icon']) for r in prior['risks']]!=[(r['label'],r['text'],r['icon']) for r in c['risks']]:changed.append(c)
proofs=json.loads((out/'KEY-RISK-CORRECTION-PROOFS.json').read_text()) if (out/'KEY-RISK-CORRECTION-PROOFS.json').exists() else {'results':[]}
def strip(c):
 return '<div class="strip">'+''.join(f'<div class="risk"><img src="../../public{e(r["icon"])}"><b>{e(r["label"])}</b><p>{e(r["text"])}</p></div>' for r in c['risks'])+'</div>'
cards=''
for c in changed:
 links=' · '.join(f'<a href="../../{e(r["file"])}">{r["units"]} PDF</a>' for r in proofs['results'] if r['crop']==c['key'])
 cards+=f'<article id="{c["key"]}"><h2>{e(c["name"])}</h2><small>BEFORE</small>{strip(old[c["key"]])}<small>CORRECTED · CURRENT 32px SIZE</small>{strip(c)}<p>{links}</p></article>'
art=''.join(f'<div class="art"><img src="../../public{i["png"]}"><b>{e(i["key"].replace("_"," "))}</b><img class="small" src="../../public{i["png"]}"></div>' for i in icons)
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key Risks — corrected assignments</title><style>
*{box-sizing:border-box}body{font:16px/1.45 system-ui;background:#f2f4ef;color:#29382e;margin:0 auto;padding:30px;max-width:1200px}h1{margin:0}h2{font-size:23px}a{color:#236b49}article{background:#fffefa;padding:22px;border:1px solid #d2d9ce;border-radius:12px;margin:20px 0}small{letter-spacing:.1em;color:#697363}.strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #b7c9b6;background:#f7faf5;border-radius:8px;margin:7px 0 22px;padding:12px 0}.risk{padding:8px 12px;text-align:center;border-right:1px solid #dce3d9}.risk:last-child{border:0}.risk img{display:block;width:32px;height:32px;object-fit:contain;margin:0 auto 8px;filter:url(#ink)}b{display:block;font-size:13px}.risk p{font-size:12px;margin:4px 0;line-height:1.25}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.art{background:white;border:1px solid #d2d9ce;padding:15px;text-align:center}.art img{width:140px;height:140px;object-fit:contain;filter:url(#ink)}.art .small{display:block;width:32px;height:32px;margin:12px auto}nav{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.note{background:#e4eddf;padding:16px;border-radius:8px}@media(max-width:600px){body{padding:12px}article{padding:12px}.strip{grid-template-columns:repeat(2,minmax(0,1fr))}.risk{padding:10px 6px}}
</style><svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><filter id="ink" color-interpolation-filters="sRGB"><feFlood flood-color="#30352f"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs></svg>'''
page+=f'<h1>Key Risks — corrected assignments</h1><p>Duplicate conditions resolved first, followed by crop-specific assignments and {len(icons)} additional naturalistic drawings.</p><div class="note">All 44 vegetable strips checked. {len(changed)} crops have corrected selections, wording or artwork. New drawings and changed proofs are ready for your review. The original approved art, coloured icons and page sizing are preserved.</div><p>Parsnip core advice now describes carrot-fly tunnels accurately and has its own splitting advice. Full source entries remain; duplicate display aliases are collapsed. Previously misleading, unused fallback mappings are now explicitly unassigned pending a future crop-specific drawing.</p><nav><a href="#artwork">New artwork</a><a href="KEY-RISK-ASSIGNMENTS-AUDIT.html">Original audit</a><a href="KEY-RISK-CORE-RECEIPT.json">Core-data receipt</a><a href="KEY-RISK-CORRECTION-PROOFS.json">Proof checks</a></nav>'
page+='<nav>'+''.join(f'<a href="#{c["key"]}">{e(c["name"])}</a>' for c in changed)+'</nav>'+cards+'<h2 id="artwork">New artwork, enlarged and at print size</h2><p>Transparent monochrome assets shown through the production ink filter. One core subject per drawing; labels and prose supply the diagnosis.</p><div class="gallery">'+art+'</div></html>'
(out/'KEY-RISK-CORRECTIONS.html').write_text(page)
print(json.dumps({'changed_crops':len(changed),'new_drawings':len(icons),'proofs':len(proofs['results'])}))
