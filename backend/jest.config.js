/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Discover tests both co-located (*.test.ts) and in __tests__ / test directories
  testMatch: ['**/*.test.ts', '**/__tests__/**/*.ts', '**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 70, statements: 80 },
  },
};
