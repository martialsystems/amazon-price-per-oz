#!/usr/bin/env bash
# Snapshot the current source tree to the private -src remote.
# Uses a single new commit so GitHub GH007 (historical IU emails) cannot fire.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_REPO="${SRC_REPO:-martialsystems/amazon-price-per-oz-src}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$ROOT/src/content.js" || ! -f "$ROOT/manifest.json" ]]; then
  echo "refusing: this does not look like the Unit Price Sort source tree" >&2
  exit 1
fi

rsync -a \
  --exclude '.git/' \
  --exclude 'dist/' \
  --exclude 'node_modules/' \
  --exclude '.DS_Store' \
  --exclude '*.zip' \
  "$ROOT/" "$TMP/src/"

cd "$TMP/src"
git init -q -b main
git add .
git -c user.name="Martial Systems LLC" -c user.email="25778085+martialsystems@users.noreply.github.com" \
  commit -q -m "Unit Price Sort source (private snapshot)."
git remote add origin "https://github.com/${SRC_REPO}.git"
git push --force origin main
echo "Private source → https://github.com/${SRC_REPO}"
