import Foundation
import AVFoundation
import AppKit
import CoreGraphics

// Read-only original-video probing and exact decoded-frame extraction.
let args = CommandLine.arguments
let mode = args[1], input = URL(fileURLWithPath:args[2]), output = URL(fileURLWithPath:args[3])
let items = try JSONSerialization.jsonObject(with:Data(contentsOf:input)) as! [[String:Any]]
var result:[[String:Any]]=[]
try FileManager.default.createDirectory(at:output.deletingLastPathComponent(),withIntermediateDirectories:true)
for item in items {
 var row=item
 let path=item["path"] as! String, id=item["id"] as! String
 let asset=AVURLAsset(url:URL(fileURLWithPath:path))
 let duration=CMTimeGetSeconds(asset.duration)
 let track=asset.tracks(withMediaType:.video).first
 row["durationSeconds"]=duration.isFinite ? duration:0
 row["width"]=track.map{Int(abs($0.naturalSize.applying($0.preferredTransform).width))} ?? 0
 row["height"]=track.map{Int(abs($0.naturalSize.applying($0.preferredTransform).height))} ?? 0
 if mode != "probe",duration.isFinite,duration>0 {
  let generator=AVAssetImageGenerator(asset:asset)
  generator.appliesPreferredTrackTransform=true
  generator.requestedTimeToleranceBefore = .zero
  generator.requestedTimeToleranceAfter = .zero
  let maxWidth=(item["maxWidth"] as? Int) ?? 640
  if maxWidth>0 {generator.maximumSize=CGSize(width:maxWidth,height:maxWidth)}
  let times=(item["times"] as? [Double]) ?? [duration*0.15,duration*0.5,duration*0.85]
  let destination=output.deletingLastPathComponent().appendingPathComponent(mode=="native" ? "stills":"samples")
  try FileManager.default.createDirectory(at:destination,withIntermediateDirectories:true)
  var frames:[[String:Any]]=[]
  for seconds in times {
   do {
    var actual=CMTime.zero
    let cg=try generator.copyCGImage(at:CMTime(seconds:seconds,preferredTimescale:60000),actualTime:&actual)
    let name=String(format:"%@-%09.3f.%@",id,seconds,mode=="native" ? "png":"jpg")
    let url=destination.appendingPathComponent(name)
    let rep=NSBitmapImageRep(cgImage:cg)
    let data=rep.representation(using:mode=="native" ? .png:.jpeg,properties:mode=="native" ? [:]:[.compressionFactor:0.84])!
    try data.write(to:url)
    frames.append(["requestedSeconds":seconds,"actualSeconds":CMTimeGetSeconds(actual),"file":url.path,"width":cg.width,"height":cg.height])
   } catch {frames.append(["requestedSeconds":seconds,"error":String(describing:error)])}
  }
  row["frames"]=frames
 }
 result.append(row)
 let encoded=try JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
 try encoded.write(to:output)
 print("\(id): \(Int(duration.isFinite ? duration:0)) sec, \((row["frames"] as? [Any])?.count ?? 0) frames")
 fflush(stdout)
}
