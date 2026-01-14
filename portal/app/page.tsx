"use client";

import { ArrowRight, LayoutGrid, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalGateway() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 font-sans text-slate-800 relative overflow-hidden">
      {/* Background Ornament (Blur) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* --- HEADER --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 border border-cyan-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-cyan-700 uppercase">
            System Operational
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="text-yellow-500 fill-yellow-500" size={32} />
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            PLN{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              UPT MANADO
            </span>
          </h1>
        </div>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Integrated Asset Management & Monitoring System
        </p>
      </motion.div>

      {/* --- KARTU PILIHAN APLIKASI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {/* KARTU 1: REVALUE (Updated Link) */}
        <a href="https://revalue-five.vercel.app/" className="group">
          <motion.div
            whileHover={{ y: -5 }}
            className="h-full bg-white rounded-3xl p-8 border border-cyan-100 shadow-xl shadow-cyan-900/5 hover:shadow-cyan-500/20 transition-all relative overflow-hidden group-hover:border-cyan-300"
          >
            {/* Hiasan background kartu */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 group-hover:rotate-3 transition-transform">
                <LayoutGrid size={32} />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
                ReValue
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Aplikasi utama untuk monitoring aset, visualisasi data
                statistik, dan pelacakan status ATTB (User Interface).
              </p>

              <div className="flex items-center font-bold text-cyan-600 group-hover:gap-3 gap-1 transition-all text-sm">
                Buka Aplikasi <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>
        </a>

        {/* KARTU 2: SIJAGAD (Updated Link) */}
        <a href="https://sijagad.vercel.app/" className="group">
          <motion.div
            whileHover={{ y: -5 }}
            className="h-full bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-900/5 hover:shadow-orange-500/20 transition-all relative overflow-hidden group-hover:border-orange-300"
          >
            {/* Hiasan background kartu */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 group-hover:-rotate-3 transition-transform">
                <Database size={32} />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-orange-500 transition-colors">
                SiJAGAD
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Sistem Penanganan Surat Penjaminan Pelaksanaan & Surat
                Penjaminan Pemeliharaan (Backend API).
              </p>

              <div className="flex items-center font-bold text-orange-500 group-hover:gap-3 gap-1 transition-all text-sm">
                Akses SiJAGAD <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>
        </a>
      </div>

      <footer className="mt-16 text-slate-400 text-xs font-medium relative z-10">
        &copy; {new Date().getFullYear()} PT PLN (Persero) UPT Manado.
      </footer>
    </div>
  );
}
