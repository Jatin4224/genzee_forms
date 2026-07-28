import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  // bundle internal workspace packages, plus @scalar (ESM-only) so it works in the CJS output
  noExternal: [/^@repo\//, "@scalar/express-api-reference"],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
