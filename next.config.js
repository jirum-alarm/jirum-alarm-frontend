/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        destination: "https://jirum-api.kyojs.com/:path*",
        source: "/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/graphql",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
