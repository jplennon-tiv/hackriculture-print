import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let source=CommandLine.arguments[1], prefix=CommandLine.arguments[2]
let doc=CGPDFDocument(URL(fileURLWithPath:source) as CFURL)!, page=doc.page(at:1)!
let box=page.getBoxRect(.mediaBox)
for scale in [1.0,1.25,1.5,2.0,3.0] {
 let width=Int(ceil(box.width*scale)),height=Int(ceil(box.height*scale))
 let ctx=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 ctx.setFillColor(CGColor(gray:1,alpha:1));ctx.fill(CGRect(x:0,y:0,width:width,height:height))
 ctx.scaleBy(x:scale,y:scale);ctx.drawPDFPage(page)
 let url=URL(fileURLWithPath:"\(prefix)-\(scale).png")
 let dest=CGImageDestinationCreateWithURL(url as CFURL,UTType.png.identifier as CFString,1,nil)!
 CGImageDestinationAddImage(dest,ctx.makeImage()!,nil);CGImageDestinationFinalize(dest)
}
