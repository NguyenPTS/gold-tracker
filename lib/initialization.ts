// This file handles initialization and cross-store dependencies
import { useAuthStore } from '@/store/use-auth-store'
import { useAssetStore } from '@/store/use-asset-store'

// Initialize stores and connect them
export function initializeStores() {
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
    initializeStores()
    // Run initial auth check
    useAuthStore.getState().checkAuth()
  }
} 