/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a production build write somewhere other than .next, so it can run
  // without clobbering a dev server's cache:
  //   NEXT_DIST_DIR=.next-prod npm run build
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
