export interface Letter {
  id: number;
  vendor: string;
  pekerjaan: string;
  nomor_kontrak: string;
  nominal_jaminan: number;
  tanggal_akhir_garansi: string;
  status: string;
  kategori: string;
  is_deleted: boolean;
}
