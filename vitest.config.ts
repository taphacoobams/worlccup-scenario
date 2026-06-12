import { defineConfig } from "vitest/config";
import path from "path";
import { loadEnv } from "vite";

const env = loadEnv("test", process.cwd(), "");

export default defineConfig({
  test: {
    env,
    environment: "node",
    globals: true,
    pool: "threads",
    testTimeout: 30000,
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "lib/test/server-only-stub.ts"),
    },
  },
});
