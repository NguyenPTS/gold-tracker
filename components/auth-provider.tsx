'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'

// Các route không cần xác thực
const publicRoutes = ['/login', '/register', '/auth-success']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    // Kiểm tra xác thực khi component mount
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Chỉ kiểm tra và xử lý navigation khi đã load xong và không đang ở trang auth-success
    if (!isLoading && pathname !== '/auth-success') {
      console.log(
        `[AuthProvider] Checking routes: path=${pathname}, authenticated=${isAuthenticated}, loading=${isLoading}`
      )

      // Nếu đang ở public route và đã xác thực -> chuyển về trang chính
      if (publicRoutes.includes(pathname) && isAuthenticated) {
        console.log('[AuthProvider] Authenticated user on public route, redirecting to /gold-price')
        router.push('/gold-price')
        return
      }

      // Nếu đang ở protected route và chưa xác thực -> chuyển về login
      if (!publicRoutes.includes(pathname) && !isAuthenticated) {
        console.log('[AuthProvider] Unauthenticated user on protected route, redirecting to /login')
        router.push('/login')
        return
      }
    }
  }, [pathname, isAuthenticated, isLoading, router])

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return children
} 