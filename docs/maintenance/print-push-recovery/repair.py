"""Run from the print repository. Default: inspect. --apply: repair locally, never push."""
import argparse
import os
from pathlib import Path
import subprocess
import tempfile

BASE = "f6efdfab81f924560420c9daa3208d31b3ff3a08"
FIRST = "72dfe2a053c8c137a5c237624170b335bfe9f348"
TIP = "c7a4313d23bd673b694be9b3266b00bd55a2e858"
BRANCH = "refs/heads/print-proof"
BACKUP = "refs/local-backups/print-proof-before-zip-repair-c7a4313"
ZIPS = [
    "docs/publication/summer-cover-photo-search/Cover-Photo-Shortlist-Stills.zip",
    "docs/publication/cover-comparisons/saved-photographic-2026-11-12/The-Vegetable-Guru-Direction-03-Photographic-2026-11-12.zip",
]


def git(*args, data=None, env=None):
    return subprocess.run(["git", *args], input=data, stdout=subprocess.PIPE,
                          check=True, env=env).stdout


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def oid(rev):
    return git("rev-parse", rev).decode().strip()


def replacement(old, tree, parent):
    raw = git("cat-file", "commit", old)
    header, message = raw.split(b"\n\n", 1)
    lines = header.splitlines()
    require([line.split(b" ", 1)[0] for line in lines] ==
            [b"tree", b"parent", b"author", b"committer"], "Unexpected commit headers.")
    lines[:2] = [b"tree " + tree.encode(), b"parent " + parent.encode()]
    return git("hash-object", "-w", "-t", "commit", "--stdin",
               data=b"\n".join(lines) + b"\n\n" + message).decode().strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    apply = parser.parse_args().apply
    os.chdir(git("rev-parse", "--show-toplevel").decode().strip())
    require(git("symbolic-ref", "HEAD").decode().strip() == BRANCH and oid(BRANCH) == TIP,
            "Branch or HEAD changed. Inspect the current state before proceeding.")
    require(oid(TIP + "^") == FIRST and oid(FIRST + "^") == BASE, "Unexpected ancestry.")
    require(not git("ls-tree", "-r", TIP, "--", *ZIPS) and
            len(git("ls-tree", "-r", FIRST, "--", *ZIPS).splitlines()) == 2,
            "Unexpected archive paths.")
    print("Confirmed the two pending commits and both deleted archives.", flush=True)
    if not apply:
        return
    remote = git("ls-remote", "--exit-code", "origin", BRANCH).decode().split()
    require(remote == [BASE, BRANCH], "Remote tip changed. Reassess before rewriting.")
    with tempfile.TemporaryDirectory() as tmp:
        env = dict(os.environ, GIT_INDEX_FILE=str(Path(tmp) / "index"))
        git("read-tree", FIRST, env=env)
        git("update-index", "--force-remove", "--", *ZIPS, env=env)
        tree = git("write-tree", env=env).decode().strip()
    changes = git("diff-tree", "--no-renames", "-r", "--name-status", FIRST + "^{tree}", tree)
    require(set(changes.decode().splitlines()) == {"D\t" + path for path in ZIPS},
            "First tree differs beyond the two archives.")
    first = replacement(FIRST, tree, BASE)
    tip = replacement(TIP, oid(TIP + "^{tree}"), first)
    require(oid(tip + "^{tree}") == oid(TIP + "^{tree}"), "Final tree mismatch.")
    objects = git("rev-list", "--objects", "--no-object-names", BASE + ".." + tip)
    sizes = git("cat-file", "--batch-check=%(objecttype) %(objectsize)", data=objects)
    require(all(int(size) <= 100 * 1024**2 for kind, size in
                (row.split() for row in sizes.splitlines()) if kind == b"blob"),
            "Another oversized file remains. Branch untouched.")
    require(git("symbolic-ref", "HEAD").decode().strip() == BRANCH, "Active branch changed.")
    commands = f"create {BACKUP} {TIP}\nupdate {BRANCH} {tip} {TIP}\n"
    git("update-ref", "-m", "Remove duplicate delivery ZIPs from pending history",
        "--stdin", data=commands.encode())
    print("Local repair complete. Original commits preserved at", BACKUP)
    print("To archive the repaired branch: git push origin print-proof")


if __name__ == "__main__":
    main()
