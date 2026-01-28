"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

interface Asset {
  id: string;
  no_aset: string;
  jenis_aset: string;
  merk_type: string;
  lokasi: string;
  current_step: number;
  status: string;
  nilai_buku: number;
  harga_tafsiran: number;
  konversi_kg: number;

  // Surat-surat
  no_surat_ae1: string;
  no_surat_ae2: string;
  no_surat_attb: string;
  no_surat_ae3: string;
  no_surat_ae4: string;
  no_surat_sk: string;

  keterangan: string;
  created_at: string;
}

export default function MonitoringTablePage() {
  const [data, setData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: assets, error } = await supabase
        .from("attb_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(assets || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memuat data monitoring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Aset");
    XLSX.writeFile(
      workbook,
      `Monitoring_Aset_${new Date().toISOString()}.xlsx`,
    );
  };

  // --- HELPER UNTUK LABEL STATUS SINGKAT ---
  const getShortStatus = (step: number) => {
    if (step === 5) return "Selesai";
    return `AE ${step}`;
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-pln-primary">
            Monitoring Data Master
          </h1>
          <p className="text-gray-500 text-sm">
            Rekapitulasi seluruh aset ATTB dalam format tabel besar.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="p-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 text-sm font-bold text-white bg-green-600 px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition-all active:scale-95"
          >
            <Download size={18} /> Download Excel
          </button>
        </div>
      </div>

      {/* TABLE WRAPPER (SCROLLABLE) */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-xl shadow-sm bg-white relative custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <Loader2 className="animate-spin text-pln-primary" size={48} />
            <p className="text-gray-400 font-medium">Memuat data tabel...</p>
          </div>
        ) : (
          <table className="min-w-[3000px] w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-20 shadow-sm uppercase text-xs tracking-wider">
              <tr>
                {/* Sticky Column No */}
                <th className="p-5 border-b w-16 text-center sticky left-0 z-30 bg-gray-100 border-r border-gray-200">
                  No
                </th>

                <th className="p-5 border-b w-40">No. Aset (SAP)</th>

                {/* --- PINDAH KE SINI: KOLOM ATTB --- */}
                <th className="p-5 border-b w-48 bg-cyan-50/50 text-cyan-800 border-x border-gray-200">
                  No. Surat ATTB
                </th>

                <th className="p-5 border-b w-64">Kategori Aset</th>
                <th className="p-5 border-b w-56">Merk / Type</th>
                <th className="p-5 border-b w-56">Lokasi</th>

                {/* Header Status */}
                <th className="p-5 border-b w-32 text-center">Status</th>

                <th className="p-5 border-b w-40 text-right">Nilai Buku</th>
                <th className="p-5 border-b w-40 text-right">Nilai Tafsiran</th>
                <th className="p-5 border-b w-32 text-center">Berat (Kg)</th>

                {/* KOLOM SURAT-SURAT LAINNYA */}
                <th className="p-5 border-b w-48 bg-blue-50/30">
                  No. Surat AE-1
                </th>
                <th className="p-5 border-b w-48 bg-purple-50/30">
                  No. Surat AE-2
                </th>
                <th className="p-5 border-b w-48 bg-yellow-50/30">
                  No. Surat AE-3
                </th>
                <th className="p-5 border-b w-48 bg-orange-50/30">
                  No. Surat AE-4
                </th>
                <th className="p-5 border-b w-48 bg-green-50/30">
                  No. Surat SK
                </th>
                <th className="p-5 border-b min-w-[300px]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Sticky Column No */}
                  <td className="p-5 text-center text-gray-500 font-medium sticky left-0 z-10 bg-white group-hover:bg-blue-50/30 border-r border-gray-100">
                    {i + 1}
                  </td>

                  <td className="p-5 font-mono font-bold text-pln-primary">
                    <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {item.no_aset}
                    </span>
                  </td>

                  {/* --- PINDAH KE SINI: DATA ATTB --- */}
                  <td className="p-5 text-xs font-mono text-cyan-700 font-bold bg-cyan-50/20 border-x border-gray-100">
                    {item.no_surat_attb || "-"}
                  </td>

                  <td className="p-5 font-medium text-gray-800 text-base">
                    {item.jenis_aset}
                  </td>
                  <td className="p-5 text-gray-600">{item.merk_type}</td>
                  <td className="p-5 text-gray-600 flex items-center gap-1">
                    📍 {item.lokasi}
                  </td>

                  {/* Status Badge */}
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-sm whitespace-nowrap ${
                        item.current_step === 1
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : item.current_step === 2
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : item.current_step === 3
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : item.current_step === 4
                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {getShortStatus(item.current_step)}
                    </span>
                  </td>

                  <td className="p-5 text-right font-mono text-gray-600">
                    {formatRupiah(item.nilai_buku || 0)}
                  </td>
                  <td className="p-5 text-right font-mono font-bold text-pln-gold text-base">
                    {formatRupiah(item.harga_tafsiran || 0)}
                  </td>
                  <td className="p-5 text-center text-gray-600 font-medium">
                    {item.konversi_kg} kg
                  </td>

                  {/* Kolom Surat */}
                  <td className="p-5 text-xs font-mono text-gray-600 bg-blue-50/10 border-l border-gray-50">
                    {item.no_surat_ae1 || "-"}
                  </td>
                  <td className="p-5 text-xs font-mono text-gray-600 bg-purple-50/10 border-l border-gray-50">
                    {item.no_surat_ae2 || "-"}
                  </td>
                  <td className="p-5 text-xs font-mono text-gray-600 bg-yellow-50/10 border-l border-gray-50">
                    {item.no_surat_ae3 || "-"}
                  </td>
                  <td className="p-5 text-xs font-mono text-gray-600 bg-orange-50/10 border-l border-gray-50">
                    {item.no_surat_ae4 || "-"}
                  </td>
                  <td className="p-5 text-xs font-mono text-gray-600 bg-green-50/10 border-l border-gray-50">
                    {item.no_surat_sk || "-"}
                  </td>

                  <td
                    className="p-5 text-gray-500 text-sm italic max-w-[300px] truncate"
                    title={item.keterangan}
                  >
                    {item.keterangan || "-"}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={16}
                    className="p-12 text-center text-gray-400 bg-gray-50 italic border-t border-gray-100"
                  >
                    <p className="text-lg font-medium mb-1">Belum ada data</p>
                    <p className="text-sm">
                      Silakan input atau import data Excel terlebih dahulu.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
