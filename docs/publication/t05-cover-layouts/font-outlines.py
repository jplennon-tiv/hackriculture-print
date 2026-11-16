"""Exact vector glyph outlines from the existing local font files via FreeType.

Keeps these offline layout proofs independent of browser/font conversion installs.
The output PDF contains filled vector letterforms, not rasterised text.
"""
import ctypes as C
from pathlib import Path
import PIL._imagingft

L=C.c_long; I=C.c_int; S=C.c_short; U=C.c_uint; P=C.c_void_p
class Vec(C.Structure): _fields_=[('x',L),('y',L)]
class Generic(C.Structure): _fields_=[('data',P),('finalizer',P)]
class Box(C.Structure): _fields_=[('xmin',L),('ymin',L),('xmax',L),('ymax',L)]
class Metrics(C.Structure): _fields_=[(k,L) for k in ['width','height','horiBearingX','horiBearingY','horiAdvance','vertBearingX','vertBearingY','vertAdvance']]
class Bitmap(C.Structure): _fields_=[('rows',U),('width',U),('pitch',I),('buffer',P),('num_grays',C.c_ushort),('pixel_mode',C.c_ubyte),('palette_mode',C.c_ubyte),('palette',P)]
class Outline(C.Structure): _fields_=[('n_contours',S),('n_points',S),('points',C.POINTER(Vec)),('tags',P),('contours',C.POINTER(S)),('flags',I)]
class Slot(C.Structure): _fields_=[('library',P),('face',P),('next',P),('glyph_index',U),('generic',Generic),('metrics',Metrics),('linearHoriAdvance',L),('linearVertAdvance',L),('advance',Vec),('format',U),('bitmap',Bitmap),('bitmap_left',I),('bitmap_top',I),('outline',Outline)]
class Face(C.Structure): _fields_=[('num_faces',L),('face_index',L),('face_flags',L),('style_flags',L),('num_glyphs',L),('family_name',C.c_char_p),('style_name',C.c_char_p),('num_fixed_sizes',I),('available_sizes',P),('num_charmaps',I),('charmaps',P),('generic',Generic),('bbox',Box),('units_per_EM',C.c_ushort),('ascender',S),('descender',S),('height',S),('max_advance_width',S),('max_advance_height',S),('underline_position',S),('underline_thickness',S),('glyph',C.POINTER(Slot))]
Move=C.CFUNCTYPE(I,C.POINTER(Vec),P)
Line=C.CFUNCTYPE(I,C.POINTER(Vec),P)
Conic=C.CFUNCTYPE(I,C.POINTER(Vec),C.POINTER(Vec),P)
Cubic=C.CFUNCTYPE(I,C.POINTER(Vec),C.POINTER(Vec),C.POINTER(Vec),P)
class Funcs(C.Structure): _fields_=[('move',Move),('line',Line),('conic',Conic),('cubic',Cubic),('shift',I),('delta',L)]
ft=C.CDLL(str(Path(PIL._imagingft.__file__).parent/'.dylibs/libfreetype.6.dylib'))
ft.FT_Init_FreeType.argtypes=[C.POINTER(P)];ft.FT_New_Face.argtypes=[P,C.c_char_p,L,C.POINTER(C.POINTER(Face))]
ft.FT_Load_Char.argtypes=[C.POINTER(Face),C.c_ulong,C.c_int32]
ft.FT_Set_Var_Design_Coordinates.argtypes=[C.POINTER(Face),U,C.POINTER(L)]
ft.FT_Outline_Decompose.argtypes=[C.POINTER(Outline),C.POINTER(Funcs),P]
lib=P();assert ft.FT_Init_FreeType(C.byref(lib))==0

class VectorFont:
    def __init__(self,path,weight=None):
        self.face=C.POINTER(Face)();assert ft.FT_New_Face(lib,str(path).encode(),0,C.byref(self.face))==0
        if weight is not None:
            coords=(L*1)(int(weight*65536));assert ft.FT_Set_Var_Design_Coordinates(self.face,1,coords)==0
        self.upem=self.face.contents.units_per_EM
        self.name=self.face.contents.family_name.decode();self.cache={}
    def glyph(self,char):
        if char in self.cache:return self.cache[char]
        assert ft.FT_Load_Char(self.face,ord(char),1|2|8)==0
        s=self.face.contents.glyph.contents
        if char!=' ':assert s.glyph_index!=0,repr(char)
        commands=[]
        @Move
        def move(p,user):
            if commands:commands.append(('Z',))
            commands.append(('M',p.contents.x,p.contents.y));return 0
        @Line
        def line(p,user):commands.append(('L',p.contents.x,p.contents.y));return 0
        @Conic
        def conic(a,b,user):commands.append(('Q',a.contents.x,a.contents.y,b.contents.x,b.contents.y));return 0
        @Cubic
        def cubic(a,b,d,user):commands.append(('C',a.contents.x,a.contents.y,b.contents.x,b.contents.y,d.contents.x,d.contents.y));return 0
        funcs=Funcs(move,line,conic,cubic,0,0)
        assert ft.FT_Outline_Decompose(C.byref(s.outline),C.byref(funcs),None)==0
        if commands:commands.append(('Z',))
        result=(s.metrics.horiAdvance,commands)
        self.cache[char]=result;return result
    def width(self,text,size,tracking=0):
        return sum(self.glyph(ch)[0] for ch in text)*size/self.upem + max(0,len(text)-1)*tracking
    def draw(self,canvas,text,x,y,size,tracking=0):
        scale=size/self.upem
        for char in text:
            advance,commands=self.glyph(char);p=canvas.beginPath();last=(0,0)
            for item in commands:
                op=item[0];v=item[1:]
                if op=='M':p.moveTo(x+v[0]*scale,y+v[1]*scale);last=v
                elif op=='L':p.lineTo(x+v[0]*scale,y+v[1]*scale);last=v
                elif op=='Q':
                    ax,ay,bx,by=v;px,py=last
                    p.curveTo(x+(px+2*(ax-px)/3)*scale,y+(py+2*(ay-py)/3)*scale,x+(bx+2*(ax-bx)/3)*scale,y+(by+2*(ay-by)/3)*scale,x+bx*scale,y+by*scale);last=(bx,by)
                elif op=='C':p.curveTo(*[base+coord*scale for base,coord in zip([x,y,x,y,x,y],v)]);last=v[-2:]
                elif op=='Z':p.close()
            if commands:canvas.drawPath(p,fill=1,stroke=0,fillMode=1)
            x+=advance*scale+tracking
