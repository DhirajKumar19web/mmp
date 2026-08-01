/**
 * ============================================================================
 * Lint Staged Configuration
 * ============================================================================
 *
 * Runs only on staged files before commit.
 */

export default {
  "*.{ts,js,mts,cts}": ["eslint --fix", "prettier --write"],

  "*.{json,yml,yaml,md}": ["prettier --write"],
};
