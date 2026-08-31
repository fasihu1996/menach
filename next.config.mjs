import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
