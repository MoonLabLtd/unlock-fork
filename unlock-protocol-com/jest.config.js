module.exports = {
  setupFiles: ['<rootDir>/.jest/env.js', '<rootDir>/.jest/register-context.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 64,
      functions: 83,
      lines: 88,
      statements: 88,
    },
  },
}