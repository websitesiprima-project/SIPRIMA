import { createClient } from "@supabase/supabase-js";

// --- KITA MASUKKAN LANGSUNG DI SINI AGAR TIDAK SALAH BACA .ENV ---
const supabaseUrl = "https://ivwtweloifwdfqzrlbjh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2d3R3ZWxvaWZ3ZGZxenJsYmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzQ5NjMsImV4cCI6MjA4MjAxMDk2M30.ahHP4-QM7UdQVb5fDccfw5Ig6-Ludp2RaKd59jbLWF0";

export const supabase = createClient(supabaseUrl, supabaseKey);
