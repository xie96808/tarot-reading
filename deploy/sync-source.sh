#!/usr/bin/env bash
# SSH key is restricted server-side to rsync writes beneath /srv/tarot/source.
set -euo pipefail
: "${SYNC_HOST:?Set ALIYUN_SYNC_HOST}"
: "${SYNC_USER:?Set ALIYUN_SYNC_USER}"
: "${SYNC_PORT:?Set ALIYUN_SYNC_PORT}"
: "${SYNC_PRIVATE_KEY:?Set ALIYUN_SYNC_SSH_KEY}"
: "${SYNC_KNOWN_HOSTS:?Set ALIYUN_SYNC_KNOWN_HOSTS}"
: "${GITHUB_SHA:?Set the source commit SHA}"
[[ "$GITHUB_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
[[ "$SYNC_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Invalid host' >&2; exit 1; }
[[ "$SYNC_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid SSH user' >&2; exit 1; }
[[ "$SYNC_PORT" =~ ^[0-9]{1,5}$ ]] && ((10#$SYNC_PORT > 0 && 10#$SYNC_PORT < 65536)) || { echo 'Invalid SSH port' >&2; exit 1; }
[[ "$(git rev-parse HEAD)" == "$GITHUB_SHA" ]] || { echo 'Checkout does not match requested commit' >&2; exit 1; }
version=$(rsync --version)
[[ "$version" =~ ^rsync[[:space:]]+version[[:space:]]+3\. ]] || { echo 'Use rsync 3.x (the Ubuntu Actions runner provides it)' >&2; exit 1; }
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
umask 077
printf '%s\n' "$SYNC_PRIVATE_KEY" > "$work/key"
printf '%s\n' "$SYNC_KNOWN_HOSTS" > "$work/known_hosts"
unset SYNC_PRIVATE_KEY SYNC_KNOWN_HOSTS
mkdir "$work/source"
git archive "$GITHUB_SHA" | tar -x -C "$work/source"
export RSYNC_RSH="ssh -i $work/key -p $SYNC_PORT -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$work/known_hosts -o ConnectTimeout=15"
destination="$SYNC_USER@$SYNC_HOST:$GITHUB_SHA/"
rsync -rlptz --checksum --safe-links --delay-updates "$work/source/" "$destination"
# Verify content after transfer without deleting or restarting anything.
rsync -rlptzn --checksum --safe-links --out-format='%i %n%L' "$work/source/" "$destination" > "$work/diff"
if [[ -s "$work/diff" ]]; then
  cat "$work/diff" >&2
  echo 'Post-transfer verification found differences' >&2
  exit 1
fi
printf 'SYNC_OK %s\n' "$GITHUB_SHA"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '### Source sync complete\n\nCommit: `%s`\n\nServer directory: `/srv/tarot/source/%s/`\n\nSource only; no build, service restart, or deletion of earlier revisions.\n' "$GITHUB_SHA" "$GITHUB_SHA" >> "$GITHUB_STEP_SUMMARY"
fi
