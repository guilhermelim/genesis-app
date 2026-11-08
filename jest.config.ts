import path from 'node:path'
import os from 'node:os'
import type { Config } from 'jest'

const rootDir = path.resolve(__dirname)
const availableWorkers = os.availableParallelism()

const projectConfig = {
  rootDir,
  clearMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
}

const config: Config = {
  ...projectConfig,
  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*[-.]interface.[tj]s?(x)',
    '!src/**/*[-.]types.[tj]s?(x)',
    '!src/**/*[-.]dto.[tj]s?(x)',
    '!src/**/*.test.[tj]s?(x)',
    '!src/lib/utils.ts',
    '!src/theme.ts',
  ],
  passWithNoTests: true,
  testTimeout: 30000,
  maxWorkers: availableWorkers,
  projects: [
    {
      ...projectConfig,
      displayName: 'unit',
      setupFilesAfterEnv: ['<rootDir>/jest.unit.setup.ts'],
      testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/src/**/*.unit.test.[tj]s?(x)'],
    },
    {
      ...projectConfig,
      displayName: 'integration',
      globalSetup: '<rootDir>/jest.integration.setup.ts',
      setupFiles: ['<rootDir>/jest.integration.setup.ts'],
      testMatch: ['**/src/**/*.integration.test.[tj]s?(x)'],
    },
    {
      ...projectConfig,
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.frontend.setup.ts'],
      testMatch: ['**/src/**/*.frontend.test.[tj]s?(x)'],
    },
  ],
}

export default config
