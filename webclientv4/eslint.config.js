import pluginVue from 'eslint-plugin-vue';
import vueTsConfig from '@vue/eslint-config-typescript';
import vuePrettierConfig from '@vue/eslint-config-prettier';
import localRules from './tools/eslint-rules/index.js';

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueTsConfig(),
  vuePrettierConfig,
  {
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      // ignoreRestSiblings: allows `const { unwanted, ...rest } = obj` without
      // flagging `unwanted` — standard destructure-to-omit pattern (e.g. transactionStore.ts)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    plugins: { local: localRules },
    rules: { 'local/no-api-gateway-outside-api-modules': 'error' },
  },
];
