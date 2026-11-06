import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app está completamente autenticada y lee datos por petición:
  // no necesitamos el modelo de caché de Cache Components.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;