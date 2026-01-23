"use client";

import {
  ClipboardList, // AE-1
  FileCheck, // AE-2
  FileText, // AE-3
  ShieldAlert, // AE-4
  CheckCircle, // Selesai
} from "lucide-react";

// ALUR SESUAI SURAT KDIV AKT No. 1624/KEU.02.03/DIVAKT/2015
const steps = [
  {
    id: 1,
    label: "BA Hasil Penelitian",
    icon: ClipboardList,
    desc: "Berita Acara & Penarikan",
    code: "AE-1",
  },
  {
    id: 2,
    label: "Penetapan Penarikan",
    icon: FileCheck,
    desc: "Penetapan Aset Ditarik",
    code: "AE-2",
  },
  {
    id: 3,
    label: "Usulan Penarikan",
    icon: FileText,
    desc: "Usulan Penghapusan",
    code: "AE-3",
  },
  {
    id: 4,
    label: "BA Penelitian",
    icon: ShieldAlert,
    desc: "Berita Acara Penelitian",
    code: "AE-4",
  },
  {
    id: 5,
    label: "Selesai",
    icon: CheckCircle,
    desc: "Proses Penghapusan Tuntas",
    code: "SELESAI",
  },
];

export default function StatusTracker({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="w-full py-8 px-4 overflow-x-auto">
      <div className="relative flex justify-between items-start min-w-[800px]">
        {/* Garis Background */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />

        {/* Garis Progress */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-pln-primary to-pln-accent -z-10 transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center group relative z-10"
            >
              {/* Lingkaran Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                  ${
                    isCompleted
                      ? "bg-pln-primary border-pln-primary text-white shadow-md"
                      : isCurrent
                        ? "bg-white border-pln-gold text-pln-gold scale-125 shadow-xl shadow-pln-gold/20"
                        : "bg-white border-gray-200 text-gray-300"
                  }`}
              >
                <Icon size={isCurrent ? 20 : 18} strokeWidth={2.5} />
              </div>

              {/* Label & Deskripsi */}
              <div className="mt-4 text-center max-w-[140px]">
                {/* Kode Dokumen (Badge) */}
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full mb-1 inline-block border
                  ${
                    isCompleted
                      ? "bg-green-50 text-green-600 border-green-200"
                      : isCurrent
                        ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                        : "bg-gray-50 text-gray-400 border-gray-100"
                  }`}
                >
                  {step.code}
                </span>

                <p
                  className={`text-xs font-bold uppercase tracking-tight transition-colors mb-1
                  ${
                    isCompleted || isCurrent
                      ? "text-pln-primary"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[10px] font-medium leading-tight transition-all
                  ${
                    isCurrent
                      ? "text-gray-600 opacity-100"
                      : "text-gray-400 opacity-80"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
