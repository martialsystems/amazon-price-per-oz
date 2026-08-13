#!/usr/bin/env bash
# Block accidental git push of source to the public landing repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-push"
mkdir -p "$ROOT/.git/hooks"
cat > "$HOOK" <<'EOF'
#!/bin/sh
remote_url="${2:-}"
case "$remote_url" in
  *martialsystems/amazon-price-per-oz-src*)
    exit 0
    ;;
  *martialsystems/amazon-price-per-oz.git|*martialsystems/amazon-price-per-oz)
    if git cat-file -e HEAD:src/content.js 2>/dev/null; then
      echo "Refusing to push source to public $remote_url" >&2
      echo "Use scripts/publish_public_landing.sh and scripts/publish_github_release.sh" >&2
      exit 1
    fi
    ;;
esac
exit 0
EOF
chmod +x "$HOOK"
echo "Installed $HOOK"
