/**
 * @see https://jestjs.io/docs/configuration
 * @type {import('jest').Config}
 * */
const config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  // testMatch: ["**/routes/*.test.ts"],
  testMatch: ['**/**/*.test.ts'],
  roots: ['src'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: { '^~/(.*)$': '<rootDir>/src/$1' },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  forceExit: false,
}

export default config
