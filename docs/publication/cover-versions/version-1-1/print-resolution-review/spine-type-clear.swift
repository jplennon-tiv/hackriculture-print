// Spine clearance revision: same native fonts, sizes and tracking; positions only.
import CoreGraphics
import CoreText
import Foundation

let mm: CGFloat = 72/25.4
let args = CommandLine.arguments
let fontDir = URL(fileURLWithPath: args[1])
let width = CGFloat(Double(args[3])!) * mm
var box = CGRect(x: 0, y: 0, width: width, height: 240*mm)
let pdf = CGContext(URL(fileURLWithPath: args[2]) as CFURL, mediaBox: &box, nil)!
pdf.beginPDFPage(nil)
var geometry: [[String: Any]] = []
func line(_ text: String, _ fontFile: String, _ size: CGFloat, _ center: CGFloat, _ tracking: CGFloat) {
    let url = fontDir.appendingPathComponent(fontFile)
    let descriptors = CTFontManagerCreateFontDescriptorsFromURL(url as CFURL) as! [CTFontDescriptor]
    var descriptor = descriptors[0]
    if fontFile == "richer-a-6.woff2" {
        descriptor = CTFontDescriptorCreateCopyWithVariation(descriptor, NSNumber(value: 0x77676874), 830)
    }
    let font = CTFontCreateWithFontDescriptor(descriptor, size, nil)
    let ink = CGColor(srgbRed: 7/255, green: 62/255, blue: 40/255, alpha: 1)
    let attributes = [kCTFontAttributeName: font, kCTForegroundColorAttributeName: ink,
                      kCTKernAttributeName: tracking] as CFDictionary
    let run = CTLineCreateWithAttributedString(CFAttributedStringCreate(nil, text as CFString, attributes)!)
    let bounds = CTLineGetBoundsWithOptions(run, .useGlyphPathBounds)
    precondition(bounds.height < width - 3*mm)
    geometry.append(["text": text, "font_file": fontFile, "size_pt": size, "tracking_pt": tracking,
                     "center_from_top_mm": center, "ink_top_mm": center-bounds.width/2/mm,
                     "ink_bottom_mm": center+bounds.width/2/mm,
                     "ink_left_mm": width/2/mm-bounds.height/2/mm,
                     "ink_right_mm": width/2/mm+bounds.height/2/mm])
    pdf.saveGState()
    pdf.translateBy(x: width/2, y: (240-center)*mm)
    pdf.rotate(by: -.pi/2)
    pdf.textPosition = CGPoint(x: -bounds.midX, y: -bounds.midY)
    CTLineDraw(run, pdf)
    pdf.restoreGState()
}
line("The Vegetable Guru", "richer-a-1.woff2", 20, 90, 0.24)
line("John Lennon", "richer-a-6.woff2", 12.5, 140, 0.37)
pdf.endPDFPage()
pdf.closePDF()

let json = try! JSONSerialization.data(withJSONObject: geometry, options: [.prettyPrinted, .sortedKeys])
print(String(data: json, encoding: .utf8)!)
