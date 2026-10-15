/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Multipart POSTs pass through Vinext's action parser before the route handler.
      // The revision endpoint enforces its own 10 MB file limit and request bound.
      bodySizeLimit: "11mb",
    },
  },
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;
