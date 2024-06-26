module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    // turns off the rules which may conflict with prettier
    'prettier',
  ],
  plugins: [ '@typescript-eslint', 'unused-imports'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // force using Logger object
    'no-console': ['warn'],
    'no-duplicate-imports': ['warn'],

    // taken care of by typescript
    'react/prop-types': 'off',
    // disallow default React import, force destructuring instead
    'no-restricted-syntax': [
      'error',
      {
        selector: "ImportDeclaration[source.value='react'][specifiers.0.type='ImportDefaultSpecifier']",
        message: 'Default React import not allowed',
      },
    ],
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/self-closing-comp': [
      'warn',
      {
        'component': true,
        'html': true,
      },
    ],
    // add exhaustive deps check to custom hooks
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        'additionalHooks': 'useDeepMemo',
      },
    ],
    'react/no-unescaped-entities': 'off',

    // disable explicit return types
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // use plugin for fixing unused imports
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    // allow "_" prefixed function arguments
    'unused-imports/no-unused-vars': [
      'warn',
      { 'args': 'after-used', 'argsIgnorePattern': '^_', 'ignoreRestSiblings': true, 'varsIgnorePattern': '^_+$' },
    ],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
        },
      },
    ],

    // make sure we use the proper Emotion imports
    '@emotion/pkg-renaming': 'error',
    '@emotion/no-vanilla': 'error',
    '@emotion/syntax-preference': [2, 'string'],
  },
}
