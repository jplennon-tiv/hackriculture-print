import Foundation
import CoreGraphics
import ImageIO
import PDFKit

let args = Array(CommandLine.arguments.dropFirst())
precondition(args.count == 9)
let target = URL(fileURLWithPath:args[0])
var trim = CGRect(x:0,y:0,width:185*72/25.4,height:240*72/25.4)
let pdf = CGContext(target as CFURL,mediaBox:&trim,nil)!
for (index,path) in args.dropFirst().enumerated() {
    let url = URL(fileURLWithPath:path)
    let image = CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
    var rect = index == 0 ? CGRect(x:0,y:0,width:800,height:800*CGFloat(image.height)/CGFloat(image.width)) : trim
    let box = Data(bytes:&rect,count:MemoryLayout<CGRect>.size)
    pdf.beginPDFPage([kCGPDFContextMediaBox as String:box] as CFDictionary)
    pdf.draw(image,in:rect)
    pdf.endPDFPage()
}
pdf.closePDF()
let document = PDFDocument(url:target)!
precondition(document.pageCount == 8)
for index in 0..<8 {
    let page = document.page(at:index)!
    precondition(page.thumbnail(of:CGSize(width:360,height:440),for:.mediaBox).tiffRepresentation != nil)
    if index >= 1 { precondition(abs(page.bounds(for:.mediaBox).width-trim.width)<1.0 && abs(page.bounds(for:.mediaBox).height-trim.height)<1.0) }
}
print("Verified eight renderable pages.")
