"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    // Gọi logout từ store (chỉ xóa token, cập nhật state)
    logout()
    
    // Sau đó dùng router để chuyển hướng
    console.log('[Header] Logging out, redirecting to /login')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-amber-50/80 backdrop-blur-sm dark:border-amber-800 dark:bg-slate-900/80">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link
          href="/gold-price"
          className="flex items-center gap-2 text-xl font-semibold text-amber-800 dark:text-amber-300"
        >
          <GoldIcon className="h-6 w-6" />
          <span>Gold Tracker</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center space-x-6 text-amber-700 dark:text-amber-400">
            <Link
              href="/gold-price"
              className="text-sm font-medium transition-colors hover:text-amber-900 dark:hover:text-amber-300"
            >
              Giá Vàng
            </Link>
            {isAuthenticated && (
              <Link
                href="/assets"
                className="text-sm font-medium transition-colors hover:text-amber-900 dark:hover:text-amber-300"
              >
                Tài Sản
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function GoldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v10" />
      <path d="M5 21h14c1 0 2-1 2-2V7l-5-4H8L3 7v12c0 1 1 2 2 2z" />
      <path d="M8 7V6" />
      <path d="M16 7V6" />
    </svg>
  )
} 