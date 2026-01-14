/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// --- STYLE PDF (CSS ala PDF) ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subHeader: {
    fontSize: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    textDecoration: "underline",
    textTransform: "uppercase",
  },
  text: {
    marginBottom: 10,
    textAlign: "justify",
  },
  table: {
    width: "100%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 25,
    alignItems: "center",
  },
  tableColLabel: {
    width: "30%",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableColValue: {
    width: "70%",
    padding: 5,
    fontSize: 10,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
    height: 200,
  },
  image: {
    width: "80%",
    height: "100%",
    objectFit: "contain",
    border: "1px solid #ccc",
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "30%",
    textAlign: "center",
  },
  signatureLine: {
    marginTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: "center",
    color: "grey",
  },
});

// --- COMPONENT PDF ---
interface AssetData {
  no_aset: string;
  jenis_aset: string;
  merk_type: string;
  lokasi: string;
  jumlah: number;
  satuan: string;
  spesifikasi?: string;
  foto_url?: string;
  current_step: number;
}

export const AssetDocument = ({ data }: { data: AssetData }) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* KOP SURAT */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            PT PLN (PERSERO) UID SULUTTENGGO
          </Text>
          <Text style={styles.subHeader}>UP3 MANADO - LOGISTIK & ASET</Text>
          <Text style={styles.subHeader}>
            Jl. Jendral Sudirman No. 2, Manado
          </Text>
        </View>

        {/* JUDUL */}
        <Text style={styles.title}>BERITA ACARA CEK FISIK ASET</Text>

        {/* ISI PEMBUKA */}
        <Text style={styles.text}>
          Pada hari ini,{" "}
          <Text style={{ fontWeight: "bold" }}>{currentDate}</Text>, telah
          dilakukan pemeriksaan fisik terhadap Aset Tetap Tidak Beroperasi
          (ATTB) dengan rincian sebagai berikut:
        </Text>

        {/* TABEL DATA */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Nomor Aset (SAP)</Text>
            <Text style={styles.tableColValue}>{data.no_aset}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Jenis Aset</Text>
            <Text style={styles.tableColValue}>{data.jenis_aset}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Merk / Tipe</Text>
            <Text style={styles.tableColValue}>{data.merk_type}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Lokasi</Text>
            <Text style={styles.tableColValue}>{data.lokasi}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Volume</Text>
            <Text style={styles.tableColValue}>
              {data.jumlah} {data.satuan}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Status Saat Ini</Text>
            <Text style={styles.tableColValue}>Tahap {data.current_step}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.tableColLabel}>Spesifikasi / Kondisi</Text>
            <Text style={styles.tableColValue}>{data.spesifikasi || "-"}</Text>
          </View>
        </View>

        <Text style={styles.text}>
          Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat
          dipergunakan sebagaimana mestinya dalam proses penghapusan/mutasi
          aset.
        </Text>

        {/* FOTO ASET (Jika Ada) */}
        {data.foto_url && (
          <View style={styles.imageContainer}>
            <Text style={{ marginBottom: 5, fontSize: 10, fontWeight: "bold" }}>
              Dokumentasi Fisik:
            </Text>
            {/* Menggunakan proxy cors jika perlu, tapi coba direct dulu */}
            <Image src={data.foto_url} style={styles.image} />
          </View>
        )}

        {/* TANDA TANGAN */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text>Diperiksa Oleh,</Text>
            <Text style={{ fontSize: 9 }}>Petugas Lapangan</Text>
            <View style={styles.signatureLine} />
            <Text style={{ marginTop: 5 }}>( ....................... )</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text>Mengetahui,</Text>
            <Text style={{ fontSize: 9 }}>Supervisor Logistik</Text>
            <View style={styles.signatureLine} />
            <Text style={{ marginTop: 5 }}>( ....................... )</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Dokumen ini digenerate otomatis oleh Sistem Monitoring ATTB pada{" "}
          {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};
