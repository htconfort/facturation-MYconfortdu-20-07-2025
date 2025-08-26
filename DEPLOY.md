# 🚀 Kit de Déploiement Netlify

## Déploiement automatique (GitHub Actions)

Chaque push sur `main` déclenche automatiquement :
1. ✅ Tests (typecheck, lint, build)
2. 🚀 Déploiement Netlify avec cache-busting

**Secrets requis :**
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Déploiement manuel rapide

```bash
# Script tout-en-un
./deploy.sh main

# Ou étape par étape
git add -A
git commit -m "fix(signature): amélioration UX"
git push origin main

# Build avec commit SHA
export VITE_COMMIT_SHA=$(git rev-parse --short HEAD)
npm run build

# Deploy Netlify
netlify deploy --dir=dist --prod --site "$NETLIFY_SITE_ID"
```

## Vérification iPad

1. 🔄 Force refresh de l'app (tirer pour recharger)
2. 👀 Vérifie le label `build: abc1234` en bas à droite
3. 🧪 Teste la signature : bouton grisé → dessiner → bouton vert

## Cache Strategy

- **Assets** : Cache 1 an (immutable)
- **index.html** : No-cache (toujours frais)
- **Build ID** : Commit SHA injecté dans l'UI
