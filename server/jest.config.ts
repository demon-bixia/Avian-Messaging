import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';


const config: JestConfigWithTsJest = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/spec/setup/test-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/spec/setup/test-server.ts'],
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>/src", "<rootDir>/spec"],
  moduleFileExtensions: ["ts", "js"],
  modulePaths: ["./"],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@spec/(.*)$": "<rootDir>/spec/$1"
  },

  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.ts?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
};

export default config;