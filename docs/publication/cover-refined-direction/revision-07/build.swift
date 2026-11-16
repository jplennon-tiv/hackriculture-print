import Foundation
import AppKit
import CoreText
import CoreGraphics

// Focused cover proposal: original photo pixels, exact existing blurb, real spread.
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let out = root.appendingPathComponent("output/pdf/cover-refined-direction/revision-07")
let work = root.appendingPathComponent("docs/publication/cover-refined-direction/revision-07")
let mm: CGFloat = 72 / 25.4
let w: CGFloat = 185 * mm, h: CGFloat = 240 * mm
let forest = NSColor(srgbRed: 6/255, green: 77/255, blue: 50/255, alpha: 1)
let cream = NSColor(srgbRed: 1, green: 248/255, blue: 233/255, alpha: 1)
let frontPath = "generated_images/exec-900e55bf-96a1-4efe-9fb6-5f6f5e584aaf.png"
let previousPath = "generated_images/exec-4e5246c9-2427-492a-8eb4-bb092933c6fc.png"
let photoPath = "docs/publication/cover-photo-search/tomato-harvest-study/frames/T05_05m16s042_4K.png"
let spreadPath = "docs/publication/variety-additions/spreads/carrot-imperial.jpg"
let p1 = "Growing vegetables raises plenty of questions: when to sow, how much space to leave, when to harvest, and what to do when something starts eating the crop before you do."
let p2 = "These illustrated guides bring the useful details together, with clear calendars, planting advice and organic ways to tackle common troubles."
let p3 = "There’s practical help with soil, compost, watering and greenhouses too. Use it to plan your plot, then turn to the guide you need as each job comes along."

func font(_ size: CGFloat) -> CTFont {
 let ds = CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/richer-a-1.woff2") as CFURL) as! [CTFontDescriptor]
 return CTFontCreateWithFontDescriptor(ds[0], size, nil)
}
func image(_ path: String) -> CGImage {
 let im = NSImage(contentsOf:root.appendingPathComponent(path))!
 var r = NSRect(origin:.zero,size:im.size)
 return im.cgImage(forProposedRect:&r,context:nil,hints:nil)!
}
let front = image(frontPath), previous = image(previousPath)
let photo = image(photoPath), spread = image(spreadPath)
let body = font(14.5), caption = font(9.5)
var checks: [String: Any] = [:]

func text(_ s: String, _ f: CTFont, _ x: CGFloat, _ top: CGFloat, _ ctx: CGContext, _ colour: NSColor = cream, _ pageHeight: CGFloat = h) {
 let line = CTLineCreateWithAttributedString(NSAttributedString(string:s,attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:colour]))
 ctx.textMatrix = .identity
 ctx.textPosition = CGPoint(x:x,y:pageHeight-top-CTFontGetAscent(f))
 CTLineDraw(line,ctx)
}

@discardableResult
func paragraphs(_ strings:[String], x:CGFloat, top:CGFloat, width:CGFloat, maxHeight:CGFloat, ctx:CGContext, key:String) -> CGFloat {
 let attr = NSMutableAttributedString(string:"")
 for (i,s) in strings.enumerated() {
  let ps = NSMutableParagraphStyle()
  ps.minimumLineHeight = 19.2; ps.maximumLineHeight = 19.2
  ps.paragraphSpacing = i == strings.count-1 ? 0 : 8
  ps.hyphenationFactor = 0
  attr.append(NSAttributedString(string:s+(i==strings.count-1 ? "":"\n"),attributes:[NSAttributedString.Key(kCTFontAttributeName as String):body,.foregroundColor:cream,.paragraphStyle:ps]))
 }
 let setter = CTFramesetterCreateWithAttributedString(attr)
 let rect = CGRect(x:x,y:h-top-maxHeight,width:width,height:maxHeight)
 let frame = CTFramesetterCreateFrame(setter,CFRange(location:0,length:attr.length),CGPath(rect:rect,transform:nil),nil)
 let visible = CTFrameGetVisibleStringRange(frame)
 guard visible.length == attr.length else { fatalError("Overflow in \(key): \(visible.length)/\(attr.length)") }
 ctx.textMatrix = .identity
 CTFrameDraw(frame,ctx)
 let lines = CTFrameGetLines(frame) as! [CTLine]
 var origins = Array(repeating:CGPoint.zero,count:lines.count)
 CTFrameGetLineOrigins(frame,CFRange(location:0,length:0),&origins)
 var bottom = top
 for (i,line) in lines.enumerated() {
  var descent:CGFloat=0
  _ = CTLineGetTypographicBounds(line,nil,&descent,nil)
  bottom = max(bottom,h-(rect.minY+origins[i].y-descent))
 }
 checks[key] = ["allTextFits":true,"lines":lines.count,"topMm":top/mm,"bottomMm":bottom/mm,"fontPt":14.5,"leadingPt":19.2]
 return bottom
}

func back(_ ctx:CGContext) {
 ctx.setFillColor(forest.cgColor);ctx.fill(CGRect(x:0,y:0,width:w,height:h))
 text("The",font(23),13*mm,10*mm,ctx)
 text("Vegetable Guru",font(40),13*mm,19*mm,ctx)
 text("44 growing guides and 14 troubleshooting guides",font(14.1),13*mm,38*mm,ctx)
 let firstBottom = paragraphs([p1,p2],x:13*mm,top:51*mm,width:159*mm,maxHeight:65*mm,ctx:ctx,key:"openingCopy")
 let rowTop = firstBottom + 7*mm

 // Original T05 crop bounds in source-pixel coordinates; clip placement only.
 let crop = CGRect(x:1190,y:0,width:1665,height:2160)
 let photoW:CGFloat = 77*mm, photoH = photoW*crop.height/crop.width
 let photoRect = CGRect(x:13*mm,y:h-rowTop-photoH,width:photoW,height:photoH)
 let edge:CGFloat = 1.1*mm
 ctx.setFillColor(cream.cgColor);ctx.fill(photoRect.insetBy(dx:-edge,dy:-edge))
 ctx.saveGState();ctx.clip(to:photoRect)
 let scale = photoW/crop.width
 // CGContext image coordinates use a bottom origin; crop y is top-origin.
 let bottomCrop = CGFloat(photo.height)-crop.maxY
 let placed = CGRect(x:photoRect.minX-crop.minX*scale,y:photoRect.minY-bottomCrop*scale,width:CGFloat(photo.width)*scale,height:CGFloat(photo.height)*scale)
 ctx.interpolationQuality = .high
 ctx.draw(photo,in:placed);ctx.restoreGState()
 text("John Lennon",caption,13*mm,rowTop+photoH+2.5*mm,ctx)

 let sideBottom = paragraphs([p3],x:99*mm,top:rowTop,width:73*mm,maxHeight:59*mm,ctx:ctx,key:"sideCopy")
 let spreadW:CGFloat = 73*mm, spreadH=spreadW*CGFloat(spread.height)/CGFloat(spread.width)
 let spreadTop = max(sideBottom+6*mm,rowTop+photoH-spreadH)
 let spreadRect = CGRect(x:99*mm,y:h-spreadTop-spreadH,width:spreadW,height:spreadH)
 ctx.setFillColor(cream.cgColor);ctx.fill(spreadRect.insetBy(dx:-0.6*mm,dy:-0.6*mm))
 ctx.draw(spread,in:spreadRect)
 let lastBottom = max(rowTop+photoH+7*mm,spreadTop+spreadH)
 guard lastBottom < 219*mm else {fatalError("Image/footer collision \(lastBottom/mm)")}

 text("£17.50",font(23),13*mm,222*mm,ctx)
 let barcode = CGRect(x:122*mm,y:h-233*mm,width:50*mm,height:16*mm)
 ctx.setFillColor(NSColor.white.cgColor);ctx.fill(barcode)
 text("ISBN / BARCODE",font(9),130*mm,222.8*mm,ctx,forest)
 checks["photo"] = ["source":photoPath,"sourceCropXYXY":[1190,0,2855,2160],"placementMm":[13,rowTop/mm,photoW/mm,photoH/mm],"effectiveDpi":1665/(photoW/mm/25.4),"processing":"Original source image embedded; rectangular clip only; no generative edits, retouching or colour adjustment"]
 checks["spread"] = ["source":spreadPath,"placementMm":[99,spreadTop/mm,spreadW/mm,spreadH/mm],"processing":"Exact source raster embedded, no generated microtext"]
 checks["contentBottomMm"] = lastBottom/mm
}

func makePDF(_ name:String,width:CGFloat,height:CGFloat,draw:(CGContext)->Void) {
 var media = CGRect(x:0,y:0,width:width,height:height)
 let ctx = CGContext(out.appendingPathComponent(name) as CFURL,mediaBox:&media,[kCGPDFContextTitle:"The Vegetable Guru — Cover revision 07",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
 ctx.beginPDFPage(nil);draw(ctx);ctx.endPDFPage();ctx.closePDF()
}
makePDF("Back-cover.pdf",width:w,height:h,draw:back)
makePDF("Front-cover.pdf",width:w,height:h) {ctx in ctx.draw(front,in:CGRect(x:0,y:0,width:w,height:h))}

let sheetW:CGFloat = 400*mm, sheetH:CGFloat = 264*mm
var media = CGRect(x:0,y:0,width:sheetW,height:sheetH)
let ctx = CGContext(out.appendingPathComponent("The-Vegetable-Guru-Cover-Development.pdf") as CFURL,mediaBox:&media,[kCGPDFContextTitle:"The Vegetable Guru — Revised front and photographic back",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
func begin(_ width:CGFloat,_ height:CGFloat) {
 var box = CGRect(x:0,y:0,width:width,height:height)
 let data = Data(bytes:&box,count:MemoryLayout<CGRect>.size)
 ctx.beginPDFPage([kCGPDFContextMediaBox:data] as CFDictionary)
}
func labelSheet(_ left:String,_ right:String) {
 ctx.setFillColor(NSColor.white.cgColor);ctx.fill(CGRect(x:0,y:0,width:sheetW,height:sheetH))
 text(left,font(10),10*mm,3.5*mm,ctx,forest,sheetH)
 text(right,font(10),205*mm,3.5*mm,ctx,forest,sheetH)
}
begin(sheetW,sheetH);labelSheet("FRONT — VARIED ILLUSTRATION","BACK — ORIGINAL PHOTOGRAPH")
ctx.draw(front,in:CGRect(x:10*mm,y:10*mm,width:w,height:h))
ctx.saveGState();ctx.translateBy(x:205*mm,y:10*mm);back(ctx);ctx.restoreGState();ctx.endPDFPage()
begin(w,h);ctx.draw(front,in:CGRect(x:0,y:0,width:w,height:h));ctx.endPDFPage()
begin(w,h);back(ctx);ctx.endPDFPage()
begin(sheetW,sheetH);labelSheet("PREVIOUS FRONT","REVISED FRONT")
ctx.draw(previous,in:CGRect(x:10*mm,y:10*mm,width:w,height:h))
ctx.draw(front,in:CGRect(x:205*mm,y:10*mm,width:w,height:h));ctx.endPDFPage();ctx.closePDF()

checks["date"] = "2026-11-15"
checks["status"] = "Proposal for review; not production approval"
checks["pageTrimMm"] = [185,240]
checks["comparisonSheetMm"] = [400,264]
checks["comparisonPages"] = 4
checks["backFont"] = CTFontCopyPostScriptName(body) as String
checks["bodyCopy"] = [p1,p2,p3]
checks["front"] = frontPath
checks["intentionalChanges"] = ["Less uniform matte crop artwork; crossed carrots", "Original author photo on back", "Reduced real interior spread", "Third paragraph moves beside photo", "Back main text in actual Lilita One; prior generated body was lighter sans", "Old back sprout omitted to leave the title compact and provide space for the photograph"]
checks["visualReview"] = "Pending rendered-PDF inspection"
let data = try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys])
try data.write(to:work.appendingPathComponent("CHECKS.json"))
print(String(data:data,encoding:.utf8)!)
