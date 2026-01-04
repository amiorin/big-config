import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    include: ["test/js/**/**test.mjs", "test/js/**/**test.jsx"],
  },
  build: {
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/js/index.jsx"),
      formats: ["es"],
      name: "App",
      fileName: "app",
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.direnv/**",
        "**/.devenv/**",
        "/nix/store/**",
      ],
    },
  },
});
