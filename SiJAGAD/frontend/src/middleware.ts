import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // 1. CEK COOKIES
  const allCookies = request.cookies.getAll();

  // Deteksi token Supabase (format biasanya: sb-<projectid>-auth-token)
  // ATAU token manual jika ada
  const hasSession = allCookies.some(
    (cookie) =>
      (cookie.name.includes("sb-") && cookie.name.includes("-auth-token")) ||
      cookie.name === "token",
  );

  // 2. DEFINISI HALAMAN
  const isAuthPage = url.startsWith("/auth");
  const isDashboard = url.startsWith("/dashboard");
  const isRoot = url === "/";

  // --- LOGIKA REDIRECT (SATFAM) ---

  // KASUS 1: User SUDAH LOGIN
  if (hasSession) {
    // Jika mau buka halaman Login atau Landing Page, lempar langsung ke Dashboard
    // Biar user gak perlu login ulang atau liat landing page lagi
    if (isAuthPage || isRoot) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // KASUS 2: User BELUM LOGIN
  if (!hasSession) {
    // Jika nekat mau buka Dashboard, tendang ke halaman Auth
    if (isDashboard) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    // Jika buka Root (/), biarkan saja (biar bisa lihat Landing Page)
    // Tidak perlu redirect ke /auth, kecuali Anda mau aplikasi tertutup total.
  }

  return NextResponse.next();
}

// 🔥 UPDATE MATCHER AGAR ROOT (/) IKUT DI-CEK
export const config = {
  matcher: [
    "/", // Tambahkan ini agar Landing Page dicek
    "/dashboard/:path*",
    "/auth",
  ],
};
