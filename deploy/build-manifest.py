#!/usr/bin/env python3
"""Describe every built file so transport can be verified before activation."""
import hashlib
import json
import re
import sys
from pathlib import Path


def build_manifest(directory, commit, run_number):
    if not re.fullmatch(r'[0-9a-f]{40}', commit) or run_number < 1:
        raise ValueError('Expected a commit SHA and positive workflow run number')
    directory = Path(directory)
    files = {}
    for path in sorted(directory.rglob('*')):
        if path.is_symlink():
            raise ValueError('Build output must not contain symlinks')
        if path.is_file() and path != directory / 'release-manifest.json':
            files[path.relative_to(directory).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    if not files.get('index.html') or not any(name.startswith('assets/') and name.endswith('.js') for name in files):
        raise ValueError('Expected a Vite build with index.html and JavaScript assets')
    manifest = {'commit': commit, 'run_number': run_number, 'files': files}
    (directory / 'release-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return manifest


if __name__ == '__main__':
    build_manifest(sys.argv[1], sys.argv[2], int(sys.argv[3]))
