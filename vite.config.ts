import { defineConfig } from "vite"

export default defineConfig({
  root: "src",
  publicDir: "../public",
  base: "/readme-api-demo/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: "src/index.html"
      }
    }
  }
})
