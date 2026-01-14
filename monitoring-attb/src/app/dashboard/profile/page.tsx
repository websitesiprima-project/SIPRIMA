"use client";

import { useEffect, useState } from "react";
// Perbaikan path manual: Mundur 3 langkah dari profile -> dashboard -> (dashboard) -> app -> src
import { supabase } from "../../../lib/supabaseClient";
import { User as UserIcon, Mail, Shield, Calendar, Award } from "lucide-react";
import type { User } from "@supabase/supabase-js"; // Import tipe data resmi

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) return <div className="p-10 text-center">Memuat profil...</div>;

  if (!user) return <div className="p-10 text-center">Anda belum login.</div>;

  const isAdmin =
    user.email?.includes("admin") || user.user_metadata?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-pln-primary mb-6">
        Profil Pengguna
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-pln-primary to-pln-accent relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <UserIcon size={40} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {user.user_metadata?.full_name || "Pengguna PLN"}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>

            <div
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold border
                ${
                  isAdmin
                    ? "bg-pln-gold/10 text-pln-primary border-pln-gold"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
            >
              <Shield size={16} />
              {isAdmin ? "ADMINISTRATOR" : "STAFF UNIT"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                <Mail size={18} />
                <span className="text-xs uppercase font-bold">
                  Email Korporat
                </span>
              </div>
              <p className="font-medium text-gray-800 pl-8">{user.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                <Calendar size={18} />
                <span className="text-xs uppercase font-bold">
                  Terdaftar Sejak
                </span>
              </div>
              <p className="font-medium text-gray-800 pl-8">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {isAdmin && (
              <div className="md:col-span-2 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-3 mb-2 text-yellow-700">
                  <Award size={18} />
                  <span className="text-xs uppercase font-bold">
                    Hak Akses Admin
                  </span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-800 pl-8 space-y-1">
                  <li>Dapat menginput aset baru (AE-1)</li>
                  <li>Dapat mengubah status verifikasi</li>
                  <li>Dapat menghapus data aset (Force Delete)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
