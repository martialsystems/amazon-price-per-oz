#!/usr/bin/env bash
# Publish the Chrome package zip to GitHub Releases on the public repository.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PUBLIC_REPO="${PUBLIC_REPO:-martialsystems/amazon-price-per-oz}"

"$ROOT/scripts/package_chrome_store.sh"

VER="$(python3 -c "import json; print(json.load(open('$ROOT/manifest.json'))['version'])")"
ZIP="$ROOT/dist/unit-price-sort-chrome-${VER}.zip"
test -f "$ZIP"

NOTES="$(cat <<EOF
Unit Price Sort for Amazon Search ${VER} (Martial Systems LLC)

Install (unpacked)
1. Download the zip below
2. Unzip it
3. chrome://extensions → Developer mode on
4. Load unpacked → the folder that contains manifest.json

Source: https://github.com/${PUBLIC_REPO}

Copyright © 2026 Martial Systems LLC. All rights reserved.
EOF
)"

if gh release view "v${VER}" --repo "$PUBLIC_REPO" >/dev/null 2>&1; then
  gh release upload "v${VER}" "$ZIP" --repo "$PUBLIC_REPO" --clobber
else
  gh release create "v${VER}" "$ZIP" \
    --repo "$PUBLIC_REPO" \
    --title "Unit Price Sort ${VER}" \
    --notes "$NOTES"
fi

echo "Released v${VER} → https://github.com/${PUBLIC_REPO}/releases/tag/v${VER}"
