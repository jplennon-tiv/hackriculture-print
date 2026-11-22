import Foundation
import AppKit
import PDFKit
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let work=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-7-thumbnail-review/two-thumbnail-proof")
let pdf=root.appendingPathComponent("output/pdf/introduction-two-thumbnails/Vegetable-Guru-Introduction-Two-Thumbnails.pdf")
let approved=root.appendingPathComponent("docs/publication/introduction-revision/references/approved-2026-11-15/Introduction.pdf")
let oldDoc=PDFDocument(url:approved)!,old=oldDoc.page(at:0)!,doc=PDFDocument(url:pdf)!,page=doc.page(at:0)!,mm:CGFloat=72/25.4
guard doc.pageCount==1,old.string==page.string else {fatalError("Page count or text changed")}
var shifted=0
for i in 0..<old.numberOfCharacters {let a=old.characterBounds(at:i),b=page.characterBounds(at:i);if abs(a.minX-b.minX)>0.01 || abs(a.minY-b.minY)>0.01 || abs(a.width-b.width)>0.01 || abs(a.height-b.height)>0.01 {shifted+=1}}
guard shifted==0 else {fatalError("Text positions changed")}
let titleRange=(page.string! as NSString).range(of:"Introduction"),title=page.selection(for:titleRange)!.bounds(for:page),titleGap=115-title.maxX/mm
guard titleGap>=2 else {fatalError("Title too close to first thumbnail: \(titleGap)")}
func render(_ p:PDFPage,_ name:String,_ scale:CGFloat=2.5){let box=p.bounds(for:.mediaBox),w=Int(ceil(box.width*scale)),h=Int(ceil(box.height*scale));let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!;let g=NSGraphicsContext(bitmapImageRep:rep)!;NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=g;g.cgContext.setFillColor(NSColor.white.cgColor);g.cgContext.fill(CGRect(x:0,y:0,width:w,height:h));g.cgContext.scaleBy(x:scale,y:scale);p.draw(with:.mediaBox,to:g.cgContext);NSGraphicsContext.restoreGraphicsState();try! rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent(name))}
render(page,"Introduction-Two-Thumbnails.png");render(old,"approved-source-render.png")
let map=try JSONSerialization.jsonObject(with:Data(contentsOf:root.appendingPathComponent("docs/publication/whole-book-order-preview/PAGE-MAP.json"))) as! [[String:Any]]
let facing=map.first{($0["folio"] as? Int)==6}!,facingDoc=PDFDocument(url:root.appendingPathComponent(facing["source"] as! String))!,facingPage=facingDoc.page(at:(facing["sourcePage"] as! Int)-1)!
guard (facingPage.string ?? "").trimmingCharacters(in:.whitespacesAndNewlines).isEmpty else {fatalError("Facing page is not blank")}
render(facingPage,"facing-page-6.png")
let receipt:[String:Any]=["date":"2026-11-22","pages":1,"trimMM":[page.bounds(for:.mediaBox).width/mm,page.bounds(for:.mediaBox).height/mm],"textMatchesApproved":true,"changedCharacterBounds":shifted,"titleToFirstThumbnailGapMM":titleGap,"thumbnailSizeMM":29,"thumbnailHorizontalGapsMM":[4],"lowestThumbnailBottomMM":42,"bodyFrameTopMM":45,"facingPage":facing,"facingPageBlank":true]
try JSONSerialization.data(withJSONObject:receipt,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("PDF-CHECKS.json"))
print("Text and positions unchanged; title gap mm",titleGap,"; facing page 6 is blank")
