"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowLeft,
} from "lucide-react"; // Added ArrowLeft
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800 overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        {/* --- TOMBOL KEMBALI KE PORTAL (NEW) --- */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3000" // Link ke PORTAL (Port 3000)
            className="flex items-center gap-2 text-gray-500 hover:text-pln-primary font-medium text-sm transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-pln-primary/10 transition-colors">
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            <span className="hidden md:block">Kembali ke Portal</span>
          </a>

          {/* Divider Kecil */}
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          {/* Logo Kecil (Geser sedikit ke kanan) */}
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.png"
                alt="Logo Kecil"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-pln-primary tracking-tight hidden md:block text-sm">
              UPT MANADO
            </span>
          </div>
        </div>

        {/* Tombol Login */}
        <Link
          href="/auth"
          className="px-6 py-2.5 rounded-full border border-pln-primary text-pln-primary font-bold hover:bg-pln-primary hover:text-white transition-all text-sm"
        >
          Login Staff
        </Link>
      </nav>

      {/* --- HERO SECTION (FOKUS LOGO BESAR) --- */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative mt-10 mb-20">
        {/* Background Hiasan (Blur) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-3xl h-64 md:h-80 mb-8 flex items-center justify-center"
        >
          {/* --- LOGO UTAMA SANGAT BESAR --- */}
          <Image
            src="/Logo.png"
            alt="ReValue Logo Besar"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-pln-primary mb-4 tracking-tight">
            Asset Recovery{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pln-gold to-yellow-500">
              System
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem monitoring terintegrasi untuk mengelola Aset Tetap Tidak
            Beroperasi (ATTB). Ubah aset pasif menjadi nilai produktif bagi
            perusahaan.
          </p>

          <Link href="/auth">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-pln-primary to-pln-accent text-white font-bold text-lg rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 flex items-center gap-3 mx-auto">
              Mulai Monitoring
              <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </div>
            </button>
          </Link>
        </motion.div>
      </main>

      {/* --- FEATURES SECTION --- */}
      <section className="bg-gray-50 py-20 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck size={32} className="text-pln-primary" />}
            title="Validasi Bertingkat"
            desc="Proses persetujuan dokumen AE-1 hingga AE-5 yang transparan dan akuntabel sesuai SOP Perusahaan."
          />
          <FeatureCard
            icon={<BarChart3 size={32} className="text-pln-gold" />}
            title="Realtime Tracking"
            desc="Pantau pergerakan status aset dan nilai tafsiran secara langsung melalui Dashboard Executive."
          />
          <FeatureCard
            icon={<Zap size={32} className="text-cyan-600" />}
            title="Recovery Value"
            desc="Optimalisasi nilai scrap aset untuk meningkatkan pendapatan lain-lain (revenue) perusahaan."
          />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-8 text-center border-t border-gray-100">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} PT PLN (Persero) UPT Manado. All
          Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

// Komponen Kecil untuk Kartu Fitur
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
