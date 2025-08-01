# 📚 DÉPLOIEMENT GITHUB PAGES

## 🎯 SI VOUS AVEZ UN REPOSITORY GITHUB

### 📋 Méthode automatique avec gh-pages :

```bash
# Installation gh-pages
npm install -g gh-pages

# Build de production
npm run build

# Déploiement sur GitHub Pages
gh-pages -d dist
```

### 🌐 URL d'accès :
https://username.github.io/repository-name

### 🔧 Configuration package.json (optionnelle) :
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://username.github.io/repository-name"
}
```

### ⚡ Déploiement avec script :
```bash
npm run deploy
```

---

## ✅ AVANTAGES GITHUB PAGES :
- 🆓 Gratuit
- 🔒 HTTPS automatique
- 🔗 Intégration Git
- 📱 Compatible mobile/iPad
