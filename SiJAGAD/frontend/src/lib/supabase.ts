import { createClient } from "@supabase/supabase-js";

// 1. Ambil dari environment variable
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. DEBUGGING: Cek apakah terbaca?
// Lihat di Terminal VS Code Anda saat dijalankan
console.log("--- DEBUG SUPABASE CONFIG ---");
console.log("URL Terbaca:", supabaseUrl ? "YA" : "TIDAK");
console.log("Key Terbaca:", supabaseKey ? "YA" : "TIDAK");

// 3. Pengecekan Keras (Hard Check)
// Jika kosong, aplikasi akan stop dan kasih tau Anda.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "FATAL: Supabase URL atau Anon Key tidak ditemukan di .env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
