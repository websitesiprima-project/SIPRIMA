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
  CheckCircle,
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AssetDocument } from "../../../components/AssetDocument";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- KONSTANTA KATEGORI ---
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
  { step: 1, label: "Tahap 1: Inventarisasi UP (AE-1)" },
  { step: 2, label: "Tahap 2: Penetapan UPI (AE-2)" },
  { step: 3, label: "Tahap 3: Review SPI (AE-4)" },
  { step: 4, label: "Tahap 4: Verifikasi Pusat" },
  { step: 5, label: "Tahap 5: Persetujuan SK (Dekom/RUPS)" },
  { step: 6, label: "Tahap 6: Penghapusan Selesai (AE-5)" },
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
  nilai_perolehan?: number; // Added Field
  harga_tafsiran?: number;
  spesifikasi?: string;
  foto_url?: string;
  konversi_kg?: number;
}

export default function TrackingPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Ref untuk mencegah infinite loop loading
  const selectedAssetIdRef = useRef<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AssetData>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Sync Ref dengan State
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

      if (error) {
        console.error("Supabase Error:", JSON.stringify(error, null, 2));
        throw error;
      }

      const typedData = (data || []) as AssetData[];
      setAssets(typedData);
      setLoading(false);

      // Logic update detail view
      const currentSelectedId = selectedAssetIdRef.current;

      if (currentSelectedId) {
        const updated = typedData.find((a) => a.id === currentSelectedId);
        if (updated) {
          setSelectedAsset((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
              return updated;
            }
            return prev;
          });
        }
      } else if (typedData.length > 0 && window.innerWidth >= 1024) {
        if (!selectedAssetIdRef.current) {
          setSelectedAsset(typedData[0]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Fetch Error:", errorMessage);
      toast.error(`Gagal ambil data: ${errorMessage}`);
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

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = filteredAssets.map((a) => a.id);
      setSelectedIds(new Set(allIds));
    }
  };

  // --- FUNGSI EXPORT EXCEL DENGAN GAMBAR & KOLOM TERPISAH ---
  const handleExportExcel = async () => {
    try {
      setUpdating(true);

      let dataToProcess = filteredAssets;
      if (selectedIds.size > 0) {
        dataToProcess = filteredAssets.filter((item) =>
          selectedIds.has(item.id)
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

      // Set Lebar Kolom Dokumentasi
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
        row.getCell(11).value = 0;

        // --- PERBAIKAN: Pisahkan Nilai Perolehan (12) dan Nilai Buku (14) ---
        row.getCell(12).value = item.nilai_perolehan || 0; // Kolom L
        row.getCell(14).value = item.nilai_buku || 0; // Kolom N

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

              worksheet.addImage(imageId, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tl: { col: 19.1, row: rowIndex + 0.1 } as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                br: { col: 19.9, row: rowIndex + 0.9 } as any,
                editAs: "oneCell",
              });

              row.getCell(20).value = "";
            } else {
              row.getCell(20).value = "Gagal Load";
            }
          } catch (error) {
            console.error("Gagal download gambar:", error);
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
        `Laporan_ATTB_FOTO_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast.success(`Export Selesai: ${dataToProcess.length} Aset`);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Gagal export excel");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStep: number) => {
    if (!selectedAsset) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("attb_assets")
        .update({
          current_step: newStep,
        })
        .eq("id", selectedAsset.id);

      if (error) throw error;

      toast.success(`Status diubah ke Tahap ${newStep}`);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    if (!confirm("⚠️ PERINGATAN: Aset ini akan dihapus permanen. Lanjutkan?"))
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

  const saveEdit = async () => {
    if (!selectedAsset) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("attb_assets")
        .update({
          jenis_aset: editForm.jenis_aset,
          merk_type: editForm.merk_type,
          lokasi: editForm.lokasi,
          jumlah: editForm.jumlah,
          satuan: editForm.satuan,
          spesifikasi: editForm.spesifikasi,
          keterangan: editForm.keterangan,
          nilai_buku: editForm.nilai_buku,
          nilai_perolehan: editForm.nilai_perolehan, // Include Nilai Perolehan
        })
        .eq("id", selectedAsset.id);

      if (error) throw error;

      toast.success("Data berhasil diperbarui");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = () => {
    if (!selectedAsset) return;
    setEditForm({
      jenis_aset: selectedAsset.jenis_aset,
      merk_type: selectedAsset.merk_type,
      lokasi: selectedAsset.lokasi,
      jumlah: selectedAsset.jumlah,
      satuan: selectedAsset.satuan,
      spesifikasi: selectedAsset.spesifikasi,
      keterangan: selectedAsset.keterangan,
      nilai_buku: selectedAsset.nilai_buku,
      nilai_perolehan: selectedAsset.nilai_perolehan, // Load existing data
    });
    setIsEditing(true);
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
      {/* HEADER & EXPORT BUTTON */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end">
        <div>
          {selectedAsset && (
            <button
              onClick={() => setSelectedAsset(null)}
              className="lg:hidden mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-pln-primary font-bold transition-colors"
            >
              <ArrowLeft size={16} /> Kembali ke List
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-pln-primary">
            Monitoring & Tracking
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            {isAdmin
              ? "Mode Admin: Kelola seluruh data aset."
              : "Mode View: Pantau progres aset."}
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className={`
            px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors w-fit
            ${
              selectedIds.size > 0
                ? "bg-pln-primary text-white hover:bg-pln-primary/90"
                : "bg-green-600 text-white hover:bg-green-700"
            }
          `}
        >
          <FileSpreadsheet size={18} />
          {selectedIds.size > 0
            ? `Export Terpilih (${selectedIds.size})`
            : "Export Semua (Excel)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full pb-2 md:pb-10">
        {/* --- KOLOM KIRI (LIST ASET) --- */}
        <div
          className={`
            lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex-col h-full max-h-[75vh] md:max-h-[750px]
            ${selectedAsset ? "hidden lg:flex" : "flex"} 
        `}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari No Aset / Lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-pln-accent transition-all"
              />
            </div>

            {filteredAssets.length > 0 && (
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={
                    selectedIds.size === filteredAssets.length &&
                    filteredAssets.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-pln-primary bg-gray-100 border-gray-300 rounded focus:ring-pln-primary cursor-pointer"
                />
                <label
                  htmlFor="selectAll"
                  className="text-xs font-bold text-gray-600 cursor-pointer select-none"
                >
                  Pilih Semua ({filteredAssets.length})
                </label>
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Data tidak ditemukan.
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setIsEditing(false);
                  }}
                  className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all border relative overflow-hidden group flex gap-3
                    ${
                      selectedAsset?.id === asset.id
                        ? "bg-pln-primary/5 border-pln-primary/30 shadow-sm"
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                    }`}
                >
                  <div
                    className="flex items-center pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={() => handleSelectOne(asset.id)}
                      className="w-4 h-4 text-pln-primary bg-gray-100 border-gray-300 rounded focus:ring-pln-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                        asset.current_step === 6
                          ? "bg-green-500"
                          : "bg-pln-gold group-hover:bg-pln-primary"
                      }`}
                    />
                    <div className="flex justify-between mb-1 pl-1">
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 rounded border border-gray-200">
                        {asset.no_aset}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(asset.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-1 pl-1 text-gray-800 line-clamp-1">
                      {asset.jenis_aset}
                    </h4>
                    <p className="text-xs text-gray-500 pl-1 mb-1 line-clamp-1">
                      {asset.merk_type || "-"}
                    </p>
                    <div className="flex justify-between items-center pl-1 mt-1">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        {asset.current_step === 6 ? (
                          <CheckCircle size={10} className="text-green-500" />
                        ) : (
                          "📍"
                        )}{" "}
                        {asset.lokasi}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          asset.current_step === 6
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        T{asset.current_step}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- KOLOM KANAN (DETAIL) --- */}
        <div
          className={`
            lg:col-span-2 space-y-6 overflow-y-auto h-full max-h-[75vh] md:max-h-[750px] custom-scrollbar pr-1
            ${selectedAsset ? "block" : "hidden lg:block"}
        `}
        >
          {selectedAsset ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity size={18} className="text-pln-primary" /> Detail
                    Aset
                  </h3>

                  {isAdmin && !isEditing && (
                    <div className="flex gap-2">
                      <PDFDownloadLink
                        document={<AssetDocument data={selectedAsset} />}
                        fileName={`BA_${selectedAsset.no_aset}.pdf`}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 flex items-center gap-1 transition-colors"
                      >
                        {({ loading }) => (
                          <>
                            <FileText size={14} />
                            {loading ? "..." : "BA PDF"}
                          </>
                        )}
                      </PDFDownloadLink>

                      <button
                        onClick={startEditing}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={updating}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={updating}
                        className="px-4 py-1.5 bg-pln-primary text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-pln-primary/90"
                      >
                        {updating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}{" "}
                        Simpan
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200 animate-in fade-in">
                    <div className="col-span-2 text-xs font-bold text-yellow-700 uppercase mb-2">
                      Edit Data Teknis
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Jenis Aset / Peralatan
                      </label>
                      <select
                        value={editForm.jenis_aset || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            jenis_aset: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm focus:ring-1 focus:ring-pln-primary"
                      >
                        {ASSET_CATEGORIES.map((cat, idx) => (
                          <option key={idx} value={cat.split(" (")[0]}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Merk / Tipe
                      </label>
                      <input
                        type="text"
                        value={editForm.merk_type || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            merk_type: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Lokasi
                      </label>
                      <input
                        type="text"
                        value={editForm.lokasi || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lokasi: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        value={editForm.jumlah || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            jumlah: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Satuan
                      </label>
                      <input
                        type="text"
                        value={editForm.satuan || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, satuan: e.target.value })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Nilai Perolehan (Rp)
                      </label>
                      <input
                        type="number"
                        value={editForm.nilai_perolehan || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            nilai_perolehan: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">
                        Nilai Buku (Rp)
                      </label>
                      <input
                        type="number"
                        value={editForm.nilai_buku || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            nilai_buku: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Spesifikasi
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.spesifikasi || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            spesifikasi: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Keterangan
                      </label>
                      <textarea
                        rows={1}
                        value={editForm.keterangan || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            keterangan: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded bg-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  /* VIEW DETAIL */
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedAsset.jenis_aset}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-white bg-pln-primary px-2 py-0.5 rounded border border-blue-600">
                          {selectedAsset.merk_type || "Tanpa Merk"}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                          <Package size={10} /> {selectedAsset.jumlah}{" "}
                          {selectedAsset.satuan}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                          📍 {selectedAsset.lokasi}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Edit size={18} />
                          <div>
                            <h4 className="font-bold text-sm">
                              Update Tahapan
                            </h4>
                            <p className="text-[10px] text-blue-600">
                              Ubah progres dokumen.
                            </p>
                          </div>
                        </div>
                        <div className="relative w-full sm:w-auto">
                          <select
                            value={selectedAsset.current_step}
                            onChange={(e) =>
                              handleStatusChange(parseInt(e.target.value))
                            }
                            disabled={updating}
                            className="w-full sm:w-auto bg-white border border-blue-200 text-gray-700 text-sm py-1.5 pl-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.step} value={opt.step}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {updating && (
                            <div className="absolute right-8 top-2">
                              <Loader2
                                size={14}
                                className="animate-spin text-pln-primary"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <StatusTracker currentStep={selectedAsset.current_step} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Nilai Buku
                        </p>
                        <p className="font-bold text-gray-800 text-lg">
                          Rp{" "}
                          {selectedAsset.nilai_buku?.toLocaleString("id-ID") ||
                            "0"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Perolehan: Rp{" "}
                          {selectedAsset.nilai_perolehan?.toLocaleString(
                            "id-ID"
                          ) || "0"}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                          Estimasi Tafsiran
                        </p>
                        <p className="font-bold text-pln-gold text-lg">
                          Rp{" "}
                          {selectedAsset.harga_tafsiran?.toLocaleString(
                            "id-ID"
                          ) || "0"}
                        </p>
                      </div>
                      <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Spesifikasi
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {selectedAsset.spesifikasi || "-"}
                        </p>
                      </div>
                      {selectedAsset.keterangan && (
                        <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-2">
                          <Info
                            size={16}
                            className="text-yellow-600 shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-yellow-800 italic">
                            &quot;{selectedAsset.keterangan}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* FOTO & HISTORY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                    <ImageIcon size={18} className="text-pln-primary" /> Foto
                    Fisik
                  </h3>
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 min-h-[250px] p-2 relative group overflow-hidden">
                    {selectedAsset.foto_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedAsset.foto_url}
                          alt="Foto"
                          className="max-h-[250px] w-auto rounded-lg object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
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
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                            size={32}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400 italic flex flex-col items-center gap-2">
                        <ImageIcon size={30} className="opacity-50" />
                        <span>Tidak ada foto</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                  <AssetHistory assetId={selectedAsset.id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-[600px] text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 m-4">
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
            className="fixed top-6 right-6 z-[110] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/10"
          >
            <X size={28} />
          </button>
          <div
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          ></div>
          <div className="relative z-10 max-w-7xl w-full h-full flex items-center justify-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
