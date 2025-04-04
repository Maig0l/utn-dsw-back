///** @type {import('ts-jest').JestConfigWithTsJest} **/
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
              useESM: true,
              isolatedModules: true
          }
      ]
    },
    moduleDirectories: ["node_modules", "src"],
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts"],
};

export default config;