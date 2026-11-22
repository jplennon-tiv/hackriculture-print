import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let work=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/title-page-trials")
let output=root.appendingPathComponent("output/pdf/title-page-trials/Vegetable-Guru-Title-Page-Trials-A-and-C.pdf")
try FileManager.default.createDirectory(at:output.deletingLastPathComponent(),withIntermediateDirectories:true)
let data=try JSONSerialization.jsonObject(with:Data(contentsOf:work.appendingPathComponent("VARIANTS.json"))) as! [String:Any]
let variants=data["variants"] as! [[String:Any]],assets=data["assets"] as! [String:[String:Any]],copy=data["text"] as! [String:Any]
let mm:CGFloat=72/25.4,width:CGFloat=185*mm,height:CGFloat=240*mm,centre:CGFloat=97
let ink=NSColor(srgbRed:23/255,green:62/255,blue:44/255,alpha:1),paper=NSColor(srgbRed:1,green:248/255,blue:233/255,alpha:1)
func font(_ file:String,_ size:CGFloat,_ weight:CGFloat=400)->CTFont {
 let ds=CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/"+file) as CFURL) as! [CTFontDescriptor]
 let d=file.contains("-6.") ? CTFontDescriptorCreateCopyWithVariation(ds[0],NSNumber(value:0x77676874),weight):ds[0]
 return CTFontCreateWithFontDescriptor(d,size,nil)
}
let eyebrow=font("richer-a-6.woff2",7.5,900),the=font("richer-a-1.woff2",24.75),vegetable=font("richer-a-1.woff2",58.5),guru=font("richer-a-1.woff2",82.5)
let subtitle=font("richer-a-6.woff2",15.75,800),author=font("richer-a-6.woff2",12.75,800),edition=font("richer-a-6.woff2",9,600),imprint=font("richer-a-6.woff2",8.25,800)
var media=CGRect(x:0,y:0,width:width,height:height)
let c=CGContext(output as CFURL,mediaBox:&media,[kCGPDFContextTitle:"The Vegetable Guru — Title page trials A1, A2, C1, C2",kCGPDFContextAuthor:"John Lennon",kCGPDFContextSubject:"Four standalone design proposals at 185 × 240 mm; not an assembled book"] as CFDictionary)!
var allChecks:[[String:Any]]=[]
for variant in variants {
 let id=variant["id"] as! String
 var textRects:[CGRect]=[],artRects:[CGRect]=[],textRecords:[[String:Any]]=[]
 c.beginPDFPage(nil);c.setFillColor(paper.cgColor);c.fill(media)
 func text(_ string:String,_ f:CTFont,_ y:CGFloat,_ kern:CGFloat=0) {
  let a=NSAttributedString(string:string,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:ink,.kern:kern])
  let line=CTLineCreateWithAttributedString(a),bounds=CTLineGetBoundsWithOptions(line,.useGlyphPathBounds)
  let pos=CGPoint(x:centre*mm-bounds.midX,y:height-y*mm-bounds.maxY)
  c.textPosition=pos;CTLineDraw(line,c)
  let rect=bounds.offsetBy(dx:pos.x,dy:pos.y);textRects.append(rect)
  guard rect.minX>=17*mm-0.2,rect.maxX<=177*mm+0.2,rect.minY>=8*mm,rect.maxY<=height-8*mm else{fatalError("Text outside safe area: \(id), \(string)")}
  textRecords.append(["text":string,"font":CTFontCopyPostScriptName(f) as String,"sizePt":CTFontGetSize(f),"xMM":rect.minX/mm,"topMM":(height-rect.maxY)/mm,"widthMM":rect.width/mm,"heightMM":rect.height/mm])
 }
 text(copy["eyebrow"] as! String,eyebrow,22,1.8)
 let titles=copy["title"] as! [String],sub=copy["subtitle"] as! [String]
 text(titles[0],the,43);text(titles[1],vegetable,56);text(titles[2],guru,79)
 text(sub[0],subtitle,116);text(sub[1],subtitle,124)
 text(copy["author"] as! String,author,145)
 text(copy["measurementLabel"] as! String,edition,156)
 text(copy["imprint"] as! String,imprint,226,0.65)
 for p in variant["photos"] as! [[String:Any]] {
  let key=p["key"] as! String,record=assets[key]!,file=root.appendingPathComponent(record["file"] as! String)
  let x=p["x"] as! CGFloat,y=p["y"] as! CGFloat,w=p["w"] as! CGFloat,h=p["h"] as! CGFloat
  let box=CGRect(x:x*mm,y:height-(y+h)*mm,width:w*mm,height:h*mm)
  guard box.minX>=17*mm,box.maxX<=177*mm,box.minY>=8*mm else{fatalError("Picture outside safe area")}
  let source=CGImageSourceCreateWithURL(file as CFURL,nil)!,im=CGImageSourceCreateImageAtIndex(source,0,nil)!
  let scale=max(box.width/CGFloat(im.width),box.height/CGFloat(im.height)),iw=CGFloat(im.width)*scale,ih=CGFloat(im.height)*scale
  c.saveGState();c.clip(to:box);c.interpolationQuality = .high;c.draw(im,in:CGRect(x:box.midX-iw/2,y:box.midY-ih/2,width:iw,height:ih));c.restoreGState()
  guard !textRects.contains(where:{$0.intersects(box)}),!artRects.contains(where:{$0.intersects(box)}) else{fatalError("Picture overlap in \(id)")}
  artRects.append(box)
 }
 for i in 0..<textRects.count {for j in (i+1)..<textRects.count {guard !textRects[i].intersects(textRects[j]) else{fatalError("Text overlap")}}}
 allChecks.append(["id":id,"text":textRecords,"pictures":variant["photos"]!,"textOverlaps":0,"pictureOverlaps":0,"safeMarginsMM":[17,8],"folio":1,"visibleFolio":"Omitted as in the original title page","colourRule":"Removed by proposed direction"])
 c.endPDFPage()
}
c.closePDF()
let doc=PDFDocument(url:output)!
guard doc.pageCount==4 else{fatalError("Wrong page count")}
let outline=PDFOutline()
for (i,v) in variants.enumerated(){let node=PDFOutline();node.label="\(v["id"]!) · \(v["title"]!)";node.destination=PDFDestination(page:doc.page(at:i)!,at:CGPoint(x:0,y:height));outline.insertChild(node,at:i)}
doc.outlineRoot=outline;guard doc.write(to:output) else{fatalError("Outline save failed")}
let final=PDFDocument(url:output)!
for (i,v) in variants.enumerated(){
 let p=final.page(at:i)!,box=p.bounds(for:.mediaBox),scale:CGFloat=2.2,w=Int(ceil(box.width*scale)),h=Int(ceil(box.height*scale))
 let plain=(p.string ?? "").components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
 for s in ["HACKRICULTURE","The Vegetable Guru","Your at-a-glance growing companion","John Lennon","Traditional measurements","[Imprint name]"] {guard plain.contains(s) else{fatalError("Missing text \(s)")}}
 guard !plain.contains("Imperial"),abs(box.width/mm-185)<0.01,abs(box.height/mm-240)<0.01 else{fatalError("Edition/trim error")}
 let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!,g=NSGraphicsContext(bitmapImageRep:rep)!
 NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=g;g.cgContext.setFillColor(paper.cgColor);g.cgContext.fill(CGRect(x:0,y:0,width:w,height:h));g.cgContext.scaleBy(x:scale,y:scale);p.draw(with:.mediaBox,to:g.cgContext);NSGraphicsContext.restoreGraphicsState()
 try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("\(v["id"]!).png"))
}
try JSONSerialization.data(withJSONObject:["date":"2026-11-22","status":"Proposals; visual inspection pending","trimMM":[185,240],"pages":4,"allExpectedTextVerified":true,"allTextPositionsCommon":true,"variants":allChecks],options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("CHECKS.json"))
print("Built and checked four title-page trials: A1, A2, C1, C2; all title copy present; no overlaps.")
