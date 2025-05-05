import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Các route không cần authentication
const publicRoutes = ['/login', '/register', '/forgot-password']
// Các route liên quan đến auth
const authRoutes = ['/login', '/register', '/forgot-password']
// Các route callback từ OAuth
const callbackRoutes = ['/auth/google/callback', '/auth-success']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)
  const isCallbackRoute = callbackRoutes.some(route => pathname.startsWith(route))
  const token = request.cookies.get('auth-token')?.value

  // Cho phép truy cập các route callback mà không cần kiểm tra auth
  if (isCallbackRoute) {
    return NextResponse.next()
  }

  // Nếu đã đăng nhập và cố truy cập trang auth (login/register/forgot-password)
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/gold-price', request.url))
  }

  // Nếu chưa đăng nhập và cố truy cập trang private
  if (!token && !isPublicRoute && !isCallbackRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Chỉ áp dụng middleware cho các route cần thiết
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 