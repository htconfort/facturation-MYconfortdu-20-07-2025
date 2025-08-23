#!/usr/bin/env bash
set -e

# 🔍 Script d'audit complet MyConfort
# Lance l'audit automatique et génère un rapport lisible

echo "🔍 === LANCEMENT AUDIT COMPLET MYCONFORT ==="
echo "Date: $(date)"
echo "Répertoire: $(pwd)"
echo "Branche Git: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'Non-Git')"
echo ""

# 1) Audit automatique Node.js
echo "📊 Exécution de l'audit automatique..."
node audit-repo.js > audit-report.md 2>&1 || {
  echo "❌ Erreur lors de l'audit automatique"
  exit 1
}

# 2) Affichage du rapport
echo "📄 Rapport d'audit généré dans: audit-report.md"
echo ""
cat audit-report.md

# 3) Informations complémentaires
echo ""
echo "📈 === INFORMATIONS COMPLÉMENTAIRES ==="

# Taille du build
if [ -d "dist" ]; then
  echo "📦 Taille du build:"
  du -sh dist/ 2>/dev/null || echo "  Erreur calcul taille"
  echo "📁 Fichiers générés:"
  ls -la dist/assets/ 2>/dev/null | head -10 || echo "  Pas de fichiers assets"
else
  echo "📦 Pas de dossier dist/ trouvé"
fi

echo ""

# Dernier commit et tag
echo "🏷️  Dernier tag: $(git describe --tags --abbrev=0 2>/dev/null || echo 'Aucun')"
echo "📝 Dernier commit: $(git log -1 --oneline 2>/dev/null || echo 'Erreur Git')"

# Stats du repo
echo "📊 Stats du repo:"
echo "  - Commits: $(git rev-list --count HEAD 2>/dev/null || echo '?')"
echo "  - Branches: $(git branch -r 2>/dev/null | wc -l | tr -d ' ' || echo '?')"
echo "  - Tags: $(git tag | wc -l | tr -d ' ' || echo '?')"

echo ""
echo "✅ Audit terminé! Consultez le rapport détaillé dans audit-report.md"
echo ""

# 4) Ouverture automatique du rapport (optionnel)
if command -v open >/dev/null 2>&1; then
  echo "🔗 Ouverture du rapport dans l'éditeur..."
  open audit-report.md
elif command -v code >/dev/null 2>&1; then
  echo "🔗 Ouverture du rapport dans VS Code..."
  code audit-report.md
else
  echo "💡 Ouvrez manuellement: audit-report.md"
fi
