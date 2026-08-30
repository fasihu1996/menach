import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "bucket.fasihuddin.com",
                port: "",
                pathname: "/heritage-bucket/**",
            },
        ],
    },
};

export default nextConfig;
