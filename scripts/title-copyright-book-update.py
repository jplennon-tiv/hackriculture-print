"""Bounded native-PDF update: approved title C, remove old interior pages 2/3.

The frozen prior book is authoritative; no source guide or artwork is regenerated.
"""
from pathlib import Path
from collections import defaultdict, Counter
from io import BytesIO
import copy, hashlib, json, os, re, sys, logging
from pypdf import PdfReader, PdfWriter, PageObject
from pypdf.generic import ContentStream, NameObject, NumberObject, FloatObject, DictionaryObject, ArrayObject, ByteStringObject, DecodedStreamObject
from pypdf._cmap import get_encoding
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ENCODINGS={}
CODECS={}

R=Path(__file__).resolve().parents[1]
B=R/'docs/publication/whole-book-order-preview'
D=B/'title-copyright-integration-2026-11-22'
MM=72/25.4; W=185*MM; H=240*MM
def sha(p):
    with Path(p).open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def save(p,value):
    p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def read(p):return json.loads(p.read_text())
def raw(v):return v.original_bytes if isinstance(v,str) else bytes(v)
def decode(v,font):
    key=id(font)
    if key not in ENCODINGS:ENCODINGS[key]=get_encoding(font)
    enc,mp=ENCODINGS[key];b=raw(v)
    s=b.decode(enc) if isinstance(enc,str) else ''.join(enc.get(c,chr(c)) for c in b)
    return ''.join(mp.get(c,c) for c in s)
def get_stream(obj,pdf):
    return obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
def put_stream(obj,s):
    if isinstance(obj,PageObject):obj.replace_contents(s)
    else:obj.set_data(s.get_data())
def walk(obj,path=()):
    yield obj,path
    for k,v in obj.get('/Resources',{}).get('/XObject',{}).items():
        f=v.get_object()
        if hasattr(f,'get') and f.get('/Subtype')=='/Form':yield from walk(f,path+(str(k),))
def blocks(obj,pdf):
    s=get_stream(obj,pdf)
    if s is None:return s,[]
    fs=obj.get('/Resources',{}).get('/Font',{});result=[];active=None;start=None;parts=[]
    for i,(a,op) in enumerate(s.operations):
        if op==b'BT':start=i;parts=[]
        elif op==b'Tf':active=str(a[0])
        elif op in [b'Tj',b'TJ'] and start is not None:
            vals=[a[0]] if op==b'Tj' else [v for v in a[0] if isinstance(v,(str,bytes))]
            assert active in fs
            parts.append((i,active,''.join(decode(v,fs[active].get_object()) for v in vals)))
        elif op==b'ET' and start is not None:
            result.append({'start':start,'end':i,'text':''.join(p[2] for p in parts),'fonts':sorted(set(p[1] for p in parts)),'parts':parts});start=None
    return s,result
def prepare():
    D.mkdir(exist_ok=True)
    assert not (D/'SOURCE.json').exists(),'Preparation is already consumed; use the frozen baseline.'
    prior=read(B/'integration-2026-11-22/INTEGRATION-CHECKS.json')
    current=R/prior['pdf'];browsing=R/prior['readingCopy']
    assert sha(current)==prior['sha256'] and sha(browsing)==prior['readingCopySHA256']
    os.link(current,D/'before-book.pdf');os.link(browsing,D/'before-reading-copy.pdf')
    for name in ['CHECKS.json','PAGE-MAP.json','COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json','VISUAL-REVIEW.json','REVIEW.html','README.md']:
        (D/('before-'+name)).write_bytes((B/name).read_bytes())
    approval=read(R/'docs/publication/title-copyright-trials/APPROVAL.json')
    assert approval['option']=='C'
    source={'date':'2026-11-22','authorisation':'Thanks. And please remove the two following pages as discussed.','baseline':{'native':'before-book.pdf','sha256':prior['sha256'],'reading':'before-reading-copy.pdf','readingSHA256':prior['readingCopySHA256']},'title':approval['proof'],'removedInteriorFolios':[2,3],'previousInteriorPages':176,'interiorPages':174,'pdfPages':178,'nativeOutput':prior['pdf'],'readingOutput':prior['readingCopy'],'scope':'Install approved combined title C; remove publication/blank pages; update numeric references, links, labels and bookmarks. No cover installation, art changes, guide rewrites or supplier work.'}
    save(D/'SOURCE.json',source)
    print('Frozen exact prior native and browsing books; approved title C bound.',flush=True)

def plan():
    source=read(D/'SOURCE.json');assert sha(D/'before-reading-copy.pdf')==source['baseline']['readingSHA256']
    original=PdfReader(D/'before-reading-copy.pdf');writer=PdfWriter(clone_from=original)
    tagged={};seen={};next_id=1000000
    for pi,page in enumerate(writer.pages):
        if pi in [0,1,2,3,4,178,179]:continue
        for obj,path in walk(page):
            oid=obj.indirect_reference.idnum if obj.indirect_reference else id(obj)
            if oid in seen:continue
            s,bs=blocks(obj,writer);seen[oid]=True
            if s is None:continue
            ops=[];by_start={b['start']:b for b in bs};by_end={b['end']:b for b in bs}
            for i,op in enumerate(s.operations):
                if i in by_start:
                    block=by_start[i];mcid=next_id;next_id+=1
                    tagged[mcid]={'page':pi,'path':list(path),'block':bs.index(block),'text':block['text'],'fonts':block['fonts']}
                    ops.append(([NameObject('/Span'),DictionaryObject({NameObject('/MCID'):NumberObject(mcid)})],b'BDC'))
                ops.append(op)
                if i in by_end:ops.append(([],b'EMC'))
            s.operations=ops;put_stream(obj,s)
    marked=D/'tagged-reading.pdf';writer.write(marked)
    save(D/'TEXT-BLOCKS.json',tagged)
    print('Mapped native text blocks for precise reference identification.',flush=True)
    ids={p.indirect_reference.idnum:i for i,p in enumerate(original.pages)}
    links={};all_links=[]
    for pi,p in enumerate(original.pages):
        links[pi]=[]
        for ref in p.get('/Annots',[]):
            a=ref.get_object();rec={'page':pi,'rect':[float(x) for x in a['/Rect']]}
            if '/Dest' in a:rec['target']=ids[a['/Dest'][0].idnum]
            elif '/A' in a and a['/A']['/S']=='/URI':rec['uri']=str(a['/A']['/URI'])
            else:raise AssertionError('Unexpected existing link')
            all_links.append(rec)
            if 'target' in rec:links[pi].append(rec)
    edits=[];footers=[];unlinked_refs=[];unchanged_numeric=[]
    with pdfplumber.open(marked) as doc:
        for pi,page in enumerate(doc.pages):
            if pi in [0,1,2,3,4,178,179]:continue
            folio=pi-1;groups=defaultdict(list)
            for c in page.chars:
                if c.get('mcid') in tagged:groups[c['mcid']].append(c)
            for mcid,chars in groups.items():
                b=tagged[mcid];txt=''.join(c['text'] for c in chars)
                if not re.search(r'\d',txt):continue
                assert txt==b['text'],('Glyph/native text mismatch',pi,txt[:120],b['text'][:120])
                offsets=[]
                for c in chars:offsets.extend([c]*len(c['text']))
                footer=txt.strip()==str(folio) and min(c['top'] for c in chars)>H-40 and min(c['x0'] for c in chars)>W/2
                if footer:footers.append({'page':pi,'folio':folio})
                matches=[]
                for m in re.finditer(r'\d+',txt):
                    cs=offsets[m.start():m.end()]
                    def in_link(link):
                        x0,y0,x1,y1=link['rect']
                        return all(x0-1 <= (c['x0']+c['x1'])/2 <= x1+1 and y0-1 <= (c['y0']+c['y1'])/2 <= y1+1 for c in cs)
                    matching=[l for l in links[pi] if in_link(l)]
                    # Page-reference wording is a secondary check for body references
                    # that came from newer standalone proofs without PDF annotations.
                    explicit=any(r.start()<=m.start()<r.end() for r in re.finditer(r'\bpages?\s+\d+(?:[–−-]\d+)?(?:,\s*\d+(?:[–−-]\d+)?)*',txt,re.I))
                    if footer or matching or explicit:
                        old=int(m.group());assert 4<=old<=176,(pi,txt,old)
                        matches.append({'start':m.start(),'end':m.end(),'old':m.group(),'new':str(old-2),'bbox':[min(c['x0'] for c in cs),min(c['top'] for c in cs),max(c['x1'] for c in cs),max(c['bottom'] for c in cs)],'links':[l['target'] for l in matching]})
                        if explicit and not matching:unlinked_refs.append({'folio':folio,'text':txt,'number':old})
                if not matches:continue
                assert len(b['fonts'])==1,('Mixed-font reference block',pi,txt,b['fonts'])
                new=txt
                for m in reversed(matches):new=new[:m['start']]+m['new']+new[m['end']:]
                bounds=[min(c['x0'] for c in chars),min(c['top'] for c in chars),max(c['x1'] for c in chars),max(c['bottom'] for c in chars)]
                edits.append({**b,'page':pi,'folio':folio,'newText':new,'edits':matches,'bbox':bounds,'kind':'folio' if footer else ('reference' if all(c in '0123456789–−- ,.' for c in txt) else 'inline-reference'),'rightAlign':footer or folio in [4,5,9,99,147]})
            if (pi+1)%30==0:print(f'Located references through PDF page {pi+1}.',flush=True)
    expected=[p['folio'] for p in read(D/'before-PAGE-MAP.json') if p['folio'] and p['folio']>=4 and p['kind']!='blank']
    assert sorted(p['folio'] for p in footers)==expected,('Footer coverage',set(expected)-set(p['folio'] for p in footers))
    save(D/'EDIT-PLAN.json',{'date':'2026-11-22','edits':edits,'footerCount':len(footers),'numericChanges':sum(len(e['edits']) for e in edits),'allLinks':all_links,'unlinkedExplicitReferences':unlinked_refs,'newTitleSource':source['title']})
    print(json.dumps({'textBlocks':len(edits),'numericChanges':sum(len(e['edits']) for e in edits),'footers':len(footers),'links':len(all_links),'unlinkedExplicitReferences':unlinked_refs}),flush=True)

def font_codec(font):
    key=id(font)
    if key in CODECS:return CODECS[key]
    assert font.get('/Subtype') in ['/Type3','/TrueType'],font.get('/Subtype')
    first=int(font['/FirstChar']);widths=[float(v) for v in font['/Widths']]
    enc={};width={}
    for code in range(first,first+len(widths)):
        if widths[code-first]<=0:continue
        b=bytes([code]);s=decode(b,font)
        if len(s)!=1:continue
        enc[s]=b;width[s]=widths[code-first]
    CODECS[key]=(enc,width);return enc,width

def font_signature(font):
    fd=font['/FontDescriptor'].get_object()
    name=re.sub(r'^/?[A-Z]{6}\+','',str(fd.get('/FontName',font.get('/BaseFont'))))
    return (str(font['/Subtype']),name,str(fd.get('/FontWeight')),tuple(float(v) for v in font.get('/FontMatrix',[])))

def extend_type3(font,needed,pool,writer):
    """Copy missing digit outlines from identical native face/weight subsets."""
    enc,width=font_codec(font);new=font.clone(writer,force_duplicate=True)
    first=int(new['/FirstChar']);widths=list(new['/Widths'])
    encoding=DictionaryObject(new['/Encoding']);diff=ArrayObject(list(encoding['/Differences']))
    procs=DictionaryObject(new['/CharProcs']);extra=[]
    def glyph_name(f,code):
        at=0
        for x in f['/Encoding']['/Differences']:
            if isinstance(x,int):at=int(x)
            else:
                if at==code:return str(x)
                at+=1
        raise AssertionError('Missing glyph name')
    for ch in sorted(needed-set(enc)):
        donors=[]
        for candidate in pool[font_signature(font)]:
            ce,cw=font_codec(candidate)
            if ch in ce and all(abs(width[c]-cw[c])<.01 for c in set(width)&set(cw)&set('0123456789')):donors.append(candidate)
        assert donors,('No native digit-outline donor',ch,font_signature(font))
        donor=donors[0];ce,cw=font_codec(donor);proc=donor['/CharProcs'][glyph_name(donor,ce[ch][0])].get_object()
        assert b' Do' not in proc.get_data(),'Glyph depends on additional external resources'
        free=next(c for c in range(max(1,first),256) if c-first>=len(widths) or float(widths[c-first])==0)
        while free-first>=len(widths):widths.append(NumberObject(0))
        widths[free-first]=FloatObject(cw[ch]);name=NameObject('/PageDigit'+ch)
        procs[name]=proc.clone(writer).indirect_reference
        diff.extend([NumberObject(free),name]);extra.append(f'<{free:02x}> <{ord(ch):04x}>')
    encoding[NameObject('/Differences')]=diff;new[NameObject('/Encoding')]=encoding
    new[NameObject('/CharProcs')]=procs;new[NameObject('/Widths')]=ArrayObject(widths)
    new[NameObject('/LastChar')]=NumberObject(first+len(widths)-1)
    cmap=new['/ToUnicode'].get_data();addition=(str(len(extra))+' beginbfchar\n'+'\n'.join(extra)+'\nendbfchar\n').encode()
    assert cmap.count(b'endcmap')==1
    cm=DecodedStreamObject();cm.set_data(cmap.replace(b'endcmap',addition+b'endcmap'))
    new[NameObject('/ToUnicode')]=writer._add_object(cm)
    return new

def build_one(kind):
    ENCODINGS.clear();CODECS.clear()
    source=read(D/'SOURCE.json');plan=read(D/'EDIT-PLAN.json')
    source_file=D/('before-book.pdf' if kind=='native' else 'before-reading-copy.pdf')
    assert sha(source_file)==source['baseline']['sha256' if kind=='native' else 'readingSHA256']
    original=PdfReader(source_file);titlefile=R/source['title']['file'];assert sha(titlefile)==source['title']['sha256']
    title=PdfReader(titlefile).pages[source['title']['selectedPage']-1]
    pool=defaultdict(list);seen=set()
    support_path=R/source['numberFontSupport']['file']
    assert sha(support_path)==source['numberFontSupport']['sha256']
    support=PdfReader(support_path)
    for page in list(original.pages)+list(support.pages):
        for obj,_ in walk(page):
            for ref in obj.get('/Resources',{}).get('/Font',{}).values():
                f=ref.get_object()
                if id(f) in seen or f.get('/Subtype') not in ['/Type3','/TrueType']:continue
                seen.add(id(f));pool[font_signature(f)].append(f)
    writer=PdfWriter();old_to_new={};actual_edits=[];edited_objects=set()
    perpage=defaultdict(list)
    for edit in plan['edits']:perpage[edit['page']].append(edit)
    for pi,page in enumerate(original.pages):
        if pi in [3,4]:continue
        old_to_new[pi]=len(writer.pages)
        target=writer.add_page(title if pi==2 else page,excluded_keys=('/Annots',))
        if pi==2:continue
        groups=defaultdict(list)
        for e in perpage[pi]:groups[tuple(e['path'])].append(e)
        for path,edits in groups.items():
            obj=target
            for key in path:obj=obj['/Resources']['/XObject'][key].get_object()
            oid=obj.indirect_reference.idnum if obj.indirect_reference else id(obj)
            assert oid not in edited_objects,('Shared text form needs independent revision',pi,path)
            edited_objects.add(oid)
            s,bs=blocks(obj,writer)
            for edit in edits:
                b=bs[edit['block']];assert b['text']==edit['text'],(kind,pi,path,edit['text'],b['text'])
                fname=edit['fonts'][0];f=obj['/Resources']['/Font'][fname].get_object();enc,width=font_codec(f)
                needed=set(''.join(e['new'] for e in edit['edits']))
                substituted=False;newf=f
                if not needed<=set(enc):
                    options=[]
                    for candidate in pool[font_signature(f)]:
                        ce,cw=font_codec(candidate)
                        if set(edit['newText'])<=set(ce):
                            common=set(width)&set(cw)&set('0123456789')
                            if all(abs(width[c]-cw[c])<.01 for c in common):options.append(candidate)
                    if options:newf=options[0]
                    elif f.get('/Subtype')=='/Type3':newf=extend_type3(f,needed,pool,writer)
                    else:raise AssertionError(('No matching native font with necessary glyphs',kind,pi,edit['text'],font_signature(f),needed-set(enc)))
                    substituted=True
                newenc,newwidth=font_codec(newf)
                key=NameObject('/PageShift'+str(pi)+'_'+str(edit['block']))
                if substituted:
                    fonts=DictionaryObject(obj['/Resources']['/Font']);fonts[key]=newf.clone(writer).indirect_reference
                    obj['/Resources'][NameObject('/Font')]=fonts
                replacements={}
                for e in edit['edits']:
                    replacements[e['start']]=e['new']
                    for n in range(e['start']+1,e['end']):replacements[n]=''
                offset=0;delta_units=0.;old_count=0;new_count=0;font_size=None;tc=0.;tw=0.;tz=1.;tm_index=None
                for opi in range(b['start'],b['end']+1):
                    args,op=s.operations[opi]
                    if op==b'Tf':
                        font_size=float(args[1])
                        if substituted:args[0]=key
                    elif op==b'Tc':tc=float(args[0])
                    elif op==b'Tw':tw=float(args[0])
                    elif op==b'Tz':tz=float(args[0])/100
                    elif op==b'Tm' and tm_index is None:tm_index=opi
                    elif op in [b'Tj',b'TJ']:
                        vals=[args[0]] if op==b'Tj' else list(args[0]);newvals=[]
                        for value in vals:
                            if not isinstance(value,(str,bytes)):newvals.append(value);continue
                            output=bytearray()
                            for code in raw(value):
                                ch=decode(bytes([code]),f)
                                if offset in replacements:
                                    replacement=replacements[offset]
                                    output.extend(b''.join(newenc[c] for c in replacement))
                                    delta_units+=width[ch]-sum(newwidth[c] for c in replacement)
                                    old_count+=1;new_count+=len(replacement)
                                elif substituted:
                                    output.extend(b''.join(newenc[c] for c in ch))
                                else:output.append(code)
                                offset+=len(ch)
                            newvals.append(ByteStringObject(bytes(output)))
                        s.operations[opi]=([newvals[0]],b'Tj') if op==b'Tj' else ([ArrayObject(newvals)],b'TJ')
                assert offset==len(edit['text'])
                # Only pure folios and right-aligned navigation numbers change
                # their starting position when a three-digit number becomes two.
                shift=0.
                if edit['rightAlign'] and abs(delta_units)>.001:
                    assert tm_index is not None and font_size is not None
                    assert edit['kind']!='inline-reference'
                    shift=(delta_units/1000*font_size+tc*(old_count-new_count))*tz
                    args=s.operations[tm_index][0];args[4]=FloatObject(float(args[4])+shift*float(args[0]));args[5]=FloatObject(float(args[5])+shift*float(args[1]))
                assert edit['kind']!='inline-reference' or abs(delta_units)<.001 or not re.search(r'[A-Za-z]',edit['text'][edit['edits'][-1]['end']:]),('Inline reference requires spacing compensation',edit)
                actual_edits.append({**edit,'nativeFontSubstitutedForMissingDigits':substituted,'fontSignature':list(font_signature(f)),'rightAlignmentShiftTextUnits':shift})
            put_stream(obj,s)
        if (pi+1)%30==0:print(f'{kind}: updated references through old PDF page {pi+1}.',flush=True)
    from pypdf.annotations import Link
    for link in plan['allLinks']:
        assert link['page'] not in [3,4]
        if 'target' in link:
            assert link['target'] not in [3,4]
            writer.add_annotation(old_to_new[link['page']],Link(rect=link['rect'],target_page_index=old_to_new[link['target']]))
        else:writer.add_annotation(old_to_new[link['page']],Link(rect=link['rect'],url=link['uri']))
    outlines=[]
    def outline(items,parent=None):
        last=None
        for item in items:
            if isinstance(item,list):outline(item,last or parent);continue
            dest=original.get_destination_page_number(item)
            if dest in [3,4]:continue
            label='Title and copyright' if dest==2 else item.title
            last=writer.add_outline_item(label,old_to_new[dest],parent=parent)
            outlines.append({'title':label,'targetPage':old_to_new[dest]})
    outline(original.outline)
    writer.set_page_label(0,0,prefix='Front cover');writer.set_page_label(1,1,prefix='Inside front cover')
    writer.set_page_label(2,175,style='/D',start=1)
    writer.set_page_label(176,176,prefix='Inside back cover');writer.set_page_label(177,177,prefix='Back cover')
    writer.add_metadata({'/Title':'The Vegetable Guru — combined title and copyright book review','/Author':'John Lennon','/Subject':'174 interior pages. Approved title C installed; preceding copyright page and blank removed. Native page references updated. Screen review; supplier files unchanged.'})
    writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
    dest=D/('updated-native.pdf' if kind=='native' else 'updated-reading.pdf');temp=dest.with_suffix('.pdf.new');writer.write(temp);os.replace(temp,dest)
    save(D/(kind.upper()+'-BUILD.json'),{'date':'2026-11-22','file':str(dest.relative_to(R)),'sha256':sha(dest),'bytes':dest.stat().st_size,'pages':len(writer.pages),'oldToNew':old_to_new,'edits':actual_edits,'links':plan['allLinks'],'bookmarks':outlines})
    print(f'Wrote {kind}: {dest.stat().st_size/1e6:.1f} MB; {len(actual_edits)} native text blocks updated.',flush=True)

def build():
    build_one('reading')
    build_one('native')

def verify():
    import numpy as np
    import pypdfium2 as pdfium
    from PIL import Image,ImageDraw
    source=read(D/'SOURCE.json');plan=read(D/'EDIT-PLAN.json')
    expected={(e['page'],tuple(e['path']),e['block']):e for e in plan['edits']}
    image_cache={}
    def image_signatures(page):
        result=[]
        for obj,path in walk(page):
            for k,ref in obj.get('/Resources',{}).get('/XObject',{}).items():
                im=ref.get_object()
                if hasattr(im,'get') and im.get('/Subtype')=='/Image':
                    key=id(im)
                    if key not in image_cache:image_cache[key]=hashlib.sha256(im._data).hexdigest()
                    result.append((path,str(k),int(im['/Width']),int(im['/Height']),image_cache[key]))
        return result
    text_checks=[];link_checks=[]
    readers=[]
    for kind in ['reading','native']:
        ENCODINGS.clear();CODECS.clear()
        before=PdfReader(D/('before-book.pdf' if kind=='native' else 'before-reading-copy.pdf'))
        info=read(D/(kind.upper()+'-BUILD.json'));after=PdfReader(R/info['file']);readers.extend([before,after])
        assert len(after.pages)==178 and sha(R/info['file'])==info['sha256']
        mapper={int(k):v for k,v in info['oldToNew'].items()}
        for old,new in mapper.items():
            if old==2:
                t=PdfReader(R/source['title']['file']).pages[source['title']['selectedPage']-1]
                assert after.pages[new].get_contents().get_data()==t.get_contents().get_data()
                continue
            a={path:blocks(obj,before)[1] for obj,path in walk(before.pages[old])}
            b={path:blocks(obj,after)[1] for obj,path in walk(after.pages[new])}
            assert set(a)==set(b)
            for path,bs in a.items():
                assert len(bs)==len(b[path])
                for i,block in enumerate(bs):
                    e=expected.get((old,path,i));want=e['newText'] if e else block['text']
                    assert b[path][i]['text']==want,('Unexpected extracted text',kind,old,path,i,want,b[path][i]['text'])
            assert image_signatures(before.pages[old])==image_signatures(after.pages[new]),('Artwork resource changed',kind,old)
        ids={p.indirect_reference.idnum:i for i,p in enumerate(after.pages)};got=[]
        for i,p in enumerate(after.pages):
            for ref in p.get('/Annots',[]):
                a=ref.get_object()
                if '/Dest' in a:got.append((i,ids[a['/Dest'][0].idnum]))
                else:assert a['/A']['/S']=='/URI'
        want=[(mapper[l['page']],mapper[l['target']]) for l in plan['allLinks'] if 'target' in l]
        assert Counter(got)==Counter(want)
        assert after.page_labels[2]=='1' and after.page_labels[3]=='2' and after.page_labels[175]=='174'
        text_checks.append({'kind':kind,'pages':178,'allNativeTextBlocksVerified':True,'allExistingPageArtworkStreamsUnchanged':True,'approvedTitleStreamExact':True})
        link_checks.append({'kind':kind,'links':len(got),'allDestinationsVerified':True,'bookmarks':len(info['bookmarks'])})
        print(f'{kind}: all text, artwork resources and {len(got)} link destinations verified.',flush=True)
    new_native=pdfium.PdfDocument(D/'updated-native.pdf');old_native=pdfium.PdfDocument(D/'before-book.pdf')
    new_read=pdfium.PdfDocument(D/'updated-reading.pdf');old_read=pdfium.PdfDocument(D/'before-reading-copy.pdf')
    title_doc=pdfium.PdfDocument(R/source['title']['file'])
    renders=D/'pages';renders.mkdir(exist_ok=True)
    def render(doc,i,scale=1.2):
        page=doc[i];bitmap=page.render(scale=scale);im=bitmap.to_pil().convert('RGB');bitmap.close();page.close();return im
    edits_by_page=defaultdict(list)
    for e in plan['edits']:edits_by_page[e['page']].append(e)
    visual=[];oldmap=read(D/'before-PAGE-MAP.json');pagemap=[]
    mapper={int(k):v for k,v in read(D/'NATIVE-BUILD.json')['oldToNew'].items()}
    for old,new in mapper.items():
        row=copy.deepcopy(oldmap[old]);f=row['folio'];row['previousFolio']=f
        row['folio']=f-2 if f is not None and f>=4 else f;row['pdfPage']=new+1
        row['priorSource']={k:row.get(k) for k in ['source','sourcePage','approval']}
        row['source']=str((D/'before-book.pdf').relative_to(R));row['sourcePage']=old+1
        row['image']='title-copyright-integration-2026-11-22/pages/page-'+str(new+1).zfill(3)+'.jpg'
        if old==2:
            row.update(label='Title and copyright — approved C',source=source['title']['file'],sourcePage=source['title']['selectedPage'],approval='docs/publication/title-copyright-trials/APPROVAL.json')
        pagemap.append(row)
        native=render(new_native,new);reading=render(new_read,new)
        scale=1.2;mask=np.zeros((native.height,native.width),dtype=bool)
        for e in edits_by_page[old]:
            for change in e['edits']:
                x0,y0,x1,y1=change['bbox']
                mask[max(0,int((y0-3)*scale)):int((y1+3)*scale)+1,max(0,int((x0-3)*scale)):int((x1+3)*scale)+1]=True
        item={'oldPdfPage':old+1,'pdfPage':new+1,'folio':row['folio'],'allowedNumericRegions':sum(len(e['edits']) for e in edits_by_page[old])}
        for kind,actual,prior in [('native',native,old_native),('reading',reading,old_read)]:
            reference=render(title_doc,source['title']['selectedPage']-1) if old==2 else render(prior,old)
            a=np.asarray(actual).astype(int);b=np.asarray(reference).astype(int);assert a.shape==b.shape
            delta=np.max(np.abs(a-b),axis=2);outside=delta[~mask]
            count=int(np.count_nonzero(outside));item[kind+'ChangedPixelsOutsideEdits']=count
            if count:
                Image.fromarray(np.uint8(np.where((delta>0)&~mask,255,0))).save(D/f'UNEXPECTED-{kind}-{new+1}.png')
            assert count==0,('Pixels outside authorised reference changes',kind,old,new,count)
        reading.save(renders/f'page-{new+1:03}.jpg',quality=90)
        visual.append(item)
        if (new+1)%20==0:print(f'Compared native and browsing renders: {new+1}/178 pages.',flush=True)
    save(D/'PAGE-MAP.json',pagemap)
    def contact(name,folios,columns=3,tilew=340):
        indices=[next(i for i,p in enumerate(pagemap) if p['folio']==f) for f in folios]
        tileh=round(tilew*240/185)+28;sheet=Image.new('RGB',(columns*(tilew+12),((len(indices)+columns-1)//columns)*(tileh+12)),'#e7e3d7');draw=ImageDraw.Draw(sheet)
        for j,idx in enumerate(indices):
            im=Image.open(renders/f'page-{idx+1:03}.jpg');im.thumbnail((tilew,tileh-28));x=(j%columns)*(tilew+12);y=(j//columns)*(tileh+12)
            draw.text((x+5,y+6),'Page '+str(pagemap[idx]['folio']),fill='#173e2c');sheet.paste(im,(x,y+28))
        sheet.save(D/name,quality=92)
    contact('opening-review.jpg',[1,2,3,5,7,8])
    contact('references-review.jpg',[19,70,97,145,147,149])
    contact('index-review.jpg',[170,171,172,173],2,430)
    save(D/'VERIFICATION.json',{'date':'2026-11-22','status':'Structural, text, image-resource and full-page pixel checks passed; visual contact inspection pending','pages':178,'interiorPages':174,'textChecks':text_checks,'navigationChecks':link_checks,'numericReferencesChanged':plan['numericChanges'],'folioCount':plan['footerCount'],'allPixelsOutsideReferenceEditsUnchanged':True,'approvedTitleExact':True,'newNativeSHA256':sha(D/'updated-native.pdf'),'newReadingSHA256':sha(D/'updated-reading.pdf'),'visual':visual,'sourceFilesUnchanged':sha(D/'before-book.pdf')==source['baseline']['sha256'] and sha(D/'before-reading-copy.pdf')==source['baseline']['readingSHA256']})
    print('All 178 pages passed exact-image and text/reference verification.',flush=True)

def install():
    source=read(D/'SOURCE.json');v=read(D/'VERIFICATION.json');inspection=read(D/'VISUAL-INSPECTION.json')
    n=read(D/'NATIVE-BUILD.json');r=read(D/'READING-BUILD.json')
    assert v['pages']==178 and v['interiorPages']==174 and v['allPixelsOutsideReferenceEditsUnchanged'] and v['sourceFilesUnchanged']
    assert v['newNativeSHA256']==n['sha256']==inspection['nativeSHA256']
    assert v['newReadingSHA256']==r['sha256']==inspection['readingSHA256']
    assert inspection['status']=='passed'
    assert sha(R/source['title']['file'])==source['title']['sha256']
    for kind,info,output,oldhash in [('native',n,source['nativeOutput'],source['baseline']['sha256']),('reading',r,source['readingOutput'],source['baseline']['readingSHA256'])]:
        assert sha(R/info['file'])==info['sha256']
        assert sha(R/output) in {oldhash,info['sha256']},'Current book changed outside this bounded update.'
    # Verify bookmark destinations independently of annotation checks.
    book=PdfReader(R/n['file']);found=[]
    def collect(items):
        for item in items:
            if isinstance(item,list):collect(item)
            else:found.append({'title':item.title,'targetPage':book.get_destination_page_number(item)})
    collect(book.outline);assert found==n['bookmarks']
    pages=read(D/'PAGE-MAP.json')
    assert [p['folio'] for p in pages if p['folio'] is not None]==list(range(1,175))
    assert [p['folio'] for p in pages if p['kind']=='blank' and p['folio'] is not None]==[4,6,96,174]
    for p in pages:
        assert (B/p['image']).is_file()
        if p['previousFolio'] is not None and p['previousFolio']>=4:assert p['folio']%2==p['previousFolio']%2
    for info,output in [(n,source['nativeOutput']),(r,source['readingOutput'])]:
        target=R/output;temp=target.with_suffix('.pdf.install');temp.unlink(missing_ok=True)
        os.link(R/info['file'],temp);os.replace(temp,target)
    prefix=D.name+'/'
    receipt={'date':'2026-11-22','status':'Approved title C installed; prior copyright and following blank pages removed; all later references updated',
        'authorisation':source['authorisation'],'pdf':source['nativeOutput'],'sha256':n['sha256'],'bytes':n['bytes'],
        'readingCopy':source['readingOutput'],'readingCopySHA256':r['sha256'],'readingCopyBytes':r['bytes'],
        'interiorPages':174,'pdfPages':178,'removedPriorFolios':[2,3],'numericReferencesChanged':v['numericReferencesChanged'],'printedFoliosUpdated':v['folioCount'],
        'internalLinks':662,'contentsLinks':84,'openerLinks':77,'bookmarks':len(found),'guidePairsIntegrated':44,'guidesReexported':0,
        'approvedTitleExact':True,'allOtherArtworkResourcesUnchanged':True,'allPixelsOutsideNumericEditsUnchanged':True,
        'sourceFilesUnchanged':True,'previousBook':source['baseline'],'sourceManifest':prefix+'SOURCE.json','verification':prefix+'VERIFICATION.json',
        'inspection':prefix+'VISUAL-INSPECTION.json','supplierFilesChanged':False,'canonicalGardeningRecordsChanged':False,'newArtworkGenerated':False,
        'limits':['Screen proof without bleed; supplier approval remains separate.','Copyright year and ISBN remain placeholders.','Approved corrected cover wrap is preserved separately; existing cover review leaves remain installed.']}
    save(D/'INTEGRATION-CHECKS.json',receipt)
    bound=prefix+'INTEGRATION-CHECKS.json'
    save(B/'CHECKS.json',{**receipt,'units':'imperial','displayEdition':'Traditional measurements edition','trimMm':[185,240],
        'folioMapping':'PDF page = printed folio + 2','integrationReceipt':bound,'indexEntries':307,'indexSeeReferences':36})
    save(B/'PAGE-MAP.json',pages)
    save(B/'COMPONENT-CHECKS.json',{'date':'2026-11-22','status':'All 178 pages verified against the frozen baseline or approved title C',
        'pdfSha256':n['sha256'],'integrationReceipt':bound,'guidePairsIntegrated':44,'allOtherArtworkResourcesUnchanged':True,'sourceManifest':prefix+'SOURCE.json'})
    save(B/'NAVIGATION-PDF-CHECKS.json',{'date':'2026-11-22','status':'All 662 destinations and all bookmarks verified after the two-page removal',
        'pdfSha256':n['sha256'],'integrationReceipt':bound,'internalLinks':662,'contentsLinks':84,'openerLinks':77,'bookmarks':found,
        'numericReferencesChanged':v['numericReferencesChanged'],'detail':prefix+'EDIT-PLAN.json'})
    save(B/'SEQUENCE-CHECKS.json',{'date':'2026-11-22','pdfSha256':n['sha256'],'integrationReceipt':bound,'interiorPages':174,'pdfPages':178,
        'firstLeaves':pages[:9],'sectionStartFolios':[7,97,145],'sectionStartSides':['recto']*3,'vegetableFacingPairs':44,
        'techniqueFacingPairs':[[i,i+1] for i in range(146,170,2)],'blankFolios':[4,6,96,174],'indexFolios':[170,173],'allRetainedPageSidesPreserved':True})
    save(B/'VISUAL-REVIEW.json',{'date':'2026-11-22','status':'passed','pdfSha256':n['sha256'],'integrationReceipt':bound,'pagesRendered':178,
        'allPixelsOutsideNumericEditsUnchanged':True,'detail':prefix+'VERIFICATION.json','inspection':inspection})
    viewer=(D/'before-REVIEW.html').read_text()
    start=viewer.index('const pages=')+len('const pages=');end=viewer.index(';let at=',start)
    viewer=viewer[:start]+json.dumps(pages,ensure_ascii=False).replace('<','\\u003c')+viewer[end:]
    viewer=viewer.replace('176 interior pages','174 interior pages').replace('Math.min(90,n)','Math.min(Math.floor(pages.length/2),n)').replace('at===90','at===Math.floor(pages.length/2)').replace('of 91','of ${Math.floor(pages.length/2)+1}')
    viewer=viewer.replace('Approved opening pages, photographic Growing Techniques and all 44 latest vegetable guides, including variety additions.', 'Approved title C with copyright, followed by the contents spread; the old copyright page and blank are removed. All later page references are updated.')
    viewer=viewer.replace('Print-resolution review remains for the title-page tomato and selected cover raster artwork.', 'The corrected cover wrap is approved separately; this review retains the earlier cover leaves.')
    viewer=re.sub(r'Browsing PDF \(\d+ MB\)',f'Browsing PDF ({round(r["bytes"]/1e6)} MB)',viewer)
    viewer=re.sub(r'Full-resolution native PDF \(\d+ MB\)',f'Full-resolution native PDF ({round(n["bytes"]/1e6)} MB)',viewer)
    (B/'REVIEW.html').write_text(viewer)
    print(json.dumps({k:receipt[k] for k in ['status','interiorPages','pdfPages','internalLinks','bookmarks','sha256']}),flush=True)

if __name__=='__main__':
    {'prepare':prepare,'plan':plan,'build':build,'verify':verify,'install':install}[sys.argv[1]]()
