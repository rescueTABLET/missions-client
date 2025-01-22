import { defineConfig, type Options } from "tsup";

const common: Options = {
  format: ["esm"],
  dts: false,
  clean: true,
  bundle: false,
};

export default defineConfig([
  {
    entry: ["./src/!(index).ts", "./src/*/!(index).ts?(x)"],
    ...common,
  },
  {
    entry: ["src/index.ts", "src/*/index.ts"],
    ...common,
  },
]);
