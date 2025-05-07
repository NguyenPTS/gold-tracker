import { API_CONFIG } from './config';
import Cookies from 'js-cookie';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  requiresAuth?: boolean;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, requiresAuth = true, headers: customHeaders, ...fetchOptions } = options;
  
  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Read token from cookie directly to avoid circular dependencies
  const token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && requiresAuth ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(customHeaders as Record<string, string>),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized in a clean way
        // Instead of direct store imports, clear cookie
        Cookies.remove('access_token');
        
        // For SPA client-side navigation
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export interface GoldPrice {
  row: string;
  name: string;
  type: string;
  purity: string;
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
}

export const goldApi = {
  getLatestPrices: () => 
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.latest, { requiresAuth: false }),
  
  getPriceHistory: () => 
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.history, { requiresAuth: false }),
  
  getPricesByType: (type: string) => 
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.byType(type), { requiresAuth: false }),
};

export interface Asset {
  id: string
  type: string
  amount: number
  buyPrice: number
  note: string
  createdAt: string
}

export const assetApi = {
  // Lấy danh sách tài sản
  getAssets: () => 
    fetchApi<Asset[]>(API_CONFIG.endpoints.assets.list),
  
  // Thêm tài sản mới
  createAsset: (data: Omit<Asset, "id" | "createdAt">) => 
    fetchApi<Asset>(API_CONFIG.endpoints.assets.create, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Xóa tài sản
  deleteAsset: (id: string) => 
    fetchApi(API_CONFIG.endpoints.assets.delete(id), {
      method: 'DELETE',
    }),
  
  // Cập nhật tài sản
  updateAsset: (id: string, data: Partial<Omit<Asset, "id" | "createdAt">>) => 
    fetchApi<Asset>(API_CONFIG.endpoints.assets.update(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginData) => 
    fetchApi<LoginResponse>(API_CONFIG.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    }),
  
  logout: () => {
    // Chỉ xóa cookie, không chuyển hướng
    if (typeof window !== 'undefined') {
      Cookies.remove('access_token');
    }
    return Promise.resolve();
  },
  
  getProfile: () => 
    fetchApi(API_CONFIG.endpoints.auth.profile),

  googleLogin: () => {
    // Redirect to Google OAuth endpoint with auth-success as redirect URI
    const redirectUri = `${window.location.origin}/auth-success`;
    const encodedRedirect = encodeURIComponent(redirectUri);
    window.location.href = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.google}?redirect_uri=${encodedRedirect}`;
  },

  googleCallback: (code: string) =>
    fetchApi<LoginResponse>(API_CONFIG.endpoints.auth.googleCallback, {
      params: { code },
      requiresAuth: false,
    }),
}; 