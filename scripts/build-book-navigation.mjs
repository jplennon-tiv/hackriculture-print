import fs from 'node:fs';
import {buildNavigationOverlays} from './lib/book-navigation.mjs';
const file='docs/publication/whole-book-order-preview/COMPONENT-CHECKS.json';
const checks=JSON.parse(fs.readFileSync(file,'utf8'));
const {navigation,...footers}=await buildNavigationOverlays();
checks.footers=footers;checks.navigation=navigation;
fs.writeFileSync(file,JSON.stringify(checks,null,2)+'\n');
console.log(JSON.stringify({newCropLabels:navigation.newCropLabels,existingNamedContinuations:navigation.existingNamedContinuations.length,changedPages:navigation.changedFolios.length,links:navigation.crossReferenceLinks}));
