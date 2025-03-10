import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  outDir: 'dist',
  onSuccess: 'node ./scripts/postbuild.js',
  splitting: false,
  sourcemap: true,
  treeshake: true,
  external: ['citty', 'consola', 'picocolors', 'pathe', 'semver', 'giget'],
  noExternal: [],
  esbuildOptions(options) {
    options.banner = {
      js: '#!/usr/bin/env node',
    };
  },
});
