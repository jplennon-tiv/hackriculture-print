import bpy
from pathlib import Path
from math import isclose
p=Path(__file__).resolve().parent
m,refs=[bpy.data.scenes[k] for k in ['01 • Plot model','02 • Original photographs']]
assert all(i.packed_file for i in bpy.data.images if i.source=='FILE' and i.filepath)
assert len(m.timeline_markers)==6 and len(refs.timeline_markers)==9
for sc in [m,refs]:
 for i,marker in enumerate(sorted(sc.timeline_markers,key=lambda a:a.frame),1):
  sc.frame_set(i)
  assert sc.camera==marker.camera
for sc,frame,n in [(m,1,'model-review'),(refs,6,'photo-render-check')]:
 sc.frame_set(frame);sc.render.resolution_percentage=60;sc.cycles.samples=4
 sc.render.filepath=str(p/(n+'.png'))
 bpy.ops.render.render(write_still=True,scene=sc.name)
print('Verified both scenes, all 15 camera stops and all packed image dependencies.')
