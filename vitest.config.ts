import { defineConfig } from "vitest/config";

const ci = Boolean(process.env.CI);

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      LOG_LEVEL: "error",
    },
    reporters: ci
      ? ["tree", ["junit", { suiteName: "backend", outputFile: "junit.xml" }]]
      : ["tree"],
    coverage: {
      enabled: ci,
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.gen.ts", "src/client"],
    },
  },
});
