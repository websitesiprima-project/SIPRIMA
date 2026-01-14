"use client";

import React from "react"; // <--- Tambahkan import ini agar React.ReactNode terbaca
import {
  BookOpen,
  FileText,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Printer,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-pln-primary flex items-center gap-3">
          <BookOpen size={32} /> Pusat Bantuan & Panduan
        </h1>
        <p className="text-gray-500 mt-2">
          Dokumentasi standar operasional prosedur (SOP) penggunaan Aplikasi
          Monitoring ATTB.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: ALUR PROSES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="text-pln-primary" /> Alur Proses
              Penghapusan Aset
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {/* STEPS */}
              <StepItem
                number="1"
                title="Inventarisasi UP (AE-1)"
                desc="Unit Pelaksana (UP) melakukan pendataan aset fisik yang rusak/tidak beroperasi dan menginput ke sistem."
              />
              <StepItem
                number="2"
                title="Penetapan UPI (AE-2)"
                desc="Unit Pelaksana Induk (UPI) memverifikasi usulan dan menetapkan daftar aset yang layak dihapus."
              />
              <StepItem
                number="3"
                title="Review SPI (AE-4)"
                desc="Satuan Pengawas Internal (SPI) melakukan audit kelayakan dan kewajaran nilai aset."
              />
              <StepItem
                number="4"
                title="Verifikasi Pusat & SK"
                desc="Kantor Pusat memvalidasi data dan menerbitkan Surat Keputusan (SK) Penghapusan."
              />
              <StepItem
                number="5"
                title="Penghapusan (AE-5)"
                desc="Proses lelang/pemusnahan selesai. Aset dihapus dari buku (Write-off) SAP."
                isLast
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <HelpCircle className="text-pln-primary" /> FAQ (Tanya Jawab)
            </h3>
            <div className="space-y-4">
              <FaqItem
                q="Saya salah input data, bagaimana cara ubahnya?"
                a="Masuk ke menu Tracking, cari aset tersebut, klik asetnya, lalu tekan tombol 'Edit' di pojok kanan atas."
              />
              <FaqItem
                q="Kenapa saya tidak bisa menghapus aset?"
                a="Fitur Hapus hanya tersedia untuk akun Admin. Pastikan Anda login sebagai Admin. Selain itu, pastikan data yang dihapus sudah sesuai prosedur."
              />
              <FaqItem
                q="Apa itu Nilai Tafsiran?"
                a="Nilai Tafsiran adalah perkiraan harga jual aset (scrap value) berdasarkan berat (Kg) dikali harga pasaran logam saat ini (Rp 4.300/kg)."
              />
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: FITUR & IKON */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4">Fitur Aplikasi</h3>
            <ul className="space-y-3">
              <FeatureItem
                icon={<Edit size={16} />}
                text="Edit Data Teknis & Foto"
              />
              <FeatureItem
                icon={<Trash2 size={16} />}
                text="Hapus Usulan (Admin Only)"
              />
              <FeatureItem
                icon={<Printer size={16} />}
                text="Cetak PDF Berita Acara"
              />
              <FeatureItem
                icon={<FileText size={16} />}
                text="Export Laporan Excel"
              />
            </ul>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} /> Perhatian
            </h3>
            <p className="text-sm text-yellow-800 opacity-90 leading-relaxed">
              Setiap perubahan status aset akan tercatat di sistem Log. Pastikan
              dokumen fisik (Berita Acara Manual) sudah lengkap sebelum
              memajukan tahapan ke level berikutnya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Kontak Admin</h3>
            <p className="text-sm text-gray-500 mb-2">
              Jika terjadi kendala sistem, hubungi:
            </p>
            <div className="font-mono text-sm bg-gray-100 p-2 rounded text-center">
              admin.aset@pln.co.id
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN KECIL ---

function StepItem({
  number,
  title,
  desc,
  isLast,
}: {
  number: string;
  title: string;
  desc: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-pln-primary group-[.is-active]:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
        {number}
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-slate-900">{title}</div>
          {isLast && <CheckCircle size={16} className="text-green-500" />}
        </div>
        <div className="text-slate-500 text-sm leading-snug">{desc}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <h4 className="font-bold text-sm text-gray-800 mb-1">{q}</h4>
      <p className="text-sm text-gray-500">{a}</p>
    </div>
  );
}

// PERBAIKAN DI SINI: Ganti 'any' dengan 'React.ReactNode'
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-blue-900">
      <div className="bg-white p-1.5 rounded-md shadow-sm text-pln-primary">
        {icon}
      </div>
      {text}
    </li>
  );
}
