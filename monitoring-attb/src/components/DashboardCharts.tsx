// File: src/components/DashboardCharts.tsx
"use client";

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

const COLORS = [
  "#008C45", // Hijau PLN
  "#1E3A8A", // Biru Tua
  "#F9A825", // Kuning/Emas
  "#EF4444", // Merah
  "#8B5CF6", // Ungu
  "#EC4899", // Pink
];

export interface ChartItem {
  name: string;
  value?: number;
  count?: number;
  // Index signature ini mengizinkan properti tambahan (opsional, agar fleksibel untuk Recharts)
  [key: string]: string | number | undefined;
}

interface ChartProps {
  data: ChartItem[];
}

// Komponen 1: Grafik Batang (Distribusi)
export function DistributionChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
        <Tooltip
          cursor={{ fill: "#f3f4f6" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Bar
          dataKey="count"
          fill="#00A2E9"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Komponen 2: Grafik Pie (Jenis Aset)
export function CompositionChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: "8px" }} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
