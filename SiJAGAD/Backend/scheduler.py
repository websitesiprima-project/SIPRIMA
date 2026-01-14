import schedule
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from pathlib import Path

# --- 1. LOAD ENV SECARA ROBUST ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

print(f"📂 Lokasi Script: {Path(__file__).parent}")
print(f"📂 Mencari .env di: {env_path}")

# --- 2. FIX PYLANCE: Supabase Config ---
# Kita paksa tipe datanya menjadi string (: str) dan beri nilai default ""
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

# Validasi Manual
if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Supabase URL/Key kosong! Cek file .env Anda.")
    exit()
else:
    print("✅ SUCCESS: Supabase Env terbaca!")

# Setup Supabase (Sekarang Pylance sudah senang karena variabel pasti string)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 3. FIX PYLANCE: Email Config ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# Paksa tipe data string juga di sini
SENDER_EMAIL: str = os.getenv("SMTP_EMAIL", "")
SENDER_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

if not SENDER_EMAIL or not SENDER_PASSWORD:
    print("❌ ERROR: Email/Password pengirim belum di-set di file .env!")
    exit()

def send_email_alert(letters):
    if not letters:
        return

    subject = f"⚠️ Peringatan: {len(letters)} Jaminan Akan Expire!"
    
    rows = ""
    for l in letters:
        # Menggunakan .get() agar aman jika key tidak ada
        vendor = l.get('vendor', 'Unknown')
        nominal = l.get('nominal_jaminan', 0)
        exp = l.get('tanggal_akhir_garansi', '-')
        rows += f"<li><b>{vendor}</b> - {nominal} (Exp: {exp})</li>"
    
    body = f"""
    <h3>Laporan Harian SiJAGAD</h3>
    <p>Halo Admin, berikut adalah daftar jaminan yang akan berakhir dalam 30 hari ke depan:</p>
    <ul>{rows}</ul>
    <p>Mohon segera tindak lanjuti.</p>
    """

    msg = MIMEMultipart()
    # Pylance sekarang tahu SENDER_EMAIL adalah string, bukan None
    msg['From'] = SENDER_EMAIL
    msg['To'] = "admin.pln@gmail.com"
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        # Pylance aman di sini
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        # Pylance aman di sini
        server.sendmail(SENDER_EMAIL, "admin.pln@gmail.com", text)
        server.quit()
        print("✅ Email notifikasi berhasil dikirim!")
    except Exception as e:
        print(f"❌ Gagal kirim email: {e}")

def check_expiring_letters():
    print("🔍 Mengecek database...")
    today = datetime.now()
    next_30_days = today + timedelta(days=30)
    
    try:
        # Query Supabase
        res = supabase.table("letters").select("*") \
            .gte("tanggal_akhir_garansi", today.strftime('%Y-%m-%d')) \
            .lte("tanggal_akhir_garansi", next_30_days.strftime('%Y-%m-%d')) \
            .eq("is_deleted", False) \
            .execute() # Pastikan hanya ambil yang belum dihapus
        
        data = res.data
        if data and len(data) > 0:
            print(f"⚠️ Ditemukan {len(data)} surat mau expire.")
            send_email_alert(data)
        else:
            print("✅ Aman. Tidak ada surat yang mendesak.")
    except Exception as e:
        print(f"❌ Error saat query database: {e}")

# Jadwalkan setiap hari jam 08:00 Pagi
schedule.every().day.at("08:00").do(check_expiring_letters)

print("🚀 SiJAGAD Scheduler Berjalan... (Tekan Ctrl+C untuk berhenti)")

# Loop agar script tidak mati
while True:
    schedule.run_pending()
    time.sleep(60)