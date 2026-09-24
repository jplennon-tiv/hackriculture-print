import json,pathlib,hashlib
p=pathlib.Path('docs/icon-pilot');plan=json.loads((p/'SILHOUETTE-REDRAW-PLAN.json').read_text());old=json.loads((p/'KEY-RISK-CORRECTION-PROMPTS.json').read_text());bykey={i['key']:i for i in plan};icons=[]
approval=json.loads((p/'SILHOUETTE-APPROVAL.json').read_text()) if (p/'SILHOUETTE-APPROVAL.json').exists() else {'icons':[]}
approved_hashes={i['key']:i['sha256'] for i in approval['icons']}
for original in old:
 key=original['key'];i=bykey.get(key,dict(original,png=original['png'].replace('assignment-v4','silhouette-v5')));file=pathlib.Path('public'+i['png']);assert file.exists(),file
 provpath=p/('silhouette-proofs' if key in ['pepper_end_rot','potato_scab'] else 'silhouette-generation')/(key+'.json');prov=json.loads(provpath.read_text())
 icons.append(dict(i,sha256=hashlib.sha256(file.read_bytes()).hexdigest(),source=prov['source'],status='approved by John' if approved_hashes.get(key)==hashlib.sha256(file.read_bytes()).hexdigest() else 'new redraw; awaiting visual sign-off'))
(p/'SILHOUETTE-SET-MANIFEST.json').write_text(json.dumps(dict(style='Approved solid silhouettes, 32px, transparent',approved_references=['pepper_end_rot','potato_scab'],icons=icons),indent=2)+'\n')
print(len(icons),'assets recorded')
