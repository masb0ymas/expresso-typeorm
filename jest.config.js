module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  modulePaths: ['src'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@core(.*)$': '<rootDir>/src/@core$1',
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@database(.*)$': '<rootDir>/src/database$1',
    '^@middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testTimeout: 30000,
}
