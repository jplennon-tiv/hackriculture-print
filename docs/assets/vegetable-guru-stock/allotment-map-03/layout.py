"""Map 03. Hand traces on the registered shed-up mosaic, expressed on its half-size grid.
Origin and metric units match the inherited slab datum. Source coordinates are approximate.
"""
from pathlib import Path
import json
OUT = Path(__file__).resolve().parent
PACK = OUT.parent / 'allotment-handover-2026-11-19'
P = PACK / 'atlas/source'
REG = OUT.parents[1] / 'garden-media-library/local-references'
METRES_PER_UNIT = .46
SLAB_METRES = .45
SLAB = SLAB_METRES / METRES_PER_UNIT
PAVING_Y = 21.25
def ground(u,v):
    return ((u-90)/25, 35-v/25)
def traced(points):
    return [ground(*pt) for pt in points]
def footprint(x1,y1,x2,y2):
    x,y=ground(x1,y2)
    return (x,y,(x2-x1)/25,(y2-y1)/25)
SHED_RECT=(86,140,163,245)
SHED=footprint(*SHED_RECT)
NEIGHBOUR_RECT=(461,140,521,216)
HOOPS=[(458,525,v) for v in (515,556,597)]
# Schematic crop rows within the two planted bands.
CROP_ROWS=[(159,369,480),(159,369,497),(202,379,259),(202,379,275),(202,379,291)]
BIN=ground(101,743)
# The cover polygons describe March. Perimeter colours refer to the inner edge of grass.
patches=[
 ('Long grass at the hoops','grass',[(399,126),(453,122),(450,330),(440,520),(438,714),(443,925),(391,934),(390,798),(392,540),(396,329)]),
 ('Long grass at the shed and barrel','grass',[(7,139),(88,138),(89,340),(85,444),(78,625),(70,797),(66,957),(14,969),(12,814),(14,620),(13,410)]),
 ('Grass across the back of the shed','grass',[(8,73),(87,72),(230,69),(271,73),(310,66),(454,66),(453,126),(400,125),(273,131),(163,141),(86,139),(7,149)]),
 ('Grass at the barrel end','grass',[(15,952),(67,955),(133,950),(228,944),(395,923),(444,922),(451,1049),(393,1071),(131,1108),(12,1125)]),
 ('March growing ground','soil',[(87,139),(161,141),(274,130),(401,125),(397,340),(392,530),(392,712),(390,925),(225,945),(68,956),(74,760),(80,625),(83,458),(90,340)]),
 ('Paving area','paving',[(90,246),(188,246),(188,344),(90,344)]),
 ('Shed-end covered bed, light','fleece',[(271,131),(400,125),(398,214),(271,217)]),
 ('Shed-end covered bed, dark','cover',[(199,136),(271,131),(270,218),(198,218)]),
 ('Mixed cover, dark','cover',[(135,337),(316,331),(301,429),(137,433)]),
 ('Mixed cover, light','fleece',[(316,331),(396,326),(392,429),(301,429)]),
 ('Covered bed beside planted row','cover',[(148,542),(382,538),(389,611),(141,615)]),
 ('Middle covered bed','cover',[(141,627),(389,626),(388,702),(138,707)]),
 ('Last covered bed','cover',[(140,724),(295,719),(332,747),(389,753),(386,796),(144,810)]),
]
paths=[
 ('1 • Beyond the planted bed',[(172,222),(399,215),(398,230),(171,237)]),
 ('2 • Paving to hoops side',[(187,311),(397,310),(396,326),(187,330)]),
 ('3 • Mixed cover to planted row',[(137,436),(302,431),(392,432),(392,451),(137,452)]),
 ('4 • First dark cover',[(139,526),(391,524),(391,539),(140,541)]),
 ('5 • Between first and middle covers',[(141,615),(387,610),(389,624),(140,627)]),
 ('6 • Between middle and last covers',[(139,707),(387,701),(391,715),(140,722)]),
 ('7 • Last cover to the open end bed',[(141,808),(238,801),(387,797),(389,810),(232,818),(142,823)]),
]
# Solid segments are observed. Dashed joins are hidden, or their exact course is ambiguous.
edges=[
 ('Across the rear wall and bed','observed',[(87,139),(161,141),(215,136),(273,131),(332,129)]),
 ('Branches at the rear bed corner','uncertain',[(332,129),(400,125)]),
 ('Hoops-side edge','observed',[(400,125),(398,220),(397,331),(394,450),(391,525),(391,616),(392,710),(389,807),(390,923)]),
 ('Open end bed, hoops side','observed',[(390,923),(303,936),(228,945)]),
 ('Two containers interrupt the end edge','uncertain',[(228,945),(145,950)]),
 ('Open end bed, barrel side','observed',[(145,950),(67,955),(71,835),(74,772)]),
 ('Barrel foot','uncertain',[(74,772),(77,710)]),
 ('Barrel-side bed edge','observed',[(77,710),(80,608),(83,503)]),
 ('Overhanging leaves','uncertain',[(83,503),(83,459),(89,389),(90,346)]),
 ('Paving outer edge','observed',[(90,346),(90,317)]),
 ('Side hidden by roof in the ground projection','uncertain',[(90,317),(88,245),(85,176)]),
 ('Turn at the rear shed corner','observed',[(85,176),(87,139)]),
]
# Dimensions and relief of buildings are illustrative; the back wall foot locates the shed.
LAND=[]
GROUND_POLYGONS=[(n,k,traced(p)) for n,k,p in patches+[(n,'brick',p) for n,p in paths]]
CAMS=[
 ('Plan | shed at top',(6,12,50),(6,12,0),48,'ORTHO'),
 ('Towards the shed | A02 family',(10,-7,9),(5.7,18,0),22,'PERSP'),
 ('Towards the barrel | A06 family',(6.5,25,8),(6.5,8,.1),21,'PERSP'),
 ('Paved corner | A04 family',(5.6,25.5,11.8),(5.8,23.2,0),24,'PERSP'),
 ('Ground view towards shed | A11 family',(2.1,5.9,3.1),(2.8,24.4,1),23,'PERSP')]
# Read only the old literal captions; importing the old layout would create its output folder.
import ast
old=ast.parse((P/'layout.py').read_text())
DATA=next(ast.literal_eval(a.value) for a in old.body if isinstance(a,ast.Assign) and getattr(a.targets[0],'id','')=='DATA')
rows={r['id']:r for r in json.loads((REG/'sources.json').read_text())}
extra=['A12','A13','A14','A15','A16','A17','A18','A19','A20','A21','A22']
for key in extra:
    r=rows[key];t=r['seek_seconds'];DATA.append((key,r['title'],'23 March 2026',f'0018 • {t//60:02}:{t%60:02}',r['note']))
def photo(key):
    return REG/rows[key]['file'] if key in extra else P/(key+'.jpg')
