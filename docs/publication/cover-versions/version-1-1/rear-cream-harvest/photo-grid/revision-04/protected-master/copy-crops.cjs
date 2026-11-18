// Copy the approved JPEG streams directly. Revisions that change a photograph
// should use a new manifest and output directory.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { photos } = require('./MANIFEST.json');

module.exports = async function copyProtectedPhotos(destination) {
  if (photos.length !== 16) throw Error('Expected sixteen frozen rear-cover photos');
  for (const [index, photo] of photos.entries()) {
    const data = await fs.readFile(path.join(__dirname, photo.file));
    if (photo.number !== index + 1 || createHash('sha256').update(data).digest('hex') !== photo.sha256) {
      throw Error('Rear-cover photo differs from the protected master: ' + photo.file);
    }
    await fs.writeFile(path.join(destination, 'tile-' + index + '.jpg'), data, {flag: 'wx'});
  }
};
