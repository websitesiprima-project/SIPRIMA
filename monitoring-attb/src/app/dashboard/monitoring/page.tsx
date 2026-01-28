"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Search,
  Loader2,
  Edit,
  CheckSquare,
  ArrowRight,
  FileText,
  Filter,
  CheckCircle,
  X,
  Save,
  Calculator,
  Trash2,
  FileBadge,
  SortAsc,
  MapPin, // Icon Lokasi Pengganti Emoji
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

// --- DATA KATEGORI ---
const ASSET_CATEGORIES = [
  { label: "Trafo Tenaga (Power Transformer)", value: "Trafo Tenaga" },
  { label: "PMT (Pemutus Tenaga / Circuit Breaker)", value: "PMT" },
  { label: "PMS (Pemisah / Disconnector)", value: "PMS" },
  {
    label: "Instrument Transformer (CT / PT)",
    value: "Instrument Transformer",
  },
  { label: "Lightning Arrester (LA)", value: "Lightning Arrester" },
  { label: "Kubikel 20kV & Panel Kontrol", value: "Kubikel & Panel" },
  { label: "Baterai & Rectifier", value: "Baterai & Rectifier" },
  { label: "Serandang & Isolator", value: "Serandang & Isolator" },
  { label: "Kendaraan Bermotor", value: "Kendaraan Bermotor" },
  {
    label: "Peralatan Kantor & Inventaris",
    value: "Peralatan Kantor & Inventaris",
  },
];

// --- OPSI SORTIR (Tanpa Emoji) ---
const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru Ditambahkan" },
  { value: "oldest", label: "Terlama Ditambahkan" },
  { value: "a_z", label: "Nama Aset (A-Z)" },
  { value: "z_a", label: "Nama Aset (Z-A)" },
  { value: "sap_asc", label: "No. Aset (0-9)" },
  { value: "sap_desc", label: "No. Aset (9-0)" },
];

// --- DEFINISI TIPE DATA ---
interface AssetData {
  id: string;
  no_aset: string;
  jenis_aset: string;
  merk_type: string;
  spesifikasi: string;
  lokasi: string;
  current_step: number;
  foto_url: string | null;
  jumlah?: number;
  satuan?: string;
  created_at?: string;

  // Nilai & Fisik
  tahun_perolehan?: number;
  nilai_perolehan?: number;
  nilai_buku?: number;
  konversi_kg?: number;
  rupiah_per_kg?: number;
  harga_tafsiran?: number;
  keterangan?: string;

  // Dokumen Surat
  no_surat_ae1?: string;
  no_surat_ae2?: string;
  no_surat_ae3?: string;
  no_surat_ae4?: string;
  no_surat_sk?: string;

  // PELENGKAP
  no_surat_attb?: string;

  [key: string]: string | number | null | undefined;
}

const STATIONS = [
  { id: 1, label: "Stasiun AE-1 (Inventarisasi)", code: "AE-1" },
  { id: 2, label: "Stasiun AE-2 (Penetapan)", code: "AE-2" },
  { id: 3, label: "Stasiun AE-3 (Usulan)", code: "AE-3" },
  { id: 4, label: "Stasiun AE-4 (Review SPI)", code: "AE-4" },
  { id: 5, label: "Selesai (Penghapusan)", code: "AE-5" },
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID").format(val);

export default function ProgressPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Selection
  const [activeStation, setActiveStation] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Actions State
  const [isTransitModalOpen, setTransitModalOpen] = useState(false);
  const [batchSurat, setBatchSurat] = useState("");
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attb_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error);
      toast.error("Gagal memuat data aset.");
    } else {
      setAssets((data as AssetData[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto Calculate Tafsiran
  useEffect(() => {
    if (editingAsset) {
      const berat = editingAsset.konversi_kg || 0;
      const rate = editingAsset.rupiah_per_kg || 4300;
      const total = berat * rate;
      if (total !== editingAsset.harga_tafsiran) {
        setEditingAsset((prev) =>
          prev ? { ...prev, harga_tafsiran: total } : null,
        );
      }
    }
  }, [editingAsset]);

  // --- FILTERING & SORTING ---
  const getFilteredAndSortedAssets = () => {
    const filtered = assets.filter((asset) => {
      if (asset.current_step !== activeStation) return false;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (asset.jenis_aset || "").toLowerCase().includes(lowerSearch) ||
        (asset.no_aset || "").toLowerCase().includes(lowerSearch) ||
        (asset.lokasi || "").toLowerCase().includes(lowerSearch) ||
        (asset.no_surat_ae1 || "").toLowerCase().includes(lowerSearch) ||
        (asset.no_surat_ae2 || "").toLowerCase().includes(lowerSearch) ||
        (asset.no_surat_attb || "").toLowerCase().includes(lowerSearch)
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "a_z":
          return (a.jenis_aset || "").localeCompare(b.jenis_aset || "");
        case "z_a":
          return (b.jenis_aset || "").localeCompare(a.jenis_aset || "");
        case "sap_asc":
          return (a.no_aset || "").localeCompare(b.no_aset || "");
        case "sap_desc":
          return (b.no_aset || "").localeCompare(a.no_aset || "");
        case "oldest":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
      }
    });
  };

  const filteredAssets = getFilteredAndSortedAssets();

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    // Hapus emoji peringatan di window.confirm
    const isConfirmed = window.confirm(
      `PERINGATAN: Apakah Anda yakin ingin menghapus ${selectedIds.size} aset terpilih secara permanen?`,
    );
    if (!isConfirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("attb_assets")
        .delete()
        .in("id", Array.from(selectedIds));
      if (error) throw error;
      toast.success(`Berhasil menghapus ${selectedIds.size} aset.`);
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus aset.");
    } finally {
      setDeleting(false);
    }
  };

  // --- BATCH TRANSIT ---
  const handleBatchTransit = async () => {
    if (!batchSurat.trim()) {
      // Ganti emoji dengan Icon di dalam Component Toast (jika library support)
      // atau gunakan default style tanpa icon custom emoji
      toast.error("Mohon isi Nomor Surat Baru (Tujuan) terlebih dahulu!", {
        style: {
          border: "1px solid #EAB308",
          color: "#854D0E",
          background: "#FEF9C3",
        },
      });
      return;
    }

    const selectedAssetsData = assets.filter((a) => selectedIds.has(a.id));

    const incompleteAssets = selectedAssetsData.filter((asset) => {
      const basicValidation =
        !asset.foto_url ||
        (asset.konversi_kg || 0) <= 0 ||
        (asset.rupiah_per_kg || 0) <= 0;

      let suratValidation = false;
      if (activeStation === 2) {
        const ae2Missing =
          !asset.no_surat_ae2 ||
          asset.no_surat_ae2.trim() === "" ||
          asset.no_surat_ae2 === "-";
        const attbMissing =
          !asset.no_surat_attb ||
          asset.no_surat_attb.trim() === "" ||
          asset.no_surat_attb === "-";
        if (ae2Missing || attbMissing) suratValidation = true;
      }
      return basicValidation || suratValidation;
    });

    if (incompleteAssets.length > 0) {
      const assetNames = incompleteAssets.map((a) => a.no_aset).join(", ");

      let errorMessage = `Gagal! ${incompleteAssets.length} Aset belum lengkap:\n${assetNames}\n\n`;
      if (activeStation === 2) {
        errorMessage +=
          "Harap lengkapi Foto, Berat, No. Surat AE-2, dan No. Surat ATTB di menu Edit Data.";
      } else {
        errorMessage +=
          "Harap lengkapi Foto, Berat, dan Rate Scrap via tombol Edit.";
      }

      toast.error(errorMessage, {
        duration: 6000,
        style: { maxWidth: "500px", fontWeight: "bold" },
      });
      return;
    }

    setMoving(true);
    try {
      const nextStep = activeStation + 1;
      const targetCol = `no_surat_ae${nextStep}`;
      const updatePayload: Record<string, string | number> = {
        current_step: nextStep,
        status:
          STATIONS.find((s) => s.id === nextStep)?.label || `Tahap ${nextStep}`,
      };

      if (nextStep <= 4) updatePayload[targetCol] = batchSurat;
      else if (nextStep === 5) updatePayload["no_surat_sk"] = batchSurat;

      const { error } = await supabase
        .from("attb_assets")
        .update(updatePayload)
        .in("id", Array.from(selectedIds));
      if (error) throw error;

      toast.success(
        `Sukses! ${selectedIds.size} aset dipindahkan ke ${STATIONS[activeStation].code}.`,
      );
      setTransitModalOpen(false);
      setBatchSurat("");
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memindahkan aset.");
    } finally {
      setMoving(false);
    }
  };

  const openEditModal = (asset: AssetData) => {
    setEditingAsset({
      ...asset,
      konversi_kg: asset.konversi_kg || 0,
      rupiah_per_kg: asset.rupiah_per_kg || 4300,
      nilai_buku: asset.nilai_buku || 0,
      nilai_perolehan: asset.nilai_perolehan || 0,
      tahun_perolehan: asset.tahun_perolehan || new Date().getFullYear(),
      jumlah: asset.jumlah || 1,
      no_surat_ae1: asset.no_surat_ae1 || "",
      no_surat_ae2: asset.no_surat_ae2 || "",
      no_surat_ae3: asset.no_surat_ae3 || "",
      no_surat_attb: asset.no_surat_attb || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    setSavingEdit(true);
    try {
      const {
        id,
        jenis_aset,
        merk_type,
        spesifikasi,
        lokasi,
        jumlah,
        satuan,
        no_aset,
        tahun_perolehan,
        nilai_perolehan,
        nilai_buku,
        konversi_kg,
        rupiah_per_kg,
        harga_tafsiran,
        keterangan,
        no_surat_ae1,
        no_surat_ae2,
        no_surat_ae3,
        no_surat_attb,
      } = editingAsset;

      const { error } = await supabase
        .from("attb_assets")
        .update({
          jenis_aset,
          merk_type,
          spesifikasi,
          lokasi,
          jumlah,
          satuan,
          no_aset,
          tahun_perolehan,
          nilai_perolehan,
          nilai_buku,
          konversi_kg,
          rupiah_per_kg,
          harga_tafsiran,
          keterangan,
          no_surat_ae1,
          no_surat_ae2,
          no_surat_ae3,
          no_surat_attb,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Data aset berhasil diperbarui!");
      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pln-primary">
            Progress Aset (Tracking)
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor pergerakan aset dari AE-1 hingga Penghapusan.
          </p>
        </div>

        {/* AREA SEARCH & SORT (NO EMOJI) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* DROPDOWN SORTIR */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SortAsc size={18} />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pln-primary outline-none text-sm appearance-none bg-white cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-48"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari aset atau no. surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pln-primary outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 no-scrollbar">
        {STATIONS.map((station) => {
          const count = assets.filter(
            (a) => a.current_step === station.id,
          ).length;
          const isActive = activeStation === station.id;
          return (
            <button
              key={station.id}
              onClick={() => {
                setActiveStation(station.id);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-bold text-sm whitespace-nowrap transition-all border-b-2 ${isActive ? "border-pln-primary text-pln-primary bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-pln-primary" : "bg-gray-300"}`}
              />
              {station.label}
              {count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-pln-primary text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 bg-white border border-blue-200 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800">
                {selectedIds.size} Aset Dipilih
              </p>
              <p className="text-xs text-gray-500">
                Pilih tindakan untuk aset ini.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBatchDelete}
              disabled={deleting || moving}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-bold shadow-sm hover:bg-red-100 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}{" "}
              <span className="hidden sm:inline">
                Hapus ({selectedIds.size})
              </span>
            </button>
            {activeStation < 5 && (
              <button
                onClick={() => setTransitModalOpen(true)}
                disabled={deleting || moving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                Proses ke {STATIONS[activeStation].code}{" "}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Memuat data aset...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Filter size={32} />
          </div>
          <h3 className="font-bold text-gray-600">
            Tidak ada aset di stasiun ini
          </h3>
        </div>
      ) : (
        <>
          {/* TOMBOL PILIH SEMUA (ADA) */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                selectedIds.size === filteredAssets.length &&
                filteredAssets.length > 0
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 text-pln-primary rounded cursor-pointer accent-pln-primary"
            />
            <label
              htmlFor="selectAll"
              className="text-sm font-bold text-gray-600 cursor-pointer"
            >
              Pilih Semua ({filteredAssets.length})
            </label>
          </div>

          {/* GRID CARD ASET */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group ${selectedIds.has(asset.id) ? "ring-2 ring-blue-500 bg-blue-50/30 border-blue-200" : "border-gray-200"}`}
              >
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(asset.id)}
                    onChange={() => toggleSelect(asset.id)}
                    className="w-5 h-5 cursor-pointer accent-blue-600"
                  />
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                    {asset.foto_url ? (
                      <Image
                        src={asset.foto_url}
                        alt="Aset"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <FileText size={20} />
                        <span className="text-[8px] mt-1">No Img</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 border px-1.5 rounded">
                        {asset.no_aset}
                      </span>
                    </div>
                    <h4
                      className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug mb-1"
                      title={asset.jenis_aset}
                    >
                      {asset.jenis_aset}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {asset.merk_type || "Tanpa Merk"}
                    </p>
                  </div>
                </div>
                {/* LOKASI DENGAN ICON (PENGGANTI EMOJI) */}
                <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{asset.lokasi || "-"}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs flex justify-between items-center text-gray-500">
                  <span>Surat saat ini:</span>
                  <span
                    className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded max-w-[120px] truncate"
                    title={
                      activeStation === 1
                        ? asset.no_surat_ae1
                        : activeStation === 2
                          ? asset.no_surat_ae2
                          : activeStation === 3
                            ? asset.no_surat_ae3
                            : activeStation === 4
                              ? asset.no_surat_ae4
                              : asset.no_surat_sk
                    }
                  >
                    {activeStation === 1
                      ? asset.no_surat_ae1
                      : activeStation === 2
                        ? asset.no_surat_ae2
                        : activeStation === 3
                          ? asset.no_surat_ae3
                          : activeStation === 4
                            ? asset.no_surat_ae4
                            : asset.no_surat_sk || "-"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(asset)}
                    className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit size={12} /> Edit Data
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MODAL TRANSIT --- */}
      {isTransitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-pln-primary">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              Proses Pindah Tahap
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Memindahkan <strong>{selectedIds.size} aset</strong> ke{" "}
              <strong>{STATIONS[activeStation].code}</strong>.
            </p>
            <input
              type="text"
              value={batchSurat}
              onChange={(e) => setBatchSurat(e.target.value)}
              placeholder={`Contoh No. Surat Tujuan: 00${activeStation}/BA...`}
              className="w-full p-3 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTransitModalOpen(false)}
                className="px-4 py-2 text-gray-600 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleBatchTransit}
                disabled={moving || !batchSurat}
                className="px-6 py-2 bg-pln-primary text-white rounded-lg flex items-center gap-2"
              >
                {moving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={16} />
                )}{" "}
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT (LENGKAP) --- */}
      {isEditModalOpen && editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-4 border-pln-accent flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Edit size={20} className="text-pln-accent" /> Edit Data Aset
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* SECTION 1: IDENTITAS */}
              <div>
                <h4 className="text-sm font-bold text-pln-primary border-b border-gray-200 pb-2 mb-3 uppercase tracking-wider">
                  Identitas Aset
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Nomor Aset (SAP)
                    </label>
                    <input
                      type="text"
                      value={editingAsset.no_aset}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          no_aset: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Kategori
                    </label>
                    <select
                      value={editingAsset.jenis_aset}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          jenis_aset: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-white"
                    >
                      {ASSET_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Merk / Type
                    </label>
                    <input
                      type="text"
                      value={editingAsset.merk_type}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          merk_type: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Spesifikasi Detail
                    </label>
                    <textarea
                      rows={2}
                      value={editingAsset.spesifikasi || ""}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          spesifikasi: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DOKUMEN & LEGALITAS */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-bold text-yellow-800 border-b border-yellow-200 pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <FileBadge size={16} /> Dokumen & Legalitas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      No. Surat AE-1 (Awal)
                    </label>
                    <input
                      type="text"
                      value={editingAsset.no_surat_ae1}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          no_surat_ae1: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-yellow-200 rounded-lg bg-white font-mono text-sm"
                      placeholder="Nomor BA AE-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      No. Surat AE-2 (Penetapan)
                    </label>
                    <input
                      type="text"
                      value={editingAsset.no_surat_ae2}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          no_surat_ae2: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-yellow-200 rounded-lg bg-white font-mono text-sm ring-2 ring-yellow-400/20"
                      placeholder="Wajib diisi sebelum ke AE-3"
                    />
                  </div>

                  {/* INPUT SURAT BARU (ATTB) - HANYA MUNCUL JIKA AE-2 KE ATAS */}
                  {editingAsset.current_step >= 2 && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                        No. Surat ATTB (Pelengkap)
                      </label>
                      <input
                        type="text"
                        value={editingAsset.no_surat_attb || ""}
                        onChange={(e) =>
                          setEditingAsset({
                            ...editingAsset,
                            no_surat_attb: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-yellow-200 rounded-lg bg-white font-mono text-sm ring-2 ring-yellow-400/20"
                        placeholder="Contoh: 005/ATTB/..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: NILAI & FISIK */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Calculator size={16} /> Data Nilai & Taksiran
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">
                      Berat (Kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingAsset.konversi_kg}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          konversi_kg: parseFloat(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-blue-200 rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">
                      Rate Scrap (Rp)
                    </label>
                    <input
                      type="number"
                      value={editingAsset.rupiah_per_kg}
                      onChange={(e) =>
                        setEditingAsset({
                          ...editingAsset,
                          rupiah_per_kg: parseFloat(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-pln-gold uppercase mb-1">
                      Estimasi Tafsiran (Auto)
                    </label>
                    <div className="w-full p-2 bg-pln-gold/10 border border-pln-gold rounded-lg font-mono font-bold text-pln-primary">
                      Rp {formatCurrency(editingAsset.harga_tafsiran || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-6 py-2 bg-pln-accent text-white font-bold rounded-lg text-sm hover:bg-pln-accent/90 flex items-center gap-2"
              >
                {savingEdit ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}{" "}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
