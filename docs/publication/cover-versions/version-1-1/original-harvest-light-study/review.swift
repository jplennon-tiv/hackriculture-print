import Foundation
import CoreGraphics
import ImageIO
import PDFKit

let args = Array(CommandLine.arguments.dropFirst())
precondition(args.count == 3)
let target = URL(fileURLWithPath:args[0])
var trim = CGRect(x:0,y:0,width:185*72/25.4,height:240*72/25.4)
let pdf = CGContext(target as CFURL,mediaBox:&trim,nil)!
for (n,file) in args.dropFirst().enumerated() {
    let src = CGImageSourceCreateWithURL(URL(fileURLWithPath:file) as CFURL,nil)!
    let image = CGImageSourceCreateImageAtIndex(src,0,nil)!
    var box = n == 1 ? CGRect(x:0,y:0,width:900,height:900*CGFloat(image.height)/CGFloat(image.width)) : trim
    let size = Data(bytes:&box,count:MemoryLayout<CGRect>.size)
    pdf.beginPDFPage([kCGPDFContextMediaBox as String:size] as CFDictionary)
    pdf.draw(image,in:box)
    pdf.endPDFPage()
}
pdf.closePDF()
precondition(PDFDocument(url:target)?.pageCount == 2)
