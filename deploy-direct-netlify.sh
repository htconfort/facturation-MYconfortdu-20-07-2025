#!/bin/bash

# 🚀 Déploiement direct Netlify - Contournement plugin Neon

echo "🔧 Déploiement d'urgence signature iPad..."

# Build local
npm run build

# Déploiement direct avec CLI Netlify
npx netlify deploy --prod --dir=dist --message="Hotfix signature iPad - contournement plugin Neon"

echo "✅ Déployé ! Testez la signature MAGENTA sur iPad"
