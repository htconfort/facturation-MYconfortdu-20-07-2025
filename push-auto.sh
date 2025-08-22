#!/usr/bin/env bash
set -euo pipefail

# ---------------------------
# Helpers
# ---------------------------
open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"            # macOS
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url"        # Linux
  elif command -v start >/dev/null 2>&1; then
    start "$url"           # Git Bash (Windows)
  else
    echo "🔗 Ouvre manuellement : $url"
  fi
}

to_https() {
  # Convertit les remotes SSH en HTTPS pour ouvrir dans le navigateur
  # Exemples:
  #   git@github.com:owner/repo.git -> https://github.com/owner/repo
  #   https://github.com/owner/repo.git -> https://github.com/owner/repo
  local u="$1"
  if [[ "$u" =~ ^git@([^:]+):(.+)\.git$ ]]; then
    echo "https://${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  elif [[ "$u" =~ ^git@([^:]+):(.+)$ ]]; then
    echo "https://${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  elif [[ "$u" =~ ^https?://.+\.git$ ]]; then
    echo "${u%.git}"
  else
    echo "$u"
  fi
}

# ---------------------------
# Pré-checks
# ---------------------------
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Tu n'es pas dans un dépôt Git. Va d'abord dans le dossier du projet."
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE_URL="$(git config --get remote.origin.url || true)"
if [[ -z "${REMOTE_URL}" ]]; then
  echo "❌ Aucun remote 'origin' trouvé. Fais d'abord : git remote add origin <url>"
  exit 1
fi
HTTPS_URL="$(to_https "$REMOTE_URL")"

# ---------------------------
# Paramètres commit & tag
# ---------------------------
MSG="${1:-"🔧 Mise à jour automatique"}"
DATE_TAG="$(date +"%Y.%m.%d-%H%M%S")"
TAG="v${DATE_TAG}"
BACKUP_BRANCH="backup/${BRANCH}-${DATE_TAG}"

echo "📦 Branche courante : ${BRANCH}"
echo "🔖 Tag prévu        : ${TAG}"
echo "🧷 Branche backup   : ${BACKUP_BRANCH}"
echo "🌐 Remote           : ${HTTPS_URL}"
echo "📝 Message commit   : ${MSG}"
echo "— — —"

# ---------------------------
# Add + commit (si changements)
# ---------------------------
git add -A

if git diff --cached --quiet; then
  echo "ℹ️  Aucun changement staged. Je continue quand même (push + tag + backup)."
else
  git commit -m "$MSG"
fi

# ---------------------------
# Push branche
# ---------------------------
git push -u origin "$BRANCH"

# ---------------------------
# Tag + push tag
# ---------------------------
git tag -a "$TAG" -m "Release auto: $MSG"
git push origin "$TAG"

# ---------------------------
# Branche backup + push
# ---------------------------
git branch "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH"

# ---------------------------
# URLs utiles
# ---------------------------
LAST_COMMIT_SHA="$(git rev-parse HEAD)"
REPO_WEB="$HTTPS_URL"
COMMIT_WEB="$HTTPS_URL/commit/$LAST_COMMIT_SHA"
TAG_WEB="$HTTPS_URL/releases/tag/$TAG"

echo "✅ Commit & push OK"
echo "✅ Tag poussé : $TAG"
echo "✅ Branche backup : $BACKUP_BRANCH"
echo "🔗 Repo   : $REPO_WEB"
echo "🔗 Commit : $COMMIT_WEB"
echo "🔗 Tag    : $TAG_WEB"

# ---------------------------
# Ouvre dans le navigateur
# ---------------------------
open_url "$REPO_WEB"
open_url "$COMMIT_WEB"
open_url "$TAG_WEB"
