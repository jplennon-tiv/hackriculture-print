"""The shed is along +Y and the neighbour's hoops along +X.
The March ground plates provide approximate coordinates; the paving supplies the metric scale.
"""
from pathlib import Path
P=Path(__file__).resolve().parent
OUT=P.parent/'allotment-atlas'
OUT.mkdir(exist_ok=True)
METRES_PER_UNIT=.46
SLAB_METRES=.45
SLAB=SLAB_METRES/METRES_PER_UNIT
PAVING_Y=21.25
LAND=[
 ('Grass beside the hoops',12,-0.4,1.25,28.9,'grass'),
 ('Grass on barrel side',-1.35,-0.35,1.35,26.0,'grass'),
 ('Grass across barrel end',-0.05,-1.0,13.15,1.0,'grass'),
 ('Cultivated ground',0,0,12,26.0,'soil'),
 ('Cross path to paving',3.87,21.25,8.13,0.65,'brick'),
 ('Cross path beside shed',3.4,24.4,8.6,0.62,'brick'),
 ('Slab corner',0,PAVING_Y,4*SLAB,4*SLAB,'paving'),
 ('Central bed dark cover',2.0,18.82,6.75,2.34,'cover'),
 ('Central bed pale cover',8.75,18.82,3.05,2.34,'fleece'),
 ('Dark cover beside shed',3.65,25.15,3.2,1.9,'cover'),
 ('Light cover beside shed',6.85,25.15,5.08,1.9,'fleece'),
]
# Vertices follow the same A06 ground overlay packed in the Blender scene.
# These pixel coordinates use a 500 x 788 reference with the shed end at the top.
def on_a06(points):
 return [(x*12/500,(788-y)*18.9/788) for x,y in points]
GROUND_POLYGONS=[
 ('Growing ground beside the shed','soil',[(3.28,25.0),(12,25.0),(12,27.68),(3.28,28.05)]),
 ('Shed-end grass visible beside the final bed | A02','grass',[(3.65,27.29),(12,27.04),(12,27.98),(3.65,28.27)]),
 ('Cover beside planted row | A06','cover',on_a06([(93,166),(479,183),(487,311),(83,277)])),
 ('Cover in middle | A06','cover',on_a06([(91,289),(489,316),(489,446),(78,419)])),
 ('Cover nearest barrel | A06','cover',on_a06([(99,435),(302,448),(412,531),(488,536),(496,603),(225,575),(115,590)])),
 ('Finger path beside mixed cover | A06','brick',on_a06([(95,13),(490,16),(491,43),(93,40)])),
 ('Finger path beside planted row | B01 and A06','brick',on_a06([(104,146),(494,159),(494,179),(105,165)])),
 ('Finger path between planted-row and middle covers | B01 and A06','brick',on_a06([(89,276),(489,303),(489,314),(89,286)])),
 ('Finger path between middle and barrel covers | B01 and A06','brick',on_a06([(94,423),(489,446),(489,454),(94,431)])),
]
SHED=(.25,25.08,3.03,3.35)
BIN=(.92,7.85)
CAMS=[
 ('Plan | shed at top',(6,13.6,50),(6,13.6,0),35,'ORTHO'),
 ('Towards the shed | A02 family',(10,-3.3,9.0),(5.7,18.0,0),22,'PERSP'),
 ('Towards the barrel | A06 family',(6.5,25.0,8.0),(6.5,8.0,.1),21,'PERSP'),
 ('Paved corner | A04 family',(5.6,25.5,11.8),(5.8,23.2,0),24,'PERSP'),
 ('Ground view towards shed | A11 family',(2.1,5.9,3.1),(2.8,24.4,1.0),23,'PERSP'),
]
DATA=[
 ('A02','Across the grass path','23 March 2026','DJI clip 0017 • 02:15','The pale-green shed and the beds on its side of the grass path belong to John. The brown shed and metal hoops are on the neighbouring plot.'),
 ('A06','Towards the barrel','23 March 2026','DJI clip 0018 • 03:00','Looking back along the beds, the grass path and the neighbour’s hoops are now on the left. The barrel and far grass edge are visible at the other end.'),
 ('B01','Cross paths in detail','23 March 2026','DJI clip 0018 • 02:04','The original finger-path crop shows short paved routes into the beds. Match the staked plants, pale mesh and weights to A06.'),
 ('A04','The paved corner','23 March 2026','DJI clip 0018 • 02:30','The planted strip ends at square paving beside the shed roof. Narrow brick paths run on both sides of the strip.'),
 ('A05','Across the back boundary','23 March 2026','DJI clip 0017 • 03:00','Only the lower-right corner of this view is John’s ground. The distant beds and buildings are useful for orientation.'),
 ('A07','Summer bed by the shed','26 July 2024','DSC02292.JPG','Grass is visible on the left. The long mesh-covered bed leads towards the paving, with the side of the pale-green shed at the right edge.'),
 ('A08','A second summer angle','26 July 2024','DSC02294.JPG','Taken eight seconds later. The covering, crop rows and background give a second genuine angle. The exact camera position is unmeasured.'),
 ('A10','Ground-level covers','11 April 2026','Camera clip 0138 • 04:47','From the path, the black barrel sits beyond the covered beds. The wall and the distant plots provide background context.'),
 ('A11','Looking back to the shed','11 April 2026','Camera clip 0139 • 01:41','John kneels among the rows. The open pale-green shed is behind him, and a dark water butt stands beside its door.'),
]
