import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  i18n: {
    locales: ["ca", "es", "en"],
    defaultLocale: "ca",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
