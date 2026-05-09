import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  ...eslintPluginAstro.configs.recommended,
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  })),
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.flatConfigs.recommended.rules },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
