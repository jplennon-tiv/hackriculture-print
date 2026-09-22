"""Render the complete maintained style contract as a small, printable PDF."""
from pathlib import Path
import re, html, hashlib, json
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
root=Path(__file__).resolve().parents[2]
source=root/'docs/VEGETABLE-PRINT-STYLE.md'
output=root/'output/pdf/vegetable-layout-rules-approved-2026-09-22.pdf'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyRules',fontName='Helvetica',fontSize=9.5,leading=13,spaceAfter=7,splitLongWords=True))
styles.add(ParagraphStyle(name='BulletRules',parent=styles['BodyRules'],leftIndent=11,firstLineIndent=-9,spaceAfter=6))
styles.add(ParagraphStyle(name='HeadingRules',fontName='Helvetica-Bold',fontSize=13,leading=16,textColor=colors.HexColor('#285746'),spaceBefore=12,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='TitleRules',fontName='Helvetica-Bold',fontSize=22,leading=25,spaceAfter=12,textColor=colors.HexColor('#182c24')))
styles.add(ParagraphStyle(name='CellRules',parent=styles['BodyRules'],fontSize=8,leading=10,spaceAfter=0))
def inline(text):
 text=text.replace('–','-').replace('—',' - ').replace('‑','-').replace('→',' to ').replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
 text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'\1',text)
 text=html.escape(text)
 text=re.sub(r'`([^`]+)`',r'<font name="Courier" size="8.2">\1</font>',text)
 return re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',text)
class WholeParagraph(Paragraph):
 def split(self,availWidth,availHeight):return []
lines=source.read_text().splitlines();story=[];i=0
while i<len(lines):
 line=lines[i].strip()
 if not line:i+=1;continue
 if line.startswith('# '):
  story.append(Paragraph(inline(line[2:]),styles['TitleRules']))
  story.append(Paragraph('APPROVED RECORD | 22 SEPTEMBER 2026<br/>Decisions: John. Documentation: AI:gpt-6-astra.<br/>Complete print-style contract, including completion decisions.',styles['BodyRules']))
  i+=1;continue
 if line.startswith('## '):
  story.append(Paragraph(inline(line[3:]),styles['HeadingRules']));i+=1;continue
 if line.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
   if not all(re.fullmatch(r'[-: ]+',c) for c in cells):rows.append([Paragraph(inline(c),styles['CellRules']) for c in cells])
   i+=1
  table=Table(rows,colWidths=[30*mm,37*mm,47*mm,60*mm],repeatRows=1,hAlign='LEFT')
  table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e2eee6')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.5,colors.HexColor('#aabbb0')),('INNERGRID',(0,0),(-1,-1),0.3,colors.HexColor('#cbd5cf')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
  story.extend([table,Spacer(1,8)]);continue
  
 bullet=line.startswith('- ');number=bool(re.match(r'^\d\. ',line));chunk=[line];i+=1
 while i<len(lines) and lines[i].strip() and not re.match(r'^(#|\||- |\d\. )',lines[i].strip()):chunk.append(lines[i].strip());i+=1
 text=' '.join(chunk)
 if bullet:text='&#8226; '+inline(text[2:])
 else:text=inline(text)
 story.append(WholeParagraph(text,styles['BulletRules'] if bullet or number else styles['BodyRules']))
width,height=A4
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#b8c9bf'));canvas.line(18*mm,16*mm,width-18*mm,16*mm);canvas.setFillColor(colors.HexColor('#52655a'));canvas.setFont('Helvetica',7.5);canvas.drawString(18*mm,11*mm,'HACKRICULTURE | Vegetable print rules | Approved 22 September 2026');canvas.drawRightString(width-18*mm,11*mm,f'{doc.page}');canvas.restoreState()
output.parent.mkdir(parents=True,exist_ok=True)
doc=SimpleDocTemplate(str(output),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=23*mm,title='Vegetable print: approved style and layout rules',author='John (decisions); AI:gpt-6-astra (documentation)')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
receipt={'source':str(source.relative_to(root)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pdf':str(output.relative_to(root)),'pdf_sha256':hashlib.sha256(output.read_bytes()).hexdigest()}
(root/'docs/vegetable-ai-pilot/LAYOUT-RULES-HARD-COPY.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(output)
