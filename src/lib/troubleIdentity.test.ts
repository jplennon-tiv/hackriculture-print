import {describe, expect, it} from 'vitest';
import {distinctTroubleEntries, troubleIdentity} from './troubleIdentity';
describe('display condition identities', () => {
    it('collapses confirmed aliases while retaining the prioritised advice', () => {
        const first={text:'Reviewed crop advice',rank:10}, other={text:'Full alternative master advice',rank:9};
        const entries: Array<[string, typeof first]> = [['Club Root (Finger and Toe)',first],['Clubroot (Finger and Toe)',other],['Frost',other]];
        expect(distinctTroubleEntries(entries,'Cabbage')).toEqual([entries[0],entries[2]]);
        expect(entries).toHaveLength(3);
        expect(troubleIdentity('Beet Leaf Miner (Mangold Fly)')).toBe(troubleIdentity('Mangold Fly (Leaf Miner)'));
        expect(troubleIdentity('Old Seed / Poor Germination')).toBe(troubleIdentity('POOR GERMINATION'));
    });
    it('does not merge distinct root, insect, or growth problems', () => {
        const labels=['Root Rot','Club Root','Crown Rot','Carrot Fly','Celery Fly (Leaf Miner)','Checked Growth / Poor Root Quality','Woody Roots','Small Roots'];
        expect(new Set(labels.map(x=>troubleIdentity(x))).size).toBe(labels.length);
        expect(troubleIdentity('CARROT ROOT FLY')).toBe(troubleIdentity('Carrot Fly'));
        expect(troubleIdentity('FORKING')).toBe(troubleIdentity('Fanging'));
        expect(troubleIdentity('LEAF MINER','Parsnip')).toBe(troubleIdentity('Celery Fly (Leaf Miner)','Parsnip'));
        expect(troubleIdentity('LEAF MINER','Celery')).not.toBe(troubleIdentity('Carrot Fly','Celery'));
        expect(troubleIdentity('Slugs and Snails')).toBe(troubleIdentity('SLUGS'));
        expect(troubleIdentity('Potato Blight 2','Potato')).toBe('blight');
    });
});

it('recognises the radish root-quality mirror without merging different crops',()=>{
 expect(troubleIdentity('WOODY OR HOLLOW ROOTS','Radish')).toBe(troubleIdentity('Woody, Hollow or Soft Radish Roots','Radish'));
 expect(troubleIdentity('WOODY OR HOLLOW ROOTS','Turnip')).not.toBe(troubleIdentity('Woody, Hollow or Soft Radish Roots','Turnip'));
});
