import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    locales: ["ca", "es", "en"],
    defaultLocale: "ca",
  },
});