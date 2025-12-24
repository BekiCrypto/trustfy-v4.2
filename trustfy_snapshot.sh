#!/usr/bin/env bash
set -e

OUT="__trustfy_snapshot__"
rm -rf "$OUT"
mkdir -p "$OUT"

echo "📦 Trustfy snapshot started..."

# 1. Repo tree (filtered)
echo "📂 Capturing directory tree..."
echo "📂 Capturing directory tree..."
find . \
  -type d \( \
    -name node_modules -o \
    -name dist -o \
    -name .git -o \
    -name .next -o \
    -name build -o \
    -name coverage -o \
    -name test-results -o \
    -name __trustfy_snapshot__ \
  \) -prune -false -o -print \
  > "$OUT/tree.txt"

# 2. Root configs
echo "📄 Capturing root configs..."
cp docker-compose.yml "$OUT/" 2>/dev/null || true
cp package.json "$OUT/package.root.json" 2>/dev/null || true
cp README.md "$OUT/" 2>/dev/null || true

# 3. Web
echo "🎨 Capturing web (UI)..."
mkdir -p "$OUT/web"
cp web/package.json "$OUT/web/" 2>/dev/null || true
cp web/vite.config.ts "$OUT/web/" 2>/dev/null || true
cp web/tsconfig*.json "$OUT/web/" 2>/dev/null || true

# UI routes & API wiring
grep -R "createBrowserRouter\|Routes\|Route" web/src > "$OUT/web/routes.txt" || true
grep -R "VITE_API_URL\|axios\|fetch\|/v1/" web/src > "$OUT/web/api-usage.txt" || true
grep -R "auth\|session\|localStorage" web/src > "$OUT/web/auth.txt" || true

# 4. API
echo "🧠 Capturing api (backend)..."
mkdir -p "$OUT/api"
cp api/package.json "$OUT/api/" 2>/dev/null || true
cp api/tsconfig*.json "$OUT/api/" 2>/dev/null || true
cp -r api/prisma "$OUT/api/" 2>/dev/null || true

grep -R "Controller\|router\|@Get\|@Post\|/v1/" api/src > "$OUT/api/routes.txt" || true
grep -R "@trustfy/shared" api/src > "$OUT/api/shared-usage.txt" || true
grep -R "escrow\|dispute\|indexer" api/src > "$OUT/api/domain.txt" || true

# 5. Worker
echo "⚙️ Capturing worker..."
mkdir -p "$OUT/worker"
cp worker/package.json "$OUT/worker/" 2>/dev/null || true
grep -R "escrow\|indexer\|sync" worker/src > "$OUT/worker/logic.txt" || true

# 6. Shared
echo "🔗 Capturing shared..."
mkdir -p "$OUT/shared"
cp shared/package.json "$OUT/shared/" 2>/dev/null || true
tree shared/src > "$OUT/shared/tree.txt" || true

# 7. Tests
echo "🧪 Capturing tests..."
mkdir -p "$OUT/tests"
tree web/tests > "$OUT/tests/tree.txt" 2>/dev/null || true
grep -R "page.goto\|/app/\|/v1/" web/tests > "$OUT/tests/e2e-usage.txt" || true

# 8. Summary
echo "📌 Generating summary..."
{
  echo "=== SERVICES ==="
  grep "services:" -A 50 docker-compose.yml 2>/dev/null || true
  echo
  echo "=== PORTS ==="
  grep "ports:" -A 3 docker-compose.yml 2>/dev/null || true
} > "$OUT/summary.txt"

echo "✅ Snapshot complete."
echo "📁 Output folder: $OUT"

