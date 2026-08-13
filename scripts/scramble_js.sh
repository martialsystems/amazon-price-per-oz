#!/usr/bin/env bash
# Minify every .js under a directory. Used for public Release zips only.
set -euo pipefail
DIR="${1:-}"
if [[ -z "$DIR" || ! -d "$DIR" ]]; then
  echo "usage: scramble_js.sh DIR" >&2
  exit 2
fi
while IFS= read -r -d '' f; do
  npx --yes terser "$f" -c -m --comments false -o "$f"
done < <(find "$DIR" -type f -name '*.js' -print0)
