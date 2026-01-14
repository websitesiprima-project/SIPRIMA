"use client";
import { useEffect, useState } from "react";
import { Clock, User, AlertCircle } from "lucide-react";
// Sesuaikan path import ini dengan lokasi file supabaseClient Anda
import { supabase } from "../lib/supabaseClient";

// Tipe data untuk Log
interface LogItem {
  id: number;
  action: string;
  details: string;
  user_email: string;
  created_at: string;
  asset_id: string;
}

export default function AssetHistory({ assetId }: { assetId: string }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!assetId) return;

      try {
        setLoading(true);

        // --- PERBAIKAN: QUERY LANGSUNG KE SUPABASE ---
        // Mengambil data dari tabel 'activity_logs'
        const { data, error } = await supabase
          .from("activity_logs") // Pastikan nama tabel ini sesuai di Supabase Anda
          .select("*")
          .eq("asset_id", assetId)
          .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

        if (error) {
          throw error;
        }

        setLogs(data || []);
      } catch (error) {
        console.error("Gagal ambil log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [assetId]);

  if (loading)
    return (
      <div className="text-gray-400 text-xs italic p-4 flex items-center justify-center h-full">
        Memuat riwayat...
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wide sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <Clock size={16} className="text-pln-primary" /> Riwayat & Audit Trail
      </h3>

      <div className="space-y-0 relative border-l-2 border-gray-100 ml-2 pl-6 pb-2">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <AlertCircle size={16} />
            <span className="italic">Belum ada aktivitas tercatat.</span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="relative mb-8 last:mb-0 group animate-in fade-in slide-in-from-left-2 duration-300"
            >
              {/* Titik Timeline */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 bg-white border-2 border-pln-primary rounded-full group-hover:scale-110 transition-transform shadow-sm"></div>

              {/* Tanggal & Jam */}
              <p className="text-[10px] text-gray-400 font-mono mb-0.5">
                {new Date(log.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* Aksi Utama */}
              <h4 className="font-bold text-gray-800 text-sm">{log.action}</h4>

              {/* Detail */}
              <p className="text-gray-600 text-xs mt-1 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                {log.details}
              </p>

              {/* User yg melakukan */}
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">
                <User size={10} /> {log.user_email || "System"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
