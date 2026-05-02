import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Deno-targeted Edge Functions don't share our React lint rules.
  // The `dist/` build output should never be linted.
  { ignores: ["dist", "supabase/functions/**"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // shadcn-ui's auto-generated components use empty interfaces by convention
      // (so consumers can extend them later).
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    // Tailwind config plugins (`tailwindcss-animate`, `@tailwindcss/typography`)
    // ship CommonJS-only and only load via `require`.
    files: ["tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
