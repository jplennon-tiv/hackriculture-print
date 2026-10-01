# Troubles makeover — draft pilot

28 September 2026. [Review four representative pages](REVIEW.html).
This is the earlier boxed proposal. The [open editorial experiment](editorial/REVIEW.html)
is now the approved, locked forward design: larger images, natural entry heights
and six conditions per sample page. This boxed proposal is superseded; the live
renderer has not yet migrated.

Carries Richer A's Lilita One / Nunito Sans typography, playful ribbon, soft
irregular backdrop and selected Family Tint colours into Troubles. Four conditions
remain on each page in the existing two-column reading order. A typographic
opening replaces the large combined hero for this experiment; the approved
combined hero assets remain installed. Diagnostic images are retained intact,
using contain sizing and multiply blending on the tinted cards. Recognise and
Prevent use clear labels; Act has a stronger background for quick scanning.

Scope: first two pages of Carrot and Parsnip Troubles (four-page source guide)
and Onion & Leek Troubles (five-page source guide). Each contains eight conditions;
other pages remain outside this pilot. Intro, crop applicability, visual symptom
captions, stars and all available Recognise / Act / Prevent paragraphs come from
canonical records and the current `troubleCopy` resolver. Saved layout status is
checked before using its card membership/order. Both groups resolve without
warnings. No text was edited or cut to fit; no source records, locks, approved
vegetable references or installed templates/palettes were changed.

Build: `node docs/troubles-style-pilot/build.mjs` from the print project root.
Check: `node docs/troubles-style-pilot/check.mjs`. Requires existing Playwright,
esbuild and online Google Fonts. CONTENT.json is a disposable proof snapshot,
not a new gardening master. Review PNGs are browser previews.

Checks: all 16 cards' displayed source strings and both introductions preserved;
fonts/images decoded; four cards per page; no card overflow or text outside
page/footer bounds. Four pages visually inspected. No physical PDF export or
catalogue render. Actual A4 margins, pagination and font embedding still require
validation before rollout. Continuation-page header spacing is checked separately
from the larger opening header.

Known inherited content: Onion Fly's visual caption uses “1/4 in.”; this pilot
preserves it rather than silently modifying approved source. Unit-aware visual
captions need consideration during template migration. Denser later pages and
mixed-family group palette rules also need testing before broad application.
