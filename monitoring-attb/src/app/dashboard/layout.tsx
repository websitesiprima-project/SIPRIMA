// File: src/app/dashboard/layout.tsx
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout"; // Import file client yang baru dibuat

export const metadata: Metadata = {
  title: "SIPRIMA - Monitoring Aset PLN",
  description:
    "Sistem Informasi Pengelolaan & Inventarisasi Aset Manajemen PLN UPT Manado",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
