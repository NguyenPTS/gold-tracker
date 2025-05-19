import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  
  useEffect(() => {
    const token = Cookies.get('access_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  const login = (token: string) => {
    Cookies.set('access_token', token, { 
      expires: 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
    setIsAuthenticated(true)
    router.push('/gold-price')
  }

  const logout = () => {
    Cookies.remove('access_token')
    setIsAuthenticated(false)
    router.push('/login')
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  }
} 