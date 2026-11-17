# GitHub size cleanup — 17 November 2026

John requested pruning after GitHub rejected a push. **Working-folder cleanup is
complete: eight duplicate delivery ZIPs removed, 1,712,383,144 bytes (1.71 GB).**
Seven distinct historical metadata files, totalling 93,114 bytes, were retained
where an archive contained an older version. All artwork, native source photos,
video stills, PDFs, layered cover files, generation recipes and approvals remain.
[CLEANUP.json](CLEANUP.json) records every archive member and its retained hash.
This completed removal is not permission to run a fresh cleanup automatically.

## Push blocker and remaining action

Local `print-proof` has one commit beyond its remote-tracking branch:
`72dfe2a053c8c137a5c237624170b335bfe9f348`, parent
`f6efdfab81f924560420c9daa3208d31b3ff3a08`. That commit introduces
`docs/publication/summer-cover-photo-search/Cover-Photo-Shortlist-Stills.zip`
(198,595,292 bytes / 189.4 MiB), exceeding GitHub's 100 MiB ordinary-file limit.
A second photographic-cover ZIP is 73.4 MiB and triggers the 50 MiB warning.
Both were verified as duplicate delivery packages and removed from the working
folder; they still exist in the unchanged pending commit. Simply adding a later
commit deleting them will not remove the oversized blob from pushed history.

Git internals are read-only in the current assistant session. No live index,
commit, ref or remote mutation was attempted. The shell's GitHub DNS lookup also
failed, so the remote-tracking tip has not been freshly verified against GitHub.
The prepared script checks the live remote before any index/ref write.

From the project root:

```sh
python3 docs/maintenance/git-size-cleanup-2026-11-17/repair_push.py --apply
```

It verifies the exact branch/HEAD/parent, an empty staged index, the prepared
ignore rules and the live GitHub branch. It then amends only this single pending
commit, removing the two ZIPs and adding `.gitignore`. Existing committed work,
untracked files and other working edits remain unchanged. It does not push.
On success:

```sh
git push origin print-proof
```

No force push is needed. If any check fails, follow its message rather than
bypassing it. A hook/commit failure can leave just these intended changes staged;
inspect them before retrying. The original commit remains in the Git reflog.
Without `--apply`, the script performs local checks only.
[Repair plan](REPAIR-PLAN.json) · [Isolated test results](REPAIR-TEST.json).

## Prevention and verification

The new ignore rules exclude generated ZIP packages in the vegetable-stock,
cover-version, cover-comparison and summer-photo-search folders. The unpacked
sources, artwork, scripts and metadata remain eligible for version control.
Historical delivery receipts are evidence of earlier exports; they are not claims
that pruned ZIPs still exist. Smaller online-delivered artwork ZIPs remain locally
available and ignored. Builders can recreate delivery archives when needed.

The audit examined the working folder and all objects that HEAD would add beyond
locally known remotes. The working-folder scan excluded Git internals and
node_modules; Git object sizes were inspected separately. No broad pruning of
book PDFs, output folders, native photos, approved references or Git history was
performed. Existing output/tmp exclusions remain in force. Deleting working ZIPs
does not immediately reclaim the corresponding Git object-store bytes.

A disposable shared clone verified: unrelated staged work is rejected; a changed
remote is rejected; the amended tree differs only at the two ZIP paths and
`.gitignore`; no outgoing blob then exceeds 100 MiB; an unrelated local file is
unchanged; the real project HEAD and index remain byte-for-byte unchanged.
Actual GitHub push/authentication is not tested. No app tests or book exports were
needed. [Before audit](AUDIT-BEFORE.json).

GitHub's current documentation:
https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
