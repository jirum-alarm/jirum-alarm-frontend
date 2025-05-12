module.exports = {
  extends: [
    "eslint-config-next",
    "plugin:storybook/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  overrides: [
    {
      files: ["**/*.config.js", "**/*.config.mjs", ".eslintrc.js"],
      extends: ["eslint:recommended"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: null,
      },
    },
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        named: true,
      },
    ],
    "import/no-unresolved": "off",
  },
};
