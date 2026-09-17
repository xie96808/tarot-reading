#!/usr/bin/env bash
# Stops future automatic deployments; intentionally preserves server files and the live service.
set -euo pipefail
gh workflow disable sync-main.yml --repo xie96808/tarot-reading
echo 'Automatic deployment disabled; existing server revisions retained.'
