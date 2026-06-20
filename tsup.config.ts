import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // The file you run to start your app
  format: ['esm'],         // Output modern ESM (import/export)
  dts: true,               // Generate .d.ts type definitions (optional)
  clean: true,             // Delete the dist folder before rebuilding
  sourcemap: true,         // Generate sourcemaps for debugging
});