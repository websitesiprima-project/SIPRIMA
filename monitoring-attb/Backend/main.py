import os
from typing import Optional, List, Dict, Any, Union
from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# --- 1. SETUP ENVIRONMENT & KONEKSI ---
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or ""
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""

# Variabel Global Supabase
supabase: Union[Client, None] = None

if not url or not key:
    print(f"ERROR: Tidak bisa membaca credential dari {env_path}")
else:
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Warning: Supabase connection failed: {e}")
        supabase = None

# --- 2. SETUP FASTAPI ---
app = FastAPI(title="API Monitoring ATTB PLN", version="2.0.2")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. MODEL DATA (PYDANTIC) ---

class AssetInput(BaseModel):
    no_aset: str = Field(..., description="Nomor Aset (SAP)")
    jenis_aset: str
    merk_type: Optional[str] = None
    spesifikasi: Optional[str] = None
    jumlah: int = 1
    satuan: str = "Unit"
    konversi_kg: float = Field(..., description="Berat total dalam Kg")
    tahun_perolehan: int
    umur_pakai: int
    nilai_perolehan: float
    nilai_buku: float
    rupiah_per_kg: float = 4300 
    harga_tafsiran: float 
    lokasi: str
    keterangan: Optional[str] = None
    foto_url: Optional[str] = None 
    status: Optional[str] = "Draft"
    current_step: Optional[int] = 1
    input_by: Optional[str] = "System Admin" 

class AssetStatusUpdate(BaseModel):
    current_step: int
    status_text: str
    user_email: Optional[str] = "Admin"

class AssetDetailUpdate(BaseModel):
    jenis_aset: Optional[str] = None
    merk_type: Optional[str] = None
    spesifikasi: Optional[str] = None
    lokasi: Optional[str] = None
    keterangan: Optional[str] = None
    jumlah: Optional[int] = None
    satuan: Optional[str] = None
    nilai_buku: Optional[float] = None
    user_email: Optional[str] = "Admin"

# --- HELPER LOG ---
def create_log(asset_id: str, user_email: str, action: str, details: str):
    if supabase is None: return
    try:
        log_entry = {
            "asset_id": asset_id,
            "user_email": user_email,
            "action": action,
            "details": details,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table('activity_logs').insert(log_entry).execute()
    except Exception as e:
        print(f"⚠️ Log Error: {str(e)}")

# --- 4. API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "Ready", "system": "Monitoring ATTB Backend v2.0"}

# --- A. FITUR INPUT ---
@app.post("/api/assets/input", status_code=status.HTTP_201_CREATED)
def input_new_asset(asset: AssetInput):
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        try: data_payload = asset.model_dump() 
        except: data_payload = asset.dict()
            
        data_payload['harga_tafsiran'] = asset.konversi_kg * asset.rupiah_per_kg
        data_payload['created_at'] = datetime.utcnow().isoformat()
        
        response = supabase.table('attb_assets').insert(data_payload).execute()
        
        if not response.data or not isinstance(response.data, list) or len(response.data) == 0:
             raise HTTPException(400, "Gagal simpan")

        # FIX PYLANCE: Gunakan 'Any' agar fleksibel
        new_asset: Any = response.data[0]
        
        user_email = str(asset.input_by) if asset.input_by else "System Admin"
        asset_id = str(new_asset.get('id', ''))
        
        create_log(asset_id, user_email, "CREATE", f"Input aset baru: {asset.no_aset}")
        return {"success": True, "data": new_asset}

    except Exception as e:
        print(f"Input Error: {e}")
        raise HTTPException(500, f"Server Error: {e}")

# --- B. FITUR LISTING ---
@app.get("/api/assets/list")
def get_all_assets():
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        response = supabase.table('attb_assets').select("*").order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"List Error: {e}")
        raise HTTPException(500, f"Server Error: {e}")

# --- C. FITUR UPDATE STATUS ---
@app.patch("/api/assets/{asset_id}/update_status")
def update_asset_status(asset_id: str, update_data: AssetStatusUpdate):
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        response = supabase.table('attb_assets').update({
                "current_step": update_data.current_step,
                "status": update_data.status_text
            }).eq('id', asset_id).execute()

        if not response.data: raise HTTPException(404, "Aset tidak ditemukan")

        # FIX PYLANCE: Gunakan 'Any'
        data: Any = response.data[0]

        create_log(asset_id, update_data.user_email or "Admin", "UPDATE_STATUS", f"Status -> {update_data.status_text}")
        return {"message": "Status updated", "data": data}
    except Exception as e:
        raise HTTPException(500, "Gagal update status")

# --- D. FITUR UPDATE DETAIL ---
@app.patch("/api/assets/{asset_id}/update_details")
def update_asset_details(asset_id: str, update_data: AssetDetailUpdate):
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        try: payload = update_data.model_dump(exclude_unset=True)
        except: payload = update_data.dict(exclude_unset=True)
        
        user_email = payload.pop('user_email', 'Admin')
        
        if not payload:
            return {"message": "Tidak ada data yang berubah"}

        response = supabase.table('attb_assets').update(payload).eq('id', asset_id).execute()
        
        if not response.data: raise HTTPException(404, "Aset tidak ditemukan")

        # FIX PYLANCE: Gunakan 'Any'
        data: Any = response.data[0]

        create_log(asset_id, str(user_email), "UPDATE_DETAILS", "Edit data teknis aset")
        return {"success": True, "data": data}

    except Exception as e:
        print(f"Edit Error: {e}")
        raise HTTPException(500, f"Gagal edit aset: {e}")

# --- E. FITUR DELETE (REVISI: IDEMPOTENT / ANTI-ERROR) ---
@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str, user_email: str = "Admin"):
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        # Bersihkan ID dari spasi/karakter aneh
        clean_id = asset_id.strip()
        print(f"🗑️ Deleting Asset ID: {clean_id}")

        # 1. Hapus Log terkait (Abaikan jika gagal)
        try:
            supabase.table('activity_logs').delete().eq('asset_id', clean_id).execute()
        except:
            pass 

        # 2. Hapus Aset Utama
        response = supabase.table('attb_assets').delete().eq('id', clean_id).execute()
        
        # LOGIKA BARU: 
        # Walaupun data tidak ditemukan (response.data kosong), 
        # kita tetap return Sukses agar Frontend bisa refresh dan menghilangkan data tersebut dari layar.
        if not response.data:
            print(f"⚠️ Info: Data ID {clean_id} tidak ditemukan (mungkin sudah terhapus), tetap return sukses.")
            
        return {"message": "Aset berhasil dihapus / sudah tidak ada"}

    except Exception as e:
        print(f"❌ Delete Critical Error: {str(e)}")
        # Hanya return error jika benar-benar Server Crash
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
# --- F. FITUR DASHBOARD STATS ---
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    if supabase is None: raise HTTPException(503, "DB Offline")
    try:
        response = supabase.table('attb_assets').select("jenis_aset, current_step, harga_tafsiran").execute()
        
        # FIX PYLANCE: Gunakan List[Any] agar tidak konflik dengan tipe JSON
        data: List[Any] = response.data if response.data else []
        
        total_assets = len(data)
        
        # Fix Sum Loop: Pastikan nilai float, default 0 jika None
        total_value = sum(float(item.get('harga_tafsiran') or 0) for item in data)
        
        # Group by Kategori
        category_counts: Dict[str, int] = {}
        for item in data:
            cat = str(item.get('jenis_aset') or "Lainnya")
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
        # Group by Status
        status_counts: Dict[int, int] = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0}
        for item in data:
            # Fix Key Error: Pastikan step adalah Integer
            raw_step = item.get('current_step')
            step = int(raw_step) if raw_step is not None else 1
            
            if step in status_counts: 
                status_counts[step] += 1
            
        return {
            "total_assets": total_assets,
            "total_value": total_value,
            "by_category": [{"name": k, "value": v} for k,v in category_counts.items()],
            "by_status": [{"name": f"Tahap {k}", "value": v} for k,v in status_counts.items()]
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        raise HTTPException(500, f"Gagal hitung statistik: {e}")

# --- G. HISTORY LOG ---
@app.get("/api/assets/{asset_id}/logs")
def get_asset_logs(asset_id: str):
    if supabase is None: return []
    try:
        response = supabase.table('activity_logs').select("*").eq('asset_id', asset_id).order('created_at', desc=True).execute()
        return response.data if response.data else []
    except: return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)