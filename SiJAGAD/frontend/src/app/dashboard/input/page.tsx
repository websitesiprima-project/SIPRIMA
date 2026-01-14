"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  Building2,
  CalendarDays,
  FileSignature,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion"; // Pastikan install framer-motion jika belum

export default function InputPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          Loading Form...
        </div>
      }
    >
      <InputForm />
    </Suspense>
  );
}

function InputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const initialForm = {
    vendor: "",
    pekerjaan: "",
    nomor_kontrak: "",
    tanggal_awal_kontrak: "",
    nominal_jaminan: 0,
    jenis_garansi: "Bank Garansi",
    nomor_garansi: "",
    bank_penerbit: "",
    tanggal_awal_garansi: "",
    tanggal_akhir_garansi: "",
    status: "Baru",
    kategori: "Jaminan Pelaksanaan",
    file_url: "",
    lokasi: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserEmail(user.email || "Unknown");

      if (editId) {
        const toastLoad = toast.loading("Mengambil data...");
        try {
          const { data, error } = await supabase
            .from("letters")
            .select("*")
            .eq("id", editId)
            .single();

          if (error) throw error;
          if (data) {
            setFormData(data);
            toast.dismiss(toastLoad);
          }
        } catch (error) {
          console.error(error);
          toast.error("Gagal memuat data", { id: toastLoad });
          router.push("/dashboard");
        }
      }
    };
    init();
  }, [editId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Menyimpan...");

    try {
      let uploadedUrl = formData.file_url;

      if (selectedFile) {
        const fileName = `${Date.now()}.pdf`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(fileName, selectedFile);
        if (error) throw error;
        const { data } = supabase.storage
          .from("documents")
          .getPublicUrl(fileName);
        uploadedUrl = data.publicUrl;
      }

      const payload = {
        ...formData,
        file_url: uploadedUrl || null,
        user_email: userEmail,
      };

      const url = editId
        ? `${API_URL}/letters/${editId}`
        : `${API_URL}/letters`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ke server");

      toast.success("Berhasil disimpan!", { id: toastId });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-blue-100 text-slate-800">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              {editId ? "Edit Data Surat" : "Registrasi Surat Baru"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              SIJAGAD FORM SYSTEM
            </p>
          </div>
        </div>

        {/* Tombol Simpan di Navbar (Opsional/Duplicate) */}
        <div className="hidden md:block">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
            {editId ? "Mode: Perubahan Data" : "Mode: Input Baru"}
          </span>
        </div>
      </nav>

      {/* MAIN CONTAINER FULL WIDTH */}
      <main className="w-full px-6 md:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-8 md:px-12 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              {editId ? <FileSignature size={28} /> : <FileText size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Formulir Kelengkapan Data
              </h2>
              <p className="text-slate-500">
                Silakan lengkapi data jaminan di bawah ini dengan teliti.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {/* GRID SYSTEM: 3 KOLOM DI LAYAR BESAR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
              {/* KOLOM 1: INFORMASI VENDOR & PEKERJAAN */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                  <Building2 size={18} className="text-blue-600" /> Data Pihak
                  Terkait
                </h3>

                <InputGroup
                  label="Nama Vendor / Perusahaan"
                  value={formData.vendor}
                  onChange={(v) => setFormData({ ...formData, vendor: v })}
                  placeholder="PT. Contoh Karya Sejahtera"
                />
                <InputGroup
                  label="Bank / Asuransi Penerbit"
                  value={formData.bank_penerbit}
                  onChange={(v) =>
                    setFormData({ ...formData, bank_penerbit: v })
                  }
                  placeholder="PT. Bank Mandiri (Persero) Tbk."
                />
                <InputGroup
                  label="Nama Pekerjaan (Judul Kontrak)"
                  type="textarea"
                  value={formData.pekerjaan}
                  onChange={(v) => setFormData({ ...formData, pekerjaan: v })}
                  placeholder="Pengadaan dan Pemasangan..."
                />
              </div>

              {/* KOLOM 2: DETAIL JAMINAN */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                  <FileSignature size={18} className="text-blue-600" /> Detail
                  Jaminan
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Nomor Kontrak"
                    value={formData.nomor_kontrak}
                    onChange={(v) =>
                      setFormData({ ...formData, nomor_kontrak: v })
                    }
                  />
                  <InputGroup
                    label="Nomor Garansi"
                    value={formData.nomor_garansi}
                    onChange={(v) =>
                      setFormData({ ...formData, nomor_garansi: v })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Kategori"
                    type="select"
                    value={formData.kategori}
                    onChange={(v) => setFormData({ ...formData, kategori: v })}
                    options={["Jaminan Pelaksanaan", "Jaminan Pemeliharaan"]}
                  />
                  <InputGroup
                    label="Nominal (Rp)"
                    value={formData.nominal_jaminan}
                    onChange={(v) =>
                      setFormData({ ...formData, nominal_jaminan: Number(v) })
                    }
                    isCurrency
                  />
                </div>

                <InputGroup
                  label="Lokasi Fisik Arsip"
                  value={formData.lokasi || ""}
                  onChange={(v) => setFormData({ ...formData, lokasi: v })}
                  placeholder="Cth: Lemari A - Rak 2"
                  icon={
                    <MapPin
                      size={16}
                      className="text-slate-400 absolute right-4 top-10"
                    />
                  }
                />
              </div>

              {/* KOLOM 3: WAKTU & DOKUMEN */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                  <CalendarDays size={18} className="text-blue-600" /> Waktu &
                  Dokumen
                </h3>

                <InputGroup
                  label="Tanggal Awal Kontrak"
                  type="date"
                  value={formData.tanggal_awal_kontrak}
                  onChange={(v) =>
                    setFormData({ ...formData, tanggal_awal_kontrak: v })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Tgl Awal Garansi"
                    type="date"
                    value={formData.tanggal_awal_garansi}
                    onChange={(v) =>
                      setFormData({ ...formData, tanggal_awal_garansi: v })
                    }
                  />
                  <InputGroup
                    label="Tgl Akhir (Expired)"
                    type="date"
                    value={formData.tanggal_akhir_garansi}
                    onChange={(v) =>
                      setFormData({ ...formData, tanggal_akhir_garansi: v })
                    }
                  />
                </div>

                {/* UPLOAD AREA */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
                    Upload Dokumen (PDF)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="pdf-upload"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                    <label
                      htmlFor="pdf-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        selectedFile
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                      }`}
                    >
                      <UploadCloud
                        size={32}
                        className={
                          selectedFile
                            ? "text-blue-600"
                            : "text-slate-300 group-hover:text-blue-400 transition-colors"
                        }
                      />
                      <p className="text-sm font-bold mt-3 text-slate-600">
                        {selectedFile
                          ? selectedFile.name
                          : "Klik untuk Upload PDF"}
                      </p>
                      {formData.file_url && !selectedFile && (
                        <p className="text-[10px] text-green-600 mt-1 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          ✓ File Lama Tersimpan
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4">
              <Link href="/dashboard">
                <button
                  type="button"
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={20} />
                    {editId ? "Simpan Perubahan" : "Simpan Data"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

// --- SUB COMPONENT: INPUT GROUP ---
interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: "text" | "date" | "number" | "select" | "textarea";
  placeholder?: string;
  isCurrency?: boolean;
  options?: string[];
  icon?: React.ReactNode;
}

function InputGroup({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  isCurrency = false,
  options = [],
  icon,
}: InputGroupProps) {
  const displayValue =
    isCurrency && typeof value === "number"
      ? new Intl.NumberFormat("id-ID").format(value)
      : value;

  const baseClasses =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white";

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">
        {label}
      </label>

      {type === "select" ? (
        <div className="relative">
          <select
            className={`${baseClasses} appearance-none cursor-pointer`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      ) : type === "textarea" ? (
        <textarea
          rows={3}
          className={`${baseClasses} resize-none`}
          placeholder={placeholder}
          value={displayValue || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <>
          <input
            type={type}
            className={baseClasses}
            placeholder={placeholder}
            value={displayValue || ""}
            onChange={(e) =>
              onChange(
                isCurrency
                  ? e.target.value.replace(/[^0-9]/g, "")
                  : e.target.value
              )
            }
            required={!isCurrency}
          />
          {icon && icon}
        </>
      )}
    </div>
  );
}
