import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginVue from 'eslint-plugin-vue'

// 代码格式交给 Prettier（pnpm format），ESLint 只管代码问题
export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      // 页面组件按目录命名（UserListView.vue），不强制多词
      'vue/multi-word-component-names': 'off',
    },
  },
  skipFormatting,
)
