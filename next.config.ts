import type { NextConfig } from "next";

// Images keep their file names when they change, so browsers may reuse them for a week and then check again.
// Within that week a returning visitor loads them from their own cache, with no request to the server at all.
const WEEK = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  images: {
    // resized copies made by next/image are kept as long as the originals
    minimumCacheTTL: WEEK,
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=${60 * 60 * 24}` }],
      },
    ];
  },
};

export default nextConfig;
