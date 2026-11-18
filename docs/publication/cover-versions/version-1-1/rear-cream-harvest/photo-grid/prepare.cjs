const path = require('node:path');
const sharp = require('sharp');

// The print window is 40.75 by 39.5 mm. Centre coordinates refer to the upright frame.
async function cropForPrint(root, tile) {
  const ratio = 40.75 / 39.5;
  const source = path.join(root, tile.source);
  const metadata = await sharp(source).metadata();
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const w = rotated ? metadata.height : metadata.width;
  const h = rotated ? metadata.width : metadata.height;
  const height = Math.round(Math.min(h, w / ratio) * tile.scale);
  const width = Math.min(w, Math.round(height * ratio));
  const left = Math.max(0, Math.min(w - width, Math.round(tile.centre[0] * w - width / 2)));
  const top = Math.max(0, Math.min(h - height, Math.round(tile.centre[1] * h - height / 2)));
  if (width / (40.75 / 25.4) < 300) throw new Error('Undersized source crop: ' + tile.subject);
  return sharp(source).rotate().extract({left, top, width, height})
    .resize({width: 750, withoutEnlargement: true});
}

module.exports = async function prepareGrid(root, directory, tiles) {
  if (tiles.length !== 16) throw new Error('The rear cover needs sixteen photographs.');
  for (const [index, tile] of tiles.entries()) {
    const pipeline = await cropForPrint(root, tile);
    await pipeline.jpeg({quality: 94, chromaSubsampling: '4:4:4'})
      .toFile(path.join(directory, 'tile-' + index + '.jpg'));
  }
};
module.exports.cropForPrint = cropForPrint;
