import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Service layer: block auth Server Actions in components/hooks (exclude app so DTO rule can apply cleanly)
  {
    files: ["src/components/**/*.ts", "src/hooks/**/*.ts", "src/hooks/**/*.tsx", "src/lib/auth/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/actions/auth/*", "*/actions/auth/*"],
              message: "Do not use Server Actions for auth. Use AuthApi from @/lib/api instead.",
            },
          ],
        },
      ],
    },
  },
  // DTO/UI isolation: app and component .tsx must not import DTOs (use domain types from @/types, stores, hooks)
  {
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/dtos", "@/lib/dtos/*", "*/lib/dtos", "*/lib/dtos/*"],
              message: "UI must not import DTOs. Use domain types from @/types, stores, or hooks.",
            },
            {
              group: ["@/actions/auth/*", "*/actions/auth/*"],
              message: "Do not use Server Actions for auth. Use AuthApi from @/lib/api instead.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
