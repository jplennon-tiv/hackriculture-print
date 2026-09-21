import {describe,it,expect} from 'vitest';
import {signature,reviewAiField,assertAiWritable,type AiPrintRecord} from './aiPrint';
import {AiPrintRecordSchema} from '../schema';
import {troubleCopy} from '../print/troubleContent';
const source={name:'Example',description:'Signs',treatment:'Action',prevention:'Prevention'};
function fixture(){
 const record:AiPrintRecord={ai_description:'Short signs',ai_print:{version:1,fields:{description:{
  status:'approved',locked:false,updated_at:'2026-09-19T12:00:00Z',updated_by:'admin',
  dependencies:Object.fromEntries(Object.entries(source).map(([k,v])=>[k,signature(v)])),output_signature:signature('Short signs'),
 }}}};return record;
}
describe('stored AI print adaptations',()=>{
 it('uses exact order-independent signatures without conflating missing/null or array order',()=>{
  expect(signature({b:2,a:1})).toBe(signature({a:1,b:2}));
  expect(signature(undefined)).not.toBe(signature(null));
  expect(signature([1,2])).not.toBe(signature([2,1]));
 });
 it('accepts current approved copy, ignores unrelated changes, detects dependent changes',()=>{
  const r=fixture();expect(reviewAiField(r,'description',source).usable).toBe(true);
  expect(reviewAiField(r,'description',{...source,rank:5}).usable).toBe(true);
  expect(reviewAiField(r,'description',{...source,treatment:'New action'}).reason).toBe('source changed');
  expect(troubleCopy({...source,...r})).toMatchObject({recognise:'Short signs',act:'Action',warning:null});
 });
 it('allows drafts only in explicit review mode, never stale copy',()=>{
  const r=fixture();r.ai_print!.fields.description!.status='draft';
  expect(troubleCopy({...source,...r}).recognise).toBe('Signs');
  expect(troubleCopy({...source,...r},true).recognise).toBe('Short signs');
  expect(troubleCopy({...source,...r,description:'Changed'},true).recognise).toBe('Changed');
 });
 it('detects manual changes and protects locks without silently approving them',()=>{
  const r=fixture();r.ai_description='Human edit';
  expect(reviewAiField(r,'description',source).reason).toContain('edited');
  expect(()=>assertAiWritable(r,'description')).toThrow('unreviewed');
  const locked=fixture();locked.ai_print!.fields.description!.locked=true;
  expect(()=>assertAiWritable(locked,'description')).toThrow('locked');
  expect(reviewAiField(locked,'description',source).usable).toBe(true);
 });
 it('requires complete dependency records and validates metadata',()=>{
  const r=fixture();expect(AiPrintRecordSchema.safeParse(r).success).toBe(true);
  delete r.ai_print!.fields.description!.dependencies.treatment;
  expect(reviewAiField(r,'description',source).usable).toBe(false);
  r.ai_print!.fields.description!.updated_at='yesterday';
  expect(AiPrintRecordSchema.safeParse(r).success).toBe(false);
 });
 it('preserves earlier approved summaries while replacement copy is a draft',()=>{
  const r=fixture();r.ai_print!.fields.description!.status='draft';
  const c={...source,...r,print_summary:{version:1 as const,status:'approved' as const,source,recognise:'Earlier approved signs',act:'Earlier action',prevent:'Earlier prevention'}};
  expect(troubleCopy(c).recognise).toBe('Earlier approved signs');
  expect(troubleCopy(c,true).recognise).toBe('Short signs');
  expect(troubleCopy({...c,description:'Changed source'}).recognise).toBe('Changed source');
 });
});
