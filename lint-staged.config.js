/**
 * ============================================================================
 * Lint Staged Configuration
 * ============================================================================
 *
 * Runs only on staged files before commit.
 */

export default {
  "src/**/*.ts": ["eslint --fix", "prettier --write"],

  "*.{json,yml,yaml,md}": ["prettier --write"],
};
