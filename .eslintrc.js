module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'method',
        format: ['camelCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase'],
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-relative-parent-imports': 'warn',
  },
};
