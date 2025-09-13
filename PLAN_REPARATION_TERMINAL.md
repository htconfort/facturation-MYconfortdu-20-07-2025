# 🔧 PLAN DE RÉPARATION TERMINAL VS CODE - ÉTAPE PAR ÉTAPE

## ✅ Étape 1: Forcer VS Code à ouvrir zsh

1. `⌘⇧P` → `Terminal: Select Default Profile` → choisir **zsh**
2. `⌘⇧P` → `Terminal: Kill All Terminals`
3. **Quitter complètement VS Code** (`⌘Q`)
4. **Rouvrir le projet**

## ✅ Étape 2: Configuration workspace verrouillée

Le fichier `.vscode/settings.json` a été mis à jour avec :

```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.profiles.osx": {
    "zsh": { "path": "/bin/zsh", "args": ["-l"] }
  },
  "debug.node.autoAttach": "disabled",
  "debug.javascript.autoAttachFilter": "disabled"
}
```

**Après cette modification :**
- `⌘⇧P` → `Developer: Reload Window`

## 📋 Étape 3: Vérification du nouveau terminal

1. `Terminal` → `New Terminal`

**Vérifications obligatoires :**

La première ligne doit ressembler à `Last login: ...` et **PAS** afficher `> _` ni `Uncaught SyntaxError`.

```bash
echo $SHELL    # doit afficher /bin/zsh
echo $0        # doit afficher -zsh (login shell)
```

### 🚨 Si vous voyez encore un REPL :

1. `⌘⇧P` → `Preferences: Open User Settings (JSON)`
2. S'assurer qu'il n'y a **aucun** :
   - `terminal.integrated.automationProfile.osx`
   - profil "JavaScript Debug Terminal"
3. Désactiver l'extension **JavaScript Debugger** (temporairement)
4. `Developer: Reload Window`

## 📋 Étape 4: Vérification nvm + versions

Dans le nouveau terminal VS Code :

```bash
nvm --version
nvm use 20
node -v     # doit afficher v20.x.x
npm -v      # doit afficher 10.x
```

## 📋 Étape 5: Dépendances du projet

Se placer à la racine du projet :

```bash
pwd
ls -1 package.json
```

Nettoyer et réinstaller :

```bash
rm -rf node_modules
npm ci   # ou npm install s'il n'y a pas de lockfile
```

Démarrer le projet :

```bash
npm run dev
```

## 🛡️ Anti-rechute (recommandations)

### Configuration finale nvm
```bash
nvm alias default 20
```

### Fichiers en place ✅
- `.nvmrc` : contient `20`
- `.vscode/settings.json` : configuration propre avec debug désactivé

### Bonnes pratiques
- ❌ Ne pas ouvrir de "JavaScript Debug Terminal"
- ✅ Garder `debug.node.autoAttach` désactivé
- ✅ Utiliser uniquement le terminal zsh standard

## 🎯 Résultat attendu

Terminal qui affiche :
```bash
user@machine facturation-MYconfortdu-20-07-2025-2 % npm run dev
```

Et **PAS** :
```javascript
> npm run dev
Uncaught SyntaxError: Unexpected identifier 'run'
```
