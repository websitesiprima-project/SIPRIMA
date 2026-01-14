<div align="center">

  ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

</div>

<br />

# ⚡ SiJAGAD - Sistem Jaminan Garansi Digital

**SiJAGAD** adalah aplikasi monitoring surat jaminan (Jaminan Pelaksanaan & Pemeliharaan) berbasis web yang dikembangkan untuk **PT PLN (Persero) UPT Manado**. 

Aplikasi ini mendigitalisasi proses pengarsipan, mempermudah pelacakan lokasi fisik dokumen, serta memberikan notifikasi otomatis untuk jaminan yang akan segera berakhir (expire).

![SiJAGAD Dashboard Preview](https://github.com/user-attachments/assets/608afa02-6838-47b6-bed3-94df3c6ad9d1)

---

## 🚀 Fitur Utama

### 📊 Dashboard Monitoring
* **Statistik Real-time:** Menampilkan Total Nominal Jaminan, Jumlah Vendor, dan Surat yang Segera Expire.
* **Visualisasi Data:** Indikator warna untuk status surat (Baru/Aktif).

### 📝 Manajemen Surat (CRUD)
* **Input Data Lengkap:** Mencatat Vendor, Pekerjaan, Nilai Jaminan, hingga Tanggal Kontrak.
* **📍 Pelacakan Lokasi Fisik:** Fitur baru untuk mencatat lokasi penyimpanan fisik surat (Contoh: "Lemari A - Rak 2").
* **Upload PDF:** Penyimpanan dokumen digital aman menggunakan Supabase Storage.
* **Export Excel:** Unduh laporan data surat ke format `.xlsx` dengan satu klik.

### 🛡️ Keamanan & Log Aktivitas
* **Autentikasi:** Login aman menggunakan Supabase Auth.
* **Riwayat Aktivitas Spesifik:** Mencatat siapa yang melakukan aksi dengan detail target (Contoh: *"Admin menghapus surat PT. Karmel Jaya"*).

### 📧 Notifikasi Otomatis
* **Email Scheduler:** Skrip Python otomatis yang mengirim email peringatan H-30, H-14, dan H-7 sebelum masa berlaku jaminan habis.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun dengan arsitektur **Fullstack Modern** yang terpisah (Decoupled):

| Bagian | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** | Framework React untuk tampilan UI yang cepat dan responsif. |
| **Styling** | **Tailwind CSS** | Styling modern dan framer-motion untuk animasi halus. |
| **Backend** | **FastAPI (Python)** | API Server yang cepat untuk menangani logic dan database. |
| **Database** | **Supabase** | PostgreSQL Database + Authentication + File Storage. |
| **Deploy** | **Vercel** | Hosting untuk Frontend dan Backend. |

---

## 📂 Struktur Folder

```bash
sijagad-monitoring/
├── frontend/          # Source code Next.js (Tampilan Web)
│   ├── app/           # Halaman Dashboard, Login, dll
│   ├── components/    # Komponen UI (Modal, Tabel, Card)
│   └── public/        # Aset gambar statis
├── Backend/           # Source code Python (API Server)
│   ├── main.py        # Entry point API FastAPI
│   ├── requirements.txt # Daftar library Python
│   └── scheduler.py   # Skrip otomatisasi email
└── README.md          # Dokumentasi proyek
💻 Cara Menjalankan di Local (Komputer Sendiri)
Ikuti langkah ini jika ingin mengembangkan aplikasi di laptop Anda.

1. Clone Repository
Bash

git clone [https://github.com/username-anda/sijagad-monitoring.git](https://github.com/username-anda/sijagad-monitoring.git)
cd sijagad-monitoring
2. Setup Backend (Python)
Bash

cd Backend
# Buat virtual environment (Opsional tapi disarankan)
python -m venv venv
# Aktifkan venv (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Jalankan Server
uvicorn main:app --reload
Server Backend akan jalan di: http://localhost:8000

3. Setup Frontend (Next.js)
Buka terminal baru (jangan matikan terminal backend).

Bash

cd frontend
# Install library
npm install

# Jalankan Frontend
npm run dev
Buka browser di: http://localhost:3000

🔑 Konfigurasi Environment Variable
Pastikan Anda membuat file .env (untuk Backend) dan .env.local (untuk Frontend) dengan isi sebagai berikut:

Backend (Backend/.env):

Cuplikan kode

SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
SUPABASE_SERVICE_KEY=your-service-role-secret-key
EMAIL_SENDER=email-anda@gmail.com
EMAIL_PASSWORD=app-password-gmail-anda
Frontend (frontend/.env.local):

Cuplikan kode

NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_API_URL=http://localhost:8000  # Ganti link Vercel jika sudah deploy
🌐 Deployment
Proyek ini telah dideploy menggunakan Vercel.

Frontend URL: https://sijagad-frontend.vercel.app (Contoh)

Backend API: https://sijagad-api.vercel.app (Contoh)

👨‍💻 Author
Jeremia Paduli

Mahasiswa Teknik Informatika - Semester 5

Role: Fullstack Developer (Intern at PT PLN UPT Manado)

GitHub: JeremiaPaduli2311

<div align="center">


Made with ❤️ for PT PLN (Persero) UPT Manado </div>
