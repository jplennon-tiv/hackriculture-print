# Illustrated Quick Facts Icons

Interim replacement set accepted for use on the print sheets, not final production artwork.

- 19 original SVG masters, exported to transparent 384 x 384 PNGs.
- Quick Facts uses 28px images; Final Tips retains its existing image dimensions.
- The 13 original meanings are retained. Six additional contexts are planting, storage, mulching, weeding, support and protection.
- Row spacing shows distance between rows; plant spacing shows distance along a row. Yield uses scales, while harvest uses a basket. Ready-in uses a calendar and clock; seed-life uses stored seeds and a clock.
- Original PNGs in the parent directory remain unchanged. Core Needs and Key Risks belong to separate asset families and are unchanged.

Regenerate from the project root:

```sh
node scripts/render-quick-fact-icons.mjs
```

The exporter discovers SVG masters in this directory and checks transparency and nonblank artwork before exporting. Review at 28px as well as full size after edits.

`src/lib/quickFactIcons.ts` shares the asset catalog between print and admin. Existing broad sow/soil/harvest tip keys can resolve to more specific context images using the displayed tip text. Specific saved keys take precedence; custom legacy keys retain their parent-directory paths. This is keyword-based selection, not a rewrite of saved crop data. All 19 keys are available in the admin icon picker.
