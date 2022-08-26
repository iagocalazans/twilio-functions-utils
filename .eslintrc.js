module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'max-len': ['error', { ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'function-paren-newline': ['error', { minItems: 3 }],
    'import/no-dynamic-require': 0,
    'valid-typeof': 0,
    'func-names': ['error', 'never'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-param-reassign': 0,
    'no-constructor-return': 0,
  },
};
