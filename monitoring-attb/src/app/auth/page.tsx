"use client";

import { useState } from "react";
// Pastikan path ini benar. Jika file ini di src/app/auth/page.tsx, maka mundur 2 langkah ke lib.
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowLeft, Mail, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Reset error

    try {
      if (isLogin) {
        // --- 1. LOGIKA LOGIN ---
        console.log("Mencoba login dengan:", email);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        console.log("Login sukses:", data);
        toast.success("Login Berhasil! Mengalihkan...");

        // Paksa refresh router agar state auth terupdate
        router.refresh();
        router.push("/dashboard/tracking");
      } else {
        // --- 2. LOGIKA DAFTAR ---
        console.log("Mencoba daftar user:", email);

        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
              role: "staff", // Default role
            },
          },
        });

        if (error) throw error;

        // Cek apakah butuh verifikasi email (jika setting Supabase belum diubah)
        if (data.session === null && data.user) {
          toast.success("Pendaftaran sukses! Cek email untuk verifikasi.");
          setErrorMsg(
            "Cek email Anda dan klik link verifikasi untuk bisa login."
          );
        } else {
          toast.success("Pendaftaran Berhasil! Anda sudah login.");
          router.push("/dashboard/tracking");
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      const pesan = error.message || "Terjadi kesalahan sistem";
      setErrorMsg(pesan);
      toast.error(pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pln-primary to-pln-accent p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 text-white flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity z-10"
      >
        <ArrowLeft size={20} /> Kembali ke Beranda
      </Link>

      <motion.div
        layout
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px]"
      >
        {/* Sisi Kiri: Visual */}
        <div className="w-full md:w-5/12 bg-gray-50 p-8 flex flex-col justify-center items-center text-center border-r border-gray-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-pln-gold rounded-xl rotate-45 mb-6 shadow-lg shadow-pln-gold/40 flex items-center justify-center mx-auto">
              <div className="w-10 h-10 bg-white -rotate-45" />
            </div>
            <h2 className="text-2xl font-bold text-pln-primary mb-2">
              Sistem ATTB
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isLogin ? "Masuk untuk mengelola aset." : "Daftar Staff Baru."}
            </p>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pln-primary/10 rounded-full blur-2xl" />
          <div className="absolute top-10 right-10 w-20 h-20 bg-pln-gold/20 rounded-full blur-xl" />
        </div>

        {/* Sisi Kanan: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
          {/* SWITCH BUTTONS */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full max-w-xs mx-auto md:mx-0">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg("");
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                isLogin
                  ? "bg-white shadow text-pln-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg("");
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                !isLogin
                  ? "bg-white shadow text-pln-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Daftar Baru
            </button>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
          </h3>

          {/* ERROR ALERT BOX */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative mb-4">
                    <User
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Pegawai"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pln-accent text-sm"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@pln.co.id"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pln-accent text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pln-accent text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pln-primary hover:bg-pln-accent text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 mt-6 disabled:opacity-70 transition-all active:scale-95"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                "Masuk Sekarang"
              ) : (
                "Daftar Akun"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
