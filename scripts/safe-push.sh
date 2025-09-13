#!/usr/bin/env bash
set -euo pipefail

# === Réglages ===
BRANCH="${1:-main}"                         # branche cible (par défaut main)
FILE_AT_RISK="src/ipad/IpadWizard.tsx"     # fichier sensible qui bloquait les rebase
BACKUP_DIR=".backup_safe_push"
NODE_VERSION="20.19.0"                     # pour .nvmrc cohérent Netlify

# === Helpers ===
say() { printf "%b\n" "👉 $*"; }
warn() { printf "%b\n" "⚠️  $*"; }
die() { printf "%b\n" "❌ $*"; exit 1; }

# 1) Sanity checks
[ -d .git ] || die "Pas de dépôt Git ici."
say "Repo: $(basename "$(pwd)") | Branche actuelle: $(git rev-parse --abbrev-ref HEAD)"

# 2) Met à jour .nvmrc si nécessaire
if [ -f .nvmrc ]; then
  CURRENT_NODE="$(cat .nvmrc || true)"
  if [ "$CURRENT_NODE" != "$NODE_VERSION" ]; then
    warn ".nvmrc = $CURRENT_NODE → passage à $NODE_VERSION (align Netlify)"
    read -r -p "Confirmer la mise à jour de .nvmrc ? [o/N] " yn
    if [[ "$yn" =~ ^[oOyY]$ ]]; then
      echo "$NODE_VERSION" > .nvmrc
      git add .nvmrc
      say ".nvmrc mis à jour."
    else
      warn "Mise à jour .nvmrc ignorée."
    fi
  fi
else
  warn ".nvmrc absent. Le créer avec $NODE_VERSION ?"
  read -r -p "Créer .nvmrc maintenant ? [o/N] " yn
  if [[ "$yn" =~ ^[oOyY]$ ]]; then
    echo "$NODE_VERSION" > .nvmrc
    git add .nvmrc
    say ".nvmrc créé."
  fi
fi

# 3) Vérifie si un rebase est en cours
if [ -d .git/rebase-apply ] || [ -d .git/rebase-merge ]; then
  warn "Un rebase est en cours."
  if [ -f "$FILE_AT_RISK" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -f "$FILE_AT_RISK" "$BACKUP_DIR/$(basename "$FILE_AT_RISK").bak.$(date +%s)"
    warn "Backup du fichier sensible → $BACKUP_DIR"
  fi
  git status --porcelain
  read -r -p "Continuer le rebase automatiquement ? [o/N] " yn
  if [[ "$yn" =~ ^[oOyY]$ ]]; then
    # N'ajoute PAS tout par défaut : on laisse l'utilisateur choisir
    say "Tu peux résoudre les conflits puis faire: git add -A && git rebase --continue"
    read -r -p "Tenter git add -A && git rebase --continue ? [o/N] " yn2
    if [[ "$yn2" =~ ^[oOyY]$ ]]; then
      git add -A || true
      git rebase --continue || die "Rebase non résolu. Corrige les conflits puis relance."
    else
      die "Rebase interrompu pour résolution manuelle."
    fi
  else
    die "Rebase détecté → On stoppe pour éviter les dégâts."
  fi
fi

# 4) Ajoute les fichiers clés SANS forcer
 say "Sélection d’ajouts : .nvmrc netlify.toml package.json src/buildInfo.ts (si présents)"
 git add .nvmrc netlify.toml package.json src/buildInfo.ts 2>/dev/null || true

# 5) Affiche le diff staged et demande confirmation
if ! git diff --cached --quiet; then
  say "Diff des fichiers indexés :"
  git --no-pager diff --cached
  read -r -p "Committer ces modifications ? [o/N] " yn
  if [[ "$yn" =~ ^[oOyY]$ ]]; then
    git commit -m "chore(ci): align Node ${NODE_VERSION} for Netlify; build-info dev; visualizer"
  else
    warn "Commit annulé. Tu peux affiner: git add/rm puis relancer."
  fi
else
  warn "Aucune modification staged à committer."
fi

# 6) Pull --rebase sécurisé
say "Récupération depuis origin/$BRANCH avec rebase…"
git fetch origin "$BRANCH"
git rebase "origin/$BRANCH" || {
  warn "Conflits de rebase. Résous-les puis:"
  echo "   git add -A && git rebase --continue"
  die "Arrêt pour résolution propre."
}

# 7) Push final
read -r -p "Pousser sur origin/$BRANCH maintenant ? [o/N] " yn
if [[ "$yn" =~ ^[oOyY]$ ]]; then
  git push origin "$BRANCH"
  say "✅ Push effectué sur origin/$BRANCH."
else
  warn "Push annulé à ta demande."
fi

say "Terminé sans action agressive. Backups: $BACKUP_DIR"


