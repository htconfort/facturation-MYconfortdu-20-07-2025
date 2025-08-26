#!/usr/bin/env bash
set -euo pipefail

BRANCH=${1:-main}

echo "🔄 Git sanity..."
git status
git fetch --all --prune
git checkout "$BRANCH"
git pull --rebase origin "$BRANCH"

echo "✍️ Commit optionnel (appuie Entrée pour sauter)"
read -r -p "Message de commit (laisser vide pour ne pas committer): " MSG
if [ -n "$MSG" ]; then
  git add -A
  git commit -m "$MSG"
fi

echo "⬆️  Push vers origin/$BRANCH"
git push origin "$BRANCH"

echo "🧱 Build local (prod) avec cache-busting"
export VITE_COMMIT_SHA=$(git rev-parse --short HEAD)
npm ci
npm run build

echo "🚀 Deploy Netlify (prod) via CLI"
# Requis: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID (exportés dans ton shell)
# Exemple: export NETLIFY_AUTH_TOKEN=... ; export NETLIFY_SITE_ID=...
netlify deploy \
  --dir=dist \
  --prod \
  --message "Local deploy $VITE_COMMIT_SHA" \
  --site "$NETLIFY_SITE_ID"

echo "✅ Done. Ouvre l'app iPad et vérifie le label build: $VITE_COMMIT_SHA"
