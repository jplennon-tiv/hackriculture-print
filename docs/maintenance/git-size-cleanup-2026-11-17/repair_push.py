#!/usr/bin/env python3
"""One-time repair of the oversized unpublished cover commit. No push is made."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PLAN = json.loads((HERE / 'REPAIR-PLAN.json').read_text())


def git(*args, input=None):
    return subprocess.check_output(['git', *args], cwd=ROOT, input=input).decode().strip()


def require(test, message):
    if not test:
        raise RuntimeError(message)


def check_local():
    require(git('branch', '--show-current') == PLAN['branch'], 'Wrong branch; nothing changed.')
    require(git('rev-parse', 'HEAD') == PLAN['head_before'],
            'HEAD has changed or this repair is already complete. Reassess; nothing changed.')
    require(git('rev-list', '--parents', '-n', '1', 'HEAD').split() ==
            [PLAN['head_before'], PLAN['upstream_before']],
            'Expected one unpublished non-merge commit; nothing changed.')
    require(git('rev-parse', '@{upstream}') == PLAN['upstream_before'],
            'The remote-tracking branch has changed; nothing changed.')
    require(not git('diff', '--cached', '--name-only'),
            'Other changes are already staged. Commit or unstage them deliberately first; nothing changed.')
    require(hashlib.sha256((ROOT / '.gitignore').read_bytes()).hexdigest() == PLAN['gitignore_sha256'],
            '.gitignore changed since the audit. Reassess; nothing changed.')
    for name in PLAN['remove_from_commit']:
        git('ls-files', '--error-unmatch', '--', name)


def check_remote():
    lines = git('ls-remote', '--heads', 'origin', 'refs/heads/' + PLAN['branch']).splitlines()
    require(len(lines) == 1 and lines[0].split()[0] == PLAN['upstream_before'],
            'The live GitHub branch differs from the audited upstream. Nothing changed; do not force-push.')


def large_outgoing_blobs():
    lines = git('rev-list', '--objects', 'HEAD', '--not', '--remotes').splitlines()
    names = dict(line.split(' ', 1) if ' ' in line else (line, '') for line in lines)
    raw = git('cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)',
              input=('\n'.join(names) + '\n').encode())
    large = []
    for line in raw.splitlines():
        oid, kind, size = line.split()
        if kind == 'blob' and int(size) > 100 * 1024 * 1024:
            large.append({'path': names[oid], 'bytes': int(size)})
    return large


def apply_repair():
    expected = set(PLAN['remove_from_commit'] + PLAN['stage_other'])
    # --cached removes only the indexed copies; any rebuilt local ZIP stays on disk.
    git('rm', '--cached', '--', *PLAN['remove_from_commit'])
    git('add', '--', *PLAN['stage_other'])
    require(set(git('diff', '--cached', '--name-only').splitlines()) == expected,
            'Unexpected staged paths; stopped before committing. Inspect the index.')
    git('commit', '--amend', '--no-edit')
    new_head = git('rev-parse', 'HEAD')
    require(git('rev-parse', 'HEAD^') == PLAN['upstream_before'], 'Parent verification failed.')
    require(set(git('diff', '--name-only', PLAN['head_before'], new_head).splitlines()) == expected,
            'Commit-difference verification failed; inspect before pushing.')
    blockers = large_outgoing_blobs()
    receipt = {'old_head': PLAN['head_before'], 'new_head': new_head,
               'parent_unchanged': True, 'only_changed_paths': sorted(expected),
               'remaining_outgoing_blobs_over_100_mib': blockers,
               'push_performed': False}
    (HERE / 'REPAIR-RESULT.json').write_text(json.dumps(receipt, indent=2) + '\n')
    require(not blockers, 'Other oversized objects remain. See REPAIR-RESULT.json before pushing.')
    print('Repaired ' + new_head[:12] + '; all other committed content is unchanged.')
    print('Your other working changes remain uncommitted. No push was made.')
    print('Next: git push origin print-proof')
    print('The original commit remains recoverable through Git reflog: ' + PLAN['head_before'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Verify the live remote, then amend this one commit.')
    args = parser.parse_args()
    check_local()
    print('Verified the audited branch, commit, parent, empty index and ignore rules.')
    print('Remove these delivery ZIPs from the unpublished commit:')
    for path in PLAN['remove_from_commit']:
        print('  ' + path)
    print('Add only .gitignore; keep every other committed/uncommitted file unchanged.')
    if not args.apply:
        print('CHECK ONLY. Re-run with --apply to check GitHub and perform the amendment.')
        return
    check_remote()  # Complete every preflight before the first index/ref write.
    apply_repair()


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as exc:
        raise SystemExit('Stopped: ' + str(exc))
