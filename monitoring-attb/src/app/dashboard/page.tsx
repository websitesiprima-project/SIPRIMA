"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  Wallet,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const COLORS = [
  "#008C45",
  "#1E3A8A",
  "#F9A825",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

// --- 1. DEFINISI TIPE DATA ---
interface AssetData {
  id: string;
  jenis_aset: string;
  merk_type: string;
  no_aset: string;
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

// --- HELPER: Format Uang ---
const formatCurrencyShort = (num: number) => {
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(2).replace(".", ",")} M`;
  } else if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(0)} Jt`;
  } else {
    return `Rp ${num.toLocaleString("id-ID")}`;
  }
};

// --- KOMPONEN ANIMASI LOADING (SKELETON) ---
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="hidden md:block space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded ml-auto"></div>
          <div className="h-8 w-40 bg-gray-200 rounded-lg ml-auto"></div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100 h-32 flex justify-between"
          >
            <div className="space-y-3 w-full">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 h-80">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-56 bg-gray-100 rounded-lg w-full"></div>
        </div>
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 h-80">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto mt-8"></div>
        </div>
      </div>
    </div>
  );
}

// --- PAGE UTAMA ---
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
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), getUserName()]);
    };
    init();
  }, []);

  const getUserName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserName(
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
      );
    }
  };

  const fetchDashboardData = async () => {
    try {
      // --- PERBAIKAN: GANTI FETCH LOCALHOST DENGAN SUPABASE ---
      // Mengambil data dari tabel 'attb_assets' langsung
      const { data, error } = await supabase
        .from("attb_assets") // Pastikan nama tabel sesuai
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Casting data (Supabase mengembalikan any[], kita pastikan bentuknya AssetData[])
      const assets = (data || []) as AssetData[];

      // --- HITUNG STATISTIK DI CLIENT SIDE (PENGGANTI LOGIC PYTHON) ---

      const totalAset = assets.length;

      // Hitung Total Nilai Buku
      const totalNilaiBuku = assets.reduce(
        (acc: number, curr: AssetData) => acc + (curr.nilai_buku || 0),
        0
      );

      // Hitung Total Tafsiran
      const totalTafsiran = assets.reduce(
        (acc: number, curr: AssetData) => acc + (curr.harga_tafsiran || 0),
        0
      );

      // Hitung Status
      const selesai = assets.filter(
        (item: AssetData) => item.current_step === 6
      ).length;
      const dalamProses = totalAset - selesai;

      // Set State Statistik Utama
      setStats({
        totalAset,
        totalNilaiBuku,
        totalTafsiran,
        selesai,
        dalamProses,
      });

      // Set 5 Aset Terbaru
      setRecentAssets(assets.slice(0, 5));

      // --- DATA CHART BAR (Step Distribution) ---
      const stepCounts = [0, 0, 0, 0, 0, 0];
      assets.forEach((item: AssetData) => {
        // Pastikan current_step valid (1-6)
        const step = item.current_step || 1;
        if (step >= 1 && step <= 6) {
          stepCounts[step - 1]++;
        }
      });

      setChartData([
        { name: "AE-1 (Inv)", count: stepCounts[0] },
        { name: "AE-2 (UPI)", count: stepCounts[1] },
        { name: "AE-4 (SPI)", count: stepCounts[2] },
        { name: "Verif Pusat", count: stepCounts[3] },
        { name: "Persetujuan", count: stepCounts[4] },
        { name: "Selesai", count: stepCounts[5] },
      ]);

      // --- DATA PIE CHART (Jenis Aset) ---
      const typeCounts: Record<string, number> = {};
      assets.forEach((item: AssetData) => {
        const type = item.jenis_aset || "Lainnya";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const pieChartData = Object.keys(typeCounts).map((key) => ({
        name: key,
        value: typeCounts[key],
      }));
      setPieData(pieChartData);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-pln-primary">
            Dashboard Monitoring ATTB
          </h1>
          <p className="text-gray-500 mt-1">
            Selamat datang,{" "}
            <span className="font-bold text-pln-accent">{userName}</span>.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Estimasi Recovery
          </p>
          <p className="text-2xl font-bold text-pln-gold">
            {formatCurrencyShort(stats.totalTafsiran)}
          </p>
        </div>
      </div>

      {/* ROW 1: STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Aset Terdaftar"
          value={stats.totalAset}
          icon={<Package size={24} className="text-white" />}
          color="bg-pln-primary"
          subtext="Unit ATTB"
        />
        <StatCard
          title="Sedang Berproses"
          value={stats.dalamProses}
          icon={<Activity size={24} className="text-white" />}
          color="bg-yellow-500"
          subtext="Dokumen Berjalan"
        />
        <StatCard
          title="Siap Hapus (AE-5)"
          value={stats.selesai}
          icon={<CheckCircle size={24} className="text-white" />}
          color="bg-green-600"
          subtext="Selesai Administrasi"
        />
        <StatCard
          title="Total Nilai Buku"
          value={formatCurrencyShort(stats.totalNilaiBuku)}
          icon={<Wallet size={24} className="text-white" />}
          color="bg-blue-800"
          subtext="Aset Tercatat SAP"
        />
      </div>

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-pln-primary" />
            Distribusi Tahapan Dokumen
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#00A2E9"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Komposisi Aset</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: RECENT & TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Aktivitas Aset Terbaru</h3>
            <Link
              href="/dashboard/tracking"
              className="text-sm text-pln-accent hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAssets.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Belum ada data aset.
              </div>
            ) : (
              recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
                                    ${
                                      asset.current_step === 6
                                        ? "bg-green-100 text-green-600"
                                        : "bg-blue-50 text-blue-600"
                                    }`}
                    >
                      {asset.current_step === 6
                        ? "OK"
                        : `T${asset.current_step}`}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {asset.jenis_aset}
                      </p>
                      <p className="text-xs text-gray-500">{asset.merk_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-700">
                      {formatCurrencyShort(asset.harga_tafsiran || 0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(asset.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pln-primary to-pln-accent rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Tips Admin</h3>
            <p className="text-pln-gold text-sm mb-4 opacity-90">
              Gunakan format angka dengan titik saat input nilai buku.
            </p>
          </div>
          <Link
            href="/dashboard/input"
            className="mt-6 bg-white text-pln-primary text-center py-3 rounded-lg font-bold hover:bg-pln-gold transition-colors shadow-lg"
          >
            + Input Usulan Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- STAT CARD COMPONENT ---
function StatCard({ title, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-xs text-gray-400">{subtext}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${color}`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${color}`}
      ></div>
    </div>
  );
}
