import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  /* config options here */
  
  webpack: (config, { isServer }) => {
    // Add support for importing Three.js examples
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/addons/': 'three/examples/jsm/'
    };

    return config;
  },
  
  /* config options here */
};

export default nextConfig;
