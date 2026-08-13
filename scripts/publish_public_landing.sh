#!/usr/bin/env bash
# Push a source-free landing tree to the public GitHub repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_REPO="${PUBLIC_REPO:-martialsystems/amazon-price-per-oz}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
LAND="$TMP/landing"
mkdir -p "$LAND/docs"

cp "$ROOT/docs/PUBLIC_README.md" "$LAND/README.md"
cp "$ROOT/LICENSE" "$LAND/"
cp "$ROOT/docs/privacy.html" "$LAND/docs/"
cp "$ROOT/docs/terms.html" "$LAND/docs/"
cp "$ROOT/docs/index.html" "$LAND/docs/"
cp "$ROOT/docs/product.html" "$LAND/docs/"
cp "$ROOT/docs/PRIVACY_POLICY.md" "$LAND/docs/"
cp "$ROOT/docs/TERMS_OF_USE.md" "$LAND/docs/"
if [[ -f "$ROOT/docs/.nojekyll" ]]; then
  cp "$ROOT/docs/.nojekyll" "$LAND/docs/"
else
  : > "$LAND/docs/.nojekyll"
fi
printf '%s\n' '.DS_Store' > "$LAND/.gitignore"

if [[ -e "$LAND/src" || -e "$LAND/manifest.json" || -e "$LAND/scripts" ]]; then
  echo "landing tree must not contain src/, manifest.json, or scripts/" >&2
  exit 1
fi

cd "$LAND"
git init -q -b main
git add .
git -c user.name="Martial Systems LLC" -c user.email="martialsys@gmail.com" \
  commit -q -m "Public landing only. Download the Release zip. Source is not published."
git remote add origin "https://github.com/${PUBLIC_REPO}.git"
git push --force origin main
echo "Public landing → https://github.com/${PUBLIC_REPO}"
