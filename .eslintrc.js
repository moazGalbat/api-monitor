module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    quotes: ['error', 'single'],
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
    'consistent-return': ['warn'],
    'max-len': ['warn'],
    'no-param-reassign': ['off'],
    'no-underscore-dangle': 'off',
    'func-names': 'off',
    'no-unused-vars': [
      'warn',
      {
        args: 'none',
      },
    ],
    camelcase: 'warn',
    'no-unused-expressions': ['warn'],
  },
};
