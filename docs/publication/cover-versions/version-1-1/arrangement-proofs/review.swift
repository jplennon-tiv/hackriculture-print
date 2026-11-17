import Foundation
import CoreGraphics
import ImageIO
import PDFKit

// Run after build.cjs, with the generated proof directory as the first argument.
let out = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let names = try FileManager.default.contentsOfDirectory(atPath: out.path)
    .filter { $0.hasSuffix(".png") && $0.first?.isNumber == true }.sorted()
precondition(names.count == 7)
let pdf = out.appendingPathComponent("Vegetable-Guru-Harvest-Arrangements.pdf")
var trim = CGRect(x: 0, y: 0, width: 185 * 72 / 25.4, height: 240 * 72 / 25.4)
let context = CGContext(pdf as CFURL, mediaBox: &trim, nil)!
for (index, file) in (["Harvest-Arrangements-Overview.png"] + names).enumerated() {
    let url = out.appendingPathComponent(file)
    let image = CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
    var box = index == 0 ? CGRect(x:0,y:0,width:800,height:800*815/1126) : trim
    let size = Data(bytes:&box,count:MemoryLayout<CGRect>.size)
    context.beginPDFPage([kCGPDFContextMediaBox as String:size] as CFDictionary)
    context.draw(image,in:box)
    context.endPDFPage()
}
context.closePDF()
let document = PDFDocument(url:pdf)!
precondition(document.pageCount == 8)
for i in 0..<8 {
    let page = document.page(at:i)!
    precondition(page.thumbnail(of:CGSize(width:290,height:370),for:.mediaBox).tiffRepresentation != nil)
}
print("Verified eight renderable pages.")
