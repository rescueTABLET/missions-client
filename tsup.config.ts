import { defineConfig, type Options } from "tsup";

const common: Options = {
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
};

export default defineConfig([
  {
    entry: ["./src/!(index).ts", "./src/*/!(index).ts?(x)"],
    ...common,
    bundle: false,
  },
  {
    entry: ["src/index.ts", "src/*/index.ts"],
    ...common,
    bundle: false,
  },
]);
