# 🚨 FIX TERMINAL VSCODE - Reset Propre

## Problème identifié
VS Code démarre un REPL Node au lieu d'un shell zsh → `Uncaught SyntaxError… Unexpected identifier 'dev'`

## ✅ Solution complète

### 1. Remettre zsh comme terminal par défaut

Dans VS Code :
1. Ouvrir la palette (`⇧⌘P`)
2. Taper `Terminal: Select Default Profile`
3. Choisir **zsh** (PAS "JavaScript Debug Terminal", PAS "Node")
4. `Terminal: Kill All Terminals`
5. `Terminal: New Terminal`

### 2. Settings VS Code corrigés ✅

Le fichier `.vscode/settings.json` a été mis à jour avec la configuration propre :

```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.shellIntegration.enabled": true,
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "args": ["-l"]
    }
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  "files.watcherExclude": {
    "**/node_modules/*/**": true,
    "**/dist/**": true,
    "**/build/**": true
  }
}
```

### 3. Settings utilisateur VS Code

Ouvrir vos Settings JSON globaux (`⇧⌘P` → "Preferences: Open Settings (JSON)") et s'assurer qu'ils contiennent EXACTEMENT :

```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.shellIntegration.enabled": true,
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "args": ["-l"]
    }
  }
}
```

**⚠️ IMPORTANT :** 
- Supprimer tout profil "Node", "JavaScript Debug Terminal", etc.
- Ne PAS définir `automationProfile.osx`

### 4. Configuration nvm pour shells login ET non-login

Mettre l'initialisation nvm dans **LES DEUX** fichiers :

#### `~/.zshrc`
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
```

#### `~/.zprofile` (créer si besoin)
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
```

### 5. Recharger la configuration

```bash
source ~/.zprofile
source ~/.zshrc
```

### 6. Test final

Après avoir fait tout ça :
1. Fermer VS Code complètement
2. Rouvrir VS Code
3. Ouvrir un nouveau terminal
4. Vérifier : `echo $SHELL` → doit afficher `/bin/zsh`
5. Vérifier : `node -v` → doit afficher une version Node 20.x
6. Lancer : `npm run dev`

## 🎯 Résultat attendu

Le terminal doit maintenant être un vrai zsh qui peut exécuter `npm run dev` sans erreur de syntaxe JavaScript.
