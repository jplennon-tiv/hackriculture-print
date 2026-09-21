import {it,expect} from 'vitest';
import {firstSentence,firstNSentences,countSentences} from './sentences';
it('preserves abbreviations, fractions and decimals rather than cutting mid-sentence',()=>{
 for(const s of ['The traditional No. 1 variety, available as seed or crowns.','The best-known of the U.S. varieties, popular in America.','White 1/8 in. long maggots tunnel through leaves.','Sow 2.5 cm deep.']){
  expect(firstSentence(s+' More advice.')).toBe(s);expect(countSentences(s+' More advice.')).toBe(2);
 }
 expect(firstNSentences('One. Two! Three?',2)).toBe('One. Two!');
 expect(firstSentence('A complete unpunctuated note')).toBe('A complete unpunctuated note');
});
