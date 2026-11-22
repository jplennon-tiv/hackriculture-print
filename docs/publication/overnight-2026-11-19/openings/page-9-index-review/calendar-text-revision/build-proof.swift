import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let folder=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-9-index-review")
let photoFolder=folder
let work=folder.appendingPathComponent("calendar-text-revision")
let output=root.appendingPathComponent("output/pdf/page-9-index-review/calendar-text-revision")
try FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
let data=try Data(contentsOf:folder.appendingPathComponent("INDEX.json"))
struct Entry:Decodable {let title:String;let page:String}
struct Index:Decodable {let entries:[Entry]}
let index=try JSONDecoder().decode(Index.self,from:data)
let mm:CGFloat=72/25.4,W:CGFloat=185*72/25.4,H:CGFloat=240*72/25.4
func colour(_ hex:Int)->CGColor {CGColor(red:CGFloat((hex>>16)&255)/255,green:CGFloat((hex>>8)&255)/255,blue:CGFloat(hex&255)/255,alpha:1)}
let paper=colour(0xfff8e9),ink=colour(0x173e2c),orange=colour(0xa44007),rule=colour(0xd4d6bf)
func descriptor(_ file:String)->CTFontDescriptor {let u=root.appendingPathComponent("public/fonts/"+file);CTFontManagerRegisterFontsForURL(u as CFURL,.process,nil);return (CTFontManagerCreateFontDescriptorsFromURL(u as CFURL) as! [CTFontDescriptor])[0]}
let displayDescriptor=descriptor("richer-a-1.woff2"),bodyDescriptor=descriptor("richer-a-6.woff2")
func font(_ size:CGFloat,_ display:Bool=false,_ weight:CGFloat=400)->CTFont {
 if display {return CTFontCreateWithFontDescriptor(displayDescriptor,size,nil)}
 let variations=[NSNumber(value:0x77676874):NSNumber(value:Double(weight))]
 let desc=CTFontDescriptorCreateCopyWithAttributes(bodyDescriptor,[kCTFontVariationAttribute:variations] as CFDictionary)
 return CTFontCreateWithFontDescriptor(desc,size,nil)
}
func line(_ text:String,_ size:CGFloat,_ display:Bool=false,_ weight:CGFloat=400,_ fill:CGColor=ink)->CTLine {
 CTLineCreateWithAttributedString(NSAttributedString(string:text,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):font(size,display,weight),NSAttributedString.Key(kCTForegroundColorAttributeName as String):fill]))
}
func width(_ text:String,_ size:CGFloat,_ display:Bool=false,_ weight:CGFloat=400)->CGFloat {CGFloat(CTLineGetTypographicBounds(line(text,size,display,weight),nil,nil,nil))}
struct Item {let label:String;let rect:CGRect;let kind:String}
var items:[Item]=[],ctx:CGContext!,checks:[[String:Any]]=[],current=""
func rect(_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ h:CGFloat,_ fill:CGColor) {ctx.setFillColor(fill);ctx.fill(CGRect(x:x,y:H-y-h,width:w,height:h))}
func text(_ value:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ display:Bool=false,_ weight:CGFloat=400,_ fill:CGColor=ink,_ right:Bool=false) {
 let l=line(value,size,display,weight,fill);var ascent:CGFloat=0,descent:CGFloat=0
 let w=CGFloat(CTLineGetTypographicBounds(l,&ascent,&descent,nil)),px=right ? x-w:x
 ctx.textMatrix = .identity;ctx.textPosition=CGPoint(x:px,y:H-y-ascent);CTLineDraw(l,ctx)
 let glyphs=CTLineGetBoundsWithOptions(l,[.useGlyphPathBounds])
 items.append(Item(label:value,rect:CGRect(x:px+glyphs.minX,y:y+ascent-glyphs.maxY,width:glyphs.width,height:glyphs.height),kind:"text"))
}
func wrapped(_ value:String,_ maxWidth:CGFloat,_ size:CGFloat,_ display:Bool=false,_ weight:CGFloat=400)->[String] {
 var lines:[String]=[],pending=""
 for word in value.split(separator:" ") {let trial=pending.isEmpty ? String(word):pending+" "+word;if !pending.isEmpty && width(trial,size,display,weight)>maxWidth {lines.append(pending);pending=String(word)}else{pending=trial}}
 if !pending.isEmpty {lines.append(pending)};return lines
}
func photo(_ number:Int,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat) {
 let u=folder.appendingPathComponent(String(format:"photos/%02d.jpg",number));let src=CGImageSourceCreateWithURL(u as CFURL,nil)!,image=CGImageSourceCreateImageAtIndex(src,0,nil)!
 ctx.interpolationQuality = .high;ctx.draw(image,in:CGRect(x:x,y:H-y-size,width:size,height:size));items.append(Item(label:String(format:"photo-%02d",number),rect:CGRect(x:x,y:y,width:size,height:size),kind:"photo"))
}
func ruleLine(_ x:CGFloat,_ y:CGFloat,_ w:CGFloat) {ctx.setStrokeColor(rule);ctx.setLineWidth(0.5);ctx.move(to:CGPoint(x:x,y:H-y));ctx.addLine(to:CGPoint(x:x+w,y:H-y));ctx.strokePath()}
struct Band:Decodable {let label:String;let months:[String]}
struct Panel:Decodable {let heading:String;let intro:String;let exampleTitle:String;let qualification:String;let otherRows:String;let rows:[Band]}
let panel=try JSONDecoder().decode(Panel.self,from:Data(contentsOf:work.appendingPathComponent("PANEL-COPY.json")))
func rounded(_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ h:CGFloat,_ r:CGFloat,_ fill:CGColor){ctx.setFillColor(fill);ctx.addPath(CGPath(roundedRect:CGRect(x:x,y:H-y-h,width:w,height:h),cornerWidth:r,cornerHeight:r,transform:nil));ctx.fillPath()}
@discardableResult func paragraph(_ value:String,_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ size:CGFloat=10.5,_ leading:CGFloat=13.65)->CGFloat {let lines=wrapped(value,w,size);for (i,s) in lines.enumerated(){text(s,x,y+CGFloat(i)*leading,size)};return y+CGFloat(lines.count)*leading}
let pdfURL=output.appendingPathComponent("Vegetable-Guru-Page-9-Index-Proposal.pdf")
var box=CGRect(x:0,y:0,width:W,height:H)
ctx=CGContext(pdfURL as CFURL,mediaBox:&box,[kCGPDFContextTitle:"The Vegetable Guru — Page 9 — revised calendar wording proposal",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
ctx.beginPDFPage(nil);rect(0,0,W,H,paper)
text("Vegetable",17*mm,14*mm,45,true);text("Guides",17*mm,14*mm+45*0.91,45,true,400,orange)
photo(1,111*mm,12*mm,29*mm);photo(2,148*mm,26*mm,29*mm);photo(3,78.2*mm,34*mm,29*mm)
let counts=[15,15,14];var start=0,columns:[[String:Any]]=[]
for col in 0..<3 {
 let x=(17+CGFloat(col)*(160+6)/3)*mm,w=(160-12)/3*mm;var y=72*mm;var rowChecks:[[String:Any]]=[]
 for n in 0..<counts[col] {
  let e=index.entries[start+n],pw=width(e.page,10.5,false,700),lines=wrapped(e.title,w-pw-8,10.5)
  for (i,s) in lines.enumerated(){text(s,x,y+CGFloat(i)*13,10.5)}
  text(e.page,x+w,y,10.5,false,700,ink,true)
  rowChecks.append(["title":e.title,"page":e.page,"lines":lines,"topMM":y/mm]);y+=CGFloat(lines.count)*13+2
 }
 columns.append(["column":col+1,"count":counts[col],"bottomCursorMM":y/mm,"rows":rowChecks]);start+=counts[col]
}
let indexBottom=items.filter{$0.kind=="text" && $0.rect.minY>=72*mm}.map{$0.rect.maxY}.max()!/mm
let panelY:CGFloat=160,panelH:CGFloat=66
rounded(17*mm,panelY*mm,160*mm,panelH*mm,4*mm,colour(0xffe1b7))
text(panel.heading,20*mm,(panelY+3)*mm,17.25,true)
let introBottom=(panelY+3)*mm
let cy:CGFloat=173,cx:CGFloat=20,cw:CGFloat=92,ch:CGFloat=35
rounded(cx*mm,cy*mm,cw*mm,ch*mm,3*mm,colour(0x064d32))
text(panel.exampleTitle,(cx+3)*mm,(cy+2)*mm,12.5,true,400,paper)
let labelWidth:CGFloat=26,gridX=(cx+3+labelWidth)*mm,gridWidth=(cw-6-labelWidth)*mm,step=gridWidth/12
for (i,m) in ["J","F","M","A","M","J","J","A","S","O","N","D"].enumerated(){text(m,gridX+CGFloat(i)*step+step/2-width(m,8.5,false,700)/2,(cy+9)*mm,8.5,false,700,paper)}
for (j,r) in panel.rows.enumerated(){let y=(cy+14+CGFloat(j)*4.5)*mm;text(r.label,(cx+3)*mm,y,8.5,false,700,paper)
 for i in 0..<12 {let harvesting=r.label=="HARVEST",state=r.months[i],fill:CGColor
  if state=="usual"{fill=colour(harvesting ? 0xff781f:0xd6ea9b)}else if state=="extra"{fill=colour(harvesting ? 0xae7950:0x6b9069)}else{fill=CGColor(red:1,green:1,blue:1,alpha:21/255)}
  rounded(gridX+CGFloat(i)*step,y+1.5,step-1.3,2.7*mm,1.35*mm,fill)
 }
}
let lx:CGFloat=117
text("Usual",144*mm,174*mm,9,false,700);text("Less usual",159*mm,174*mm,9,false,700)
for (j,label) in ["Sow / plant","Harvest"].enumerated(){let y=(180+CGFloat(j)*6)*mm;text(label,lx*mm,y,10.5)
 rounded(145*mm,y+2,10*mm,3*mm,1.5*mm,colour(j==0 ? 0xd6ea9b:0xff781f));rounded(162*mm,y+2,10*mm,3*mm,1.5*mm,colour(j==0 ? 0x6b9069:0xae7950))
}
let qualBottom=paragraph(panel.qualification,lx*mm,193*mm,57*mm,10.5,13.65)
let noteBottom=paragraph(panel.otherRows,20*mm,210*mm,154*mm,10.5,13.65)
let fl=line("9",7.35,false,900);var fa:CGFloat=0
_=CTLineGetTypographicBounds(fl,&fa,nil,nil);let fg=CTLineGetBoundsWithOptions(fl,[.useGlyphPathBounds]);text("9",177*mm,232*mm-fa+fg.minY,7.35,false,900,ink,true)
let outside=items.filter{$0.rect.minX<16.8*mm || $0.rect.maxX>177.25*mm || $0.rect.minY<10*mm || $0.rect.maxY>($0.label == "9" ? 232.1:227)*mm}.map{$0.label}
var overlaps:[[String]]=[]
for i in items.indices {for j in items.indices where j>i {let intersection=items[i].rect.intersection(items[j].rect);if !intersection.isNull && intersection.width>0.5 && intersection.height>0.5 {overlaps.append([items[i].label,items[j].label])}}}
ctx.endPDFPage();ctx.closePDF()
let doc=PDFDocument(url:pdfURL)!;guard doc.pageCount==1 else{fatalError("Wrong page count")}
let page=doc.page(at:0)!,s:CGFloat=2.5,ww=Int(ceil(W*s)),hh=Int(ceil(H*s))
let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:ww,pixelsHigh:hh,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
let gc=NSGraphicsContext(bitmapImageRep:rep)!;NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=gc
 gc.cgContext.setFillColor(paper);gc.cgContext.fill(CGRect(x:0,y:0,width:ww,height:hh));gc.cgContext.scaleBy(x:s,y:s);page.draw(with:.mediaBox,to:gc.cgContext);NSGraphicsContext.restoreGraphicsState()
try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("Page-9-Expanded-Calendar.png"))
let t=page.string ?? "",normal=t.components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
let check:[String:Any]=["folio":9,"outOfSafeBounds":outside,"overlaps":overlaps,"trimMM":[page.bounds(for:.mediaBox).width/mm,page.bounds(for:.mediaBox).height/mm],"indexEntries":index.entries.count,"allNamesExtracted":index.entries.allSatisfy{normal.contains($0.title)},"allReferencesExtracted":index.entries.allSatisfy{normal.split(separator:" ").contains(Substring($0.page))},"indexHeadingRemoved": !normal.contains("Vegetable index"),"oldIntroRemoved": !normal.contains("Each row names"),"oldBottomBlockRemoved": !normal.contains("Other rows name"),"allPanelCopyExtracted":[panel.heading,panel.intro,panel.qualification,panel.otherRows].filter{!$0.isEmpty}.allSatisfy{normal.contains($0)},"allExampleRowsExtracted":panel.rows.allSatisfy{normal.contains($0.label)},"indexFontPt":10.5,"panelBodyPt":10.5,"columns":columns,"indexBottomMM":indexBottom,"indexCalendarGapMM":panelY-indexBottom,"panelMM":[17,panelY,160,panelH],"introBottomMM":introBottom/mm,"qualificationBottomMM":qualBottom/mm,"noteBottomMM":noteBottom/mm,"photoCount":3,"photoSizeMM":29,"pdfText":t,"textGeometry":items.filter{$0.kind=="text"}.map{["text":$0.label,"boundsPoints":[$0.rect.minX,$0.rect.minY,$0.rect.width,$0.rect.height]] as [String:Any]}]
try JSONSerialization.data(withJSONObject:check,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("CHECKS.json"))
print("Created expanded panel:","bounds",outside,"overlaps",overlaps,"copy",check["allPanelCopyExtracted"]!,"intro",introBottom/mm,"qual",qualBottom/mm,"note",noteBottom/mm,"gap",panelY-indexBottom)
