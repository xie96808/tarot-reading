import importlib.util
import io
import os
from pathlib import Path
import shutil
import tarfile
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('release', Path(__file__).with_name('tarot-release.py'))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.base = self.root / 'tarot'
        self.base.mkdir()
        self.releases = self.base / 'releases'
        self.releases.mkdir()
        self.source = self.base / 'source'
        self.source.mkdir()
        self.current = self.base / 'current'
        self.previous = self.base / 'previous'
        self.old = self.releases / 'release-legacy'
        self.old.mkdir()
        self.current.symlink_to(self.old)
        self.constants = patch.multiple(release, BASE=self.base, SOURCE=self.source, RELEASES=self.releases, CURRENT=self.current, PREVIOUS=self.previous)
        self.constants.start()
        self.addCleanup(self.constants.stop)
        self.addCleanup(self.temp.cleanup)

    def archive(self, sha, bad=None):
        path = self.root / ('archive-' + sha + '.tar.gz')
        with tarfile.open(path, 'w:gz') as tar:
            for name, data in [('server.js', b'ok'), ('.next/BUILD_ID', b'build'), ('public/og/og-cover.jpg', b'image'), ('RELEASE_SHA', sha.encode())]:
                member = tarfile.TarInfo(name)
                member.size = len(data)
                tar.addfile(member, io.BytesIO(data))
            if bad:
                tar.addfile(bad)
        return path

    def test_rejects_traversal_and_symlinks(self):
        for name, kind in [('../escape', tarfile.REGTYPE), ('/absolute', tarfile.REGTYPE), ('link', tarfile.SYMTYPE)]:
            with self.subTest(name=name):
                bad = tarfile.TarInfo(name)
                bad.type = kind
                bad.linkname = '/etc/passwd'
                dest = self.root / 'unpack'
                dest.mkdir(exist_ok=True)
                with self.assertRaises(ValueError):
                    release.unpack(self.archive('a' * 40, bad), dest)
                self.assertEqual(list(dest.iterdir()), [])

    def test_failed_health_restores_previous_release(self):
        sha = 'a' * 40
        archive = self.archive(sha)
        with patch.object(release, 'artifact_copy', side_effect=lambda _, target: shutil.copyfile(archive, target)), \
             patch.object(release, 'restart') as restart, \
             patch.object(release, 'healthy', side_effect=[False, True]), \
             patch.object(release.pwd, 'getpwnam', return_value=SimpleNamespace(pw_uid=os.getuid(), pw_gid=os.getgid())), \
             patch.object(release.shutil, 'disk_usage', return_value=SimpleNamespace(free=10 * 1024**3)):
            with self.assertRaisesRegex(RuntimeError, 'health checks'):
                release.activate(sha)
            self.assertEqual(restart.call_count, 2)
        self.assertEqual(self.current.resolve(), self.old)
        self.assertFalse((self.releases / ('release-' + sha)).exists())

    def test_retention_protects_current_previous_and_legacy(self):
        entries = []
        for i in range(5):
            entry = self.releases / ('release-' + str(i) * 40)
            entry.mkdir()
            os.utime(entry, (i + 1, i + 1))
            entries.append(entry)
        release.link_to(self.current, entries[0])
        release.link_to(self.previous, entries[1])
        release.prune_releases()
        self.assertTrue(self.old.exists())
        self.assertTrue(entries[0].exists())
        self.assertTrue(entries[1].exists())
        self.assertTrue(entries[-1].exists())
        self.assertEqual(sum(p.exists() for p in entries), 3)

    def test_source_cleanup_preserves_unknown_dirs_and_selected_upload(self):
        for name in ['a' * 40, 'b' * 40, 'unrelated']:
            (self.source / name).mkdir()
        release.prune_sources('b' * 40)
        self.assertFalse((self.source / ('a' * 40)).exists())
        self.assertTrue((self.source / ('b' * 40)).exists())
        self.assertTrue((self.source / 'unrelated').exists())

    def test_low_disk_stops_before_activation(self):
        with patch.object(release.shutil, 'disk_usage', return_value=SimpleNamespace(free=100)), \
             patch.object(release, 'restart') as restart:
            with self.assertRaisesRegex(ValueError, '2 GiB'):
                release.activate('a' * 40)
            restart.assert_not_called()
        self.assertEqual(self.current.resolve(), self.old)

    def test_manual_rollback_switches_links(self):
        older = self.releases / ('release-' + 'b' * 40)
        older.mkdir()
        self.previous.symlink_to(older)
        with patch.object(release, 'restart'), patch.object(release, 'healthy', return_value=True):
            release.rollback()
        self.assertEqual(self.current.resolve(), older)
        self.assertEqual(self.previous.resolve(), self.old)


if __name__ == '__main__':
    unittest.main()
