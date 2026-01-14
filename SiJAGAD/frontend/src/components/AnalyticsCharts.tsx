"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CreditCard, AlertTriangle, FileText } from "lucide-react";

// --- 1. DEFINISI TIPE DATA ---
interface PieChartData {
  name: string;
  value: number;
  color: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface BarChartData {
  name: string;
  total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AnalyticsSummary {
  total_surat: number;
  total_nominal: number;
  total_expired: number;
}

interface AnalyticsProps {
  data: {
    summary: AnalyticsSummary;
    pie_chart: PieChartData[];
    bar_chart: BarChartData[];
  };
}

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export default function AnalyticsCharts({ data }: AnalyticsProps) {
  // DEBUGGING: Cek data di Console Browser (F12)
  console.log("DATA ANALYTICS DITERIMA:", data);

  if (!data) return <div className="p-4 text-center">Menunggu data...</div>;

  return (
    <div className="space-y-6 mb-8">
      {/* 1. KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Nilai Jaminan
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {formatRupiah(data.summary.total_nominal)}
            </h3>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Total Dokumen
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {data.summary.total_surat} Surat
            </h3>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Perlu Perhatian
            </p>
            <h3 className="text-2xl font-bold text-red-600">
              {data.summary.total_expired} Vendor
            </h3>
          </div>
        </div>
      </div>

      {/* 2. BAGIAN GRAFIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Lingkaran */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">
            Status Garansi
          </h3>

          {/* PEMBUNGKUS GRAFIK DENGAN TINGGI PASTI */}
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pie_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.pie_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Batang */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 font-display">
            Top 5 Vendor
          </h3>

          {/* PEMBUNGKUS GRAFIK DENGAN TINGGI PASTI */}
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.bar_chart}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  style={{ fontSize: "11px", fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value))}
                  contentStyle={{ borderRadius: "12px" }}
                />
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
