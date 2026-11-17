import AppKit
import CoreGraphics
import CoreText
import Foundation
import ImageIO
import PDFKit

let args = CommandLine.arguments
let root = URL(fileURLWithPath:args[1]), work = URL(fileURLWithPath:args[2]), output = URL(fileURLWithPath:args[3])
let mm: CGFloat = 72/25.4
let format = CGSize(width:185*mm,height:240*mm)
let green = NSColor(srgbRed:7/255,green:62/255,blue:40/255,alpha:1)
let ink = NSColor(srgbRed:34/255,green:48/255,blue:35/255,alpha:1)
let muted = NSColor(srgbRed:86/255,green:88/255,blue:64/255,alpha:1)
let gold = NSColor(srgbRed:214/255,green:160/255,blue:38/255,alpha:1)
struct Copy: Decodable { let runningTitle:String, headline:[String], lead:String, blurb:String, authorNote:String, season:String }
let copy = try JSONDecoder().decode(Copy.self,from:Data(contentsOf:work.appendingPathComponent("copy.json")))
struct PixelCrop: Decodable { let x:Int, y:Int, width:Int, height:Int }
struct PortraitRevision: Decodable { let headline:[String], photo:String, sourceCrop:PixelCrop }
let revision:PortraitRevision? = args.count > 7 ? try JSONDecoder().decode(PortraitRevision.self,from:Data(contentsOf:URL(fileURLWithPath:args[7]))) : nil
struct OvalRevision: Decodable { let blurb:String, extraCopy:String, closing:String, authorName:String, authorLines:[String] }
let oval: OvalRevision? = args.count > 8 ? try JSONDecoder().decode(OvalRevision.self,from:Data(contentsOf:URL(fileURLWithPath:args[8]))) : nil
func image(_ url: URL) -> CGImage {
    let source = CGImageSourceCreateWithURL(url as CFURL,nil)!
    return CGImageSourceCreateImageAtIndex(source,0,nil)!
}
let board = image(URL(fileURLWithPath:args[4])), front = image(URL(fileURLWithPath:args[5]))
let harvest = image(root.appendingPathComponent("docs/assets/harvest-alternatives/with-cover-shadows/03-kitchen-roots-upper.png"))
let price = "£"+args[6]
func font(_ display:Bool, _ size:CGFloat, _ weight:CGFloat=400) -> CTFont {
    let file = display ? "richer-a-1.woff2" : "richer-a-6.woff2"
    let descriptors = CTFontManagerCreateFontDescriptorsFromURL(root.appendingPathComponent("public/fonts/"+file) as CFURL) as! [CTFontDescriptor]
    let descriptor = display ? descriptors[0] : CTFontDescriptorCreateCopyWithVariation(descriptors[0],NSNumber(value:0x77676874),weight)
    return CTFontCreateWithFontDescriptor(descriptor,size,nil)
}
func rect(_ x:CGFloat,_ top:CGFloat,_ width:CGFloat,_ height:CGFloat) -> CGRect {
    CGRect(x:x*mm,y:(240-top-height)*mm,width:width*mm,height:height*mm)
}
func line(_ context:CGContext, _ s:String,_ f:CTFont,_ x:CGFloat,_ baseline:CGFloat,_ colour:NSColor,_ tracking:CGFloat=0) {
    let attrs:[NSAttributedString.Key:Any] = [.font:f,.foregroundColor:colour,.kern:tracking]
    let value = CTLineCreateWithAttributedString(NSAttributedString(string:s,attributes:attrs))
    precondition(x*mm+CTLineGetTypographicBounds(value,nil,nil,nil)<format.width)
    context.textMatrix = .identity
    context.textPosition = CGPoint(x:x*mm,y:(240-baseline)*mm)
    CTLineDraw(value,context)
}
@discardableResult
func paragraph(_ context:CGContext,_ s:String,_ f:CTFont,x:CGFloat,top:CGFloat,width:CGFloat,limit:CGFloat,leading:CGFloat,colour:NSColor) -> CGFloat {
    let style=NSMutableParagraphStyle()
    style.minimumLineHeight=leading; style.maximumLineHeight=leading; style.hyphenationFactor=0
    let str=NSAttributedString(string:s,attributes:[.font:f,.foregroundColor:colour,.paragraphStyle:style])
    let setter=CTFramesetterCreateWithAttributedString(str)
    let box=rect(x,top,width,limit-top)
    let frame=CTFramesetterCreateFrame(setter,CFRange(location:0,length:0),CGPath(rect:box,transform:nil),nil)
    precondition(CTFrameGetVisibleStringRange(frame).length==str.length,"Text overflow at \(top)")
    let lines=CTFrameGetLines(frame) as! [CTLine]
    var origins=Array(repeating:CGPoint.zero,count:lines.count)
    CTFrameGetLineOrigins(frame,CFRange(location:0,length:0),&origins)
    context.textMatrix = .identity
    CTFrameDraw(frame,context)
    let bottom=240-(box.minY+origins.last!.y-CTFontGetDescent(f))/mm
    print("Copy at \(top) mm occupies \(lines.count) lines through \(bottom) mm")
    return bottom
}
func croppedPortrait(_ revision:PortraitRevision) -> CGImage {
    let original = image(root.appendingPathComponent(revision.photo))
    let crop = revision.sourceCrop
    let square = CGRect(x:crop.x,y:crop.y,width:crop.width,height:crop.height)
    precondition(CGRect(x:0,y:0,width:original.width,height:original.height).contains(square))
    return original.cropping(to:square)!
}
func portraitFooter(_ c:CGContext,_ revision:PortraitRevision) {
    let face = croppedPortrait(revision)
    let sticker = rect(15,171.1,57,57)
    c.saveGState()
    c.setShadow(offset:CGSize(width:-0.7*mm,height:-1.1*mm),blur:1.55*mm,color:NSColor.black.withAlphaComponent(0.30).cgColor)
    c.setFillColor(NSColor.white.cgColor)
    c.fillEllipse(in:sticker)
    c.restoreGState()
    c.saveGState()
    let window = sticker.insetBy(dx:1.85*mm,dy:1.85*mm)
    c.addEllipse(in:window)
    c.clip()
    c.draw(face,in:window)
    c.restoreGState()
    paragraph(c,copy.authorNote,font(false,12.1,650),x:77,top:174.6,width:94,limit:199.4,leading:15.5,colour:green)
    line(c,price,font(true,16),77,227.9,green)
}
let pinnedSticker = args.count > 9 && args[9] == "--pinned"
let rectangularSticker = pinnedSticker || args.last == "--rectangle"
let paperLayer = pinnedSticker ? image(URL(fileURLWithPath:args[10])) : nil
let pinLayer = pinnedSticker ? image(URL(fileURLWithPath:args[11])) : nil
func authorSticker(_ c:CGContext,_ portrait:PortraitRevision,_ words:OvalRevision) {
    let badge = rectangularSticker ? rect(17,156,129,43.5) : rect(14,153.8,143,49.2)
    c.saveGState()
    c.translateBy(x:badge.midX,y:badge.midY)
    c.rotate(by:4 * .pi / 180)
    c.translateBy(x:-badge.midX,y:-badge.midY)
    let effectBounds = badge.insetBy(dx:-6*mm,dy:-6*mm)
    if let paperLayer {
        c.draw(paperLayer,in:effectBounds)
    } else {
        c.saveGState()
        c.setShadow(offset:CGSize(width:-0.65*mm,height:-1.0*mm),blur:1.15*mm,color:NSColor.black.withAlphaComponent(0.27).cgColor)
        c.setFillColor(NSColor.white.cgColor)
        if rectangularSticker { c.fill(badge) } else { c.fillEllipse(in:badge) }
        c.restoreGState()
    }
    let original=image(root.appendingPathComponent(portrait.photo))
    if rectangularSticker {
        let sample=CGRect(x:1055,y:20,width:1875,height:1500)
        let window=rect(18.75,157.75,50,40)
        c.draw(original.cropping(to:sample)!,in:window)
    } else {
        c.saveGState()
        c.addEllipse(in:badge.insetBy(dx:1.3*mm,dy:1.3*mm))
        c.clip()
        // The oval proof uses a curved crop with a single continuous white rim.
        c.addEllipse(in:rect(12,148,63,62))
        c.clip()
        let sample=CGRect(x:600,y:0,width:2320,height:1800)
        let face=original.cropping(to:sample)!
        let scale:CGFloat=44.8/1550
        c.draw(face,in:rect(53+(sample.minX-2010)*scale,155.5,sample.width*scale,sample.height*scale))
        c.restoreGState()
    }
    line(c,words.authorName,font(true,17.8),78,170.5,green)
    for (index,words) in words.authorLines.enumerated() {
        line(c,words,font(false,11.3,630),78,176.5+CGFloat(index)*4.85,ink)
    }
    if let pinLayer { c.draw(pinLayer,in:effectBounds) }
    c.restoreGState()
}
func ovalLayout(_ c:CGContext,_ portrait:PortraitRevision,_ words:OvalRevision) {
    let artWidth:CGFloat=68.5
    let artHeight=artWidth*CGFloat(harvest.height)/CGFloat(harvest.width)
    c.draw(harvest,in:rect(109.5,29,artWidth,artHeight))
    let leadEnd=paragraph(c,copy.lead,font(false,14.75,760),x:15,top:59,width:154,limit:90,leading:18.1,colour:green)
    let bodyEnd=paragraph(c,words.blurb,font(false,12.9,475),x:15,top:leadEnd+4,width:153,limit:119,leading:16.9,colour:ink)
    let exampleEnd=paragraph(c,words.extraCopy,font(false,12.9,475),x:15,top:bodyEnd+3,width:153,limit:145,leading:16.9,colour:ink)
    let seasonEnd=paragraph(c,words.closing,font(false,12.9,475),x:15,top:exampleEnd+3,width:153,limit:155,leading:16.9,colour:ink)
    precondition(seasonEnd<153.8)
    authorSticker(c,portrait,words)
    line(c,price,font(true,16),15,227.9,green)
}
func rear(_ c:CGContext) {
    c.saveGState()
    c.clip(to:rect(0,0,185,240))
    c.draw(board,in:rect(0,0,185,240))
    c.setFillColor(gold.cgColor); c.fill(rect(15,12.3,8,1.2))
    line(c,copy.runningTitle,font(false,9.4,850),26,14,green,1.25)
    let headline = revision?.headline ?? copy.headline
    line(c,headline[0],font(true,42),14.5,32.5,green)
    line(c,headline[1],font(true,42),14.5,45.5,green)
    if let oval, let revision {
        ovalLayout(c,revision,oval)
    } else {
        let imageWidth:CGFloat=154
        let imageHeight=imageWidth*CGFloat(harvest.height)/CGFloat(harvest.width)
        c.draw(harvest,in:rect(24,49,imageWidth,imageHeight))
        let leadBottom=paragraph(c,copy.lead,font(false,14.75,760),x:15,top:103,width:154,limit:135,leading:18.1,colour:green)
        let bodyBottom=paragraph(c,copy.blurb,font(false,12.9,475),x:15,top:leadBottom+4.2,width:153,limit:172,leading:16.9,colour:ink)
        let seasonBottom=paragraph(c,copy.season,font(false,12.9,475),x:15,top:bodyBottom+3.0,width:153,limit:169.5,leading:16.9,colour:ink)
        precondition(seasonBottom<169.5)
        if let revision = revision {
            portraitFooter(c,revision)
        } else {
            c.setFillColor(gold.cgColor);c.fill(rect(15,172,155,0.48))
            line(c,"44",font(true,28),15,185.2,green)
            line(c,"growing guides",font(false,11.3,790),29,184.8,green)
            line(c,"14",font(true,28),89,185.2,green)
            line(c,"troubleshooting guides",font(false,11.3,790),102,184.8,green)
            c.setFillColor(gold.cgColor);c.fill(rect(15,191.3,155,0.48))
            paragraph(c,copy.authorNote,font(false,10.6,550),x:15,top:200.3,width:85,limit:221.8,leading:14,colour:ink)
            line(c,price,font(true,16),15,231,green)
        }
    }
    c.setFillColor(NSColor.white.cgColor); c.fill(rect(118,201,52,30))
    line(c,"ISBN / BARCODE",font(false,7.2,700),121,206,muted,0.55)
    c.restoreGState()
}
let filename: String
if pinnedSticker { filename = "The-Vegetable-Guru-Pinned-Author-Note.pdf" }
else if rectangularSticker { filename = "The-Vegetable-Guru-Rectangular-Sticker.pdf" }
else if oval != nil { filename = "The-Vegetable-Guru-Oval-Rear-Cover.pdf" }
else if revision != nil { filename = "The-Vegetable-Guru-Portrait-Rear-Cover.pdf" }
else { filename = "The-Vegetable-Guru-Rear-Cover.pdf" }
let proof=output.appendingPathComponent(filename)
var panel=CGRect(origin:.zero,size:format)
let pdf=CGContext(proof as CFURL,mediaBox:&panel,[kCGPDFContextTitle:"The Vegetable Guru — cream rear cover proposal",kCGPDFContextAuthor:"John Lennon"] as CFDictionary)!
pdf.beginPDFPage(nil); rear(pdf); pdf.endPDFPage()
var spread=CGRect(x:0,y:0,width:format.width*2,height:format.height)
let box=Data(bytes:&spread,count:MemoryLayout<CGRect>.size)
pdf.beginPDFPage([kCGPDFContextMediaBox as String:box] as CFDictionary)
rear(pdf)
pdf.draw(front,in:CGRect(x:format.width,y:0,width:format.width,height:format.height))
pdf.endPDFPage(); pdf.closePDF()
let doc=PDFDocument(url:proof)!
precondition(doc.pageCount==2)
for n in 0..<2 {
    let page=doc.page(at:n)!
    let area=page.bounds(for:.mediaBox)
    precondition(abs(area.width-format.width*CGFloat(n+1))<1 && abs(area.height-format.height)<1)
    precondition(page.string?.contains(price)==true)
}
