import { create } from 'zustand'
import { Asset, assetApi } from '@/lib/api'

interface AssetState {
  assets: Asset[]
  loading: boolean
  error: string | null
  fetchAssets: () => Promise<void>
  addAsset: (data: Omit<Asset, "id" | "createdAt">) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  updateAsset: (id: string, data: Partial<Omit<Asset, "id" | "createdAt">>) => Promise<void>
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
      const assets = await assetApi.getAssets()
      set({ assets, loading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải danh sách tài sản', loading: false })
      console.error(err)
    }
  },

  addAsset: async (data: Omit<Asset, "id" | "createdAt">) => {
    try {
      set({ loading: true, error: null })
      const newAsset = await assetApi.createAsset(data)
      set((state: AssetState) => ({ 
        assets: [...state.assets, newAsset],
        loading: false 
      }))
    } catch (err: any) {
      set({ error: err?.message || 'Không thể thêm tài sản', loading: false })
      console.error(err)
      throw err
    }
  },

  deleteAsset: async (id: string) => {
    try {
      set({ loading: true, error: null })
      await assetApi.deleteAsset(id)
      set((state: AssetState) => ({
        assets: state.assets.filter((asset: Asset) => asset.id !== id),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err?.message || 'Không thể xóa tài sản', loading: false })
      console.error(err)
      throw err
    }
  },

  updateAsset: async (id: string, data: Partial<Omit<Asset, "id" | "createdAt">>) => {
    try {
      set({ loading: true, error: null })
      const updatedAsset = await assetApi.updateAsset(id, data)
      set((state: AssetState) => ({
        assets: state.assets.map((asset: Asset) => 
          asset.id === id ? updatedAsset : asset
        ),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err?.message || 'Không thể cập nhật tài sản', loading: false })
      console.error(err)
      throw err
    }
  },

  // Clear assets khi logout
  clearAssets: () => {
    set({ assets: [], loading: false, error: null })
  }
})) 