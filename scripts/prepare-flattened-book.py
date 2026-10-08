"""Resumable, source-hash-bound preparation of separate production derivatives.

Does not replace the reviewed PDFs or imply supplier/file approval.
"""
from pathlib import Path
import argparse,datetime,hashlib,json,subprocess,sys

root=Path(__file__).resolve().parents[1];evidence=root/'docs/publication/book-preparation'
p=argparse.ArgumentParser();p.add_argument('--supplier',choices=['kdp','bookvault'],required=True)
p.add_argument('--units',default='imperial,metric');p.add_argument('--only');p.add_argument('--limit',type=int)
args=p.parse_args();suffix='-BOOKVAULT' if args.supplier=='bookvault' else ''
assembly=json.loads((evidence/f'ASSEMBLY-CHECKS{suffix}.json').read_text())
script=root/'scripts/flatten-book-pdf.py';signature=hashlib.sha256(script.read_bytes()).hexdigest()
path=evidence/f'FLATTENED-{args.supplier.upper()}.json'
report=json.loads(path.read_text()) if path.exists() else {'results':[]}
report.update(supplier=args.supplier,currentSignature=signature,status='Working derivatives; raster/physical verification is separate from visual review and final supplier acceptance.',method='Opaque RGB artwork composited at 600 dpi; native vector text and original page boxes retained. Artwork is resampled, not pixel-identical. No PDF/X claim.')
count=0
for edition in assembly['results']:
    if edition['units'] not in args.units.split(','):continue
    for item in edition['sources']:
        if args.only and item['id'].split('/')[-1] not in args.only.split(','):continue
        source=root/item['pdf'];assert hashlib.sha256(source.read_bytes()).hexdigest()==item['sha256'],item['id']
        target=root/'output/pdf/book-preparation/flattened'/args.supplier/edition['units']/source.name
        old=next((x for x in report['results'] if x['id']==item['id']),None)
        if old and old.get('status')=='checked' and old['signature']==signature and old['sourceSha256']==item['sha256'] and target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==old['sha256']:
            continue
        result=subprocess.run([sys.executable,str(script),str(source),str(target)],cwd=root,capture_output=True,text=True,timeout=600)
        row={'id':item['id'],'source':item['pdf'],'sourceSha256':item['sha256'],'signature':signature,'startPage':item['startPage'],'physicalPages':item['physicalPages']}
        if result.returncode:
            row.update(status='failed',error=result.stderr[-2500:])
        else:
            checked=json.loads(target.with_suffix('.checks.json').read_text())
            row.update(status='checked',pdf=str(target.relative_to(root)),sha256=checked['sha256'],bytes=checked['bytes'],physicalReceipt=str(target.with_suffix('.checks.json').relative_to(root)),maxMeanChannelError=max(r['meanAbsoluteChannelErrorAt300Dpi'] for r in checked['pages']),maxFractionPixelsOver32=max(r['fractionPixelsOver32At300Dpi'] for r in checked['pages']),visualReview='pending')
            assert checked['pageCount']==item['physicalPages']
        report['results']=[x for x in report['results'] if x['id']!=row['id']]+[row]
        report['updatedAtUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
        temp=path.with_suffix('.tmp');temp.write_text(json.dumps(report,indent=2)+'\n');temp.replace(path)
        print(row['id'],row['status'],flush=True)
        if result.returncode:
            print(row['error'],file=sys.stderr);sys.exit(result.returncode)
        count+=1
        if args.limit and count>=args.limit:break
    if args.limit and count>=args.limit:break
print('Newly prepared',count,'PDFs; receipt',path.relative_to(root),flush=True)
