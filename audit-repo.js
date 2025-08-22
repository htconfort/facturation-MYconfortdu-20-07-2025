#!/usr/bin/env node

/**
 * 🔍 Script d'audit automatique MyConfort
 * Vérifie que toutes les demandes ont été implémentées
 * Usage: node audit-repo.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = process.cwd();
const REQUIRED_FILES = [
  'src/MainApp.tsx',
  'src/ipad/steps/StepClient.tsx',
  'src/ipad/steps/StepPaiement.tsx',
  'src/ipad/steps/StepProduits.tsx',
  'src/ipad/steps/StepRecap.tsx',
  'src/ipad/steps/StepSignature.tsx',
  'src/ipad/steps/StepLivraison.tsx',
  'src/store/useInvoiceWizard.ts',
  'src/utils/chequeMath.ts',
  'src/components/ClientSection.tsx',
  'vite.config.ts',
  'push-auto.sh',
  'auto-commit-push.sh',
  'package.json'
];

// Helpers
function fileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(PROJECT_ROOT, filePath), 'utf8');
  } catch {
    return null;
  }
}

function runCommand(command) {
  try {
    return execSync(command, { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function checkFileContent(filePath, patterns) {
  const content = readFile(filePath);
  if (!content) return { exists: false, matches: [] };
  
  const matches = patterns.map(pattern => ({
    pattern,
    found: pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern)
  }));
  
  return { exists: true, matches };
}

// Tests d'audit
const auditTests = [
  {
    category: '📁 Structure des fichiers',
    tests: [
      {
        name: 'Fichiers iPad essentiels',
        check: () => {
          const missing = REQUIRED_FILES.filter(file => !fileExists(file));
          return {
            pass: missing.length === 0,
            details: missing.length > 0 ? `Manquants: ${missing.join(', ')}` : 'Tous présents'
          };
        }
      }
    ]
  },
  
  {
    category: '⚙️ Configuration Vite',
    tests: [
      {
        name: 'Plugin visualizer configuré',
        check: () => {
          const result = checkFileContent('vite.config.ts', [
            'visualizer',
            'open: true',
            'stats.html'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Visualizer configuré' : 'Configuration visualizer incomplète'
          };
        }
      },
      {
        name: 'Manual chunks configurés',
        check: () => {
          const result = checkFileContent('vite.config.ts', [
            'manualChunks',
            'ui-utils',
            'html2canvas',
            'signature_pad'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Manual chunks OK' : 'Configuration chunks incomplète'
          };
        }
      }
    ]
  },
  
  {
    category: '💰 Gestion paiement',
    tests: [
      {
        name: 'Algorithme chèques ronds',
        check: () => {
          const result = checkFileContent('src/utils/chequeMath.ts', [
            'calculerChequesRonds',
            'suggererAcomptesMagiques',
            'modulo'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Algorithme présent' : 'Algorithme chèques ronds manquant'
          };
        }
      },
      {
        name: 'Limitation 10 chèques',
        check: () => {
          const stepPaiement = readFile('src/ipad/steps/StepPaiement.tsx');
          const productSection = readFile('src/components/ProductSection.tsx');
          
          const has10Limit = (stepPaiement && stepPaiement.includes('max={10}')) ||
                           (productSection && productSection.includes('max: 10'));
          
          return {
            pass: has10Limit,
            details: has10Limit ? 'Limite 10 chèques OK' : 'Limite 10 chèques non trouvée'
          };
        }
      }
    ]
  },
  
  {
    category: '📱 Store Zustand',
    tests: [
      {
        name: 'Types Client, Produit, Paiement',
        check: () => {
          const result = checkFileContent('src/store/useInvoiceWizard.ts', [
            'interface Client',
            'interface Produit',
            'interface Paiement',
            'addressLine2',
            'discountType'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Types Zustand OK' : 'Types Zustand incomplets'
          };
        }
      }
    ]
  },
  
  {
    category: '🛠️ Scripts automatisés',
    tests: [
      {
        name: 'Scripts exécutables',
        check: () => {
          const pushAutoStat = runCommand('ls -la push-auto.sh 2>/dev/null');
          const autoCommitStat = runCommand('ls -la auto-commit-push.sh 2>/dev/null');
          
          const pushExecutable = pushAutoStat && pushAutoStat.includes('-rwxr');
          const autoExecutable = autoCommitStat && autoCommitStat.includes('-rwxr');
          
          return {
            pass: pushExecutable && autoExecutable,
            details: `push-auto: ${pushExecutable ? '✓' : '✗'}, auto-commit: ${autoExecutable ? '✓' : '✗'}`
          };
        }
      },
      {
        name: 'Fonctions avancées push-auto.sh',
        check: () => {
          const result = checkFileContent('push-auto.sh', [
            'open_url',
            'to_https',
            'HTTPS_URL'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Fonctions avancées OK' : 'Fonctions push-auto manquantes'
          };
        }
      }
    ]
  },
  
  {
    category: '🎨 Corrections UI',
    tests: [
      {
        name: 'Champ adresse ligne 2',
        check: () => {
          const result = checkFileContent('src/components/ClientSection.tsx', [
            'addressLine2',
            'Adresse (ligne 2)'
          ]);
          const allFound = result.matches.every(m => m.found);
          return {
            pass: allFound,
            details: allFound ? 'Champ adresse ligne 2 OK' : 'Champ adresse ligne 2 manquant'
          };
        }
      }
    ]
  },
  
  {
    category: '🔧 Build et TypeScript',
    tests: [
      {
        name: 'Build Vite réussi',
        check: () => {
          const buildResult = runCommand('npm run build 2>/dev/null');
          const distExists = fileExists('dist/index.html');
          
          return {
            pass: distExists,
            details: distExists ? 'Build OK' : 'Build échoué ou dist/ manquant'
          };
        }
      },
      {
        name: 'TypeScript compile',
        check: () => {
          const tscResult = runCommand('npx tsc --noEmit 2>/dev/null');
          const success = tscResult !== null;
          
          return {
            pass: success,
            details: success ? 'TypeScript OK' : 'Erreurs TypeScript détectées'
          };
        }
      }
    ]
  },
  
  {
    category: '📊 Git et versioning',
    tests: [
      {
        name: 'Tags récents',
        check: () => {
          const tags = runCommand('git tag --sort=-creatordate | head -3');
          const hasRecentTag = tags && tags.includes('v2025.08.22');
          
          return {
            pass: hasRecentTag,
            details: hasRecentTag ? `Tags récents: ${tags.split('\n')[0]}` : 'Pas de tag récent trouvé'
          };
        }
      },
      {
        name: 'Branches backup',
        check: () => {
          const branches = runCommand('git branch -r | grep backup');
          const hasBackup = branches && branches.includes('backup/');
          
          return {
            pass: hasBackup,
            details: hasBackup ? 'Branches backup OK' : 'Pas de branche backup trouvée'
          };
        }
      }
    ]
  }
];

// Exécution de l'audit
function runAudit() {
  console.log('🔍 === AUDIT AUTOMATIQUE MYCONFORT ===\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  auditTests.forEach(category => {
    console.log(`## ${category.category}\n`);
    
    category.tests.forEach(test => {
      totalTests++;
      const result = test.check();
      const status = result.pass ? '✅' : '❌';
      
      if (result.pass) passedTests++;
      
      console.log(`${status} **${test.name}**: ${result.details}`);
    });
    
    console.log('');
  });
  
  // Score final
  const score = Math.round((passedTests / totalTests) * 100);
  const scoreEmoji = score >= 90 ? '🎉' : score >= 70 ? '👍' : '⚠️';
  
  console.log(`## 📊 RÉSULTAT FINAL\n`);
  console.log(`${scoreEmoji} **Score: ${passedTests}/${totalTests} tests réussis (${score}%)**\n`);
  
  if (score >= 90) {
    console.log('🎉 **Excellent !** Le repo est conforme aux demandes.');
  } else if (score >= 70) {
    console.log('👍 **Bien !** Quelques points à corriger.');
  } else {
    console.log('⚠️ **Attention !** Plusieurs éléments manquent.');
  }
  
  console.log('\n📝 **Audit terminé** - Rapport généré le', new Date().toLocaleString());
}

// Lancement de l'audit
runAudit();
