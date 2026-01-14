"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  BellRing,
  FileText,
  ArrowRight,
  Lock,
  ArrowLeft, // <--- 1. Import Icon ArrowLeft
} from "lucide-react";
import { useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import Image from "next/image";

// Interface untuk Props Card
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  className?: string;
  delay?: number;
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek apakah user sudah login
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setIsLoggedIn(true);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-800 font-sans selection:bg-yellow-200">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        {/* Container */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* --- BAGIAN KIRI: BACK TO PORTAL & LOGO --- */}
          <div className="flex items-center gap-4">
            {/* 2. Tombol Kembali ke Portal */}
            {/* Menggunakan <a> biasa karena pindah port (misal ke :3000) */}
            <a
              href="http://localhost:3000"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </div>
              <span className="hidden md:block">Portal</span>
            </a>

            {/* Divider Kecil */}
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            {/* Logo Group */}
            <div className="flex items-center gap-3">
              {/* LOGO SVG BARU */}
              <div className="relative w-10 h-10">
                <Image
                  src="/SiJAGAD_2.svg"
                  alt="Logo SiJAGAD"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* JUDUL */}
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                SiJAGAD
              </span>
            </div>
          </div>

          {/* --- BAGIAN KANAN: LOGIN / DASHBOARD --- */}
          <div className="flex gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                Buka Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Lock size={16} /> Login Pegawai
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* BADGE FONT DISPLAY */}
            <div className="font-display inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-widest mb-6 border border-yellow-200">
              PLN UPT MANADO
            </div>

            {/* JUDUL BESAR FONT DISPLAY */}
            <h1 className="font-display text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Sistem Jaminan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Garansi Digital
              </span>
            </h1>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              Solusi monitoring Bank Garansi yang terintegrasi, aman, dan
              real-time untuk memastikan kepatuhan vendor dan keamanan aset PLN.
            </p>

            <div className="flex gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/auth"}>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl hover:shadow-2xl flex items-center gap-2">
                  {isLoggedIn ? "Masuk Dashboard" : "Mulai Sekarang"}{" "}
                  <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Visual Content (Cards Animation) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-200 rounded-full blur-[80px] opacity-30"></div>

            <div className="relative grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<ShieldCheck size={32} className="text-green-500" />}
                title="Keamanan Data"
                desc="Enkripsi tingkat tinggi untuk dokumen vital."
                delay={0.3}
              />
              <FeatureCard
                icon={<BellRing size={32} className="text-orange-500" />}
                title="Notifikasi Expired"
                desc="Peringatan dini sebelum masa berlaku habis."
                className="translate-y-12"
                delay={0.4}
              />
              <FeatureCard
                icon={<FileText size={32} className="text-blue-500" />}
                title="Arsip Digital"
                desc="Penyimpanan terpusat yang mudah dicari."
                delay={0.5}
              />
              <FeatureCard
                icon={<Zap size={32} className="text-yellow-500" />}
                title="Real-time Monitor"
                desc="Pantau status jaminan kapan saja."
                className="translate-y-12"
                delay={0.6}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>
            © {new Date().getFullYear()} PLN UPT Manado. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <span>SiJAGAD v2.0</span>
            <span>Secure System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Komponen Kecil untuk Card
function FeatureCard({
  icon,
  title,
  desc,
  className = "",
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-100 hover:border-blue-200 transition-colors ${className}`}
    >
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}
