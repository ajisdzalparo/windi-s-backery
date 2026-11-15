import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Build mandiri: image Docker produksi hanya berisi file yang dibutuhkan untuk menjalankan server.
  output: "standalone",
};

export default nextConfig;
