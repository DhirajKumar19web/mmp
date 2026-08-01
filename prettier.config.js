/**
 * ============================================================================
 * Prettier Configuration
 * ============================================================================
 *
 * Purpose:
 * - Consistent code formatting
 * - Team-wide formatting rules
 * - Works with ESLint Flat Config
 *
 * Docs:
 * https://prettier.io/docs/options
 * ============================================================================
 */

/** @type {import("prettier").Config} */
const config = {
  /**
   * Print Width
   * Wrap lines after 100 characters.
   */
  printWidth: 100,

  /**
   * Indentation
   */
  tabWidth: 2,
  useTabs: false,

  /**
   * Semicolons
   */
  semi: true,

  /**
   * Quotes
   */
  singleQuote: false,
  quoteProps: "as-needed",

  /**
   * Trailing commas
   */
  trailingComma: "es5",

  /**
   * Object spacing
   */
  bracketSpacing: true,

  /**
   * JSX
   */
  jsxSingleQuote: false,
  bracketSameLine: false,

  /**
   * Arrow functions
   */
  arrowParens: "always",

  /**
   * Line endings
   */
  endOfLine: "lf",

  /**
   * HTML whitespace
   */
  htmlWhitespaceSensitivity: "css",

  /**
   * Embedded languages
   */
  embeddedLanguageFormatting: "auto",

  /**
   * Markdown
   */
  proseWrap: "preserve",
};

export default config;
