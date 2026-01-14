<div align="center">
  
  <img src="./public/logo.png" alt="ReValue Logo" width="200" height="auto" />

# ReValue: ATTB Monitoring System

**Sistem Informasi Manajemen Aset Tetap Tidak Beroperasi**

  <br>
  
  <img src="https://img.shields.io/badge/PLN-UPT%20Manado-008C45?style=for-the-badge&logo=lightning&logoColor=white" alt="PLN UPT Manado" />
  <img src="https://img.shields.io/badge/Status-Development-orange?style=for-the-badge" alt="Status Development" />
  <img src="https://img.shields.io/badge/Focus-Asset%20Recovery-blue?style=for-the-badge&logo=security-scorecard&logoColor=white" alt="Asset Recovery" />
  
  <br>
  <br>

  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next JS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  
</div>

---

## 📋 Tentang Proyek

**ReValue** adalah sistem monitoring berbasis web yang dirancang khusus untuk **PT PLN (Persero) UPT Manado**. Aplikasi ini bertujuan untuk mendigitalisasi proses administrasi dan pelacakan **Aset Tetap Tidak Beroperasi (ATTB)**.

Masalah utama yang diselesaikan oleh ReValue adalah:

1.  **Transparansi Proses:** Memantau tahapan administrasi penghapusan aset dari tahap inventarisasi (AE-1) hingga persetujuan akhir (AE-5).
2.  **Valuasi Aset:** Menghitung estimasi nilai _recovery_ (scrap value) secara otomatis berdasarkan berat dan kurs harga logam terkini.
3.  **Database Terpusat:** Menggantikan pencatatan manual dengan _cloud database_ yang aman dan dapat diakses _real-time_.

---

## 🌟 Fitur Unggulan

### 1. 📊 Executive Dashboard

Halaman utama yang menyajikan ringkasan strategis bagi manajemen:

- **Smart Stats:** Total nilai buku dan estimasi nilai tafsiran dalam format ringkas (Juta/Miliar).
- **Data Visualization:** Grafik batang distribusi tahapan dokumen dan diagram lingkaran komposisi jenis aset.
- **Real-time Activity:** Log aktivitas aset terbaru yang masuk ke dalam sistem.

### 2. 🚀 Progress Tracking (AE-1 s/d AE-5)

Sistem pelacakan visual yang intuitif:

- Menampilkan posisi dokumen aset (Tahap 1: Inventarisasi UP hingga Tahap 6: Penghapusan Selesai).
- Indikator warna untuk status (Pending, On-Progress, Completed).
- **Admin Control:** Fitur khusus admin untuk memajukan status tahapan aset hanya dengan _dropdown_.

### 3. 💰 Smart Valuation Calculator

Kalkulator pintar di halaman input:

- Mengonversi input berat material (Tembaga/Besi) menjadi Estimasi Rupiah secara otomatis.
- Format input mata uang otomatis (Auto-formatting) untuk mencegah kesalahan ketik nominal besar.

### 4. 🛡️ Role-Based Security

Keamanan akses bertingkat menggunakan **Supabase Auth & RLS (Row Level Security)**:

- **Admin:** Memiliki akses penuh (Input, Edit Status, Upload Foto, Melihat Data Sensitif).
- **Staff/Viewer:** Hanya dapat melihat dashboard monitoring dan tracking tanpa izin mengubah data.
- **Proteksi Rute:** Middleware yang mencegah akses tidak sah ke halaman khusus admin.

---

## 🛠️ Arsitektur Teknologi

Sistem ini dibangun dengan pendekatan **Modern Full-Stack** yang memisahkan _Frontend_ dan _Backend Logic_ untuk performa maksimal:

| Komponen        | Teknologi                        | Fungsi Utama                                    |
| :-------------- | :------------------------------- | :---------------------------------------------- |
| **Frontend**    | **Next.js 14 (App Router)**      | Antarmuka pengguna (UI), Routing, SSR.          |
| **Styling**     | **Tailwind CSS + Framer Motion** | Desain responsif dan animasi interaktif.        |
| **Backend API** | **Python (FastAPI)**             | Logika bisnis, kalkulasi data, validasi input.  |
| **Database**    | **Supabase (PostgreSQL)**        | Penyimpanan data relasional dan manajemen user. |
| **Storage**     | **Supabase Storage**             | Penyimpanan bukti foto fisik aset.              |
| **Charts**      | **Recharts**                     | Visualisasi data statistik pada dashboard.      |

---

## 📸 Alur Kerja Sistem

1.  **Input Data (Admin):** Admin memasukkan data aset (No SAP, Spesifikasi, Foto, Berat) melalui form digital.
2.  **Processing (Backend):** Python Backend menghitung nilai tafsiran dan menyimpan data ke Database.
3.  **Monitoring (Dashboard):** Data muncul secara _real-time_ di Dashboard dalam bentuk grafik dan angka.
4.  **Update Status:** Admin memperbarui status dokumen seiring berjalannya proses persetujuan (misal: dari UP ke UPI).
5.  **Completion:** Aset mencapai tahap AE-5 (Penghapusan) dan tercatat sebagai nilai _recovery_ bagi perusahaan.

---

<div align="center">
  <small>&copy; 2024 ReValue System - PT PLN (Persero) UPT Manado. All Rights Reserved.</small>
</div>
