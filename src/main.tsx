import { ensureFreshBuild } from './versionGuard';
import { BUILD_COMMIT } from './buildInfo';
ensureFreshBuild(BUILD_COMMIT);

console.log('### BUILD LIVE ###', new Date().toISOString())
window.addEventListener('error', e => console.error('[GLOBAL ERROR]', e.message))
window.addEventListener('unhandledrejection', e => console.error('[UNHANDLED]', e.reason))

// Diagnostic en production
if (import.meta.env.PROD) {
  import('./utils/prodDiagnostic.ts').then(({ prodDiagnostic }) => {
    prodDiagnostic();
  }).catch(e => console.error('Erreur diagnostic:', e));
}

// ⚠️ ALERTE CRITIQUE MYCOMFORT ⚠️
// CE FICHIER A ÉTÉ VALIDÉ LE 6 AOÛT 2025
// NE PAS MODIFIER LA CONFIGURATION CI-DESSOUS
// DOIT TOUJOURS POINTER VERS App.tsx (application MYcomfort originale)
// ❌ NE JAMAIS CHANGER VERS DeliveryStatusDemo ou autre fichier

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // ⚠️ CRITIQUE: Toujours App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css'; // ⚠️ CRITIQUE: CSS requis pour TailwindCSS

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// ✅ CONFIGURATION VALIDÉE ET FONCTIONNELLE
