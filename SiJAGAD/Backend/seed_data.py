import pandas as pd
import requests
import math
import os
from datetime import datetime

# --- KONFIGURASI ---
API_URL = "http://localhost:8000/letters"
TARGET_FILE = "DATA_MASTER.xlsx"

def clean_value(val):
    if pd.isna(val) or val == "": return ""
    return str(val).strip()

def clean_currency(val):
    """
    Memperbaiki logika nominal agar tidak 10x lipat.
    """
    if pd.isna(val) or val == "":
        return 0
    
    # FIX UTAMA: Jika sudah berupa angka (Integer/Float), langsung kembalikan
    # Jangan diubah ke string agar tidak muncul '.0'
    if isinstance(val, (int, float)):
        return int(val)
    
    # Jika berupa String (Teks), baru kita bersihkan
    s = str(val).replace("Rp", "").replace(" ", "")
    
    # Deteksi Format Indonesia (1.000.000,00)
    if "," in s:
        # Hapus titik (ribuan), ganti koma dengan titik (desimal)
        s = s.replace(".", "").replace(",", ".")
    else:
        # Jika hanya ada titik (misal 103.956.884), hapus titiknya
        s = s.replace(".", "")
        
    try:
        return int(float(s))
    except:
        return 0

def get_status(tgl_akhir):
    try:
        if not tgl_akhir or tgl_akhir == '-': return "Aktif"
        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"]:
            try:
                clean_date = str(tgl_akhir).split()[0]
                end_date = datetime.strptime(clean_date, fmt)
                if end_date < datetime.now():
                    return "Expired"
                return "Aktif"
            except ValueError:
                continue
        return "Aktif"
    except:
        return "Aktif"

def import_sheet(df, kategori_fix):
    success_count = 0
    fail_count = 0
    
    df.columns = df.columns.str.strip().str.upper()

    if 'VENDOR' not in df.columns:
        print(f"   ❌ ERROR: Kolom 'VENDOR' tidak ditemukan di sheet ini.")
        return 0, 0

    print(f"   📊 Memproses {len(df)} baris data untuk kategori: {kategori_fix}...\n")

    for index, row in df.iterrows():
        vendor = clean_value(row.get('VENDOR'))
        
        if not vendor or vendor.lower() == 'nan':
            continue

        tgl_akhir_raw = clean_value(row.get('TANGGAL AKHIR GARANSI', ''))
        tgl_akhir = tgl_akhir_raw if tgl_akhir_raw else '2025-12-31'
        if " " in str(tgl_akhir): tgl_akhir = str(tgl_akhir).split()[0]

        tgl_awal_kontrak = str(row.get('TANGGAL AWAL KONTRAK', '2024-01-01')).split()[0]
        tgl_awal_garansi = str(row.get('TANGGAL AWAL GARANSI', '2024-01-01')).split()[0]

        # Debugging Nominal (Opsional, akan print jika nominal besar)
        # nominal = clean_currency(row.get('NOMINAL JAMINAN', 0))
        # if nominal > 10000000000: # Jika lebih dari 10 Miliar, print warning
        #    print(f"      ⚠️ Info: Nominal besar terdeteksi pada {vendor}: {nominal}")

        payload = {
            "vendor": vendor,
            "pekerjaan": clean_value(row.get('PEKERJAAN', '-')),
            "nomor_kontrak": clean_value(row.get('NOMOR KONTRAK', '-')),
            "tanggal_awal_kontrak": tgl_awal_kontrak,
            "nominal_jaminan": clean_currency(row.get('NOMINAL JAMINAN', 0)),
            "jenis_garansi": clean_value(row.get('JENIS GARANSI', 'Bank Garansi')),
            "nomor_garansi": clean_value(row.get('NOMOR GARANSI', '-')),
            "bank_penerbit": clean_value(row.get('BANK PENERBIT', '-')),
            "tanggal_awal_garansi": tgl_awal_garansi,
            "tanggal_akhir_garansi": tgl_akhir,
            "status": get_status(tgl_akhir),
            "kategori": kategori_fix, 
            "lokasi": clean_value(row.get('LOKASI', 'Arsip Lama')),
            "user_email": "Auto Import"
        }

        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 200:
                print(f"   ✅ [OK] {vendor}")
                success_count += 1
            else:
                print(f"   ⚠️ [GAGAL] {vendor}: {response.text}")
                fail_count += 1
        except Exception as e:
            print(f"   ❌ [KONEKSI] {str(e)}")
            fail_count += 1
            
    return success_count, fail_count

def main():
    print(f"🚀 Memulai Import Spesifik (Nominal Fix) dari {TARGET_FILE}...\n")

    if not os.path.exists(TARGET_FILE):
        print(f"❌ ERROR: File '{TARGET_FILE}' tidak ditemukan!")
        return

    try:
        xls = pd.read_excel(TARGET_FILE, sheet_name=None, engine='openpyxl')
        
        total_success = 0
        total_fail = 0
        
        # 1. SHEET PELAKSANAAN
        found_pelaksanaan = False
        for sheet_name in xls.keys():
            if "PELAKSANAAN" in sheet_name.upper():
                print(f"\n📂 SHEET DITEMUKAN: '{sheet_name}' -> Import ke Jaminan Pelaksanaan")
                df = xls[sheet_name]
                s, f = import_sheet(df, "Jaminan Pelaksanaan")
                total_success += s
                total_fail += f
                found_pelaksanaan = True
                break 
        
        if not found_pelaksanaan:
            print("\n⚠️  WARNING: Sheet 'PELAKSANAAN' tidak ditemukan!")

        # 2. SHEET PEMELIHARAAN
        found_pemeliharaan = False
        for sheet_name in xls.keys():
            if "PEMELIHARAAN" in sheet_name.upper():
                print(f"\n📂 SHEET DITEMUKAN: '{sheet_name}' -> Import ke Jaminan Pemeliharaan")
                df = xls[sheet_name]
                s, f = import_sheet(df, "Jaminan Pemeliharaan")
                total_success += s
                total_fail += f
                found_pemeliharaan = True
                break 

        if not found_pemeliharaan:
            print("\n⚠️  WARNING: Sheet 'PEMELIHARAAN' tidak ditemukan!")

        print("\n" + "="*30)
        print(f"🎉 IMPORT SELESAI!")
        print(f"✅ Total Sukses: {total_success}")
        print(f"❌ Total Gagal : {total_fail}")
        print("="*30)

    except Exception as e:
        print(f"❌ Error Fatal: {str(e)}")

if __name__ == "__main__":
    main()