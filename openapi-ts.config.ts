import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://missions-api.rescuetablet.com/openapi.yaml",
  output: {
    path: "src/client",
    clean: true,
    format: "prettier",
  },
  plugins: [...defaultPlugins, "@hey-api/client-fetch"],
});
