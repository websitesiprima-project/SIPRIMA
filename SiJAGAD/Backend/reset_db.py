import os
from dotenv import load_dotenv
from supabase import create_client

# 1. Load Environment Variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Pastikan file .env sudah benar!")
    exit()

# 2. Koneksi ke Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def wipe_database():
    print("⚠️  PERINGATAN: Ini akan MENGHAPUS SEMUA DATA SURAT di Database!")
    confirm = input("Ketik 'Y' jika Anda yakin ingin menghapus semua data: ")
    
    if confirm.lower() != 'y':
        print("❌ Dibatalkan.")
        return

    print("\n⏳ Sedang menghapus data...")
    
    try:
        # Menghapus data dimana ID tidak sama dengan 0 (Artinya semua data)
        response = supabase.table("letters").delete().neq("id", 0).execute()
        
        # Cek hasil
        # Supabase mengembalikan data yang dihapus
        deleted_count = len(response.data) if response.data else 0
        
        print(f"✅ BERHASIL! {deleted_count} surat telah dihapus bersih.")
        print("🚀 Database Anda sekarang kosong dan siap di-import ulang.")
        
    except Exception as e:
        print(f"❌ Terjadi kesalahan: {e}")

if __name__ == "__main__":
    wipe_database()