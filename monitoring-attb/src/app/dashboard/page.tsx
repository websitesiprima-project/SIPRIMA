"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  CheckCircle,
  Wallet,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import dynamic from "next/dynamic";

// --- IMPORT GRAFIK DINAMIS (Lazy Load) ---
const DistributionChart = dynamic(
  () =>
    import("../../components/DashboardCharts").then(
      (mod) => mod.DistributionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400 text-xs">
        Memuat Grafik...
      </div>
    ),
  },
);

const CompositionChart = dynamic(
  () =>
    import("../../components/DashboardCharts").then(
      (mod) => mod.CompositionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-full flex items-center justify-center text-gray-400 text-xs">
        Memuat...
      </div>
    ),
  },
);

// --- DEFINISI TIPE DATA ---
interface AssetData {
  id: string;
  jenis_aset: string;
  merk_type: string;
  nilai_buku: number;
  harga_tafsiran: number;
  current_step: number;
  created_at: string;
}

interface ChartData {
  name: string;
  count?: number;
  value?: number;
  [key: string]: string | number | undefined;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext: string;
}

const formatCurrencyShort = (num: number) => {
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(2).replace(".", ",")} M`;
  } else if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(0)} Jt`;
  } else {
    return `Rp ${num.toLocaleString("id-ID")}`;
  }
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100 h-32"
          ></div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAset: 0,
    totalNilaiBuku: 0,
    totalTafsiran: 0,
    selesai: 0,
    dalamProses: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<ChartData[]>([]);
  const [recentAssets, setRecentAssets] = useState<AssetData[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), getUserName()]);
      setLoading(false);
    };
    init();

    return () => controller.abort();
  }, []);

  const getUserName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserName(
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      );
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from("attb_assets")
        .select(
          "id, jenis_aset, merk_type, nilai_buku, harga_tafsiran, current_step, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const assets = (data || []) as AssetData[];

      // --- HITUNG STATISTIK ---
      const totalAset = assets.length;
      const totalNilaiBuku = assets.reduce(
        (acc, curr) => acc + (curr.nilai_buku || 0),
        0,
      );
      const totalTafsiran = assets.reduce(
        (acc, curr) => acc + (curr.harga_tafsiran || 0),
        0,
      );

      const selesai = assets.filter((item) => item.current_step === 6).length;
      const dalamProses = totalAset - selesai;

      setStats({
        totalAset,
        totalNilaiBuku,
        totalTafsiran,
        selesai,
        dalamProses,
      });
      setRecentAssets(assets.slice(0, 5));

      // --- CHART DATA ---
      const stepCounts = [0, 0, 0, 0, 0, 0];
      assets.forEach((item) => {
        const step = item.current_step || 1;
        if (step >= 1 && step <= 6) stepCounts[step - 1]++;
      });

      // UPDATE: Menambahkan AE-3, AE-4, dan menghapus Verif
      setChartData([
        { name: "AE-1", count: stepCounts[0] },
        { name: "AE-2", count: stepCounts[1] },
        { name: "AE-3", count: stepCounts[2] }, // Baru
        { name: "AE-4", count: stepCounts[3] }, // Baru (Menggantikan Verif)
        { name: "Setuju", count: stepCounts[4] },
        { name: "Selesai", count: stepCounts[5] },
      ]);

      const typeCounts: Record<string, number> = {};
      assets.forEach((item) => {
        const type = item.jenis_aset || "Lainnya";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      setPieData(
        Object.keys(typeCounts).map((key) => ({
          name: key,
          value: typeCounts[key],
        })),
      );
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-pln-primary">
            Dashboard Monitoring
          </h1>
          <p className="text-gray-500 mt-1">
            Halo, <span className="font-bold text-pln-accent">{userName}</span>
          </p>
        </div>
        <div className="text-left md:text-right bg-pln-gold/10 p-3 rounded-lg md:bg-transparent md:p-0">
          <p className="text-xs font-bold text-gray-500 uppercase">
            Estimasi Recovery
          </p>
          <p className="text-xl md:text-2xl font-bold text-pln-gold">
            {formatCurrencyShort(stats.totalTafsiran)}
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Aset"
          value={stats.totalAset}
          icon={<Package size={20} className="text-white" />}
          color="bg-pln-primary"
          subtext="Unit Terdaftar"
        />
        <StatCard
          title="Proses"
          value={stats.dalamProses}
          icon={<Activity size={20} className="text-white" />}
          color="bg-yellow-500"
          subtext="Sedang Berjalan"
        />
        <StatCard
          title="Selesai"
          value={stats.selesai}
          icon={<CheckCircle size={20} className="text-white" />}
          color="bg-green-600"
          subtext="Siap Hapus"
        />
        <StatCard
          title="Nilai Buku"
          value={formatCurrencyShort(stats.totalNilaiBuku)}
          icon={<Wallet size={20} className="text-white" />}
          color="bg-blue-800"
          subtext="Total SAP"
        />
      </div>

      {/* CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-pln-primary" /> Distribusi
            Tahapan
          </h3>
          <div className="h-64 w-full">
            <DistributionChart data={chartData} />
          </div>
        </div>

        {/* PIE CHART */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-bold text-gray-800 mb-4">Jenis Aset</h3>
          <div className="h-64 w-full">
            <CompositionChart data={pieData} />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & BUTTON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-sm">Aset Terbaru</h3>
            <Link
              href="/dashboard/tracking"
              className="text-xs text-pln-accent hover:underline flex items-center gap-1 font-medium"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${asset.current_step === 6 ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"}`}
                  >
                    {asset.current_step === 6 ? "OK" : `T${asset.current_step}`}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 line-clamp-1">
                      {asset.jenis_aset}
                    </p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">
                      {asset.merk_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-gray-700">
                    {formatCurrencyShort(asset.harga_tafsiran || 0)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(asset.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pln-primary to-pln-accent rounded-xl p-6 text-white shadow-lg flex flex-col justify-center text-center">
          <h3 className="font-bold text-lg mb-2">Input Data Baru</h3>
          <p className="text-white/80 text-xs mb-6">
            Pastikan dokumen pendukung sudah lengkap sebelum input.
          </p>
          <Link
            href="/dashboard/input"
            className="bg-white text-pln-primary py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md text-sm"
          >
            + Tambah Aset
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition-all">
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mb-0.5">{value}</h3>
          <p className="text-[10px] text-gray-400">{subtext}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
