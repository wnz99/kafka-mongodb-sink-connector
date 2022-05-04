module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@babel/eslint-parser',
  plugins: ['prettier', 'simple-import-sort', 'import'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },
  ],
}
