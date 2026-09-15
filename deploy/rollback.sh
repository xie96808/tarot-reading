#!/usr/bin/env bash
set -euo pipefail
PREVIOUS_RELEASE=${1:?usage: rollback.sh PREVIOUS_RELEASE}
ln -sfn "/srv/tarot/releases/${PREVIOUS_RELEASE}" /srv/tarot/current
systemctl restart tarot
curl -fsS http://127.0.0.1:3000/healthz
