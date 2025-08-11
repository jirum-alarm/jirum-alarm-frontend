import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { importX } from "eslint-plugin-import-x";
import storybook from "eslint-plugin-storybook";
import { configs as tseslint } from "typescript-eslint";
import * as tsParser from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/**
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  js.configs.recommended,
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),
  ...tseslint.recommended,
  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          named: true,
        },
      ],
      "import-x/no-unresolved": "off",
    },
  },
  {
    files: ["**/*.config.(js|ts)", "**/*.config.mjs"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
  {
    ignores: ["node_modules/", "dist/", ".next/", "public/"],
  },
];

export default config;
