/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan bagian images ini:
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gxprnbsrrxkwfrgihenv.supabase.co", // Domain Supabase Anda dari pesan error
        port: "",
        pathname: "/storage/v1/object/public/**", // Path ke storage bucket
      },
    ],
  },
};

export default nextConfig;
