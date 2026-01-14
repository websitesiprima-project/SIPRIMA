"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  PackageSearch,
  LogOut,
  Menu,
  BookOpen,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ubah default: Di Laptop terbuka (true)
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Deteksi Ukuran Layar (Hanya jalan sekali saat mount)
  useEffect(() => {
    const handleResize = () => {
      // Jika layar < 768px (HP), set Mobile true dan tutup sidebar
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    // Jalankan saat pertama load
    handleResize();

    // Pasang listener jika user resize browser manual
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Auto Close Sidebar saat pindah halaman (Khusus HP)
  // FIX: Kita bungkus dalam pengecekan agar tidak loop
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Hanya jalan kalau pathname berubah

  // 3. Cek User Admin
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const adminCheck =
          user.email?.includes("admin") || user.user_metadata?.role === "admin";
        setIsAdmin(adminCheck);
      }
    };
    checkUser();
  }, []);

  // 4. Handle Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
    } else {
      toast.success("Berhasil keluar");
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* --- OVERLAY GELAP (KHUSUS HP SAAT MENU BUKA) --- */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed md:sticky top-0 h-screen z-40 bg-pln-primary text-white shadow-xl transition-all duration-300 ease-in-out flex flex-col
          ${
            isSidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0 md:w-20"
          }
        `}
      >
        {/* HEADER SIDEBAR */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 bg-white shrink-0">
          {/* Logo Logic */}
          <div
            className={`relative h-12 transition-all ${
              isSidebarOpen ? "w-80" : "w-60"
            }`}
          >
            <Image
              src="/Logo_1.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Tombol Close di HP */}
          {isMobile && isSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* MENU ITEMS */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isOpen={isSidebarOpen}
          />
          <SidebarItem
            href="/dashboard/tracking"
            icon={<PackageSearch size={20} />}
            label="Monitoring Aset"
            isOpen={isSidebarOpen}
          />
          <SidebarItem
            href="/dashboard/help"
            icon={<BookOpen size={20} />}
            label="Panduan & SOP"
            isOpen={isSidebarOpen}
          />

          {isAdmin && (
            <div className="pt-4 pb-2">
              <p
                className={`text-xs text-pln-accent/70 font-semibold px-4 mb-2 uppercase ${
                  !isSidebarOpen && "hidden"
                }`}
              >
                Admin Zone
              </p>
              <SidebarItem
                href="/dashboard/input"
                icon={<FilePlus size={20} />}
                label="Input Barang"
                isOpen={isSidebarOpen}
              />
            </div>
          )}
        </div>

        {/* FOOTER (LOGOUT) */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-300 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-white/10"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b-4 border-pln-gold flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-pln-primary hover:bg-gray-100 p-2 rounded-lg"
          >
            <Menu />
          </button>

          {/* Header Kanan (Profil) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-pln-primary">User Active</p>
              <Link
                href="/dashboard/profile"
                className="text-xs text-gray-500 hover:text-pln-accent"
              >
                Lihat Profil
              </Link>
            </div>
            <Link href="/dashboard/profile">
              <div className="w-9 h-9 bg-gray-200 rounded-full border-2 border-pln-primary cursor-pointer hover:shadow-md transition-shadow"></div>
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// Helper Component
function SidebarItem({
  href,
  icon,
  label,
  isOpen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
      ${
        isActive
          ? "bg-pln-accent text-white shadow-md font-semibold"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div
        className={`${
          isActive ? "text-white" : "text-pln-gold group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      {isOpen ? (
        <span>{label}</span>
      ) : (
        // Tooltip saat sidebar tertutup (hanya di laptop)
        <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 hidden md:block">
          {label}
        </div>
      )}
    </Link>
  );
}
