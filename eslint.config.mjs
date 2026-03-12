import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['.next/**', 'node_modules/**']
  },
  {
    files: ['**/*.config.js', 'next.config.js'],
    languageOptions: {
      globals: globals.node
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...(nextPlugin.configs?.recommended?.rules ?? {}),
      ...(nextPlugin.configs?.['core-web-vitals']?.rules ?? {})
    }
  }
]

