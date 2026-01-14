import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B7A8F",
        accent: "#17A2B8",
        gold: "#FFD700",
      },
      // --- TAMBAHKAN INI ---
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"], // Default jadi Inter
        display: ["var(--font-jakarta)", "sans-serif"], // Font Khusus Judul
      },
    },
  },
  plugins: [],
};
export default config;
