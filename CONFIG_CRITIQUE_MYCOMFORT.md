# ⚠️ CONFIGURATION CRITIQUE MYCOMFORT - NE PAS MODIFIER ⚠️

## 🚨 ALERTE CONFIGURATION SAUVEGARDÉE LE 6 AOÛT 2025 🚨

Cette configuration a été validée et fonctionne parfaitement pour l'application MYcomfort.

### ✅ CONFIGURATION VALIDÉE :

#### 📁 Structure des fichiers critiques :
- `src/main.tsx` → Doit pointer vers `App.tsx` (PAS vers DeliveryStatusDemo ou autre)
- `src/App.tsx` → Application MYcomfort originale (1051 lignes)
- `src/index.css` → Styles TailwindCSS + styles personnalisés MYcomfort

#### 🎨 Configuration TailwindCSS :
- `package.json` → tailwindcss@^3.4.4 (version stable)
- `postcss.config.js` → Configuration standard avec tailwindcss: {}
- `tailwind.config.js` → Configuration MYcomfort avec couleurs personnalisées

#### 🖥️ Interface validée :
- Fond vert foncé : `backgroundColor: '#14281D'`
- Header MYCONFORT avec dégradé vert
- Logo 🌸 et navigation complète
- Statut de facture (Complète/Incomplète)
- Toutes les sections : InvoiceHeader, ClientSection, ProductSection

### ❌ NE JAMAIS MODIFIER :
1. Le fichier `src/main.tsx` - doit toujours pointer vers `App.tsx`
2. La configuration PostCSS - garder `tailwindcss: {}`
3. La version TailwindCSS - rester sur 3.4.4
4. L'import CSS dans main.tsx - doit rester `import './index.css'`

### 🔧 COMMANDES DE RESTAURATION D'URGENCE :
```bash
# Si l'application ne s'affiche plus correctement :
cd "/Users/brunopriem/mycomfort-facturation/facturation-MYconfortdu-20-07-2025"

# 1. Vérifier main.tsx
echo "import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);" > src/main.tsx

# 2. Vérifier postcss.config.js
echo "export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};" > postcss.config.js

# 3. Réinstaller TailwindCSS correct
npm install tailwindcss@^3.4.4

# 4. Redémarrer
npm run dev
```

### 📞 CONTACT EN CAS DE PROBLÈME :
Si l'application ne fonctionne plus :
1. Vérifier que main.tsx pointe vers App.tsx
2. Vérifier que le CSS se charge (import './index.css')
3. Vérifier la version TailwindCSS (3.4.4)
4. Nettoyer le cache : `rm -rf node_modules/.vite`

---
**SAUVEGARDÉ LE : 6 août 2025 à 14h36**
**VALIDÉ PAR : Bruno Priem**
**STATUS : ✅ CONFIGURATION STABLE ET FONCTIONNELLE**
