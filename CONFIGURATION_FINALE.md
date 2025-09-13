# Configuration Finale - Checklist

## ✅ Configuration terminée

### 1. `.nvmrc` - ✅ Corrigé
- Fichier créé avec la version : `20`
- Plus de version spécifique (20.11.1 → 20)

### 2. `package.json` - ✅ Déjà correct
```json
"engines": {
  "node": ">=20 <21",
  "npm": ">=10 <11"
},
"engineStrict": true
```

### 3. VS Code Configuration - ✅ Créé
- Fichier `.vscode/settings.json` créé avec :
```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.profiles.osx": {
    "zsh": { 
      "path": "/bin/zsh", 
      "args": ["-l"] 
    }
  }
}
```

## 🔧 À vérifier manuellement

### 1. `.zshrc` (vous avez dit que c'était déjà fait)
Vérifiez que votre `~/.zshrc` se termine bien par :
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
```

**Et qu'il n'y a AUCUN** export PATH=...node@20 ni .../homebrew.../npm qui précède nvm.

### 2. VS Code Terminal
- Terminal par défaut = zsh (login)
- N'utilisez pas "JavaScript Debug Terminal" pour les commandes

## 🚀 Workflow "re-clone" propre

Après un clone tout neuf :
```bash
cd facturation-MYconfortdu-20-07-2025-2
nvm use       # lit .nvmrc → Node 20
npm ci        # ou npm install si pas de package-lock.json  
npm run dev
```

## 📝 Scripts disponibles
- `npm run dev` - Démarrage développement
- `npm run dev:mem` - Démarrage avec plus de mémoire
- `npm run build` - Build production
- `npm run typecheck` - Vérification TypeScript
- `npm run lint` - Linting
- `npm run test` - Tests

## ⚠️ Rappels Homebrew
- Éviter de réinstaller node ou npm via Homebrew
- Laisser nvm gérer Node.js
