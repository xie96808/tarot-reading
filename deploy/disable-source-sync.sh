#!/usr/bin/env bash
# Stops future automatic transfers; intentionally preserves server files and the live service.
set -euo pipefail
gh workflow disable sync-main.yml --repo xie96808/tarot-reading
echo 'Automatic source sync disabled; existing server revisions retained.'
