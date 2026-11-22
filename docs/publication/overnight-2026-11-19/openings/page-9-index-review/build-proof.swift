import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let folder=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-9-index-review")
let photoFolder=folder
let work=folder
let output=root.appendingPathComponent("output/pdf/page-9-index-review")
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
struct Box:Decodable {let x:CGFloat;let y:CGFloat;let width:CGFloat;let height:CGFloat}
struct Calendar:Decodable {let pdf:String;let sourcePage:Int;let cropMM:Box;let placementMM:Box;let renderDPI:CGFloat}
struct Sources:Decodable {let calendar:Calendar}
let sources=try JSONDecoder().decode(Sources.self,from:Data(contentsOf:work.appendingPathComponent("SOURCES.json")))
let cal=sources.calendar,sourcePDF=PDFDocument(url:root.appendingPathComponent(cal.pdf))!,sourcePage=sourcePDF.page(at:cal.sourcePage-1)!
let scale=cal.renderDPI/72,crop=cal.cropMM,sourceBounds=sourcePage.bounds(for:.mediaBox)
let cropWidth=Int(ceil(crop.width*mm*scale)),cropHeight=Int(ceil(crop.height*mm*scale))
let cropRep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:cropWidth,pixelsHigh:cropHeight,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
let cropGC=NSGraphicsContext(bitmapImageRep:cropRep)!
NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=cropGC
cropGC.cgContext.setFillColor(paper);cropGC.cgContext.fill(CGRect(x:0,y:0,width:cropWidth,height:cropHeight))
cropGC.cgContext.scaleBy(x:scale,y:scale);cropGC.cgContext.translateBy(x:-crop.x*mm,y:-(sourceBounds.height-(crop.y+crop.height)*mm));sourcePage.draw(with:.mediaBox,to:cropGC.cgContext);NSGraphicsContext.restoreGraphicsState()
let calendarURL=work.appendingPathComponent("calendar-panel-600dpi.png")
try cropRep.representation(using:.png,properties:[:])!.write(to:calendarURL)
let pdfURL=output.appendingPathComponent("Vegetable-Guru-Page-9-Index-Proposal.pdf")
var box=CGRect(x:0,y:0,width:W,height:H)
ctx=CGContext(pdfURL as CFURL,mediaBox:&box,[kCGPDFContextTitle:"The Vegetable Guru — Page 9 — vegetable index and retained calendar",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
ctx.beginPDFPage(nil);rect(0,0,W,H,paper)
text("Vegetable",17*mm,14*mm,45,true);text("Guides",17*mm,14*mm+45*0.91,45,true,400,orange)
photo(1,111*mm,12*mm,29*mm);photo(2,148*mm,26*mm,29*mm);photo(3,111*mm,45*mm,29*mm)
text("Vegetable index",17*mm,62*mm,16,true,400,orange)
let counts=[15,15,14];var start=0,columns:[[String:Any]]=[]
for col in 0..<3 {
 let x=(17+CGFloat(col)*(160+6)/3)*mm,w=(160-12)/3*mm;var y=80*mm;var rowChecks:[[String:Any]]=[]
 for n in 0..<counts[col] {
  let e=index.entries[start+n],pw=width(e.page,10.5,false,700),lines=wrapped(e.title,w-pw-8,10.5)
  for (i,s) in lines.enumerated(){text(s,x,y+CGFloat(i)*13,10.5)}
  text(e.page,x+w,y,10.5,false,700,ink,true)
  rowChecks.append(["title":e.title,"page":e.page,"lines":lines,"topMM":y/mm]);y+=CGFloat(lines.count)*13+2
 }
 columns.append(["column":col+1,"count":counts[col],"bottomCursorMM":y/mm,"rows":rowChecks]);start+=counts[col]
}
let p=cal.placementMM,im=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(calendarURL as CFURL,nil)!,0,nil)!
ctx.interpolationQuality = .high;ctx.draw(im,in:CGRect(x:p.x*mm,y:H-(p.y+p.height)*mm,width:p.width*mm,height:p.height*mm));items.append(Item(label:"Unchanged calendar panel",rect:CGRect(x:p.x*mm,y:p.y*mm,width:p.width*mm,height:p.height*mm),kind:"calendar"))
let fl=line("9",7.35,false,900);var fa:CGFloat=0
_=CTLineGetTypographicBounds(fl,&fa,nil,nil);let fg=CTLineGetBoundsWithOptions(fl,[.useGlyphPathBounds]);text("9",177*mm,232*mm-fa+fg.minY,7.35,false,900,ink,true)
let outside=items.filter{$0.rect.minX<16.8*mm || $0.rect.maxX>177.25*mm || $0.rect.minY<10*mm || $0.rect.maxY>($0.label == "9" ? 232.1:231)*mm}.map{$0.label}
var overlaps:[[String]]=[]
for i in items.indices {for j in items.indices where j>i {let intersection=items[i].rect.intersection(items[j].rect);if !intersection.isNull && intersection.width>0.5 && intersection.height>0.5 {overlaps.append([items[i].label,items[j].label])}}}
ctx.endPDFPage();ctx.closePDF()
let doc=PDFDocument(url:pdfURL)!;guard doc.pageCount==1 else{fatalError("Wrong page count")}
let page=doc.page(at:0)!,s:CGFloat=2.5,ww=Int(ceil(W*s)),hh=Int(ceil(H*s))
let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:ww,pixelsHigh:hh,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
let gc=NSGraphicsContext(bitmapImageRep:rep)!;NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=gc
gc.cgContext.setFillColor(paper);gc.cgContext.fill(CGRect(x:0,y:0,width:ww,height:hh));gc.cgContext.scaleBy(x:s,y:s);page.draw(with:.mediaBox,to:gc.cgContext);NSGraphicsContext.restoreGraphicsState()
try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("Page-9-Index-Proposal.png"))
let t=page.string ?? "",normal=t.components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
let indexBottom=items.filter{$0.kind=="text" && $0.rect.minY>=80*mm && $0.label != "9"}.map{$0.rect.maxY}.max()!/mm
let check:[String:Any] = ["folio":9,"outOfSafeBounds":outside,"overlaps":overlaps,"trimMM":[page.bounds(for:.mediaBox).width/mm,page.bounds(for:.mediaBox).height/mm],"indexEntries":index.entries.count,"allNamesExtracted":index.entries.allSatisfy{normal.contains($0.title)},"allReferencesExtracted":index.entries.allSatisfy{normal.split(separator:" ").contains(Substring($0.page))},"removedPanelCopyAbsent": !normal.contains("Difficulty") && !normal.contains("Core needs") && !normal.contains("How to use"),"indexFontPt":10.5,"columns":columns,"indexBottomMM":indexBottom,"indexCalendarGapMM":p.y-indexBottom,"calendarSizePreserved":p.width==crop.width && p.height==crop.height,"calendarPixelDimensions":[cropWidth,cropHeight],"calendarRasterDPI":cal.renderDPI,"calendarFooterInkGapMM":232-p.y-p.height,"photoCount":3,"photoSizeMM":29,"pdfText":t,"textGeometry":items.filter{$0.kind=="text"}.map{["text":$0.label,"boundsPoints":[$0.rect.minX,$0.rect.minY,$0.rect.width,$0.rect.height]] as [String:Any]}]
try JSONSerialization.data(withJSONObject:check,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("CHECKS.json"))
print("Created page 9:","bounds",outside,"overlaps",overlaps,"index names",check["allNamesExtracted"]!,"gap",check["indexCalendarGapMM"]!)
