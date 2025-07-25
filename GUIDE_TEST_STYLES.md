# 🎨 GUIDE DE TEST DES STYLES DE FACTURE

## 🚀 Comment tester les 3 styles

### 1. Démarrer l'application
```bash
cd /Users/brunopriem/github.com:htconfort:Myconfort/facturation-MYconfortdu-20-07-2025-1
./node_modules/.bin/vite --host --port 3001
```

### 2. Ouvrir dans le navigateur
- URL: http://localhost:3001

### 3. Tester les styles
1. **Remplir quelques informations** dans la facture (client, produits)
2. **Regarder la section "APERÇU DE LA FACTURE"** 
3. **Utiliser les boutons de style** en haut à droite:
   - 📄 **Classique**: Style traditionnel avec fond blanc
   - 🎨 **Moderne**: Style contemporain avec cards et dégradés 
   - ✨ **Premium**: Style ultra-sophistiqué avec effets visuels

### 4. Indicateurs visuels
- **Bouton actif**: Bouton blanc avec ✓ et échelle agrandie
- **Indicateur de style**: Texte "Style actuel" sous les boutons
- **Transitions**: Animations fluides entre les styles

### 5. Console de debug
- Ouvrir la console du navigateur (F12)
- Voir les messages : `🎨 Style de facture changé vers: [style]`
- Voir les logs : `Switching to [style] style`

## 🎯 Points de test
- [x] Les 3 boutons de style sont-ils visibles ?
- [x] Le bouton actif est-il surligné en blanc ?
- [x] L'indicateur "Style actuel" change-t-il ?
- [x] L'aperçu change-t-il visuellement ?
- [x] Les transitions sont-elles fluides ?

## 🐛 Si les styles ne changent pas
1. Vérifier la console pour les erreurs
2. Actualiser la page (F5)
3. Vider le cache du navigateur
4. Vérifier que tous les composants sont bien chargés

## 📱 Styles disponibles

### 📄 CLASSIQUE
- Design épuré et traditionnel
- Fond blanc simple
- Tableaux avec bordures classiques
- Texte noir standard

### 🎨 MODERNE  
- Design contemporain
- Cards avec ombres
- Dégradés colorés
- Icons et émojis
- Layout responsive

### ✨ PREMIUM
- Design ultra-sophistiqué
- Glassmorphism et transparences
- Animations et effets visuels
- Typography raffinée
- Dégradés complexes
- Effets de blur

## 🔧 Dépannage
Si les styles ne fonctionnent pas:
```bash
# Nettoyer et reconstruire
rm -rf node_modules dist
npm install
./node_modules/.bin/vite build
./node_modules/.bin/vite --host --port 3001
```
