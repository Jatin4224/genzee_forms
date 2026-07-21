#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  if [ ! -f ".env.example" ]; then
    echo "❌ Neither .env nor .env.example found — cannot continue." >&2
    exit 1
  fi
  cp .env.example .env
  echo "Created .env from .env.example. ✅"
fi

# Copy the root .env into every workspace, overwriting whatever is there.
#
# Overwriting is the point: a stale per-package .env that disagrees with the
# root is the worst kind of failure, because each package then silently reads
# a different database. Copies rather than links, because neither symlinks nor
# hard links behave reliably on Windows.
synced=0
for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  if ! cmp -s .env "$dir/.env" 2>/dev/null; then
    cp .env "$dir/.env"
    echo "  synced $dir/.env"
    synced=$((synced + 1))
  fi
done

if [ "$synced" -eq 0 ]; then
  echo "All workspaces already up to date. ✅"
else
  echo "Synced $synced workspace(s). ✅"
fi

echo
echo "Re-run this script after editing the root .env."
