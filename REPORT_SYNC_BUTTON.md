# Rapport: Bouton Sync (bleu) — Facturation MYconfort

Date: 2025-09-14

## Version vulgarisée (grand public)
- À quoi ça sert: le bouton bleu « Synchro » met à jour, en un clic, la liste de TOUTES les factures réalisées sur les iPad d’un même point de vente (mêmes réglages). Peu importe quelle vendeuse a créé la facture, tout le monde voit la liste complète et à jour.
- Où voir le résultat: ouvrez le bouton noir « Factures » dans le haut de l’écran. La liste affichée est réconciliée (sans doublons) après chaque synchro.
- Comment l’utiliser (3 étapes simples):
  1) Appuyez sur le bouton bleu « Sync » dans la barre du haut.
  2) Dans la fenêtre qui s’ouvre, appuyez sur « Synchroniser toutes les factures ».
  3) Quand c’est terminé, fermez la fenêtre et appuyez sur le bouton noir « Factures » pour voir la liste à jour.
- Ce que la synchro fait concrètement:
  - Envoie vos nouvelles factures locales vers le serveur sécurisé (si internet OK).
  - Récupère toutes les factures du magasin (celles des autres iPad aussi).
  - Range et fusionne proprement (pas de doublons; on garde la version la plus récente de chaque facture).
- Conditions pour que ça marche:
  - Tous les iPad du magasin doivent utiliser la même adresse de synchronisation (réglée par l’admin).
  - Il faut une connexion internet au moment de lancer la synchro.
- En cas de souci:
  - Si internet est coupé: l’envoi peut être repoussé, mais la récupération se fera dès que la connexion revient.
  - Si un message d’erreur s’affiche, relancez la synchro plus tard; vos factures locales restent sauvegardées.

## Emplacement UI
- Header principal: bouton « Sync » (bleu) ajouté dans `src/components/Header.tsx` via prop `onShowSync`.
- Composant modal dédié: `src/components/InvoicesSyncTab.tsx`.
- Bouton « Synchroniser toutes les factures » également présent dans `src/components/InvoicesListModal.tsx` (relié à la même logique de synchro complète).

## Flux fonctionnel (push → pull → merge)
1. Tap sur « Sync » (bleu): ouvre `InvoicesSyncTab`.
2. Bouton « Synchroniser toutes les factures » exécute `handleSyncNow()` → `fullSyncInvoices()`
   - Source: `src/services/invoiceSyncService.ts`.
3. `fullSyncInvoices(localInvoices)`:
   - Push (POST) vers N8N: `VITE_N8N_SYNC_URL`
     - Body JSON `{ action: "sync_invoices", invoices: [...], total_count }`
     - Si le push échoue (ex: CORS), on continue quand même.
   - Pull (GET) depuis N8N: `VITE_N8N_GET_FACTURES_URL`
     - Attend `{ success: true, invoices: [...] }`.
   - Normalisation: `normalizeCloudInvoice(raw)` convertit les factures « cloud » (schéma n8n) au modèle de l’app (champs client plats, dates/numériques).
   - Fusion: `mergeInvoices(local, cloud)`
     - Déduplication par `invoiceNumber`.
     - Conserve la version la plus récente via `updatedAt`/`createdAt`.
4. Sauvegarde locale: `saveInvoices(merged)` + mise à jour de l’UI (`setVisibleInvoices`).
5. Statuts UI: message, spinner, dernière synchro (timestamp) affichés dans `InvoicesSyncTab`.

## Variables d’environnement (Vite)
- `VITE_N8N_SYNC_URL` (push POST) — RECOMMANDÉ: `https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle`
- `VITE_N8N_GET_FACTURES_URL` (pull GET) — RECOMMANDÉ: `https://n8n.srv765811.hstgr.cloud/webhook/sync/invoices`

Notes:
- Les URLs sont lues au build (Vite). En cas d’absence, un guard explicite lève: « URLs N8N manquantes… ».
- On accepte fallback: si une seule URL est fournie, elle est utilisée pour les deux opérations (meilleur réglage: 2 endpoints dédiés).

## CORS / N8N
- Le GET `sync/invoices` répond déjà avec `Access-Control-Allow-Origin: *` (selon export de workflow).
- Le POST doit pointer sur le webhook « Réception Factures » (`facture-universelle`) qui a `rawBody: true` et headers CORS ouverts.
- Symptôme si POST se fait sur GET: blocage CORS préflight (résolu en séparant les endpoints).

## Normalisation des données (principaux mappings)
- `invoiceNumber`: `raw.invoiceNumber || raw.id`
- `invoiceDate`: `raw.invoiceDate || raw.createdAt`
- Client (plats): `clientName/Email/Phone/Address/PostalCode/City/HousingType/DoorCode`
- Montants: `montantTTC/HT/TVA`, `montantAcompte`, `montantRestant`
- Métadonnées: `createdAt`, `updatedAt`
- Liste produits: si présente, conservée telle quelle

## Fichiers impactés
- `src/components/Header.tsx` (bouton Sync)
- `src/components/InvoicesSyncTab.tsx` (UI synchro)
- `src/components/InvoicesListModal.tsx` (bouton synchro + liste)
- `src/services/invoiceSyncService.ts` (push, pull, normalisation, fusion)

## Bonnes pratiques & validations
- Garde explicite si URLs manquantes (évite des fetch vagues).
- Tolérance d’échec sur le push: on tente toujours un pull pour récupérer le référentiel « source de vérité ».
- Normalisation avant tri/affichage pour éviter erreurs `localeCompare` sur champs `undefined`.

## TODO possibles
- (Optionnel) Exposer `VITE_N8N_STATUS_URL` pour MAJ de statuts depuis l’app.
- (Optionnel) Afficher un résumé détaillé de la fusion (nouveaux, mis à jour, inchangés).


