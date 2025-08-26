# Guide Migration PDF Services vers Imports Dynamiques

## Objectif
Réduire la taille du bundle initial en chargeant les librairies PDF (jsPDF, html2canvas, html2pdf.js) uniquement quand nécessaire.

## Pattern d'Import Dynamique

### 1. Structure de Base
```typescript
// Avant (import statique)
import jsPDF from 'jspdf';
import autoTableImport from 'jspdf-autotable';

// Après (import dynamique)
async function loadPdfLibs() {
  const [{ default: jsPDF }, autoTableImport] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  
  const autoTable = autoTableImport as unknown as (doc: typeof jsPDF.prototype, opts: any) => void;
  return { jsPDF, autoTable };
}
```

### 2. Modification de la Fonction Principale
```typescript
// Avant
export function generatePdf(invoice: Invoice): PDFBlob {
  const doc = new jsPDF();
  // ... code PDF
  return doc.output('blob');
}

// Après  
export async function generatePdf(invoice: Invoice): Promise<PDFBlob> {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const doc = new jsPDF();
  // ... code PDF (identique)
  return doc.output('blob');
}
```

## Fichiers à Migrer

### ✅ Créés (exemples)
1. `src/services/pdfServiceDynamic.ts` - Template de base
2. `src/services/pdfServiceOptimized.ts` - Version complète du service principal

### 🔄 À Migrer
1. `src/services/pdfService.ts` - Service principal (615 lignes)
2. `src/services/customPdfService.ts` - Service personnalisé
3. `src/services/unifiedPrintService.ts` - Service unifié
4. `src/services/advancedPdfService.ts` - Service avancé

### 📋 Pattern pour HTML2PDF
```typescript
async function loadHtmlPdfLibs() {
  const [{ default: jsPDF }, html2canvas, html2pdf] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
    import('html2pdf.js'),
  ]);
  
  return { jsPDF, html2canvas, html2pdf };
}

export async function generatePdfFromHtml(element: HTMLElement): Promise<PDFBlob> {
  const { html2pdf } = await loadHtmlPdfLibs();
  
  const options = {
    margin: 1,
    filename: 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  return await html2pdf.default().from(element).set(options).outputPdf('blob');
}
```

## Étapes de Migration

### Étape 1: Créer les fonctions de chargement
- Ajouter `loadPdfLibs()` en haut du fichier
- Supprimer les imports statiques

### Étape 2: Modifier les signatures de fonction
- Ajouter `async` aux fonctions
- Changer le type de retour vers `Promise<PDFBlob>`

### Étape 3: Charger les libs au début des fonctions
- Appeler `await loadPdfLibs()` au début
- Destructurer les libs nécessaires

### Étape 4: Mettre à jour les appelants
- Les composants React doivent gérer les Promises
- Ajouter des états de loading si nécessaire

## Bénéfices Attendus

### Performance
- Bundle initial plus léger (économie ~500KB+)
- Chargement plus rapide de l'application
- PDF libs chargées uniquement à l'usage

### Mémoire
- Réduction de la consommation mémoire initiale
- Garbage collection possible après utilisation PDF
- Meilleure gestion des ressources

### UX
- Application démarre plus vite
- Loading explicite lors de génération PDF
- Perception de performance améliorée

## Configuration Vite Complémentaire

Le `vite.config.ts` est déjà optimisé avec :
```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['jspdf', 'html2canvas', 'html2pdf.js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['jspdf', 'html2canvas', 'html2pdf.js']
        }
      }
    }
  }
});
```

## Test de la Migration

### 1. Vérifier les imports
```bash
npm run build
# Vérifier la taille des chunks dans dist/
```

### 2. Test fonctionnel
- Tester génération PDF
- Vérifier que les fonctionnalités marchent
- Contrôler les temps de chargement

### 3. Monitoring
- Surveiller la taille du bundle principal
- Mesurer l'impact sur les Core Web Vitals
- Tester sur différents navigateurs

## Notes Importantes

- Les imports dynamiques nécessitent un serveur HTTPS en production
- Compatible avec Netlify (déjà configuré)
- Backward compatible si bien implémenté
- Attention aux types TypeScript lors de la migration

---
**Status**: Pattern créé et testé ✅
**Prêt pour**: Migration progressive des services PDF existants
