import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getRiskIcon, RISK_ICONS, CROP_RISK_ICONS, UNASSIGNED_RISK_LABELS } from './keyRiskIcons';

describe('naturalistic Key Risks assignments', () => {
    it('preserves all 35 approved original drawings byte-for-byte', () => {
        const manifest = JSON.parse(readFileSync('docs/icon-pilot/NATURALISTIC-SET-MANIFEST.json', 'utf8'));
        expect(manifest.icons).toHaveLength(35);
        for (const icon of manifest.icons) expect(createHash('sha256').update(readFileSync(`public${icon.png}`)).digest('hex')).toBe(icon.sha256);
    });
    it('resolves every assigned asset to a recorded, unchanged drawing', () => {
        const icons = ['NATURALISTIC-SET-MANIFEST','SILHOUETTE-SET-MANIFEST','ONION-BOLTING-MANIFEST'].flatMap(name => JSON.parse(readFileSync(`docs/icon-pilot/${name}.json`,'utf8')).icons);
        const known = new Map(icons.map((i:{png:string;sha256:string})=>[i.png,i.sha256]));
        const paths = new Set([...Object.values(RISK_ICONS),...Object.values(CROP_RISK_ICONS).flatMap(Object.values)]);
        for (const path of paths) expect(createHash('sha256').update(readFileSync(`public${path}`)).digest('hex')).toBe(known.get(path));
    });
    it('uses reviewed existing artwork without installing rejected new drawings', () => {
        expect(getRiskIcon('Chocolate Spot','bean_broad')).toContain('/leaf_spot.png');
        expect(getRiskIcon('Halo Blight','bean_runner')).toContain('/leaf_spot.png');
        expect(getRiskIcon('Pests','mushroom')).toContain('/fly.png');
        expect(getRiskIcon('Soil Pests','chicory')).toContain('/caterpillar.png');
        expect(getRiskIcon('Small Roots','carrot')).toContain('/small_roots.png');
        expect(getRiskIcon('Blossom End Rot','capsicum')).not.toContain('/assignment-v4/');
    });
    it('keeps shared labels tied to the correct crop and preserves approved samples', () => {
        expect(getRiskIcon('Bolting','onion_shallot')).toContain('/onion-bolting-v1/onion_bolting.png');
        expect(getRiskIcon('Bolting','beetroot')).toContain('/naturalistic-v3/bolting.png');
        expect(getRiskIcon('Poor Pollination','sweet_corn')).toContain('/corn_missing_kernels.png');
        expect(getRiskIcon('Poor Pollination','marrow_courgette')).toContain('/courgette_abort.png');
        expect(getRiskIcon('Blossom End Rot','capsicum')).toContain('/silhouette-v5/pepper_end_rot.png');
        expect(getRiskIcon('Blossom End Rot','tomato_outdoor')).toContain('/naturalistic-v3/blossom_end_rot.png');
        expect(getRiskIcon('Heart Rot','beetroot')).toContain('/beet_heart_rot.png');
        expect(getRiskIcon('Rotting','chicory')).toContain('/leafy_heart_rot.png');
        expect(getRiskIcon('Button Cauliflowers','cauliflower')).toContain('/cauliflower_button.png');
        expect(getRiskIcon('Honey Fungus','rhubarb')).toContain('/honey_fungus_root.png');
        for(const key of ['pepper_end_rot','potato_scab']) expect(readFileSync(`public/images/key-risk-icons/silhouette-v5/${key}.png`).equals(readFileSync(`docs/icon-pilot/silhouette-proofs/${key}.png`))).toBe(true);
    });
    it('keeps aliases and refuses audited false fallbacks', () => {
        expect(getRiskIcon('Clubroot (Finger and Toe)')).toBe(getRiskIcon('CLUB ROOT (FINGER AND TOE)'));
        expect(getRiskIcon('PIGEONS')).toContain('/bird.png');
        expect(getRiskIcon('unknown condition')).toBeUndefined();
        for(const label of UNASSIGNED_RISK_LABELS) expect(getRiskIcon(label)).toBeUndefined();
    });
});
