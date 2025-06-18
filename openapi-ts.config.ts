import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://missions-api.rescuetablet.com/openapi.yaml",
  output: {
    path: "src/client",
    clean: true,
    format: "prettier",
  },
});
