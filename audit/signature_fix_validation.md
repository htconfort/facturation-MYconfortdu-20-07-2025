# Correctif Étape 6 — Sauvegarde & Navigation iPad

## Résumé du correctif

- Sauvegarde de la signature rendue asynchrone et transactionnelle dans `src/components/SignaturePad.tsx`.
- Désactivation du bouton Valider pendant la sauvegarde; gestion des erreurs sans `alert`.
- Compat iPad/Safari durcie: `touch-action: none`, listeners non passifs uniquement sur le canvas, `preventDefault` pour éviter le scroll/zoom.
- `src/ipad/steps/StepSignatureNoScroll.tsx`: navigation vers l’étape suivante seulement après succès de la sauvegarde (`onSave` → `true`), avec délai court (120ms) pour stabiliser l’état.
- Aucun retour automatique vers l’étape 5 si signature manquante; on bloque la navigation et on affiche l’état.

## Check-list de tests manuels

- [ ] iPad (Safari/WebView): dessiner → Valider → passe à l’étape suivante (7) sans retour à 5.
- [ ] iPad: essayer de scroller pendant la signature → le canvas reste stable, pas de scroll.
- [ ] iPad: effacer puis re-signer → Valider → passe à l’étape suivante.
- [ ] Échec simulé (forcer `onSave` à retourner `false`) → reste en étape 6, message d’erreur visible.
- [ ] Desktop Chrome/Safari: comportement identique et fluide.
- [ ] Retour arrière (Précédent) depuis 6 puis revenir → l’état signature persiste, pas de redirection auto.

## Logs/console (si debug)

- `SignaturePadView` expose un panneau `?debugSig=1` (iOS/version, patch actif, DPR, drawing) utile pour vérifier l’environnement iPad.

## Fichiers modifiés

- `src/components/SignaturePad.tsx`
- `src/ipad/steps/StepSignatureNoScroll.tsx`

## Impacts

- Navigation fiabilisée après signature,
- Compatibilité iPad/Safari renforcée,
- Expérience utilisateur cohérente (pas de retour intempestif à l’étape 5).
