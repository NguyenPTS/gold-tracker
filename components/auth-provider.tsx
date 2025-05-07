'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'
import Cookies from 'js-cookie'

// Các route không cần xác thực
const publicRoutes = ['/login', '/register', '/auth-success']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    console.log('[AuthProvider] Initial auth check')
    // Kiểm tra trực tiếp từ cookie
    const hasToken = !!Cookies.get('access_token')
    console.log('[AuthProvider] Direct cookie check:', hasToken)
    
    // Đảm bảo store được cập nhật
    checkAuth()
    
    // Đánh dấu hoàn thành kiểm tra ban đầu
    setTimeout(() => {
      setInitialCheckDone(true)
    }, 300) // Ngắn delay để đảm bảo store cập nhật xong
  }, [checkAuth])

  // Xử lý redirect dựa trên trạng thái xác thực
  useEffect(() => {
    if (!initialCheckDone || isLoading || redirecting) return

    console.log('[AuthProvider] Auth state:', {
      path: pathname,
      isAuthenticated,
      isLoading,
      initialCheckDone,
      redirecting
    })

    // Nếu đang ở trang auth-success, không làm gì cả
    if (pathname === '/auth-success') {
      console.log('[AuthProvider] On auth-success page, skipping redirect')
      return
    }

    // Kiểm tra trực tiếp từ cookie
    const hasToken = !!Cookies.get('access_token')
    console.log('[AuthProvider] Token check:', { hasToken, isAuthenticated })
    
    // Kiểm tra nếu có sự khác biệt giữa cookie và state
    if (hasToken !== isAuthenticated) {
      console.log('[AuthProvider] Token/state mismatch, refreshing auth state')
      checkAuth()
      return
    }

    // Tránh vòng lặp redirect
    if (redirecting) return

    // Nếu đã xác thực và đang ở public route -> chuyển về trang chính
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      setRedirecting(true)
      console.log('[AuthProvider] Authenticated user on public route, redirecting to /gold-price')
      setTimeout(() => {
        router.replace('/gold-price')
        setRedirecting(false)
      }, 100)
      return
    }

    // Nếu chưa xác thực và đang ở protected route -> chuyển về login
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      setRedirecting(true)
      console.log('[AuthProvider] Unauthenticated user on protected route, redirecting to /login')
      setTimeout(() => {
        router.replace('/login')
        setRedirecting(false)
      }, 100)
      return
    }
  }, [pathname, isAuthenticated, isLoading, router, checkAuth, initialCheckDone, redirecting])

  // Hiển thị loading state
  if (isLoading || !initialCheckDone) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return children
} 