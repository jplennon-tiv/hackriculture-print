import {afterEach, expect, it, vi} from 'vitest';
import {changedRecords, fetchAdminData, saveRecords} from './adminApi';
import type {GardeningData} from '../types';

afterEach(() => vi.unstubAllGlobals());

it('sends only edited records, then uses the revision returned by the save', async () => {
    const vegetables = {carrot:{name:'Carrot'}, pea:{name:'Pea'}} as GardeningData;
    const request = vi.fn()
        .mockResolvedValueOnce(Response.json({vegetables, troubles:{}, revision:'loaded'}))
        .mockResolvedValueOnce(Response.json({ok:true, revision:'saved'}))
        .mockResolvedValueOnce(Response.json({error:'Reload before saving'}, {status:409}))
        .mockResolvedValueOnce(Response.json({ok:true, revision:'next'}));
    vi.stubGlobal('fetch', request);
    const loaded = await fetchAdminData();
    const edited = structuredClone(loaded.vegetables);
    edited.carrot.name = 'Carrot edited';
    const records = {vegetables:changedRecords(loaded.vegetables, edited)};
    await saveRecords('test-only', records);
    expect(request.mock.calls[1][0]).toBe('/api/admin/save-records');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({
        password:'test-only', revision:'loaded', records:{vegetables:{carrot:edited.carrot}},
    });
    await expect(saveRecords('test-only', records)).rejects.toThrow('Reload');
    await saveRecords('test-only', records);
    expect(JSON.parse(request.mock.calls[2][1].body).revision).toBe('saved');
    expect(JSON.parse(request.mock.calls[3][1].body).revision).toBe('saved');
});

it('detects new records and unchanged clones, and rejects implicit deletion', () => {
    const previous = {carrot:{name:'Carrot'}};
    expect(changedRecords(previous, structuredClone(previous))).toEqual({});
    expect(changedRecords(previous, {...previous, pea:{name:'Pea'}})).toEqual({pea:{name:'Pea'}});
    expect(() => changedRecords(previous, {})).toThrow('explicit migration');
});
