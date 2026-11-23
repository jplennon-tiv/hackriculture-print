import Foundation
import AppKit
import CoreText
import ImageIO

let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let work=root.appendingPathComponent("docs/publication/vegetable-photo-header-trials-2026-11-22")
let mm:CGFloat=72/25.4, W:CGFloat=185*72/25.4, H:CGFloat=240*72/25.4
let source=CGPDFDocument(work.appendingPathComponent("native-header-sources.pdf") as CFURL)!
func colour(_ value:String)->NSColor {let n=Int(value,radix:16)!;return NSColor(srgbRed:CGFloat((n>>16)&255)/255,green:CGFloat((n>>8)&255)/255,blue:CGFloat(n&255)/255,alpha:1)}
let paper=colour("fff8e9"),ink=colour("173e2c")
func box(_ x:CGFloat,_ top:CGFloat,_ w:CGFloat,_ h:CGFloat)->CGRect {CGRect(x:x*mm,y:H-(top+h)*mm,width:w*mm,height:h*mm)}
func font(_ display:Bool,_ size:CGFloat,_ weight:CGFloat=400)->CTFont {
 let file=display ? "richer-a-1.woff2":"richer-a-6.woff2"
 let ds=CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/"+file) as CFURL) as! [CTFontDescriptor]
 let d=display ? ds[0]:CTFontDescriptorCreateCopyWithVariation(ds[0],NSNumber(value:0x77676874),weight)
 return CTFontCreateWithFontDescriptor(d,size,nil)
}
var media=CGRect(x:0,y:0,width:W,height:H)
let c=CGContext(work.appendingPathComponent("headers.pdf") as CFURL,mediaBox:&media,[kCGPDFContextTitle:"Vegetable Guru garden-photo header proposals"] as CFDictionary)!
var records:[[String:Any]]=[]
func text(_ str:String,_ f:CTFont,_ x:CGFloat,_ top:CGFloat,_ col:NSColor=ink,_ centre:Bool=false)->CGFloat {
 let a=NSAttributedString(string:str,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:col])
 let line=CTLineCreateWithAttributedString(a),b=CTLineGetBoundsWithOptions(line,.useGlyphPathBounds)
 c.textPosition=CGPoint(x:x*mm-(centre ? b.midX:b.minX),y:H-top*mm-b.maxY);CTLineDraw(line,c)
 return b.width/mm
}
func photo(_ name:String,_ rect:CGRect,_ fx:CGFloat=0.6,_ fy:CGFloat=0.65) {
 let url=work.appendingPathComponent("assets/"+name+"-growing-in-soil.png")
 let im=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
 let scale=max(rect.width/CGFloat(im.width),rect.height/CGFloat(im.height)),w=CGFloat(im.width)*scale,h=CGFloat(im.height)*scale
 let x=rect.minX-(w-rect.width)*fx,y=rect.minY-(h-rect.height)*(1-fy)
 c.saveGState();c.clip(to:rect);c.interpolationQuality = .high;c.draw(im,in:CGRect(x:x,y:y,width:w,height:h));c.restoreGState()
 records.append(["crop":name,"frameMM":[rect.minX/mm,(H-rect.maxY)/mm,rect.width/mm,rect.height/mm],"effectiveDPI":72/scale,"focus":[fx,fy]])
}
func badge(_ x:CGFloat,_ top:CGFloat,_ scale:CGFloat,_ accent:NSColor) {
 c.saveGState();let cx=(x+18.5*scale)*mm,cy=H-(top+6.5*scale)*mm
 c.translateBy(x:cx,y:cy);c.rotate(by:3*CGFloat.pi/180);c.scaleBy(x:scale,y:scale);c.translateBy(x:-18.5*mm,y:-6.5*mm)
 c.setFillColor(paper.cgColor);c.setStrokeColor(ink.cgColor);c.setLineWidth(1.25);c.addEllipse(in:CGRect(x:0,y:0,width:37*mm,height:13*mm));c.drawPath(using:.fillStroke)
 func line(_ s:String,_ f:CTFont,_ y:CGFloat,_ col:NSColor) {
  let l=CTLineCreateWithAttributedString(NSAttributedString(string:s,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:col]));let b=CTLineGetBoundsWithOptions(l,.useGlyphPathBounds)
  c.textPosition=CGPoint(x:18.5*mm-b.midX,y:y*mm);CTLineDraw(l,c)
 }
 line("DIFFICULTY",font(false,7.3,900),9.7,ink);line("Fairly Easy",font(true,13.1),4.7,ink)
 for i in 0..<5 {c.setFillColor((i<2 ? accent:accent.withAlphaComponent(0.22)).cgColor);c.fillEllipse(in:CGRect(x:(10+CGFloat(i)*2.7)*mm,y:1.5*mm,width:1.8*mm,height:1.8*mm))}
 let l=CTLineCreateWithAttributedString(NSAttributedString(string:"2/5",attributes:[NSAttributedString.Key(kCTFontAttributeName as String):font(false,7.2,800),.foregroundColor:ink]));c.textPosition=CGPoint(x:24.1*mm,y:1.5*mm);CTLineDraw(l,c)
 c.restoreGState()
}
for id in ["A","B","C"] {for crop in ["carrot","kale"] {
 let carrot=crop=="carrot", page=source.page(at:carrot ? 1:2)!
 let soft=colour(carrot ? "ffe1b7":"dce6cc"),accent=colour(carrot ? "ff781f":"56834a"),deep=colour(carrot ? "a44007":"386337")
 c.beginPDFPage(nil);c.saveGState();c.clip(to:box(0,0,185,33));c.setFillColor(paper.cgColor);c.fill(box(0,0,185,33))
 if id != "C" {
  c.saveGState();c.clip(to:box(0,0,103,33));c.drawPDFPage(page);c.restoreGState()
 }
 if id=="A" {
  c.setFillColor(soft.cgColor);c.fillEllipse(in:box(105,-27,91,75))
  c.saveGState();c.addEllipse(in:box(110,-26,88,74));c.clip();photo(crop,box(110,0,75,33),0.63,0.82);c.restoreGState()
  badge(131,8,1,deep)
 } else if id=="B" {
  c.saveGState();let rect=box(111,3.2,66,28.2);c.translateBy(x:rect.midX,y:rect.midY);c.rotate(by:-2*CGFloat.pi/180);c.translateBy(x:-rect.midX,y:-rect.midY)
  c.setFillColor(soft.cgColor);c.fill(rect.insetBy(dx:-2,dy:-2));c.addPath(CGPath(roundedRect:rect,cornerWidth:3,cornerHeight:3,transform:nil));c.clip();photo(crop,rect,0.62,0.8);c.restoreGState()
  badge(65,20,0.9,deep)
 } else {
  photo(crop,box(79,0,106,33),0.62,0.87)
  let p=CGMutablePath();p.move(to:CGPoint(x:0,y:H));p.addLine(to:CGPoint(x:84*mm,y:H));p.addCurve(to:CGPoint(x:94*mm,y:H-33*mm),control1:CGPoint(x:81*mm,y:H-12*mm),control2:CGPoint(x:86*mm,y:H-26*mm));p.addLine(to:CGPoint(x:0,y:H-33*mm));p.closeSubpath();c.setFillColor(soft.cgColor);c.addPath(p);c.fillPath()
  let q=CGMutablePath();q.move(to:CGPoint(x:0,y:H));q.addLine(to:CGPoint(x:82*mm,y:H));q.addCurve(to:CGPoint(x:92*mm,y:H-33*mm),control1:CGPoint(x:79*mm,y:H-12*mm),control2:CGPoint(x:84*mm,y:H-26*mm));q.addLine(to:CGPoint(x:0,y:H-33*mm));q.closeSubpath();c.setFillColor(paper.cgColor);c.addPath(q);c.fillPath()
  _=text(carrot ? "ROOT CROPS":"BRASSICAS",font(false,10,900),8,5.5,deep)
  c.saveGState();let x:CGFloat=8*mm,y=H-12*mm;c.translateBy(x:x,y:y);c.rotate(by:4*CGFloat.pi/180);c.translateBy(x:-x,y:-y)
  let title=NSMutableAttributedString(string:(carrot ? "Carrot":"Kale")+" .",attributes:[NSAttributedString.Key(kCTFontAttributeName as String):font(true,40.5),.foregroundColor:ink])
  title.addAttribute(.foregroundColor,value:accent,range:NSRange(location:title.length-1,length:1))
  let line=CTLineCreateWithAttributedString(title),bounds=CTLineGetBoundsWithOptions(line,.useGlyphPathBounds)
  c.textPosition=CGPoint(x:8*mm-bounds.minX,y:H-12*mm-bounds.maxY);CTLineDraw(line,c);c.restoreGState()
  _=text("HARVEST SEASONS",font(false,7,900),8,24.7)
  _=text(carrot ? "Summer / Autumn":"Spring / Autumn / Winter",font(false,9,900),8,28.8)
  badge(141,3.5,1,deep)
 }
 c.restoreGState();c.endPDFPage()
}}
c.closePDF()
try JSONSerialization.data(withJSONObject:["status":"proposal","headerHeightMM":33,"pictures":records,"body":"Not drawn or edited by this header renderer","nativeFonts":["Lilita One","Nunito Sans"]],options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("HEADER-CHECKS.json"))
print("Generated six native-type photo header overlays.")
