import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Kita gunakan Google Font otomatis
import "./globals.css"; // Pastikan ini tetap ada untuk Tailwind

// Setup font Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monitoring ATTB PLN",
  description: "Sistem Monitoring Aset Tidak Beroperasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning mengatasi error extension browser Anda
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
