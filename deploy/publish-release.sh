#!/usr/bin/env bash
set -euo pipefail
: "${SYNC_HOST:?}" "${SYNC_USER:?}" "${SYNC_PORT:?}" "${SYNC_PRIVATE_KEY:?}" "${SYNC_KNOWN_HOSTS:?}" "${GITHUB_SHA:?}"
[[ "$GITHUB_SHA" =~ ^[0-9a-f]{40}$ ]] || exit 1
[[ "$SYNC_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || exit 1
[[ "$SYNC_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 1
[[ "$SYNC_PORT" =~ ^[0-9]{1,5}$ ]] && ((10#$SYNC_PORT > 0 && 10#$SYNC_PORT < 65536)) || exit 1
[[ "$(git rev-parse HEAD)" == "$GITHUB_SHA" ]] || exit 1
version=$(rsync --version)
[[ "$version" =~ ^rsync[[:space:]]+version[[:space:]]+3\. ]] || exit 1
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
umask 077
printf '%s\n' "$SYNC_PRIVATE_KEY" > "$work/key"
printf '%s\n' "$SYNC_KNOWN_HOSTS" > "$work/known_hosts"
unset SYNC_PRIVATE_KEY SYNC_KNOWN_HOSTS
# Keep long uploads alive; GitHub Actions → Aliyun can stall without SSH keepalives.
ssh_base=(-i "$work/key" -p "$SYNC_PORT" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$work/known_hosts" -o ConnectTimeout=15 -o ServerAliveInterval=20 -o ServerAliveCountMax=30)
ssh_args=("${ssh_base[@]}")
export RSYNC_RSH="ssh ${ssh_base[*]}"
mkdir "$work/upload"
# Follow build-time symlinks so the server can reject all link entries safely.
tar --dereference --hard-dereference -czf "$work/upload/release.tar.gz" -C .next/standalone .
bytes=$(wc -c < "$work/upload/release.tar.gz")
[[ "$bytes" -le 268435456 ]] || { echo 'Artifact exceeds 256 MiB'; exit 1; }
sha256sum "$work/upload/release.tar.gz" | cut -d ' ' -f 1 > "$work/upload/release.sha256"
printf 'Artifact %s bytes sha256=%s\n' "$bytes" "$(cat "$work/upload/release.sha256")"
ssh "${ssh_args[@]}" "$SYNC_USER@$SYNC_HOST" "prepare $GITHUB_SHA"
# upload is already gzip; skip rsync -z. Integrity is enforced by release.sha256 on activate.
# --timeout fails stalled sockets instead of sitting until the job limit.
attempts=3
for attempt in $(seq 1 "$attempts"); do
  printf 'rsync attempt %s/%s\n' "$attempt" "$attempts"
  if rsync -rlt --delay-updates --timeout=120 --info=progress2 \
      "$work/upload/" "$SYNC_USER@$SYNC_HOST:$GITHUB_SHA/"; then
    break
  fi
  if [[ "$attempt" -eq "$attempts" ]]; then
    echo 'rsync failed after retries' >&2
    exit 1
  fi
  sleep $((attempt * 5))
done
ssh "${ssh_args[@]}" "$SYNC_USER@$SYNC_HOST" "activate $GITHUB_SHA"
printf '### Website deployed\n\nCommit: `%s`\n\nhttps://tarot.xieyw.top\n\nRetains 3 automated releases plus the original legacy backup. Uploads removed after success.\n' "$GITHUB_SHA" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
