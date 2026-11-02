import importlib.util
import json
import os
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, str(ROOT / filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


release = load('portfolio_release', 'portfolio-release.py')
builder = load('build_manifest', 'build-manifest.py')
SHA = 'a' * 40
OTHER_SHA = 'b' * 40


class Releases(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name).resolve()
        (self.base / 'releases').mkdir()
        self.checked = []
        self.manager = release.ReleaseManager(self.base, self.checked.append)
        self.legacy = self.base / 'releases/release-initial'
        self.legacy.mkdir()
        (self.legacy / 'index.html').write_text('original running website')
        os.symlink(str(self.legacy), str(self.base / 'current'))

    def build(self, run, sha=SHA, attempt=1):
        name = 'gha-{}-{}-{}'.format(run, attempt, sha[:12])
        path = self.manager.prepare(name)
        (path / 'assets').mkdir()
        (path / 'assets/app.js').write_text('console.log("release {}")'.format(run))
        (path / 'index.html').write_text('<script src="/assets/app.js"></script>')
        builder.build_manifest(path, sha, run)
        return name, path

    def test_success_records_previous_and_serves_verified_release(self):
        name, path = self.build(5)
        self.manager.activate(name, SHA, 5)
        self.assertEqual(self.manager.target('current'), path)
        self.assertEqual(self.manager.target('previous'), self.legacy)
        self.assertEqual(self.checked, [path])
        self.assertTrue((self.legacy / 'index.html').exists())

    def test_corrupted_missing_or_extra_file_never_switches_current(self):
        for change in ['corrupt', 'missing', 'extra']:
            name, path = self.build(5, attempt={'corrupt': 1, 'missing': 2, 'extra': 3}[change])
            if change == 'corrupt':
                (path / 'assets/app.js').write_text('corrupted')
            elif change == 'missing':
                (path / 'assets/app.js').unlink()
            else:
                (path / 'source.ts').write_text('unexpected upload')
            with self.assertRaises(ValueError):
                self.manager.activate(name, SHA, 5)
            self.assertEqual(self.manager.target('current'), self.legacy)

    def test_symlink_and_unreadable_files_are_rejected(self):
        name, path = self.build(5)
        (path / 'assets/escape').symlink_to('/etc/passwd')
        with self.assertRaises(ValueError):
            self.manager.activate(name, SHA, 5)
        (path / 'assets/escape').unlink()
        (path / 'assets/app.js').chmod(0o600)
        with self.assertRaises(ValueError):
            self.manager.activate(name, SHA, 5)
        self.assertEqual(self.manager.target('current'), self.legacy)

    def test_metadata_must_match_workflow(self):
        name, _ = self.build(5)
        for sha, run in [(OTHER_SHA, 5), (SHA, 6)]:
            with self.assertRaises(ValueError):
                self.manager.activate(name, sha, run)
        self.assertEqual(self.manager.target('current'), self.legacy)

    def test_health_failure_restores_original_and_retains_watermark(self):
        name, _ = self.build(5)
        self.manager.health_check = lambda path: (_ for _ in ()).throw(RuntimeError('unhealthy'))
        with self.assertRaises(RuntimeError):
            self.manager.activate(name, SHA, 5)
        self.assertEqual(self.manager.target('current'), self.legacy)
        self.assertEqual(json.loads((self.base / '.deploy-watermark.json').read_text())['run_number'], 5)
        older, _ = self.build(4)
        with self.assertRaises(ValueError):
            self.manager.activate(older, SHA, 4)

    def test_stale_runs_cannot_replace_newer_deployment_even_after_rollback(self):
        latest, path = self.build(8)
        older, _ = self.build(7)
        self.manager.activate(latest, SHA, 8)
        with self.assertRaises(ValueError):
            self.manager.activate(older, SHA, 7)
        self.manager.rollback()
        self.assertEqual(self.manager.target('current'), self.legacy)
        self.assertEqual(self.manager.target('previous'), path)
        with self.assertRaises(ValueError):
            self.manager.activate(older, SHA, 7)

    def test_lost_watermark_does_not_allow_older_run_over_current(self):
        latest, path = self.build(8)
        self.manager.activate(latest, SHA, 8)
        (self.base / '.deploy-watermark.json').unlink()
        older, _ = self.build(7)
        with self.assertRaises(ValueError):
            self.manager.activate(older, SHA, 7)
        self.assertEqual(self.manager.target('current'), path)

    def test_duplicate_id_path_traversal_and_symlink_directories_are_rejected(self):
        name, _ = self.build(5)
        with self.assertRaises(FileExistsError):
            self.manager.prepare(name)
        for invalid in ['../../etc', 'current', 'gha-1-1-' + SHA[:12] + ';id']:
            with self.assertRaises(ValueError):
                self.manager.prepare(invalid)
        name = 'gha-9-1-' + SHA[:12]
        (self.base / 'releases' / name).symlink_to(self.legacy)
        with self.assertRaises(ValueError):
            self.manager.prepare(name)

    def test_same_run_rerun_is_allowed_but_commit_collision_is_rejected(self):
        name, _ = self.build(5)
        self.manager.activate(name, SHA, 5)
        retry, path = self.build(5, attempt=2)
        self.manager.activate(retry, SHA, 5)
        collision, _ = self.build(5, OTHER_SHA)
        with self.assertRaises(ValueError):
            self.manager.activate(collision, OTHER_SHA, 5)
        self.assertEqual(self.manager.target('current'), path)

    def test_lock_serializes_server_operations(self):
        entered = threading.Event()
        def prepare():
            entered.set()
            return self.manager.prepare('gha-1-1-' + SHA[:12])
        with ThreadPoolExecutor(max_workers=1) as executor:
            with self.manager.locked():
                future = executor.submit(prepare)
                self.assertTrue(entered.wait(2))
                self.assertFalse(future.done())
            self.assertTrue(future.result(timeout=2).is_dir())

    def test_failed_manual_rollback_restores_current(self):
        name, path = self.build(8)
        self.manager.activate(name, SHA, 8)
        self.manager.health_check = lambda path: (_ for _ in ()).throw(RuntimeError('unhealthy'))
        with self.assertRaises(RuntimeError):
            self.manager.rollback()
        self.assertEqual(self.manager.target('current'), path)


if __name__ == '__main__':
    unittest.main()
