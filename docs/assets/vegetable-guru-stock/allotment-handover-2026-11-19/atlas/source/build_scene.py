import bpy, sys, math
from mathutils import Vector
from pathlib import Path
P=Path(__file__).resolve().parent
sys.path.insert(0,str(P))
from layout import P,OUT,LAND,SHED,BIN,CAMS,DATA,GROUND_POLYGONS,METRES_PER_UNIT,SLAB_METRES,SLAB,PAVING_Y
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
mats={k:material(k,v) for k,v in dict(grass='8b9b6e',soil='745f50',brick='bda48c',paving='c6c3ae',cover='494e50',fleece='e0decb',shed='a9c9ae',roof='4b5552',barrel='424846',hoop='8d9291',neighbour='a28d77',line='928d7b',leaf='527956',cane='9e9369').items()}
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
 z={'soil':-.008,'grass':.006,'brick':.052,'cover':.076}[typ]
 ob=mesh(name,[(x,y,z) for x,y in points],[tuple(range(len(points)))],season if typ=='cover' else land,mats[typ])
 ob['Placement']='Approximate ground trace from March aerial stills'
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
hut('Neighbour’s brown shed | indicative',14.0,23.5,2.45,2.35,2.65,outside,'neighbour')
def tub(name,x,y,r,h):
 verts=[(x+r*s*math.cos(i*math.tau/32),y+r*s*math.sin(i*math.tau/32),z) for s,z in [(1,.0),(.83,h)] for i in range(32)]
 return mesh(name,verts,[tuple(reversed(range(32))),tuple(range(32,64))]+[(i,(i+1)%32,32+(i+1)%32,32+i) for i in range(32)],shed,mats['barrel'])
tub('Barrel beside covered beds | A06',*BIN,.73,1.8)
# The separate door-side butt is seen in April; keep it separate and annotated instead of guessing its exact centre.
for yy in [4.4,7.6,10.8]:
 pts=[(14.25+1.65*(1-math.cos(i*math.pi/36)),yy,2.75*math.sin(i*math.pi/36)) for i in range(37)]
 curve('Neighbour’s hoops | indicative',pts,.044,outside,'hoop')
# Schematic rows mark only the planted bands for which there is direct March evidence.
for j,(x,y,span,count) in enumerate([(3.1,16.0,7.7,12),(3.4,17.0,7.4,12),(4.15,22.35,7.2,12),(4.1,23.1,7.3,12),(4.2,23.8,7.2,12)]):
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
plane_image(under,'A06 • Approximate ground projection','A06-ground.jpg',0,0,.16,12,18.9)
plane_image(under,'A04 • Approximate ground projection','A04-ground.jpg',0,21.4,.16,12,5.1)
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
mc=camera(cams,'Overview | illustrative',(28,-11,34),(6.0,14,0),37,'ORTHO');mark(main,1,mc)
for i,(name,loc,tgt,fov,typ) in enumerate(CAMS,2):
 c=camera(cams,name,loc,tgt,fov if 'Plan' not in name else 48,typ);mark(main,i,c)
main.camera=mc;main.frame_end=6;main.frame_set(1)
refs=bpy.data.scenes.new('02 • Original photographs')
env(refs,'Photo background',(.05,.06,.05),1);refs.render.resolution_y=675
gallery=collection(refs,'Embedded photographs • full frame');rc=collection(refs,'Original-photo cameras')
for i,(k,title,date,file,desc) in enumerate(DATA):
 im=bpy.data.images.load(str(P/(k+'.jpg')),check_existing=True);ratio=im.size[0]/im.size[1];w=min(16,9*ratio);h=w/ratio
 x=i*25;obj=plane_image(gallery,k+' | '+title,k+'.jpg',x-w/2,-h/2,0,w,h)
 obj['Source']=file;obj['Date']=date;obj['Evidence']=desc
 c=camera(rc,k+' | '+title,(x,0,10),(x,0,0),16,'ORTHO');mark(refs,i+1,c)
 if i==0: refs.camera=c
refs.frame_end=len(DATA);refs.frame_set(1)
readme=bpy.data.texts.new('START HERE • Allotment reference')
readme.write('JOHN’S ALLOTMENT / WORKING MAP 02\n\nScene 01 opens on the layout study. Orbit the model or switch to camera view (Numpad 0). Frames 1–6 select the overview, plan, two opposing lengthwise views, the paving, and an illustrative working-height view towards the shed.\nScene 02 contains the nine original stills. Use camera view and frames 1–9; switch to Rendered shading or render a frame for the photographic colours. All image data is packed. Use the PDF for a captioned walkthrough.\n\nThe two ground overlays derive from A06 and A04. Enable collection 06 and use Material Preview to inspect them. They approximate the ground plane only. Projected plants, roof and barrel lean; their raised surfaces cannot be rectified this way. The gap between the two plates is intentional.\n\nThe shed end is along +Y and the grass path beside the hoops is on +X. John measured the square paving at 0.45 m per side. Each slab object measures 0.45 × 0.45 m in the metric scene. The paving sets the scale. Individual beds, heights, and camera poses remain approximate. Two additional finger paths are traced in A06 and B01. The grass at the barrel end and along both sides can be seen in A06. A02 shows the transverse grass beyond the final bed; the shed hides part of its course. The exact perimeter awaits the continuous flyover in DJI_20260323173752_0018_D.MP4 starting at 01:52. Neighbour landmarks show position only. The barrel visible in A06 and the water butt by the shed door in A11 are separate observations. Seasonal covers are March 2026 references.\n\nFor a new illustration, start from a matching original camera still. Orbit views help identify the bed and likely sightline. Seek a new real view before depicting details hidden in every source.\n\nSOURCE REGISTER\n')
for i,(k,title,date,src,desc) in enumerate(DATA,1):readme.write(f'{i:02}  {k}  {title}  |  {date}  |  {src}\n{desc}\n\n')
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  v=area.spaces.active;v.region_3d.view_rotation=mc.rotation_euler.to_quaternion();v.region_3d.view_location=(6.3,13.5,0);v.region_3d.view_distance=37
  v.region_3d.view_perspective='ORTHO';v.shading.color_type='MATERIAL';v.shading.light='STUDIO';v.overlay.show_overlays=False;v.clip_end=500
main['Reference status']='Paving calibrated at 0.45 m per square slab. Paths from A04, A06 and B01. Shed-end corner and camera poses approximate.'
main['Square slab side (m)']=SLAB_METRES
main['Flyover to trace']='DJI_20260323173752_0018_D.MP4, 01:52 onwards'
main['Guide']='See START HERE text block and companion PDF.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Johns-Allotment.blend'),compress=True)
