// Rebuild only pages 4–7 from shared book-layout JSON; approved sources stay intact.
import {buildBookPages} from './lib/build-book-pages.mjs';
await buildBookPages('entry');
