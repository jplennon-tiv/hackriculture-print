/* Read actual font curves. This does not trace or smooth raster images. */
#include <stdio.h>
#include <stdlib.h>
#include <ft2build.h>
#include FT_FREETYPE_H
#include FT_OUTLINE_H
#include FT_BBOX_H
#include FT_MULTIPLE_MASTERS_H
static int open_contour=0;
static int move(const FT_Vector*p,void*u){if(open_contour)printf("Z ");printf("M%ld %ld ",p->x,p->y);open_contour=1;return 0;}
static int line(const FT_Vector*p,void*u){printf("L%ld %ld ",p->x,p->y);return 0;}
static int quad(const FT_Vector*a,const FT_Vector*b,void*u){printf("Q%ld %ld %ld %ld ",a->x,a->y,b->x,b->y);return 0;}
static int cubic(const FT_Vector*a,const FT_Vector*b,const FT_Vector*c,void*u){printf("C%ld %ld %ld %ld %ld %ld ",a->x,a->y,b->x,b->y,c->x,c->y);return 0;}
int main(int argc,char**argv){
 if(argc<2)return 2;FT_Library lib;FT_Face face;FT_Init_FreeType(&lib);
 int err=FT_New_Face(lib,argv[1],0,&face);if(err){fprintf(stderr,"Font load error %d\n",err);return 3;}
 if(argc>2&&FT_HAS_MULTIPLE_MASTERS(face)){
  FT_MM_Var*v;FT_Get_MM_Var(face,&v);FT_Fixed*coords=calloc(v->num_axis,sizeof(FT_Fixed));
  for(int i=0;i<v->num_axis;i++)coords[i]=v->axis[i].tag==FT_MAKE_TAG('w','g','h','t')?atol(argv[2])*65536:v->axis[i].def;
  FT_Set_Var_Design_Coordinates(face,v->num_axis,coords);free(coords);FT_Done_MM_Var(lib,v);
 }
 printf("{\"family\":\"%s\",\"style\":\"%s\",\"units_per_em\":%d,\"glyphs\":{",face->family_name,face->style_name,face->units_per_EM);
 int first=1;
 for(int cp=32;cp<256;cp++){
  FT_UInt gid=FT_Get_Char_Index(face,cp);if(!gid)continue;
  if(FT_Load_Glyph(face,gid,FT_LOAD_NO_SCALE|FT_LOAD_NO_HINTING|FT_LOAD_NO_BITMAP))return 4;
  FT_BBox box;FT_Outline_Get_BBox(&face->glyph->outline,&box);
  if(!first)printf(",");first=0;
  printf("\"%d\":{\"advance\":%ld,\"bbox\":[%ld,%ld,%ld,%ld],\"path\":\"",cp,face->glyph->advance.x,box.xMin,box.yMin,box.xMax,box.yMax);
  FT_Outline_Funcs fn={move,line,quad,cubic,0,0};open_contour=0;FT_Outline_Decompose(&face->glyph->outline,&fn,NULL);if(open_contour)printf("Z");printf("\"}");
 }
 printf("}}\n");FT_Done_Face(face);FT_Done_FreeType(lib);return 0;
}
