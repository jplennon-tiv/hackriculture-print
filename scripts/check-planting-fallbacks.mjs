// Browser-only fault injection. Does not change source files or saved data.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch();
try{
    const page=await browser.newPage({viewport:{width:688,height:979}});
    await page.route('**/images/planting/carrot/*',route=>route.abort());
    await page.goto('http://127.0.0.1:5173/print/vegetable/carrot?units=metric',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.body.dataset.printReady==='true');
    assert.match(await page.evaluate(()=>document.body.dataset.plantingLayout),/^done:.*:text$/);
    assert.equal(await page.locator('[data-planting-card] img').count(),0);
    for(const text of ['Sow direct, very thinly','Cover lightly with fine soil or compost','Thin young seedlings','Seed depth: 1.3 cm'])assert((await page.locator('[data-planting-card]').innerText()).includes(text));
    assert.equal(await page.evaluate(()=>document.body.dataset.printError),'');
    console.log('PASS: missing artwork retains captions, measurements and notes; bounded text-only fallback becomes ready.');
    await page.unrouteAll();
    let intercepted=false;
    await page.route('**/hackriculture-data/vegetables.json*',async route=>{
        const response=await route.fetch();const original=await response.text();
        const old='Sow direct, very thinly, in shallow drills and cover lightly with fine soil or compost.';
        assert(original.includes(old));intercepted=true;
        await route.fulfill({response,body:original.replaceAll(old,'Changed source method for isolated browser review test.')});
    });
    await page.goto('http://127.0.0.1:5173/print/vegetable/carrot?units=metric',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>!!document.body.dataset.printError);
    assert(intercepted);
    assert.match(await page.evaluate(()=>document.body.dataset.printError),/source advice has changed/);
    assert.match(await page.getByRole('alert').innerText(),/PDF export paused/);
    console.log('PASS: changed source advice flags review and pauses export; original master untouched.');
}finally{await browser.close();}
