"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    // Auto close notifikasi setelah 3 detik
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      if (isLogin) {
        // --- PROSES LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Jika Login Sukses
        if (data.session) {
          // 🔥 INTEGRASI PENTING DI SINI 🔥
          // Kita set cookie manual agar Middleware Next.js mengizinkan masuk
          document.cookie =
            "token=valid-sijagad-session; path=/; max-age=86400";

          showToast("Login Berhasil! Mengalihkan...", "success");

          // PENTING: Refresh agar router tahu kita sudah login
          router.refresh();

          // Pindah langsung tanpa delay lama
          router.replace("/dashboard");
        }
      } else {
        // --- PROSES REGISTER ---
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        showToast("Registrasi Berhasil! Silakan cek email/login.", "success");
        setIsLogin(true); // Kembali ke mode login
        setPassword("");
      }
    } catch (error: Error | unknown) {
      console.error("Auth Error:", error);
      // Tampilkan pesan error yang jelas
      let msg =
        (error instanceof Error ? error.message : String(error)) ||
        "Terjadi kesalahan pada server.";
      if (msg.includes("Invalid login")) msg = "Email atau password salah.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // BACKGROUND: Putih/Terang (Light Mode)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden px-4 font-sans text-slate-800">
      {/* Ornamen Background Halus */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.05),transparent_40%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(234,179,8,0.05),transparent_40%)] pointer-events-none" />

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 z-[60] flex items-center gap-3 px-6 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-top-5 duration-300 ${
            notification.type === "success"
              ? "bg-green-100 border-green-200 text-green-700"
              : "bg-red-100 border-red-200 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span className="text-sm font-bold">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:bg-black/5 rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Card Utama */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* LOGO SVG - UKURAN BESAR (w-40 h-40) */}
          <div className="relative w-40 h-40 mx-auto mb-4 drop-shadow-sm">
            <Image
              src="/SiJAGAD_4.svg"
              alt="Logo SiJAGAD"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            PLN Monitoring
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Sistem Manajemen Surat Jaminan
          </p>
        </div>

        {/* Switch Login/Daftar */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-8 relative border border-slate-200">
          <div className="absolute inset-1.5 pointer-events-none">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className={`h-full w-1/2 bg-white rounded-xl shadow-sm border border-slate-100 absolute ${
                isLogin ? "left-0" : "left-1/2"
              }`}
            />
          </div>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${
              isLogin ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${
              !isLogin
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="email"
              placeholder="Email Perusahaan"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi"
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-sm">
                  {isLogin ? "Masuk Dashboard" : "Daftar Akun"}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PT PLN (Persero)
        </p>
      </div>
    </div>
  );
}
