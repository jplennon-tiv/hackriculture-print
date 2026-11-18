const sharp = require('sharp');
const fs = require('node:fs/promises');
async function render() {
  const [input, output] = process.argv.slice(2);
  const svg = (await fs.readFile(input, 'utf8'))
    .replace('width="185mm" height="240mm"', 'width="1100" height="1430"');
  await sharp(Buffer.from(svg)).png().toFile(output);
}
render().catch(error => {console.error(error); process.exitCode=1;});
