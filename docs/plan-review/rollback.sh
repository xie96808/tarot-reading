#!/bin/sh
# Default is a read-only check. --restore only replaces this design document.
# --self-test executes restoration in a temporary copy, leaving the workspace intact.
set -eu
HERE=$(CDPATH= cd "$(dirname "$0")" && pwd)
exec python3 - "$HERE" "$@" <<'PYCODE'
from pathlib import Path
import hashlib,sys,tempfile
root=Path(sys.argv[1]).parents[1]
mode=sys.argv[2] if len(sys.argv)>2 else '--check'
if mode not in ('--check','--restore','--self-test'):
    raise SystemExit('Usage: rollback.sh [--check|--self-test|--restore]')
old=root/'docs/history/design.original-2026-09-16.md'
current=root/'docs/design.md'
original_hash='8973a0022f85c3c168f69079ef0df1a3752593f204d5dc47644bb2a5e9e68aa6'
modified_hash='766b4f2f9e5c79b57f3cd1113970ae6126565e80070e9849b501319da31d5b01'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(old)==original_hash, 'Original backup integrity mismatch'
def restore(target):
    actual=digest(target)
    if actual==original_hash: return
    if actual!=modified_hash:
        raise SystemExit('Current document has later edits; inspect before restoring.')
    staging=target.with_suffix('.restore-tmp')
    staging.write_bytes(old.read_bytes());staging.replace(target)
    assert digest(target)==original_hash
if mode=='--self-test':
    before=digest(current)
    with tempfile.TemporaryDirectory(prefix='tarot-plan-rollback-') as tmp:
        target=Path(tmp)/'design.md';target.write_bytes(current.read_bytes());restore(target)
        assert target.read_bytes()==old.read_bytes()
    assert digest(current)==before
    print('PASS rollback executed on temporary copy; original bytes restored; workspace unchanged')
elif mode=='--restore':
    restore(current)
    print('RESTORED '+str(current))
    print('SHA256 '+digest(current))
else:
    assert digest(current) in (original_hash,modified_hash), 'Current document has later edits'
    print('PASS rollback inputs verified; no files changed')
PYCODE
