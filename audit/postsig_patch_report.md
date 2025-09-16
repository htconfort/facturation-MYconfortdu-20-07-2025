# Patch Post-signature (iPad) — Rapport

## Fichiers modifiés

- `src/ipad/IpadWizardComplete.tsx`
  - État `step` maître → URL sync (replace), suppression navigation directe.
- `src/components/ErrorBoundary.tsx`
  - Remplacement `process.env.NODE_ENV` → `import.meta.env.DEV` (Vite).
- `src/components/SignaturePad.tsx`
  - Sauvegarde async, iPad touch safe, Tailwind-only canvas.
- `src/ipad/steps/StepSignatureNoScroll.tsx`
  - Navigation vers étape suivante seulement après sauvegarde confirmée.
- `src/ipad/steps/StepRecap.tsx`
  - Ajout d’un pipeline post-signature non bloquant décorrélé de l’email, avec logs `POSTSIG:*`.

## Extraits clés

```tsx
// src/ipad/steps/StepRecap.tsx
useEffect(() => {
  if (postSigRanRef.current) return;
  if (!signature?.dataUrl) return;
  postSigRanRef.current = true;
  (async () => {
    try {
      setPostSigStatus('running');
      console.log('POSTSIG:start', { invoiceNumber, hasSignature: true });
      saveInvoice(invoice);
      console.log('POSTSIG:saved');
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);
      console.log('POSTSIG:pdf', { size: pdfBlob.size });
      if (!client.email) { console.log('POSTSIG:email:skip'); } else { console.log('POSTSIG:email:available'); }
      setPostSigStatus('done');
    } catch (err) {
      console.error('POSTSIG:error', err);
      setPostSigStatus('error');
    }
  })();
}, [signature?.dataUrl, invoiceNumber, client.email, invoice]);
```

## Logs attendus (KO → après correctif)

- KO avant: `hasSignature: true` puis plus rien.
- OK après: `POSTSIG:start` → `POSTSIG:saved` → `POSTSIG:pdf` → (`POSTSIG:email:skip` ou `email:available`).

## Remarques

- L’email ne conditionne plus la génération PDF/archivage/local.
- L’anti-spam de numérotation ne pilote pas la navigation ni le pipeline local.
- Le bouton email reste indépendant: `emailButtonDisabled = isLoading || !client.email`.
