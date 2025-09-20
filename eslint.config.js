const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');

const isCI = process.env.CI === 'true';

module.exports = tseslint.config(
  { ignores: ['dist', '**/*_Backup.*', '**/*_backup.*'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: false, // pas de type-checking pour éviter la complexité
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // 🚀 RÈGLES DE BASE (sans type-checking)
      '@typescript-eslint/no-explicit-any': isCI ? 'warn' : 'off',
      '@typescript-eslint/no-unused-vars': isCI ? ['warn', { argsIgnorePattern: '^_' }] : 'off',
      'no-unused-vars': isCI ? ['warn', { argsIgnorePattern: '^_' }] : 'off',
      'no-case-declarations': 'off',

      // ❌ PAS DE RÈGLES TYPE-CHECKED (trop complexes pour l'instant)
      // '@typescript-eslint/no-unsafe-assignment': isCI ? 'warn' : 'off',
      // '@typescript-eslint/no-unsafe-member-access': isCI ? 'warn' : 'off',
      // '@typescript-eslint/no-unsafe-call': isCI ? 'warn' : 'off',

      // ✅ RÈGLES CONSTANTES (bonnes pratiques)
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
