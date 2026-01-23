"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AssetHistory from "../../../components/AssetHistory";
import { supabase } from "../../../lib/supabaseClient";
import StatusTracker from "../../../components/StatusTracker";
import {
  Search,
  Info,
  Loader2,
  Edit,
  Activity,
  Image as ImageIcon,
  Maximize2,
  Package,
  Trash2,
  Save,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  X,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AssetDocument } from "../../../components/AssetDocument";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dynamic from "next/dynamic";

// --- LAZY LOAD CHART ---
const DistributionChart = dynamic(
  () =>
    import("../../../components/DashboardCharts").then(
      (mod) => mod.DistributionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);

const CompositionChart = dynamic(
  () =>
    import("../../../components/DashboardCharts").then(
      (mod) => mod.CompositionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-full" />
    ),
  },
);

// KATEGORI ASET (Sekarang akan dipakai di form Edit)
const ASSET_CATEGORIES = [
  "Trafo Tenaga (Power Transformer)",
  "PMT (Pemutus Tenaga / Circuit Breaker)",
  "PMS (Pemisah / Disconnector)",
  "Instrument Transformer (CT / PT)",
  "Lightning Arrester (LA)",
  "Kubikel 20kV & Panel Kontrol",
  "Baterai & Rectifier",
  "Serandang & Isolator",
  "Kendaraan Bermotor",
  "Peralatan Kantor & Inventaris",
];

const STATUS_OPTIONS = [
  {
    step: 1,
    label: "Tahap 1: BA Hasil Penelitian (AE-1)",
    code: "AE-1",
    dbCol: "no_surat_ae1",
  },
  {
    step: 2,
    label: "Tahap 2: Penetapan Penarikan (AE-2)",
    code: "AE-2",
    dbCol: "no_surat_ae2",
  },
  {
    step: 3,
    label: "Tahap 3: Usulan Penarikan (AE-3)",
    code: "AE-3",
    dbCol: "no_surat_ae3",
  },
  {
    step: 4,
    label: "Tahap 4: BA Penelitian (AE-4)",
    code: "AE-4",
    dbCol: "no_surat_ae4",
  },
  {
    step: 5,
    label: "Tahap 5: Penghapusan Selesai",
    code: "Selesai",
    dbCol: "no_surat_sk",
  },
];

interface AssetData {
  id: string;
  no_aset: string;
  created_at: string;
  jenis_aset: string;
  merk_type: string;
  lokasi: string;
  current_step: number;
  jumlah: number;
  satuan: string;
  keterangan?: string;
  nilai_buku?: number;
  nilai_perolehan?: number;
  harga_tafsiran?: number;
  spesifikasi?: string;
  foto_url?: string;
  konversi_kg?: number;
  no_surat_ae1?: string;
  no_surat_ae2?: string;
  no_surat_ae3?: string;
  no_surat_ae4?: string;
  no_surat_sk?: string;
}

interface ChartData {
  name: string;
  count?: number;
  value?: number;
  [key: string]: string | number | undefined;
}

export default function TrackingPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal & Chart State
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isGuideModalOpen, setGuideModalOpen] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [suratInput, setSuratInput] = useState("");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<ChartData[]>([]);

  const selectedAssetIdRef = useRef<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AssetData>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    selectedAssetIdRef.current = selectedAsset?.id || null;
  }, [selectedAsset]);

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

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("attb_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as AssetData[];
      setAssets(typedData);

      const stepCounts = [0, 0, 0, 0, 0];
      typedData.forEach((item) => {
        const step = item.current_step || 1;
        if (step >= 1 && step <= 5) stepCounts[step - 1]++;
      });

      setChartData([
        { name: "AE-1", count: stepCounts[0] },
        { name: "AE-2", count: stepCounts[1] },
        { name: "AE-3", count: stepCounts[2] },
        { name: "AE-4", count: stepCounts[3] },
        { name: "Selesai", count: stepCounts[4] },
      ]);

      const typeCounts: Record<string, number> = {};
      typedData.forEach((item) => {
        const type = item.jenis_aset || "Lainnya";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      setPieData(
        Object.keys(typeCounts).map((key) => ({
          name: key,
          value: typeCounts[key],
        })),
      );

      setLoading(false);

      const currentSelectedId = selectedAssetIdRef.current;
      if (currentSelectedId) {
        const updated = typedData.find((a) => a.id === currentSelectedId);
        if (updated) {
          setSelectedAsset((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(updated))
              return updated;
            return prev;
          });
        }
      } else if (typedData.length > 0 && window.innerWidth >= 1024) {
        if (!selectedAssetIdRef.current) setSelectedAsset(typedData[0]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error(`Gagal ambil data`);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAssets = assets.filter((asset) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (asset.jenis_aset || "").toLowerCase().includes(searchLower) ||
      (asset.merk_type || "").toLowerCase().includes(searchLower) ||
      (asset.no_aset || "").toLowerCase().includes(searchLower) ||
      (asset.lokasi || "").toLowerCase().includes(searchLower)
    );
  });

  const initiateStatusChange = (newStep: number) => {
    if (!selectedAsset) return;
    if (newStep === selectedAsset.current_step) return;
    setPendingStep(newStep);
    setSuratInput("");
    setStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedAsset || !pendingStep) return;
    if (!suratInput.trim()) {
      toast.error("Nomor Surat wajib diisi!");
      return;
    }

    setUpdating(true);
    try {
      const stepConfig = STATUS_OPTIONS.find((s) => s.step === pendingStep);
      const columnToUpdate = stepConfig?.dbCol;

      const updatePayload: Record<string, string | number | undefined> = {
        current_step: pendingStep,
        status: stepConfig?.label,
      };

      if (columnToUpdate) {
        updatePayload[columnToUpdate] = suratInput;
      }

      const { error } = await supabase
        .from("attb_assets")
        .update(updatePayload)
        .eq("id", selectedAsset.id);

      if (error) throw error;

      toast.success(`Berhasil pindah ke ${stepConfig?.code}`);
      setStatusModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    if (!confirm("⚠️ PERINGATAN: Aset akan dihapus permanen. Lanjutkan?"))
      return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("attb_assets")
        .delete()
        .eq("id", selectedAsset.id);
      if (error) throw error;
      toast.success("Aset berhasil dihapus");
      setSelectedAsset(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus aset");
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = () => {
    if (!selectedAsset) return;
    setEditForm({ ...selectedAsset });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedAsset) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("attb_assets")
        .update(editForm)
        .eq("id", selectedAsset.id);
      if (error) throw error;
      toast.success("Data disimpan");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal simpan");
    } finally {
      setUpdating(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setUpdating(true);
      let dataToProcess = filteredAssets;
      if (selectedIds.size > 0) {
        dataToProcess = filteredAssets.filter((item) =>
          selectedIds.has(item.id),
        );
      }

      if (dataToProcess.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        setUpdating(false);
        return;
      }

      const response = await fetch("/Template_ATTB.xlsx");
      if (!response.ok) throw new Error("Template tidak ditemukan");
      const buffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("Sheet tidak ditemukan");

      worksheet.getColumn(20).width = 35;
      const startRow = 9;
      const rowStep = 3;

      for (let i = 0; i < dataToProcess.length; i++) {
        const item = dataToProcess[i];
        const currentRowNum = startRow + i * rowStep;
        const row = worksheet.getRow(currentRowNum);

        let finalJenisAset = item.jenis_aset;
        let finalSpesifikasi = item.spesifikasi || "-";
        const codeMatch = finalSpesifikasi.match(/^\[KODE:\s*(.*?)\]/);
        if (codeMatch) {
          finalJenisAset = codeMatch[1];
          finalSpesifikasi = finalSpesifikasi
            .replace(/^\[KODE:.*?\]\s*/, "")
            .trim();
        }

        row.getCell(2).value = i + 1;
        row.getCell(3).value = item.no_aset;
        row.getCell(4).value = finalJenisAset;
        row.getCell(5).value = item.merk_type;
        row.getCell(6).value = finalSpesifikasi;
        row.getCell(7).value = item.jumlah;
        row.getCell(8).value = item.satuan;
        row.getCell(9).value = item.konversi_kg || (item.jumlah || 0) * 100;
        row.getCell(10).value = new Date(item.created_at).getFullYear();
        row.getCell(12).value = item.nilai_perolehan || 0;
        row.getCell(14).value = item.nilai_buku || 0;
        row.getCell(16).value = 4300;
        row.getCell(17).value = item.harga_tafsiran || 0;
        row.getCell(18).value = item.lokasi;
        row.getCell(19).value = item.keterangan || "-";

        if (item.foto_url) {
          try {
            const imgRes = await fetch(item.foto_url);
            if (imgRes.ok) {
              const imgBuffer = await imgRes.arrayBuffer();
              const ext =
                item.foto_url.split(".").pop()?.split("?")[0] || "png";
              const imageId = workbook.addImage({
                buffer: imgBuffer,
                extension: ext === "jpg" || ext === "jpeg" ? "jpeg" : "png",
              });
              row.height = 100;
              const rowIndex = currentRowNum - 1;

              // FIX 1: Gunakan 'as any' untuk menenangkan TypeScript soal tipe Anchor ExcelJS
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const anchorTL = { col: 19.1, row: rowIndex + 0.1 } as any;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const anchorBR = { col: 19.9, row: rowIndex + 0.9 } as any;

              worksheet.addImage(imageId, {
                tl: anchorTL,
                br: anchorBR,
                editAs: "oneCell",
              });
              row.getCell(20).value = "";
            } else {
              row.getCell(20).value = "Gagal Load";
            }
          } catch (error) {
            console.error("Img Error:", error);
            row.getCell(20).value = "Error Img";
          }
        } else {
          row.getCell(20).value = "Tidak Ada Foto";
        }
        row.commit();
      }

      const buf = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buf]),
        `Laporan_ATTB_FOTO_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success(`Export Selesai: ${dataToProcess.length} Aset`);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Gagal export excel");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-pln-primary" size={40} />
        <p className="ml-3 text-gray-500">Memuat data...</p>
      </div>
    );

  return (
    <div className="space-y-4 md:space-y-6 relative h-[calc(100vh-100px)]">
      {/* MODAL PANDUAN */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-pln-primary flex items-center gap-2">
                <BookOpen size={20} /> Panduan & SOP
              </h3>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 custom-scrollbar">
              <section>
                <h4 className="font-bold text-base mb-2 border-b pb-1 text-gray-800">
                  1. Pengertian & Syarat Penarikan
                </h4>
                <p className="mb-2">
                  <strong>ATTB (Aset Tetap Tidak Beroperasi)</strong> adalah
                  aset yang diperoleh tetapi tidak lagi digunakan dalam operasi
                  normal perusahaan.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs">
                  <strong>Syarat Penarikan:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Kondisi fisik rusak dan tidak ekonomis diperbaiki.</li>
                    <li>Penggantian teknologi / usang.</li>
                    <li>Relokasi aset.</li>
                    <li>Material kadaluwarsa / expired.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-base mb-3 border-b pb-1 text-gray-800">
                  2. Alur Proses Penghapusan (SOP)
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-pln-primary text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-bold">Inventarisasi UP (AE-1)</p>
                      <p className="text-xs text-gray-500">
                        Tim UP meneliti aset rusak. Output:{" "}
                        <strong>Berita Acara (AE-1)</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-pln-primary text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-bold">Penetapan UPI (AE-2)</p>
                      <p className="text-xs text-gray-500">
                        Tim UPI memverifikasi usulan. Output:{" "}
                        <strong>Penetapan Penarikan (AE-2)</strong>. Aset resmi
                        jadi ATTB.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-pln-primary text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-bold">Usulan Penarikan (AE-3)</p>
                      <p className="text-xs text-gray-500">
                        Tim UPI mengajukan usulan ke SPI untuk audit kelayakan.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-pln-primary text-white flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <p className="font-bold">
                        Review SPI & BA Penelitian (AE-4)
                      </p>
                      <p className="text-xs text-gray-500">
                        Penelitian bersama Tim UPI & SPI. Output:{" "}
                        <strong>AE-4</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-green-700">
                        Verifikasi Pusat & SK Penghapusan
                      </p>
                      <p className="text-xs text-gray-500">
                        Div. Akuntansi memproses SK Direksi / Persetujuan Dekom
                        / RUPS. Setelah SK terbit, aset dihapus (Write-off).
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-base mb-2 border-b pb-1 text-gray-800">
                  3. Kelengkapan Dokumen
                </h4>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>AE 1.1 / AE 2.1 / AE 4.1 (Lampiran Rincian Aset)</li>
                  <li>Foto Fisik Aset Terbaru</li>
                  <li>Kajian Teknis & Finansial</li>
                  <li>Pakta Integritas General Manager</li>
                </ul>
              </section>
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-4 py-2 bg-pln-primary text-white rounded-lg text-sm font-bold"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT SURAT */}
      {isStatusModalOpen && pendingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-t-4 border-pln-primary">
            <div className="flex items-center gap-3 mb-4 text-pln-primary">
              <div className="p-2 bg-blue-50 rounded-full">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Input Nomor Surat</h3>
                <p className="text-xs text-gray-500">
                  Sesuai Surat KDIV AKT No. 1624
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Dokumen Diperlukan
              </p>
              <p className="font-bold text-gray-800 text-sm">
                FORM {STATUS_OPTIONS.find((s) => s.step === pendingStep)?.code}
              </p>
              <p className="text-xs text-gray-600 mt-1 italic">
                {
                  STATUS_OPTIONS.find(
                    (s) => s.step === pendingStep,
                  )?.label.split(": ")[1]
                }
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-sm font-bold text-gray-700">
                Nomor Surat / Berita Acara{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={suratInput}
                onChange={(e) => setSuratInput(e.target.value)}
                placeholder="No. Surat..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pln-primary outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={!suratInput.trim() || updating}
                className="px-4 py-2 bg-pln-primary text-white font-bold rounded-lg hover:bg-pln-primary/90 flex items-center gap-2"
              >
                {updating && <Loader2 size={16} className="animate-spin" />}{" "}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end">
        <div>
          {selectedAsset && (
            <button
              onClick={() => setSelectedAsset(null)}
              className="lg:hidden mb-2 flex items-center gap-1 text-sm font-bold text-gray-500"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-pln-primary">
            Monitoring Aset
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            Tracking Progress AE-1 s/d AE-4
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setGuideModalOpen(true)}
            className="bg-blue-50 text-pln-primary border border-pln-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <BookOpen size={18} /> Panduan SOP
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* CHART SECTION */}
      {!selectedAsset && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">
              Distribusi Tahapan (AE 1-4)
            </h3>
            <DistributionChart data={chartData} />
          </div>
          <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">
              Komposisi Aset
            </h3>
            <CompositionChart data={pieData} />
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full pb-10">
        {/* LIST ASET (KIRI) */}
        <div
          className={`lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex-col h-full max-h-[800px] ${selectedAsset ? "hidden lg:flex" : "flex"}`}
        >
          <div className="p-4 border-b bg-gray-50 rounded-t-xl space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-pln-accent"
              />
            </div>
            {/* CHECKLIST ALL */}
            {filteredAssets.length > 0 && (
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedIds.size === filteredAssets.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-pln-primary rounded cursor-pointer"
                />
                <label
                  htmlFor="selectAll"
                  className="text-xs font-bold text-gray-600 cursor-pointer"
                >
                  Pilih Semua ({filteredAssets.length})
                </label>
              </div>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedAsset(asset);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg cursor-pointer border relative group flex gap-3 ${selectedAsset?.id === asset.id ? "bg-pln-primary/5 border-pln-primary/30" : "bg-white hover:bg-gray-50"}`}
              >
                {/* CHECKLIST INDIVIDUAL */}
                <div
                  className="flex items-center pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(asset.id)}
                    onChange={() => handleSelectOne(asset.id)}
                    className="w-4 h-4 text-pln-primary rounded cursor-pointer"
                  />
                </div>
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${asset.current_step === 5 ? "bg-green-500" : "bg-pln-gold"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 rounded border">
                      {asset.no_aset}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1">
                    {asset.jenis_aset}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {asset.merk_type || "-"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${asset.current_step === 5 ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      {STATUS_OPTIONS.find((s) => s.step === asset.current_step)
                        ?.code || `T${asset.current_step}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL ASET (KANAN) */}
        <div
          className={`lg:col-span-2 space-y-6 overflow-y-auto h-full max-h-[800px] custom-scrollbar pr-1 ${selectedAsset ? "block" : "hidden lg:block"}`}
        >
          {selectedAsset ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* HEADER DETAIL */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity size={18} className="text-pln-primary" /> Detail
                    Aset
                  </h3>
                  {isAdmin && !isEditing && (
                    <div className="flex gap-2">
                      {/* TOMBOL PDF KEMBALI */}
                      <PDFDownloadLink
                        document={<AssetDocument data={selectedAsset} />}
                        fileName={`BA_${selectedAsset.no_aset}.pdf`}
                        className="px-3 py-1.5 border rounded-lg text-blue-600 text-xs font-bold hover:bg-blue-50 flex gap-1"
                      >
                        <FileText size={14} /> BA PDF
                      </PDFDownloadLink>
                      <button
                        onClick={startEditing}
                        className="px-3 py-1.5 border rounded-lg text-gray-600 text-xs font-bold hover:bg-gray-50 flex gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1.5 border border-red-200 rounded-lg text-red-600 text-xs font-bold hover:bg-red-50 flex gap-1"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={saveEdit}
                        className="px-4 py-1.5 bg-pln-primary text-white text-xs font-bold rounded-lg flex gap-1"
                      >
                        <Save size={14} /> Simpan
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="col-span-2 text-xs font-bold text-yellow-700 uppercase">
                      Edit Data Teknis
                    </div>

                    {/* DROPDOWN KATEGORI (DIGUNAKAN) */}
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Jenis Aset
                      </label>
                      <select
                        value={editForm.jenis_aset}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            jenis_aset: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded text-sm bg-white"
                      >
                        {ASSET_CATEGORIES.map((cat, i) => (
                          <option key={i} value={cat.split(" (")[0]}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={editForm.merk_type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, merk_type: e.target.value })
                      }
                      className="w-full p-2 border rounded text-sm bg-white"
                      placeholder="Merk/Type"
                    />
                    <input
                      type="text"
                      value={editForm.lokasi}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lokasi: e.target.value })
                      }
                      className="w-full p-2 border rounded text-sm bg-white"
                      placeholder="Lokasi"
                    />
                    <input
                      type="number"
                      value={editForm.jumlah}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jumlah: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded text-sm bg-white"
                      placeholder="Jumlah"
                    />
                    <input
                      type="text"
                      value={editForm.satuan}
                      onChange={(e) =>
                        setEditForm({ ...editForm, satuan: e.target.value })
                      }
                      className="w-full p-2 border rounded text-sm bg-white"
                      placeholder="Satuan"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedAsset.jenis_aset}
                    </h2>
                    <div className="flex gap-2 mt-2 mb-6">
                      <span className="text-xs bg-pln-primary text-white px-2 py-0.5 rounded">
                        {selectedAsset.merk_type || "Tanpa Merk"}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        📍 {selectedAsset.lokasi}
                      </span>
                    </div>

                    {/* STATUS DROPDOWN */}
                    {isAdmin && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Edit size={18} />
                          <div>
                            <h4 className="font-bold text-sm">
                              Update Tahapan
                            </h4>
                            <p className="text-[10px]">
                              Wajib input No. Surat untuk pindah.
                            </p>
                          </div>
                        </div>
                        <select
                          value={selectedAsset.current_step}
                          onChange={(e) =>
                            initiateStatusChange(parseInt(e.target.value))
                          }
                          disabled={updating}
                          className="bg-white border border-blue-200 text-gray-700 text-sm py-1.5 px-3 rounded-md shadow-sm font-medium cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.step} value={opt.step}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-6">
                      <StatusTracker currentStep={selectedAsset.current_step} />
                    </div>

                    {/* TABEL SURAT */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <FileText size={14} /> Dokumen Administrasi
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">
                            AE-1 (BA Hasil Penelitian):
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            {selectedAsset.no_surat_ae1 || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">
                            AE-2 (Penetapan Penarikan):
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            {selectedAsset.no_surat_ae2 || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">
                            AE-3 (Usulan Penarikan):
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            {selectedAsset.no_surat_ae3 || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">
                            AE-4 (BA Penelitian):
                          </span>
                          <span className="font-mono font-bold text-gray-800">
                            {selectedAsset.no_surat_ae4 || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Nilai Buku
                        </p>
                        <p className="font-bold text-gray-800">
                          Rp{" "}
                          {selectedAsset.nilai_buku?.toLocaleString("id-ID") ||
                            "0"}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-blue-600 uppercase">
                          Estimasi
                        </p>
                        <p className="font-bold text-pln-gold">
                          Rp{" "}
                          {selectedAsset.harga_tafsiran?.toLocaleString(
                            "id-ID",
                          ) || "0"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* GRID UNTUK FOTO & LOG HISTORY (AUDIT) - INI YANG KEMBALI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-6">
                {/* KOLOM KIRI: FOTO */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <ImageIcon size={18} /> Foto Fisik
                  </h3>
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg border min-h-[250px] relative group overflow-hidden">
                    {selectedAsset.foto_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedAsset.foto_url}
                          alt="Foto"
                          className="max-h-[250px] object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() =>
                            setZoomedImage(selectedAsset.foto_url!)
                          }
                        />
                        <div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() =>
                            setZoomedImage(selectedAsset.foto_url!)
                          }
                        >
                          <Maximize2
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            size={32}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400 italic flex flex-col items-center gap-2">
                        <Package size={30} className="opacity-50" />
                        <span>Tidak ada foto</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM KANAN: LOG AUDIT */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                  <AssetHistory assetId={selectedAsset.id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-[600px] text-gray-400 bg-gray-50 rounded-xl border border-dashed m-4">
              <Info size={40} className="mb-2 opacity-50" />
              <p>Pilih aset di sebelah kiri.</p>
            </div>
          )}
        </div>
      </div>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in">
          <button
            onClick={() => setZoomedImage(null)}
            className="fixed top-6 right-6 z-[110] text-white/70 hover:text-white bg-white/10 p-2 rounded-full"
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-[85vh] object-contain rounded-md"
          />
        </div>
      )}
    </div>
  );
}
