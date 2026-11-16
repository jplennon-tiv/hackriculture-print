"""Decode read-only source videos to scouting JPEGs or unretouched native PNGs."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import json, subprocess, sys

ffmpeg='/Applications/CapCut.app/Contents/Resources/ffmpeg'
mode,input_path,output_path=sys.argv[1:4]
items=json.loads(Path(input_path).read_text())
out=Path(output_path);out.parent.mkdir(parents=True,exist_ok=True)
dest=out.parent/('stills' if mode=='native' else 'samples');dest.mkdir(parents=True,exist_ok=True)

def extract(item):
 row=dict(item);frames=[]
 for seconds in item['times']:
  file=dest/f"{item['id']}-{seconds:09.3f}.{'png' if mode=='native' else 'jpg'}"
  cmd=[ffmpeg,'-hide_banner','-loglevel','error','-threads','2','-ss',str(seconds),'-i',item['path'],'-frames:v','1']
  if mode!='native':cmd+=['-vf','scale=640:-1','-q:v','3']
  cmd+=['-threads','2','-y',str(file)]
  try:
   result=subprocess.run(cmd,capture_output=True,text=True,timeout=75)
   if result.returncode:raise RuntimeError(result.stderr[-1400:])
   with Image.open(file) as im:size=im.size
   frames.append({'requestedSeconds':seconds,'file':str(file),'width':size[0],'height':size[1]})
  except Exception as e:frames.append({'requestedSeconds':seconds,'error':str(e)})
 row['frames']=frames
 return row

results={}
with ThreadPoolExecutor(max_workers=2) as pool:
 pending={pool.submit(extract,item):item['id'] for item in items}
 for f in as_completed(pending):
  row=f.result();results[row['id']]=row
  out.write_text(json.dumps([results[x['id']] for x in items if x['id'] in results],indent=2)+'\n')
  print(row['id'],sum('file' in x for x in row['frames']),'good /',len(row['frames']),flush=True)
