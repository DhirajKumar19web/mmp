// eslint.config.js

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore generated files
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      ".husky/**",
      "*.log",

      "eslint.config.js",
      "lint-staged.config.js",
    ],
  },

  // JavaScript recommended rules
  js.configs.recommended,

  // TypeScript strict + stylistic rules
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Disable type-aware linting for JS files (e.g. config files)
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ["**/*.ts"],

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },

      globals: {
        ...globals.node,
      },
    },

    plugins: {
      import: importPlugin,
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      /* ==========================================================
         General
      ========================================================== */

      "no-console": process.env.NODE_ENV === "production" ? "error" : "off",

      "no-debugger": "error",

      "no-duplicate-imports": "error",

      "prefer-const": "error",

      "object-shorthand": ["error", "always"],

      "no-var": "error",

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],

      /* ==========================================================
         TypeScript
      ========================================================== */

      "@typescript-eslint/no-explicit-any": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      "@typescript-eslint/no-unnecessary-condition": "error",

      "@typescript-eslint/prefer-nullish-coalescing": "error",

      "@typescript-eslint/prefer-optional-chain": "error",

      "@typescript-eslint/explicit-function-return-type": "off",

      "@typescript-eslint/explicit-module-boundary-types": "off",

      /* ==========================================================
         Imports
      ========================================================== */

      "import/no-duplicates": "error",

      "import/first": "error",

      "import/newline-after-import": [
        "error",
        {
          count: 1,
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          "newlines-between": "always",
        },
      ],
    },
  },

  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier
);
