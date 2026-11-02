#!/usr/bin/env bash
# Run from the Linode's regular SSH shell: sudo bash deploy/install.sh
set -euo pipefail
umask 022

die() { printf '%s\n' "$*" >&2; exit 1; }
[[ $EUID == 0 ]] || die 'Run with sudo from a regular SSH shell.'
project=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
owner=$(stat -c %U "$project/package.json")
[[ $owner != root ]] || die 'Keep the source owned by your normal user; build scripts must not run as root.'
for tool in curl python3 sha256sum sha512sum tar runuser systemctl ss install; do
  command -v "$tool" >/dev/null || die "Missing prerequisite: $tool"
done
[[ -d /run/systemd/system ]] || die 'This script requires a host running systemd.'
if ! systemctl is-active --quiet portfolio-web; then
  [[ -z $(ss -H -ltn 'sport = :80') ]] || die 'Port 80 is already in use. Inspect the existing server before deploying.'
fi
case $(uname -m) in
  x86_64) node_arch=x64; caddy_arch=amd64 ;;
  aarch64) node_arch=arm64; caddy_arch=arm64 ;;
  *) die 'Supported architectures: x86_64 and aarch64.' ;;
esac
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
fetch() { curl --fail --show-error --silent --location --retry 3 "$1" -o "$2"; }

# Install an isolated current Node 22 runtime without replacing the host's Node.
if [[ ! -x /opt/portfolio-node/bin/node ]]; then
  fetch https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt "$tmp/node-checksums"
  node_file=$(awk -v arch="$node_arch" '$2 ~ ("^node-v22\\.[0-9]+\\.[0-9]+-linux-" arch "\\.tar\\.gz$") {print $2}' "$tmp/node-checksums")
  [[ -n $node_file && $node_file != *$'\n'* ]] || die 'Could not identify the Node archive.'
  fetch "https://nodejs.org/dist/latest-v22.x/$node_file" "$tmp/$node_file"
  (cd "$tmp"; awk -v name="$node_file" '$2 == name' node-checksums | sha256sum --check -)
  install -d /opt/portfolio-node
  tar -xzf "$tmp/$node_file" -C /opt/portfolio-node --strip-components=1
fi
/opt/portfolio-node/bin/node --version
runuser -u "$owner" -- env PATH="/opt/portfolio-node/bin:$PATH" bash -ec 'cd -- "$1"; npm ci --include=dev; npm run build' _ "$project"
[[ -s $project/dist/index.html ]] || die 'Build did not produce dist/index.html.'

# Use the official Caddy release archive and verify its published SHA512 checksum.
if [[ ! -x /usr/local/bin/portfolio-caddy ]]; then
  fetch https://api.github.com/repos/caddyserver/caddy/releases/latest "$tmp/caddy-release.json"
  python3 - "$tmp/caddy-release.json" "$caddy_arch" > "$tmp/caddy-urls" <<'PY'
import json, re, sys
release = json.load(open(sys.argv[1]))
version = release['tag_name'].removeprefix('v') if sys.version_info >= (3, 9) else release['tag_name'].lstrip('v')
if not re.fullmatch(r'\d+\.\d+\.\d+', version):
    raise SystemExit('Expected a stable Caddy release')
assets = {asset['name']: asset['browser_download_url'] for asset in release['assets']}
archive = f'caddy_{version}_linux_{sys.argv[2]}.tar.gz'
print(archive)
print(assets[archive])
print(assets[f'caddy_{version}_checksums.txt'])
PY
  mapfile -t caddy_download < "$tmp/caddy-urls"
  fetch "${caddy_download[1]}" "$tmp/${caddy_download[0]}"
  fetch "${caddy_download[2]}" "$tmp/caddy-checksums"
  (cd "$tmp"; awk -v name="${caddy_download[0]}" '$2 == name || $2 == "*" name' caddy-checksums > caddy-check; test -s caddy-check; sha512sum --check caddy-check)
  tar -xzf "$tmp/${caddy_download[0]}" -C "$tmp" caddy
  install -m 0755 "$tmp/caddy" /usr/local/bin/portfolio-caddy
fi

getent group portfolio-web >/dev/null || groupadd --system portfolio-web
id portfolio-web >/dev/null 2>&1 || useradd --system --gid portfolio-web --home-dir /var/lib/portfolio-web --shell /usr/sbin/nologin portfolio-web
install -d -m 0755 /etc/portfolio-web /var/www/portfolio/releases
# Preserve the installed config on redeploy, including future HTTPS settings.
if [[ ! -f /etc/portfolio-web/Caddyfile ]]; then
  install -m 0644 "$project/deploy/Caddyfile" /etc/portfolio-web/Caddyfile
fi
/usr/local/bin/portfolio-caddy validate --config /etc/portfolio-web/Caddyfile --adapter caddyfile
release=$(mktemp -d /var/www/portfolio/releases/release-XXXXXXXX)
cp -R "$project/dist/." "$release/"
chmod -R a=rX,u+w "$release"
previous=$(readlink /var/www/portfolio/current || true)
ln -s "$release" /var/www/portfolio/current.next
mv -Tf /var/www/portfolio/current.next /var/www/portfolio/current
install -m 0644 "$project/deploy/portfolio-web.service" /etc/systemd/system/portfolio-web.service
systemctl daemon-reload
systemctl enable portfolio-web
if ! systemctl restart portfolio-web || ! curl --fail --silent --show-error --retry 8 --retry-connrefused --retry-delay 1 http://127.0.0.1/ -o "$tmp/served.html" || ! cmp -s "$tmp/served.html" "$release/index.html"; then
  if [[ -n $previous ]]; then
    ln -s "$previous" /var/www/portfolio/current.rollback
    mv -Tf /var/www/portfolio/current.rollback /var/www/portfolio/current
    systemctl restart portfolio-web || true
  fi
  journalctl -u portfolio-web -n 30 --no-pager
  die 'Deployment verification failed. Restored the prior release if one existed.'
fi
printf '\nPortfolio is serving on HTTP port 80. Open http://50.116.29.28/\n'
printf 'If external access fails, check the Linode Cloud Firewall and host firewall for inbound TCP 80.\n'
printf 'Logs: sudo journalctl -u portfolio-web -f\n'
