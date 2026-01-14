"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Hammer,
  RefreshCw,
  AlertTriangle,
  FileSignature,
  Landmark,
  ArrowRight,
  Info,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 pb-20 relative overflow-hidden">
      {/* DECORATION BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />

      {/* --- NAVBAR --- */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 drop-shadow-sm">
            <Image
              src="/SiJAGAD_2.svg"
              alt="Logo SiJAGAD"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display tracking-tight">
              Pusat Pengetahuan
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              PLN UPT MANADO
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-white transition-all bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Kembali ke Dashboard
        </Link>
      </nav>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-8 mt-12 space-y-16">
        {/* --- HERO HEADER --- */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100"
          >
            <BookOpen size={14} /> Edukasi Sistem
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
          >
            Memahami{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Jaminan Proyek
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 leading-relaxed"
          >
            Mengapa kita perlu memonitor surat-surat ini? Karena ini adalah{" "}
            <strong className="text-slate-800 bg-yellow-100 px-1 rounded">
              "Uang Pengaman"
            </strong>{" "}
            PLN. Jika Vendor gagal, surat inilah yang menyelamatkan kerugian
            negara.
          </motion.p>
        </div>

        {/* --- DUAL CARD SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CARD 1: JAMINAN PELAKSANAAN */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="group relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:border-blue-300 transition-all hover:shadow-2xl hover:shadow-blue-900/5"
          >
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Hammer size={32} />
                </div>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Tahap 1
                </span>
              </div>

              <h3 className="text-3xl font-bold text-slate-900 mb-1">
                Jaminan Pelaksanaan
              </h3>
              <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-6">
                Performance Bond
              </p>

              <div className="space-y-8">
                <p className="text-slate-600 leading-relaxed">
                  Surat sakti yang menjamin vendor{" "}
                  <strong>menyelesaikan pekerjaan fisik</strong> sampai tuntas.
                  Jika vendor kabur di tengah jalan, PLN mencairkan uang ini.
                </p>

                <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <FileSignature size={16} className="text-blue-500" /> Fakta
                    Kunci
                  </h4>
                  <ul className="space-y-4">
                    <ListItem
                      color="bg-blue-500"
                      label="Waktu Penyerahan"
                      value="Sebelum tanda tangan kontrak."
                    />
                    <ListItem
                      color="bg-blue-500"
                      label="Nilai Jaminan"
                      value="Umumnya 5% dari Nilai Kontrak."
                    />
                    <ListItem
                      color="bg-blue-500"
                      label="Masa Berlaku"
                      value="Awal proyek s.d. Serah Terima 1 (PHO)."
                    />
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: JAMINAN PEMELIHARAAN */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:border-emerald-300 transition-all hover:shadow-2xl hover:shadow-emerald-900/5"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={32} />
                </div>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Tahap 2
                </span>
              </div>

              <h3 className="text-3xl font-bold text-slate-900 mb-1">
                Jaminan Pemeliharaan
              </h3>
              <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-6">
                Maintenance Bond
              </p>

              <div className="space-y-8">
                <p className="text-slate-600 leading-relaxed">
                  Surat garansi setelah pekerjaan selesai. Menjamin vendor mau{" "}
                  <strong>memperbaiki kerusakan</strong> (komplain) selama masa
                  garansi.
                </p>

                <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <RefreshCw size={16} className="text-emerald-500" /> Fakta
                    Kunci
                  </h4>
                  <ul className="space-y-4">
                    <ListItem
                      color="bg-emerald-500"
                      label="Waktu Penyerahan"
                      value="Saat pekerjaan fisik 100% (PHO)."
                    />
                    <ListItem
                      color="bg-emerald-500"
                      label="Nilai Jaminan"
                      value="5% dari Nilai Kontrak (Tukar Retensi)."
                    />
                    <ListItem
                      color="bg-emerald-500"
                      label="Masa Berlaku"
                      value="Dari PHO s.d. Serah Terima Akhir (FHO)."
                    />
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- FLOWCHART SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3">Siklus Hidup Jaminan</h3>
              <p className="text-slate-400">
                Kapan satu jaminan mati dan jaminan lain hidup?
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative">
              <StepCard
                number="1"
                title="Tender Menang"
                desc="Vendor menerima SPPBJ"
                status="Pelaksanaan DIBUAT"
                statusColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
              />

              <ArrowIcon />

              <StepCard
                number="2"
                title="Konstruksi"
                desc="Pekerjaan berlangsung"
                status="Pelaksanaan AKTIF"
                statusColor="bg-green-500/20 text-green-300 border-green-500/30"
                active
              />

              <ArrowIcon />

              <StepCard
                number="3"
                title="PHO (Selesai)"
                desc="Serah Terima 1 (100%)"
                multiStatus={[
                  {
                    label: "Pelaksanaan SELESAI",
                    color: "text-red-300 bg-red-500/20 border-red-500/30",
                  },
                  {
                    label: "Pemeliharaan MULAI",
                    color: "text-blue-300 bg-blue-500/20 border-blue-500/30",
                  },
                ]}
              />

              <ArrowIcon />

              <StepCard
                number="4"
                title="FHO (Final)"
                desc="Masa garansi habis"
                status="Pemeliharaan SELESAI"
                statusColor="text-emerald-300 bg-emerald-500/20 border-emerald-500/30"
              />
            </div>
          </div>
        </motion.div>

        {/* --- ANALOGI & WARNING GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analogi Section */}
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2.5rem] p-8 md:p-10 border border-orange-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500">
                <Landmark size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">
                  Analogi Sederhana
                </h3>
                <p className="text-sm text-slate-500">
                  Bayangkan Renovasi Rumah
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                <div className="font-bold text-orange-500 text-lg mb-2">
                  01. Pelaksanaan
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Anda minta Tukang titip uang di awal. Kalau Tukang kabur saat
                  tembok belum jadi, uang itu Anda ambil buat bayar Tukang baru.
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                <div className="font-bold text-orange-500 text-lg mb-2">
                  02. Pemeliharaan
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Rumah jadi, tapi Anda tahan sebagian bayaran. Kalau atap bocor
                  minggu depan dan Tukang gamau benerin, uang itu dipakai buat
                  benerin sendiri.
                </p>
              </div>
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full group-hover:bg-red-500/30 transition-all"></div>

            <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-white font-bold text-xl mb-3">Zona Bahaya</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Jika surat jaminan{" "}
              <strong className="text-red-400">Expired</strong> walau hanya 1
              hari, surat itu menjadi sampah. PLN tidak bisa klaim uangnya.
            </p>

            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 w-full">
              <div className="flex items-center gap-3 justify-center text-xs font-bold text-slate-300">
                <Info size={14} />
                <span>SiJAGAD mencegah ini terjadi.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ListItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3 text-slate-600 text-sm">
      <div
        className={`mt-1.5 w-2 h-2 rounded-full ${color} shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]`}
      ></div>
      <span>
        <strong className="text-slate-800 block mb-0.5">{label}</strong>
        {value}
      </span>
    </li>
  );
}

function StepCard({
  number,
  title,
  desc,
  status,
  statusColor,
  active = false,
  multiStatus,
}: any) {
  return (
    <div
      className={`flex-1 w-full bg-slate-800/50 p-6 rounded-3xl border ${
        active ? "border-blue-500/50 bg-slate-800" : "border-slate-700"
      } text-center relative group hover:bg-slate-800 transition-all`}
    >
      <div
        className={`w-10 h-10 ${
          active ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
        } rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4 transition-colors`}
      >
        {number}
      </div>
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-4">{desc}</p>

      {multiStatus ? (
        <div className="space-y-2">
          {multiStatus.map((s: any, i: number) => (
            <div
              key={i}
              className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border ${s.color}`}
            >
              {s.label}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`text-[10px] font-bold py-1.5 px-3 rounded-lg inline-block border ${statusColor}`}
        >
          {status}
        </div>
      )}
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className="hidden lg:flex text-slate-600">
      <ArrowRight size={24} />
    </div>
  );
}
