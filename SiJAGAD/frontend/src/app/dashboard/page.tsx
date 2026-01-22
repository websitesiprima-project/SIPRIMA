"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";
import AnalyticsCharts from "../../components/AnalyticsCharts";
import {
  LogOut,
  Plus,
  Trash2,
  X,
  Search,
  Paperclip,
  Edit,
  History,
  MapPin,
  Clock,
  QrCode,
  Printer,
  Building2,
  FileDown,
  BookOpen,
  FileText,
  Filter, // Icon baru untuk Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// --- 1. DEFINISI TIPE DATA ---

interface Letter {
  id: number;
  vendor: string;
  pekerjaan: string;
  nomor_kontrak: string;
  tanggal_awal_kontrak: string;
  nominal_jaminan: number;
  jenis_garansi: string;
  nomor_garansi: string;
  bank_penerbit: string;
  tanggal_awal_garansi: string;
  tanggal_akhir_garansi: string;
  status: string;
  kategori: string;
  file_url?: string | null;
  lokasi?: string | null;
}

interface Log {
  id: number;
  user_email: string;
  action: string;
  target: string;
  created_at: string;
}

interface PieChartItem {
  name: string;
  value: number;
  color: string;
}

interface BarChartItem {
  name: string;
  total: number;
}

interface AnalyticsData {
  summary: {
    total_surat: number;
    total_nominal: number;
    total_expired: number;
  };
  pie_chart: PieChartItem[];
  bar_chart: BarChartItem[];
}

export default function Dashboard() {
  const router = useRouter();

  // --- 2. STATE MANAGEMENT ---
  const [letters, setLetters] = useState<Letter[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  // Analytics kita hitung di Frontend biar sinkron
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  // User State
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  // UI State
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [showQR, setShowQR] = useState<Letter | null>(null);
  const [processing, setProcessing] = useState(false);

  // Tab & Filter State
  const [activeTab, setActiveTab] = useState("Jaminan Pelaksanaan");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 STATE BARU: Filter Status
  const [filterStatus, setFilterStatus] = useState("Semua"); // Semua, Aktif, Expired, Selesai

  // Checkbox State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // API URL Config
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- 3. HELPER: HITUNG STATUS REAL-TIME ---
  // Fungsi ini menentukan status berdasarkan Tanggal, BUKAN database text semata.
  const getRealStatus = (letter: Letter) => {
    // 1. Jika di database sudah ditandai "Selesai", maka statusnya Selesai (Override tanggal)
    if (letter.status?.toLowerCase() === "selesai") return "Selesai";

    // 2. Cek Tanggal untuk Expired/Aktif
    const endDate = new Date(letter.tanggal_akhir_garansi);
    const isValidDate = !isNaN(endDate.getTime());

    // Jika tanggal error, anggap aktif saja biar aman
    if (!isValidDate) return "Aktif";

    const diff = Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
    );

    if (diff <= 0) return "Expired";
    return "Aktif";
  };

  // --- 4. FETCH DATA ---

  const fetchData = useCallback(async () => {
    try {
      // Fetch Surat
      const resLetters = await fetch(`${API_URL}/letters`);
      if (resLetters.ok) {
        const rawData = await resLetters.json();
        const cleanData = rawData.filter(
          (item: Letter) => item.id !== null && item.id !== undefined,
        );
        setLetters(cleanData);
      }

      // Fetch Logs
      const resLogs = await fetch(`${API_URL}/logs`);
      if (resLogs.ok) setLogs(await resLogs.json());
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal terhubung ke server backend");
    }
  }, [API_URL]);

  // --- 5. LOGIKA SINKRONISASI CHART (USEMEMO) ---
  // Kita hitung Chart DI SINI, berdasarkan data 'letters' yang sudah diambil.
  // Jadi tabel dan chart pasti 100% sama datanya.

  useMemo(() => {
    if (letters.length === 0) return;

    let totalNominal = 0;
    let countExpired = 0;
    const statusCounts: Record<string, number> = {
      Aktif: 0,
      Expired: 0,
      Selesai: 0,
    };
    const vendorStats: Record<string, number> = {};

    letters.forEach((l) => {
      // Gunakan Helper Real Status agar konsisten dengan Tabel
      const realStatus = getRealStatus(l);

      // Update Count
      statusCounts[realStatus] = (statusCounts[realStatus] || 0) + 1;
      if (realStatus === "Expired") countExpired++;

      // Update Nominal
      totalNominal += Number(l.nominal_jaminan) || 0;

      // Update Vendor Stats (Top 5)
      vendorStats[l.vendor] =
        (vendorStats[l.vendor] || 0) + Number(l.nominal_jaminan);
    });

    // Format Data untuk Chart Component
    const pieData: PieChartItem[] = [
      { name: "Aktif", value: statusCounts["Aktif"], color: "#10B981" }, // Hijau
      { name: "Expired", value: statusCounts["Expired"], color: "#EF4444" }, // Merah
      { name: "Selesai", value: statusCounts["Selesai"], color: "#3B82F6" }, // Biru
    ].filter((d) => d.value > 0);

    const barData: BarChartItem[] = Object.entries(vendorStats)
      .sort(([, a], [, b]) => b - a) // Urutkan terbesar
      .slice(0, 5) // Ambil 5 teratas
      .map(([name, total]) => ({ name: name.substring(0, 15) + "...", total }));

    setAnalyticsData({
      summary: {
        total_surat: letters.length,
        total_nominal: totalNominal,
        total_expired: countExpired,
      },
      pie_chart: pieData,
      bar_chart: barData,
    });
  }, [letters]);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/auth");
          return;
        }
        setUserEmail(user.email || "Unknown");
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role === "admin") setIsAdmin(true);

        await fetchData();
        setIsPageLoading(false);
      } catch (error) {
        console.error("Init Error:", error);
        setIsPageLoading(false);
      }
    };
    init();
  }, [router, fetchData]);

  // --- 6. LOGIKA FILTERING UTAMA ---

  const filteredLetters = letters.filter((l) => {
    // 1. Filter Tab (Kategori)
    const categoryMatch = l.kategori?.toLowerCase() === activeTab.toLowerCase();

    // 2. Filter Status (Aktif/Expired/Selesai)
    // Kita gunakan getRealStatus agar logicnya SAMA PERSIS dengan warna tabel
    const currentStatus = getRealStatus(l);
    let statusMatch = true;
    if (filterStatus !== "Semua") {
      statusMatch = currentStatus === filterStatus;
    }

    // 3. Filter Search
    const term = searchTerm.toLowerCase();
    const searchMatch =
      l.vendor.toLowerCase().includes(term) ||
      l.pekerjaan.toLowerCase().includes(term) ||
      l.nomor_kontrak.toLowerCase().includes(term) ||
      (l.lokasi && l.lokasi.toLowerCase().includes(term));

    return categoryMatch && statusMatch && searchMatch;
  });

  // --- 7. LOGIKA CHECKBOX ---

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredLetters.map((l) => l.id);
      setSelectedIds(visibleIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // --- 8. ACTIONS ---

  const handleDelete = async (id: number) => {
    if (!id) {
      toast.error("Data korup (ID Kosong), tidak bisa dihapus.");
      return;
    }
    if (!confirm("Yakin ingin menghapus data ini secara permanen?")) return;

    setProcessing(true);
    const toastId = toast.loading("Menghapus...");

    try {
      const res = await fetch(
        `${API_URL}/letters/${id}?user_email=${userEmail}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        await fetchData();
        toast.success("Data terhapus", { id: toastId });
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        throw new Error("Gagal menghapus");
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus (Cek Server)", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Yakin hapus ${selectedIds.length} data terpilih?`)) return;

    setProcessing(true);
    const toastId = toast.loading("Menghapus massal...");

    try {
      const promises = selectedIds.map((id) =>
        fetch(`${API_URL}/letters/${id}?user_email=${userEmail}`, {
          method: "DELETE",
        }),
      );
      await Promise.all(promises);

      await fetchData();
      setSelectedIds([]);
      toast.success("Berhasil dihapus!", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Gagal hapus massal", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    window.open(`${API_URL}/export/excel`, "_blank");
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  // --- 9. RENDER UI ---

  if (isPageLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 font-medium animate-pulse">
          Memuat Sistem...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      <Toaster position="top-center" reverseOrder={false} />

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/SiJAGAD_2.svg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              SiJAGAD
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              PLN UPT MANADO
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/guide"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 px-4 py-2 rounded-xl border border-slate-200"
          >
            <BookOpen size={18} /> Panduan
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              document.cookie = "token=; path=/; max-age=0";
              router.replace("/");
            }}
            className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8 mt-2">
        {/* ANALYTICS CHARTS (Sekarang Sinkron!) */}
        {analyticsData ? (
          <AnalyticsCharts data={analyticsData} />
        ) : (
          <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse">
            Sedang menghitung grafik real-time...
          </div>
        )}

        {/* --- CONTROLS SECTION --- */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
          {/* TAB SWITCHER */}
          <div className="bg-white p-1.5 rounded-2xl flex gap-1 border border-slate-200 shadow-sm w-full lg:w-auto overflow-x-auto">
            {["Jaminan Pelaksanaan", "Jaminan Pemeliharaan"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIds([]);
                }}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER TOOLS */}
          <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
            {/* 🔥 FILTER DROPDOWN STATUS 🔥 */}
            <div className="relative w-full lg:w-48">
              <Filter
                className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"
                size={18}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-sm font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">✅ Hanya Aktif</option>
                <option value="Expired">🚨 Hanya Expired</option>
                <option value="Selesai">🏁 Selesai</option>
              </select>
              {/* Panah Dropdown Custom */}
              <div className="absolute right-4 top-4 pointer-events-none">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-400"></div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full lg:w-80">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari Vendor, No. Kontrak..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* EXPORT BUTTON */}
            <button
              onClick={handleExport}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shadow-sm flex-1 lg:flex-none"
              title="Download Excel"
            >
              <FileDown size={20} />{" "}
              <span className="hidden xl:inline font-bold text-xs">EXCEL</span>
            </button>

            {/* LOG BUTTON */}
            <button
              onClick={() => setShowLogs(true)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm flex-1 lg:flex-none flex justify-center"
              title="Log Aktivitas"
            >
              <History size={20} />
            </button>
          </div>
        </div>

        {/* --- MAIN TABLE --- */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col min-h-[500px] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100 shadow-sm">
                <tr className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-5 w-14 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={toggleSelectAll}
                      checked={
                        filteredLetters.length > 0 &&
                        selectedIds.length === filteredLetters.length
                      }
                    />
                  </th>
                  <th className="px-6 py-5">Vendor & Kontrak</th>
                  <th className="px-6 py-5">Nominal Jaminan</th>
                  <th className="px-6 py-5">Lokasi Fisik</th>
                  <th className="px-6 py-5">Status & Masa Berlaku</th>
                  <th className="px-6 py-5 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLetters.length > 0 ? (
                  filteredLetters.map((letter) => {
                    const endDate = new Date(letter.tanggal_akhir_garansi);
                    const isValidDate = !isNaN(endDate.getTime());
                    const diff = isValidDate
                      ? Math.ceil(
                          (endDate.getTime() - new Date().getTime()) /
                            (1000 * 3600 * 24),
                        )
                      : 999;

                    // LOGIC WARNA (Sama persis dengan getRealStatus)
                    let statusColor =
                      "bg-emerald-100 text-emerald-700 border-emerald-200";
                    let statusLabel = "AKTIF";
                    let statusIcon = <Clock size={12} />;

                    // Cek Override dari Database dulu
                    if (letter.status?.toLowerCase() === "selesai") {
                      statusColor = "bg-blue-100 text-blue-700 border-blue-200";
                      statusLabel = "SELESAI";
                      statusIcon = (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      );
                    }
                    // Jika belum selesai, cek tanggal
                    else if (diff <= 0) {
                      statusColor = "bg-red-50 text-red-600 border-red-200";
                      statusLabel = "EXPIRED";
                    } else if (diff <= 30) {
                      statusColor =
                        "bg-amber-50 text-amber-600 border-amber-200";
                      statusLabel = diff <= 7 ? "KRITIS" : "WARNING";
                      statusIcon = (
                        <Clock size={12} className="animate-pulse" />
                      );
                    }

                    const isSelected = selectedIds.includes(letter.id);

                    return (
                      <tr
                        key={letter.id}
                        className={`group transition-colors ${
                          isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(letter.id)}
                          />
                        </td>

                        {/* Vendor Info & No Kontrak */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm mb-1">
                            {letter.vendor}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono mb-2 bg-blue-50 border border-blue-100 px-2 py-1 rounded w-fit">
                            <FileText size={12} className="text-blue-500" />
                            {letter.nomor_kontrak}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-lg w-fit">
                            <Building2 size={12} /> {letter.bank_penerbit}
                          </div>
                          <div
                            className="text-[10px] text-slate-400 mt-2 truncate max-w-[220px]"
                            title={letter.pekerjaan}
                          >
                            {letter.pekerjaan}
                          </div>
                        </td>

                        {/* Nominal */}
                        <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                          {formatRupiah(letter.nominal_jaminan)}
                        </td>

                        {/* Lokasi */}
                        <td className="px-6 py-4">
                          {letter.lokasi === "Arsip Lama" ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-slate-500 px-2.5 py-1 rounded-full shadow-sm">
                              <MapPin size={10} /> ARSIP LAMA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                              <MapPin size={12} className="text-orange-500" />
                              <span className="font-medium">
                                {letter.lokasi || "-"}
                              </span>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${statusColor} mb-1.5`}
                          >
                            {statusIcon} {statusLabel}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex flex-col">
                            <span>Exp: {letter.tanggal_akhir_garansi}</span>
                            {/* Hitung diff hanya jika belum Selesai dan belum Expired yang parah */}
                            {diff > 0 &&
                              diff <= 30 &&
                              statusLabel !== "SELESAI" && (
                                <span className="text-orange-500 font-bold text-[10px]">
                                  ({diff} Hari Lagi)
                                </span>
                              )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2 opacity-100">
                            <Link
                              href={`/dashboard/input?id=${letter.id}`}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100"
                              title="Edit Data"
                            >
                              <Edit size={16} />
                            </Link>

                            <button
                              onClick={() => handleDelete(letter.id)}
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                              title="Hapus"
                              disabled={processing}
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              onClick={() => setShowQR(letter)}
                              className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-purple-100"
                              title="Cetak QR"
                            >
                              <QrCode size={16} />
                            </button>

                            {letter.file_url && (
                              <a
                                href={letter.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100"
                                title="Download PDF"
                              >
                                <Paperclip size={16} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Search size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-bold text-slate-400">
                          Tidak ada data ditemukan
                        </p>
                        <p className="text-xs max-w-xs mx-auto mt-2">
                          Coba ubah filter <strong>{filterStatus}</strong> atau
                          kategori <strong>{activeTab}</strong>.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- BULK ACTION BAR --- */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white shadow-2xl rounded-full px-8 py-4 flex items-center gap-6 z-50 border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-slate-200">
                  {selectedIds.length}
                </div>
                <span className="text-sm font-bold tracking-wide">
                  Data Terpilih
                </span>
              </div>

              <div className="h-8 w-px bg-slate-700"></div>

              <button
                onClick={handleBulkDelete}
                disabled={processing}
                className="text-red-400 hover:text-red-300 font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : (
                  <>
                    <Trash2 size={18} /> Hapus Masal
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-500 hover:text-white transition-colors ml-2 bg-slate-800 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <Link href="/dashboard/input">
          <button
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-5 rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] hover:scale-110 hover:bg-blue-700 transition-all z-40 group flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
            title="Tambah Data Baru"
          >
            <Plus
              size={32}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </Link>
      </main>

      {/* --- MODAL QR CODE --- */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 print:bg-white print:p-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full flex flex-col items-center shadow-2xl print:shadow-none print:w-[70mm] print:h-[100mm] print:p-0 print:m-0 border border-slate-200"
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: ` @media print { body * { visibility: hidden; } .shopee-label, .shopee-label * { visibility: visible; } .shopee-label { position: fixed; left: 0; top: 0; width: 70mm !important; height: 100mm !important; padding: 10mm; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white !important; } @page { size: 70mm 100mm; margin: 0; } .no-print { display: none !important; } } `,
                }}
              />

              <div className="shopee-label flex flex-col items-center w-full border-2 border-slate-100 p-6 rounded-[24px] print:border-0 bg-slate-50/50">
                <div className="text-center mb-6">
                  <h3 className="font-black text-2xl text-slate-900 leading-tight tracking-tight">
                    QR ARSIP
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-1">
                    PLN UPT MANADO
                  </p>
                </div>
                <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl mb-6 shadow-sm">
                  <QRCode
                    value={
                      showQR.file_url ||
                      `SiJAGAD_ID:${showQR.id}_VENDOR:${showQR.vendor}`
                    }
                    size={160}
                    level="H"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-lg font-black text-slate-900 uppercase leading-none break-words px-2">
                    {showQR.vendor}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-3 tracking-wider border-t border-slate-200 pt-3">
                    {showQR.nomor_kontrak}
                  </p>
                  <div className="mt-4 bg-slate-900 text-white px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-lg shadow-slate-900/20">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">
                      LOKASI
                    </span>
                    <span className="text-sm font-black">
                      {showQR.lokasi || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full mt-8 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
                >
                  <Printer size={18} /> CETAK
                </button>
                <button
                  onClick={() => setShowQR(null)}
                  className="flex-1 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL LOGS --- */}
      <AnimatePresence>
        {showLogs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 text-lg">
                  <History size={20} className="text-blue-600" /> Riwayat
                  Aktivitas
                </h3>
                <button
                  onClick={() => setShowLogs(false)}
                  className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            log.action === "DELETE"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mt-1">
                        {log.target}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>{" "}
                        {log.user_email}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    Belum ada riwayat aktivitas.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
