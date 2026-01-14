import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Ambil semua cookies
  const allCookies = request.cookies.getAll();

  // 2. Cek apakah ada cookie berbau "sb-" (Supabase biasanya pakai sb-xxxx-auth-token)
  // ATAU cek cookie manual jika Anda set sendiri
  const hasSupabaseSession = allCookies.some(
    (cookie) =>
      cookie.name.includes("sb-") && cookie.name.includes("-auth-token")
  );

  // Opsi backup: Cek cookie 'token' manual (jika logic auth Anda set cookie ini)
  const hasManualToken = request.cookies.has("token");

  const isAuthenticated = hasSupabaseSession || hasManualToken;
  const isLoginPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // --- LOGIKA REDIRECT ---

  // Kalau mau ke Dashboard tapi GAK ADA token -> Tendang ke Auth
  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Kalau sudah login tapi mau buka halaman Auth -> Lempar ke Dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
