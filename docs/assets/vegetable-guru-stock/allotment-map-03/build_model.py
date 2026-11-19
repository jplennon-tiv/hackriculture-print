import bpy, sys, math
from mathutils import Vector
from pathlib import Path
P=Path(__file__).resolve().parent
sys.path.insert(0,str(P))
from layout import P,OUT,LAND,SHED,BIN,CAMS,DATA,GROUND_POLYGONS,METRES_PER_UNIT,SLAB_METRES,SLAB,PAVING_Y,ground,photo,edges,traced,footprint,NEIGHBOUR_RECT,HOOPS,CROP_ROWS
bpy.ops.wm.read_factory_settings(use_empty=True)
main=bpy.context.scene; main.name='01 • Plot model'
main.unit_settings.system='METRIC'
main.unit_settings.scale_length=METRES_PER_UNIT
main.unit_settings.length_unit='METERS'
def collection(scene,name):
 c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
land=collection(main,'01 • Ground and paths')
season=collection(main,'02 • March 2026 beds and covers')
shed=collection(main,'03 • Observed landmarks')
outside=collection(main,'04 • Neighbour landmarks for orientation')
cams=collection(main,'05 • Illustrative viewpoints')
under=collection(main,'06 • Photo overlays | enable to compare')
def material(name,hexcode):
 col=tuple(int(hexcode[i:i+2],16)/255 for i in (0,2,4))
 linear=tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in col)
 m=bpy.data.materials.new(name);m.diffuse_color=(*linear,1);m.use_nodes=True
 m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*linear,1);return m
mats={k:material(k,v) for k,v in dict(grass='8b9b6e',soil='745f50',brick='bda48c',paving='c6c3ae',cover='494e50',fleece='e0decb',shed='a9c9ae',roof='4b5552',barrel='424846',hoop='8d9291',neighbour='a28d77',line='928d7b',leaf='527956',cane='9e9369',observed='167268',uncertain='c06830').items()}
def mesh(name,verts,faces,coll,mat):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
 obj=bpy.data.objects.new(name,data);coll.objects.link(obj);obj.data.materials.append(mat);obj.color=mat.diffuse_color;return obj
def box(name,x,y,z,w,d,h,coll,mat):
 v=[(x+dx*w,y+dy*d,z+dz*h) for dz in (0,1) for dx,dy in ((0,0),(1,0),(1,1),(0,1))]
 return mesh(name,v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],coll,mats[mat])
def curve(name,pts,r,coll,mat):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.bevel_depth=r;d.bevel_resolution=2
 sp=d.splines.new('POLY');sp.points.add(len(pts)-1)
 for pt,co in zip(sp.points,pts):pt.co=(*co,1)
 o=bpy.data.objects.new(name,d);coll.objects.link(o);o.data.materials.append(mats[mat]);return o
for name,x,y,w,h,typ in LAND:
 z={'grass':-.07,'soil':-.05,'brick':.01,'paving':.013,'cover':.036,'fleece':.039}[typ]
 box(name,x,y,z,w,h,.04,land if typ in ('grass','soil','paving','brick') else season,typ)
for name,typ,points in GROUND_POLYGONS:
 z={'soil':-.008,'grass':.006,'brick':.052,'cover':.076,'fleece':.076,'paving':.02}[typ]
 ob=mesh(name,[(x,y,z) for x,y in points],[tuple(range(len(points)))],season if typ in ('cover','fleece') else land,mats[typ])
 ob['Placement']='Approximate ground trace from March aerial stills'
evidence=collection(main,'07 • Grass edges | solid observed, dashed uncertain')
for name,status,points in edges:
 xy=traced(points)
 if status=='observed':
  ob=curve(name,[(x,y,.12) for x,y in xy],.044,evidence,status)
  ob['Evidence']=status
 else:
  for (x1,y1),(x2,y2) in zip(xy,xy[1:]):
   n=max(1,round(math.hypot(x2-x1,y2-y1)/.32))
   for k in range(n):
    pts=[(x1+(x2-x1)*t,y1+(y2-y1)*t,.12) for t in (k/n,(k+.53)/n)]
    ob=curve(name,pts,.052,evidence,status);ob['Evidence']=status
for row in range(4):
 for col in range(4):
  slab=box(f'Paving slab {row+1}.{col+1} | 45 cm square',col*SLAB,PAVING_Y+row*SLAB,.057,SLAB,SLAB,.005,land,'paving')
  slab['Measured side, metres']=SLAB_METRES
for i in range(1,4):
 box('Slab joint X%02d'%i,i*SLAB-.011,PAVING_Y,.063,.022,4*SLAB,.003,land,'line')
 box('Slab joint Y%02d'%i,0,PAVING_Y+i*SLAB-.011,.063,4*SLAB,.022,.003,land,'line')
sx,sy,sw,sd=SHED
def hut(name,x,y,w,d,h,coll,wall):
 box(name+' | wall block',x,y,.01,w,d,h,coll,wall)
 v=[(x-.10,y-.10,h),(x+w+.10,y-.10,h),(x+w/2,y-.10,h+.84),
    (x-.10,y+d+.10,h),(x+w+.10,y+d+.10,h),(x+w/2,y+d+.10,h+.84)]
 return mesh(name+' | pitched roof',v,[(0,1,2),(3,5,4),(0,2,5,3),(2,1,4,5),(1,0,3,4)],coll,mats['roof'])
hut('John’s pale-green shed',sx,sy,sw,sd,3.3,shed,'shed')
hut('Neighbour’s brown shed | indicative',*footprint(*NEIGHBOUR_RECT),2.65,outside,'neighbour')
def tub(name,x,y,r,h):
 verts=[(x+r*s*math.cos(i*math.tau/32),y+r*s*math.sin(i*math.tau/32),z) for s,z in [(1,.0),(.83,h)] for i in range(32)]
 return mesh(name,verts,[tuple(reversed(range(32))),tuple(range(32,64))]+[(i,(i+1)%32,32+(i+1)%32,32+i) for i in range(32)],shed,mats['barrel'])
tub('Barrel beside covered beds | A06',*BIN,.73,1.8)
tub('Open-end container 1 | A18',*ground(155,940),.38,.95)
tub('Open-end container 2 | A18',*ground(201,936),.35,.9)
# The separate door-side butt is seen in April; keep it separate and annotated instead of guessing its exact centre.
for left,right,v in HOOPS:
 x,yy=ground(left,v);half=(right-left)/50
 pts=[(x+half*(1-math.cos(i*math.pi/36)),yy,2.75*math.sin(i*math.pi/36)) for i in range(37)]
 curve('Neighbour’s hoops | indicative',pts,.044,outside,'hoop')
# Schematic rows mark only the planted bands for which there is direct March evidence.
for j,(left,right,v) in enumerate(CROP_ROWS):
 x,y=ground(left,v);span=(right-left)/25;count=12
 for i in range(count):
  xx=x+i*span/(count-1);rr=.12+.04*((i*7+j)%3)
  vs=[(xx+rr*math.cos(k*math.pi/4),y+rr*.83*math.sin(k*math.pi/4),.06) for k in range(8)]+[(xx,y,.29)]
  mesh('Planted band | schematic',vs,[(k,(k+1)%8,8) for k in range(8)],season,mats['leaf'])
def plane_image(coll,key,filename,x,y,z,w,h):
 im=bpy.data.images.load(str(P/filename),check_existing=True);im.pack()
 mat=bpy.data.materials.new(key+' photographic plate');mat.use_nodes=True
 nt=mat.node_tree;nt.nodes.clear();tex=nt.nodes.new('ShaderNodeTexImage');tex.image=im
 emission=nt.nodes.new('ShaderNodeEmission');output=nt.nodes.new('ShaderNodeOutputMaterial')
 nt.links.new(tex.outputs['Color'],emission.inputs['Color']);nt.links.new(emission.outputs[0],output.inputs[0])
 obj=mesh(key,[(x,y,z),(x+w,y,z),(x+w,y+h,z),(x,y+h,z)],[(0,1,2,3)],coll,mat)
 uv=obj.data.uv_layers.new()
 for i,co in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=co
 return obj
plane_image(under,'March • registered ground mosaic',str(OUT/'ground-mosaic.jpg'),*ground(0,1150),.18,575/25,1150/25)
under.hide_viewport=under.hide_render=True
def camera(coll,n,loc,tgt,lens,typ='PERSP'):
 d=bpy.data.cameras.new(n);d.type=typ
 if typ=='ORTHO':d.ortho_scale=lens
 else:d.lens=lens
 o=bpy.data.objects.new(n,d);coll.objects.link(o);o.location=loc
 if abs(loc[0]-tgt[0])+abs(loc[1]-tgt[1])<.00001: o.rotation_euler=(0,0,0)
 else:o.rotation_euler=(Vector(tgt)-Vector(loc)).to_track_quat('-Z','Y').to_euler()
 d.clip_end=500;return o
def mark(scene,frame,cam):
 m=scene.timeline_markers.new(cam.name,frame=frame);m.camera=cam
def env(scene,name,color,energy):
 world=bpy.data.worlds.new(name);scene.world=world;world.use_nodes=True
 bg=world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(*color,1);bg.inputs[1].default_value=energy
 scene.render.engine='CYCLES';scene.cycles.samples=5;scene.cycles.use_denoising=False
 scene.view_settings.view_transform='Standard';scene.render.resolution_x=1200;scene.render.resolution_y=800;scene.render.resolution_percentage=100
env(main,'Neutral study daylight',(.7,.72,.7),.85)
sun=bpy.data.lights.new('Sunlight','SUN');sun.energy=2;sun.angle=math.radians(12)
lamp=bpy.data.objects.new('Sunlight',sun);land.objects.link(lamp);lamp.rotation_euler=(.48,-.56,-.25)
# First camera gives an immediate readable orbit-friendly overview.
mc=camera(cams,'Overview | illustrative',(28,-16,34),(6.0,13,0),46,'ORTHO');mark(main,1,mc)
for i,(name,loc,tgt,fov,typ) in enumerate(CAMS,2):
 c=camera(cams,name,loc,tgt,fov if 'Plan' not in name else 66,typ);mark(main,i,c)
main.camera=mc;main.frame_end=6;main.frame_set(1)
refs=bpy.data.scenes.new('02 • Original photographs')
env(refs,'Photo background',(.05,.06,.05),1);refs.render.resolution_y=675
gallery=collection(refs,'Embedded photographs • full frame');rc=collection(refs,'Original-photo cameras')
for i,(k,title,date,file,desc) in enumerate(DATA):
 im=bpy.data.images.load(str(photo(k)),check_existing=True);ratio=im.size[0]/im.size[1];w=min(16,9*ratio);h=w/ratio
 x=i*25;obj=plane_image(gallery,k+' | '+title,str(photo(k)),x-w/2,-h/2,0,w,h)
 obj['Source']=file;obj['Date']=date;obj['Evidence']=desc
 c=camera(rc,k+' | '+title,(x,0,10),(x,0,0),16,'ORTHO');mark(refs,i+1,c)
 if i==0: refs.camera=c
refs.frame_end=len(DATA);refs.frame_set(1)
readme=bpy.data.texts.new('START HERE • Allotment reference')
readme.write("""JOHN’S ALLOTMENT / WORKING MAP 03
Scene 01 frames 1–6 select the overview, plan, two looking along the plot, the paved corner and the working-height view. Scene 02 frames 1–20 select the nine inherited photographs and eleven new full-frame stills. All photographs are packed.
The pale-green shed is at +Y. The hoop-side grass path is at +X. One measured slab is 0.45 m square. The ground mosaic uses the paving and the continuous March pass. The seven transverse strips, shed-back turn and open end bed are traced in layout.py. In collection 07 dark teal marks observed grass edges and orange dashes mark obscured ground. The extent of peripheral grass, roofs, heights, plants and camera poses is illustrative. Collection 06 holds the packed ground mosaic, hidden by default. View it from above. Tall objects lean in this ground projection.
The brown shed and metal hoops are the neighbour’s. The barrel by the open beds and the water butt at the shed are separate observations. See the companion PDF for the camera evidence and limits.

SOURCE REGISTER
""")
for i,(k,title,date,src,desc) in enumerate(DATA,1):readme.write(f'{i:02}  {k}  {title}  |  {date}  |  {src}\n{desc}\n\n')
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  v=area.spaces.active;v.region_3d.view_rotation=mc.rotation_euler.to_quaternion();v.region_3d.view_location=(6.3,13.5,0);v.region_3d.view_distance=37
  v.region_3d.view_perspective='ORTHO';v.shading.color_type='MATERIAL';v.shading.light='STUDIO';v.overlay.show_overlays=False;v.clip_end=500
main['Reference status']='Paving calibrated at 0.45 m per square slab. Seven strips from the continuous pass. Orange dashes mark hidden ground. Heights and camera poses approximate.'
main['Square slab side (m)']=SLAB_METRES
main['Flyover traced']='DJI_20260323173752_0018_D.MP4, 01:52 outbound, 02:11–02:13 reversal, 02:27 return; checked to 05:25.'
main['Guide']='See START HERE text block and companion PDF.'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Johns-Allotment-Working-Map-03.blend'),compress=True)
