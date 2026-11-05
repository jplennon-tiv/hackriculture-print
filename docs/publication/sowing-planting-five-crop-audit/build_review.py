"""Build only the standalone text review. No application or master-data writes."""
from pathlib import Path
import html
import json
import re

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[2]
RESEARCH = PROJECT.parent / 'hackriculture-resources/summaries/sowing-planting-five-crop-audit'
data = json.loads((RESEARCH / 'drafts.json').read_text())
esc = html.escape

def count(blocks):
    return sum(len(re.findall(r'\S+', b['text'])) for b in blocks)

def paragraphs(blocks):
    return ''.join(f'<p>{"<strong>" + esc(b["heading"]) + ".</strong> " if b["heading"] else ""}{esc(b["text"])}</p>' for b in blocks)

def bullets(items):
    return '<ul>' + ''.join(f'<li>{esc(x)}</li>' for x in items) + '</ul>'

style = '''
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;color:#242424;background:#fff;font:17px/1.6 system-ui,-apple-system,sans-serif}main{max-width:1200px;margin:auto;padding:32px 28px 70px}h1{font-size:32px;line-height:1.2}h2{font-size:26px}h3{font-size:18px;margin:0 0 14px}a{color:#245d46;text-underline-offset:3px}nav{display:flex;gap:10px 24px;flex-wrap:wrap;padding:14px 0;border-block:1px solid #ccc}p{margin:0 0 16px}.status{font-size:14px;font-weight:650;color:#785318}.intro{max-width:900px}.crop{padding:25px 0 40px;border-bottom:2px solid #ccc;scroll-margin-top:12px}.compare{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin:22px 0}.before,.after{border-top:3px solid #aaa;padding-top:14px;min-width:0}.after{border-color:#285940}.before{color:#555}.count{font-size:14px;font-weight:400;color:#666;display:block}.note{padding:16px 20px;border-left:3px solid #ae7b30;background:#faf8f3;margin:22px 0}.note h3{margin-bottom:8px}li{margin-bottom:8px}.tablewrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:15px;margin:15px 0 25px}th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid #ddd}th{background:#f6f6f6}td:first-child{min-width:115px;font-weight:600}.sources{font-size:14px;color:#666}details{margin:20px 0}summary{cursor:pointer;font-weight:650}.footer{padding-top:30px;font-size:14px}@media(max-width:760px){main{padding:22px 18px}.compare{grid-template-columns:1fr;gap:22px}h1{font-size:27px}body{font-size:16px}}@media print{nav{display:none}main{padding:0}.crop{break-before:page}.compare{display:block}.before,.after{margin:20px 0}details{display:block}summary{display:none}a{color:inherit}}
'''
parts = [f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(data["title"])}</title><style>{style}</style></head><body><main>',
         f'<p class="status">{esc(data["date"])} · {esc(data["status"])}</p><h1>{esc(data["title"])}</h1><p class="intro">{esc(data["brief"])}</p>',
         '<p class="intro">The proposed clump methods aim for medium-sized crops with more room, as requested. New spacings are flagged below. “Before” reproduces the planting block in the current book, with line wraps joined and adjacent captions put in reading order. Quick Facts comparisons cover the relevant entries, not the whole panel.</p>',
         f'<p class="sources">{esc(data["units"])} <a href="../../../../hackriculture-resources/summaries/sowing-planting-five-crop-audit/DRAFTS.txt">Plain-text copy</a> · <a href="../../../../hackriculture-resources/summaries/sowing-planting-five-crop-audit/SOURCES.md">Audit and sources</a></p>',
         '<nav aria-label="Crop navigation">' + ''.join(f'<a href="#{esc(c["key"])}">{esc(c["name"])}</a>' for c in data['crops']) + '</nav>',
         '<p class="sources" style="margin-top:14px">Word counts compare body copy, including existing captions and measurement text but excluding headings and Quick Facts. The proposed text replaces those captions. Counts show content growth; they are not page-fit checks.</p>']
plain = [data['title'], data['date'] + ' — ' + data['status'], data['brief'], data['units'], '']
counts = []
for c in data['crops']:
    old, new = count(c['before']), count(c['after'])
    counts.append({'key':c['key'],'before_words':old,'after_words':new,'difference':new-old})
    parts += [f'<section class="crop" id="{esc(c["key"])}"><h2>{esc(c["name"])} <span class="count">Current book pages {esc(c["folios"])}</span></h2><p>{esc(c["finding"])}</p>',
              f'<div class="compare"><div class="before"><h3>Before <span class="count">{old} words · current planting block</span></h3>{paragraphs(c["before"])}</div>',
              f'<div class="after"><h3>After — proposed <span class="count">{new} words · {new-old:+d}</span></h3>{paragraphs(c["after"])}</div></div>',
              '<h3>Quick Facts and timing proposals</h3><div class="tablewrap"><table><thead><tr><th>Item</th><th>Before</th><th>Proposed</th><th>Meaning / qualification</th></tr></thead><tbody>']
    for f in c['facts']:
        parts.append('<tr>' + ''.join(f'<td>{esc(f[k])}</td>' for k in ['item','before','after','reason']) + '</tr>')
    parts += ['</tbody></table></div>', '<h3>What changes, and what moves</h3>' + bullets(c['changes']),
              '<aside class="note"><h3>For review</h3>' + bullets(c['review_points']) + '</aside>',
              '<p class="sources">Source key: ' + esc('; '.join(c['source_ids'])) + '. See the linked audit for exact fields and links.</p></section>']
    plain += [c['name'].upper() + ' — current pages ' + c['folios'], c['finding'], '', f'BEFORE ({old} words)']
    for b in c['before']: plain += [(b['heading'] + '. ' if b['heading'] else '') + b['text'], '']
    plain += [f'AFTER — PROPOSED ({new} words)']
    for b in c['after']: plain += [(b['heading'] + '. ' if b['heading'] else '') + b['text'], '']
    plain += ['QUICK FACTS / TIMINGS']
    for f in c['facts']: plain += [f'{f["item"]}: {f["before"]} → {f["after"]}', f['reason'], '']
    plain += ['CHANGES'] + ['- ' + t for t in c['changes']] + ['', 'FOR REVIEW'] + ['- ' + t for t in c['review_points']] + ['', 'Source key: ' + '; '.join(c['source_ids']), '\n' + '=' * 65 + '\n']
parts += ['<footer class="footer">Book PDF, master records, approved print companions and runtime layouts remain unchanged. These drafts have not been fitted to pages, illustrated, approved or integrated.</footer></main></body></html>']
(HERE / 'REVIEW.html').write_text('\n'.join(parts))
(RESEARCH / 'DRAFTS.txt').write_text('\n'.join(plain) + '\n')
(HERE / 'WORD-COUNTS.json').write_text(json.dumps(counts,indent=2) + '\n')
print(json.dumps(counts,indent=2))
