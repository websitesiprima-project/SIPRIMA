"use client";
import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// --- Interfaces ---
interface Letter {
  id?: number;
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

// ✅ PERBAIKAN: Definisi Tipe Data Strict untuk Grafik
// Harus sesuai dengan yang diminta AnalyticsCharts.tsx (Wajib number, bukan optional)
interface AnalyticsSummary {
  total_surat: number;
  total_nominal: number;
  total_expired: number;
}

interface PieData {
  name: string;
  value: number; // ⚠️ WAJIB NUMBER (jangan pakai ?)
  color: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface BarData {
  name: string;
  total: number; // ⚠️ WAJIB NUMBER (jangan pakai ?)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  pie_chart: PieData[];
  bar_chart: BarData[];
}

export default function Dashboard() {
  const router = useRouter();

  // --- DATA STATE ---
  const [letters, setLetters] = useState<Letter[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // --- UI STATE ---
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [showQR, setShowQR] = useState<Letter | null>(null);

  // Variable loading untuk tombol delete
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Jaminan Pelaksanaan");
  const [searchTerm, setSearchTerm] = useState("");

  // --- CHECKLIST STATE ---
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://sijagad-monitoring.vercel.app/";

  // --- FETCHING DATA ---
  const fetchLetters = useCallback(async () => {
    const res = await fetch(`${API_URL}/letters`);
    if (res.ok) setLetters(await res.json());
  }, [API_URL]);

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`${API_URL}/logs`);
    if (res.ok) setLogs(await res.json());
  }, [API_URL]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (res.ok) setAnalyticsData(await res.json());
    } catch (error) {
      console.error("Gagal load analytics", error);
    }
  }, [API_URL]);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }
        setUserEmail(user.email || "Unknown");
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role === "admin") setIsAdmin(true);

        await fetchLetters();
        await fetchAnalytics();
      } finally {
        setTimeout(() => setIsPageLoading(false), 800);
      }
    };
    init();
  }, [router, fetchLetters, fetchAnalytics]);

  useEffect(() => {
    if (showLogs) fetchLogs();
  }, [showLogs, fetchLogs]);

  // --- ACTIONS ---
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    const toastId = toast.loading("Menghapus...");
    try {
      const res = await fetch(
        `${API_URL}/letters/${id}?user_email=${userEmail}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchLetters();
        fetchAnalytics();
        toast.success("Terhapus", { id: toastId });
        setSelectedIds((prev) => prev.filter((pid) => pid !== id));
      }
    } catch {
      toast.error("Gagal", { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Yakin ingin menghapus ${selectedIds.length} surat yang dipilih?`
      )
    )
      return;

    const toastId = toast.loading(`Menghapus ${selectedIds.length} data...`);
    setLoading(true);

    try {
      const deletePromises = selectedIds.map((id) =>
        fetch(`${API_URL}/letters/${id}?user_email=${userEmail}`, {
          method: "DELETE",
        })
      );
      await Promise.all(deletePromises);
      await fetchLetters();
      await fetchAnalytics();
      setSelectedIds([]);
      toast.success("Data berhasil dihapus!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal hapus massal", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedLetters.map((l) => l.id as number);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = () => {
    window.open(`${API_URL}/export/excel`, "_blank");
  };

  const filteredLetters = letters.filter(
    (l) =>
      l.kategori === activeTab &&
      (l.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.lokasi && l.lokasi.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const paginatedLetters = filteredLetters;
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  if (isPageLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 animate-in fade-in duration-700 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11">
            <Image
              src="/SiJAGAD_2.svg"
              alt="Logo SiJAGAD"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary font-display">
              SiJAGAD
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
              PLN UPT MANADO
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/guide"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <BookOpen size={18} /> Panduan Sistem
          </Link>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            document.cookie = "token=; path=/; max-age=0";
            router.push("/");
          }}
          className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* ANALYTICS */}
        {analyticsData ? (
          <AnalyticsCharts data={analyticsData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="bg-gray-200/50 p-1.5 rounded-2xl flex gap-2">
            {["Jaminan Pelaksanaan", "Jaminan Pemeliharaan"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIds([]);
                }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari Vendor atau Lokasi..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleExport}
              className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-600 hover:bg-green-100 transition-colors flex items-center gap-2"
            >
              <FileDown size={20} />{" "}
              <span className="hidden md:inline font-bold text-xs uppercase">
                Excel
              </span>
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-primary transition-colors"
            >
              <History size={20} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[700px]">
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 bg-gray-50 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                      onChange={toggleSelectAll}
                      checked={
                        paginatedLetters.length > 0 &&
                        selectedIds.length === paginatedLetters.length
                      }
                    />
                  </th>
                  <th className="px-6 py-4 bg-gray-50">Vendor & Bank</th>
                  <th className="px-6 py-4 bg-gray-50">Nominal</th>
                  <th className="px-6 py-4 bg-gray-50">Lokasi Fisik</th>
                  <th className="px-6 py-4 bg-gray-50">Masa Berlaku</th>
                  <th className="px-6 py-4 bg-gray-50">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLetters.map((letter) => {
                  const end = new Date(letter.tanggal_akhir_garansi);
                  const diff = Math.ceil(
                    (end.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );
                  let statusColor = "bg-green-100 text-green-700";
                  let statusLabel = "Aktif";
                  if (diff <= 0) {
                    statusColor = "bg-red-500 text-white";
                    statusLabel = "EXPIRED";
                  } else if (diff <= 7) {
                    statusColor = "bg-orange-500 text-white animate-pulse";
                    statusLabel = `${diff} Hari Lagi`;
                  } else if (diff <= 30) {
                    statusColor = "bg-yellow-400 text-gray-900";
                    statusLabel = "Segera Expire";
                  }
                  const isSelected = selectedIds.includes(letter.id!);

                  return (
                    <tr
                      key={letter.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(letter.id!)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {letter.vendor}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                          <Building2 size={10} /> {letter.bank_penerbit}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {formatRupiah(letter.nominal_jaminan)}
                      </td>
                      <td className="px-6 py-4">
                        {letter.lokasi === "Arsip Lama" ? (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-slate-500 px-3 py-1.5 rounded-full w-fit shadow-sm">
                            <MapPin size={12} /> ARSIP LAMA
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                            <MapPin size={12} className="text-orange-500" />{" "}
                            {letter.lokasi || "-"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 mb-1 ${statusColor}`}
                        >
                          <Clock size={10} /> {statusLabel}
                        </div>
                        <div className="text-[10px] text-gray-400 block italic">
                          {letter.tanggal_akhir_garansi}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              {/* 🔄 TOMBOL EDIT: PINDAH KE HALAMAN BARU */}
                              <Link
                                href={`/dashboard/input?id=${letter.id}`}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(letter.id!)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={() => setShowQR(letter)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Cetak QR Arsip"
                              >
                                <QrCode size={16} />
                              </button>
                            </>
                          )}
                          {letter.file_url && (
                            <a
                              href={letter.file_url}
                              target="_blank"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Paperclip size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {paginatedLetters.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Tidak ada data ditemukan
              </div>
            )}
          </div>
        </div>

        {/* BULK ACTION & ADD BUTTON */}
        <AnimatePresence>
          {isAdmin && selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50"
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedIds.length}
                </div>
                <span className="text-sm font-bold text-gray-700">Dipilih</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>

              {/* ✅ MENGGUNAKAN LOADING STATE */}
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />{" "}
                {loading ? "Menghapus..." : "Hapus Terpilih"}
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔄 TOMBOL TAMBAH: PINDAH KE HALAMAN BARU */}
        {isAdmin && (
          <Link href="/dashboard/input">
            <button className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40">
              <Plus size={24} />
            </button>
          </Link>
        )}
      </main>

      {/* MODAL QR CODE */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 print:bg-white print:p-0">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full flex flex-col items-center shadow-2xl print:shadow-none print:w-[70mm] print:h-[100mm] print:p-0 print:m-0"
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: ` @media print { body * { visibility: hidden; } .shopee-label, .shopee-label * { visibility: visible; } .shopee-label { position: fixed; left: 0; top: 0; width: 70mm !important; height: 100mm !important; padding: 10mm; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white !important; } @page { size: 70mm 100mm; margin: 0; } .no-print { display: none !important; } } `,
                }}
              />
              <div className="shopee-label flex flex-col items-center w-full border-2 border-gray-100 p-6 rounded-[24px] print:border-0">
                <div className="text-center mb-4">
                  <h3 className="font-extrabold text-xl text-slate-800 leading-tight">
                    QR Label Arsip
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                    SIJAGAD - PLN UPT MANADO
                  </p>
                </div>
                <div className="p-4 bg-white border-[3px] border-slate-900 rounded-2xl mb-5">
                  <QRCode
                    value={`SiJAGAD_ID:${showQR.id}_VENDOR:${showQR.vendor}`}
                    size={180}
                    level="H"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-lg font-black text-slate-900 uppercase leading-none break-words px-2">
                    {showQR.vendor}
                  </p>
                  <p className="text-sm text-slate-500 font-mono mt-2 tracking-widest border-t border-slate-100 pt-2">
                    {showQR.nomor_kontrak}
                  </p>
                  <div className="mt-3 bg-slate-900 text-white px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Lokasi :
                    </span>
                    <span className="text-sm font-black">
                      {showQR.lokasi || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full mt-8 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
                >
                  <Printer size={20} /> CETAK LABEL
                </button>
                <button
                  onClick={() => setShowQR(null)}
                  className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  BATAL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL LOGS */}
      <AnimatePresence>
        {showLogs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-primary">
                  <History size={20} /> Riwayat Aktivitas
                </h3>
                <button onClick={() => setShowLogs(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="text-sm border-b pb-3 last:border-0 border-gray-100"
                  >
                    <p className="font-bold text-gray-800">
                      {log.action} -{" "}
                      <span className="font-normal text-gray-600 italic tracking-tight">
                        {log.target}
                      </span>
                    </p>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-medium">
                      <span>{log.user_email}</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
