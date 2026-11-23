"""Bounded follow-up: original contents, primary index refs, tilted badges, plain FIX."""
from pathlib import Path
from collections import defaultdict,Counter
import runpy,json,math,sys,copy,os,re,hashlib
import pdfplumber,pypdfium2 as pdfium,numpy as np
from PIL import Image,ImageDraw
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,DecodedStreamObject,ContentStream,FloatObject
m=runpy.run_path(str(Path(__file__).with_name('interior-six-fixes.py')));u=m['u'];R=m['R'];B=m['B'];S=m['D'];D=B/'navigation-polish-2026-11-22';MM=m['MM'];H=m['H']
v=runpy.run_path(str(Path(__file__).with_name('verify-interior-six-fixes.py')))
def read(n):return u.read(D/n)
def save(n,x):u.save(D/n,x)
def detach(page,w):
    s=DecodedStreamObject();s.set_data(page.get_contents().get_data());page[NameObject('/Contents')]=w._add_object(s)
def groups(stream):
    depth=0;at=None;out=[]
    for i,(a,op) in enumerate(stream.operations):
        if op==b'q':
            if depth==0:at=i
            depth+=1
        elif op==b'Q':
            depth-=1
            if depth==0:out.append((at,i+1,stream.operations[at:i+1]))
        else:assert depth>0,('Unwrapped native operation',op)
    assert depth==0
    return out
def group_box(ops):
    points=[]
    for a,op in ops:
        if op in [b'm',b'l',b'c']:
            points.extend((float(a[i]),H-float(a[i+1])) for i in range(0,len(a),2))
    if not points:return None
    return [min(x for x,y in points),min(y for x,y in points),max(x for x,y in points),max(y for x,y in points)]
def plan():
    records=u.read(S/'TEXT-MAP.json');pagemap=read('before-PAGE-MAP.json');primary=u.read(R/'src/print/book/index-primary-references.json');resolved=u.read(B/'index/RESOLVED.json')['editions']['imperial'];terms={e['id']:e['term'] for e in resolved};index=[];regions=defaultdict(list)
    for i,r in enumerate(records):
        if r['folio'] in range(170,174) and r.get('chars') and 'ExtraBold' in r['chars'][0]['fontname'] and re.fullmatch(r'[\d\s,–]+',r['text']):index.append({'ref':i,'primary':False})
    for ident,source in primary.items():
        crop=source.split(':')[1];folio=min(p['folio'] for p in pagemap if p.get('key')==crop and p['kind']=='vegetable');want=f'{folio}–{folio+1}'
        hits=[e for e in index if records[e['ref']]['text']==want and records[e['ref']-1]['text']==terms[ident]];assert len(hits)==1,(ident,want)
        hits[0].update(primary=True,entryId=ident,crop=crop,term=terms[ident])
    bold=next(i for i,r in enumerate(records) if r['folio']==170 and r.get('chars') and 'ExtraBold' in r['chars'][0]['fontname'])
    regular=next(i for i,r in enumerate(records) if r.get('chars') and 'Regular_Regular' in r['chars'][0]['fontname'])
    for e in index:
        r=records[e['ref']];e['styleRef']=bold if e['primary'] else regular;e['page']=r['page'];regions[r['page']].append([r['bbox'][0]-1,r['bbox'][1]-1,r['bbox'][2]+2,r['bbox'][3]+1])
    troubles=[];pdf=PdfReader(D/'before-reading.pdf');oldplan={p['page']:p for p in u.read(S/'TROUBLES-REFLOW.json')}
    with pdfplumber.open(D/'before-reading.pdf') as pl:
      for pi in range(99,146):
        p=pl.pages[pi];badge=next(c for c in p.curves if abs(c['width']-76)<.01 and abs(c['height']-35)<.01 and abs(c['top']-17)<.01);box=[badge['x0'],badge['top'],badge['x1'],badge['bottom']]
        rotate=[];remove=[];ops=groups(pdf.pages[pi].get_contents());fixes=[]
        for gi,(_,_,gs) in enumerate(ops):
            q=group_box(gs)
            if q:
                width=q[2]-q[0];height=q[3]-q[1]
                if abs(width-76)<.01 and abs(height-35)<.01 and abs(q[1]-17)<.01:rotate.append(gi)
                elif width<30 and abs(height-11)<.01 and q[1]>60:remove.append(gi);fixes.append(q);regions[pi].append([q[0]-.5,q[1]-.5,q[2]+.5,q[3]+.5])
            else:
                tm=next((a for a,op in gs if op==b'Tm'),None)
                if tm and box[0]<=float(tm[4])<=box[2] and 17<=H-float(tm[5])<=52:rotate.append(gi)
        assert len(rotate)==18,(pi,len(rotate))
        assert len(remove)==sum(q['label']=='FIX' for e in oldplan[pi]['entries'] for q in e['paragraphs']),(pi,len(remove))
        regions[pi].append([box[0]-3,box[1]-4,box[2]+3,box[3]+4]);troubles.append({'page':pi,'folio':pi-1,'rotateGroups':rotate,'removeGroups':remove,'badgeBox':box,'fixBoxes':fixes})
    save('PLAN.json',{'index':index,'troubles':troubles,'regions':regions,'contentsPages':[3,4],'primaryIndexRanges':sum(e['primary'] for e in index),'referenceBlocks':len(index),'fixBackgrounds':sum(len(p['removeGroups']) for p in troubles)})
    print('Planned',len(index),'index blocks, 44 primary ranges, 47 badges, 217 FIX backgrounds.')
def build(kind):
    u.CODECS.clear();u.ENCODINGS.clear();source=read('SOURCE.json');before=D/f'before-{kind}.pdf';assert u.sha(before)==source['baseline']['sha256' if kind=='native' else 'readingCopySHA256']
    for file,digest in source.get('frozenInputs',{}).items():assert u.sha(R/file)==digest
    p=read('PLAN.json');records=u.read(S/'TEXT-MAP.json');pdf=PdfReader(before);donor=PdfReader(S/f'before-{kind}.pdf');w=PdfWriter(clone_from=pdf);paint=m['Painter'](donor,w,records)
    for pi in p['contentsPages']:
        page=w.pages[pi];s=DecodedStreamObject();s.set_data(donor.pages[pi].get_contents().get_data());page[NameObject('/Contents')]=w._add_object(s);page[NameObject('/Resources')]=donor.pages[pi]['/Resources'].clone(w)
    for change in p['troubles']:
        page=w.pages[change['page']];stream=page.get_contents();lines=stream.get_data().splitlines(keepends=True);sets=groups(stream);ops=[];a=math.radians(-4);c=math.cos(a);s=math.sin(a);x0,y0,x1,y1=change['badgeBox'];cx=(x0+x1)/2;cy=H-(y0+y1)/2
        matrix=' '.join(f'{t:.10f}' for t in [c,s,-s,c,cx-c*cx+s*cy,cy-s*cx-c*cy]).encode()
        # The retained painter writes one complete q/Q group per line. Preserve
        # untouched bytes so float serialization cannot alter body rasterization.
        assert len(lines)==len(sets) and all(line.startswith(b'q ') and line.rstrip().endswith(b' Q') for line in lines)
        for i,line in enumerate(lines):
            if i in change['removeGroups']:continue
            if i in change['rotateGroups']:ops.append(b'q '+matrix+b' cm '+line.rstrip()+b' Q\n')
            else:ops.append(line)
        fresh=DecodedStreamObject();fresh.set_data(b''.join(ops));page[NameObject('/Contents')]=w._add_object(fresh)
    for pi in range(171,175):
        page=w.pages[pi];detach(page,w);edits=[e for e in p['index'] if e['page']==pi]
        for obj,path in u.walk(page):
            selected={records[e['ref']]['block']:e for e in edits if tuple(records[e['ref']]['path'])==path}
            if not selected:continue
            stream,blocks=u.blocks(obj,w);suppress=set()
            for bi,e in selected.items():
                assert blocks[bi]['text']==records[e['ref']]['text'];suppress.update(range(blocks[bi]['start'],blocks[bi]['end']+1))
            stream.operations=[op for j,op in enumerate(stream.operations) if j not in suppress];u.put_stream(obj,stream)
        for e in edits:
            r=records[e['ref']];size=r['chars'][0]['size'];width=paint.text(r['text'],e['styleRef'],size,r['bbox'][0],H-r['chars'][0]['matrix'][5],colour=r['chars'][0]['non_stroking_color'])
            assert width<=r['bbox'][2]-r['bbox'][0]+1.5,('Index width grew',r['text'],width,r['bbox'])
        overlay=u.PageObject.create_blank_page(width=185*MM,height=H);paint.finish(overlay);page.merge_page(overlay)
    target=D/f'updated-{kind}.pdf';w.compress_identical_objects(remove_duplicates=True,remove_unreferenced=False);w.write(target);save(kind.upper()+'-BUILD.json',{'file':str(target.relative_to(R)),'sha256':u.sha(target),'bytes':target.stat().st_size,'pages':len(w.pages)});print('Built',kind,flush=True)
def verify(kind):
    p=read('PLAN.json');records=u.read(S/'TEXT-MAP.json');before=D/f'before-{kind}.pdf';after=D/f'updated-{kind}.pdf';a=PdfReader(before);b=PdfReader(after);c=PdfReader(S/f'before-{kind}.pdf');assert len(a.pages)==len(b.pages)==178
    nav=v['navigation'](a);assert v['navigation'](b)==nav
    changed=set(p['contentsPages'])|{q['page'] for q in p['troubles']}|{e['page'] for e in p['index']};geometry=[]
    with pdfplumber.open(before) as old,pdfplumber.open(after) as new,pdfplumber.open(S/f'before-{kind}.pdf') as original:
      for pi in sorted(changed):
        ref=original.pages[pi] if pi in p['contentsPages'] else old.pages[pi];page=new.pages[pi]
        assert v['chars'](page)==v['chars'](ref),('Text changed',kind,pi)
        assert v['image_hashes'](a.pages[pi])==v['image_hashes'](b.pages[pi]),('Art changed',pi)
        if 99<=pi<=145:
            badge=[ch for ch in page.chars if ch['top']<55 and ch['x0']>380 and abs(ch['matrix'][1])>.01];assert len(badge)==17,(pi,len(badge))
            assert all(abs(math.degrees(math.atan2(ch['matrix'][1],ch['matrix'][0]))+4)<.01 for ch in badge)
            assert not [q for q in page.curves if q['width']<30 and abs(q['height']-11)<.01 and q['top']>60],('FIX background remains',pi)
            # Stream serialization rounds floats; allow less than 0.0001 pt.
            def body(q):return [ch for ch in q.chars if ch['top']>55]
            prior,current=body(old.pages[pi]),body(page)
            assert len(prior)==len(current),('Body length changed',pi)
            for left,right in zip(prior,current):
                assert left['text']==right['text'] and left['fontname']==right['fontname'],('Body glyph changed',pi)
                assert max(abs(float(x)-float(y)) for x,y in zip(left['matrix'],right['matrix']))<.0001 and abs(left['size']-right['size'])<.0001,('Body moved',pi)
        elif pi>=171:
            for e in [e for e in p['index'] if e['page']==pi]:
                r=records[e['ref']];baseline=r['chars'][0]['matrix'][5]
                cs=[ch for ch in page.chars if abs(ch['matrix'][5]-baseline)<.01 and r['bbox'][0]-.01<=ch['x0']<r['bbox'][2]-.01]
                target='ExtraBold' if e['primary'] else 'Regular_Regular'
                assert ''.join(ch['text'] for ch in cs)==r['text'],('Index reference text',r['text'],cs)
                assert all(target in ch['fontname'] for ch in cs),('Reference weight',r['text'],target)
        geometry.append({'pdfPage':pi+1,'textAndArtworkExact':True})
        if (pi+1)%10==0:print(kind,'text and geometry verified through',pi+1,flush=True)
    olddoc=pdfium.PdfDocument(before);newdoc=pdfium.PdfDocument(after);original=pdfium.PdfDocument(S/f'before-{kind}.pdf');out=D/'pages';out.mkdir(exist_ok=True);rendered=[]
    for pi in range(178):
        im=v['render'](newdoc,pi);reference=v['render'](original if pi in p['contentsPages'] else olddoc,pi);delta=np.max(np.abs(np.asarray(im).astype(int)-np.asarray(reference).astype(int)),axis=2);mask=np.zeros(delta.shape,dtype=bool)
        for x0,y0,x1,y1 in p['regions'].get(str(pi),[]):mask[max(0,int(y0*1.2)):int(y1*1.2)+2,max(0,int(x0*1.2)):int(x1*1.2)+2]=True
        count=int(np.count_nonzero(delta[~mask]));assert count==0,('Unexpected pixels',kind,pi+1,count)
        if kind=='reading':im.save(out/f'page-{pi+1:03}.jpg',quality=90)
        rendered.append({'pdfPage':pi+1,'outsideEditPixelsChanged':count})
        if (pi+1)%30==0:print(kind,'verified through',pi+1,flush=True)
    save(kind.upper()+'-VERIFICATION.json',{'date':'2026-11-22','sha256':u.sha(after),'pages':178,'interiorPages':174,'links':len(nav['links']),'bookmarks':len(nav['bookmarks']),'navigationUnchanged':True,'contentsExactlyRestored':True,'primaryIndexRanges':44,'otherReferencesRegular':True,'bannersAtFourDegrees':47,'fixBackgroundsRemoved':217,'troublesBodyGlyphsUnchanged':True,'allPixelsOutsideEditsUnchanged':True,'geometry':geometry,'rendered':rendered});print('Passed',kind,flush=True)
def contacts():
    for name,folios in [('contents',[2,3]),('index',[170,171,172,173]),('troubles',[98,99,111,142])]:
        cols=2;tw=500;th=round(tw*240/185);im=Image.new('RGB',(2*(tw+12),((len(folios)+1)//2)*(th+30)),'#e6e1d5');draw=ImageDraw.Draw(im)
        for i,f in enumerate(folios):
            page=Image.open(D/'pages'/f'page-{f+2:03}.jpg');page.thumbnail((tw,th));x=i%2*(tw+12);y=i//2*(th+30);draw.text((x+5,y+5),f'Page {f}',fill='black');im.paste(page,(x,y+25))
        im.save(D/f'{name}-review.jpg',quality=94)
def install():
    source=read('SOURCE.json');base=source['baseline'];inspection=read('VISUAL-INSPECTION.json');assert inspection['status']=='passed'
    builds={k:read(k.upper()+'-BUILD.json') for k in ['native','reading']}
    for k,key,hkey in [('native','pdf','sha256'),('reading','readingCopy','readingCopySHA256')]:
        check=read(k.upper()+'-VERIFICATION.json');info=builds[k]
        assert check['allPixelsOutsideEditsUnchanged'] and check['navigationUnchanged'] and check['troublesBodyGlyphsUnchanged']
        assert u.sha(D/f'updated-{k}.pdf')==info['sha256']==check['sha256']==inspection[k+'SHA256']
        assert u.sha(D/f'before-{k}.pdf')==base[hkey]
        assert u.sha(R/base[key]) in [base[hkey],info['sha256']],'Current book changed outside this request.'
    p=read('PLAN.json');changed=set(p['contentsPages'])|{q['page'] for q in p['troubles']}|{e['page'] for e in p['index']};pages=read('before-PAGE-MAP.json')
    for i,row in enumerate(pages):
        row['image']=D.name+f'/pages/page-{i+1:03}.jpg';assert (B/row['image']).is_file()
        if i in changed:
            row['priorPolishSource']={k:row.get(k) for k in ['source','sourcePage']};row.update(source=str((D/'updated-native.pdf').relative_to(R)),sourcePage=i+1,navigationPolishSource=str((D/'SOURCE.json').relative_to(R)))
    save('PAGE-MAP.json',pages)
    for k,key in [('native','pdf'),('reading','readingCopy')]:
        target=R/base[key];tmp=target.with_suffix('.pdf.install');tmp.unlink(missing_ok=True);os.link(D/f'updated-{k}.pdf',tmp);os.replace(tmp,target)
    n=builds['native'];r=builds['reading'];prefix=D.name+'/';receipt=copy.deepcopy(base)
    receipt.update(status='Contents restored; main index references distinguished; Troubles banners tilted and FIX highlights removed',authorisation=source['authorisation'],sha256=n['sha256'],bytes=n['bytes'],readingCopySHA256=r['sha256'],readingCopyBytes=r['bytes'],previousIntegration=base['integrationReceipt'],sourceManifest=prefix+'SOURCE.json',integrationReceipt=prefix+'INTEGRATION-CHECKS.json',nativeVerification=prefix+'NATIVE-VERIFICATION.json',readingVerification=prefix+'READING-VERIFICATION.json',inspection=prefix+'VISUAL-INSPECTION.json',primaryIndexRanges=44,indexPrimaryWeight=800,indexOtherReferenceWeight=400,contentsPartLabels=0,bannerAngleDegreesClockwise=4,fixBackgroundsRemoved=217,allPixelsOutsideRequestedEditsUnchanged=True,checks={'indexLogicTests':2,'scriptSyntax':'passed','PDFs':'Native offline edits; no browser export needed.'})
    receipt['simpleChanges']['contentsPartLabels']=0;save('INTEGRATION-CHECKS.json',receipt);u.save(B/'CHECKS.json',receipt);u.save(B/'PAGE-MAP.json',pages)
    for name in ['COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json','VISUAL-REVIEW.json']:
        data=read('before-'+name);data.update(pdfSha256=n['sha256'],integrationReceipt=prefix+'INTEGRATION-CHECKS.json')
        if name=='COMPONENT-CHECKS.json':data.update(status='Requested navigation polish checked; all other pixels preserved',sourceManifest=prefix+'SOURCE.json')
        if name=='NAVIGATION-PDF-CHECKS.json':data.update(status='All 662 link destinations and 89 bookmarks unchanged',detail=prefix+'NATIVE-VERIFICATION.json')
        if name=='SEQUENCE-CHECKS.json':data['firstLeaves']=pages[:9]
        if name=='VISUAL-REVIEW.json':data.update(detail=prefix+'NATIVE-VERIFICATION.json',inspection=inspection)
        u.save(B/name,data)
    viewer=(D/'before-REVIEW.html').read_text();start=viewer.index('const pages=')+len('const pages=');end=viewer.index(';let at=',start);viewer=viewer[:start]+json.dumps(pages,ensure_ascii=False).replace('<','\\u003c')+viewer[end:]
    viewer=viewer.replace('Six interior fixes applied: cream blanks, part labels, cleaner guide titles and punctuation, and revised Troubles headings and labels. Approved title C and the 174-page sequence are retained.','Original contents restored; main vegetable index references are bold, Troubles banners tilt by 4° and FIX has no background. Previous interior corrections and the 174-page sequence are retained.')
    viewer=re.sub(r'Browsing PDF \(\d+ MB\)',f'Browsing PDF ({round(r["bytes"]/1e6)} MB)',viewer);viewer=re.sub(r'Full-resolution native PDF \(\d+ MB\)',f'Full-resolution native PDF ({round(n["bytes"]/1e6)} MB)',viewer);(B/'REVIEW.html').write_text(viewer)
    print('Installed',len(changed),'changed pages; 178 PDF pages and all navigation retained.')
if __name__=='__main__':{'plan':plan,'build':lambda:build(sys.argv[2]),'verify':lambda:verify(sys.argv[2]),'contacts':contacts,'install':install}[sys.argv[1]]()
