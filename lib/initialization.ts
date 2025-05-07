// This file handles initialization and cross-store dependencies
import { useAuthStore } from '@/store/use-auth-store'
import { useAssetStore } from '@/store/use-asset-store'
import Cookies from 'js-cookie'

// Initialize stores and connect them
export function initializeStores() {
  console.log('[Initialization] Setting up store connections')
  
  // Get direct references to store methods
  const { clearAssets } = useAssetStore.getState()
  
  // Set up clear function in auth store
  useAuthStore.setState({
    clearStores: () => {
      // Clear assets
      clearAssets()
      // Add other stores to clear here as needed
    }
  })
}

// Should be called once on app initialization
export function bootstrapApp() {
  if (typeof window !== 'undefined') {
    console.log('[Initialization] Bootstrapping app')
    
    // Initialize store connections
    initializeStores()
    
    // Check if we have token in cookies directly
    const token = Cookies.get('access_token')
    console.log('[Initialization] Initial token check:', token ? 'Token exists' : 'No token')
    
    // Run initial auth check from store
    useAuthStore.getState().checkAuth()
  }
} 