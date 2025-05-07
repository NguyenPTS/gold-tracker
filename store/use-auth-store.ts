import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, redirectPath?: string) => void
  logout: () => void
  checkAuth: () => void
  clearStores: () => void  // Function to call other stores' clear methods
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (token: string, redirectPath?: string) => {
        // Lưu token vào cookie
        Cookies.set('access_token', token, {
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        })
        
        // Cập nhật state
        set({ token, isAuthenticated: true, isLoading: false })
        
        // Không chuyển hướng trực tiếp bằng window.location.href nữa
        // Router trong components sẽ xử lý
      },

      logout: () => {
        // Xóa token
        Cookies.remove('access_token')
        
        // Cập nhật state
        set({ token: null, isAuthenticated: false, isLoading: false })
        
        // Gọi clear stores
        get().clearStores()
        
        // Không chuyển hướng trực tiếp nữa
        // Router trong components sẽ xử lý
      },

      checkAuth: () => {
        // Client-side only
        if (typeof window === 'undefined') {
          return
        }
        
        // Kiểm tra token từ cookie
        const token = Cookies.get('access_token')
        const isAuthenticated = !!token
        
        // Log để debug
        console.log('[AuthStore] checkAuth - token exists:', !!token)
        
        // Cập nhật state
        set({ 
          token: token || null,
          isAuthenticated,
          isLoading: false
        })
        
        // Nếu không có token, clear stores
        if (!isAuthenticated) {
          get().clearStores()
        }
      },
      
      // This will be called by other stores as needed
      clearStores: () => {
        // Implementation will be empty initially
        // This prevents circular dependency
      }
    }),
    {
      name: 'auth-storage',
      // Chỉ lưu token vào storage
      partialize: (state) => ({ token: state.token }),
      // Only persist on client
      skipHydration: true
    }
  )
) 