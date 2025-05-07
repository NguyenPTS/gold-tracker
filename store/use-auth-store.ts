import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  checkAuth: () => void
  clearStores: () => void
}

// Helper function to get token from multiple sources
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first
  const cookieToken = Cookies.get('access_token');
  if (cookieToken) return cookieToken;
  
  // Fallback to localStorage
  const localToken = localStorage.getItem('auth_token');
  if (localToken) {
    // If we found it in localStorage but not in cookie, restore the cookie
    console.log('[AuthStore] Restoring token from localStorage to cookie');
    Cookies.set('access_token', localToken, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return localToken;
  }
  
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (token: string) => {
        console.log('[AuthStore] Login called with token');
        
        // Lưu token vào cả hai nơi
        try {
          // Cookie với đường dẫn rõ ràng
          Cookies.set('access_token', token, {
            expires: 7,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
          
          // LocalStorage backup
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
          
          console.log('[AuthStore] Token saved to multiple storages');
        } catch (e) {
          console.error('[AuthStore] Error saving token:', e);
        }
        
        // Cập nhật state
        set({ token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        console.log('[AuthStore] Logout called');
        
        // Xóa token từ cả hai nơi
        try {
          Cookies.remove('access_token', { path: '/' });
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          
          console.log('[AuthStore] Token removed from all storages');
        } catch (e) {
          console.error('[AuthStore] Error removing token:', e);
        }
        
        // Cập nhật state
        set({ token: null, isAuthenticated: false, isLoading: false });
        
        // Gọi clear stores
        get().clearStores();
      },

      checkAuth: () => {
        // Client-side only
        if (typeof window === 'undefined') {
          console.log('[AuthStore] checkAuth - running on server side, skipping');
          return;
        }
        
        // Kiểm tra token từ nhiều nguồn
        const token = getStoredToken();
        
        // Log chi tiết để debug
        console.log('[AuthStore] checkAuth - Storage details:', {
          token: token ? `${token.substring(0, 10)}...` : 'none',
          hasCookie: !!Cookies.get('access_token'),
          hasLocalStorage: !!localStorage.getItem('auth_token'),
          allCookies: document.cookie,
          currentPath: window.location.pathname
        });
        
        // Xác định trạng thái xác thực
        const isAuthenticated = !!token;
        
        // Cập nhật state
        set({ 
          token: token,
          isAuthenticated,
          isLoading: false
        });
        
        // Nếu không có token, clear stores
        if (!isAuthenticated) {
          console.log('[AuthStore] No token found, clearing stores');
          get().clearStores();
        }
      },
      
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