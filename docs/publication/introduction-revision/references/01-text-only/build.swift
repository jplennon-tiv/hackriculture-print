import Foundation
import AppKit
import CoreText
import CoreGraphics

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let work = root.appendingPathComponent("docs/publication/introduction-revision")
let output = root.appendingPathComponent("output/pdf/introduction-revision/Introduction-preview.pdf")
let mm: CGFloat = 72 / 25.4
let width: CGFloat = 185 * mm, height: CGFloat = 240 * mm
let ink = NSColor(srgbRed: 23/255, green: 62/255, blue: 44/255, alpha: 1)
let paper = NSColor(srgbRed: 1, green: 248/255, blue: 233/255, alpha: 1)
let orange = NSColor(srgbRed: 164/255, green: 64/255, blue: 7/255, alpha: 1)
func font(_ file: String, _ size: CGFloat, _ weight: CGFloat = 400) -> CTFont {
 let ds = CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/"+file) as CFURL) as! [CTFontDescriptor]
 let d = file.contains("-6.") ? CTFontDescriptorCreateCopyWithVariation(ds[0], NSNumber(value: 0x77676874), weight) : ds[0]
 return CTFontCreateWithFontDescriptor(d, size, nil)
}
let body = font("richer-a-6.woff2", 10.5)
let bold = font("richer-a-6.woff2", 10.5, 800)
let small = font("richer-a-6.woff2", 7.35, 800)
let heading = font("richer-a-1.woff2", 32.25)
var media = CGRect(x:0,y:0,width:width,height:height)
let context = CGContext(output as CFURL, mediaBox: &media, [kCGPDFContextTitle: "The Vegetable Guru — Introduction preview", kCGPDFContextAuthor: "John Lennon"] as CFDictionary)!
context.beginPDFPage(nil)
context.setFillColor(paper.cgColor); context.fill(media)
func label(_ text: String, _ f: CTFont, _ x: CGFloat, _ top: CGFloat, _ colour: NSColor = ink) {
 let a = NSAttributedString(string:text, attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f, .foregroundColor:colour])
 let line = CTLineCreateWithAttributedString(a)
 context.textPosition = CGPoint(x:x,y:height-top-CTFontGetAscent(f))
 CTLineDraw(line,context)
}
label("A WORD FROM THE AUTHOR",small,17*mm,15*mm)
label("Introduction",heading,17*mm,23*mm)
let artPath = root.appendingPathComponent("docs/publication/topic-pages/techniques-expansion/assets/harvest-bowl-v1.png")
let art = NSImage(contentsOf:artPath)!
var proposed = NSRect(origin:.zero,size:art.size)
let cgArt = art.cgImage(forProposedRect:&proposed,context:nil,hints:nil)!
let artBox = CGRect(x:128*mm,y:height-47*mm,width:49*mm,height:35*mm)
let scale = min(artBox.width/CGFloat(cgArt.width),artBox.height/CGFloat(cgArt.height))
let dest = CGRect(x:artBox.midX-CGFloat(cgArt.width)*scale/2,y:artBox.midY-CGFloat(cgArt.height)*scale/2,width:CGFloat(cgArt.width)*scale,height:CGFloat(cgArt.height)*scale)
context.draw(cgArt,in:dest)
let copy = try String(contentsOf:work.appendingPathComponent("introduction.txt"),encoding:.utf8).trimmingCharacters(in:.whitespacesAndNewlines)
let paragraphs = copy.components(separatedBy:"\n\n")
let text = NSMutableAttributedString(string:"")
for (index,p) in paragraphs.enumerated() {
 let ps = NSMutableParagraphStyle()
 ps.minimumLineHeight = 14.5; ps.maximumLineHeight = 14.5
 ps.paragraphSpacing = index == paragraphs.count-1 ? 0 : 8
 let f = index == paragraphs.count-1 ? bold : body
 text.append(NSAttributedString(string:p+(index == paragraphs.count-1 ? "" : "\n"),attributes:[NSAttributedString.Key(kCTFontAttributeName as String):f,.foregroundColor:ink,.paragraphStyle:ps]))
}
let setter = CTFramesetterCreateWithAttributedString(text)
let bodyTop: CGFloat = 53*mm
let frameRect = CGRect(x:17*mm,y:20*mm,width:160*mm,height:height-bodyTop-20*mm)
let frame = CTFramesetterCreateFrame(setter,CFRange(location:0,length:text.length),CGPath(rect:frameRect,transform:nil),nil)
let visible = CTFrameGetVisibleStringRange(frame)
guard visible.length == text.length else {fatalError("Text overflow: \(visible.length) of \(text.length)")}
CTFrameDraw(frame,context)
let lines = CTFrameGetLines(frame) as! [CTLine]
var origins = Array(repeating:CGPoint.zero,count:lines.count)
CTFrameGetLineOrigins(frame,CFRange(location:0,length:0),&origins)
var contentBottom: CGFloat = 0
for (i,l) in lines.enumerated() {
 var ascent:CGFloat=0,descent:CGFloat=0,leading:CGFloat=0
 _ = CTLineGetTypographicBounds(l,&ascent,&descent,&leading)
 contentBottom = max(contentBottom,height-(frameRect.minY+origins[i].y-descent))
}
let footerTop:CGFloat = 228.5*mm
label("THE VEGETABLE GURU",small,17*mm,footerTop)
let folio = CTLineCreateWithAttributedString(NSAttributedString(string:"7",attributes:[NSAttributedString.Key(kCTFontAttributeName as String):small]))
let folioWidth = CTLineGetTypographicBounds(folio,nil,nil,nil)
label("7",small,width-8*mm-folioWidth,footerTop)
context.endPDFPage(); context.closePDF()
let checks:[String:Any] = ["date":"2026-11-15","status":"Working page-7 preview; not yet integrated or design-approved","renderer":"Offline CoreText/CoreGraphics; local Vite startup denied EPERM", "pages":1,"trimMm":[185,240],"folio":7,"bodyFontPt":10.5,"bodyLeadingPt":14.5,"allTextFits":visible.length == text.length,"lineCount":lines.count,"contentBottomMm":Double(contentBottom/mm),"footerClearanceMm":Double((footerTop-contentBottom)/mm),"wordCount":copy.split(whereSeparator:{$0.isWhitespace}).count,"fonts":[CTFontCopyPostScriptName(body) as String,CTFontCopyPostScriptName(heading) as String],"artwork":"docs/publication/topic-pages/techniques-expansion/assets/harvest-bowl-v1.png","units":"Identical copy for both editions; no measurements","visualReview":"pending"]
let data = try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys])
try data.write(to:work.appendingPathComponent("CHECKS.json"))
print(String(data:data,encoding:.utf8)!)
