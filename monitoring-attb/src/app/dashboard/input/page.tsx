"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Save,
  Calculator,
  FileText,
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ExcelJS from "exceljs";

const assetCategories = [
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

const formatNumber = (num: number) =>
  new Intl.NumberFormat("id-ID").format(num);
const parseNumber = (str: string) =>
  parseFloat(str.replace(/\./g, "").replace(/,/g, ".")) || 0;

export default function InputAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(true);

  // Form Manual State
  const [formData, setFormData] = useState({
    no_aset: "",
    no_surat_ae1: "",
    jenis_aset: assetCategories[0].value,
    merk_type: "",
    spesifikasi: "",
    jumlah: 1,
    satuan: "Unit",
    konversi_kg: 0,
    tahun_perolehan: new Date().getFullYear(),
    umur_pakai: 0,
    nilai_perolehan: 0,
    nilai_buku: 0,
    rupiah_per_kg: 4300,
    harga_tafsiran: 0,
    lokasi: "",
    keterangan: "",
  });
  const [manualJenis, setManualJenis] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.replace("/");
      else setVerifying(false);
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    const tafsiran = formData.konversi_kg * formData.rupiah_per_kg;
    setFormData((prev) => ({ ...prev, harga_tafsiran: tafsiran }));
  }, [formData.konversi_kg, formData.rupiah_per_kg]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "manual_jenis_aset") {
      setManualJenis(value);
      return;
    }

    const numberFields = ["jumlah", "umur_pakai", "tahun_perolehan"];
    const currencyFields = [
      "nilai_perolehan",
      "nilai_buku",
      "rupiah_per_kg",
      "konversi_kg",
    ];

    if (numberFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (currencyFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // --- IMPORT EXCEL (UPDATED MAPPING) ---
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setImporting(true);

    try {
      const file = e.target.files[0];
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("Sheet tidak ditemukan.");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan.");

      const { data: existingAssets } = await supabase
        .from("attb_assets")
        .select("no_aset");
      const existingNos = new Set(existingAssets?.map((a) => a.no_aset));

      interface AssetInsert {
        no_aset: string;
        jenis_aset: string;
        lokasi: string;
        merk_type: string;
        spesifikasi: string;
        jumlah: number;
        satuan: string;
        tahun_perolehan: number;
        nilai_perolehan: number;
        nilai_buku: number;
        no_surat_ae1: string;
        no_surat_ae2: string;
        no_surat_ae3: string;
        no_surat_ae4: string;
        konversi_kg: number;
        rupiah_per_kg: number;
        harga_tafsiran: number;
        status: string;
        current_step: number;
        foto_url: null;
        input_by: string;
      }
      const newAssetsToInsert: AssetInsert[] = [];

      // Loop Baris
      worksheet.eachRow((row, rowNumber) => {
        // REQUEST: Mulai dari Baris 26
        if (rowNumber < 26) return;

        // --- MAPPING KOLOM (SESUAI REQUEST) ---
        // A (1) = No Aset (SAP)
        // G (7) = Lokasi (REQUEST BARU)
        // F (6) = Jenis Aset (Description)
        // H (8) = Merk/Type
        // I (9) = Spesifikasi (Main No Text)
        // M (13) = Nilai Buku (Sesuai request sebelumnya)
        // P (16) = AE.1 (No Surat)

        const noAsetRaw = row.getCell(1).text
          ? row.getCell(1).text.toString().trim()
          : "";

        if (!noAsetRaw || existingNos.has(noAsetRaw)) {
          return;
        }

        const beratEstimasi = 0;

        newAssetsToInsert.push({
          no_aset: noAsetRaw,
          jenis_aset: row.getCell(6).text || "Aset Tetap",
          lokasi: row.getCell(7).text || "-", // UPDATED: Kolom G
          merk_type: row.getCell(8).text || "-",
          spesifikasi: row.getCell(9).text || "-",
          jumlah: parseInt(row.getCell(10).text) || 1,
          satuan: row.getCell(11).text || "Unit",

          tahun_perolehan: 2010,
          nilai_perolehan: 0,
          nilai_buku: parseFloat(row.getCell(13).text) || 0, // Kolom M

          // Surat-surat
          no_surat_ae1: row.getCell(16).text || "",
          no_surat_ae2: row.getCell(17).text || "",
          no_surat_ae3: row.getCell(18).text || "",
          no_surat_ae4: row.getCell(19).text || "",

          konversi_kg: beratEstimasi,
          rupiah_per_kg: 4300,
          harga_tafsiran: beratEstimasi * 4300,
          status: "Tahap 1: BA Hasil Penelitian (AE-1)",
          current_step: 1,
          foto_url: null,
          input_by: user.id,
        });
      });

      if (newAssetsToInsert.length === 0) {
        toast("Tidak ada data baru. Cek apakah data dimulai dari baris 26?", {
          icon: "ℹ️",
        });
        return;
      }

      const { error } = await supabase
        .from("attb_assets")
        .insert(newAssetsToInsert);
      if (error) throw error;

      toast.success(`Berhasil Import ${newAssetsToInsert.length} Aset Baru!`);
      router.push("/dashboard/progress");
    } catch (err) {
      console.error(err);
      toast.error("Gagal Import Excel.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // --- SUBMIT MANUAL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no_surat_ae1.trim()) {
      toast.error("Nomor Surat AE-1 Wajib Diisi!");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Sesi habis.");

      let foto_url = "";
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const { error } = await supabase.storage
          .from("attb-photos")
          .upload(fileName, imageFile);
        if (error) throw error;
        const { data } = supabase.storage
          .from("attb-photos")
          .getPublicUrl(fileName);
        foto_url = data.publicUrl;
      }

      const payload = {
        ...formData,
        spesifikasi: manualJenis
          ? `[KODE: ${manualJenis}] \n${formData.spesifikasi}`
          : formData.spesifikasi,
        foto_url: foto_url || null,
        status: "Tahap 1: BA Hasil Penelitian (AE-1)",
        current_step: 1,
        input_by: user.id,
      };

      const { error } = await supabase.from("attb_assets").insert([payload]);
      if (error) throw error;

      toast.success("Input Manual Berhasil!");
      router.push("/dashboard/progress");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-gray-500 hover:text-pln-primary mb-4 text-sm font-bold w-fit"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-pln-primary">
          Input Usulan ATTB
        </h1>

        {/* TOMBOL IMPORT EXCEL */}
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={importing}
          />
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg text-white transition-all ${importing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {importing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={20} />
            )}
            {importing ? "Mengimport..." : "Import Excel"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-pln-primary">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FileText size={20} className="text-pln-primary" /> 1. Dokumen
            Berita Acara (AE-1)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase">
                No. Surat AE-1 <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="no_surat_ae1"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg"
                placeholder="Contoh: 001/BA-HP/2026"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase">
                No. Aset (SAP) <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="no_aset"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* KARTU 2: IDENTITAS FISIK */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            2. Identitas Fisik Aset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Kategori
              </label>
              <select
                name="jenis_aset"
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              >
                {assetCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-red-600 uppercase">
                Kode Teknis (Opsional)
              </label>
              <input
                name="manual_jenis_aset"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-white border border-red-200 rounded-lg"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Merk / Type
              </label>
              <input
                required
                name="merk_type"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-white border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Jumlah
                </label>
                <input
                  required
                  type="number"
                  name="jumlah"
                  value={formData.jumlah}
                  min="1"
                  onChange={handleChange}
                  className="w-full p-3 bg-white border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Satuan
                </label>
                <input
                  required
                  type="text"
                  name="satuan"
                  value={formData.satuan}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border rounded-lg"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Spesifikasi Detail
              </label>
              <textarea
                name="spesifikasi"
                rows={3}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* KARTU 3: NILAI & TAFSIRAN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            3. Nilai & Tafsiran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Thn Perolehan
              </label>
              <input
                type="number"
                name="tahun_perolehan"
                defaultValue={2010}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Umur (Thn)
              </label>
              <input
                type="number"
                name="umur_pakai"
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nilai Perolehan
              </label>
              <input
                type="text"
                name="nilai_perolehan"
                value={formatNumber(formData.nilai_perolehan)}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nilai Buku
              </label>
              <input
                type="text"
                name="nilai_buku"
                value={formatNumber(formData.nilai_buku)}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg font-bold"
              />
            </div>
            <div className="md:col-span-4 my-2 border-t border-dashed border-gray-200"></div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-600 uppercase">
                Berat (Kg)
              </label>
              <input
                required
                type="number"
                step="0.01"
                name="konversi_kg"
                onChange={handleChange}
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Rate Scrap
              </label>
              <input
                type="text"
                name="rupiah_per_kg"
                value={formatNumber(formData.rupiah_per_kg)}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border rounded-lg"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-pln-gold uppercase flex items-center gap-2">
                <Calculator size={14} /> Harga Tafsiran
              </label>
              <div className="w-full p-3 bg-pln-gold/10 border border-pln-gold text-pln-primary font-mono text-xl font-bold rounded-lg flex items-center">
                Rp {formData.harga_tafsiran.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 4: LOKASI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            4. Lokasi & Foto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Lokasi
              </label>
              <input
                required
                name="lokasi"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                rows={1}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-lg"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Upload Foto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-pln-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-pln-primary/90 transition-colors"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={20} /> Simpan Data
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
