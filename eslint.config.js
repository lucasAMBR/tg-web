import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'src/components/ui']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'indent': ['error', 'tab'],  // Usar tabs para indentação
      'semi': ['error', 'always'],  // Exigir ponto e vírgula
      'quotes': ['error', 'single'],  // Exigir aspas simples
      'max-len': ['error', { 'code': 80 }],  // Limitar o comprimento da linha a 80 caracteres
      'camelcase': ['error', { 'properties': 'never' }],  // Usar camelCase
    },
  },
]);
