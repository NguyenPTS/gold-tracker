import { API_CONFIG } from './config';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
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
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.latest),
  
  getPriceHistory: () => 
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.history),
  
  getPricesByType: (type: string) => 
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.byType(type)),
};

export const assetsApi = {
  list: () => 
    fetchApi(API_CONFIG.endpoints.assets.list),
  
  create: (data: any) => 
    fetchApi(API_CONFIG.endpoints.assets.create, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) => 
    fetchApi(API_CONFIG.endpoints.assets.update(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) => 
    fetchApi(API_CONFIG.endpoints.assets.delete(id), {
      method: 'DELETE',
    }),
};

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
    }),
  
  logout: () => 
    fetchApi(API_CONFIG.endpoints.auth.logout),
  
  getProfile: () => 
    fetchApi(API_CONFIG.endpoints.auth.profile),

  googleLogin: () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.google}`;
  },

  googleCallback: (code: string) =>
    fetchApi<LoginResponse>(API_CONFIG.endpoints.auth.googleCallback, {
      params: { code },
    }),
}; 