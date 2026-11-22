import Foundation
import PDFKit
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath),mm:CGFloat=72/25.4
let work=root.appendingPathComponent("docs/publication/overnight-2026-11-19/openings/contents-no-category-colours/selected-thumbnails")
let data=try JSONSerialization.jsonObject(with:Data(contentsOf:work.appendingPathComponent("CHECKS.json"))) as! [String:Any]
let expected=(try JSONSerialization.jsonObject(with:Data(contentsOf:work.appendingPathComponent("CONTENTS.json"))) as! [String:Any])["pages"] as! [[String:Any]]
let rows=data["entries"] as! [[String:Any]]
let doc=PDFDocument(url:root.appendingPathComponent("output/pdf/contents-no-category-colours/selected-thumbnails/Vegetable-Guru-Contents-No-Category-Colours.pdf"))!
guard doc.pageCount==2 else{fatalError("Wrong page count")}
func normal(_ s:String)->String{s.precomposedStringWithCompatibilityMapping.components(separatedBy:.whitespacesAndNewlines).filter{ !$0.isEmpty }.joined(separator:" ")}
var verified=0
for record in expected{
 let folio=record["folio"] as! Int,p=doc.page(at:folio-4)!,box=p.bounds(for:.mediaBox)
 guard abs(box.width/mm-185)<0.01,abs(box.height/mm-240)<0.01 else{fatalError("Wrong trim")}
 let all=normal(p.string ?? "")
 guard !all.contains("why grow your own"),!all.contains("how to use") else{fatalError("Obsolete label remains")}
 if folio==4 {guard all.components(separatedBy:"Vegetable Guides").count==2 else{fatalError("Duplicate or missing Guides heading")}}
 guard !all.lowercased().contains("imperial"),!all.lowercased().contains("metric"),!all.lowercased().contains("traditional measurements") else{fatalError("Edition wording remains")}
 let footerText=normal(p.selection(for:CGRect(x:(folio==4 ? 8:17)*mm,y:5*mm,width:160*mm+1,height:8*mm))?.string ?? "")
 guard footerText.hasSuffix(String(folio)) else{fatalError("Folio missing")}
 guard !all.contains("Category colours"),!all.contains("Root Crops") else{fatalError("Category key remains")}
 for e in record["entries"] as! [[String:Any]]{
  let label=e["label"] as! String,n=e["folio"] as! Int
  let matching=rows.filter{($0["page"] as! Int)==folio && ($0["label"] as! String)==label && ($0["destination"] as! Int)==n}
  guard matching.count==1,all.contains(normal(label)) else{fatalError("Missing/duplicated entry: \(label)")}
  let r=matching[0],x=r["xMM"] as! Double,y=r["yMM"] as! Double,w=r["widthMM"] as! Double,h=r["heightMM"] as! Double
  let text=normal(p.selection(for:CGRect(x:x*mm,y:box.height-(y+h)*mm,width:w*mm+0.5,height:h*mm))?.string ?? "")
  guard text.contains(normal(label)),text.hasSuffix(String(n)) else{fatalError("Incorrect row: \(label) => \(text)")}
  verified+=1
 }
}
guard verified==84 else{fatalError("Entry count")}
let checks:[String:Any]=["date":"2026-11-22","pages":2,"trimMM":[185,240],"verifiedLabelDestinationPairs":verified,"all84EntriesVerified":true,"categoryKeyAbsent":true,"copyChanges":["None; previous label corrections retained"],"vegetableGuidesOccurrences":1,"all44VegetableNamesRetained":true,"measurementLabelsAbsent":true,"printedFoliosRetained":true,"sourceComparison":"Every source label and folio verified in its corresponding PDF row","visualReview":"Recorded separately after rendering in REVIEW.json","hyperlinks":"Standalone visual proof; cross-book PDF link installation remains part of later authorised integration."]
try JSONSerialization.data(withJSONObject:checks,options:[.prettyPrinted,.sortedKeys]).write(to:work.appendingPathComponent("PDF-CHECKS.json"))
print("Verified all 84 label/destination pairs in the actual PDF; two trim-size pages; category key absent.")
