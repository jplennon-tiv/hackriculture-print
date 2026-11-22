import Foundation
import AppKit
import PDFKit
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let work=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/page-9-index-review/calendar-revision")
let records=(try JSONSerialization.jsonObject(with:Data(contentsOf:work.appendingPathComponent("CALENDAR-AUDIT.json"))) as! [String:Any])["records"] as! [[String:Any]]
let examples=["carrot","bean_runner","leek","tomato_greenhouse","artichoke_globe","potato","onion_shallot","garlic","rhubarb","mushroom"]
var checks:[[String:Any]]=[]
for r in records {
 let key=r["key"] as! String,doc=PDFDocument(url:root.appendingPathComponent(r["pdf"] as! String))!,page=doc.page(at:0)!,t=page.string ?? ""
 let rows=r["rows"] as! [[String:Any]],normal=t.components(separatedBy:.whitespacesAndNewlines).filter{!$0.isEmpty}.joined(separator:" ")
 let compact=normal.replacingOccurrences(of:" ",with:"")
 let all=rows.allSatisfy{compact.contains(($0["label"] as! String).replacingOccurrences(of:" ",with:""))}
 checks.append(["key":key,"pageCount":doc.pageCount,"allCalendarRowsExtracted":all])
 guard examples.contains(key) else{continue}
 let title=doc.findString("Growing calendar",withOptions:[]).first!,tb=title.bounds(for:page)
 let note=(r["notes"] as! [String]).first!,noteSel=doc.findString(note,withOptions:[]).first
 let nb=noteSel?.bounds(for:page)
 print(key,"title",tb,"note",nb as Any)
 let mm:CGFloat=72/25.4
 let crop=CGRect(x:tb.minX-3*mm,y:(nb?.minY ?? (tb.minY-25*mm))-3*mm,width:96*mm,height:tb.maxY+3*mm-((nb?.minY ?? (tb.minY-25*mm))-3*mm))
 let scale:CGFloat=4,w=Int(ceil(crop.width*scale)),h=Int(ceil(crop.height*scale))
 let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!,gc=NSGraphicsContext(bitmapImageRep:rep)!
 NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=gc;gc.cgContext.setFillColor(CGColor(red:1,green:0.97,blue:0.91,alpha:1));gc.cgContext.fill(CGRect(x:0,y:0,width:w,height:h));gc.cgContext.scaleBy(x:scale,y:scale);gc.cgContext.translateBy(x:-crop.minX,y:-crop.minY);page.draw(with:.mediaBox,to:gc.cgContext);NSGraphicsContext.restoreGraphicsState()
 try rep.representation(using:.png,properties:[:])!.write(to:work.appendingPathComponent("evidence-"+key+".png"))
}
try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("SOURCE-PDF-CHECKS.json"))
print("Verified",checks.count,"PDFs; missing labels",checks.filter{!($0["allCalendarRowsExtracted"] as! Bool)})
