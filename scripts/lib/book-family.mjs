import fs from 'node:fs';
import path from 'node:path';
import {root} from './book-content.mjs';
// Use the same explicit classification as the print routes, never label guesses.
const source=fs.readFileSync(path.join(root,'src/print/familyTheme.ts'),'utf8');
export const troubleFamilies=Object.fromEntries([...source.match(/export const troubleFamilies[^=]*=\{([^}]+)\}/)[1].matchAll(/(\w+):'([^']+)'/g)].map(m=>[m[1],m[2]]));
