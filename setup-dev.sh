#!/usr/bin/env bash
set -e

echo "🚀 Boost VS Code + Node sur macOS (safe)"

# 0) Pré-requis Xcode CLT (compilateur) – safe
if ! xcode-select -p >/dev/null 2>&1; then
  echo "➡️ Installation des outils en ligne de commande Xcode (une fenêtre peut apparaître)…"
  xcode-select --install || true
fi

# 1) Homebrew (gestionnaire de paquets) – safe si déjà installé
if ! command -v brew >/dev/null 2>&1; then
  echo "➡️ Installation Homebrew…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zprofile"
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

echo "➡️ Mise à jour Homebrew + nettoyage…"
brew update
brew upgrade
brew cleanup -s || true

# 2) Outils utiles (safe)
brew install git fzf ripgrep fd jq tree watch zoxide

# 3) NVM + Node LTS propre
if [ ! -d "$HOME/.nvm" ]; then
  echo "➡️ Installation NVM…"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

if ! command -v nvm >/dev/null 2>&1; then
  # charge nvm dans le shell courant
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi

echo "➡️ Installation Node LTS via NVM…"
nvm install --lts
nvm alias default 'lts/*'
nvm use default

echo "➡️ Activation Corepack (pnpm/yarn)…"
corepack enable || true
corepack prepare pnpm@latest --activate || true

# 4) NPM : configs non-intrusives (safe)
npm set fund false
npm set audit false
npm set save-prefix="~"
npm set update-notifier false
npm set progress false
npm cache verify || true

# 5) VS Code : installer la CLI 'code' si manquante
if ! command -v code >/dev/null 2>&1; then
  if [ -d "/Applications/Visual Studio Code.app/Contents/Resources/app/bin" ]; then
    echo 'export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"' >> "$HOME/.zprofile"
    export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"
  fi
fi

# 6) Créer/mettre à jour settings.json performant (sans écraser si déjà présent)
VSC_USER="$HOME/Library/Application Support/Code/User"
mkdir -p "$VSC_USER"
SET="$VSC_USER/settings.json"

if [ ! -f "$SET" ]; then
  cat > "$SET" <<'JSON'
{
  "workbench.startupEditor": "none",
  "workbench.tree.indent": 14,
  "workbench.colorTheme": "Default Dark Modern",
  "telemetry.telemetryLevel": "off",
  "update.mode": "manual",
  "extensions.autoCheckUpdates": false,
  "extensions.autoUpdate": false,

  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "selection",
  "editor.smoothScrolling": true,
  "editor.inlineSuggest.enabled": true,
  "editor.quickSuggestionsDelay": 50,
  "editor.linkedEditing": true,
  "editor.stickyScroll.enabled": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },

  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 900,

  "search.useIgnoreFiles": true,
  "search.followSymlinks": false,

  "files.watcherExclude": {
    "**/.git/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.next/**": true,
    "**/.turbo/**": true,
    "**/.pnpm-store/**": true,
    "**/coverage/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/.turbo": true,
    "**/coverage": true
  },

  "typescript.tsserver.maxTsServerMemory": 2048,
  "typescript.tsserver.watchOptions": {
    "watchFile": "useFsEvents"
  },
  "typescript.disableAutomaticTypeAcquisition": true,

  "javascript.suggest.completeFunctionCalls": true,
  "typescript.suggest.completeFunctionCalls": true,

  "terminal.integrated.gpuAcceleration": "on",
  "terminal.integrated.scrollback": 10000,
  "terminal.integrated.enableImages": false,

  "git.autofetch": false,
  "git.confirmSync": true
}
JSON
  echo "✅ settings.json performant créé."
else
  echo "ℹ️ settings.json déjà présent — je n'écrase pas."
fi

# 7) Extensions utiles (sans bloquer si la CLI 'code' est absente)
if command -v code >/dev/null 2>&1; then
  echo "➡️ Installation extensions VS Code (sélection utile et légère)…"
  code --install-extension ms-vscode.vscode-typescript-next || true
  code --install-extension esbenp.prettier-vscode || true
  code --install-extension dbaeumer.vscode-eslint || true
  code --install-extension EditorConfig.EditorConfig || true
  code --install-extension bradlc.vscode-tailwindcss || true
  code --install-extension rangav.vscode-thunder-client || true
  code --install-extension donjayamanne.githistory || true
  code --install-extension streetsidesoftware.code-spell-checker || true
  code --install-extension gruntfuggly.todo-tree || true
  # Copilot (déjà installé selon toi) – on ne réinstalle pas
fi

echo "✨ Fini. Pense à redémarrer VS Code."
