#!/usr/bin/env bash
# Build a scrambled runtime zip and publish it to the public GitHub Releases tab.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PUBLIC_REPO="${PUBLIC_REPO:-martialsystems/amazon-price-per-oz}"

"$ROOT/scripts/package_chrome_store.sh"
STAGE="$ROOT/dist/stage"
"$ROOT/scripts/scramble_js.sh" "$STAGE"

VER="$(python3 -c "import json; print(json.load(open('$ROOT/manifest.json'))['version'])")"
NAME="unit-price-sort-chrome"
ZIP="$ROOT/dist/${NAME}-${VER}.zip"
ZIP_LATEST="$ROOT/dist/${NAME}.zip"
rm -f "$ZIP" "$ZIP_LATEST"
(
  cd "$STAGE"
  zip -qr "$ZIP" . -x "*.DS_Store" -x "**/.DS_Store"
)
cp "$ZIP" "$ZIP_LATEST"

NOTES="$(cat <<EOF
Unit Price Sort for Amazon Search ${VER} (Martial Systems LLC)

Install (unpacked)
1. Download the zip below
2. Unzip it
3. chrome://extensions → Developer mode on
4. Load unpacked → the folder that contains manifest.json

Source is not published. Proprietary.

https://martialsys.net/
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
