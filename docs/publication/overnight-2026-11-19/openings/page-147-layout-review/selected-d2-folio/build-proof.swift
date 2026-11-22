import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let folder=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-147-layout-review")
let photoFolder=folder
let work=folder.appendingPathComponent("selected-d2-folio")
let output=root.appendingPathComponent("output/pdf/page-147-layout-review/selected-d2-folio")
try FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
let data=try Data(contentsOf:folder.appendingPathComponent("CONTENTS.json"))
struct Entry:Decodable {let title:String;let pages:String}
struct Group:Decodable {let title:String;let entries:[Entry]}
struct Contents:Decodable {let title:[String];let groups:[Group]}
let contents=try JSONDecoder().decode(Contents.self,from:data)
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
func title(_ y:CGFloat,_ size:CGFloat) {text("Growing",17*mm,y,size,true);text("Techniques",17*mm,y+size*0.91,size,true,400,orange)}
@discardableResult func group(_ index:Int,_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ body:CGFloat=10,_ heading:CGFloat=16,_ leading:CGFloat=13,rowTop:CGFloat?=nil,headingX:CGFloat?=nil,headingWidth:CGFloat?=nil)->CGFloat {
 let g=contents.groups[index];var cursor=y
 for s in wrapped(g.title,headingWidth ?? w,heading,true) {text(s,headingX ?? x,cursor,heading,true,400,orange);cursor+=heading*1.08}
 cursor = rowTop ?? (cursor+5)
 for entry in g.entries {let pageWidth=width(entry.pages,body,false,700);let lines=wrapped(entry.title,w-pageWidth-11,body)
  for (i,s) in lines.enumerated() {text(s,x,cursor+CGFloat(i)*leading,body)}
  text(entry.pages,x+w,cursor,body,false,700,ink,true)
  cursor+=CGFloat(lines.count)*leading+1.5
 }
 return cursor
}
func grid(_ ids:[Int?],_ cols:Int,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ gap:CGFloat) {for (n,id) in ids.enumerated(){if let id=id {photo(id,x+CGFloat(n%cols)*(size+gap),y+CGFloat(n/cols)*(size+gap),size)}}}
struct PhotoPlacement:Decodable {let id:Int;let x:CGFloat;let y:CGFloat;let size:CGFloat}
struct Variant:Decodable {let id:String;let label:String;let description:String;let photos:[PhotoPlacement]}
struct VariantSet:Decodable {let variants:[Variant]}
let variants=try JSONDecoder().decode(VariantSet.self,from:Data(contentsOf:folder.appendingPathComponent("d-refinements/VARIANTS.json"))).variants.filter{$0.id == "D2"}
let pdfURL=output.appendingPathComponent("Vegetable-Guru-Page-147-D2-With-Folio.pdf")
var box=CGRect(x:0,y:0,width:W,height:H)
ctx=CGContext(pdfURL as CFURL,mediaBox:&box,[kCGPDFContextTitle:"The Vegetable Guru — Page 147 — selected D2 with restored folio",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
for option in 0..<1 {
 current=variants[option].id;items=[];ctx.beginPDFPage(nil);rect(0,0,W,H,paper)
 title(14*mm,45)
 for col in 0..<2 {var y=59*mm;for i in 0..<3 {y=group(col*3+i,(17+CGFloat(col)*84.5)*mm,y,75.5*mm,10,16,13)+12}}
 for p in variants[option].photos {photo(p.id,p.x*mm,p.y*mm,p.size*mm)}
 // Restore the folio only, using the entry-page Nunito role and 8 mm bottom margin.
 let folioLine=line("147",7.35,false,900)
 var folioAscent:CGFloat=0
 _=CTLineGetTypographicBounds(folioLine,&folioAscent,nil,nil)
 let folioGlyphs=CTLineGetBoundsWithOptions(folioLine,[.useGlyphPathBounds])
 let folioTop=232*mm-folioAscent+folioGlyphs.minY
 text("147",177*mm,folioTop,7.35,false,900,ink,true)
 let outside=items.filter{$0.rect.minX<16.8*mm || $0.rect.maxX>177.2*mm || $0.rect.minY<10*mm || $0.rect.maxY>($0.label == "147" ? 232.1:231)*mm}.map{$0.label}
 var collisions:[[String]]=[]
 for i in items.indices {for j in items.indices where j>i {let intersection=items[i].rect.intersection(items[j].rect);if !intersection.isNull && intersection.width>0.5 && intersection.height>0.5 {collisions.append([items[i].label,items[j].label])}}}
 checks.append(["option":current,"outOfSafeBounds":outside,"overlaps":collisions,"textElements":items.filter{$0.kind=="text"}.count,"photoNumbers":items.filter{$0.kind=="photo"}.map{$0.label},"contentBottomMM":items.map{$0.rect.maxY}.max()!/mm,"textGeometry":items.filter{$0.kind=="text"}.map{["text":$0.label,"bounds":[$0.rect.minX,$0.rect.minY,$0.rect.width,$0.rect.height]] as [String:Any]}])
 ctx.endPDFPage()
}
ctx.closePDF()
let doc=PDFDocument(url:pdfURL)!
guard doc.pageCount==1 else{fatalError("Wrong page count")}
for i in 0..<1 {
 let page=doc.page(at:i)!,s:CGFloat=2.5,w=Int(ceil(W*s)),h=Int(ceil(H*s))
 let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
 let gc=NSGraphicsContext(bitmapImageRep:rep)!;NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=gc
 gc.cgContext.setFillColor(paper);gc.cgContext.fill(CGRect(x:0,y:0,width:w,height:h));gc.cgContext.scaleBy(x:s,y:s);page.draw(with:.mediaBox,to:gc.cgContext);NSGraphicsContext.restoreGraphicsState()
 try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("Page-147-D2-With-Folio.png"))
 let t=page.string ?? ""
 checks[i]["pdfText"]=t;checks[i]["trimPoints"]=[page.bounds(for:.mediaBox).width,page.bounds(for:.mediaBox).height]
 let normal=t.components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
 checks[i]["allTopicTitlesExtracted"]=contents.groups.allSatisfy{g in g.entries.allSatisfy{normal.contains($0.title)}}
 checks[i]["allGroupTitlesExtracted"]=contents.groups.allSatisfy{normal.contains($0.title)}
 checks[i]["removedOldCopyAbsent"] = !t.contains("Make the most") && !t.contains("THE VEGETA") && !t.contains("Plot planning, cultivation")
 checks[i]["fontFamilies"]=[CTFontCopyFamilyName(font(10)) as String,CTFontCopyFamilyName(font(48,true)) as String]
}
try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("LAYOUT-CHECKS.json"))
print("Created selected D2 with restored folio 147:")
for c in checks {print(c["option"]!,"bounds",c["outOfSafeBounds"]!,"overlaps",c["overlaps"]!,"topic text",c["allTopicTitlesExtracted"]!)}
