#!/usr/bin/python3
"""Non-root release manager. Python 3.7+; no third-party dependencies."""
import argparse
import fcntl
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from contextlib import contextmanager
from pathlib import Path

BASE = Path('/var/www/portfolio')


class ReleaseManager:
    def __init__(self, base=BASE, health_check=None):
        self.base = Path(base).resolve()
        self.releases = self.base / 'releases'
        self.health_check = health_check or self.check_http

    @contextmanager
    def locked(self):
        with (self.base / '.deploy.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            yield

    def release(self, name):
        if not re.fullmatch(r'(?:gha-[0-9]+-[0-9]+-[0-9a-f]{12}|release-[A-Za-z0-9]+)', name):
            raise ValueError('Invalid release name')
        path = self.releases / name
        if path.is_symlink():
            raise ValueError('Release directories cannot be symlinks')
        return path

    def target(self, link):
        path = self.base / link
        if not path.is_symlink():
            raise ValueError('{} must be an existing symlink'.format(link))
        target = path.resolve(strict=True)
        if target.parent != self.releases.resolve():
            raise ValueError('Symlink target must be directly inside releases/')
        self.release(target.name)
        return target

    def point(self, link, target):
        # Unique temporary link, replaced on the same filesystem with rename(2).
        temporary = self.base / '.{}-{}'.format(link, os.getpid())
        if temporary.is_symlink():
            temporary.unlink()
        os.symlink(str(target), str(temporary))
        os.replace(str(temporary), str(self.base / link))

    def prepare(self, name):
        path = self.release(name)
        with self.locked():
            path.mkdir(mode=0o755)  # Existing IDs fail, so uploads cannot overwrite a release.
            path.chmod(0o755)  # Keep Caddy access even if the SSH account has a private umask.
        return path

    def verify(self, path, commit=None, run_number=None):
        if not path.is_dir() or path.is_symlink():
            raise ValueError('Missing release directory')
        manifest_path = path / 'release-manifest.json'
        if manifest_path.is_symlink():
            raise ValueError('Manifest cannot be a symlink')
        manifest = json.loads(manifest_path.read_text())
        if not re.fullmatch(r'[0-9a-f]{40}', manifest['commit']):
            raise ValueError('Invalid commit')
        if type(manifest['run_number']) is not int or manifest['run_number'] < 1:
            raise ValueError('Invalid workflow run number')
        if commit is not None and (manifest['commit'] != commit or manifest['run_number'] != run_number):
            raise ValueError('Release metadata does not match this deployment')
        actual = {}
        for item in path.rglob('*'):
            if item.is_symlink():
                raise ValueError('Release cannot contain symlinks')
            if item.is_file() and item != manifest_path:
                actual[item.relative_to(path).as_posix()] = hashlib.sha256(item.read_bytes()).hexdigest()
        if actual != manifest['files']:
            raise ValueError('Release checksum or file list mismatch')
        if not (path / 'index.html').is_file() or not (path / 'index.html').stat().st_size:
            raise ValueError('Missing or empty index.html')
        if not any(name.startswith('assets/') and name.endswith('.js') for name in actual):
            raise ValueError('Missing JavaScript assets')
        # Caddy runs as a separate user and must be able to traverse/read this tree.
        for item in [path] + list(path.rglob('*')):
            required = 0o005 if item.is_dir() else 0o004
            if item.stat().st_mode & required != required:
                raise ValueError('Release is not readable by the web server')
        return manifest

    @staticmethod
    def check_http(path):
        expected = hashlib.sha256((path / 'index.html').read_bytes()).hexdigest()
        last_error = None
        for attempt in range(5):
            try:
                for url in ['http://127.0.0.1/', 'https://connorddixon.com/']:
                    request = urllib.request.Request(url + '?release_check=' + path.name,
                                                     headers={'Cache-Control': 'no-cache'})
                    with urllib.request.urlopen(request, timeout=5) as response:
                        if hashlib.sha256(response.read()).hexdigest() != expected:
                            raise ValueError('Served index does not match {}'.format(path.name))
                return
            except Exception as error:
                last_error = error
                if attempt < 4:
                    time.sleep(1)
        raise RuntimeError('HTTP/HTTPS release verification failed: {}'.format(last_error))

    def activate(self, name, commit, run_number):
        path = self.release(name)
        with self.locked():
            self.verify(path, commit, run_number)
            old = self.target('current')
            state_path = self.base / '.deploy-watermark.json'
            state = json.loads(state_path.read_text()) if state_path.exists() else {'run_number': 0}
            # Also inspect current, covering recovery if the watermark was lost.
            current_manifest = old / 'release-manifest.json'
            if current_manifest.exists():
                current = json.loads(current_manifest.read_text())
                if current['run_number'] > state['run_number']:
                    state = current
            if run_number < state['run_number']:
                raise ValueError('Stale workflow run; a newer run has already been accepted')
            if run_number == state['run_number'] and commit != state.get('commit'):
                raise ValueError('Run number collision with a different commit')
            # Record BEFORE switching: an interruption can never let an older run win.
            temporary = self.base / '.deploy-watermark.next'
            temporary.write_text(json.dumps({'run_number': run_number, 'commit': commit}) + '\n')
            os.replace(str(temporary), str(state_path))
            if old != path:
                self.point('previous', old)
            self.point('current', path)
            try:
                self.health_check(path)
            except BaseException:
                self.point('current', old)
                raise
        return path

    def rollback(self, name=None):
        with self.locked():
            target = self.release(name) if name else self.target('previous')
            if (target / 'release-manifest.json').exists():
                self.verify(target)
            elif not (target / 'index.html').is_file():
                raise ValueError('Legacy release has no index.html')
            old = self.target('current')
            self.point('current', target)
            try:
                self.health_check(target)
            except BaseException:
                self.point('current', old)
                raise
            if target != old:
                self.point('previous', old)
            # Deliberately retain the watermark when rolling back.
        return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    prepare = commands.add_parser('prepare')
    prepare.add_argument('release')
    activate = commands.add_parser('activate')
    activate.add_argument('release')
    activate.add_argument('commit')
    activate.add_argument('run_number', type=int)
    rollback = commands.add_parser('rollback')
    rollback.add_argument('release', nargs='?')
    commands.add_parser('status')
    args = parser.parse_args()
    manager = ReleaseManager()
    if args.command == 'prepare':
        print(manager.prepare(args.release))
    elif args.command == 'activate':
        print(manager.activate(args.release, args.commit, args.run_number))
    elif args.command == 'rollback':
        print(manager.rollback(args.release))
    else:
        for link in ['current', 'previous']:
            path = manager.base / link
            print('{}: {}'.format(link, os.readlink(str(path)) if path.is_symlink() else 'unset'))
        watermark = manager.base / '.deploy-watermark.json'
        if watermark.exists():
            print('watermark: ' + watermark.read_text().strip())


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Deployment refused: {}'.format(error), file=sys.stderr)
        sys.exit(1)
