"use client";

import React from "react";
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
  Scale, // Icon untuk Hukum
  ScrollText, // Icon untuk Dokumen/Prosedur
  ShieldCheck, // Icon untuk Syarat
  ChevronDown,
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
          Dokumentasi standar operasional prosedur (SOP) dan dasar pengetahuan
          Monitoring ATTB.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: KONTEN UTAMA */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. VISUALISASI ALUR (YANG LAMA) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="text-pln-primary" /> Ringkasan Alur Proses
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <StepItem
                number="1"
                title="Inventarisasi UP (AE-1)"
                desc="Penelitian Tim UP atas aset rusak & pengusulan penarikan."
              />
              <StepItem
                number="2"
                title="Penetapan UPI (AE-2)"
                desc="Penelitian Tim UPI (Level 1) & penetapan status ATTB."
              />
              <StepItem
                number="3"
                title="Review SPI (AE-4)"
                desc="Penelitian bersama Tim UPI & SPI (Audit kelayakan)."
              />
              <StepItem
                number="4"
                title="Verifikasi Pusat & SK"
                desc="Verifikasi Div. Akuntansi & persetujuan Direksi/Dekom/RUPS."
              />
              <StepItem
                number="5"
                title="Penghapusan (AE-5)"
                desc="Eksekusi penghapusbukuan setelah persetujuan turun."
                isLast
              />
            </div>
          </div>

          {/* 2. DEFINISI & DASAR HUKUM (BARU) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Scale className="text-pln-primary" /> Dasar Hukum & Pengertian
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
              <h4 className="font-bold text-blue-900 text-sm mb-1">
                Apa itu Aset Tetap Tidak Beroperasi (ATTB)?
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Aset berwujud yang diperoleh, tetapi{" "}
                <strong>
                  tidak digunakan dalam kegiatan operasi normal Perusahaan
                </strong>
                , diukur sebesar biaya perolehannya dan disusutkan.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-700 text-sm">
                Kebijakan & Regulasi Terkait:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4 marker:text-pln-primary">
                <li>
                  SE 015.E/870/DIR/1998 (Penarikan Aktiva Operasi menjadi Tidak
                  Beroperasi - AE.2)
                </li>
                <li>
                  SK Direksi No. 055.K/8713/DIR/1996 (Penghapusan karena
                  Hilang/Pencurian/Terbakar)
                </li>
                <li>
                  Keputusan Direksi No.1233.K/DIR/2011 (Tata Cara
                  Penghapusbukuan)
                </li>
                <li>
                  PERDIR No. 0116.K/DIR/2017 (Pedoman Kebijakan Akuntansi)
                </li>
                <li>
                  Surat Kadiv Akuntansi No. 1624/KEU.02.03/DIVAKT/2015 (Revisi
                  Formulir AE)
                </li>
              </ul>
            </div>
          </div>

          {/* 3. SYARAT PENARIKAN (BARU) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-pln-primary" /> Syarat Penarikan Aset
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-bold text-sm text-gray-800 mb-2 border-b pb-1">
                  1. Aset Tetap
                </h4>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>Kondisi fisik teknis tidak memungkinkan operasi.</li>
                  <li>Tidak ekonomis (biaya perbaikan tinggi).</li>
                  <li>Penggantian teknologi (usang).</li>
                  <li>Relokasi sesuai kebijakan manajemen.</li>
                </ul>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-bold text-sm text-gray-800 mb-2 border-b pb-1">
                  2. Material / PDP
                </h4>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>Rusak & tidak ekonomis diperbaiki.</li>
                  <li>Kadaluwarsa (Expired).</li>
                  <li>PDP/Pengembangan yang tidak ekonomis dilanjutkan.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. DETAIL PROSEDUR (EXPANDABLE - BARU) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <ScrollText className="text-pln-primary" /> Detail Prosedur (SOP
              Lengkap)
            </h3>
            <details className="group bg-gray-50 rounded-lg border border-gray-200">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <span>Klik untuk melihat 27 Tahapan Lengkap</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown size={16} />
                </span>
              </summary>
              <div className="text-xs text-gray-600 p-4 pt-0 border-t border-gray-200 space-y-2 leading-relaxed h-96 overflow-y-auto custom-scrollbar">
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Pembentukan Tim Penarikan Aset Tetap di Tingkat UP.</li>
                  <li>Laporan dari pengguna/inventarisasi aset rusak.</li>
                  <li>Bagian Fasilitas mengusulkan ke Manajer UP.</li>
                  <li>Manajer UP menugaskan Tim Penarikan UP meneliti aset.</li>
                  <li>
                    <strong>Tim UP menerbitkan dokumen AE.1 dan AE 1.1.</strong>
                  </li>
                  <li>
                    Manajer UP mengusulkan ke UI dengan Surat Pengantar (AE.3
                    dan AE.3.1).
                  </li>
                  <li>GM UPI menugaskan Tim Penarikan UPI meneliti usulan.</li>
                  <li>Tim UPI melakukan penelitian (Level 1).</li>
                  <li>
                    <strong>
                      Penerbitan dokumen AE 2 dan AE 2.1 (Penetapan Status
                      ATTB).
                    </strong>
                  </li>
                  <li>
                    Fungsi Akuntansi UP memindahkan status aset Operasi ke ATTB
                    (Max 5 hari kerja).
                  </li>
                  <li>
                    Tim UPI menyiapkan AE 3 dan AE 3.1 untuk usulan ke SPI.
                  </li>
                  <li>Penelitian bersama Tim UPI dan SPI.</li>
                  <li>
                    <strong>Penerbitan dokumen AE 4 dan AE 4.1.</strong>
                  </li>
                  <li>
                    Tim UPI menyiapkan dokumen pendukung (Pakta Integritas,
                    Kajian Hukum/Finansial, Foto).
                  </li>
                  <li>UPI mengirim Usulan ke Kantor Pusat (Div Akuntansi).</li>
                  <li>Div. Akuntansi memverifikasi dokumen.</li>
                  <li>
                    Div. Akuntansi menyiapkan SK Direksi & Surat Persetujuan.
                  </li>
                  <li>Direksi mengajukan ke Dewan Komisaris (Dekom).</li>
                  <li>
                    Dekom memberikan persetujuan (masa manfaat &lt; 5 thn) atau
                    rekomendasi (&gt; 5 thn).
                  </li>
                  <li>Surat Dekom disampaikan ke Direksi.</li>
                  <li>Div. Akuntansi meneruskan persetujuan Dekom ke UPI.</li>
                  <li>
                    Untuk aset &gt; 5 tahun, Direksi menyurat ke RUPS
                    (Kementerian BUMN).
                  </li>
                  <li>Kementerian BUMN memberikan persetujuan.</li>
                  <li>Div. Akuntansi meneruskan persetujuan BUMN ke UPI.</li>
                  <li>
                    Div. Akuntansi menyurat ke KSPI untuk penelitian kembali.
                  </li>
                  <li>Tim UPI & SPI Regional melakukan penelitian akhir.</li>
                  <li>
                    <strong>
                      Penerbitan dokumen AE.5 dan AE.5.1 (Berita Acara
                      Penghapusan).
                    </strong>
                  </li>
                  <li>UPI melaporkan tindak lanjut secara periodik.</li>
                </ol>
              </div>
            </details>
          </div>

          {/* 5. FAQ (YANG LAMA) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <HelpCircle className="text-pln-primary" /> FAQ (Tanya Jawab)
            </h3>
            <div className="space-y-4">
              <FaqItem
                q="Kapan formulir AE-1 dibuat?"
                a="AE-1 dibuat saat Tim UP selesai melakukan penelitian fisik terhadap aset yang rusak/tidak beroperasi."
              />
              <FaqItem
                q="Apa fungsi AE-2?"
                a="AE-2 adalah dokumen penetapan resmi perubahan status dari Aset Operasi menjadi Aset Tetap Tidak Beroperasi (ATTB)."
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
