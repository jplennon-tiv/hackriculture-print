"""Wire explicit crop/condition assignments only after every redraw is present."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2];p=root/'src/lib/keyRiskIcons.ts';m=json.loads((root/'docs/icon-pilot/KEY-RISK-CORRECTION-MAPPINGS.json').read_text())
for entries in m.values():
 for asset in entries.values():
  version='onion-bolting-v1' if asset.startswith('onion:') else ('naturalistic-v3' if asset.startswith('v3:') else 'silhouette-v5')
  assert (root/'public/images/key-risk-icons'/version/(asset.removeprefix('v3:').removeprefix('onion:')+'.png')).exists(),asset
s=p.read_text();start=s.index('// Crop-specific artwork');end=s.index('const RISK_ICONS_LOWER',start)
t='''// Crop-specific artwork keeps shared labels tied to the correct plant organ.
// v5 follows the two solid-silhouette proofs approved by John.
const A = '/images/key-risk-icons/silhouette-v5/';
const O = '/images/key-risk-icons/onion-bolting-v1/';
export const CROP_RISK_ICONS: Record<string, Record<string, string>> = {
'''
for crop,entries in m.items():
 t+=f'    {crop}: {{\n'
 for label,asset in entries.items():
  prefix='O' if asset.startswith('onion:') else ('P' if asset.startswith('v3:') else 'A');t+=f'        {json.dumps(label.lower())}: {prefix} + "{asset.removeprefix("v3:").removeprefix("onion:")}.png",\n'
 t+='    },\n'
t+='};\n';p.write_text(s[:start]+t+s[end:])
print('All mapped assets exist; crop-aware assignments installed.')
