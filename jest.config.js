/** @type {import('jest/types')} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/tests/**/*.[j]s?(x)', '**/?(*.)+(spec|test).[j]s?(x)'],
  modulePathIgnorePatterns: [
    '<rootDir>/assets',
    '<rootDir>/functions',
  ],
};
