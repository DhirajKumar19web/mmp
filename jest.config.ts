import type { Config } from "jest";

const config: Config = {
  /**
   * Test environment
   * Node backend ke liye node use karna chahiye
   */
  testEnvironment: "node",

  /**
   * TypeScript support
   */
  preset: "ts-jest/presets/default-esm",

  /**
   * ESM support
   */
  extensionsToTreatAsEsm: [".ts"],

  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.json",
    },
  },

  /**
   * Test files location
   */
  roots: ["<rootDir>/src", "<rootDir>/tests"],

  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],

  /**
   * Ignore
   */
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  /**
   * Module aliases
   *
   * tsconfig:
   * "@/*": ["src/*"]
   */
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  /**
   * Coverage
   */
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/app.ts",
    "!src/config/**",
    "!src/database/**",
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov"],

  /**
   * Clean mocks automatically
   */
  clearMocks: true,

  /**
   * Reset mocks between tests
   */
  resetMocks: true,

  /**
   * Restore spies
   */
  restoreMocks: true,

  /**
   * Test timeout
   */
  testTimeout: 10000,

  /**
   * Better error output
   */
  verbose: true,

  /**
   * Detect open handles
   * Useful for Redis/Mongo connections
   */
  detectOpenHandles: true,

  /**
   * Force exit in CI only
   */
  forceExit: process.env.CI === "true",

  /**
   * Setup files
   */
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

export default config;
