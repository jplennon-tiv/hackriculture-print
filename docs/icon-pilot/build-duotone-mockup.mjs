// Complete the symbols used by ONE broccoli mock-up, not the full catalogue.
import fs from 'node:fs';
import sharp from 'sharp';
const dir='public/images/icon-pilot/duotone-mockup';fs.mkdirSync(dir,{recursive:true});
const ink='#344638',leaf='#cfdbb3',water='#a5c4c7',gold='#dfbf79';
const p=(d,c=ink)=>`<path d="${d}" fill="${c}"/>`;
const line=(d,w=4,c=ink)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sprout=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M0 0C-18 1-22-11-20-19C-6-19 1-10 0 0ZM2-2C1-17 12-23 23-21C22-6 11-1 2-2Z')}${line('M1-4V17',5)}</g>`;
const stencil=(body,cut)=>`<defs><mask id="cuts" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96"><rect width="96" height="96" fill="white"/><g fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${cut}</g></mask></defs><g mask="url(#cuts)">${body}</g>`;
const icons={
 harvest:`${line('M28 49V36C28 9 68 9 68 36V49',6)}${p('M34 50C18 47 15 31 19 24C33 26 37 38 34 50ZM39 51C34 36 41 25 54 23C59 36 53 47 39 51ZM59 47C57 34 68 25 78 27C79 42 69 48 59 47Z')}${p('M13 46H83L76 83H21Z')}${p('M21 53H75L70 77H26Z',leaf)}${line('M37 55V75M58 55V75M25 65H71',4)}`,
 germination:`${p('M12 62H84V85H12Z',leaf)}${line('M12 62H84',5)}${sprout(47,41,1)}<ellipse cx="48" cy="65" rx="11" ry="8" fill="${ink}"/>${line('M48 70V79L42 84M48 77L55 83',3.5)}`,
 depth:`${p('M12 24H59V84H12Z',gold)}${line('M12 25H59',5)}${p('M12 28H35V58Q35 68 45 68H59V77H39Q27 77 27 63V28Z',ink)}<ellipse cx="45" cy="57" rx="6" ry="8" fill="${ink}"/>${line('M76 27V67M70 33L76 27L82 33M70 61L76 67L82 61M66 77H86',4)}`,
 row_spacing:`${p('M12 16H62V33H12ZM12 63H62V80H12Z',leaf)}${sprout(25,26,.42)}${sprout(49,26,.42)}${sprout(25,73,.42)}${sprout(49,73,.42)}${line('M77 22V74M71 28L77 22L83 28M71 68L77 74L83 68',4.5)}`,
 plant_spacing:`${sprout(25,42,.75)}${sprout(71,42,.75)}${p('M11 59H85V68H11Z',leaf)}${line('M17 82H79M23 76L17 82L23 88M73 76L79 82L73 88',4)}`,
 yield:`${p('M24 49C12 34 20 17 31 14C43 26 40 40 32 49ZM41 47C35 31 43 17 57 17C64 32 55 45 41 47ZM57 48C54 34 66 25 78 27C80 42 70 49 57 48Z')}${p('M21 44H75L84 84H12Z')}${p('M27 50H69L76 77H20Z',leaf)}<circle cx="48" cy="62" r="11" fill="${ink}"/>${line('M48 63L54 56',3,leaf)}`,
 ready_in:`<rect x="12" y="20" width="63" height="62" rx="7" fill="${ink}"/><path d="M18 38H69V73Q69 76 65 76H22Q18 76 18 72Z" fill="${leaf}"/>${line('M27 11V28M58 11V28',5)}${line('M26 48H34M46 48H54M26 60H34',4)}<circle cx="68" cy="68" r="19" fill="${ink}"/><circle cx="68" cy="68" r="14" fill="${leaf}"/>${line('M68 58V69L75 74',3.5)}`,
 sun:`${line('M48 10V20M48 76V86M10 48H20M76 48H86M21 21L28 28M68 68L75 75M21 75L28 68M68 28L75 21',5)}<circle cx="48" cy="48" r="24" fill="${ink}"/><circle cx="48" cy="48" r="18" fill="${gold}"/>`,
 nutrition:`${p('M29 10L47 14L65 10L59 27C66 39 77 58 76 70Q75 85 59 85H35Q20 85 20 70C20 56 30 36 35 27Z')}${p('M37 33H57C64 46 71 60 70 70Q70 79 58 79H36Q26 79 26 69C26 57 33 40 37 33Z',leaf)}${line('M35 27H59',5)}${p('M36 67C29 49 46 43 62 42C65 57 55 69 40 68L36 74L32 71Z')}${line('M40 62L54 51',3,leaf)}`,
 protection:`${p('M12 74H84V84H12Z',leaf)}${sprout(47,56,.60)}${line('M15 75V42C15 7 81 7 81 42V75',5)}${line('M27 30V71M41 21V36M55 21V36M69 30V71M20 42H76M17 56H31M65 56H79',3)}`,
 caterpillar:stencil(`${line('M24 69L20 78M39 69L37 80M55 65L58 77M69 53L76 61',5)}<circle cx="21" cy="56" r="12" fill="${ink}"/><circle cx="37" cy="57" r="14" fill="${ink}"/><circle cx="53" cy="51" r="15" fill="${ink}"/><circle cx="67" cy="39" r="16" fill="${ink}"/><circle cx="73" cy="23" r="13" fill="${ink}"/>${line('M67 14L63 8M80 14L85 9',4)}`,'<path d="M30 48L30 63M46 41L49 59M60 28L66 44"/><circle cx="77" cy="22" r="2" fill="black" stroke="none"/>'),
 clubroot:stencil(`${sprout(47,28,.77)}${p('M42 35H54L57 49C70 43 80 51 77 62C75 69 65 68 64 74C66 86 50 90 46 79C39 89 24 86 26 75C11 67 20 55 30 56C25 44 36 41 42 45Z')}`,'<path d="M46 45L45 62M34 61L30 66M57 55L66 55M53 73L56 79"/>'),
 frost:stencil(`${line('M64 8V47M47 18L81 37M47 37L81 18M58 11L64 17L70 11M58 44L64 38L70 44M48 24L54 23L53 17M75 38L74 32L80 31M48 31L54 32L53 38M75 17L74 23L80 24',4)}${p('M12 46C38 39 62 50 55 70C47 87 20 78 12 46Z')}${line('M45 69L67 86',4)}`,'<path d="M23 51L47 71"/>'),
 pigeon:stencil(`${p('M13 73L27 58C29 39 46 31 60 40L62 26C57 14 71 6 79 14C85 20 81 29 77 33L76 52C81 74 56 86 36 75L13 80Z')}${p('M79 21L90 25L79 29Z')}${line('M46 76L42 87M60 75L60 87M37 87H47M55 87H65',4)}`,'<path d="M31 59Q48 42 64 51Q56 69 36 70"/><circle cx="73" cy="20" r="2" fill="black" stroke="none"/>')
};
const manifest=[];
for(const key of ['sow','water','broccoli']){
 const svg=fs.readFileSync(`public/images/icon-pilot/styles/duotone-${key}.svg`);
 fs.writeFileSync(`${dir}/${key}.svg`,svg);await sharp(svg).png().toFile(`${dir}/${key}.png`);
 manifest.push({key,family:key==='broccoli'?'monochrome':'duotone',source:'D style study, unchanged'});
}
for(const [key,body] of Object.entries(icons)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="384" height="384" role="img" aria-label="${key.replaceAll('_',' ')}">${body}</svg>\n`;
 fs.writeFileSync(`${dir}/${key}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${dir}/${key}.png`);
 manifest.push({key,family:['caterpillar','clubroot','frost','pigeon'].includes(key)?'monochrome':'duotone',source:'Original SVG extension of D for broccoli mock-up'});
}
fs.writeFileSync('docs/icon-pilot/DUOTONE-MANIFEST.json',JSON.stringify({scope:'One complete broccoli mock-up, existing sizes',icons:manifest},null,2)+'\n');
console.log(`Prepared ${manifest.length} transparent SVG/PNG icons for the D mock-up.`);
