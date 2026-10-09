import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import { importX } from "eslint-plugin-import-x";
import storybook from "eslint-plugin-storybook";
import { configs as tseslint } from "typescript-eslint";
import * as tsParser from "@typescript-eslint/parser";

/**
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  js.configs.recommended,
  // eslint-config-next 16 은 flat config 를 직접 내보낸다 — FlatCompat(eslintrc 변환) 없이 그대로 펼친다.
  ...nextCoreWebVitals,
  ...tseslint.recommended,
  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    rules: {
      // eslint-plugin-storybook 10 의 새 규칙. web 은 Storybook 8 이라 @storybook/nextjs 가 Meta·StoryObj 타입을
      // 내보내지 않는다 — @storybook/react 에서 가져오는 게 정석이므로 Storybook 9+ 로 올릴 때까지 끈다.
      "storybook/no-renderer-packages": "off",
    },
  },
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
