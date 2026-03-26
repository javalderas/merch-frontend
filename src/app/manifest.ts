import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Merch - Merchandising",
    short_name: "Merch",
    description: "Gestión de merchandising para bandas de música",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f14",
    theme_color: "#a855f7",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
