import { create } from 'zustand'
import { Asset, assetApi, CreateAssetData } from '@/lib/api'

interface AssetState {
  assets: Asset[]
  loading: boolean
  error: string | null
  fetchAssets: () => Promise<void>
  addAsset: (data: CreateAssetData) => Promise<void>
  deleteAsset: (id: string | number) => Promise<void>
  updateAsset: (id: string | number, data: Partial<Omit<Asset, "id" | "createdAt" | "user">>) => Promise<void>
  clearAssets: () => void
}

export const useAssetStore = create<AssetState>()((set, get) => ({
  assets: [],
  loading: false,
  error: null,

  fetchAssets: async () => {
    try {
      // Avoid direct import from auth store to prevent circular dependency
      // Instead, we'll check token in the API layer
      set({ loading: true, error: null })
      console.log('[AssetStore] Fetching assets...')
      
      const assets = await assetApi.getAssets()
      console.log(`[AssetStore] Fetched ${assets.length} assets`)
      
      set({ assets, loading: false })
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể tải danh sách tài sản'
      console.error('[AssetStore] Error fetching assets:', errorMsg)
      set({ error: errorMsg, loading: false })
    }
  },

  addAsset: async (data: CreateAssetData) => {
    try {
      set({ loading: true, error: null })
      console.log('[AssetStore] Adding new asset:', data)
      
      // Validate data before sending
      if (!data.type) throw new Error('Loại vàng không hợp lệ')
      if (data.amount <= 0) throw new Error('Số lượng phải lớn hơn 0')
      if (data.buyPrice <= 0) throw new Error('Giá mua phải lớn hơn 0')
      
      const newAsset = await assetApi.createAsset(data)
      console.log('[AssetStore] Asset added successfully:', newAsset)
      
      set((state: AssetState) => ({ 
        assets: [...state.assets, newAsset],
        loading: false,
        error: null
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể thêm tài sản'
      console.error('[AssetStore] Error adding asset:', errorMsg)
      set({ error: errorMsg, loading: false })
      return Promise.reject(err)
    }
  },

  deleteAsset: async (id: string | number) => {
    try {
      set({ loading: true, error: null })
      console.log(`[AssetStore] Deleting asset with ID: ${id}`)
      
      await assetApi.deleteAsset(id)
      console.log(`[AssetStore] Asset with ID ${id} deleted successfully`)
      
      set((state: AssetState) => ({
        assets: state.assets.filter((asset: Asset) => asset.id !== id),
        loading: false,
        error: null
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể xóa tài sản'
      console.error(`[AssetStore] Error deleting asset ${id}:`, errorMsg)
      set({ error: errorMsg, loading: false })
      return Promise.reject(err)
    }
  },

  updateAsset: async (id: string | number, data: Partial<Omit<Asset, "id" | "createdAt" | "user">>) => {
    try {
      set({ loading: true, error: null })
      console.log(`[AssetStore] Updating asset with ID: ${id}`, data)
      
      const updatedAsset = await assetApi.updateAsset(id, data)
      console.log(`[AssetStore] Asset with ID ${id} updated successfully:`, updatedAsset)
      
      set((state: AssetState) => ({
        assets: state.assets.map((asset: Asset) => 
          asset.id === id ? updatedAsset : asset
        ),
        loading: false,
        error: null
      }))
      
      return Promise.resolve()
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể cập nhật tài sản'
      console.error(`[AssetStore] Error updating asset ${id}:`, errorMsg)
      set({ error: errorMsg, loading: false })
      return Promise.reject(err)
    }
  },

  // Clear assets khi logout
  clearAssets: () => {
    console.log('[AssetStore] Clearing all assets')
    set({ assets: [], loading: false, error: null })
  }
})) 