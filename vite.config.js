import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let config = {};
  if (mode === "worker") {
    config = {
      build: {
        outDir: "public",
        assetsDir: "./",
        rollupOptions: {
          input: {
            RemoteClient: "@arcgis/core/core/workers/RemoteClient.js",
            SpatialJoin: "./src/spatial-join-worker.js"
          },
          output: {
            entryFileNames: "[name].js",
            chunkFileNames: "chunks/[name]-[hash].js",
            format: "system",
            exports: "named"
          },
          plugins: [resolve(), commonjs(), terser()],
          preserveEntrySignatures: "allow-extension"
        }
      }
    };
  }
  return config;
});
