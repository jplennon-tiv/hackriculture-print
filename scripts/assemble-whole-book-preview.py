"""Assemble the current requested section order without re-exporting any crop guide.

Saved screen body pages retain their native text and artwork. Only their old
footer text objects are removed, then replaced with measured current folios.
"""
from pathlib import Path
import hashlib, json, re, gc, logging
from collections import Counter
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from pypdf.generic import ContentStream, NameObject, RectangleObject
from pypdf.annotations import Link
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)

ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/publication/whole-book-order-preview'
OUT=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
MM=72/25.4;W=185*MM;H=240*MM
j=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
components=j('docs/publication/whole-book-order-preview/COMPONENT-CHECKS.json')
plan=j('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json');edition=plan['editions']['imperial']
toc=j('docs/publication/contents-update/CHECKS.json');toc_result=next(x for x in toc['results'] if x['units']=='imperial')
idx=j('docs/publication/whole-book-order-preview/index/CHECKS.json')
resolved=j('docs/publication/whole-book-order-preview/index/RESOLVED.json')
old=j('docs/publication/bookvault-progress-preview/CHECKS.json')
assert sha(old['pdf'])==old['sha256']
assert sha(plan['basePlan']['path'])==plan['basePlan']['sha256']
total=edition['plannedEvenTotal']; index_start=edition['index']['startPage']; index_end=edition['index']['endPage']
assert len(edition['documents'])==58 and total==176 and idx['pages']==4
assert not resolved['temporaryTopicReferences']
def verify():
    for group in [components['copyInputs'],components['inputs'],components['assets']]:
        for p,h in group.items():assert sha(p)==h,p
    for item in components['protectedFiles']:assert sha(item['path'])==item['sha256'],item['path']
    for item in components['components']+[components['footers'],toc_result]:assert sha(item['pdf'])==item['sha256'],item['pdf']
    assert sha(idx['pdf']['path'])==idx['pdf']['sha256']
verify()

def mult(a,b):
    return [a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3],a[4]*b[0]+a[5]*b[2]+b[4],a[4]*b[1]+a[5]*b[3]+b[5]]

def remove_footer(obj,pdf,cm=None):
    """Remove complete BT/ET objects whose baselines lie wholly in the footer.

    Follow nested form matrices rather than guessing text encodings or covering
    the old numbers. Body text and graphics operations remain unchanged.
    """
    cm=list(cm or [1,0,0,1,0,0]);stack=[];tm=[1,0,0,1,0,0]
    cs=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
    output=[];block=None;ys=[];removed=0;res=obj.get('/Resources',{})
    for args,op in cs.operations:
        if op==b'BT':block=[];ys=[];tm=[1,0,0,1,0,0]
        (block if block is not None else output).append((args,op))
        if op==b'q':stack.append(cm[:])
        elif op==b'Q':cm=stack.pop()
        elif op==b'cm':cm=mult(list(map(float,args)),cm)
        elif op==b'Tm':tm=list(map(float,args))
        elif op in [b'Td',b'TD']:tm=mult([1,0,0,1,float(args[0]),float(args[1])],tm)
        elif op in [b'Tj',b'TJ']:
            assert block is not None
            ys.append(mult(tm,cm)[5])
        elif op==b'ET':
            if ys and min(ys)>8.5*MM and max(ys)<9.5*MM:
                removed+=1
            else:
                output.extend(block)
            block=None
        elif op==b'Do':
            form=res['/XObject'][args[0]].get_object()
            if form.get('/Subtype')=='/Form':removed+=remove_footer(form,pdf,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
    assert block is None and not stack
    if removed:
        cs.operations=output
        if isinstance(obj,PageObject):obj.replace_contents(cs)
        else:obj.set_data(cs.get_data())
    return removed

def trim(page):
    b=page.trimbox
    result=PageObject.create_blank_page(width=W,height=H)
    result.merge_transformed_page(page,Transformation().translate(-float(b.left),-float(b.bottom)))
    return result

saved=PdfReader(ROOT/old['pdf']);writer=PdfWriter();records=[];readers=[];body_comparisons=[]
def add(page,folio,label,kind,source,source_page):
    p=writer.add_page(page)
    for box in ['mediabox','cropbox','trimbox']:setattr(p,box,RectangleObject([0,0,W,H]))
    records.append({'pdfPage':len(records)+1,'folio':folio,'label':label,'kind':kind,'source':source,'sourcePage':source_page})
    return p
add(saved.pages[0],None,'Front cover — G2','cover',old['pdf'],1)
add(PageObject.create_blank_page(width=W,height=H),None,'Inside front cover','blank',None,None)
component_pages={}
for c in components['components']:
    r=PdfReader(ROOT/c['pdf']);readers.append(r);assert len(r.pages)==len(c['folios'])
    for i,f in enumerate(c['folios']):component_pages[f]=(r.pages[i],c,i)
toc_pdf=PdfReader(ROOT/toc_result['pdf']);index_pdf=PdfReader(ROOT/idx['pdf']['path']);footer_pdf=PdfReader(ROOT/components['footers']['pdf'])
footers={d['folio']:footer_pdf.pages[i] for i,d in enumerate(components['footers']['pages'])}
guides={};blanks={d['page'] for d in edition['extraBlanks']}
blank_labels={d['page']:'Blank — '+d['reason'].lower() for d in edition['extraBlanks']}
section_labels={d['startPage']:d['label'] for d in edition['sectionOpeners']}
for d in edition['documents']:
    assert sha(d['pdf'])==d['sha256']
    for i in range(d['physicalPages']):guides[d['startPage']+i]=(d,i)
    blanks.update(d['blankFoliosAfter'])
labels={x['source']:x['label'] for x in toc_result['references'] if 'source' in x}
topic_by_folio={x['startPage']:x for x in edition['additions']}
removed_counts=[]
for folio in range(1,total+1):
    if folio in guides:
        d,offset=guides[folio];old_folio=d['sourceStartPage']+offset
        p=add(saved.pages[old_folio+1],folio,d['label']+(' — continued' if offset else ''),d['type'],d['pdf'],offset+1)
        removed=remove_footer(p,writer);assert removed==2,(folio,removed)
        removed_counts.append(removed);p.merge_page(footers[folio]);body_comparisons.append((folio,old_folio))
    elif folio in blanks:add(PageObject.create_blank_page(width=W,height=H),folio,blank_labels.get(folio,'Blank — preserves facing crop pages'),'blank',None,None)
    elif folio in component_pages:
        p,c,i=component_pages[folio]
        label=labels.get(topic_by_folio.get(folio,{}).get('source'),{1:'Title',2:'Publication details',3:'Welcome and author',10:'How to use — calendar',11:'How to use — difficulty and needs',**section_labels}.get(folio,c['id']))
        add(trim(p),folio,label,c['id'],c['pdf'],i+1)
    elif 4<=folio<=6:add(trim(toc_pdf.pages[folio-4]),folio,'Contents'+(' — continued' if folio>4 else ''),'contents',toc_result['pdf'],folio-3)
    elif index_start<=folio<=index_end:
        p=trim(index_pdf.pages[folio-index_start]);p.pop('/Annots',None)
        add(p,folio,'Index'+(' — continued' if folio>index_start else ''),'index',idx['pdf']['path'],folio-index_start+1)
    else:raise AssertionError(('Missing planned folio',folio))
    if folio%25==0:print(f'Assembled folio {folio}/{total}',flush=True)
add(PageObject.create_blank_page(width=W,height=H),None,'Inside back cover','blank',None,None)
add(saved.pages[-1],None,'Back cover — B5','cover',old['pdf'],len(saved.pages))
assert len(writer.pages)==total+4

# All numeric index links and see references jump inside this assembled PDF.
entry_folios={entry:index_start+i for i,p in enumerate(idx['dom']) for entry in p['entryIds']}
index_links=0
for i,page in enumerate(index_pdf.pages):
    for ref in page.get('/Annots',[]):
        a=ref.get_object();target=None
        if '/A' in a:
            uri=a['/A'].get('/URI','');m=re.search(r'#page=(\d+)$',uri)
            if m:target=int(m[1])-1
        elif '/Dest' in a:
            dest=str(a['/Dest']);key=dest.removeprefix('/entry-')
            if key in entry_folios:target=entry_folios[key]+1
        assert target is not None and 2<=target<total+2,dict(a)
        writer.add_annotation(index_start+1+i,Link(rect=tuple(a['/Rect']),target_page_index=target));index_links+=1

writer.add_outline_item('Front cover — G2',0)
openings=writer.add_outline_item('Opening pages',2)
for folio in [1,2,3,4,7]:writer.add_outline_item(records[folio+1]['label'],folio+1,parent=openings)
parents={}
for d in edition['documents']:
    kind=d['type'];label='Growing guides' if kind=='vegetable' else 'Troubleshooting guides'
    if kind not in parents:
        opener=next(x for x in edition['sectionOpeners'] if x['source']==('opening:varieties' if kind=='vegetable' else 'opening:troubles'))
        parents[kind]=writer.add_outline_item(opener['label'],opener['startPage']+1)
        if kind=='vegetable':writer.add_outline_item('How to use this book',11,parent=parents[kind])
    writer.add_outline_item(d['label'],d['startPage']+1,parent=parents[kind])
tech=writer.add_outline_item('Growing Techniques',next(x['startPage'] for x in edition['sectionOpeners'] if x['source']=='opening:techniques')+1)
for d in sorted(edition['additions'],key=lambda x:x['startPage']):
    if d['source']=='technique:why-grow':continue
    writer.add_outline_item(labels[d['source']],d['startPage']+1,parent=tech)
writer.add_outline_item('Index',index_start+1);writer.add_outline_item('Back cover — B5',total+3)
writer.set_page_label(0,0,prefix='Front cover');writer.set_page_label(1,1,prefix='Inside front cover')
writer.set_page_label(2,total+1,style='/D',start=1);writer.set_page_label(total+2,total+2,prefix='Inside back cover');writer.set_page_label(total+3,total+3,prefix='Back cover')
writer.page_layout='/TwoPageRight';writer.page_mode='/UseOutlines'
writer.add_metadata({'/Title':'The Vegetable Guru — Whole-book order preview','/Author':'John Lennon','/Subject':f'Imperial review: {total} interior pages plus four cover leaves. New section openers for review; not a print upload.'})
OUT.parent.mkdir(parents=True,exist_ok=True);writer.write(OUT);del writer;gc.collect()

# Verify visible body text as text at its actual page coordinates, including all
# 137 reused guide pages. Only the removed footer lies outside this region.
normal=lambda s:re.sub(r'\s+','',s)
body_checked=0;footer_checked=0;component_blocks=0;topic_text_checks=0
with pdfplumber.open(OUT) as final,pdfplumber.open(ROOT/old['pdf']) as original:
    assert len(final.pages)==total+4
    for folio,old_folio in body_comparisons:
        a=original.pages[old_folio+1].crop((0,0,W,228*MM)).extract_text() or ''
        b=final.pages[folio+1].crop((0,0,W,228*MM)).extract_text() or ''
        assert a==b,('Body text differs',folio);body_checked+=1
    for item in records:
        if item['folio'] is None:continue
        p=final.pages[item['pdfPage']-1]
        if item['kind']=='blank':assert not p.chars;continue
        if item['folio']==1:continue
        text=p.crop((0,225*MM,W,H)).extract_text() or ''
        assert normal('IMPERIAL · '+str(item['folio'])) in normal(text),(item['folio'],text)
        footer_checked+=1
    for c in components['components']:
        for d in c['dom']:
            p=final.pages[d['folio']+1]
            for b in d['blocks']:
                box=(max(0,(b['left']-.4)*MM),max(0,(b['top']-.4)*MM),min(W,(b['right']+.4)*MM),min(H,(b['bottom']+.4)*MM))
                actual=p.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
                # Inline step numbers may be painted after the heading despite
                # preceding it in DOM reading order. Require all characters in
                # the same measured block, plus whole-page approval comparison.
                assert not Counter(normal(b['text']))-Counter(normal(actual)),(d['folio'],b['text'],actual)
                component_blocks+=1
    for d in edition['additions']:
        with pdfplumber.open(ROOT/d['pdf']) as source:
            a=Counter(c['text'] for c in source.pages[d['sourcePage']-1].chars if c['top']<225*MM and c['text'].strip())
        b=Counter(c['text'] for c in final.pages[d['startPage']+1].chars if c['top']<225*MM and c['text'].strip())
        assert a==b,('Approved topic characters differ',d['source'],a-b,b-a);topic_text_checks+=1
    for i,d in enumerate(idx['dom']):
        p=final.pages[index_start+1+i]
        for b in d['blocks']:
            box=(max(0,(b['left']-.4)*MM),max(0,(b['top']-.4)*MM),min(W,(b['right']+.4)*MM),min(H,(b['bottom']+.4)*MM))
            actual=p.crop(box).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert normal(b['text']) in normal(actual),(index_start+i,b['text'],actual)
    for i,d in enumerate(toc_result['dom']):
        text=normal(final.pages[5+i].extract_text() or '')
        for b in d['blocks']:assert normal(b['text']) in text,('Contents text',b['text'])
result=PdfReader(OUT)
for p in result.pages:assert abs(float(p.mediabox.width)-W)<.01 and abs(float(p.mediabox.height)-H)<.01
# Independently match every index location to its assembled source page.
registry={d['type']+':'+d['key']:d['startPage'] for d in edition['documents']}
registry.update({d['source']:d['startPage'] for d in edition['additions']})
numeric_refs=0
for e in resolved['editions']['imperial']:
    for r in e['references']:
        assert not r['prefix']
        expected=registry[r['source']]+(r['page']-1 if r['source'].startswith(('vegetable:','trouble:')) else 0)
        assert r['folio']==expected and records[expected+1]['folio']==expected
        numeric_refs+=1
verify();assert sha(old['pdf'])==old['sha256']
receipt={'date':'2026-10-14','status':'Assembled and text-checked; representative visual review pending','pdf':str(OUT.relative_to(ROOT)),'sha256':sha(OUT),'bytes':OUT.stat().st_size,'units':'imperial','interiorPages':total,'pdfPages':total+4,'trimMm':[185,240],'folioMapping':'PDF page = interior folio + 2','guidePagesReused':body_checked,'guidesReexported':0,'sourceScreenBook':{'path':old['pdf'],'sha256':old['sha256']},'componentBlocksVerified':component_blocks,'approvedTopicTextChecks':topic_text_checks,'updatedFootersVerified':footer_checked,'oldFooterTextObjectsRemoved':sum(removed_counts),'contentsReferences':len(toc_result['references']),'indexEntries':273,'indexNumericReferencesVerified':numeric_refs,'internalIndexLinks':index_links,'blankFolios':sorted(blanks),'sourceFilesUnchanged':True,'limits':['John-requested section order applied; opener designs, contents and final pagination remain for review.','Opening copy placeholders and proposed illustration allocations remain.','Saved guide artwork is the earlier screen derivative; not print-resolution production files.','No new artwork, guide export, canonical data changes, supplier submission or price/spine update.']}
(DOC/'CHECKS.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
(DOC/'PAGE-MAP.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['pdfPages','interiorPages','bytes','guidePagesReused','updatedFootersVerified','indexNumericReferencesVerified','internalIndexLinks']}))
