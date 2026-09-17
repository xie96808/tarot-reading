#!/usr/bin/python3 -I
"""Root-owned deployment gate. Only fixed operations and SHA-named artifacts are accepted."""
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import pwd
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request

BASE = Path('/srv/tarot')
SOURCE = BASE / 'source'
RELEASES = BASE / 'releases'
CURRENT = BASE / 'current'
PREVIOUS = BASE / 'previous'
KEEP = 3
MAX_ARCHIVE = 256 * 1024 * 1024
MAX_EXPANDED = 1024 * 1024 * 1024
MIN_FREE = 2 * 1024 * 1024 * 1024
SHA = re.compile(r'^[0-9a-f]{40}$')
MANAGED = re.compile(r'^release-[0-9a-f]{40}$')


def link_to(link, target):
    pending = link.with_name(link.name + '.next')
    pending.unlink(missing_ok=True)
    pending.symlink_to(target)
    os.replace(pending, link)


def restart():
    subprocess.run(['/usr/bin/systemctl', 'restart', 'tarot'], check=True, timeout=45)


def healthy(revision=None):
    for _ in range(30):
        try:
            with urllib.request.urlopen('http://127.0.0.1:3000/healthz', timeout=2) as response:
                body = json.load(response)
            if body.get('ok') is not True or body.get('service') != 'zhu-xia-tarot':
                raise ValueError('Wrong service')
            if revision is not None and body.get('revision') != revision:
                raise ValueError('Wrong revision')
            # Legacy rollback releases may predate the new share-cover asset.
            routes = ['/', '/read'] + (['/og/og-cover.jpg'] if revision is not None else [])
            for route in routes:
                with urllib.request.urlopen('http://127.0.0.1:3000' + route, timeout=3) as response:
                    if response.status != 200:
                        raise ValueError('Page/asset check failed')
            return True
        except Exception:
            time.sleep(1)
    return False


def release_target(link):
    if not link.is_symlink():
        raise ValueError(f'Missing release link: {link.name}')
    target = link.resolve(strict=True)
    if target.parent != RELEASES or not target.is_dir() or not target.name.startswith('release-'):
        raise ValueError('Release link escaped managed directory')
    return target


def prune_sources(except_sha=None):
    # Never follow symlinks or touch unrecognized files/directories.
    for entry in SOURCE.iterdir():
        if SHA.fullmatch(entry.name) and entry.name != except_sha:
            if entry.is_symlink():
                entry.unlink()
            elif entry.is_dir():
                shutil.rmtree(entry)


def prune_releases():
    protected = {release_target(CURRENT)}
    if PREVIOUS.is_symlink():
        protected.add(release_target(PREVIOUS))
    candidates = sorted((p for p in RELEASES.iterdir() if MANAGED.fullmatch(p.name) and p.is_dir() and not p.is_symlink()), key=lambda p: p.stat().st_mtime, reverse=True)
    keep = set(protected)
    for entry in candidates:
        if len([p for p in keep if MANAGED.fullmatch(p.name)]) < KEEP:
            keep.add(entry)
    for entry in candidates:
        if entry not in keep:
            shutil.rmtree(entry)
    # Legacy release-YYYYMMDD directories remain as a one-time baseline backup.


def unpack(archive, target):
    with tarfile.open(archive, 'r:gz') as stream:
        members = stream.getmembers()
        if len(members) > 50000 or sum(max(0, m.size) for m in members) > MAX_EXPANDED:
            raise ValueError('Expanded artifact exceeds limit')
        seen = set()
        for member in members:
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or not (member.isdir() or member.isfile()):
                raise ValueError('Unsafe archive entry')
            normalized = str(path)
            if normalized in seen:
                raise ValueError('Duplicate archive entry')
            seen.add(normalized)
        for member in members:
            dest = target / member.name
            if member.isdir():
                dest.mkdir(parents=True, exist_ok=True)
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                with stream.extractfile(member) as src, dest.open('xb') as out:
                    shutil.copyfileobj(src, out)
                # Strip ownership, setuid/setgid, and unsafe archive permissions.
                dest.chmod(0o755 if member.mode & 0o111 else 0o644)
    for required in ['server.js', '.next/BUILD_ID', 'public/og/og-cover.jpg', 'RELEASE_SHA']:
        if not (target / required).is_file():
            raise ValueError('Incomplete standalone artifact: ' + required)


def artifact_copy(sha, target):
    directory = SOURCE / sha
    if directory.is_symlink() or directory.resolve() != directory or not directory.is_dir():
        raise ValueError('Unsafe source directory')
    archive = directory / 'release.tar.gz'
    checksum = directory / 'release.sha256'
    if archive.is_symlink() or checksum.is_symlink():
        raise ValueError('Symlinked upload')
    directory_fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        checksum_fd = os.open('release.sha256', os.O_RDONLY | os.O_NOFOLLOW, dir_fd=directory_fd)
        with os.fdopen(checksum_fd, 'r') as checksum_stream:
            expected = checksum_stream.read(128).strip()
        if not re.fullmatch(r'[0-9a-f]{64}', expected):
            raise ValueError('Invalid checksum')
        digest = hashlib.sha256()
        count = 0
        fd = os.open('release.tar.gz', os.O_RDONLY | os.O_NOFOLLOW, dir_fd=directory_fd)
        with os.fdopen(fd, 'rb') as src, target.open('xb') as out:
            while True:
                chunk = src.read(1024 * 1024)
                if not chunk:
                    break
                count += len(chunk)
                if count > MAX_ARCHIVE:
                    raise ValueError('Compressed artifact exceeds limit')
                digest.update(chunk)
                out.write(chunk)
    finally:
        os.close(directory_fd)
    if digest.hexdigest() != expected:
        raise ValueError('Upload checksum mismatch')


def activate(sha):
    previous = release_target(CURRENT)
    destination = RELEASES / ('release-' + sha)
    if destination.exists():
        if destination == previous and healthy(sha):
            prune_sources()
            prune_releases()
            print('ALREADY_ACTIVE ' + sha)
            return
        raise ValueError('Release already exists; use a new commit or rollback')
    if shutil.disk_usage(BASE).free < MIN_FREE:
        raise ValueError('Less than 2 GiB free; deployment stopped')
    with tempfile.TemporaryDirectory(prefix='.artifact-', dir=BASE) as work:
        archive = Path(work) / 'release.tar.gz'
        artifact_copy(sha, archive)
        staging = Path(tempfile.mkdtemp(prefix='.incoming-', dir=RELEASES))
        switched = False
        try:
            unpack(archive, staging)
            if (staging / 'RELEASE_SHA').read_text().strip() != sha:
                raise ValueError('Artifact revision mismatch')
            account = pwd.getpwnam('tarot')
            # Keep the staging root inaccessible until all descendants are owned correctly.
            for path in [*sorted(staging.rglob('*'), key=lambda p: len(p.parts), reverse=True), staging]:
                os.chown(path, account.pw_uid, account.pw_gid, follow_symlinks=False)
                if path.is_dir():
                    path.chmod(0o755)
            staging.rename(destination)
            link_to(CURRENT, destination)
            switched = True
            restart()
            if not healthy(sha):
                raise RuntimeError('New release failed health checks')
        except Exception:
            if switched:
                link_to(CURRENT, previous)
                restart()
                if not healthy():
                    raise RuntimeError('Rollback health check failed; administrator attention required')
                print('AUTO_ROLLBACK_OK ' + previous.name, flush=True)
            if staging.exists():
                shutil.rmtree(staging)
            if destination.exists() and CURRENT.resolve() != destination:
                shutil.rmtree(destination)
            raise
    link_to(PREVIOUS, previous)
    os.utime(destination, None)
    prune_releases()
    prune_sources()
    print('DEPLOY_OK ' + sha)


def rollback():
    current = release_target(CURRENT)
    previous = release_target(PREVIOUS)
    link_to(CURRENT, previous)
    try:
        restart()
        if not healthy():
            raise RuntimeError('Previous version failed health checks')
    except Exception:
        link_to(CURRENT, current)
        restart()
        raise
    link_to(PREVIOUS, current)
    print('ROLLBACK_OK ' + previous.name)


def main():
    args = sys.argv[1:]
    if args != ['rollback'] and not (len(args) == 2 and args[0] in ('prepare', 'activate') and SHA.fullmatch(args[1])):
        raise SystemExit('Expected: prepare SHA | activate SHA | rollback')
    if os.geteuid() != 0:
        raise SystemExit('Must run through the configured sudo gate')
    with open('/run/lock/tarot-release.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if args[0] == 'prepare':
            prune_sources(except_sha=args[1])
            prune_releases()
            if shutil.disk_usage(BASE).free < MIN_FREE:
                raise ValueError('Less than 2 GiB free; upload stopped')
            print('PREPARE_OK ' + args[1])
        elif args[0] == 'activate':
            activate(args[1])
        else:
            rollback()


if __name__ == '__main__':
    main()
