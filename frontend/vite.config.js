import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. Vite gives fast dev-server reloads,
// which matters when you're iterating quickly under a deadline.
export default defineConfig({
  plugins: [react()],
});
