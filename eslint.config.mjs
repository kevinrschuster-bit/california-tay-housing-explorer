const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**"]
  },
  {
    files: ["scripts/**/*.mjs", "*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  }
];

export default config;
