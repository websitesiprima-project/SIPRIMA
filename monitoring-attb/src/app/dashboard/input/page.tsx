"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Save, Calculator, FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

// --- DATA KATEGORI ---
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(true);

  // --- STATE FORM (Termasuk no_surat_ae1) ---
  const [formData, setFormData] = useState({
    no_aset: "",
    no_surat_ae1: "", // WAJIB UNTUK FORM AE-1
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

  // --- PROTEKSI HALAMAN ---
  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      } else {
        setVerifying(false);
      }
    };
    checkAccess();
  }, [router]);

  // --- AUTO-CALCULATE TAFSIRAN ---
  useEffect(() => {
    const tafsiran = formData.konversi_kg * formData.rupiah_per_kg;
    setFormData((prev) => ({ ...prev, harga_tafsiran: tafsiran }));
  }, [formData.konversi_kg, formData.rupiah_per_kg]);

  // --- HANDLE CHANGE ---
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

    // Daftar field string (termasuk no_surat_ae1)
    const stringFields = [
      "no_aset",
      "no_surat_ae1",
      "merk_type",
      "spesifikasi",
      "satuan",
      "lokasi",
      "keterangan",
      "jenis_aset",
    ];
    const numberFields = ["jumlah", "umur_pakai", "tahun_perolehan"];
    const currencyFields = [
      "nilai_perolehan",
      "nilai_buku",
      "rupiah_per_kg",
      "konversi_kg",
    ];

    if (stringFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (numberFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (currencyFields.includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: parseNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // --- SUBMIT (CREATE AE-1) ---
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
      if (!user?.id) throw new Error("Sesi login berakhir. Refresh halaman.");

      // 1. Upload Foto
      let foto_url = "";
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const { error } = await supabase.storage
          .from("attb-photos")
          .upload(fileName, imageFile);
        if (error) throw new Error("Gagal upload foto: " + error.message);
        const { data } = supabase.storage
          .from("attb-photos")
          .getPublicUrl(fileName);
        foto_url = data.publicUrl;
      }

      // 2. Gabung Spesifikasi
      const combinedSpesifikasi = manualJenis
        ? `[KODE: ${manualJenis}] \n${formData.spesifikasi}`
        : formData.spesifikasi;

      // 3. Payload (Sesuai Struktur Database Baru)
      const payload = {
        ...formData,
        spesifikasi: combinedSpesifikasi,
        foto_url: foto_url || null,

        // --- DATA PENTING UNTUK ALUR BARU ---
        status: "Tahap 1: BA Hasil Penelitian (AE-1)", // Label Status
        current_step: 1, // Step 1
        // no_surat_ae1 sudah ada di dalam formData (spread operator di atas)

        input_by: user.id,
      };

      console.log("Sending Payload:", payload);

      // --- PERUBAHAN UTAMA: INSERT LANGSUNG KE SUPABASE ---
      const { error: insertError } = await supabase
        .from("attb_assets")
        .insert([payload]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      toast.success("Berhasil! Dokumen AE-1 Tersimpan.");
      router.push("/dashboard/tracking");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error Unknown";
      toast.error(message);
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

      <h1 className="text-2xl font-bold text-pln-primary mb-6">
        Input Usulan ATTB (Form AE-1)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* KARTU 1: ADMINISTRASI (FORM AE-1) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-pln-primary">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FileText size={20} className="text-pln-primary" /> 1. Dokumen
            Berita Acara (AE-1)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NO SURAT AE-1 (WAJIB) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase">
                No. Surat AE-1 (BA Hasil Penelitian){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="no_surat_ae1"
                type="text"
                onChange={handleChange}
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-pln-primary outline-none font-medium text-gray-800"
                placeholder="Contoh: 001/BA-HP/2026"
              />
              <p className="text-[10px] text-gray-500">
                *Nomor Berita Acara Hasil Penelitian & Penarikan Aset
              </p>
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
                placeholder="Contoh: 100029384"
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
                Kode Teknis / Manual (Opsional)
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

        {/* KARTU 4: DOKUMENTASI */}
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
            type="button"
            onClick={() => router.push("/dashboard/tracking")}
            className="px-6 py-3 rounded-xl border font-bold"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-pln-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-pln-primary/90 transition-colors"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={20} /> Simpan Data (AE-1)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
