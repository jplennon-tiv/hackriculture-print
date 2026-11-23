from pathlib import Path
from collections import Counter,defaultdict
import hashlib,json
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[5];DOC=Path(__file__).resolve().parent
files={'accepted_first':'output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf','optimised_x3':'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3-Optimised.pdf','x1a':'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX1a.pdf'}
results={}
for label,path in files.items():
 r=PdfReader(ROOT/path);fonts={};pages=defaultdict(set)
 def visit(res,n,seen):
  if hasattr(res,'get_object'):res=res.get_object()
  for key,ref in res.get('/Font',{}).items():
   f=ref.get_object();i=ref.idnum;fonts[i]=f;pages[i].add(n)
  for ref in res.get('/XObject',{}).values():
   i=ref.idnum
   if i in seen:continue
   seen.add(i);obj=ref.get_object()
   if obj.get('/Subtype')=='/Form':visit(obj.get('/Resources',{}),n,seen)
 for n,page in enumerate(r.pages,1):visit(page.get('/Resources',{}),n,set())
 unnamed=[];groups=Counter();programs={};sample={}
 for i,f in fonts.items():
  typ=str(f.get('/Subtype'));name=f.get('/BaseFont');groups[(typ,'unnamed' if not name else 'named')]+=1
  if not name:
   unnamed.append(i)
   if typ not in sample:sample[typ]={'objectID':i,'keys':sorted(str(k) for k in f),'folios':sorted(pages[i]),'charProcCount':len(f.get('/CharProcs',{})),'selfContainedCharProcs':bool(f.get('/CharProcs'))}
  if typ=='/Type3':
   g=[hashlib.sha256(ref.get_object().get_data()).hexdigest() for ref in f.get('/CharProcs',{}).values()]
   programs[i]={'glyphProgramHashes':sorted(g),'folios':sorted(pages[i])}
 results[label]={'file':path,'fontResourceCount':len(fonts),'nameGroups':{f'{t} {n}':c for (t,n),c in groups.items()},'unnamedResources':len(unnamed),'unnamedExamples':sample,'type3GlyphSets':programs}
 print(label,{k:v for k,v in results[label].items() if k not in ('type3GlyphSets','unnamedExamples')},flush=True)
# Do not infer the supplier's Unknown label identifies a unique object.
results['interpretation']='All unnamed font resources are self-contained Type3 fonts. Poppler calls them embedded; Bookvault reported one key font Unknown as unembedded. This points towards Type3 handling/grouping but does not identify a specific object or prove the supplier cause. The accepted October file also contains unnamed Type3 fonts.'
(DOC/'UNNAMED-FONT-INVESTIGATION.json').write_text(json.dumps(results,indent=2)+'\n')
