# 🔍 Prompt Copilot - Audit Exhaustif du Repo MyConfort

Tu es **Copilot Auditeur de code**. Vérifie, pas à pas, que le dépôt courant contient bien TOUTES les actions suivantes (et produis un rapport ✅/❌ par item, en Markdown) :

## [1] Git & branches/tags
- Un commit récent contient "🚀 Build & Push automatique" ou "✨ Test du script amélioré".
- Un tag récent "v2025.08.22-xxxx" existe et pointe sur un commit poussé.
- Une branche "backup/main-2025.08.22-xxxx" existe côté remote.
- Le script `push-auto.sh` est exécutable et contient les fonctions `open_url` et `to_https`.
- Le script `auto-commit-push.sh` est exécutable et contient un workflow build + commit + push.

## [2] Fichiers et structure iPad
- Présence des fichiers : 
  - `src/MainApp.tsx`
  - `src/ipad/steps/StepClient.tsx`
  - `src/ipad/steps/StepPaiement.tsx`
  - `src/ipad/steps/StepProduits.tsx`
  - `src/ipad/steps/StepRecap.tsx`
  - `src/ipad/steps/StepSignature.tsx`
  - `src/ipad/steps/StepLivraison.tsx`
- Store Zustand : `src/store/useInvoiceWizard.ts` contient les types Client, Produit, Paiement.
- Routes iPad : `src/App.tsx` ou `src/MainApp.tsx` contient les routes `/ipad/*`.

## [3] Gestion paiement et chèques
- Fichier `src/utils/chequeMath.ts` existe et contient l'algorithme "chèques ronds".
- `StepPaiement.tsx` contient les suggestions d'acomptes "magiques".
- Limitation à 10 chèques maximum (au lieu de 12).
- Suppression de la mention "recommandé" dans les modes de paiement.
- Couleurs de sélection améliorées (fond vert foncé, texte noir).

## [4] Configuration Vite optimisée
- `vite.config.ts` contient le plugin `visualizer` avec `open: true`.
- Configuration `manualChunks` sépare `ui-utils` (html2canvas, signature_pad) et `vendor`.
- `chunkSizeWarningLimit: 2000` est configuré.
- Proxy `/api/n8n` vers `https://n8n.srv765811.hstgr.cloud` est configuré.

## [5] Types et store Zustand
- `src/store/useInvoiceWizard.ts` contient les types :
  - `Client` avec `addressLine2?: string`
  - `Produit` avec `category, discount, discountType`
  - `Paiement` avec gestion des chèques multiples
- Gestion de la rétrocompatibilité pour `discountType`.

## [6] Corrections UI et UX
- `Header.tsx` ou composant header contient un bouton "Mode iPad" fonctionnel.
- `ClientSection.tsx` contient le champ "Adresse (ligne 2)".
- Suppression du bloc "Recommandation MyConfort" dans `StepPaiement.tsx`.
- Interface tactile optimisée pour iPad dans les steps.

## [7] Services et utilitaires
- Service PDF unifié présent.
- Service d'envoi n8n présent.
- Variables d'environnement centralisées.
- Gestion TVA unifiée.

## [8] Build et artefacts
- `npm run build` se termine sans erreur.
- Génération de `stats.html` par le visualizer.
- Chunks séparés correctement dans `dist/assets/`.
- Tailles des chunks respectent les limites (vendor < 1.5MB gzippé).

## [9] Scripts et workflow
- Scripts exécutables : `push-auto.sh`, `auto-commit-push.sh`.
- `package.json` contient les scripts build, dev, preview.
- TypeScript compile sans erreur (`tsc --noEmit`).

## [10] Documentation et qualité
- Fichiers README, guides de déploiement présents.
- Structure du projet cohérente et organisée.
- Code TypeScript typé strictement.

---

**Instructions pour Copilot :**
1. Parcours chaque section et vérifie point par point
2. Utilise ✅ pour validé, ❌ pour manquant, ⚠️ pour partiellement fait
3. Donne des détails sur les éléments manquants ou à corriger
4. Termine par un score global (X/10 sections validées)

**Pour lancer l'audit :** Colle ce prompt dans Copilot Chat VS Code ou utilise "Explain this file" sur ce fichier.
