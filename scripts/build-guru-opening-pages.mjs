// Rebuild only pages 1–3 from shared book-layout JSON; approved sources stay intact.
import {buildBookPages} from './lib/build-book-pages.mjs';
await buildBookPages('opening');
