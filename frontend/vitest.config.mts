import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    env: { NEXT_PUBLIC_API_BASE_URL: "http://api.test" },
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["app/**", "components/**", "features/**", "lib/**", "hooks/**"],
      exclude: ["components/ui/**", "**/*.test.{ts,tsx}"],
    },
  },
})
