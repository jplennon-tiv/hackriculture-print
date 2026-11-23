from pathlib import Path
from collections import defaultdict,Counter
import hashlib,json
from pypdf import PdfReader
from pypdf.generic import ContentStream
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[4]
r=PdfReader(ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf')
seen=set();fonts={};problems=[];font_names=defaultdict(set);counts=Counter();glyph_count=0

def walk(o):
 global glyph_count
 if hasattr(o,'idnum'):
  key=(o.idnum,o.generation)
  if key in seen:return
  seen.add(key);o=o.get_object()
 if isinstance(o,dict):
  if o.get('/Type')=='/Font' and o.get('/Subtype')!='/Type0':
   subtype=str(o.get('/Subtype'));counts[subtype]+=1
   if subtype=='/Type3':
    for name,ref in o.get('/CharProcs',{}).items():
     proc=ref.get_object();ops=ContentStream(proc,r).operations;glyph_count+=1
     if not ops or ops[0][1] not in (b'd0',b'd1'):problems.append('Type3 width operator not first: '+str(name))
   else:
    fd=o.get('/FontDescriptor',{}).get_object();keys=[k for k in ('/FontFile','/FontFile2','/FontFile3') if k in fd]
    if not keys:problems.append('Font missing program: '+str(o.get('/BaseFont')))
    for k in keys:
     data=fd[k].get_object().get_data();font_names[str(o.get('/BaseFont'))].add(hashlib.sha256(data).hexdigest())
     if k=='/FontFile2':
      if len(data)<12:problems.append('Truncated SFNT header');continue
      num=int.from_bytes(data[4:6],'big')
      if 12+16*num>len(data):problems.append('Truncated SFNT directory');continue
      for i in range(num):
       ent=data[12+16*i:28+16*i];off=int.from_bytes(ent[8:12],'big');length=int.from_bytes(ent[12:16],'big')
       if off+length>len(data):problems.append('SFNT table outside file '+ent[:4].decode(errors='replace'))
  for k,v in o.items():
   if k!='/Parent':walk(v)
 elif isinstance(o,list):
  for v in o:walk(v)
walk(r.trailer['/Root'])
collisions={k:sorted(v) for k,v in font_names.items() if len(v)>1}
report={'fontResourcesBySubtype':dict(counts),'type3GlyphProgramsChecked':glyph_count,'type3WidthOperatorsFirst':not any('width operator' in p for p in problems),'conflictingEmbeddedProgramsWithSamePDFBaseFontName':collisions,'issues':problems,'independentPopplerFontRows':len((DOC/'POPPLER-FONTS.txt').read_text().splitlines())-2,'popplerErrorsBytes':(DOC/'POPPLER-ERRORS.txt').stat().st_size}
(DOC/'FONT-STRUCTURE.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));assert not problems and not collisions
