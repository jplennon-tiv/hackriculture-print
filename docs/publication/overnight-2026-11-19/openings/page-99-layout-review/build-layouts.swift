import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let folder=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-99-layout-review")
let photoFolder=folder
let work=folder
let output=root.appendingPathComponent("output/pdf/page-99-layout-review")
try FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
let data=try Data(contentsOf:folder.appendingPathComponent("CONTENTS.json"))
struct Group:Decodable {let title:String;let displayTitle:String;let pages:String}
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
func title(){text("Vegetable",17*mm,14*mm,45,true);text("Troubles",17*mm,14*mm+45*0.91,45,true,400,orange)}
struct Column:Decodable {let first:Int;let count:Int;let x:CGFloat;let y:CGFloat;let width:CGFloat;let row:CGFloat}
struct PhotoPlacement:Decodable {let id:Int;let x:CGFloat;let y:CGFloat;let size:CGFloat}
struct Variant:Decodable {let id:String;let label:String;let description:String;let columns:[Column];let photos:[PhotoPlacement]}
struct VariantSet:Decodable {let variants:[Variant]}
let variants=try JSONDecoder().decode(VariantSet.self,from:Data(contentsOf:work.appendingPathComponent("VARIANTS.json"))).variants
let pdfURL=output.appendingPathComponent("Vegetable-Guru-Page-99-Layout-Options.pdf")
var box=CGRect(x:0,y:0,width:W,height:H)
ctx=CGContext(pdfURL as CFURL,mediaBox:&box,[kCGPDFContextTitle:"The Vegetable Guru — Vegetable Troubles — Page 99 layout options A–D",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
for v in variants {
 current=v.id;items=[];ctx.beginPDFPage(nil);rect(0,0,W,H,paper);title()
 for c in v.columns {for i in 0..<c.count {
  let g=contents.groups[c.first+i],x=c.x*mm,y=(c.y+CGFloat(i)*c.row)*mm,w=c.width*mm
  let pw=width(g.pages,10,false,700),lines=wrapped(g.displayTitle,w-pw-10,16,true)
  for (n,s) in lines.enumerated(){text(s,x,y+CGFloat(n)*17.5,16,true,400,orange)}
  text(g.pages,x+w,y+5.8,10,false,700,ink,true)
 }}
 for p in v.photos {photo(p.id,p.x*mm,p.y*mm,p.size*mm)}
 let fl=line("99",7.35,false,900);var fa:CGFloat=0
 _=CTLineGetTypographicBounds(fl,&fa,nil,nil)
 let fg=CTLineGetBoundsWithOptions(fl,[.useGlyphPathBounds]);text("99",177*mm,232*mm-fa+fg.minY,7.35,false,900,ink,true)
 let outside=items.filter{$0.rect.minX<16.8*mm || $0.rect.maxX>177.25*mm || $0.rect.minY<10*mm || $0.rect.maxY>($0.label == "99" ? 232.1:231)*mm}.map{$0.label}
 var overlaps:[[String]]=[]
 for i in items.indices {for j in items.indices where j>i {let intersection=items[i].rect.intersection(items[j].rect);if !intersection.isNull && intersection.width>0.5 && intersection.height>0.5 {overlaps.append([items[i].label,items[j].label])}}}
 checks.append(["option":v.id,"label":v.label,"outOfSafeBounds":outside,"overlaps":overlaps,"photoNumbers":items.filter{$0.kind=="photo"}.map{$0.label},"photoSizesMM":v.photos.map{$0.size},"textGeometry":items.filter{$0.kind=="text"}.map{["text":$0.label,"boundsPoints":[$0.rect.minX,$0.rect.minY,$0.rect.width,$0.rect.height]] as [String:Any]}])
 ctx.endPDFPage()
}
ctx.closePDF()
let doc=PDFDocument(url:pdfURL)!
guard doc.pageCount==4 else{fatalError("Wrong page count")}
for i in 0..<doc.pageCount {
 let page=doc.page(at:i)!,s:CGFloat=2.5,w=Int(ceil(W*s)),h=Int(ceil(H*s))
 let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
 let gc=NSGraphicsContext(bitmapImageRep:rep)!;NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=gc
 gc.cgContext.setFillColor(paper);gc.cgContext.fill(CGRect(x:0,y:0,width:w,height:h));gc.cgContext.scaleBy(x:s,y:s);page.draw(with:.mediaBox,to:gc.cgContext);NSGraphicsContext.restoreGraphicsState()
 try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("Option-"+variants[i].id+".png"))
 let t=page.string ?? "",normal=t.components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
 checks[i]["pdfText"]=t;checks[i]["trimMM"]=[page.bounds(for:.mediaBox).width/mm,page.bounds(for:.mediaBox).height/mm]
 checks[i]["allGroupTitlesExtracted"]=contents.groups.allSatisfy{normal.contains($0.displayTitle)}
 checks[i]["allPageRangesExtracted"]=contents.groups.allSatisfy{normal.contains($0.pages)}
 checks[i]["folioPresent"]=normal.split(separator:" ").contains("99")
 checks[i]["titlePresent"]=normal.contains("Vegetable Troubles")
 checks[i]["removedOldCopyAbsent"] = !normal.contains("Recognise") && !normal.contains("THE VEGETABLE GURU") && !normal.contains("illustrated Troubles guides")
 checks[i]["fontFamilies"]=[CTFontCopyFamilyName(font(10)) as String,CTFontCopyFamilyName(font(45,true)) as String]
}
try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("LAYOUT-CHECKS.json"))
for c in checks {print(c["option"]!,"bounds",c["outOfSafeBounds"]!,"overlaps",c["overlaps"]!,"titles",c["allGroupTitlesExtracted"]!,"pages",c["allPageRangesExtracted"]!)}
