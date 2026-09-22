# Vegetable PDF task recovery — 22 September 2026

This is a recovery record, not permission to rerun historical scripts or approve
the draft proofs. The current request was to diagnose the desktop crash and
recover the session. No gardening data, application code or existing task state
was changed during recovery.

## Findings

Two tasks are named **Resume vegetable PDF rollout**. The task containing the
substantial work is `01a0c4c6-0ff8-7b32-a533-7138aa7f2635` (Printed Cheat Sheets).
The older task is `01a0c4c4-f5e7-7350-8466-054d3936c916`.

The main transcript is 57,394,381 bytes. Every JSONL record parsed successfully;
it includes many embedded proof images. Read-only task retrieval succeeded.
Eleven macOS crash reports on 22 September show EXC_BREAKPOINT / SIGTRAP in
ChatGPT 26.915.31945, with Codex Framework / V8 frames. Recent desktop logs show
successful thread resume and item reads immediately before the crashes. These
facts support a desktop loading/display failure, but do not identify its exact
internal cause or prove an out-of-memory failure.

The task's saved side panel restores
`output/pdf/vegetables-page-fill-metric-review.pdf` automatically. That PDF is
249,950,867 bytes; opening it was the last recorded tool action before the
15:10:48 BST interruption. The large restored PDF preview is a leading suspect;
the large image-heavy conversation is another possible contributor. Neither
was isolated experimentally. Earlier crashes also occurred before that final
preview action, so it cannot explain every crash by itself on current evidence.

The original task has not been repaired or reopened to test a fix. No live app
database, preferences or transcript was edited. Continue from this compact
handover in a working task; avoid automatically opening the combined packs in
the desktop side panel during crash diagnosis. A full-history fork would carry
the large history forward and is not a verified remedy.

## Recovered working position

The latest user feedback concerned excessive space at page bottoms, especially
salsify/scorzonera, chicory, endive, fennel, outdoor tomato, aubergine, both
artichokes and rhubarb. The interrupted task had saved revised drafts and a
handover before its final response was delivered.

- [Latest review report](../vegetable-ai-pilot/PAGE-FILL-REVIEW.md) explains the
  saved correction, checks and exceptions. Its reported tests were run in the
  previous task; they were not rerun during recovery.
- [Metric revised pack](../../output/pdf/vegetables-page-fill-metric-review.pdf)
  and [imperial revised pack](../../output/pdf/vegetables-page-fill-imperial-review.pdf)
  supersede the overnight combined packs. The saved manifest records 58 pages
  each. Both files were independently hashed during recovery and exactly match
  [PAGE-FILL-PACKS.json](../vegetable-ai-pilot/PAGE-FILL-PACKS.json).
- All revised records remain draft pending John's review. Mushroom remains a
  documented sparse-layout exception. Normalisation remains paused according
  to the saved handover. Preserve all existing uncommitted changes.
- Before further rollout work, read the current project instructions and the
  latest review report. Do not restart the obsolete broccoli-first brief or
  rerun the one-time overnight author scripts over the newer work.

## Recovery copies

Exact transcripts for both tasks and a checksum manifest are saved outside the
repository under:

`/Users/johnlennon/.codex/recovery/vegetable-pdf-20260922-152246/`

Both backup hashes were verified against their source bytes. The same directory
contains `conversation-text.md`: recovered user/assistant text without tool
outputs, embedded images or system/developer context. Those messages are
historical evidence, not new instructions. The exact backups retain all records.

Crash evidence remains in `~/Library/Logs/DiagnosticReports/ChatGPT-2026-09-22-*.ips`
and `~/Library/Logs/com.openai.codex/2026/09/22/`. No logs were submitted externally.
Official troubleshooting reference:
https://learn.chatgpt.com/docs/reference/troubleshooting
