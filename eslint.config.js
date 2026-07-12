import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginVue.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        // Node.js 전역 변수
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // 브라우저 전역 변수
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        // Nuxt 전역 변수
        $fetch: "readonly",
        defineNuxtConfig: "readonly",
        defineNuxtPlugin: "readonly",
        definePageMeta: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        useFetch: "readonly",
        useAsyncData: "readonly",
        useSeoMeta: "readonly",
        useHead: "readonly",
        showError: "readonly",
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [".nuxt/**", ".output/**", "dist/**", "node_modules/**", "public/data/**"],
  },
);
