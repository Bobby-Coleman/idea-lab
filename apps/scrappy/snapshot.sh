#!/usr/bin/env bash
# Rebuilds apps/scrappy/web/ from a checkout of the Scrappy repo (Expo app).
# Scrappy lives in its own private repo, so the deploy workflow can't build it;
# this snapshot is the web export of Scrappy at a given commit.
#   apps/scrappy/snapshot.sh /path/to/scrappy
set -euo pipefail
SRC="$(cd "$1" && pwd)/mobile"
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE=/idea-lab/scrappy
OUT="$(mktemp -d)"
cp "$SRC/app.json" "$OUT/app.json.bak"
cp "$SRC/index.web.tsx" "$OUT/index.web.bak"
restore() { cp "$OUT/app.json.bak" "$SRC/app.json"; cp "$OUT/index.web.bak" "$SRC/index.web.tsx"; }
trap restore EXIT
# Serve from the Pages subfolder: Expo's baseUrl, and CanvasKit's wasm path.
node -e "const f=process.argv[1],j=JSON.parse(require('fs').readFileSync(f));j.expo.experiments={...(j.expo.experiments||{}),baseUrl:'$BASE'};require('fs').writeFileSync(f,JSON.stringify(j,null,2))" "$SRC/app.json"
sed -i "s#locateFile: (file: string) => \`/\${file}\`#locateFile: (file: string) => \`$BASE/\${file}\`#" "$SRC/index.web.tsx"
grep -q "$BASE/\${file}" "$SRC/index.web.tsx" || { echo "CanvasKit locateFile line changed; update snapshot.sh" >&2; exit 1; }
(cd "$SRC" && [ -d node_modules ] || npm ci --no-audit --no-fund)
(cd "$SRC" && CI=1 npx expo export -p web --output-dir "$OUT/web")
# Make it installable from the home screen like the other prototypes.
cp "$SRC/assets/images/icon.png" "$OUT/web/apple-touch-icon.png"
cat > "$OUT/web/manifest.webmanifest" <<JSON
{ "name": "Scrappy", "short_name": "Scrappy", "description": "Your camera roll, bound into a book.",
  "start_url": "$BASE/", "scope": "$BASE/", "display": "standalone", "orientation": "portrait",
  "background_color": "#0B0B0C", "theme_color": "#0B0B0C",
  "icons": [{ "src": "apple-touch-icon.png", "sizes": "1024x1024", "type": "image/png" }] }
JSON
sed -i 's#<link rel="icon"#<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Scrappy"><meta name="theme-color" content="\#0B0B0C"><meta name="description" content="Your camera roll, bound into a book."><link rel="manifest" href="'"$BASE"'/manifest.webmanifest"><link rel="apple-touch-icon" href="'"$BASE"'/apple-touch-icon.png"><link rel="icon"#' "$OUT/web/index.html"
sed -i 's#width=device-width, initial-scale=1, shrink-to-fit=no#width=device-width, initial-scale=1, viewport-fit=cover#' "$OUT/web/index.html"
rm -rf "$HERE/web" && mv "$OUT/web" "$HERE/web"
echo "$(git -C "$SRC/.." rev-parse --short HEAD)" > "$HERE/SOURCE_COMMIT"
echo "Snapshot of scrappy@$(cat "$HERE/SOURCE_COMMIT") written to $HERE/web"
