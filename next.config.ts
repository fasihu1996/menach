import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb",
        },
        rootParams: true,
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
