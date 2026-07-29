import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    // ignores: []
  },

  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
      },
    },

    rules: {
      'prefer-promise-reject-errors': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  {
    // shared/ui는 디자인 시스템 컴포넌트 — Chip, Dot처럼 한 단어 이름을 허용한다 (네이티브 엘리먼트와 충돌 없음)
    files: ['src/shared/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  prettierSkipFormatting,
)
