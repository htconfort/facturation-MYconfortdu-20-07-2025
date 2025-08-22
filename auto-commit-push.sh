#!/bin/bash
set -e

# === CONFIG ===
BRANCH="main"
DATE_TAG=$(date +"%Y.%m.%d-%H%M")
COMMIT_MSG="🚀 Build & Push automatique du $DATE_TAG"
TAG="v$DATE_TAG"
BACKUP_BRANCH="backup/${BRANCH}-${DATE_TAG}"

echo "=== 🔄 Build + Commit + Push Automatisé ==="
echo "Branche: $BRANCH"
echo "Tag: $TAG"
echo "Backup: $BACKUP_BRANCH"
echo ""

# 1) Build du projet
echo "🏗️  Build en cours..."
npm run build || { echo "❌ Erreur build"; exit 1; }

# 2) Git add
git add .

# 3) Commit
git commit -m "$COMMIT_MSG" || echo "⚠️ Rien à committer"

# 4) Push sur main
git push origin "$BRANCH"

# 5) Tag
git tag -a "$TAG" -m "Release auto $DATE_TAG"
git push origin "$TAG"

# 6) Branche backup snapshot
git branch "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH"

echo ""
echo "✅ Intégration terminée !"
echo "➡️  Commit message : $COMMIT_MSG"
echo "➡️  Tag : $TAG"
echo "➡️  Branche backup : $BACKUP_BRANCH"
