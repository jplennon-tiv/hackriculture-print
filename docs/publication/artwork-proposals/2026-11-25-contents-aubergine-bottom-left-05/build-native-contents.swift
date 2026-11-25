import Foundation
import AppKit
import CoreText
import PDFKit
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let work=root.appendingPathComponent("docs/publication/artwork-proposals/2026-11-25-contents-aubergine-bottom-left-05")
let output=work.appendingPathComponent("Native-Contents.pdf")
try FileManager.default.createDirectory(at:output.deletingLastPathComponent(),withIntermediateDirectories:true)
let source=try JSONSerialization.jsonObject(with:Data(contentsOf:work.appendingPathComponent("CONTENTS.json"))) as! [String:Any]
let selection=try JSONSerialization.jsonObject(with:Data(contentsOf:root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/contents-no-category-colours/swapped-headers/SELECTION.json"))) as! [String:Any]
let pictures=selection["entries"] as! [[String:Any]]
let sourcePages=source["pages"] as! [[String:Any]], mm:CGFloat=72/25.4
let width:CGFloat=185*mm,height:CGFloat=240*mm
let ink=NSColor(srgbRed:23/255,green:62/255,blue:44/255,alpha:1)
let paper=NSColor(srgbRed:1,green:248/255,blue:233/255,alpha:1)
let rule=NSColor(srgbRed:212/255,green:214/255,blue:191/255,alpha:1)
func font(_ file:String,_ size:CGFloat,_ weight:CGFloat=400)->CTFont {
 let ds=CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/"+file) as CFURL) as! [CTFontDescriptor]
 let d=file.contains("-6.") ? CTFontDescriptorCreateCopyWithVariation(ds[0],NSNumber(value:0x77676874),weight):ds[0]
 return CTFontCreateWithFontDescriptor(d,size,nil)
}
let body=font("richer-a-6.woff2",10.5,600), bold=font("richer-a-6.woff2",10.5,900), sectionFont=font("richer-a-6.woff2",13.5,900),titleFont=font("richer-a-1.woff2",25.5),footer=font("richer-a-6.woff2",7.35,900)
var media=CGRect(x:0,y:0,width:width,height:height)
let c=CGContext(output as CFURL,mediaBox:&media,[kCGPDFContextTitle:"The Vegetable Guru — Contents — single-colour proposal",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
func label(_ s:String,_ f:CTFont,_ x:CGFloat,_ y:CGFloat,_ right:Bool=false,_ colour:NSColor=ink){
 let line=CTLineCreateWithAttributedString(NSAttributedString(string:s,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:colour]))
 let w=CTLineGetTypographicBounds(line,nil,nil,nil)
 c.textPosition=CGPoint(x:x*mm-(right ? w:0),y:height-y*mm-CTFontGetAscent(f));CTLineDraw(line,c)
}
func line(_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ dotted:Bool=true){
 c.saveGState();c.setStrokeColor(rule.cgColor);c.setLineWidth(0.4);if dotted{c.setLineDash(phase:0,lengths:[0.6,1.6])};c.move(to:CGPoint(x:x*mm,y:height-y*mm));c.addLine(to:CGPoint(x:(x+w)*mm,y:height-y*mm));c.strokePath();c.restoreGState()
}
var rows:[[String:Any]]=[],arts:[[String:Any]]=[]
func image(_ number:Int,_ x:CGFloat,_ y:CGFloat,_ folio:Int){
 let record=pictures.first { ($0["number"] as! Int)==number }!
 let path=root.appendingPathComponent(record["file"] as! String)
 let source=CGImageSourceCreateWithURL(path as CFURL,nil)!,im=CGImageSourceCreateImageAtIndex(source,0,nil)!
 let box=CGRect(x:x*mm,y:height-(y+32)*mm,width:32*mm,height:32*mm),scale=max(box.width/CGFloat(im.width),box.height/CGFloat(im.height)),w=CGFloat(im.width)*scale,h=CGFloat(im.height)*scale
 c.saveGState();c.clip(to:box);c.interpolationQuality = .high;c.draw(im,in:CGRect(x:box.midX-w/2,y:box.midY-h/2,width:w,height:h));c.restoreGState()
 arts.append(["number":number,"name":record["title"]!,"source":record["file"]!,"sha256":record["sha256"]!,"folio":folio,"xMM":x,"yMM":y,"sizeMM":32])
}
func row(_ e:[String:Any],_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ page:Int)->CGFloat{
 let s=e["label"] as! String, n=e["folio"] as! Int
 let ps=NSMutableParagraphStyle();ps.minimumLineHeight=14.5;ps.maximumLineHeight=14.5
 let attributed=NSAttributedString(string:s,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):body,.foregroundColor:ink,.paragraphStyle:ps])
 let setter=CTFramesetterCreateWithAttributedString(attributed),available=(w-9)*mm
 let size=CTFramesetterSuggestFrameSizeWithConstraints(setter,CFRange(location:0,length:attributed.length),nil,CGSize(width:available,height:100),nil)
 let h=max(6.3,(size.height+1)/mm+0.7)
 let rect=CGRect(x:x*mm,y:height-y*mm-size.height-1,width:available,height:size.height+1)
 let frame=CTFramesetterCreateFrame(setter,CFRange(location:0,length:attributed.length),CGPath(rect:rect,transform:nil),nil)
 guard CTFrameGetVisibleStringRange(frame).length==attributed.length else{fatalError("Row clipped: \(s)")}
 CTFrameDraw(frame,c);label(String(n),bold,x+w,y,true);line(x,y+h-0.5,w)
 rows.append(["page":page,"label":s,"destination":n,"xMM":x,"yMM":y,"widthMM":w,"heightMM":h,"kind":"entry"])
 return y+h
}
func heading(_ e:[String:Any],_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ page:Int){
 label(e["label"] as! String,sectionFont,x,y);label(String(e["folio"] as! Int),bold,x+w,y+0.8,true)
 rows.append(["page":page,"label":e["label"]!,"destination":e["folio"]!,"xMM":x,"yMM":y,"widthMM":w,"heightMM":7,"kind":"section"])
}
var maxBottom:CGFloat=0
for page in sourcePages {
 let folio=page["folio"] as! Int,entries=page["entries"] as! [[String:Any]],left:CGFloat=folio==2 ? 8:17,right=left+84.5
 c.beginPDFPage(nil)
 line(left,49,160,false)
 if folio==2 {
  _=row(entries[0],left,53,160,folio);heading(entries[1],left,63,75.5,folio)
  let list=Array(entries.dropFirst(2));var yL:CGFloat=73,yR:CGFloat=73
  for (i,e) in list.enumerated(){if i<22{yL=row(e,left,yL,75.5,folio)}else{yR=row(e,right,yR,75.5,folio)}}
  maxBottom=max(maxBottom,yL,yR)
 }else{
  heading(entries[0],left,54,75.5,folio);var yL:CGFloat=63
  for e in entries[1..<15]{yL=row(e,left,yL,75.5,folio)}
  heading(entries[15],right,54,75.5,folio);var yR:CGFloat=63
  for e in entries[16..<37]{yR=row(e,right,yR,75.5,folio)}
  yR=row(entries[37],right,yR+5,75.5,folio)
  maxBottom=max(maxBottom,yL,yR,209)
 }
 label("THE VEGETABLE GURU",footer,left,228.5,false,folio==3 ? NSColor.white:ink);label(String(folio),footer,left+160,228.5,true)
 c.endPDFPage()
}
c.closePDF()
guard rows.count==84,arts.count==0,maxBottom<225.5 else{fatalError("Rows or footer clearance: \(rows.count), \(maxBottom)")}
let checks:[String:Any]=["date":"2026-11-25","status":"Selected photos A/B; bottom-left comparison awaiting review","pages":2,"folios":[2,3],"trimMM":[185,240],"entries":rows,"entryCount":rows.count,"thumbnailPlacements":arts,"textColour":"#173e2c","categoryKeyRemoved":true,"categoryColoursRemoved":true,"bodyFontPt":10.5,"contentBottomMM":maxBottom,"footerClearanceMM":228.5-maxBottom,"copyChanges":["None in this revision; all text and destinations retained from label revision"],"unitScope":"Common contents proof for both measurement editions; edition wording belongs only on cover/title page"]
try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("CHECKS.json"))

print("Created native two-page contents: 84 entries; footer clearance",228.5-maxBottom,"mm")
