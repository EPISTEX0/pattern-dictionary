#!/usr/bin/env bash
# Run before each commit that touches assets/dict.css or assets/dict.js.
# Pages link them as assets/dict.css?v=<content hash>, so a browser never pairs
# a new page with an old cached copy (GitHub Pages caches files for 10 minutes).
set -euo pipefail
cd "$(dirname "$0")"
for f in assets/dict.css assets/dict.js; do
  v=$(sha1sum "$f" | cut -c1-8)
  sed -i -E "s#${f//./\\.}(\\?v=[0-9a-f]+)?\"#$f?v=$v\"#g" *.html
done
