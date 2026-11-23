"""Content, geometry, navigation, artwork and rendered-page checks for six fixes."""
import runpy,sys,json,hashlib,copy
from collections import Counter,defaultdict
from pathlib import Path
import numpy as np
import pdfplumber,pypdfium2 as pdfium
from PIL import Image,ImageDraw
from pypdf import PdfReader
m=runpy.run_path(str(Path(__file__).with_name('interior-six-fixes.py')))
D=m['D'];R=m['R'];u=m['u'];MM=m['MM'];H=m['H']
def read(name):return json.loads((D/name).read_text())
def save(name,data):u.save(D/name,data)
def letters(text):return Counter(c for c in text if not c.isspace())
def chars(page):return letters(''.join(c['text'] for c in page.chars))
def navigation(pdf):
    ids={p.indirect_reference.idnum:i for i,p in enumerate(pdf.pages)};links=[];marks=[]
    for i,p in enumerate(pdf.pages):
        for ref in p.get('/Annots',[]):
            a=ref.get_object()
            if '/Dest' in a:links.append((i,ids[a['/Dest'][0].idnum],tuple(float(v) for v in a['/Rect'])))
            else:assert a['/A']['/S']=='/URI'
    def collect(items):
        for item in items:
            if isinstance(item,list):collect(item)
            else:marks.append((item.title,pdf.get_destination_page_number(item)))
    collect(pdf.outline)
    return {'links':links,'bookmarks':marks,'pageLabels':pdf.page_labels}
def image_hashes(page):
    found=[]
    for obj,_ in u.walk(page):
        for ref in obj.get('/Resources',{}).get('/XObject',{}).values():
            im=ref.get_object()
            if hasattr(im,'get') and im.get('/Subtype')=='/Image':found.append((int(im['/Width']),int(im['/Height']),hashlib.sha256(im._data).hexdigest()))
    return Counter(found)
def render(doc,i,scale=1.2):
    p=doc[i];b=p.render(scale=scale);im=b.to_pil().convert('RGB');b.close();p.close();return im
def verify(kind):
    plan=read('SIMPLE-PLAN.json');recs=read('TEXT-MAP.json');troubles={p['page']:p for p in read('TROUBLES-REFLOW.json')}
    before=D/('before-native.pdf' if kind=='native' else 'before-reading.pdf');after=D/f'updated-{kind}.pdf'
    a=PdfReader(before);b=PdfReader(after);assert len(a.pages)==len(b.pages)==178
    na=navigation(a);nb=navigation(b);assert na==nb,'Navigation changed';assert len(nb['links'])==662 and len(nb['bookmarks'])==89
    changes=defaultdict(Counter)
    for i in plan['remove']:changes[recs[i]['page']].subtract(letters(recs[i]['text']))
    for x in plan['moves']:changes[recs[x['ref']]['page']].update(letters(recs[x['ref']]['text']))
    for x in plan['text']:changes[x['page']].update(letters(x['text']))
    for pi,p in troubles.items():
        changes[pi].subtract(letters('Troubles'));changes[pi].update(letters('Vegetable troublestroubles'))
        for e in p['entries']:
            for para in e['paragraphs']:
                old={'IDENTIFICATION':'RECOGNISE','FIX':'ACT','PREVENTION':'PREVENT'}[para['label']]
                changes[pi].subtract(letters(old));changes[pi].update(letters(para['label']))
    geom=[];pagechecks=[]
    with pdfplumber.open(before) as old, pdfplumber.open(after) as new:
      for pi,(pa,pb) in enumerate(zip(old.pages,new.pages)):
        expected=chars(pa);expected.update(changes[pi]);expected=+expected
        assert chars(pb)==expected,('Unexpected text',kind,pi+1,chars(pb)-expected,expected-chars(pb))
        assert image_hashes(a.pages[pi])==image_hashes(b.pages[pi]),('Artwork changed',kind,pi+1)
        assert abs(float(b.pages[pi].mediabox.width)-185*MM)<.1 and abs(float(b.pages[pi].mediabox.height)-H)<.1
        if pi in troubles:
            p=troubles[pi]
            assert p['footerClearanceMm']>=3.49
            for e in p['entries']:
                for para in e['paragraphs']:
                    assert ''.join(l['text'] for l in para['lines']).replace(' ','')==para['oldText'].replace(' ','')
                    for line in para['lines']:
                        if not line['text']:continue
                        y=H-line['baseline']-e['shiftY']
                        cc=[c for c in pb.chars if abs(c['matrix'][5]-y)<.02 and c['x0']>=line['x']-.02 and c['x0']<e['bbox'][2]+.01 and abs(c['size']-9)<.05]
                        cc.sort(key=lambda c:c['x0']);got=''.join(c['text'] for c in cc)
                        assert got==line['text'],('Line changed',kind,p['folio'],e['key'],got,line['text'])
                        assert max(c['x1'] for c in cc)<=line['right']+.25,('Text crosses art clearance',kind,p['folio'],e['key'])
                        assert max(c['bottom'] for c in cc)<p['footerTopPt']-3*MM
            geom.append({'folio':p['folio'],'entries':len(p['entries']),'footerClearanceMm':p['footerClearanceMm'],'allAdviceLinesExact':True,'bodyTypePt':9})
        pagechecks.append({'pdfPage':pi+1,'textExact':True,'imageStreamsExact':True})
        if (pi+1)%20==0:print(kind,'text/images verified',pi+1,flush=True)
    oldrender=pdfium.PdfDocument(before);newrender=pdfium.PdfDocument(after);renders=D/'pages';renders.mkdir(exist_ok=True);visual=[]
    for pi in range(178):
        im=render(newrender,pi);item={'pdfPage':pi+1}
        if pi not in troubles and pi not in plan['blanks']:
            prior=render(oldrender,pi);delta=np.max(np.abs(np.asarray(im).astype(int)-np.asarray(prior).astype(int)),axis=2)
            mask=np.zeros(delta.shape,dtype=bool)
            for x0,y0,x1,y1 in plan['regions'].get(str(pi),[]):mask[max(0,int(y0*1.2)):int(y1*1.2)+2,max(0,int(x0*1.2)):int(x1*1.2)+2]=True
            count=int(np.count_nonzero(delta[~mask]));item['changedPixelsOutsideEdits']=count
            if count:Image.fromarray(np.uint8(np.where((delta>0)&~mask,255,0))).save(D/f'UNEXPECTED-{kind}-{pi+1}.png')
            assert count==0,('Unexpected rendered changes',kind,pi+1,count)
        if pi in plan['blanks']:
            pixels=np.asarray(im);assert np.max(pixels[:,:,:3],axis=(0,1)).tolist()==[255,248,233] and np.min(pixels[:,:,:3],axis=(0,1)).tolist()==[255,248,233]
            item['solidCream']=True
        if kind=='reading':im.save(renders/f'page-{pi+1:03}.jpg',quality=90)
        visual.append(item)
        if (pi+1)%20==0:print(kind,'render verified',pi+1,flush=True)
    receipt={'date':'2026-11-22','kind':kind,'sha256':u.sha(after),'pages':178,'interiorPages':174,'internalLinks':len(nb['links']),'bookmarks':len(nb['bookmarks']),'navigationExact':True,'allNativeTextVerified':True,'allArtworkResourcesExact':True,'nonTroublesPixelsOutsideEditsExact':True,'troublesPages':len(troubles),'troublesEntries':sum(len(p['entries']) for p in troubles.values()),'featurePanels':sum(e['featured'] for p in troubles.values() for e in p['entries']),'labels':dict(Counter(q['label'] for p in troubles.values() for e in p['entries'] for q in e['paragraphs'])),'simpleChanges':plan['counts'],'geometry':geom,'pageChecks':pagechecks,'renderChecks':visual}
    save(kind.upper()+'-VERIFICATION.json',receipt);print('Passed',kind,flush=True)
def contacts():
    groups=[('openings',[1,2,3,7,97,145]),('vegetables',[8,9,58,59,68,69])]
    for start in range(98,145,12):groups.append((f'troubles-{start}',list(range(start,min(start+12,145)))))
    for name,folios in groups:
        cols=3;tw=390;th=round(tw*240/185);sheet=Image.new('RGB',(cols*(tw+12),((len(folios)+cols-1)//cols)*(th+36)),'#e7e3d7');draw=ImageDraw.Draw(sheet)
        for n,f in enumerate(folios):
            im=Image.open(D/'pages'/f'page-{f+2:03}.jpg');im.thumbnail((tw,th));x=n%cols*(tw+12);y=n//cols*(th+36);draw.text((x+5,y+5),f'Page {f}',fill='#173e2c');sheet.paste(im,(x,y+25))
        sheet.save(D/f'{name}-review.jpg',quality=92)
if __name__=='__main__':contacts() if sys.argv[1]=='contacts' else verify(sys.argv[1])
