"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"

interface UserInfo {
  email: string
  username: string
  firstName?: string
  lastName?: string
  picture?: string
  name?: string
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const getUserInfoFromCookie = () => {
      try {
        // Get all cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)

        console.log('All cookies:', cookies)

        // Find user_info cookie (using underscore instead of hyphen)
        if (cookies['user_info']) {
          const decodedInfo = decodeURIComponent(cookies['user_info'])
          console.log('Decoded user info:', decodedInfo)
          
          const parsedInfo = JSON.parse(decodedInfo)
          console.log('Parsed user info:', parsedInfo)

          if (parsedInfo) {
            // Ensure username is set
            parsedInfo.username = parsedInfo.username || parsedInfo.name || parsedInfo.email?.split('@')[0]
            setUserInfo(parsedInfo)
          }
        } else {
          console.log('No user_info cookie found')
        }
      } catch (error) {
        console.error('Error reading user info from cookie:', error)
      }
    }

    getUserInfoFromCookie()
  }, [])

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUserInfo(null)
    router.push("/login")
  }

  const getInitials = (user: UserInfo) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.name) {
      const nameParts = user.name.split(' ')
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return user.name[0].toUpperCase()
    }
    return user.username[0].toUpperCase()
  }

  const getDisplayName = (user: UserInfo) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.name || user.username
  }

  // Không hiển thị header ở các trang auth
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return null
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/gold-price" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-pulse" />
            <div className="absolute inset-0.5 bg-white dark:bg-slate-900 rounded-full" />
            <div className="absolute inset-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Gold Tracker
          </span>
        </Link>

        {userInfo ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-amber-200 dark:ring-amber-800">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userInfo.picture} alt={getDisplayName(userInfo)} />
                  <AvatarFallback className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    {getInitials(userInfo)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getDisplayName(userInfo)}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userInfo.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </header>
  )
} 