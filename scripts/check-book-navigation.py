"""Check actual PDF navigation destinations and embedded overlay fonts."""
import json,re,unicodedata,logging
from collections import Counter
from pathlib import Path
from pypdf import PdfReader
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)

ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/whole-book-order-preview'
read=lambda p:json.loads(p.read_text())
checks=read(D/'CHECKS.json');nav=read(D/'NAVIGATION.json')
reader=PdfReader(ROOT/checks['pdf'])
page_ids={p.indirect_reference.idnum:i for i,p in enumerate(reader.pages)}
count=0
for page in nav['pages']:
    if page.get('isIndex'):continue # index annotations have their own check below
    annotations=[a.get_object() for a in reader.pages[page['folio']+1].get('/Annots',[])]
    assert len(annotations)==len(page['links'])
    for annotation,link in zip(annotations,page['links']):
        assert '/A' not in annotation
        assert page_ids[annotation['/Dest'][0].idnum]==link['target']+1
        count+=1
normal=lambda s:re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKC',s).lower()).strip()
mentioned_pages={};body_comparisons=0;edition_mentions=[]
approved=read(D/'references/navigation-approved-2026-10-15/NAVIGATION.json')
targets=lambda decision:[{**{k:l[k] for k in ['source','offset','start','end']},'evidence':[{k:e[k] for k in ['source','offset','folio','term','excerpt']} for e in l['evidence']]} for l in decision['links']]
assert [(d['key'],targets(d)) for d in nav['decisions']]==[(d['key'],targets(d)) for d in approved['decisions']], 'Approved reference destinations changed'
components=read(D/'COMPONENT-CHECKS.json')
topic_changes={e['folio']:e['headingChange'] for c in components['components'] for e in c.get('evidence',[]) if e.get('headingChange',{}).get('copySource','').startswith('scripts/lib/book-review-refinements')}
assert len(topic_changes)==16
with pdfplumber.open(ROOT/checks['pdf']) as actual:
    approval=read(D/'references/navigation-approved-2026-10-15/APPROVAL.json')
    with pdfplumber.open(ROOT/approval['pdf']) as before:
        nonspace=lambda text:Counter(c for c in text if not c.isspace())
        for index,page in enumerate(actual.pages):
            text=page.extract_text(x_tolerance=1,y_tolerance=2) or ''
            if re.search(r'\bimperial\s+edition\b',text,re.I):edition_mentions.append(index-1)
            if not 2<=index<checks['interiorPages']+2:continue
            folio=index-1;box=(0,0,page.width,225*72/25.4)
            a=nonspace(before.pages[index].crop(box).extract_text(x_tolerance=1,y_tolerance=2) or '')
            b=nonspace(page.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or '')
            if folio==2:a.update(nonspace('Imperial edition ·'))
            if folio in topic_changes:
                change=topic_changes[folio]
                for source,replacement in [('sourceHeading','replacementHeading'),('sourceEyebrow','replacementEyebrow')]:
                    a.subtract(nonspace(change[source]));assert all(n>=0 for n in a.values())
                    a.update(nonspace(change[replacement]));a=+a
            assert a==b,('Unrequested body text change against approved baseline',folio,a-b,b-a)
            body_comparisons+=1
    assert edition_mentions==[2],('Edition not confined to publication details',edition_mentions)
    for decision in nav['decisions']:
        for link in decision['links']:
            assert [e['folio'] for e in link['evidence']]==list(range(link['start'],link['end']+1))
            for evidence in link['evidence']:
                folio=evidence['folio']
                if folio not in mentioned_pages:mentioned_pages[folio]=normal((actual.pages[folio+1].extract_text(x_tolerance=1,y_tolerance=2) or '').split('John:')[0])
                assert re.search(r'\b'+re.escape(evidence['term'])+r'\b',mentioned_pages[folio]),('Crop not named on destination page',decision['key'],folio)
mapping=read(D/'PAGE-MAP.json');index_count=0
for page in mapping:
    if page['kind']!='index':continue
    for annotation in reader.pages[page['pdfPage']-1].get('/Annots',[]):
        assert 2<=page_ids[annotation.get_object()['/Dest'][0].idnum]<checks['interiorPages']+2
        index_count+=1
assert count==checks['navigation']['internalLinks'] and index_count==checks['internalIndexLinks']
fonts={}
overlay=PdfReader(ROOT/'tmp/pdfs/whole-book-order-preview/footers.pdf')
for page in overlay.pages:
    for ref in page['/Resources']['/Font'].values():
        font=ref.get_object()
        if font.get('/Subtype')=='/Type3':
            name=str(font['/FontDescriptor']['/FontName'])
            fonts[name]={'type':'Type3','embedded':bool(font.get('/CharProcs'))}
        else:
            desc=(font.get('/DescendantFonts') or [font])[0].get_object()['/FontDescriptor']
            fonts[str(font['/BaseFont'])]={'type':str(font.get('/Subtype')),'embedded':any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3'])}
assert fonts and all(f['embedded'] for f in fonts.values())
receipt={'date':'2026-10-15','status':'passed','pdfSha256':checks['sha256'],
         'reopenedNavigationLinks':count,'reopenedIndexLinks':index_count,
         'actualDestinationPagesMentionChecked':len(mentioned_pages),'cropsWithoutLinks':[d['key'] for d in nav['decisions'] if not d['links']],
         'pdfPages':len(reader.pages),'overlayFonts':fonts,
         'approvedBaselineBodyPagesCompared':body_comparisons,'descriptiveTopicHeadings':sorted(topic_changes),
         'editionMentionFolios':edition_mentions,'approvedReferenceDestinationsUnchanged':True,
         'minimumBodyToFooterMm':min(p['bodyToFooterMm'] for p in checks['navigation']['pageChecks'])}
(D/'NAVIGATION-PDF-CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n')
sequence=read(D/'SEQUENCE-CHECKS.json')
assert sequence['firstLeaves']==[{key:page[key] for key in previous} for previous,page in zip(sequence['firstLeaves'],mapping[:11])]
sequence.update({'pdfSha256':checks['sha256'],'navigationPass':'Page order unchanged; first leaves match preceding sequence receipt.'})
(D/'SEQUENCE-CHECKS.json').write_text(json.dumps(sequence,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt))
