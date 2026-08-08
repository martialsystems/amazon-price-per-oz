#!/usr/bin/env bash
# Build a Chrome Web Store zip (runtime only) for Martial Systems LLC.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
NAME="unit-price-sort-chrome"
ZIP="$DIST/${NAME}.zip"
STAGE="$DIST/stage"

rm -rf "$STAGE"
mkdir -p "$STAGE" "$DIST"

# Runtime files only — no .git, docs, store HTML, scripts
cp "$ROOT/manifest.json" "$STAGE/"
cp -R "$ROOT/src" "$STAGE/src"
cp -R "$ROOT/icons" "$STAGE/icons"

# Sanity: required paths
test -f "$STAGE/manifest.json"
test -f "$STAGE/src/background.js"
test -f "$STAGE/src/content.js"
test -f "$STAGE/src/content.css"
test -f "$STAGE/icons/icon128.png"

# Validate manifest JSON
python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$STAGE/manifest.json"

# Version stamp in filename optional
VER="$(python3 -c "import json; print(json.load(open('$STAGE/manifest.json'))['version'])")"
ZIP_VER="$DIST/${NAME}-${VER}.zip"

rm -f "$ZIP" "$ZIP_VER"
(
  cd "$STAGE"
  zip -qr "$ZIP" . -x "*.DS_Store" -x "**/.DS_Store"
)
cp "$ZIP" "$ZIP_VER"

# List package
echo "Packed:"
unzip -l "$ZIP" | sed -n '1,40p'
echo ""
echo "Output:"
echo "  $ZIP"
echo "  $ZIP_VER"
echo "Version: $VER"
echo "Upload $ZIP (or $ZIP_VER) in the Chrome Web Store Developer Dashboard."
