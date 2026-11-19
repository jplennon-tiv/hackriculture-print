"""Run with Blender in background, opening the saved model first. Outputs temporary JPEG proofs."""
from pathlib import Path
import os, math, bpy
dest=Path(os.environ['VG_MODEL_REVIEW'])
dest.mkdir(parents=True,exist_ok=True)
main, gallery=sorted(bpy.data.scenes,key=lambda s:s.name)
assert len(main.timeline_markers)==6 and len(gallery.timeline_markers)==20
assert len(bpy.data.images)==sum(1 for im in bpy.data.images if im.packed_file or im.type in ('RENDER_RESULT','COMPOSITING'))
slabs=[o for o in main.objects if o.get('Measured side, metres')]
assert len(slabs)==16
for slab in slabs:
 assert all(math.isclose(float(val)*main.unit_settings.scale_length,.45,abs_tol=1e-6) for val in slab.dimensions[:2])
assert len([o for o in main.objects if o.name[:1].isdigit() and ' • ' in o.name and o.type=='MESH'])==7
assert {o.get('Evidence') for o in main.objects if o.get('Evidence')}=={'observed','uncertain'}
for sc in (main,gallery):
 bpy.context.window.scene=sc
 sc.cycles.samples=2
 sc.render.resolution_percentage=33
 sc.render.image_settings.file_format='JPEG'
 for marker in sorted(sc.timeline_markers,key=lambda m:m.frame):
  sc.frame_set(marker.frame)
  assert sc.camera==marker.camera
  sc.render.filepath=str(dest/f'{sc.name[:2]}-{marker.frame:02d}.jpg')
  bpy.ops.render.render(write_still=True,scene=sc.name)
import hashlib
for key in ['01','02']:
 files=sorted(dest.glob(key+'-*.jpg'))
 assert len({hashlib.sha256(p.read_bytes()).digest() for p in files})==len(files), 'A saved viewpoint repeated a render.'
print('VERIFIED 16 slab objects at 0.45 x 0.45 m, 7 cross-paths, both edge types, 6 model cameras, 20 photographic cameras, packed images.')
