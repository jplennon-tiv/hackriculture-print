"""Install only verified, visually inspected six-fix PDFs; retain prior books."""
import runpy,json,os,copy,re
from pathlib import Path
m=runpy.run_path(str(Path(__file__).with_name('interior-six-fixes.py')));u=m['u'];D=m['D'];B=m['B'];R=m['R']
read=m['read'];save=m['save'];source=read('SOURCE.json');prior=source['baseline'];inspection=read('VISUAL-INSPECTION.json')
assert inspection['status']=='passed'
checks={kind:read(kind.upper()+'-VERIFICATION.json') for kind in ['reading','native']}
for kind,c in checks.items():
    assert c['pages']==178 and c['interiorPages']==174 and c['navigationExact'] and c['allArtworkResourcesExact'] and c['allNativeTextVerified'] and c['nonTroublesPixelsOutsideEditsExact']
    assert u.sha(D/f'updated-{kind}.pdf')==c['sha256']==inspection[kind+'SHA256']
assert u.sha(D/'before-native.pdf')==prior['sha256'] and u.sha(D/'before-reading.pdf')==prior['readingCopySHA256']
for kind,out,oldhash in [('native',prior['pdf'],prior['sha256']),('reading',prior['readingCopy'],prior['readingCopySHA256'])]:
    assert u.sha(R/out) in [oldhash,checks[kind]['sha256']],'Unrecognised current book: stop before replacement.'
plan=read('SIMPLE-PLAN.json');troubles=read('TROUBLES-REFLOW.json');records=read('TEXT-MAP.json')
changed=set(plan['blanks'])|{r['page'] for r in troubles}|{records[i]['page'] for i in plan['remove']}|{t['page'] for t in plan['text']}
pages=copy.deepcopy(read('before-PAGE-MAP.json'))
for i,p in enumerate(pages):
    p['image']=D.name+f'/pages/page-{i+1:03}.jpg';assert (B/p['image']).is_file()
    if i in changed:
        p['previousPresentationSource']={k:p.get(k) for k in ['source','sourcePage']}
        p['source']=str((D/'updated-native.pdf').relative_to(R));p['sourcePage']=i+1;p['presentationUpdate']=str((D/'SOURCE.json').relative_to(R))
assert [p['folio'] for p in pages if p['folio'] is not None]==list(range(1,175))
save('PAGE-MAP.json',pages)
for kind,out in [('native',prior['pdf']),('reading',prior['readingCopy'])]:
    target=R/out;temp=target.with_suffix('.pdf.install');temp.unlink(missing_ok=True);os.link(D/f'updated-{kind}.pdf',temp);os.replace(temp,target)
n=read('NATIVE-BUILD.json');r=read('READING-BUILD.json');bound=D.name+'/INTEGRATION-CHECKS.json'
receipt={'date':'2026-11-22','status':'All six requested interior presentation fixes installed; page order and advice preserved','authorisation':source['authorisation'],
    'pdf':prior['pdf'],'sha256':n['sha256'],'bytes':n['bytes'],'readingCopy':prior['readingCopy'],'readingCopySHA256':r['sha256'],'readingCopyBytes':r['bytes'],
    'interiorPages':174,'pdfPages':178,'units':'imperial','displayEdition':'Traditional measurements edition','trimMm':[185,240],'folioMapping':'PDF page = printed folio + 2',
    'internalLinks':662,'contentsLinks':84,'openerLinks':77,'bookmarks':89,'guidePairsIntegrated':44,'troublesPages':47,'troublesEntries':220,'featurePanels':24,
    'simpleChanges':plan['counts'],'troublesLabels':checks['native']['labels'],'minimumTroublesFooterClearanceMm':min(p['footerClearanceMm'] for p in troubles),
    'bodyTypePt':9,'allAdvicePreserved':True,'allArtworkResourcesUnchanged':True,'nonTroublesPixelsOutsideRequestedEditsUnchanged':True,'pageOrderUnchanged':True,
    'previousIntegration':'title-copyright-integration-2026-11-22/INTEGRATION-CHECKS.json','sourceManifest':D.name+'/SOURCE.json','integrationReceipt':bound,
    'nativeVerification':D.name+'/NATIVE-VERIFICATION.json','readingVerification':D.name+'/READING-VERIFICATION.json','inspection':D.name+'/VISUAL-INSPECTION.json',
    'bothUnitChecks':D.name+'/BOTH-UNIT-CHECKS.json','supplierFilesChanged':False,'canonicalGardeningRecordsChanged':False,'newArtworkGenerated':False,'indexEntries':307,'indexSeeReferences':36,
    'checks':{'routineTests':43,'typeCheck':'passed','browserExport':'Blocked by local server/Chromium sandbox; native PDF pipeline used and checked.'},
    'limits':prior['limits']}
save('INTEGRATION-CHECKS.json',receipt);u.save(B/'CHECKS.json',receipt);u.save(B/'PAGE-MAP.json',pages)
for name in ['COMPONENT-CHECKS.json','NAVIGATION-PDF-CHECKS.json','SEQUENCE-CHECKS.json','VISUAL-REVIEW.json']:
    old=read('before-'+name);old['pdfSha256']=n['sha256'];old['integrationReceipt']=bound
    old.pop('allPixelsOutsideNumericEditsUnchanged',None)
    if name=='COMPONENT-CHECKS.json':old.update(status='Six fixes checked on all 178 pages; all artwork resources preserved',sourceManifest=D.name+'/SOURCE.json')
    if name=='NAVIGATION-PDF-CHECKS.json':old.update(status='All 662 links, 89 bookmarks and page labels unchanged',detail=D.name+'/NATIVE-VERIFICATION.json')
    if name=='SEQUENCE-CHECKS.json':old['firstLeaves']=pages[:9]
    if name=='VISUAL-REVIEW.json':old.update(status='passed',pagesRendered=178,detail=D.name+'/NATIVE-VERIFICATION.json',inspection=inspection)
    u.save(B/name,old)
viewer=(D/'before-REVIEW.html').read_text();start=viewer.index('const pages=')+len('const pages=');end=viewer.index(';let at=',start)
viewer=viewer[:start]+json.dumps(pages,ensure_ascii=False).replace('<','\\u003c')+viewer[end:]
viewer=viewer.replace('Approved title C with copyright, followed by the contents spread; the old copyright page and blank are removed. All later page references are updated.','Six interior fixes applied: cream blanks, part labels, cleaner guide titles and punctuation, and revised Troubles headings and labels. Approved title C and the 174-page sequence are retained.')
viewer=re.sub(r'Browsing PDF \(\d+ MB\)',f'Browsing PDF ({round(r["bytes"]/1e6)} MB)',viewer);viewer=re.sub(r'Full-resolution native PDF \(\d+ MB\)',f'Full-resolution native PDF ({round(n["bytes"]/1e6)} MB)',viewer)
(B/'REVIEW.html').write_text(viewer)
print(json.dumps({'status':receipt['status'],'pdfPages':178,'changedPages':len(changed),'internalLinks':662,'bookmarks':89}))
