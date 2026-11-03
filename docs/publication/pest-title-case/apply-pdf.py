"""Correct table-label case with the original embedded font and exact page geometry."""
from pathlib import Path
from collections import Counter
import ast,hashlib,json,logging,importlib.util
import pdfplumber
from pypdf import PdfReader,PdfWriter,PageObject
from pypdf.generic import ContentStream,ByteStringObject,FloatObject,NameObject,NumberObject,ArrayObject
from pypdf._cmap import get_encoding
ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).parent
OUT=ROOT/'output/pdf/pest-title-case/corrected-guide-pages.pdf';OUT.parent.mkdir(parents=True,exist_ok=True)
logging.getLogger('pdfminer').setLevel(logging.ERROR)
assert not (D/'PDF-CHECKS.json').exists(),'Completed correction is frozen; use a new revision'
plan=json.loads((D/'PDF-PLAN.json').read_text());sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
for p,h in plan['inputs'].items():assert sha(p)==h,p
spec=importlib.util.spec_from_file_location('reference',ROOT/'scripts/lib/pdf-reference-text.py');ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
tree=ast.parse((ROOT/'scripts/assemble-whole-book-preview.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='mult'],type_ignores=[]),'matrix','exec'))
# Copy an exact matching glyph from another subset of the SAME embedded font.
# Only this bounded case correction accepts letters; the numeric-reference helper stays strict.
source=ast.parse((ROOT/'scripts/lib/pdf-reference-text.py').read_text())
fn=next(n for n in source.body if isinstance(n,ast.FunctionDef) and n.name=='complete_font')
for n in ast.walk(fn):
 if isinstance(n,ast.Assert) and isinstance(n.test,ast.Compare) and isinstance(n.test.left,ast.Name) and n.test.left.id=='char':
  n.test=ast.parse("char.isalpha() or char in ' -()&/'",mode='eval').body
font_glyphs=ref.font_glyphs
exec(compile(ast.fix_missing_locations(ast.Module(body=[fn],type_ignores=[])),'case-only font completion','exec'))
readers={p:PdfReader(ROOT/p) for p in plan['inputs']};donors=[f for r in readers.values() for f in ref.embedded_fonts(r)]

def replace(obj,pdf,targets,cm=None):
 cm=list(cm or [1,0,0,1,0,0]);stack=[];tm=[1,0,0,1,0,0]
 stream=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
 resources=obj.get('/Resources',{});fonts={k:v.get_object() for k,v in resources.get('/Font',{}).items()};maps={k:get_encoding(v) for k,v in fonts.items()}
 active=None;size=None;runs=[];blocks=[]
 for i,(args,op) in enumerate(stream.operations):
  if op==b'q':stack.append(cm[:])
  elif op==b'Q':cm=stack.pop()
  elif op==b'cm':cm=mult(list(map(float,args)),cm)
  elif op==b'BT':runs=[];tm=[1,0,0,1,0,0]
  elif op==b'Tf':active,size=args[0],float(args[1])
  elif op==b'Tm':tm=list(map(float,args))
  elif op in [b'Td',b'TD']:tm=mult([1,0,0,1,float(args[0]),float(args[1])],tm)
  elif op==b'Tj':
   enc,mapping=maps[active];v=args[0];raw=v.original_bytes if isinstance(v,str) else bytes(v)
   coded=raw.decode(enc) if isinstance(enc,str) else ''.join(enc.get(b,chr(b)) for b in raw)
   text=''.join(mapping.get(c,c) for c in coded);runs.append((i,text,active,size,mult(tm,cm)[4:]))
  elif op==b'TJ':raise AssertionError('Unexpected kerned array; inspect before editing')
  elif op==b'ET' and runs:
   text=''.join(r[1] for r in runs);x,y=runs[0][4]
   found=[t for t in targets if t['old']==text and abs(t['x']-x)<.03 and abs(t['y']-y)<.03]
   assert len(found)<=1
   if found:blocks.append((runs[:],found[0]))
  elif op==b'Do':
   form=resources['/XObject'][args[0]].get_object()
   if form.get('/Subtype')=='/Form':replace(form,pdf,targets,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
 for runs,t in reversed(blocks):
  assert not t.get('replaced'),t
  first,last=runs[0][0],runs[-1][0];fontkey,size=runs[0][2:4]
  assert all(r[2:4]==(fontkey,size) for r in runs)
  font=fonts[fontkey];assert font['/Subtype']=='/Type3'
  complete_font(font,t['new'],donors,pdf);reverse={c:b for c,(b,n) in font_glyphs(font).items()}
  encoded=bytes(reverse[c] for c in t['new']);width=sum(float(font['/Widths'][b-int(font['/FirstChar'])]) for b in encoded)*t['size']/1000
  assert t['x']+width<=t['availableRight']-.25,('New label overlaps adjacent text',t,width)
  t['checkRect']=t['rect'][:];t['checkRect'][2]=max(t['rect'][2],t['x']+width)
  assert all(op in [b'Tj',b'Td'] for args,op in stream.operations[first:last+1])
  stream.operations[first:last+1]=[([ByteStringObject(encoded)],b'Tj')]
  t['replaced']=True;t['newWidthPt']=width
 if blocks:
  if isinstance(obj,PageObject):obj.replace_contents(stream)
  else:obj.set_data(stream.get_data())

writer=PdfWriter();clones=[]
for p in plan['pages']:
 clone=PdfWriter();clones.append(clone);page=clone.add_page(readers[p['source']].pages[p['sourcePage']-1]);page.pop('/Annots',None)
 targets=[line for label in p['labels'] for line in label['lines'] if line['old']!=line['new']]
 with pdfplumber.open(ROOT/p['source']) as old_doc:
  old_page=old_doc.pages[p['sourcePage']-1]
  for t in targets:
   following=[c['x0'] for c in old_page.chars if not c['text'].isspace() and c['x0']>=t['rect'][2]-.01 and abs(c['matrix'][5]-t['y'])<.1]
   t['availableRight']=min(following) if following else old_page.width-22
 replace(page,clone,targets);assert all(t.get('replaced') for t in targets),('Missing replacements',p['key'],[t['old'] for t in targets if not t.get('replaced')])
 writer.add_page(page);p['replacementPage']=len(writer.pages)
 print(p['key'],len(targets),'lines',flush=True)
writer.add_metadata({'/Title':'The Vegetable Guru — sentence-case Pests & diseases labels','/Author':'John Lennon','/Subject':'Native practical-page derivatives. Case only; source bodies and embedded font retained.'});writer.write(OUT)

sig=lambda c:(c['text'],round(c['x0'],3),round(c['top'],3),round(c['size'],3),str(c.get('non_stroking_color')))
def label_chars(page,lines):
 return [c for c in page.chars if any(t['rect'][0]-.02<=c['x0'] and c['x1']<=t.get('checkRect',t['rect'])[2]+.02 and t['rect'][1]-.02<=c['top']<=t['rect'][3]+.02 for t in lines)]
checks=[]
with pdfplumber.open(OUT) as after:
 for p in plan['pages']:
  with pdfplumber.open(ROOT/p['source']) as doc:
   old=doc.pages[p['sourcePage']-1];new=after.pages[p['replacementPage']-1]
   targets=[l for label in p['labels'] for l in label['lines'] if l['old']!=l['new']]
   assert Counter(map(sig,old.chars))-Counter(map(sig,label_chars(old,targets)))==Counter(map(sig,new.chars))-Counter(map(sig,label_chars(new,targets))),('Body changed outside labels',p['key'])
   for t in targets:
    cs=label_chars(new,[t]);assert ''.join(c['text'] for c in cs)==t['new'],(p['key'],t,''.join(c['text'] for c in cs))
    assert all(abs(c['size']-t['size'])<.02 and c['non_stroking_color']==tuple(t['colour']) and c['fontname']==t['font'] for c in cs)
    assert abs(cs[0]['x0']-t['x'])<.02 and abs(cs[0]['matrix'][5]-t['y'])<.02
   images=lambda page:[(i['x0'],i['top'],i['x1'],i['bottom'],i['srcsize'],hashlib.sha256(i['stream'].get_data()).hexdigest()) for i in page.images]
   assert images(old)==images(new),('Image changed',p['key'])
   checks.append({'key':p['key'],'folio':p['folio'],'labels':len(p['labels']),'changedLabels':sum(l['old']!=l['new'] for l in p['labels']),'allOtherGlyphsExact':True,'fontSizeColourBaselineRetained':True,'imagesExact':True,'noLabelTextCollision':True})
for p,h in plan['inputs'].items():assert sha(p)==h,p
plan.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),checks=checks)
(D/'PDF-CHECKS.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'pages':len(checks),'changedLabels':sum(c['changedLabels'] for c in checks),'pdf':plan['pdf']}))
