import type { MetadataRoute } from "next";

// Supaya game bisa dipasang di layar utama HP ("Tambahkan ke Layar Utama") dan dibuka seperti aplikasi.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Windi's Sweet Bakery",
    short_name: "Sweet Bakery",
    description: "Toko kue dan kota kecil yang nyaman, khusus buat Windi.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f3dfc2",
    theme_color: "#8a5530",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
