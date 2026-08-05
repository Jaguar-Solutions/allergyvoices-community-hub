#!/usr/bin/env bash
# Build and prepare a deploy bundle for Hostinger shared hosting.
#
# Default behaviour: build the site, verify the bundle, print a one-paragraph
# upload reminder. Drop the contents of /dist/ into /public_html/ via Hostinger
# File Manager, FileZilla, or any SFTP client.
#
# Optional auto-upload: if HOSTINGER_HOST + HOSTINGER_USER + HOSTINGER_PASS +
# HOSTINGER_REMOTE are set (and `lftp` is installed), this script will mirror
# /dist/ to the remote path automatically. Skip this for now and just upload
# manually until the workflow feels routine.
#
# Usage:
#   ./scripts/deploy-hostinger.sh           # build + verify, no upload
#   ./scripts/deploy-hostinger.sh --upload   # build + verify + lftp mirror

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

UPLOAD=false
if [[ "${1:-}" == "--upload" ]]; then
  UPLOAD=true
fi

# 1. Build ---------------------------------------------------------------------
echo "→ Building production bundle"
npm run build

# 2. Verify the bundle has the bits Hostinger needs ----------------------------
echo ""
echo "→ Verifying dist/"
required=(
  "dist/index.html"
  "dist/.htaccess"
  "dist/sitemap.xml"
  "dist/robots.txt"
  # Offline field mode for the restaurant survey depends on these. If they
  # don't ship, the survey silently stops working without a connection.
  "dist/sw.js"
  "dist/manifest.webmanifest"
)
missing=0
for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then
    echo "  ✓ $f"
  else
    echo "  ✗ $f MISSING"
    missing=$((missing + 1))
  fi
done
if [[ $missing -gt 0 ]]; then
  echo ""
  echo "Bundle is missing $missing required file(s). Aborting."
  exit 1
fi

# 3. Optional auto-upload via lftp --------------------------------------------
if [[ "$UPLOAD" == "true" ]]; then
  : "${HOSTINGER_HOST:?Set HOSTINGER_HOST (e.g. ftp.allergyvoices.com)}"
  : "${HOSTINGER_USER:?Set HOSTINGER_USER}"
  : "${HOSTINGER_PASS:?Set HOSTINGER_PASS}"
  : "${HOSTINGER_REMOTE:?Set HOSTINGER_REMOTE (e.g. /public_html)}"

  if ! command -v lftp >/dev/null 2>&1; then
    echo "lftp not installed. Install via 'brew install lftp' or upload manually."
    exit 1
  fi

  echo ""
  echo "→ Uploading dist/ → $HOSTINGER_HOST:$HOSTINGER_REMOTE"
  lftp -u "$HOSTINGER_USER","$HOSTINGER_PASS" "$HOSTINGER_HOST" <<EOF
set ssl:verify-certificate no
set ftp:ssl-allow yes
mirror --reverse --delete --verbose --exclude-glob .DS_Store dist/ "$HOSTINGER_REMOTE"
bye
EOF
  echo ""
  echo "✓ Uploaded. Visit https://allergyvoices.com to verify."
  exit 0
fi

# 4. Manual-upload reminder ---------------------------------------------------
cat <<'EOF'

→ Build ready. To deploy:

  1. Open Hostinger → File Manager → public_html
  2. Delete (or back up) the existing contents
  3. Upload the contents of ./dist/  (the folder's contents, not the folder)
     - Make sure ".htaccess" comes along (toggle "Show hidden files")
  4. Visit https://allergyvoices.com — hard refresh once

The full bundle lives in:
EOF
echo "   $ROOT/dist"
echo ""
