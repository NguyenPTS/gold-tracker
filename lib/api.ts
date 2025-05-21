import { API_CONFIG } from "./config";
import Cookies from "js-cookie";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  requiresAuth?: boolean;
}

// Helper để lấy token từ nhiều nguồn
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // 1. Thử lấy từ cookie

  
  const cookieToken = Cookies.get("access_token");
  if (cookieToken) return cookieToken;

  // 2. Thử lấy từ localStorage
  const localToken = localStorage.getItem("auth_token");
  if (localToken) {
    // Nếu có trong localStorage nhưng không có trong cookie, khôi phục cookie
    console.log("[API] Restoring token from localStorage to cookie");
    Cookies.set("access_token", localToken, {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return localToken;
  }

  return null;
};

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    params,
    requiresAuth = true,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Lấy token từ nhiều nguồn
  const token = getAuthToken();

  console.log("[API] Request:", {
    endpoint,
    hasToken: !!token,
    tokenFirstChars: token ? token.substring(0, 10) + "..." : "none",
  });

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token && requiresAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...(customHeaders as Record<string, string>),
      },
      credentials: "include", // Include cookies in requests
    });

    console.log("[API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("[API] Unauthorized (401) response");
        // Handle unauthorized in a clean way
        // Clear token from all storages
        Cookies.remove("access_token", { path: "/" });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }

        // For SPA client-side navigation
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          console.log("[API] Redirecting to /login due to 401");
          window.location.href = "/login";
        }

        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      // Try to get error message from response
      let errorText = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorText;
      } catch (e) {
        // Ignore parse errors
      }
      throw new Error(errorText);
    }

    return response.json();
  } catch (error) {
    console.error("[API] Request failed:", error);
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
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.latest, {
      requiresAuth: false,
    }),

  getPriceHistory: () =>
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.history, {
      requiresAuth: false,
    }),

  getPricesByType: (type: string) =>
    fetchApi<GoldPrice[]>(API_CONFIG.endpoints.goldPrices.byType(type), {
      requiresAuth: false,
    }),
};

export interface Asset {
  id: string | number;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string | null;
    isGoogleUser: boolean;
  };
  type: string;
  amount: number;
  buyPrice: number;
  sellPrice: number | null;
  isSold: boolean;
  buyDate: string;
  sellDate: string | null;
  note: string;
}

// Interface for creating a new asset
export interface CreateAssetData {
  type: string;
  amount: number;
  buyPrice: number;
  note: string;
}

export const assetApi = {
  // Lấy danh sách tài sản
  getAssets: () => fetchApi<Asset[]>(API_CONFIG.endpoints.assets.list),

  // Thêm tài sản mới
  createAsset: (data: CreateAssetData) => {
    // Validate data before sending to API
    if (!data.type || data.amount <= 0) {
      return Promise.reject(
        new Error("Dữ liệu không hợp lệ. Kiểm tra lại loại vàng và số lượng.")
      );
    }

    // Ensure we're sending data in the correct format
    const assetData = {
      type: data.type,
      amount: Number(data.amount),
      buyPrice: Number(data.buyPrice),
      note: data.note || "",
    };

    console.log("[API] Creating asset with data:", assetData);

    return fetchApi<Asset>(API_CONFIG.endpoints.assets.create, {
      method: "POST",
      body: JSON.stringify(assetData),
    });
  },

  // Xóa tài sản
  deleteAsset: (id: string | number) =>
    fetchApi(API_CONFIG.endpoints.assets.delete(String(id)), {
      method: "DELETE",
    }),

  // Cập nhật tài sản
  updateAsset: (
    id: string | number,
    data: Partial<
      Pick<
        Asset,
        | "type"
        | "amount"
        | "buyPrice"
        | "sellPrice"
        | "isSold"
        | "sellDate"
        | "note"
      >
    >
  ) =>
    fetchApi<Asset>(API_CONFIG.endpoints.assets.update(String(id)), {
      method: "PUT",
      body: JSON.stringify(data),
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
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    }),

  logout: () => {
    // Chỉ xóa cookie, không chuyển hướng
    if (typeof window !== "undefined") {
      Cookies.remove("access_token");
    }
    return Promise.resolve();
  },

  getProfile: () => fetchApi(API_CONFIG.endpoints.auth.profile),

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
