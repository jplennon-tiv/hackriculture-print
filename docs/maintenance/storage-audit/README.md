# Project storage cleanup — completed 10 November 2026

**Completed on John's explicit instruction:** the five recommended groups were removed — **2,087 files, 12.35 GB of file data**. The print folder fell from **33.44 GB to 21.08 GB** (about 12.36 GB of allocated disk usage). The data folder, both repositories' Git history, approved sources and optional video caches were left alone. [Completion and verification ledger](COMPLETION.json) · [Current handover](../../handover/START-HERE.md). Detail edits remain paused.

Sizes below use decimal GB/MB, matching typical Finder presentation. Folder totals are allocated disk usage; candidate savings are file lengths and therefore approximate. APFS sharing, compression and the backup tool may affect actual savings.

## Before cleanup

| Folder | Size | Main contributors |
| --- | ---: | --- |
| `hackriculture-print` | 33.44 GB | Output 21.15 GB; temporary files 6.60 GB; Git 2.95 GB; documents 1.76 GB; artwork/public resources 0.84 GB; dependencies 0.13 GB. |
| `hackriculture-data` | 1.37 GB | Git 1.30 GB, about 95% of the total. Everything outside Git is only about 69 MB, including 48 MB of transaction backups. |

The print folder's `output/pdf/book-preparation/` alone occupies **8.93 GB**. It contained several complete editions plus per-guide versions for different production experiments. Retained parts remain source material: this directory must not be removed wholesale.

## Completed removals

The [file manifest](MANIFEST.json) gives exact paths, sizes, modification times, category and conditions. It is the unchanged audit record, not a reusable deletion script. Only its first five groups were authorised and consumed by this cleanup; the completion ledger records execution. There was no blanket `output/` or `tmp/` deletion.

| Category | File data removed | Completed scope and retained exceptions |
| --- | ---: | --- |
| Temporary PDF/image renders | **6.41 GB** | Removed the 1,627 listed render files. These are raw exports, test comparisons, split artwork/text layers and raster previews. Keep temporary JSON journals/scripts and the entire `tmp/pdfs/whole-book-order-preview/` directory: three PDFs there are still named by the current integration receipt. Approved finished proofs and durable check results remain. |
| Smoke/pagination test exports | **0.21 GB** | Removed the 25 listed generated files in `output/smoke/` and `output/pagination/`. Keep their generating code and reports; outputs can be recreated when those checks are next needed. |
| Seven superseded assembled book PDFs | **3.17 GB** | Retired the old review links and removed the seven listed `compact-book-…-review.pdf` files directly inside `output/pdf/book-preparation/`. **Keep `compact-book-imperial-bookvault-flattened-review.pdf`**: the supplier-preparation route explicitly reads its artwork. |
| Legacy KDP variants | **2.02 GB** | Retired the old KDP review links and removed `output/pdf/book-preparation/kdp/` and `output/pdf/book-preparation/flattened/kdp/`. These are alternative generated exports; current assembly uses the retained Bookvault/current sources. Keep default and Bookvault per-guide sources and all frozen compact/A4 design references. |
| Superseded pH wording proofs | **0.54 GB** | Removed the 72 generated files in `output/pdf/soil-acidity/crops/` and retired the historical comparison's PDF links. Those sixteen wording proposals were never approved and were explicitly superseded. Keep the text diff, copy specification and evidence. **Keep the approved one-page Techniques pH page and its source illustrations.** |

**Removed total: 12,347,208,128 bytes (12.35 GB)** across 2,087 files. The cleanup also removed 203 empty directories within those same output trees. Forty-five old links were retired in the historical book-preparation reader and pH comparison. Their copy, check evidence and current-source links remain. No current approved proof was removed.

**Not included:** the optional 0.55 GB of promotional-video environment/model caches remains intact, as do dependencies, fonts, CapCut snapshots, imported media and editable sources. John authorised the 12.35 GB core cleanup only.

## What to keep

- The current whole-book PDF, page map and integration baselines, including `docs/publication/whole-book-order-preview/integration-2026-10-18/baseline.pdf` and the frozen Techniques sequence. Current scripts verify their exact hashes and reuse native page bodies.
- The actual Bookvault files for physical proof **BV3012332**, including the interior, cover, colour profile and provenance. Print quality was approved against these exact files.
- All approved vegetable revisions, the newly approved variety additions, Troubles pages, topic pages and their HTML/specifications/artwork/approval manifests. These are needed for the eventual integration of the detail edits.
- Default and Bookvault per-guide source exports under `output/pdf/book-preparation/`, plus the imperial Bookvault flattened complete PDF identified above. Earlier labels such as “historical” do not make these source files disposable.
- Approved A4 designs, current illustrations, heroes, masks, fonts and asset provenance. Keep `docs/` and `public/` out of broad cleanup rules.
- The promotional video's v4 slides, page-inset MOV, closing clip, outro, thumbnail, music credit and editable sources. The [promotional handover](../../handover/PROMOTIONAL-SLIDES.md) confirms that some files under `output/` are imported into the native CapCut project. Moving them can break that project. Earlier v1–v3 review exports are possible later candidates, but are not included in this conservative deletion manifest because the retained revision script reads the original review movie.
- Shared canonical records, website and book-layout JSON, provenance, the frozen data reference, and transaction journals. All **97** inspected backup transactions say complete; this is not proof that every older backup is redundant. Keep the latest rollback, the explicitly retained page-fit rollback and receipt-linked recovery material. The entire 48 MB of backups is small enough to leave alone in this pass.

## Why the data repository is large

The [read-only Git object audit](GIT-OBJECTS.json) shows that historical commits contain old `backups/documentation/…` PDFs and image-heavy HTML. Several individual historical PDFs occupy 40–100 MB in compressed storage. The live JSON is not the problem.

About **464 MB** of packed blob storage is outside current branch/tag reachability; checks using Git's reflogs resolve the largest of these to the old documentation backups. These objects therefore must **not** be treated as unprotected junk. Ordinary deletion of present-day files does not erase their Git history, and ordinary maintenance may retain recovery history rather than reclaim this space.

Do not remove `.git`, delete its pack files, expire reflogs or rewrite history in this cleanup. A deliberate later history reduction could remove obsolete binary-backup history, but it would need a verified external history archive and a decision about preserving old commits. That is separate from the safe working-folder cleanup above. No Git maintenance, history rewrite or commit was performed here.

## Backup and execution notes

For regular working backups, exclude the identified disposable render/test paths and rebuildable dependency/model caches. Keep the explicitly retained `tmp` integration inputs. **Do not exclude all `output/`: it contains approved source PDFs and imported video media.** Keep source and approvals with their referenced files; a Git repository alone does not contain all ignored source PDFs.

This cleanup is complete. Do not rerun the consumed removal list, regenerate retired
proofs during routine setup, or treat this approval as permission for additional
cleanup. Any later cleanup must use a fresh audit and John's current scope.
The historical builders and dated checks remain as evidence; references inside
those records describe removed outputs, not missing current inputs. Files were
deleted directly, without another in-project archive or moving them to Trash.
No server or user-owned process was stopped.

## Coverage

Read both projects' instructions, data contract/current notes, active book assembler, supplier artwork route, source registry, relevant proof builders and promotional handover. Measured both complete folder trees and inspected Git pack metadata without mutations. Scanned **92 approval JSON files** for explicit candidate-path collisions: none found. This is not a complete static proof of every dynamically constructed path; the current assembly and supplier exceptions above were traced separately. The manifest records these limits. Execution rechecked every candidate against its recorded size/modification time, confirmed no candidate was open, and retired the obsolete reader links. Post-cleanup verification checks retained source hashes, non-candidate files, optional caches, both Git directories and the complete data-folder file inventory. Exact outcomes are in the completion ledger. No application tests, render jobs, media generation, data saves or Git maintenance were needed.
