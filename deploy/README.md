# Production deployment

GitHub: `cnrdxn/ai-portfolio-website` · production: https://connorddixon.com · Linode: `50.116.29.28:22`.

Caddy service `portfolio-web` already serves `/var/www/portfolio/current`. Releases live in `/var/www/portfolio/releases/`. The installed HTTPS configuration, certificates, Caddy binary, and service are preserved.

**Do not run `deploy/install.sh` for this setup or for routine updates.** It is the original root bootstrap installer and restarts Caddy. The Actions workflow never invokes it, uses sudo, changes HTTPS configuration, or reloads/restarts Caddy.

## How deployment works

Pushes to `main` run the workflow. Manual dispatch is also available; a job guard refuses every ref except `refs/heads/main` in this repository. Configure the production environment to allow only `main` as an additional enforcement layer.

1. An Ubuntu runner installs Node 24 LTS, runs `npm ci`, tests the release logic, typechecks/builds, and runs the browser suite (including mobile layouts and touch interactions).
2. A SHA-256 manifest is added to `dist/`, recording the commit, workflow run number, and every built file. Official Actions are pinned to immutable commits.
3. A dedicated SSH key authenticates as `portfolio-deploy`. SSH requires an independently verified server host key; it never uses `StrictHostKeyChecking=no` or trusts a fresh network scan automatically.
4. Only the contents of `dist/` are uploaded with rsync into `gha-RUN_ID-ATTEMPT-SHORT_SHA`. Source code, dependencies, and SSH credentials stay on the runner. The server helper is provisioned once by an administrator.
5. The workflow checks the authenticated GitHub API for the current `main` SHA before upload and immediately before activation. Superseded builds stop without switching the site.
6. Under a server-side file lock, the helper checks metadata, the exact file list, every checksum, symlinks, and web-server read permissions. A persistent run-number watermark rejects older runs, including after a rollback. Retries of the same run/commit can use a fresh attempt directory.
7. `previous` records the current release. An atomic same-filesystem symlink replacement switches `current`. Local HTTP and public HTTPS must serve the uploaded index bytes; failure restores the old symlink and fails the job.

Workflow concurrency serializes runs without canceling an active deployment. GitHub's pending-run ordering is not assumed: SHA checks and the server watermark provide the freshness checks. A commit pushed after the final SHA check will be handled by its queued run. Manual cancellation or a connection failure can leave an uploaded directory behind; the next deployment remains independent. All release directories are retained, including the original installer release. Monitor disk usage and remove unused releases manually after confirming they are neither `current` nor `previous`.

## One-time setup: your computer

Generate a dedicated key for this repository only. Keep the private key out of Git and chat.

```bash
mkdir -p ~/.ssh
chmod 0700 ~/.ssh
ssh-keygen -t ed25519 -N '' -C 'portfolio-github-actions' \
  -f ~/.ssh/portfolio_github_actions
cat ~/.ssh/portfolio_github_actions.pub
```

Copy the single public-key line for the next section. The empty passphrase allows unattended Actions use; GitHub encrypts the private key as an environment secret. This key is a server login key, not a GitHub repository deploy key.

## One-time setup: Linode, as cnrdxn over SSH

Run from the existing clone of `ai-portfolio-website` after pulling the commit containing these files. These commands preserve the currently served release. No OS upgrade or service restart is performed.

```bash
git pull --ff-only
sudo apt install --no-install-recommends python3 rsync
/usr/bin/python3 --version
sudo test -L /var/www/portfolio/current
sudo test -s /var/www/portfolio/current/index.html
sudo systemctl is-active portfolio-web
```

Python must be at least 3.7. If a check fails, stop and inspect the server before continuing. On this older Debian host, APT must already use working archive repositories; do not bypass package signatures.

Create the unprivileged account and install the release helper:

```bash
id portfolio-deploy || sudo adduser --disabled-password --gecos '' \
  --home /var/lib/portfolio-deploy portfolio-deploy

sudo install -o root -g root -m 0755 deploy/portfolio-release.py \
  /usr/local/bin/portfolio-release

sudo chown portfolio-deploy:portfolio-deploy \
  /var/www/portfolio /var/www/portfolio/releases
sudo chmod 0755 /var/www/portfolio /var/www/portfolio/releases

sudo install -d -o portfolio-deploy -g portfolio-deploy -m 0700 \
  /var/lib/portfolio-deploy/.ssh
```

Ownership changes above apply to the two directories only, without recursively changing existing releases. Keep the account out of the sudo group and give it no sudoers rule. The key can run commands as this account, whose production write access is limited to the portfolio directory. The service account remains `portfolio-web`.

Paste the public key when prompted, then press Enter:

```bash
read -r -p 'Paste the dedicated ssh-ed25519 public key: ' DEPLOY_PUBLIC_KEY
printf 'restrict %s\n' "$DEPLOY_PUBLIC_KEY" | \
  sudo tee /var/lib/portfolio-deploy/.ssh/authorized_keys >/dev/null
sudo chown portfolio-deploy:portfolio-deploy \
  /var/lib/portfolio-deploy/.ssh/authorized_keys
sudo chmod 0600 /var/lib/portfolio-deploy/.ssh/authorized_keys
unset DEPLOY_PUBLIC_KEY

sudo -u portfolio-deploy /usr/local/bin/portfolio-release status
sudo -u portfolio-web test -r /var/www/portfolio/current/index.html
curl --fail --silent --show-error https://connorddixon.com/ >/dev/null
```

The `restrict` key option disables forwarding, PTY allocation, and user startup files. It still permits the SSH commands and rsync required by deployment. No root SSH login is used. Existing account/key files should be reviewed before re-running this setup; the key command replaces this dedicated account's `authorized_keys`.

## One-time setup: verify the server host key

Use Linode's trusted Lish console, or an existing SSH session whose host identity you previously verified. Run:

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
sudo awk '{print "50.116.29.28 " $1 " " $2}' \
  /etc/ssh/ssh_host_ed25519_key.pub
```

On your computer, save the second command's single output line:

```bash
cat > ~/.ssh/portfolio_github_actions.known_hosts
```

Paste the line, press Enter, then Ctrl-D. Confirm its fingerprint matches the trusted console output and test the dedicated login:

```bash
ssh-keygen -lf ~/.ssh/portfolio_github_actions.known_hosts
ssh -i ~/.ssh/portfolio_github_actions -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="$HOME/.ssh/portfolio_github_actions.known_hosts" \
  portfolio-deploy@50.116.29.28 /usr/local/bin/portfolio-release status
```

If the host key changes, verify the new key through Lish before updating the secret. Do not disable host verification.

## One-time setup: GitHub

In the repository's **Settings → Environments**, create `production`. Under **Deployment branches and tags**, select **Selected branches and tags** and add branch `main` only. Required reviewers are optional; leave them unset for automatic deployment on push. Ensure GitHub Actions is enabled for the repository.

Add these **environment secrets** under `production`:

| Secret | Value |
| --- | --- |
| `PORTFOLIO_SSH_PRIVATE_KEY` | Entire contents of `~/.ssh/portfolio_github_actions`, including header/footer |
| `PORTFOLIO_SSH_KNOWN_HOSTS` | Verified `50.116.29.28 ssh-ed25519 ...` line saved above |

Using authenticated GitHub CLI from your computer:

```bash
gh secret set PORTFOLIO_SSH_PRIVATE_KEY \
  --repo cnrdxn/ai-portfolio-website --env production \
  < ~/.ssh/portfolio_github_actions

gh secret set PORTFOLIO_SSH_KNOWN_HOSTS \
  --repo cnrdxn/ai-portfolio-website --env production \
  < ~/.ssh/portfolio_github_actions.known_hosts
```

The workflow fixes the host, port, and user explicitly, so no additional secrets or personal access token are required. GitHub supplies a read-only `GITHUB_TOKEN` for freshness checks. Allow inbound SSH on port 22 from the runner; if the firewall restricts SSH to your own IP, a GitHub-hosted runner cannot connect until that policy is accommodated. Do not change existing HTTP/HTTPS firewall rules.

## First deployment and verification

After server setup and secrets are complete, dispatch on `main`:

```bash
gh workflow run deploy.yml --ref main --repo cnrdxn/ai-portfolio-website
gh run list --workflow deploy.yml --repo cnrdxn/ai-portfolio-website
```

Use the displayed run ID:

```bash
gh run watch RUN_ID --repo cnrdxn/ai-portfolio-website --exit-status
curl --fail --silent --show-error \
  https://connorddixon.com/release-manifest.json
```

The manifest's `commit` must match the deployed run. On Linode:

```bash
sudo -u portfolio-deploy /usr/local/bin/portfolio-release status
readlink -f /var/www/portfolio/current
readlink -f /var/www/portfolio/previous
sudo systemctl is-active portfolio-web
curl --fail --silent --show-error https://connorddixon.com/ >/dev/null
```

The Actions log verifies HTTP and HTTPS contents automatically. Also open the website and check project dialogs, the orb, and the mobile layout. The initial workflow push may fail before one-time setup; it leaves the existing site untouched. Dispatch again after configuration. For later helper changes, an administrator must explicitly reinstall the reviewed helper with the `sudo install` command above; routine workflow runs do not update server tooling.

## Rollback

Run on Linode as your normal administrator account:

```bash
sudo -u portfolio-deploy /usr/local/bin/portfolio-release rollback
```

This atomically switches to `previous`, verifies HTTP/HTTPS, and restores the starting release if verification fails. It keeps the deployment watermark, so an old Actions run cannot undo the rollback. To choose an explicitly retained release instead:

```bash
ls /var/www/portfolio/releases
sudo -u portfolio-deploy /usr/local/bin/portfolio-release rollback RELEASE_DIRECTORY_NAME
```

Use a directory basename from that listing, for example `gha-123456789-1-abcdef012345`. The legacy `release-XXXXXXXX` directory is also supported. Neither rollback command restarts Caddy. Pause workflow runs before an emergency rollback if a newer deployment is queued; a newer authorized run can still deploy afterward. Fix/revert the source on `main` to make the rollback persist through subsequent pushes.

## Local validation

```bash
python3 -m unittest discover -s deploy/tests -v
bash -n deploy/install.sh
npm ci
npm run build
# With npm run dev running in another terminal:
npm test
```

Tests use temporary directories and simulated health checks. They cover corrupt/incomplete uploads, unsafe symlinks, stale runs, retries, server locking, activation, automatic recovery, legacy rollback, and watermark preservation. They never contact production or modify Caddy. The actual SSH authorization, remote permissions, and production HTTP/HTTPS path can only be verified after you complete the Linode and GitHub setup.

References: [GitHub concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency), [deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments), [setup-node](https://github.com/actions/setup-node).
