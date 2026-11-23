"""Bounded edits of the approved native book; no rasterised text or artwork redraws."""
from pathlib import Path
from collections import defaultdict,Counter
import importlib.util,json,re,sys,copy,logging,math,html,hashlib,os
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,DictionaryObject,NumberObject,FloatObject,ArrayObject,ByteStringObject,DecodedStreamObject,ContentStream
spec=importlib.util.spec_from_file_location('native_book',Path(__file__).with_name('title-copyright-book-update.py'));u=importlib.util.module_from_spec(spec);spec.loader.exec_module(u)
R=u.R;B=u.B;D=B/'interior-six-fixes-2026-11-22';MM=72/25.4;H=240*MM
logging.getLogger('pdfminer').setLevel(logging.ERROR)
original_signature=u.font_signature;original_codec=u.font_codec
def signature(font):
    if font.get('/Subtype')!='/Type0':return original_signature(font)
    sub=font['/DescendantFonts'][0].get_object();fd=sub['/FontDescriptor'];name=re.sub(r'^/?[A-Z]{6}\+','',str(fd['/FontName']))
    return ('/Type0',name,str(fd.get('/FontWeight')),())
def codec(font):
    if font.get('/Subtype')!='/Type0':return original_codec(font)
    key=id(font)
    if key in u.CODECS:return u.CODECS[key]
    encoding,mapping=u.get_encoding(font);assert isinstance(encoding,str)
    sub=font['/DescendantFonts'][0].get_object();values=sub.get('/W',[]);widths={};j=0
    while j<len(values):
        start=int(values[j]);j+=1
        if isinstance(values[j],list):
            for k,width in enumerate(values[j]):widths[start+k]=float(width)
            j+=1
        else:
            end=int(values[j]);value=float(values[j+1]);j+=2
            for k in range(start,end+1):widths[k]=value
    enc={};out={}
    for k,value in mapping.items():
        if isinstance(k,str) and len(k)==1 and isinstance(value,str) and len(value)==1:
            enc[value]=k.encode(encoding);out[value]=widths.get(ord(k),float(sub.get('/DW',1000)))
    u.CODECS[key]=(enc,out);return enc,out
u.font_signature=signature;u.font_codec=codec
def save(name,data):u.save(D/name,data)
def read(name):return u.read(D/name)
def tag():
    pdf=PdfReader(D/'before-reading.pdf');w=PdfWriter(clone_from=pdf);records={};seen=set();at=1000
    pages=read('before-PAGE-MAP.json')
    for i,p in enumerate(w.pages):
        if pages[i]['folio'] is None:continue
        for obj,path in u.walk(p):
            oid=obj.indirect_reference.idnum if obj.indirect_reference else id(obj)
            if oid in seen:continue
            seen.add(oid);stream,bs=u.blocks(obj,w)
            if stream is None:continue
            starts={b['start']:j for j,b in enumerate(bs)};ends={b['end'] for b in bs};ops=[]
            for j,op in enumerate(stream.operations):
                if j in starts:
                    b=bs[starts[j]];records[at]={'page':i,'folio':pages[i]['folio'],'path':list(path),'block':starts[j],'text':b['text'],'fonts':b['fonts']}
                    ops.append(([NameObject('/Span'),DictionaryObject({NameObject('/MCID'):NumberObject(at)})],b'BDC'));at+=1
                ops.append(op)
                if j in ends:ops.append(([],b'EMC'))
            stream.operations=ops;u.put_stream(obj,stream)
    w.write(D/'tagged.pdf')
    with pdfplumber.open(D/'tagged.pdf') as doc:
        for i,p in enumerate(doc.pages):
            for c in p.chars:
                if c.get('mcid') not in records:continue
                rec=records[c['mcid']];rec.setdefault('chars',[]).append({k:c[k] for k in ['text','matrix','fontname','size','adv','x0','x1','top','bottom','non_stroking_color']})
    for v in records.values():
        cs=v.get('chars',[])
        if cs:v['bbox']=[min(c['x0'] for c in cs),min(c['top'] for c in cs),max(c['x1'] for c in cs),max(c['bottom'] for c in cs)]
    save('TEXT-MAP.json',list(records.values()))
    print('Mapped',len(records),'native text blocks.',flush=True)

def font_at(pdf,rec):
    obj=pdf.pages[rec['page']]
    for k in rec['path']:obj=obj['/Resources']['/XObject'][k].get_object()
    return obj['/Resources']['/Font'][rec['fonts'][0]].get_object()

def text_sizes():
    rows=read('TEXT-MAP.json');pdf=PdfReader(D/'before-reading.pdf');cache={}
    for r in rows:
        key=(r['page'],tuple(r['path']))
        if key not in cache:
            obj=pdf.pages[r['page']]
            for k in r['path']:obj=obj['/Resources']['/XObject'][k].get_object()
            cache[key]=u.blocks(obj,pdf)
        stream,bs=cache[key];b=bs[r['block']]
        sizes=[float(a[1]) for a,op in stream.operations[b['start']:b['end']+1] if op==b'Tf']
        r['tf']=sizes[-1] if sizes else None
        assert r['tf'] is not None
    save('TEXT-MAP.json',rows);print('Native text sizes recorded.')

class Painter:
    def __init__(self,pdf,writer,records):
        self.pdf=pdf;self.writer=writer;self.records=records;self.pool=defaultdict(list);seen=set()
        for page in pdf.pages:
          for obj,_ in u.walk(page):
            for ref in obj.get('/Resources',{}).get('/Font',{}).values():
              f=ref.get_object()
              if id(f) not in seen and f.get('/Subtype') in ['/Type3','/TrueType','/Type0'] and ('/FontDescriptor' in f or f.get('/Subtype')=='/Type0'):
                self.pool[u.font_signature(f)].append(f);seen.add(id(f))
        self.fonts={};self.font_defs={};self.images={};self.ops=[];self.serial=0
        self.kerns={}
        for r in records:
            if not r.get('chars') or not (98<=r['folio']<=144) or not (8.8<r['chars'][0]['size']<9.2 and 'Regular_Regular' in r['chars'][0]['fontname']):continue
            sig=u.font_signature(font_at(pdf,r))
            for a,b in zip(r['chars'],r['chars'][1:]):
                if len(a['text'])==len(b['text'])==1 and abs(a['matrix'][5]-b['matrix'][5])<.1:
                    gap=(b['x0']-a['x1'])/a['size']*1000
                    if abs(gap)<250:self.kerns[(sig,a['text']+b['text'])]=gap
    def choose(self,ref,text):
        f=font_at(self.pdf,self.records[ref]);key=(id(f),''.join(sorted(set(text))))
        if key in self.fonts:return self.fonts[key]
        if f.get('/Subtype')=='/Type1':enc={c:c.encode('cp1252') for c in text};width={}
        else:
            enc,width=u.font_codec(f);needed=set(text)
            if not needed<=set(enc):
                choices=[q for q in self.pool[u.font_signature(f)] if needed<=set(u.font_codec(q)[0])]
                if not choices:
                    choices=[q for sig,fonts in self.pool.items() if sig[1]==u.font_signature(f)[1] for q in fonts if needed<=set(u.font_codec(q)[0]) and all(abs(width[c]-u.font_codec(q)[1][c])<1 for c in set(width)&set(u.font_codec(q)[1]))]
                if choices:f=choices[0]
                elif f['/Subtype']=='/Type3':f=u.extend_type3(f,needed,self.pool,self.writer)
                else:raise AssertionError(('Missing native letters',needed-set(enc),u.font_signature(f)))
                enc,width=u.font_codec(f)
        name='/N'+str(self.serial);self.serial+=1;self.font_defs[NameObject(name)]=f.clone(self.writer).indirect_reference
        self.fonts[key]=(name,enc,width);return self.fonts[key]
    @staticmethod
    def num(v):return f'{float(v):.7f}'.rstrip('0').rstrip('.') or '0'
    def colour(self,c):
        if c is None:c=(0,0,0)
        if not isinstance(c,(list,tuple)):c=(c,)
        return ' '.join(self.num(v) for v in c)+(' g' if len(c)==1 else ' rg' if len(c)==3 else ' k')
    def chars(self,ref,dx=0,dy=0,chars=None):
        r=self.records[ref];chars=r['chars'] if chars is None else chars
        name,enc,_=self.choose(ref,''.join(c['text'] for c in chars))
        for c in chars:
            m=list(c['matrix']);m[4]+=dx;m[5]-=dy
            self.ops.append(f'q {self.colour(c["non_stroking_color"])} BT {name} {self.num(r["tf"])} Tf '+' '.join(self.num(v) for v in m)+' Tm <'+b''.join(enc[v] for v in c['text']).hex()+'> Tj ET Q')
    def text(self,text,ref,size,x,baseline,colour=None,tracking=0,angle=0):
        r=self.records[ref]
        c=colour if colour is not None else r['chars'][0]['non_stroking_color'];a=math.cos(angle);b=math.sin(angle)
        sig=u.font_signature(font_at(self.pdf,r));advance=0
        for i,v in enumerate(text):
            name,enc,width=self.choose(ref,v)
            self.ops.append(f'q {self.colour(c)} BT {name} {self.num(size)} Tf {self.num(a)} {self.num(b)} {self.num(-b)} {self.num(a)} {self.num(x+advance*a)} {self.num(H-baseline+advance*b)} Tm <'+enc[v].hex()+'> Tj ET Q')
            advance+=width.get(v,500)*size/1000
            if i+1<len(text):
                advance+=self.kerns.get((sig,v+text[i+1]),0)*size/1000+tracking
        return advance
    def shape(self,s,dy=0,delta=0,bottom=None):
        cmds=['q',self.colour(s.get('non_stroking_color'))]
        if s.get('stroke'):
            cmds.append(self.colour(s.get('stroking_color')).replace(' rg',' RG').replace(' g',' G').replace(' k',' K'));cmds.append(self.num(s['linewidth'])+' w')
        for op in s['path']:
            coords=[]
            for x,y in op[1:]:coords.extend([x,H-y-dy-(delta if bottom is not None and y>bottom-14 else 0)])
            cmds.append(' '.join(self.num(v) for v in coords)+(' ' if coords else '')+op[0])
        cmds.append(('B' if s.get('stroke') else 'f')+('*' if s.get('evenodd') else '') if s.get('fill') else 'S');cmds.append('Q');self.ops.append(' '.join(cmds))
    def rect(self,x,y,w,h,colour):self.ops.append(f'q {self.colour(colour)} {self.num(x)} {self.num(H-y-h)} {self.num(w)} {self.num(h)} re f Q')
    def image(self,pi,im,dy=0):
        found=[]
        for obj,_ in u.walk(self.pdf.pages[pi]):
            for k,v in obj.get('/Resources',{}).get('/XObject',{}).items():
                if str(k)=='/'+im['name'] and v.get_object().get('/Subtype')=='/Image':found.append(v.get_object())
        assert len(found)==1,(pi,im['name'],len(found))
        name=NameObject('/Image'+str(len(self.images)));self.images[name]=found[0].clone(self.writer).indirect_reference
        self.ops.append('q /Multiply gs '+ ' '.join(self.num(v) for v in [im['width'],0,0,im['height'],im['x0'],H-im['bottom']-dy])+f' cm {name} Do Q')
    def rounded(self,x,y,w,h,c,r=5):
        k=.55228475*r;top=H-y;bottom=top-h
        self.ops.append(f'q {self.colour(c)} '+ ' '.join([
            f'{x+r} {bottom} m {x+w-r} {bottom} l',f'{x+w-r+k} {bottom} {x+w} {bottom+r-k} {x+w} {bottom+r} c',
            f'{x+w} {top-r} l {x+w} {top-r+k} {x+w-r+k} {top} {x+w-r} {top} c',
            f'{x+r} {top} l {x+r-k} {top} {x} {top-r+k} {x} {top-r} c',
            f'{x} {bottom+r} l {x} {bottom+r-k} {x+r-k} {bottom} {x+r} {bottom} c h f Q']))
    def finish(self,page):
        stream=DecodedStreamObject();stream.set_data(('\n'.join(self.ops)+'\n').encode('ascii'))
        page[NameObject('/Contents')]=self.writer._add_object(stream)
        multiply=DictionaryObject({NameObject('/Type'):NameObject('/ExtGState'),NameObject('/BM'):NameObject('/Multiply')})
        page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject(self.font_defs),NameObject('/XObject'):DictionaryObject(self.images),NameObject('/ExtGState'):DictionaryObject({NameObject('/Multiply'):multiply})})
        self.ops=[];self.images={}

def reconstruction_test():
    records=read('TEXT-MAP.json');pdf=PdfReader(D/'before-reading.pdf');w=PdfWriter();out=w.add_page(pdf.pages[99]);painter=Painter(pdf,w,records)
    with pdfplumber.open(D/'before-reading.pdf') as pl:
        p=pl.pages[99]
        for s in p.rects+p.curves+p.lines:painter.shape(s)
        for im in p.images:painter.image(99,im)
    for i,r in enumerate(records):
        if r['page']==99 and r.get('chars'):painter.chars(i)
    painter.finish(out);w.write(D/'reconstruction-test.pdf')
    import pypdfium2 as pdfium
    doc=pdfium.PdfDocument(D/'reconstruction-test.pdf');doc[0].render(scale=1.5).to_pil().save(D/'reconstruction-test.png')
    print('Reconstructed first Troubles page with original vector glyphs and images.')

def trouble_plan(gap_adjust=0):
    """Reflow the three labels within source-bound diagnostic geometry."""
    u.CODECS.clear();u.ENCODINGS.clear()
    recs=read('TEXT-MAP.json');pdf=PdfReader(D/'before-reading.pdf')
    bypage=defaultdict(list)
    for i,r in enumerate(recs):
        if r.get('chars'):bypage[r['page']].append((i,r))
    checks=u.read(R/'docs/publication/troubles-rollout/CHECKS.json')
    masks=u.read(R/'src/print/book/troubleMasks.json')['groups']
    metrics={};kern={}
    for i,r in enumerate(recs):
        if not (98<=r['folio']<=144) or not r.get('chars'):continue
        f=font_at(pdf,r)
        if '/FontDescriptor' not in f:continue
        sig=u.font_signature(f);enc,width=u.font_codec(f)
        metrics.setdefault(sig,{}).update(width)
        if not (8.8<r['chars'][0]['size']<9.2 and 'Regular_Regular' in r['chars'][0]['fontname']):continue
        for a,b in zip(r['chars'],r['chars'][1:]):
            if len(a['text'])!=1 or len(b['text'])!=1 or abs(a['matrix'][5]-b['matrix'][5])>.1:continue
            fs=a['size'];gap=(b['x0']-a['x1'])/fs*1000
            if abs(gap)<250:kern[(sig,a['text']+b['text'])]=gap
    def measure(text,ref,size,tracking=0):
        sig=u.font_signature(font_at(pdf,recs[ref]));width=metrics[sig]
        return sum(width[c]*size/1000 for c in text)+sum(kern.get((sig,a+b),0)*size/1000 for a,b in zip(text,text[1:]))+max(0,len(text)-1)*tracking
    results=[]
    with pdfplumber.open(D/'before-reading.pdf') as pl:
      for group in checks['results']:
        if group['units']!='imperial':continue
        markup=(R/f'docs/publication/troubles-rollout/{group["key"]}-imperial.html').read_text()
        for page in group['pages']:
            folio=page['folio']-2;pi=folio+1;p=pl.pages[pi];entries=[]
            for entry in page['entries']:
                x0=entry['leftPx']*.75;x1=entry['rightPx']*.75;y0=entry['topPx']*.75;y1=entry['bottomPx']*.75
                rows=[(i,r) for i,r in bypage[pi] if x0-1<=(r['bbox'][0]+r['bbox'][2])/2<=x1+1 and y0-1<=(r['bbox'][1]+r['bbox'][3])/2<y1+.5]
                labels=sorted([(i,r) for i,r in rows if r['text'] in ['RECOGNISE','ACT','PREVENT']],key=lambda t:t[1]['bbox'][1])
                assert 1<=len(labels)<=3,(folio,entry['key'],len(labels))
                m=re.search(r'<article[^>]*data-key="'+re.escape(entry['key'])+r'".*?</article>',markup,re.S);assert m
                source={name:html.unescape(re.sub('<[^>]*>','',txt)) for name,txt in re.findall(r'<section class="(recognise|act|prevent)">.*?<p>(.*?)</p></section>',m.group(),re.S)}
                images=[im for im in p.images if x0<im['x0']+im['width']/2<x1 and y0<im['top']+im['height']/2<y1+1]
                assert len(images)==1,(folio,entry['key'],len(images))
                im=images[0];canvas_x=im['x0']-(101.25-im['width'])/2;canvas_y=im['top']-(118.125-im['height'])/2
                mask=next(m for m in masks[group['key']] if m['key']==entry['key']);svg=(R/mask['url'].lstrip('/')).read_text()
                points=[tuple(float(v)*.9375 for v in pair.split(',')) for pair in re.search(r'points="([^"]+)"',svg)[1].split()]
                bm=Image.new('1',(406,474));ImageDraw.Draw(bm).polygon([(round(x*4),round(y*4)) for x,y in points],fill=1)
                ar=np.asarray(bm);left=[float(np.flatnonzero(row)[0])/4 if row.any() else math.inf for row in ar]
                content_left=x0+(8.25 if entry['featured'] else 0);content_right=x1-(8.25 if entry['featured'] else 0)
                def edge(baseline):
                    top=baseline-9;bottom=baseline+2.25;radius=4*MM;bound=content_right
                    for iy in range(max(0,int((top-canvas_y-radius)*4)),min(len(left),int((bottom-canvas_y+radius)*4)+1)):
                        yy=canvas_y+iy/4;dy=max(top-yy,yy-bottom,0)
                        if dy<=radius:bound=min(bound,canvas_x+left[iy]-math.sqrt(radius*radius-dy*dy))
                    return bound
                paragraphs=[];exclude=[];last_new=None;last_old=None
                for n,(li,label) in enumerate(labels):
                    start=H-label['chars'][0]['matrix'][5];stop=H-labels[n+1][1]['chars'][0]['matrix'][5] if n<len(labels)-1 else y1+1
                    body=[(i,r) for i,r in rows if 8.8<r['chars'][0]['size']<9.2 and start-.5<=H-r['chars'][0]['matrix'][5]<stop-.5]
                    body.sort(key=lambda t:(H-t[1]['chars'][0]['matrix'][5],t[1]['bbox'][0]));assert body,(folio,entry['key'],n)
                    sourcekey={'RECOGNISE':'recognise','ACT':'act','PREVENT':'prevent'}[label['text']];text=source[sourcekey]
                    assert re.sub(r'\s+','',text)==re.sub(r'\s+','',''.join(r['text'] for _,r in body)),(folio,entry['key'],'body mismatch')
                    old_end=max(H-r['chars'][0]['matrix'][5] for _,r in body)
                    baseline=start if last_new is None else last_new+max(11.25+3-gap_adjust,start-last_old-gap_adjust)
                    labeltext={'RECOGNISE':'IDENTIFICATION','ACT':'FIX','PREVENT':'PREVENTION'}[label['text']];labelsize=label['chars'][0]['size'];bodyref=body[0][0]
                    labelw=measure(labeltext,li,labelsize,.15);words=text.split();lines=[];first=True
                    original_edges={round(H-r['chars'][0]['matrix'][5],2):r['bbox'][2] for _,r in body}
                    while words:
                        right=edge(baseline)
                        # The original text is a second, exact source of safe line widths.
                        for yy,xx in original_edges.items():
                            if abs(yy-baseline)<.1:right=max(right,xx+.1)
                        tx=content_left+(labelw+(6 if sourcekey=='act' else 3)) if first else content_left
                        available=right-tx
                        take=[]
                        while words and measure(' '.join(take+[words[0]]),bodyref,9)<=available+.05:take.append(words.pop(0))
                        if not take:
                            assert first,(folio,entry['key'],'single word cannot fit',words[0],available)
                            lines.append({'text':'','x':tx,'baseline':baseline,'right':right});baseline+=11.25;first=False;continue
                        lines.append({'text':' '.join(take),'x':tx,'baseline':baseline,'right':right});baseline+=11.25;first=False
                    end=lines[-1]['baseline'];last_new=end;last_old=old_end
                    paragraphs.append({'label':labeltext,'labelRef':li,'labelSize':labelsize,'bodyRef':bodyref,'x':content_left,'baseline':lines[0]['baseline'],'labelWidth':labelw,'lines':lines,'oldText':text,'oldStart':start,'oldEnd':old_end})
                    exclude.extend([li]+[i for i,_ in body])
                delta=max(last_new-last_old,canvas_y+118.125+(12 if entry['featured'] else 3.75)-y1)
                entries.append({'key':entry['key'],'featured':entry['featured'],'bbox':[x0,y0,x1,y1],'newHeight':y1-y0+delta,'heightDelta':delta,'paragraphs':paragraphs,'removeBlocks':exclude,'allBlocks':[i for i,_ in rows],'image':{k:im[k] for k in ['x0','x1','top','bottom','width','height','name']}})
            for col in page['columns']:
                dy=0
                selected=[next(e for e in entries if e['key']==key) for key in col['keys']]
                if not selected:continue
                end=selected[-1]['bbox'][3]+sum(e['heightDelta'] for e in selected)
                extra=max(0,end-(page['footerTopPx']*.75-3.5*MM))
                gap_reduction=extra/max(1,len(selected)-1)
                gap_reduction=min(3,gap_reduction)
                for j,key in enumerate(col['keys']):
                    e=next(e for e in entries if e['key']==key);e['shiftY']=dy;dy+=e['heightDelta']
                    e['shiftY']-=gap_reduction*j;e['gapAfterPt']=6-gap_reduction
            bottom=max(e['bbox'][3]+e['shiftY']+e['heightDelta'] for e in entries);clearance=(page['footerTopPx']*.75-bottom)/MM
            result={'page':pi,'folio':folio,'group':group['key'],'entries':entries,'columns':page['columns'],'footerTopPt':page['footerTopPx']*.75,'footerClearanceMm':clearance,'originalFooterClearanceMm':page['footerClearanceMm']};results.append(result)
            print(f'{folio}: {len(entries)} entries, footer clearance {clearance:.1f} mm',flush=True)
    save('TROUBLES-REFLOW.json',results)
    print('Minimum footer clearance',min(r['footerClearanceMm'] for r in results),flush=True)

def adaptive_plan():
    variants=[]
    for gap in [0,.75,1.5,2]:
        trouble_plan(gap);result=read('TROUBLES-REFLOW.json')
        for p in result:
            for e in p['entries']:e['paragraphGapReductionPt']=gap
        variants.append(result)
    result=variants[0]
    for j,p in enumerate(result):
        for i,e in enumerate(p['entries']):p['entries'][i]=min([v[j]['entries'][i] for v in variants],key=lambda q:(q['newHeight'],q['paragraphGapReductionPt']))
        for col in p['columns']:
            selected=[next(e for e in p['entries'] if e['key']==key) for key in col['keys']]
            if not selected:continue
            end=selected[-1]['bbox'][3]+sum(e['heightDelta'] for e in selected);extra=max(0,end-(p['footerTopPt']-3.5*MM));reduction=extra/max(1,len(selected)-1)
            assert reduction<=3,(p['folio'],'Remaining column overflow',reduction)
            dy=0
            for n,e in enumerate(selected):e['shiftY']=dy-reduction*n;e['gapAfterPt']=6-reduction;dy+=e['heightDelta']
        p['footerClearanceMm']=(p['footerTopPt']-max(e['bbox'][3]+e['heightDelta']+e['shiftY'] for e in p['entries']))/MM
    save('TROUBLES-REFLOW.json',result);print('Adaptive fit complete; minimum footer gap',min(p['footerClearanceMm'] for p in result))

def simple_plan():
    rows=read('TEXT-MAP.json');pages=read('before-PAGE-MAP.json');remove=[];moves=[];text=[];regions=defaultdict(list);counts=Counter()
    for folio in range(8,96):
        rs=[(i,r) for i,r in enumerate(rows) if r['folio']==folio and r.get('chars')]
        if folio%2:
            prefix=[(i,r) for i,r in rs if r['text'].startswith('Growing guide')];assert len(prefix)==1,(folio,len(prefix))
            i,r=prefix[0];assert r['text'] in ['Growing guide · ','Growing guide ·'];remove.append(i)
            crop=[(j,s) for j,s in rs if j>i and abs(s['bbox'][1]-r['bbox'][1])<.2 and s['chars'][0]['size']>18];assert len(crop)==1,(folio,crop)
            j,s=crop[0];remove.append(j);moves.append({'ref':j,'dx':r['bbox'][0]-s['bbox'][0],'dy':0});counts['vegetablePracticalTitles']+=1
            regions[r['page']].append([r['bbox'][0]-2,r['bbox'][1]-2,s['bbox'][2]+2,s['bbox'][3]+2])
        else:
            dots=[(i,r) for i,r in rs if r['text']=='.' and r['bbox'][1]<100];assert len(dots)==5,(folio,len(dots))
            visible=[(i,r) for i,r in dots if min(r['chars'][0]['non_stroking_color'])<.7];assert len(visible)==1
            i,r=visible[0];preceding=rows[dots[0][0]-1];dx=max(2,preceding['bbox'][2]+2-r['bbox'][0])
            remove.extend(j for j,_ in dots);moves.append({'ref':i,'dx':dx,'dy':-math.tan(math.radians(4))*dx});counts['vegetableTitleDots']+=1
            regions[r['page']].append([min(s['bbox'][0] for _,s in dots)-2,min(s['bbox'][1] for _,s in dots)-3,max(s['bbox'][2] for _,s in dots)+dx+2,max(s['bbox'][3] for _,s in dots)+3])
    for folio,part in [(7,1),(97,2),(145,3)]:
        ref=next(i for i,r in enumerate(rows) if r['folio']==folio and r['text'] in ['Vegetable','Growing'])
        style=next(i for i,r in enumerate(rows) if r.get('chars') and r['text']=='VEGETABLE GUIDES' and 'Black' in r['chars'][0]['fontname'])
        text.append({'page':folio+1,'ref':style,'text':f'PART {part}','size':9,'x':48.19,'baseline':36,'colour':[23/255,62/255,44/255],'tracking':.75});counts['sectionPartHeaders']+=1
        regions[folio+1].append([47,24,120,39])
    for i,r in enumerate(rows):
        if r['folio'] in [2,3] and r['text'] in ['Vegetable Guides','Vegetable Troubles','Growing Techniques']:
            part={'Vegetable Guides':1,'Vegetable Troubles':2,'Growing Techniques':3}[r['text']]
            remove.append(i);text.append({'page':r['page'],'ref':i,'text':f'Pt {part} · '+r['text'],'size':r['chars'][0]['size'],'x':r['bbox'][0],'baseline':H-r['chars'][0]['matrix'][5]});counts['contentsPartLabels']+=1
            regions[r['page']].append([r['bbox'][0]-1,r['bbox'][1]-2,r['bbox'][0]+182,r['bbox'][3]+2])
    blanks=[i for i,p in enumerate(pages) if p['kind']=='blank'];counts['creamBlankLeaves']=len(blanks)
    save('SIMPLE-PLAN.json',{'remove':remove,'moves':moves,'text':text,'blanks':blanks,'regions':regions,'counts':counts})
    print(json.dumps(counts),flush=True)

def build(kind='reading'):
    source=read('SOURCE.json')
    assert u.sha(D/('before-native.pdf' if kind=='native' else 'before-reading.pdf'))==source['baseline']['sha256' if kind=='native' else 'readingCopySHA256']
    for name,digest in source.get('frozenInputs',{}).items():assert u.sha(R/name)==digest,('Frozen input changed',name)
    records=read('TEXT-MAP.json');plan=read('SIMPLE-PLAN.json');troubles=read('TROUBLES-REFLOW.json');changes={r['page']:r for r in troubles}
    pdf=PdfReader(D/('before-native.pdf' if kind=='native' else 'before-reading.pdf'));w=PdfWriter(clone_from=pdf);paint=Painter(pdf,w,records)
    # Identical page wrappers are shared in the compressed source book. Detach
    # them before merge_page replaces a stream, otherwise later overlays leak.
    for page in w.pages:
        content=page.get_contents()
        if content is not None:
            detached=DecodedStreamObject();detached.set_data(content.get_data());page[NameObject('/Contents')]=w._add_object(detached)
    remove=set(plan['remove']);bypage=defaultdict(list)
    for i,r in enumerate(records):bypage[r['page']].append((i,r))
    with pdfplumber.open(D/('before-native.pdf' if kind=='native' else 'before-reading.pdf')) as pl:
      for pi,page in enumerate(w.pages):
        if pi in plan['blanks']:
            paint.rect(0,0,185*MM,H,[1,248/255,233/255]);paint.finish(page);continue
        if pi in changes:
            change=changes[pi];original=pl.pages[pi];entries=change['entries'];rows=bypage[pi]
            title=next((i,r) for i,r in rows if r.get('chars') and 'Lilita' in r['chars'][0]['fontname'] and r['bbox'][1]<50 and r['text']!='Troubles' and r['chars'][0]['size']>18)
            banner=next((i,r) for i,r in rows if r['text']=='Troubles' and r.get('bbox',[0,999])[1]<50)
            def owner(s):
                if s['width']>300:return None
                cx=(s['x0']+s['x1'])/2;cy=(s['top']+s['bottom'])/2
                return next((e for e in entries if e['bbox'][0]-1<=cx<=e['bbox'][2]+1 and e['bbox'][1]-1<=cy<=e['bbox'][3]+1),None)
            badge_shape=None
            for shape in original.rects+original.curves+original.lines:
                if shape['top']>10 and shape['bottom']<55 and shape['x0']>350 and shape['height']>12:badge_shape=shape;continue
                e=owner(shape)
                if e:
                    # Action-label lozenges are redrawn at the new paragraph positions.
                    if shape['width']<40 and shape['height']<16:continue
                    panel=e['featured'] and shape['height']>100 and shape['width']>150
                    paint.shape(shape,e['shiftY'],e['heightDelta'] if panel else 0,e['bbox'][3] if panel else None)
                else:paint.shape(shape)
            for im in original.images:
                e=owner(im);assert e
                paint.image(pi,im,e['shiftY'])
            excluded={i for e in entries for i in e['removeBlocks']}|{banner[0]}
            for i,r in rows:
                if not r.get('chars') or i in excluded:continue
                e=next((e for e in entries if i in e['allBlocks']),None);paint.chars(i,dy=e['shiftY'] if e else 0)
            ti,tr=title;last=tr['chars'][-1];size=tr['tf']*math.hypot(last['matrix'][0],last['matrix'][1]);tx=tr['bbox'][2]+size*.23
            width=paint.text('troubles',ti,size,tx,H-last['matrix'][5],tracking=-.375)
            assert badge_shape is not None and tx+width<badge_shape['x0']-8,('Title/banner overlap',pi)
            bi,br=banner;deep=badge_shape['non_stroking_color'];right=badge_shape['x1'];left=right-76;top=17
            paint.rounded(left,top,76,35,deep,8)
            for word,baseline in [('Vegetable',30),('troubles',43)]:
                fs=12.;tw=sum(paint.choose(bi,c)[2][c]*fs/1000 for c in word)
                paint.text(word,bi,fs,left+(76-tw)/2,baseline)
            for e in entries:
                for para in e['paragraphs']:
                    dy=e['shiftY'];labelx=para['x']+(3 if para['label']=='FIX' else 0);baseline=para['baseline']+dy
                    if para['label']=='FIX':
                        old=next(s for s in original.curves+original.rects if s['width']<40 and s['height']<16 and abs(s['top']-(para['oldStart']-9))<7 and abs(s['x0']-para['x'])<5)
                        paint.rounded(para['x'],baseline-9,para['labelWidth']+6,11,old['non_stroking_color'],2)
                    paint.text(para['label'],para['labelRef'],para['labelSize'],labelx,baseline,tracking=.15)
                    for line in para['lines']:
                        if line['text']:paint.text(line['text'],para['bodyRef'],9,line['x'],line['baseline']+dy)
            paint.finish(page)
        else:
            for obj,path in u.walk(page):
                selected={r['block'] for i,r in bypage[pi] if i in remove and tuple(r['path'])==path}
                if not selected:continue
                stream,bs=u.blocks(obj,w)
                suppressed=set(j for k in selected for j in range(bs[k]['start'],bs[k]['end']+1))
                stream.operations=[op for j,op in enumerate(stream.operations) if j not in suppressed];u.put_stream(obj,stream)
            for move in plan['moves']:
                if records[move['ref']]['page']==pi:paint.chars(move['ref'],move['dx'],move['dy'])
            for t in plan['text']:
                if t['page']==pi:paint.text(**{k:v for k,v in t.items() if k!='page'})
            if paint.ops:
                # Merge a native text-only overlay without touching existing page content.
                overlay=u.PageObject.create_blank_page(width=185*MM,height=H);paint.finish(overlay);page.merge_page(overlay)
        if (pi+1)%20==0:print(f'{kind}: regenerated through PDF page {pi+1}',flush=True)
    target=D/f'updated-{kind}.pdf';w.compress_identical_objects(remove_duplicates=True,remove_unreferenced=False);w.write(target)
    save(kind.upper()+'-BUILD.json',{'file':str(target.relative_to(R)),'sha256':u.sha(target),'bytes':target.stat().st_size,'pages':len(w.pages)})
    print('Saved',target.name,flush=True)

if __name__=='__main__':{'tag':tag,'sizes':text_sizes,'trouble-plan':trouble_plan,'adaptive-plan':adaptive_plan,'simple-plan':simple_plan,'test':reconstruction_test,'build':lambda:build(sys.argv[2] if len(sys.argv)>2 else 'reading')}[sys.argv[1]]()
